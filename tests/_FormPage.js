import Page from './_Page.js';
import tmclasses from '@tobymackenzie/tmclasses.js/src/main.js';

export default tmclasses.create({
	parent: Page,
	props: {
		method: undefined,
		getTitle: function(){
			return this.method + ' Form';
		},
		getSubmittedFieldValue: function(field, message){
			if(this.method === 'GET'){
				return message.url.query[field] || '';
			}else{
				return message.getDatum(field) || '';
			}
		},
		getSubmittedData: function(message){
			if(this.method === 'GET'){
				return message.url.query;
			}else{
				return message.getData();
			}
		},
		hasSubmittedData: function(message){
			if(this.method === 'GET'){
				return Object.keys(message.url.query).length > 0;
			}else{
				return message.hasData();
			}
		},
		render: function(message){
			this.main =  `
			<h1>${this.getTitle()}</h1>
			`;
			if(this.hasSubmittedData(message)){
				this.main += `<p>Submitted: ${JSON.stringify(this.getSubmittedData(message))}</p>`;
			}
			this.main += `
			<form method="${this.method}">
				${this.renderField({
					'label': 'First Name',
					'name': 'firstName',
				}, message)}
				${this.renderField({
					'label': 'Last Name',
					'name': 'lastName',
				}, message)}
				${this.renderField({
					'label': 'Email',
					'name': 'email',
					'type': 'email',
				}, message)}
				<button type="submit">Submit</button>
			</form>
			<p>dynamically generated ${(new Date()).toISOString()}</p>
			`;
			return Page.prototype.render.apply(this, arguments);
		},
		renderField: function(opts, message){
			if(!opts){
				return '';
			}
			var name = typeof opts === 'string' ? opts : opts.name;
			var label = opts.label || name;
			var type = opts.type || 'text';
			return `
			<div>
				<label>
					<span>${label}</span>
					<input type="${type}" name="${name}" value="${this.getSubmittedFieldValue(name, message)}"/>
				</label>
			</div>
			`;
		},
	},
});
