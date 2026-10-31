import * as THREE from '../vendor/three.module.min.js';

// One shared WebGL renderer: only the most visible exhibit renders at any time.
const palette = { rubber: 0x719574, pothos: 0x8dac72, peace: 0x719c88, lambs: 0xb7c9ad };
const pots = { rubber: 0xf0ddd0, pothos: 0xf1e5c8, peace: 0xd5e5ef, lambs: 0xe2d8ed };
const V = (x,y,z) => new THREE.Vector3(x,y,z);
const material = (color, roughness=.65) => new THREE.MeshStandardMaterial({ color, roughness, metalness:0 });
function mesh(geometry, mat) {
  const result = new THREE.Mesh(geometry,mat);
  result.castShadow=true; result.receiveShadow=true;
  return result;
}
function tube(points,radius,mat,segments=22) {
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),segments,radius,6,false),mat);
}
function leafPoint(kind, length, t, u) {
  let half = { rubber:.31, pothos:.37, peace:.155, lambs:.22 }[kind] * length;
  let w = Math.pow(Math.sin(Math.PI*t), kind === 'pothos' ? .58 : .75);
  if(kind==='pothos') w *= 1 + .48*Math.exp(-(((t-.2)/.19)**2));
  const notch = kind==='pothos' ? .32*length*Math.sin(Math.PI*Math.abs(u)/2)*Math.exp(-t*5) : 0;
  const y = t*length-notch;
  const bend = kind==='peace' ? .48 : kind==='pothos' ? .25 : .18;
  const z = length*(.12*Math.sin(Math.PI*t)-bend*t*t-.08*u*u*Math.sin(Math.PI*t));
  return V(u*half*w,y,z);
}
function leaf(kind,length,seed=1,detail=1) {
  const group=new THREE.Group();
  const positions=[],uv=[],indices=[];
  const rows=24, cols=12;
  for(let y=0;y<=rows;y++) for(let x=0;x<=cols;x++) {
    const p=leafPoint(kind,length,y/rows,x/cols*2-1);
    positions.push(p.x,p.y,p.z); uv.push(x/cols,y/rows);
  }
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
    const a=y*(cols+1)+x,b=a+1,c=a+cols+1,d=c+1;
    indices.push(a,b,c,b,d,c);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const mat=new THREE.MeshPhysicalMaterial({color:palette[kind],roughness:kind==='rubber'?.3:kind==='lambs'?.98:.53,metalness:0,side:THREE.DoubleSide,clearcoat:kind==='rubber'?.7:kind==='peace'?.24:0,clearcoatRoughness:.3});
  // Close the leaf with a second surface and a rim, so it retains volume when rotated.
  const vertexCount=positions.length/3;
  const thickness=length*(kind==='rubber'?.024:.009);
  for(let i=0;i<vertexCount;i++)positions.push(positions[i*3],positions[i*3+1],positions[i*3+2]-thickness);
  const back=mesh(geometry.clone().translate(0,0,-thickness),mat);
  back.receiveShadow=false;group.add(back);
  const rimIndices=[];
  const rim=[];
  for(let x=0;x<=cols;x++)rim.push(x);
  for(let y=1;y<=rows;y++)rim.push(y*(cols+1)+cols);
  for(let x=cols-1;x>=0;x--)rim.push(rows*(cols+1)+x);
  for(let y=rows-1;y>0;y--)rim.push(y*(cols+1));
  for(let i=0;i<rim.length;i++){const a=rim[i],b=rim[(i+1)%rim.length];rimIndices.push(a,a+vertexCount,b,b,a+vertexCount,b+vertexCount);}
  const rimGeometry=new THREE.BufferGeometry();
  rimGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  rimGeometry.setIndex(rimIndices);rimGeometry.computeVertexNormals();
  const edge=mesh(rimGeometry,mat);edge.receiveShadow=false;group.add(edge);
  const blade=mesh(geometry,mat);
  blade.receiveShadow=false; // Thin leaves should not shadow their own vein geometry.
  group.add(blade);
  const veinMat=material(kind==='lambs'?0xd1ddc4:0xb3c698);
  const mid = Array.from({length:15},(_,i)=>leafPoint(kind,length,.02+i/15*.95,0).add(V(0,0,.007)));
  const midrib=tube(mid,length*.008,veinMat);midrib.castShadow=false;midrib.receiveShadow=false;group.add(midrib);
  if(kind!=='lambs') {
    for(let i=2;i<9;i++) for(const side of [-1,1]) {
      const t=i/11;
      const points=[leafPoint(kind,length,t,0),leafPoint(kind,length,t+.045,side*.45),leafPoint(kind,length,Math.min(.97,t+.11),side*.9)].map(p=>p.add(V(0,0,.006)));
      const vein=tube(points,length*.0025,veinMat,10);vein.castShadow=false;vein.receiveShadow=false;group.add(vein);
    }
  } else {
    // Each instanced tapered cylinder is an actual short fibre, not a point texture.
    const count=Math.round(680*detail);
    const fur=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0008,.0025,.044,4,1),material(0xe1e8d0,.98),count);
    const dummy=new THREE.Object3D();
    for(let i=0;i<count;i++) {
      const t=.025+fract(Math.sin(i*19.17+seed)*43758.54)*.95;
      const u=(fract(Math.sin(i*11.93+seed*2)*17293.2)*2-1)*.98;
      dummy.position.copy(leafPoint(kind,length,t,u)).add(V(0,0,.018));
      dummy.rotation.set(Math.PI/2+(fract(i*.31)-.5)*.8,(fract(i*.17)-.5)*.65,0);
      dummy.scale.setScalar(.7+fract(i*.79)*.65); dummy.updateMatrix(); fur.setMatrixAt(i,dummy.matrix);
    }
    fur.instanceMatrix.needsUpdate=true; group.add(fur);
  }
  return group;
}
function fract(n){return n-Math.floor(n);}
function planter(kind) {
  const group=new THREE.Group();
  const points=[[.35,0],[.47,.06],[.52,.16],[.55,.43],[.57,.63],[.55,.68],[.51,.69],[.49,.64],[.47,.13]].map(([x,y])=>new THREE.Vector2(x,y));
  group.add(mesh(new THREE.LatheGeometry(points,40),material(pots[kind],.8)));
  const soil=mesh(new THREE.CylinderGeometry(.49,.49,.025,32),material(0x918675,1));soil.position.y=.61;group.add(soil);
  const saucer=mesh(new THREE.CylinderGeometry(.6,.59,.06,40),material(pots[kind],.85));saucer.position.y=.015;group.add(saucer);
  return group;
}
function plant(kind, detail=1) {
  const group=planter(kind); const stemMat=material(0x839776,.7);
  if(kind==='rubber') {
    group.add(tube([V(0,.6,0),V(.04,1.4,0),V(-.02,2.2,0),V(.05,2.85,0)],.035,stemMat));
    for(let i=0;i<7;i++) {
      const h=.9+i*.26,angle=i*2.42;
      const p=V(Math.cos(angle)*.14,h+.08,Math.sin(angle)*.14);
      group.add(tube([V(0,h,0),p],.018,stemMat,8));
      const l=leaf(kind,.85+(i%3)*.09,i,detail); l.position.copy(p);
      l.rotation.set(.55+Math.sin(angle)*.22,angle,-.9); group.add(l);
    }
  } else if(kind==='pothos') {
    for(let vine=0;vine<3;vine++) {
      const az=vine*2.1;
      const points=Array.from({length:12},(_,i)=>{const t=i/11;return V(Math.cos(az)*t*.95,.66+Math.sin(t*Math.PI)*.9-t*.35,Math.sin(az)*t*.8);});
      group.add(tube(points,.022,stemMat));
      for(let j=1;j<6;j++) {
        const p=points[j*2-1].clone(),q=p.clone().add(V((j%2?.1:-.1),.1,.05));
        group.add(tube([p,q],.012,stemMat,6));
        const l=leaf(kind,.55+(j%3)*.12,j,detail);l.position.copy(q);l.rotation.set(.4+vine*.2,az+(j%2?.7:-.7),j%2?1.25:-1.15);group.add(l);
      }
    }
  } else {
    const count=kind==='peace'?9:8;
    for(let i=0;i<count;i++) {
      const angle=i*2.4,spread=kind==='peace'?.28:.35;
      const p=V(Math.cos(angle)*spread,.72+(i%3)*.08,Math.sin(angle)*spread);
      const base=V(Math.cos(angle)*.05,.6,Math.sin(angle)*.05);
      group.add(tube([base,p],.018,stemMat,8));
      const l=leaf(kind,kind==='peace'?1.35+(i%3)*.22:.95+(i%3)*.17,i,detail);
      l.position.copy(p); l.rotation.set(.12+(i%3)*.12,angle,-(.25+(i%4)*.16));group.add(l);
    }
  }
  group.userData.species=kind; return group;
}
function surface(kind,detail) {
  const group=new THREE.Group();
  const base=mesh(new THREE.CylinderGeometry(1.7,1.7,.13,64),material(kind==='wax'?0x91b197:0xb5cda2,kind==='wax'?.19:.8));
  base.scale.z=.7;base.position.y=.2;group.add(base);
  if(kind==='wax') {
    const film=mesh(new THREE.CylinderGeometry(1.695,1.695,.035,64),new THREE.MeshPhysicalMaterial({color:0xc7d9b0,roughness:.12,transparent:true,opacity:.6,clearcoat:1,metalness:0}));
    film.position.y=.285;film.scale.z=.7;group.add(film);
  }
  if(kind==='hair') {
    const count=Math.round(1900*detail),dummy=new THREE.Object3D();
    const fur=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0015,.006,.18,4),material(0xe2e9cf,.95),count);
    for(let i=0;i<count;i++) {
      const r=Math.sqrt(fract(Math.sin(i*4.83)*12937)) * 1.64, a=i*2.399;
      dummy.position.set(Math.cos(a)*r,.35,Math.sin(a)*r*.7);dummy.rotation.set(Math.sin(i)*.25,0,Math.cos(i)*.3);dummy.scale.set(1,.5+fract(i*.61),1);dummy.updateMatrix();fur.setMatrixAt(i,dummy.matrix);
    }
    group.add(fur);
  }
  const dustMat=material(0x6b7164,1);
  for(let i=0;i<12;i++) {
    const r=.2+fract(i*.31)*1.1,a=i*2.4;
    const grain=mesh(new THREE.IcosahedronGeometry(.055+(i%3)*.025,1),dustMat);
    grain.position.set(Math.cos(a)*r,kind==='hair'?.4:.35,Math.sin(a)*r*.7); group.add(grain);
  }
  return group;
}
function disposeGroup(group) {
  const mats=new Set();
  group.traverse(o=>{o.geometry?.dispose();if(o.material) for(const m of [o.material].flat()) mats.add(m);});
  mats.forEach(m=>m.dispose());
}

export function initModels() {
  const hosts=[...document.querySelectorAll('[data-model]')];
  if(!hosts.length) return;
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
  if(!context) { hosts.forEach(h=>{h.dataset.ready='fallback';h.querySelector('.model-state').textContent='설명용 일러스트 · 3D 미지원 환경';}); return; }
  const mobile=matchMedia('(max-width: 760px)'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile.matches?1:1.5));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','3D 모형. 드래그 또는 좌우 방향키로 회전, 더하기·빼기 키로 확대·축소');
  canvas.className='model-canvas';
  const scene=new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff,0xc5c1af,1.8));
  const sun=new THREE.DirectionalLight(0xfff7ec,2.7);sun.position.set(-3,7,5);sun.castShadow=true;
  sun.shadow.mapSize.set(mobile.matches?512:1024,mobile.matches?512:1024);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.normalBias=.03;sun.shadow.bias=-.0003;scene.add(sun);
  const rim=new THREE.DirectionalLight(0xeaf6ff,1.2);rim.position.set(4,4,-3);scene.add(rim);
  const floor=mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.castShadow=false;scene.add(floor);
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);
  let host=null,group=null,raf=0,last=0,zoom=1,yaw=0,pitch=0,dirty=true,contextLost=false;
  let baseDistance=6.2,target=V(0,1.2,0),mode='';
  const visible=new Map();
  function resize(){if(!host)return;const b=host.getBoundingClientRect();renderer.setSize(b.width,b.height,false);camera.aspect=b.width/Math.max(b.height,1);camera.updateProjectionMatrix();dirty=true;start();}
  const sizeObserver=new ResizeObserver(resize);
  function switchModel(nextHost) {
    if(host===nextHost && mode===host?.dataset.model) return;
    if(host){host.classList.remove('is-live');host.querySelector('.viewer-actions')?.setAttribute('hidden','');sizeObserver.unobserve(host);}
    if(group){scene.remove(group);disposeGroup(group);group=null;}
    host=nextHost;mode=host?.dataset.model||'';
    if(!host){cancelAnimationFrame(raf);raf=0;canvas.remove();return;}
    zoom=1;yaw=0;pitch=0;host.dataset.zoom='1.00';host.dataset.rotation='0.000';
    const detail=mobile.matches?.48:1;
    if(mode==='garden') {
      group=new THREE.Group();
      [['rubber',-1.65,0,.92],['peace',.05,-.72,1.04],['pothos',1.6,.3,.93],['lambs',-.1,1.1,.74]].forEach(([kind,x,z,scale])=>{const p=plant(kind,detail);p.position.set(x,0,z);p.scale.setScalar(scale);group.add(p);});
      baseDistance=10;target=V(0,1.25,0);
    }else if(mode.startsWith('surface:')) {group=surface(mode.split(':')[1],detail);baseDistance=6.4;target=V(0,.12,0);}
    else {group=plant(mode,detail);baseDistance=mode==='rubber'?7.4:6.3;target=V(0,1.4,0);}
    scene.add(group);host.querySelector('.canvas-mount').append(canvas);host.classList.add('is-live');host.dataset.ready='webgl';host.dataset.species=mode;
    host.querySelector('.viewer-actions')?.removeAttribute('hidden');host.querySelector('.model-state').textContent='설명용 3D · 드래그하여 회전';
    sizeObserver.observe(host);resize();
  }
  function choose() { const candidates=[...visible].filter(([,v])=>v>.1).sort((a,b)=>b[1]-a[1]);switchModel(candidates[0]?.[0]||null); }
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>visible.set(entry.target,entry.intersectionRatio));choose();},{threshold:[0,.1,.25,.5,.75,1]});
  hosts.forEach(h=>observer.observe(h));
  function frame(time) {
    raf=0;if(!host||document.hidden||contextLost)return;
    const animate=!mobile.matches&&!reduced.matches;
    if(dirty||(animate&&time-last>33)) {
      const auto=animate?Math.sin(time*.00028)*.045:0;
      group.rotation.y=yaw+auto;
      const distance=baseDistance/zoom*(camera.aspect<.9?1.15:1);
      camera.position.set(Math.sin(.05)*distance,target.y+distance*(mode.startsWith('surface')?.68:.32)+pitch,distance*.95);camera.lookAt(target);renderer.render(scene,camera);dirty=false;last=time;
    }
    if(animate)raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf&&host&&!contextLost)raf=requestAnimationFrame(frame);}
  function adjustZoom(amount){zoom=THREE.MathUtils.clamp(zoom+amount,.7,1.8);if(host)host.dataset.zoom=zoom.toFixed(2);dirty=true;start();}
  hosts.forEach(h=>{
    h.addEventListener('modelchange',()=>{if(host===h)switchModel(h);});
    h.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{if(host!==h)switchModel(h);adjustZoom(b.dataset.zoom==='in'?.15:-.15);}));
    h.querySelector('[data-reset]')?.addEventListener('click',()=>{yaw=0;pitch=0;zoom=1;h.dataset.zoom='1.00';h.dataset.rotation='0.000';dirty=true;start();});
  });
  let drag=null;
  canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,yaw,pitch};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag)return;yaw=drag.yaw+(event.clientX-drag.x)*.01;pitch=THREE.MathUtils.clamp(drag.pitch+(event.clientY-drag.y)*.007,-1,1);host.dataset.rotation=yaw.toFixed(3);dirty=true;start();});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{drag=null;});
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    if(event.key==='+'||event.key==='=')adjustZoom(.15);else if(event.key==='-')adjustZoom(-.15);else {yaw+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;pitch=THREE.MathUtils.clamp(pitch+(event.key==='ArrowUp'?.1:event.key==='ArrowDown'?-.1:0),-1,1);host.dataset.rotation=yaw.toFixed(3);dirty=true;start();}
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=0;host?.classList.remove('is-live');if(host){host.dataset.ready='fallback';host.querySelector('.model-state').textContent='설명용 일러스트 · 그래픽 연결이 중단되었습니다';}});
  canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;host?.classList.add('is-live');if(host)host.dataset.ready='webgl';dirty=true;start();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{dirty=true;start();}});
  reduced.addEventListener('change',()=>{dirty=true;start();});
  mobile.addEventListener('change',()=>{renderer.setPixelRatio(Math.min(devicePixelRatio,mobile.matches?1:1.5));sun.shadow.mapSize.set(mobile.matches?512:1024,mobile.matches?512:1024);sun.shadow.map?.dispose();sun.shadow.map=null;if(host){const active=host;mode='';switchModel(active);}resize();});
}
