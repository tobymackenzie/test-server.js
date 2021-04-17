#!/usr/bin/env node
//-! currently done as a symlink because node doesn't support bin style executables using module type.  We can replace the symlink with the file when it does
import srv from '../src/Command.js';
const __filename = import.meta.url.replace(/^file:[\/]+/, '/');
const __dirname = __filename.split('/').slice(0, -1).join('/');
srv.run(['-vvv', __dirname + '/../tests', '--page', __dirname + '/_Page.js']);
