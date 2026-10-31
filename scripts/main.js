import data from '../src/data/presentation.js';
import { render } from '../src/render.js';
import { plantSVG, surfaceSVG } from '../src/visuals.js';

// The build already contains readable HTML. Reloading after editing the data also
// updates the browser immediately without editing this UI code.
document.querySelector('#app').innerHTML = render(data);
document.title = data.title;
document.querySelector('meta[name="description"]').content = `${data.title} — ${data.researchers}. ${data.description}`;
document.querySelector('meta[property="og:title"]').content = data.title;
document.documentElement.classList.add('enhanced');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('main > section[data-section]')];
const previous = document.querySelector('[data-prev]');
const next = document.querySelector('[data-next]');
const position = document.querySelector('#section-position');
const progress = document.querySelector('#section-progress');
const status = document.querySelector('.control-status');
let current = 0, scrollFrame = 0;
function updatePosition() {
  const marker = innerHeight * .3;
  current = Math.max(0, sections.findLastIndex(s => s.getBoundingClientRect().top <= marker));
  if (Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2) current = sections.length - 1;
  position.textContent = `${current+1} / ${sections.length} · ${sections[current].dataset.section}`;
  progress.value = current + 1;
  previous.disabled = current === 0; next.disabled = current === sections.length - 1;
  const links = [...document.querySelectorAll('.toc a')];
  const active = links.findLast(link => sections.findIndex(s => s.id === link.hash.slice(1)) <= current);
  links.forEach(link => link === active ? link.setAttribute('aria-current','location') : link.removeAttribute('aria-current'));
  scrollFrame = 0;
}
function goTo(section) {
  if (!section) return;
  const heading = section.querySelector('h1,h2');
  if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
  history.replaceState(null,'',`#${section.id}`);
  section.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
}
document.querySelector('.presentation-controls').hidden = false;
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updatePosition);},{passive:true});
addEventListener('resize',updatePosition);
addEventListener('load',()=>{if(location.hash)goTo(document.getElementById(location.hash.slice(1)));updatePosition();});
previous.addEventListener('click',()=>goTo(sections[current-1]));
next.addEventListener('click',()=>goTo(sections[current+1]));
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const section = document.getElementById(link.hash.slice(1));
  if(!section?.matches('[data-section]'))return;
  event.preventDefault();goTo(section);
}));
document.addEventListener('keydown',event=>{
  const interactive = event.target.closest('input,textarea,select,button,a,summary,canvas,[contenteditable]:not([contenteditable="false"]),[role="slider"],[role="textbox"],[role="tab"],[role="listbox"],[role="menu"]');
  if(event.defaultPrevented||event.isComposing||event.repeat||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||interactive||document.querySelector('dialog[open]'))return;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();goTo(sections[current+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)]);
});
const fullscreen = document.querySelector('[data-fullscreen]');
fullscreen.addEventListener('click',async()=>{
  status.textContent='';
  try {
    if(document.fullscreenElement)await document.exitFullscreen();
    else if(document.fullscreenEnabled&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
    else status.textContent='이 브라우저는 전체 화면을 지원하지 않습니다. 브라우저 메뉴를 이용해 주세요.';
  } catch {status.textContent='전체 화면으로 전환하지 못했습니다. 브라우저 메뉴를 이용해 주세요.';}
});
document.addEventListener('fullscreenchange',()=>{
  const active=Boolean(document.fullscreenElement);
  fullscreen.textContent=active?'전체 화면 종료':'전체 화면';
  fullscreen.setAttribute('aria-pressed',String(active));
  fullscreen.setAttribute('aria-label',active?'전체 화면 종료':'전체 화면 시작');
});
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add(entry.target.matches('.rate-chart')?'chart-animate':'is-visible');
    observer.unobserve(entry.target);
  }),{threshold:.12});
  document.querySelectorAll('.reveal,.rate-chart').forEach(el=>observer.observe(el));
}
document.querySelectorAll('[data-surface]').forEach(button=>button.addEventListener('click',()=>{
  const selected=data.surfaces.find(s=>s.id===button.dataset.surface);
  document.querySelectorAll('[data-surface]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelector('.surface-description').textContent=selected.description;
  const host=document.querySelector('[data-key="surface"]');
  host.dataset.model=`surface:${selected.id}`;
  host.querySelector('.model-fallback').innerHTML=surfaceSVG(selected.id,'surface-live');
  host.dispatchEvent(new Event('modelchange'));
}));
document.querySelectorAll('[data-plant]').forEach(button=>button.addEventListener('click',()=>{
  const selected=data.plants.find(p=>p.id===button.dataset.plant);
  document.querySelectorAll('[data-plant]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelectorAll('[data-plant-info]').forEach(el=>{el.hidden=el.dataset.plantInfo!==selected.id;});
  const host=document.querySelector('[data-key="plant"]');
  host.dataset.model=selected.model;
  host.querySelector('.model-fallback').innerHTML=plantSVG(selected.model,'plant-live');
  host.dispatchEvent(new Event('modelchange'));
}));
document.querySelectorAll('.photo-frame img').forEach(image=>{
  const fallback=()=>{image.hidden=true;image.parentElement.querySelector('.photo-placeholder').hidden=false;image.parentElement.querySelector('.photo-placeholder small').textContent='사진을 불러오지 못했습니다. 파일 경로를 확인해 주세요.';};
  image.addEventListener('error',fallback);
  if(image.complete&&!image.naturalWidth)fallback();
});
const coverImage=document.querySelector('.cover-photo img');
if(coverImage){
  const fallback=()=>{const figure=coverImage.closest('figure');figure.innerHTML=plantSVG('rubber','cover-image-fallback')+'<figcaption>표지 이미지 로딩 실패 · 설명용 일러스트</figcaption>';};
  coverImage.addEventListener('error',fallback);if(coverImage.complete&&!coverImage.naturalWidth)fallback();
}
import('../src/models.js').then(({initModels})=>initModels()).catch(()=>{
  document.querySelectorAll('.model-state').forEach(el=>{el.textContent='설명용 일러스트 · 3D 모듈을 불러오지 못했습니다';});
});
updatePosition();
