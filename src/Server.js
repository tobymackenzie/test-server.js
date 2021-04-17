import {execSync} from 'child_process';
import fs from 'fs';
import http from 'http';
import Message from './Message.js';
import Page from './Page.js';
import tmclasses from '@tobymackenzie/tmclasses.js/src/main.js';

var BaseClass = tmclasses.BaseClass;
var Server = tmclasses.create({
	init: function(){
		BaseClass.prototype.init.apply(this, arguments);
		if(!this.mimeTypes){
			this.mimeTypes = Server.mimeTypes;
		}
	},
	props: {
		//--map of file extensions to mime types, for serving files. will use the `Server.mimeTypes` map by default
		mimeTypes: undefined,
		//--Page object to use for 404 and other errors.  Can be a `Page` constructor or instance
		page: undefined,
		//--port to bind to. will try 8080 and move upward until an available port is found
		port: undefined,
		//--node modules path relative to `webRoot`
		modulesPath: '/node_modules',
		//--whether to output extra info on the console. integer, with three being the most verbose
		verbosity: 0,
		//--root file path to serve files from
		webRoot: '.',

		getPage: function(opts){
			if(!this.page){
				this.page = Page;
			}
			if(opts){
				if(typeof this.page === 'function'){
					return new this.page(opts);
				}else{
					this.page.set(opts);
				}
			}
			return this.page;
		},

		/*=====
		==server
		=====*/
		start: function(){
			if(!this.port){
				this.port = 8080;
				var found = false;
				while(!found){
					var foundCount = parseInt(execSync(`netstat -anp tcp | grep '\\.${this.port}\\s' | wc -l`).toString().trim());
					if(foundCount === 0){
						found = true;
					}else{
						++this.port;
					}
				}
			}
			var create = ()=> {
				if(this.verbosity){
					console.log(`starting test server at http://localhost:${this.port}`);
				}else{
					console.log(this.port);
				}
				http.createServer(this.handleRequest.bind(this)).listen(this.port);
			};
			if(typeof this.page === 'string'){
				import(this.page).then((mod)=> {
					if(this.verbosity > 2){
						console.log(`  imported page ${this.page}`);
					}
					this.page = mod.default;
					create();
				});
			}else{
				create();
			}
		},
		handleRequest: function(request, response){
			var message = new Message({
				request: request,
				response: response,
			});
			var handleRequestEnd = ()=> {
				if(this.verbosity){
					console.log('handleRequest: ', message.getUrl().path);
				}
				try{
					var stats = fs.statSync(this.webRoot + message.getPathname());
					if(stats.isDirectory()){
						if(this.verbosity > 2){
							console.log('  isDirectory');
						}
						this.sendPage(message);
					}else{
						if(this.verbosity > 2){
							console.log('  not directory');
						}
						this.sendFile(message);
					}
				}catch(e){
					//--only show error if it isn't simply no such file
					if(this.verbosity > 2 && e.errno !== -2){
						console.log('  handleRequest error ', e);
					}
					this.send404(message);
				}
			};
			//-# apparently, GET requests don't "end"
			switch(request.method){
				case 'POST':
				case 'UPDATE':
					request.on('end', handleRequestEnd);
				break;
				default:
					handleRequestEnd();
				break;
			}
		},
		send404: function(message){
			return this.sendError(message, 404);
		},
		sendError: function(message, error){
			if(this.verbosity > 0){
				console.log('  sendError ', error);
			}
			var heading;
			var body;
			if(typeof error === 'number'){
				message.code = error;
				switch(error){
					case 404:
						heading = '404 Not found';
						body = `File ${message.getUrl().path} not found`;
					break;
				}
			}else{
				message.code = 500;
				heading = 'Error';
				body = error.toString();
			}
			message.content = this.getPage({
				main: `<h1>${heading}</h1> ${body}`,
				title: heading,
			});
			return this.sendMessage(message);
		},
		sendFile: function(message){
			if(this.verbosity > 1){
				console.log('  sendFile ' + message.getUrl().path);
			}
			var mimeType = this.getMimeType(message.getUrl().path);
			if(mimeType){
				fs.readFile(this.webRoot + message.getPathname(), (error, contents)=> {
					if(error){
						this.sendError(message, error);
					}else{
						if(mimeType === 'application/javascript'){
							contents = contents.toString();
							contents = this.rewriteModulePaths(contents);
						}
						message.setHeader('Content-Type', mimeType);
						message.content = contents;
						this.sendMessage(message);
					}
				});
			}else{
				this.sendError(message, 'File of unknown type');
			}
		},
		sendMessage: function(message){
			var content = message.content;
			if(typeof content === 'function'){
				if(this.verbosity > 2){
					console.log('  content is function, running');
				}
				content = content(message);
			}
			if(typeof content === 'object'){
				if(this.verbosity > 2){
					console.log('  content is object');
				}
				if(content.getCode){
					message.code = content.getCode();
					if(this.verbosity > 2){
						console.log('  content has code ' + message.code);
					}
				}
				if(content.getHeaders){
					message.headers = content.getHeaders();
					if(this.verbosity > 2){
						console.log('  content has headers');
					}
				}
				if(content.render){
					if(this.verbosity > 2){
						console.log('  content.render()');
					}
					content = content.render(message);
				}else if(content.toString){
					if(this.verbosity > 2){
						console.log('  content.toString()');
					}
					content = content.toString();
				}
			}
			if(content === false){
				return this.send404(message);
			}else if(!message.response.writableEnded){
				message.response.writeHead(message.code, message.getHeaders());
				//--if not ended, assume we have to handle some stuff
				//--if the function returned a string, we shall assume it needs to be sent
				if(typeof content === 'string'){
					message.response.write(content);
				}
				//--assume we must end. if there is a promise, end once the promise resolves. otherwise, do so immediately
				if(content instanceof Promise){
					if(this.verbosity > 2){
						console.log('  content is promise');
					}
					content.then((content)=> {
						if(typeof content === 'string'){
							message.response.write(content);
						}
						message.response.end();
					});
				}else{
					message.response.end();
				}
			}
		},
		sendPage: function(message){
			if(this.verbosity > 1){
				console.log('  sendPage ' + message.getUrl().path);
			}
			var filePath = message.getPathname();
			if(filePath.slice(-1) !== '/'){
				filePath += '/';
			}
			filePath = this.webRoot + filePath + 'index.js';
			try{
				var stats = fs.statSync(filePath);
				var found = false;
				if(this.verbosity > 2){
					console.log('  index.js is file');
				}

				/*--process file

				File must be an es module with a `default` module.  Export can be one of:
				- a function, passed `message`.  can either handle writing to the response itself and return `undefined`, or return one of the other export options, to be handled as they would
				- a string, which will be written to the response as is
				- `false`, which will cause a 404 to be sent
				- an object with a `render(message)` method. the result will be written to the response
				- an object with a `toString()` method. the result will be written to the response

				See `sendMessage()` for implementation
				*/
				import(filePath).then((mod)=> {
					message.content = mod.default;
					this.sendMessage(message);
				}).catch((e)=> {
					if(this.verbosity > 2){
						console.log('  failed to import index.js', e);
					}
					this.send404(message);
				});
			}catch(e){
				filePath = filePath.replace(/\.js$/, '.html');
				try{
					stats = fs.statSync(filePath);
					if(this.verbosity > 2){
						console.log('  index.html is file');
					}
					fs.readFile(filePath, (error, contents)=> {
						if(error){
							if(this.verbosity > 2){
								console.log('  error reading file', error);
							}
							this.sendError(message, error);
						}else{
							if(this.verbosity > 2){
								console.log('  success reading file');
							}
							message.content = contents;
							this.sendMessage(message);
						}
					});
				}catch(e){
					if(this.verbosity > 2){
						console.log('  no index fle found');
					}
					this.send404(message);
				}
			}
		},

		/*=====
		==helpers
		=====*/
		getMimeType: function(string){
			var extension;
			if(string.indexOf('.') !== false){
				extension = string.split('/').pop().split('.').pop();
			}else if(string.indexOf('/') !== false){
				extension = '';
			}else{
				extension = string;
			}
			return this.mimeTypes[extension] || null;
		},
		rewriteModulePaths: function(string){
			string = string.replace(/(import .* from [\'"])([\w@])/, '$1' + this.modulesPath + '/$2');
			string = string.replace(/(import [\'"])([\w@])/, '$1' + this.modulesPath + '/$2');
			return string;
		},
	},
	statics: {
		mimeTypes: {
			'css': 'text/css',
			'html': 'text/html',
			'js': 'application/javascript',
			'json': 'application/json',
			'mjs': 'application/javascript',
			'txt': 'text/plain',
		},
	}
});
export default Server;
