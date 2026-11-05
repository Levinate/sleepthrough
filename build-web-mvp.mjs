import fs from 'node:fs';
import {build} from 'esbuild';
await build({entryPoints:['web-src/mvp-web.js'],bundle:true,format:'iife',outfile:'dist/mvp-web.js',target:['chrome89'],minify:false});
function scope(css){let out='',i=0;while(i<css.length){const open=css.indexOf('{',i);if(open<0){out+=css.slice(i);break;}const head=css.slice(i,open).trim();let depth=1,end=open+1;while(depth&&end<css.length){if(css[end]==='{')depth++;if(css[end]==='}')depth--;end++;}const body=css.slice(open+1,end-1);if(head.startsWith('@media'))out+=head+'{'+scope(body)+'}';else if(head.startsWith('@'))out+=head+'{'+body+'}';else out+=head.split(',').map(sel=>{sel=sel.trim();if(sel===':root')return ':root';if(sel.startsWith('body'))return sel.replace(/^body/,'body.mvp-mode');return 'body.mvp-mode '+sel;}).join(',')+'{'+body+'}\n';i=end;}return out;}
fs.writeFileSync('dist/mvp-web.css',scope(fs.readFileSync('web-src/shared/mvp.css','utf8'))+fs.readFileSync('web-src/web-layout.css','utf8'));
console.log('Web funnel built.');
