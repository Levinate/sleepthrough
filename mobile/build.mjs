import fs from 'node:fs';
import {build} from 'esbuild';
fs.mkdirSync('www',{recursive:true});
for(const name of ['index.html','style.css'])fs.copyFileSync('src/'+name,'www/'+name);
fs.copyFileSync('../dist/lessons.js','www/lessons.js');
fs.copyFileSync('../dist/config.js','www/config.js');
await build({entryPoints:['src/main.js'],bundle:true,outfile:'www/main.js',minify:true,target:['chrome89'],legalComments:'linked'});
console.log('Android web assets built locally.');
