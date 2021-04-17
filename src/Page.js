import tmclasses from '@tobymackenzie/tmclasses.js/src/main.js';

export default tmclasses.create({
	props: {
		attr: undefined,
		foot: undefined,
		footer: undefined,
		head: undefined,
		header: undefined,
		id: undefined,
		main: undefined,
		title: undefined,
		titleBase: undefined,
		titleDivider: ' - ',

		getAttr: function(){
			var value = this.attr;
			if(this.id){
				value = `id="${this.id}"`;
			}
			return value || '';
		},
		getFoot: function(){
			return this.foot || '';
		},
		getFooter: function(){
			return this.footer || '';
		},
		getHead: function(){
			return this.head || '';
		},
		getHeader: function(){
			return this.header || '';
		},
		getId: function(){
			return this.id || '';
		},
		getMain: function(){
			return this.main || '';
		},
		getTitle: function(){
			var value = [];
			if(this.title){
				value.push(this.title);
			}
			if(this.getTitleBase()){
				value.push(this.getTitleBase());
			}
			return value.join(this.getTitleDivider());
		},
		getTitleBase: function(){
			return this.titleBase || '';
		},
		getTitleDivider: function(){
			return this.titleDivider || '';
		},

		render: function(message){
			return `<!doctype html>
				<html ${this.getAttr()}>
					<head>
						<title>${this.getTitle()}</title>
						${this.getHead()}
					</head>
					<body>
						${this.getHeader()}
						${this.getMain()}
						${this.getFooter()}
						${this.getFoot()}
					</body>
				</html>
			`;
		},
	},
});
