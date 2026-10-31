const assert=require('node:assert/strict');
const {createServer}=require('node:http');
const {readFile,mkdir,mkdtemp,cp,writeFile,symlink}=require('node:fs/promises');
const {existsSync}=require('node:fs');
const {execFileSync}=require('node:child_process');
const {tmpdir}=require('node:os');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),shots=path.join(root,'test-results');
let browser,lastPage,count=0;
const pass=message=>{count++;console.log('PASS '+message);};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(dist,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(dist+path.sep))throw Error('Invalid path');
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)]||'application/octet-stream';
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);
  }catch{if(!res.headersSent)res.writeHead(404);res.end();}
});
(async()=>{
  const {default:data}=await import(pathToFileURL(path.join(root,'src/data/presentation.js')));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const errors=[],failed=[];
  function watch(page){page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failed.push(r.url()));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});}
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});lastPage=page;watch(page);
  await page.goto(url);await page.waitForSelector('.enhanced');
  assert.equal(await page.title(),'잎 표면 구조에 따른 미세먼지 흡착률 비교');
  assert.equal(await page.locator('h1').textContent(),data.title);
  assert.equal(await page.locator('.hero-researchers').textContent(),'정은우 · 유민수');
  assert.equal(await page.locator('main > section').count(),21);
  assert.deepEqual(await page.locator('tbody tr').evaluateAll(rows=>rows.map(r=>[...r.cells].map(c=>c.textContent))),[['고무나무','0.802','0.103'],['스킨답서스','0.666','0.134'],['스파티필름','1.234','0.068'],['램스이어','1.138','0.106']]);
  assert.deepEqual(await page.locator('.bar-label').evaluateAll(rows=>rows.map(r=>r.textContent)),['스파티필름41.1%','램스이어37.9%','고무나무26.7%','스킨답서스22.2%']);
  for(const phrase of ['0.5g','45분','테이프','OpenCV','실제 대기 중 미세먼지와 동일하지','초기 가설','전사 효율'])assert.ok((await page.locator('main').innerText()).includes(phrase),phrase);
  pass('Official title, researchers, 21 sections, original measurements/rates and scientific limitations');
  await mkdir(shots,{recursive:true});
  await page.waitForSelector('[data-key="cover"][data-ready="webgl"]',{timeout:30000});
  await page.waitForTimeout(700);
  await page.screenshot({path:path.join(shots,'redesign-cover-desktop.png')});
  assert.equal(await page.locator('canvas').count(),1);
  pass('Real WebGL hero and a single shared renderer');
  const ids=['top',...data.sections.map(s=>s.id)];
  async function at(id){
    await page.waitForFunction(i=>Number(document.querySelector('progress').value)===i,ids.indexOf(id)+1);
  }
  async function go(id){await page.locator('#'+id).evaluate(el=>el.scrollIntoView({behavior:'instant'}));await at(id);}
  await page.locator('[data-start]').click();await at('research');
  for(const nav of data.navigation){
    await go('research');await page.locator('.toc a[href="#'+nav.target+'"]').click();await at(nav.target);
    assert.equal(await page.locator('.toc a[href="#'+nav.target+'"]').getAttribute('aria-current'),'location');
  }
  await go('top');assert.ok(await page.locator('[data-prev]').isDisabled());
  for(const id of ids.slice(1)){await page.locator('[data-next]').click();await at(id);}
  assert.ok(await page.locator('[data-next]').isDisabled());
  await page.locator('[data-prev]').click();await at('future');
  await page.keyboard.press('ArrowLeft');await at('limits');
  await page.keyboard.press('ArrowRight');await at('future');
  await page.evaluate(()=>{const input=document.createElement('textarea');input.id='test-input';document.querySelector('#future .section-inner').prepend(input);input.focus({preventScroll:true});});
  await page.keyboard.press('ArrowRight');await at('future');await page.locator('#test-input').evaluate(el=>el.remove());
  await page.locator('[data-next]').focus();await page.keyboard.press('ArrowRight');await at('future');
  pass('Start, table of contents, all next transitions, previous, arrow keys and input/control guards');
  await page.locator('[data-fullscreen]').click();
  await page.waitForFunction(()=>document.fullscreenElement&&document.querySelector('[data-fullscreen]').getAttribute('aria-pressed')==='true');
  await page.locator('[data-fullscreen]').click();
  await page.waitForFunction(()=>!document.fullscreenElement&&document.querySelector('[data-fullscreen]').getAttribute('aria-pressed')==='false');
  pass('Actual fullscreen entry and exit');
  await go('surface');await page.waitForSelector('[data-key="surface"][data-ready="webgl"]');
  for(const kind of ['smooth','wax','hair']){
    await page.locator('[data-surface="'+kind+'"]').click();
    assert.equal(await page.locator('[data-key="surface"]').getAttribute('data-species'),'surface:'+kind);
    assert.equal(await page.locator('[data-surface="'+kind+'"]').getAttribute('aria-pressed'),'true');
    await page.waitForTimeout(180);
    await page.screenshot({path:path.join(shots,'surface-'+kind+'.png')});
  }
  await page.locator('[data-key="surface"] [data-zoom="in"]').click();
  assert.equal(await page.locator('[data-key="surface"]').getAttribute('data-zoom'),'1.15');
  const canvas=page.locator('canvas');const box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+60,box.y+box.height/2,{steps:5});await page.mouse.up();
  assert.ok(Number(await page.locator('[data-key="surface"]').getAttribute('data-rotation'))>.2);
  await canvas.focus();await page.keyboard.press('ArrowRight');await at('surface');
  pass('Three surface modes, zoom, drag rotation and canvas keyboard isolation');
  await go('plants');await page.waitForSelector('[data-key="plant"][data-ready="webgl"]');
  const images=[];
  for(const plant of data.plants){
    await page.locator('[data-plant="'+plant.id+'"]').click();
    assert.equal(await page.locator('[data-key="plant"]').getAttribute('data-species'),plant.model);
    assert.ok(await page.locator('[data-plant-info="'+plant.id+'"]').isVisible());
    await page.waitForTimeout(180);
    images.push(await page.locator('[data-key="plant"]').screenshot({path:path.join(shots,'plant-'+plant.id+'.png')}));
  }
  for(let i=1;i<images.length;i++)assert.notDeepEqual(images[0],images[i]);
  assert.equal(await page.locator('.photo-slot').count(),9);
  pass('All four species render distinctly and switch descriptions; nine real-photo slots');
  await go('rates');await page.waitForSelector('.rate-chart.chart-animate');
  const ratio=await page.locator('.chart-row').first().evaluate(row=>row.querySelector('.bar-fill').getBoundingClientRect().width/row.querySelector('.bar-track').getBoundingClientRect().width);
  assert.ok(Math.abs(ratio-.411)<.002);
  for(const id of ['rates','analysis','apparatus','measurements']){await go(id);await page.screenshot({path:path.join(shots,'redesign-'+id+'.png')});}
  for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:width<500?844:1000});await go('top');
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('h1,h2,.table-wrap,.rate-chart,.photo-slot,.presentation-controls,.plant-selector')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left< -1||r.right>innerWidth+1);}).map(el=>el.className));
    assert.deepEqual(overflow,[],String(width));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(width===390){await page.waitForTimeout(300);await page.screenshot({path:path.join(shots,'redesign-cover-mobile.png')});await go('surface');await page.screenshot({path:path.join(shots,'redesign-surface-mobile.png')});}
  }
  pass('Graph uses true 0–100 scale; desktop, tablet and 320/390px mobile have no horizontal overflow');
  const noJS=await browser.newPage({javaScriptEnabled:false,reducedMotion:'reduce',viewport:{width:390,height:844}});watch(noJS);
  await noJS.goto(url);
  assert.equal(await noJS.locator('main > section').count(),21);
  assert.ok(await noJS.locator('table').isVisible());
  assert.equal(await noJS.locator('[data-plant-info]:visible').count(),4);
  assert.equal(await noJS.locator('.surface-static figure:visible').count(),3);
  await noJS.close();
  pass('Pre-rendered text, measurements, all plant descriptions and surface fallbacks work without JavaScript');
  const fallback=await browser.newPage({viewport:{width:390,height:844}});
  await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:get.call(this,type,...args);};});
  watch(fallback);await fallback.goto(url);await fallback.waitForSelector('[data-ready="fallback"]');
  assert.ok(await fallback.locator('.model-fallback').first().isVisible());await fallback.locator('[data-start]').click();await fallback.waitForURL('**/#research');await fallback.close();
  pass('WebGL-unavailable devices retain illustrations and navigation');
  // Data-edit fixtures: no changes to the supplied research data are committed.
  const edited=structuredClone(data);
  edited.title='편집 확인 '+data.title;edited.researchers='편집 연구자';edited.plants[0].name='검증용 식물';edited.plants[0].rate=55.5;
  edited.sections[0].title='수정한 섹션 제목';edited.sections[0].paragraphs=['긴 설명 '.repeat(170)];
  edited.plants[0].description='식물 설명 수정 '.repeat(65);
  edited.photos.chamber.src='images/models/rubber.svg';
  edited.sections.push({id:'appendix',type:'story',tone:'white',title:'새로운 섹션',lead:'추가 확인',paragraphs:['새 내용을 입력합니다.']});
  const editPage=await browser.newPage({viewport:{width:320,height:844},reducedMotion:'reduce'});watch(editPage);
  await editPage.route('**/src/data/presentation.js',route=>route.fulfill({contentType:'text/javascript',body:'export default '+JSON.stringify(edited)}));
  await editPage.goto(url);await editPage.waitForSelector('.enhanced');
  assert.equal(await editPage.title(),edited.title);assert.equal(await editPage.locator('h1').textContent(),edited.title);
  assert.equal(await editPage.locator('.hero-researchers').textContent(),edited.researchers);
  assert.equal(await editPage.locator('#research h2').textContent(),edited.sections[0].title);
  assert.equal(await editPage.locator('.bar-label').first().textContent(),'검증용 식물55.5%');
  assert.equal(await editPage.locator('main > section').count(),22);
  await editPage.locator('[data-photo="chamber"]').scrollIntoViewIfNeeded();
  await editPage.waitForFunction(()=>document.querySelector('[data-photo="chamber"] img').naturalWidth>0);
  assert.equal(await editPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await editPage.close();
  // Exercise a real production build using only an edited data file in a temporary copy.
  const temp=await mkdtemp(path.join(tmpdir(),'botanical-edit-'));
  for(const file of ['index.html','package.json','src','scripts','styles','public'])await cp(path.join(root,file),path.join(temp,file),{recursive:true});
  await symlink(path.join(root,'node_modules'),path.join(temp,'node_modules'),'dir');
  await writeFile(path.join(temp,'src/data/presentation.js'),'export default '+JSON.stringify(edited));
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:temp});
  const rebuilt=await readFile(path.join(temp,'dist/index.html'),'utf8');
  assert.ok(rebuilt.includes('<title>'+edited.title+'</title>'));assert.ok(rebuilt.includes('55.5'));assert.ok(rebuilt.includes('새로운 섹션'));
  pass('Data-only edits update title, authors, text, plant name, chart, photos, new section and production HTML; long text fits 320px');
  const broken=await browser.newPage();
  const missing=structuredClone(data);missing.photos.chamber.src='images/photos/missing.jpg';
  await broken.route('**/src/data/presentation.js',route=>route.fulfill({contentType:'text/javascript',body:'export default '+JSON.stringify(missing)}));
  await broken.route('**/images/photos/missing.jpg',route=>route.fulfill({status:404,body:''}));
  await broken.goto(url);await broken.locator('[data-photo="chamber"]').scrollIntoViewIfNeeded();
  await broken.waitForFunction(()=>document.querySelector('[data-photo="chamber"] .photo-placeholder small').textContent.includes('불러오지'));
  assert.ok(await broken.locator('[data-photo="chamber"] .photo-placeholder').isVisible());await broken.close();
  pass('Deliberately invalid photo restores a guide; expected request failure isolated from normal checks');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  pass('Normal site has no browser console errors, uncaught errors or failed resource requests');
  console.log(count+' test groups passed. Screenshots: test-results/');
})().catch(async error=>{console.error(error);process.exitCode=1;if(lastPage&&!lastPage.isClosed()){await lastPage.screenshot({path:path.join(shots,'failure.png')});console.log(await lastPage.locator('[data-model]').evaluateAll(els=>els.map(el=>({mode:el.dataset.model,ready:el.dataset.ready,top:el.getBoundingClientRect().top,height:el.clientHeight}))));}}).finally(async()=>{await browser?.close();server.close();});
