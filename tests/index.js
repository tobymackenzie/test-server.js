import Page from './_Page.js';

export default new Page({
	getMain: function(){
		return `
			<h1>Home</h1>
			<p>dynamically generated ${(new Date()).toISOString()}</p>
		`;
	},
});
