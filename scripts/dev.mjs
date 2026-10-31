import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=resolve(root,'dist');
const port=Number(process.env.PORT||8000);
let lastBuild=0;
async function newest(path) {
  const info=await stat(path);
  if(!info.isDirectory())return info.mtimeMs;
  const children=await readdir(path);
  return Math.max(info.mtimeMs,...await Promise.all(children.map(p=>newest(resolve(path,p)))));
}
async function refresh() {
  const updated=Math.max(...await Promise.all(['src','styles','scripts/main.js','index.html','public'].map(p=>newest(resolve(root,p)))));
  if(updated>lastBuild){execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,stdio:'inherit'});lastBuild=Date.now();}
}
await refresh();
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
createServer(async(request,response)=>{
  try {
    const url=new URL(request.url,'http://localhost');
    if(url.pathname==='/'||url.pathname==='/index.html')await refresh();
    const file=resolve(dist,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(dist+'/')){response.writeHead(403);response.end();return;}
    const content=await readFile(file);
    response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});response.end(content);
  } catch(error){response.writeHead(error.code==='ENOENT'?404:500,{'Content-Type':'text/plain; charset=utf-8'});response.end(error.code==='ENOENT'?'파일을 찾을 수 없습니다.':error.message);}
}).listen(port,'127.0.0.1',()=>console.log(`Development server: port ${port}. Edit src/data/presentation.js and refresh.`));
