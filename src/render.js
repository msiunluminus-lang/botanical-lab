import { plantSVG, surfaceSVG, diagram } from './visuals.js';

export const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const e = escapeHTML;
export function safeImage(value) {
  return typeof value === 'string' && /^(images|assets)\/[a-zA-Z0-9_./-]+$/.test(value) && !value.split('/').includes('..') ? value : '';
}
function viewer(mode, key, label, interactive = true) {
  const fallback = mode === 'garden' ? `<div class="garden-fallback">${['rubber','peace','pothos','lambs'].map((p,i)=>plantSVG(p,`${key}-${i}`)).join('')}</div>` : mode.startsWith('surface:') ? surfaceSVG(mode.split(':')[1],key) : plantSVG(mode,key);
  return `<div class="model-viewer" data-model="${mode}" data-key="${key}" role="group" aria-label="${e(label)}">
    <div class="model-fallback">${fallback}</div><div class="canvas-mount"></div>
    ${interactive ? '<div class="viewer-actions" hidden><button type="button" data-zoom="in" aria-label="모형 확대">＋</button><button type="button" data-zoom="out" aria-label="모형 축소">−</button><button type="button" data-reset aria-label="모형 시점 초기화">↺</button></div>' : ''}
    <span class="model-state">설명용 모형</span></div>`;
}
function photo(item, key) {
  if (!item) return '';
  const path = safeImage(item.src || item.image || '');
  const alt = item.alt || `${item.name} 실제 사진`;
  return `<figure class="photo-slot" data-photo="${e(key)}"><div class="photo-frame" style="--ratio:${item.ratio==='16:10'?'16 / 10':'4 / 3'}">${path ? `<img src="${e(path)}" alt="${e(alt)}" loading="lazy" width="1200" height="900">` : ''}<div class="photo-placeholder" ${path?'hidden':''}><span aria-hidden="true">＋</span><strong>${e(alt)}</strong><small>실제 촬영 자료를 넣을 자리</small></div></div><figcaption><details><summary>사진 추가 안내</summary><p>권장 ${e(item.ratio||'4:3')} · <code>public/images/photos/</code>에 파일을 넣고, <code>src/data/presentation.js</code>의 해당 <code>${item.name?'image':'src'}</code>에 <code>images/photos/파일명.jpg</code>를 입력하세요.</p></details></figcaption></figure>`;
}
const illustration = (kind,key,caption='과정 설명용 일러스트') => `<figure class="illustration">${diagram(kind,key)}<figcaption>${caption}</figcaption></figure>`;
function paragraphs(s) { return (s.paragraphs||[]).map(p=>`<p>${e(p)}</p>`).join(''); }
function note(s) { return s.note ? `<p class="research-note">${e(s.note)}</p>` : ''; }
function items(s) { return `<div class="idea-list">${(s.items||[]).map(item=>`<article><span class="idea-dot" aria-hidden="true"></span><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('')}</div>`; }
function content(s,d) {
  const text=`<div class="reading">${paragraphs(s)}${note(s)}</div>`;
  switch(s.type) {
    case 'overview': return `<div class="overview-layout">${text}<nav class="toc" aria-label="연구 목차">${d.navigation.map(n=>`<a href="#${e(n.target)}"><span>${e(n.label)}</span><span aria-hidden="true">↗</span></a>`).join('')}</nav></div>`;
    case 'story': case 'interpretation': return `<div class="split">${illustration(s.visual,s.id)}${text}</div>`;
    case 'purpose': return `${text}${items(s)}`;
    case 'hypothesis': return `<div class="split">${viewer('lambs','hypothesis','램스이어의 잔털 모형')}<div>${text}<a class="inline-link" href="#interpretation">실제 결과와 비교하기 ↗</a></div></div>`;
    case 'surfaces': return `<div class="surface-layout"><div><div class="surface-options" role="group" aria-label="표면 모형 선택">${d.surfaces.map((surface,i)=>`<button type="button" data-surface="${surface.id}" aria-pressed="${i===0}">${e(surface.name)}</button>`).join('')}</div><div class="surface-description" aria-live="polite">${e(d.surfaces[0].description)}</div>${text}</div>${viewer('surface:smooth','surface','확대 가능한 잎 표면 개념 모형')}</div><div class="surface-static">${d.surfaces.map(surface=>`<figure>${surfaceSVG(surface.id,`static-${surface.id}`)}<figcaption><strong>${e(surface.name)}</strong><p>${e(surface.description)}</p></figcaption></figure>`).join('')}</div>`;
    case 'contrast': return `<div class="contrast">${s.items.map((item,i)=>`<article>${surfaceSVG(i?'hair':'wax',`contrast-${i}`)}<h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('')}</div>`;
    case 'plants': return `<div class="plant-selector" role="group" aria-label="식물 모형 선택">${d.plants.map((plant,i)=>`<button type="button" data-plant="${e(plant.id)}" aria-pressed="${i===0}">${plantSVG(plant.model,`thumb-${plant.id}`)}<span>${e(plant.name)}</span></button>`).join('')}</div><div class="plant-exhibit">${viewer(d.plants[0].model,'plant','선택한 식물의 3D 모형')}<div class="plant-details">${d.plants.map((plant,i)=>`<article data-plant-info="${e(plant.id)}" ${i?'hidden':''}><span class="plant-trait">${e(plant.trait)}</span><h3>${e(plant.name)}</h3><p>${e(plant.description)}</p>${photo(plant,plant.id)}</article>`).join('')}${note(s)}</div></div>`;
    case 'experiment': return `<div class="experiment-layout">${illustration(s.visual,s.id,s.visual==='analysis'?'이미지 → 영역 구분 · 원리 설명용 예시':'실험 과정 설명용 구성도')}<div class="reading">${s.metric?`<div class="metric"><strong>${e(s.metric)}</strong><span>${e(s.unit)}</span></div>`:''}${paragraphs(s)}${note(s)}</div></div>${photo(d.photos[s.photo],s.photo)}`;
    case 'table': return `<div class="result-layout">${text}<div class="table-wrap"><table><caption>활성탄 측정 면적 · cm²</caption><thead><tr><th scope="col">식물</th><th scope="col">앞면</th><th scope="col">뒷면</th></tr></thead><tbody>${d.plants.map(p=>`<tr><th scope="row"><span class="plant-dot" style="background:${p.color}"></span>${e(p.name)}</th><td>${p.front.toFixed(3)}</td><td>${p.back.toFixed(3)}</td></tr>`).join('')}</tbody></table></div></div>`;
    case 'comparison': { const max=Math.max(...d.plants.flatMap(p=>[p.front,p.back]),.001); return `${text}<div class="legend"><span>● 앞면</span><span>● 뒷면</span><small>각 행의 막대는 같은 축척 · cm²</small></div><div class="comparison-chart">${d.plants.map(p=>`<article><h3>${e(p.name)}</h3><div class="paired-bar"><span style="--width:${p.front/max*100}%"></span><b>${p.front.toFixed(3)}</b></div><div class="paired-bar back"><span style="--width:${p.back/max*100}%"></span><b>${p.back.toFixed(3)}</b></div></article>`).join('')}</div>`; }
    case 'rates': return `<div class="result-layout">${text}<figure class="rate-chart"><figcaption>앞면 흡착률 · 보고서 기재 값</figcaption>${[...d.plants].sort((a,b)=>b.rate-a.rate).map((p,i)=>`<div class="chart-row"><div class="bar-label"><span>${e(p.name)}</span><strong>${p.rate.toFixed(1)}<small>%</small></strong></div><div class="bar-track"><div class="bar-fill" style="--value:${p.rate}%;--delay:${i*90}ms"></div></div></div>`).join('')}<div class="chart-axis"><span>0%</span><span>50%</span><span>100%</span></div></figure></div>`;
    case 'conclusion': case 'limits': case 'future': return `${text}${items(s)}`;
    case 'closing': return `<div class="closing-visual">${plantSVG('peace','closing')}</div><p class="signature">${e(d.researchers)}</p><a class="inline-link" href="#top">처음으로 돌아가기 ↑</a>`;
    default: return `<div class="split">${text}${illustration(s.visual||'contact',s.id)}</div>`;
  }
}
export function validateData(d) {
  if (!d.title?.trim() || !d.researchers?.trim() || !Array.isArray(d.sections) || !d.plants?.length) throw Error('제목·연구자·섹션·식물 데이터를 확인하세요.');
  const ids = ['top', ...d.sections.map(s=>s.id)];
  if (ids.some(id=>!/^[a-z][a-z0-9-]*$/.test(id)) || new Set(ids).size!==ids.length) throw Error('섹션 id는 중복 없는 영문 소문자와 숫자, 하이픈을 사용하세요.');
  if (d.navigation.some(n=>!ids.includes(n.target))) throw Error('목차 target에 해당하는 섹션이 없습니다.');
  const plantIds=d.plants.map(p=>p.id);
  if(new Set(plantIds).size!==plantIds.length) throw Error('식물 id가 중복되었습니다.');
  for (const p of d.plants) {
    if (!['rubber','pothos','peace','lambs'].includes(p.model)) throw Error(`${p.name}의 model 값을 확인하세요.`);
    if (![p.front,p.back,p.rate].every(Number.isFinite) || p.front<0 || p.back<0 || p.rate<0 || p.rate>100) throw Error(`${p.name}의 수치를 확인하세요. 면적은 0 이상, 흡착률은 0–100입니다.`);
    if (!/^#[0-9a-f]{6}$/i.test(p.color)) throw Error('식물 색상은 #RRGGBB 형식이어야 합니다.');
  }
}
export function render(d) {
  validateData(d);
  const coverImage=safeImage(d.cover.image);
  return `<a class="skip-link" href="#research">연구 목차로 이동</a><header class="site-header"><a href="#top" class="brand" aria-label="연구 표지로 이동"><span class="brand-leaf" aria-hidden="true"></span><span>잎 표면 연구</span></a><a class="header-link" href="#research">연구 둘러보기 <span aria-hidden="true">↗</span></a></header>
  <main><section class="hero" id="top" data-section="표지" aria-labelledby="hero-title"><div class="hero-copy"><span class="eyebrow">${e(d.cover.label)}</span><h1 id="hero-title">${e(d.title)}</h1><p class="hero-description">${e(d.cover.introduction)}</p><p class="hero-researchers">${e(d.researchers)}</p><a href="#research" class="start-button" data-start>${e(d.cover.button)}<span aria-hidden="true">↗</span></a></div><div class="hero-exhibit">${coverImage?`<figure class="cover-photo"><img src="${e(coverImage)}" alt="연구 표지 이미지"><figcaption>연구 표지</figcaption></figure>`:viewer('garden','cover','네 식물의 형태를 나타낸 3D 정원')}<div class="exhibit-label"><span class="tiny-leaf" aria-hidden="true"></span>네 가지 식물, 서로 다른 표면<span>설명용 3D 모델</span></div></div><div class="hero-footer"><span>활성탄을 이용한 입자 부착 비교 연구</span><a href="#research" aria-label="목차로 내려가기">↓</a></div></section>
  ${d.sections.map(s=>`<section class="chapter tone-${e(s.tone||'white')} layout-${e(s.type)}" id="${e(s.id)}" data-section="${e(s.title)}" aria-labelledby="${e(s.id)}-title"><div class="section-inner"><header class="section-heading reveal"><h2 id="${e(s.id)}-title">${e(s.title)}</h2>${s.lead?`<p class="lead">${e(s.lead)}</p>`:''}</header>${content(s,d)}</div></section>`).join('')}</main>
  <nav class="presentation-controls" aria-label="발표 제어" hidden><a href="#research" class="control-button">목차</a><button type="button" class="control-button" data-prev aria-label="이전 섹션">←</button><div class="position-display"><span id="section-position"></span><progress id="section-progress" max="${d.sections.length+1}" value="1" aria-label="현재 섹션"></progress></div><button type="button" class="control-button" data-next aria-label="다음 섹션">→</button><button type="button" class="control-button" data-fullscreen aria-label="전체 화면 시작" aria-pressed="false">전체 화면</button></nav><p class="control-status" role="status" aria-live="polite"></p>`;
}
