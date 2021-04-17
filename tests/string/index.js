export default `<!doctype html>
<html>
	<head>
		<title>String - Test Server</title>
		<link rel="stylesheet" href="/_styles.css" />
	</head>
	<body>
		<h1>String</h1>
		<p>statically generated ${(new Date()).toISOString()}</p>
		<a href="/">Home</a>
	</body>
</html>`;
