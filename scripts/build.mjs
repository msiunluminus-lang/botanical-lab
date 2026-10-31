import { cp, mkdir, readFile, writeFile, access, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import data from '../src/data/presentation.js';
import { render, escapeHTML, validateData } from '../src/render.js';
import { plantSVG, surfaceSVG } from '../src/visuals.js';

const root=fileURLToPath(new URL('../',import.meta.url));
validateData(data);
const template=await readFile(join(root,'index.html'),'utf8');
const html=template.replaceAll('{{TITLE}}',escapeHTML(data.title))
  .replaceAll('{{DESCRIPTION}}',escapeHTML(`${data.title} — ${data.researchers}. ${data.description}`))
  .replace('<!--APP-->',render(data));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw Error('Duplicate rendered HTML id.');
for(const [,target] of html.matchAll(/href="#([^"]+)"/g))if(!ids.includes(target))throw Error(`Broken internal link: ${target}`);
const destination=join(root,'dist');
// Only generated distribution files are cleared; all editable sources live outside dist.
await rm(destination,{recursive:true,force:true});
await mkdir(destination,{recursive:true});
for(const dir of ['src','styles'])await cp(join(root,dir),join(destination,dir),{recursive:true});
await cp(join(root,'public'),destination,{recursive:true});
await mkdir(join(destination,'scripts'),{recursive:true});
await cp(join(root,'scripts/main.js'),join(destination,'scripts/main.js'));
await mkdir(join(destination,'vendor'),{recursive:true});
for(const file of ['three.module.min.js','three.core.min.js'])await cp(join(root,'node_modules/three/build',file),join(destination,'vendor',file));
await cp(join(root,'node_modules/three/LICENSE'),join(destination,'vendor/THREE-LICENSE.txt'));
await mkdir(join(destination,'images/models'),{recursive:true});
for(const kind of ['rubber','pothos','peace','lambs'])await writeFile(join(destination,`images/models/${kind}.svg`),plantSVG(kind,kind));
for(const kind of ['smooth','wax','hair'])await writeFile(join(destination,`images/models/${kind}.svg`),surfaceSVG(kind,kind));
await writeFile(join(destination,'index.html'),html);
for(const [,path] of html.matchAll(/<(?:img|script|link)\b[^>]*?\s(?:src|href)="((?:images|styles|scripts)\/[^"#]+)"/g)){
  try {await access(join(destination,path));}
  catch(error){if(path.startsWith('images/photos/'))console.warn(`Photo not found (fallback will display): ${path}`);else throw error;}
}
console.log(`Built ${data.sections.length+1} sections and ${data.plants.length} species to dist/. All text, tables and vector fallbacks are pre-rendered; Three.js is local.`);
