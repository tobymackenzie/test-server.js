import Page from '../src/Page.js';
import tmclasses from '@tobymackenzie/tmclasses.js/src/main.js';

export default tmclasses.create({
	parent: Page,
	props: {
		attr: `lang="en"`,
		foot: `<script src="/_scripts.js" type="module"></script>`,
		footer: `</main>`,
		head: `<link rel="stylesheet" href="/_styles.css" />`,
		header: `
			<header>
				<a href="/">&lt;toby&gt;</a>
				<nav>
					<a href="/false">False</a>
					<a href="/function">Function</a>
					<a href="/html">HTML</a>
					<a href="/string">String</a>
				</nav>
			</header>
			<main>
		`,
		titleBase: `Test Server`
	},
});
