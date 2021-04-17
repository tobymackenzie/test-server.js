import Server from './Server.js';
import tmclasses from '@tobymackenzie/tmclasses.js/src/main.js';
import yargs from 'yargs-parser';

var Command = tmclasses.create({
	props: {
		server: undefined,
		run: function(args){
			if(!args){
				args = process;
			}
			if(args === process){
				args = args.argv.slice(2);
			}
			args = yargs(args, {
				alias: {
					modulesPath: ['m', 'modules'],
					port: ['p'],
					verbosity: ['v'],
				},
				configuration: {
					'duplicate-arguments-array': false,
					'greedy-arrays': false,
					'strip-aliased': true,
					'strip-dashed': true,
				},
				count: [
					'verbosity',
				],
				string: [
					'_',
					'modulesPath',
					'page',
				],
			});
			if(args._ && args._.length === 1){
				args.webRoot = args._[0];
				delete args._;
			}else{
				throw 'A single web root must be specified';
			}
			// console.log(args);return;
			this.server = new Server(args);
			this.server.start();
			return this.server;
		},
	},
	statics: {
		run: function(args){
			var command = new Command();
			command.run(args);
			return command;
		}
	}
});

export default Command;
