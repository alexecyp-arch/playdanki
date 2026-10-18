// Run with an installed esbuild (0.25+) and React 19 dependencies on NODE_PATH.
const path=require('node:path');
require('esbuild').buildSync({entryPoints:[path.join(__dirname,'../src/temponotes/ui-entry.tsx')],outfile:path.join(__dirname,'../src/temponotes/ui.bundle.js'),bundle:true,format:'esm',minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},nodePaths:process.env.NODE_PATH.split(path.delimiter),legalComments:'eof'});
