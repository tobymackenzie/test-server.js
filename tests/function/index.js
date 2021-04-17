import Page from '../_Page.js';

var page = new Page({
	title: 'Function - Test Server',
});
export default function(message){
	page.main =  `
	<h1>Function</h1>
	<p>dynamically generated ${(new Date()).toISOString()}</p>
	`;
	message.response.writeHead(200, {
		'Content-Type': 'text/html'
	});
	message.response.write(page.render(message));
	message.response.end();
};
