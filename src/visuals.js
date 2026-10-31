// Local vector fallbacks and explanatory diagrams. No simulated experiment photos.
const leafPaths = {
  rubber: "M0 0 C-50 -20 -62 -90 0 -132 C62 -90 50 -20 0 0Z",
  pothos: "M0 -10 C-40 30 -90 -45 -46 -70 C-18 -90 -4 -63 0 -60 C4 -63 18 -90 46 -70 C90 -45 40 30 0 -10Z",
  peace: "M0 0 C-32 -45 -34 -115 0 -165 C30 -110 26 -38 0 0Z",
  lambs: "M0 0 C-25 -14 -43 -85 -15 -128 C18 -162 40 -115 28 -66 C24 -32 12 -10 0 0Z",
};
export function plantSVG(kind, key) {
  const color = { rubber: "#64916C", pothos: "#88AE69", peace: "#6E9C89", lambs: "#AFC5AD" }[kind] || "#91B58C";
  const leaves = kind === "pothos" ? [[210,120,-50,.7],[172,155,50,.8],[215,225,-65,.72],[255,275,80,.65],[178,285,20,.58]] : [[200,225,-55,.8],[203,190,42,.85],[200,152,-40,.7],[201,120,32,.65],[197,240,18,.8]];
  return `<svg viewBox="0 0 400 400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="leaf-${key}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#DAE9CC"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="#5D7D62"/></linearGradient><linearGradient id="pot-${key}"><stop stop-color="#E9D7C9"/><stop offset=".5" stop-color="#FFF0E2"/><stop offset="1" stop-color="#D8BFB3"/></linearGradient></defs><ellipse cx="200" cy="366" rx="92" ry="16" fill="#514F4A" opacity=".08"/><path d="M151 285 Q150 365 175 366 H226 Q252 363 250 285" fill="url(#pot-${key})"/><ellipse cx="200" cy="285" rx="50" ry="15" fill="#C6B4A1"/><path d="M200 294 Q192 190 202 90" stroke="#7B9871" stroke-width="7" fill="none"/>${leaves.map(([x,y,a,s],i)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${leafPaths[kind] || leafPaths.rubber}" fill="url(#leaf-${key})"/><path d="M0 -4 Q-6 -60 0 -${kind === "peace" ? 155 : 118}" stroke="#DCE6BF" stroke-width="2" fill="none"/>${kind === "lambs" ? Array.from({length:55},(_,j)=>`<path d="M${Math.sin(j*8)*22} ${-12-(j*13)%108}l-3 -5" stroke="#E9EEDC" stroke-width="1.2"/>`).join("") : ""}</g>`).join("")}</svg>`;
}
export function surfaceSVG(kind, key) {
  const hairs = Array.from({length:70}, (_,i) => {
    const x=85+(i*47)%235, y=145+(i*29)%100;
    return `<path d="M${x} ${y}q-6 -18 -2 -30" stroke="#E6EDD9" stroke-width="3" stroke-linecap="round"/>`;
  }).join("");
  return `<svg viewBox="0 0 400 340" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s-${key}"><stop stop-color="#CDE0B9"/><stop offset="1" stop-color="#8DAF8D"/></linearGradient></defs><ellipse cx="200" cy="280" rx="140" ry="22" fill="#514F4A" opacity=".06"/><path d="M50 210 Q65 120 220 98 Q340 87 352 181 Q311 265 138 266Z" fill="#8BA382"/><path d="M50 198 Q65 108 220 86 Q340 75 352 169 Q311 253 138 254Z" fill="url(#s-${key})"/>${kind === "wax" ? '<path d="M82 190Q180 105 288 124" fill="none" stroke="#F7F7D9" opacity=".7" stroke-width="14" stroke-linecap="round"/>' : ''}${kind === "hair" ? hairs : ''}${[[110,191],[210,155],[284,204],[183,220]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#6C7463"/><circle cx="${x-2}" cy="${y-3}" r="3" fill="#8F9887"/>`).join("")}</svg>`;
}
export function diagram(kind, key) {
  const dots = Array.from({length:18}, (_,i)=>`<circle cx="${115+(i*67)%260}" cy="${115+(i*41)%130}" r="${2+i%4}" fill="#777B6C"/>`).join("");
  let shapes;
  if (["chamber", "dispersion", "settling"].includes(kind)) {
    shapes = `<path d="M110 78L350 60L418 104V330L160 350L90 304V105Z" fill="#FFFDF8" fill-opacity=".55" stroke="#A7BFB6" stroke-width="2"/><path d="M90 105L160 144L418 104M160 144V350M350 60V286L90 304" fill="none" stroke="#B7CDC4" stroke-width="1.5"/><path d="M135 132L335 115L372 136L170 158Z" fill="#DCCDC0"/><path d="M135 132V141L170 168L372 146V136L170 158Z" fill="#C8BBAE"/>${dots}<path d="M206 184V258m60 -82v75m60 -85v74" stroke="#A9BDAA" stroke-width="2" stroke-dasharray="5 7"/>${[175,240,305].map((x)=>`<path d="M${x} 300q0 -40 54 -30q-8 34 -54 30" fill="#A5C59A" stroke="#90B385"/>`).join("")}<path d="M135 300L336 285L377 308L168 330Z" fill="#C0D5C5" opacity=".6"/>${kind === "dispersion" ? '<path d="M34 140q15 -26 57 -16M36 158q24 -10 54 -9" stroke="#B0C9DF" stroke-width="6" fill="none" stroke-linecap="round"/>' : ''}${kind === "settling" ? '<circle cx="407" cy="286" r="45" fill="#FFF4E8" stroke="#DAC8AE" stroke-width="3"/><path d="M407 253V286L427 301" stroke="#8A9F88" stroke-width="4" fill="none"/>' : ''}`;
  } else if (kind === "tape") {
    shapes=`<path d="M35 225Q35 115 165 120Q180 220 35 225" fill="#A6C599"/><path d="M52 210L145 139" stroke="#D8E8C5" stroke-width="3"/><g transform="translate(170 100) rotate(-8)"><rect width="130" height="140" rx="15" fill="#F6E2C3" stroke="#DAC2A2" opacity=".8"/><path d="M0 20Q65 -20 130 20" fill="none" stroke="#DAC2A2"/></g><g transform="translate(332 163) rotate(-8)"><rect width="115" height="150" rx="9" fill="#E9F4FA" stroke="#B0CBD7" stroke-width="2"/><circle cx="40" cy="60" r="8" fill="#737A65"/><circle cx="60" cy="85" r="5" fill="#737A65"/></g><path d="M142 255q28 27 57 10m100 25q26 23 50 2" stroke="#A2AB9D" stroke-width="2" fill="none"/>`;
  } else if (kind === "analysis") {
    shapes=`<rect x="30" y="90" width="195" height="210" rx="22" fill="#FFFDF8" stroke="#D6CFE2"/><rect x="275" y="90" width="195" height="210" rx="22" fill="#E7E2F3" stroke="#C5BBD9"/>${Array.from({length:14},(_,i)=>{const x=55+(i*43)%140, y=125+(i*29)%135;return `<ellipse cx="${x}" cy="${y}" rx="${4+i%6}" ry="${3+i%7}" fill="#747A6E"/><rect x="${x+238}" y="${y-5}" width="${10+i%6}" height="${8+i%7}" rx="2" fill="#A58DB9"/>`;}).join('')}<path d="M235 195h27m-8 -8l8 8-8 8" stroke="#92879D" stroke-width="2" fill="none"/>`;
  } else {
    shapes=`<path d="M58 266Q78 130 277 126Q431 120 446 218Q361 328 150 320Z" fill="#AFCBA0"/><path d="M68 255Q238 194 414 198" stroke="#D7E8BD" stroke-width="5" fill="none"/>${dots}<path d="M152 80v62m98 -84v59m98 -38v51" stroke="#B3BDAA" stroke-dasharray="4 8" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 500 400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><ellipse cx="255" cy="354" rx="190" ry="18" fill="#514F4A" opacity=".04"/>${shapes}</svg>`;
}
