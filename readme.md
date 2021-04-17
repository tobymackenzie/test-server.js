Test-server.js
==============

A simple js test server that serves a directory and rewrites any npm module paths to work in the browser.  Not meant to be used in production.  Somewhat new, so the interfaces may still be in flux.

Usage
-----

Run the server like `bin/srv webroot-path` where `webroot-path` is a folder with the files you want to serve.  It will look for an available port starting at `8080`, and output the port number it uses.  Assuming all goes well, you can then visit `http://localhost:8080` or whatever port it gives you.

For any requests that match a directory in the webroot, it will look for an `index.js` or `index.html` file in that folder, and serve those if found.  The `.js` indexes will be imported as an ES module:  See `src/Server.js` comments to learn how this works, or look in the `tests` directory, but the particulars may change.

If the request is for a path that matches a file in the webroot, and the file is of a known type, it will just serve that file directly.

If the file is of an unknown type or doesn't match a path in the webroot, a 404 will be served.  Any JS errors will return a 500 error.

To Do
-----

I'd like to:

- improve the getter / setter interface of the classes
- return promises where applicable
- possibly do pubsub
- possibly make use of [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) for the `Page` class to make it easier to work with
- possibly move away from bare `http` module interface to provide our own
- support more mime types
- support more error types
- allow returning integers from imported index files to cause a given error type
- support redirects
- actual tests
