import tmclasses from '@tobymackenzie/tmclasses.js/src/main.js';
import QS from 'querystring';
import Url from 'url';

export default tmclasses.create({
	props: {
		code: 200,
		data: '',
		content: undefined,
		headers: undefined,
		request: undefined,
		response: undefined,
		url: undefined,

		getData: function(){
			if(!this.data){
				this.data = {};
			}else if(typeof this.data === 'string'){
				this.data = QS.parse(this.data);
			}
			return this.data;
		},
		hasData: function(){
			return Object.keys(this.getData()).length > 0;
		},
		getDatum: function(key){
			return this.getData()[key] || undefined;
		},
		getHeader: function(name){
			return this.getHeaders()[name] || undefined;
		},
		setHeader: function(name, value){
			this.getHeaders()[name] = value;
		},
		getHeaders: function(){
			if(!this.headers){
				this.headers = {
					'Content-Type': 'text/html'
				};
			}
			return this.headers;
		},
		getPathname: function(){
			var url = this.getUrl();
			if(url){
				return url.pathname;
			}else{
				return undefined;
			}
		},
		getUrl: function(){
			if(!this.url && this.request){
				this.url = Url.parse(this.request.url, true);
			}
			return this.url;
		},
	}
});
