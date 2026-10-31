import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
async function check(dir) {
  for(const file of await readdir(dir,{withFileTypes:true})) {
    const path=`${dir}/${file.name}`;
    if(file.isDirectory())await check(path);
    else if(/\.(?:js|mjs|cjs)$/.test(path))execFileSync(process.execPath,['--check',path],{stdio:'inherit'});
  }
}
for(const dir of ['src','scripts','tests'])await check(dir);
console.log('All JavaScript syntax checks passed.');
