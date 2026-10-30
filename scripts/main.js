const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 761px)");
const sections = [...document.querySelectorAll("main > section[data-section]")];
const controls = document.querySelector(".presentation-controls");
const previous = document.querySelector("[data-prev]");
const next = document.querySelector("[data-next]");
const position = document.querySelector("#section-position");
const progress = document.querySelector("#section-progress");
const status = document.querySelector(".control-status");
let current = 0;
let scrollFrame = 0;

function updatePosition() {
  const marker = window.innerHeight * 0.3;
  current = Math.max(0, sections.findLastIndex((section) => section.getBoundingClientRect().top <= marker));
  if (Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
    current = sections.length - 1;
  }
  position.textContent = `${String(current + 1).padStart(2, "0")} / ${sections.length} · ${sections[current].dataset.section}`;
  progress.value = current + 1;
  progress.max = sections.length;
  previous.disabled = current === 0;
  next.disabled = current === sections.length - 1;
  document.querySelectorAll('.toc-item').forEach((link) => {
    const targetIndex = sections.findIndex((section) => `#${section.id}` === link.hash);
    const end = { motivation: 4, surface: 10, plants: 16, measurements: 18, conclusion: 20 }[link.hash.slice(1)];
    if (current >= targetIndex && current < end) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollFrame = 0;
}

function goTo(section) {
  if (!section) return;
  const heading = section.querySelector("h1, h2");
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  history.replaceState(null, "", `#${section.id}`);
  section.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
}

controls.hidden = false;
window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updatePosition);
}, { passive: true });
window.addEventListener("resize", updatePosition);
window.addEventListener("load", updatePosition);
previous.addEventListener("click", () => goTo(sections[current - 1]));
next.addEventListener("click", () => goTo(sections[current + 1]));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(link.hash.slice(1));
    if (!section?.matches("[data-section]")) return;
    event.preventDefault();
    goTo(section);
  });
});

document.addEventListener("keydown", (event) => {
  const interactive = event.target.closest('input, textarea, select, button, a, summary, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="textbox"], [role="button"], [role="tab"], [role="listbox"], [role="menu"]');
  if (event.defaultPrevented || event.isComposing || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || interactive || document.querySelector("dialog[open]")) return;
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  const delta = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
  goTo(sections[current + delta]);
});

const fullscreen = document.querySelector("[data-fullscreen]");
fullscreen.addEventListener("click", async () => {
  status.textContent = "";
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else {
      status.textContent = "이 브라우저는 전체 화면 기능을 지원하지 않습니다. 브라우저의 전체 화면 메뉴를 이용해 주세요.";
    }
  } catch {
    status.textContent = "전체 화면으로 전환하지 못했습니다. 브라우저의 전체 화면 메뉴를 이용해 주세요.";
  }
});
document.addEventListener("fullscreenchange", () => {
  const active = Boolean(document.fullscreenElement);
  fullscreen.textContent = active ? "전체 화면 종료" : "전체 화면";
  fullscreen.setAttribute("aria-pressed", String(active));
  fullscreen.setAttribute("aria-label", active ? "전체 화면 종료" : "전체 화면 시작");
});

// Content and chart labels remain visible without JavaScript or observers.
if ("IntersectionObserver" in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add(entry.target.matches(".chart-card") ? "chart-animate" : "is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, .chart-card").forEach((element) => reveal.observe(element));
}

// The original cover motion plus a small tilt on explanatory models.
document.querySelectorAll("[data-tilt], .tilt-card").forEach((stage) => {
  const plant = stage.querySelector(".plant-wrap");
  let frame = 0;
  function reset() {
    cancelAnimationFrame(frame);
    for (const property of ["--tilt-x", "--tilt-y", "--rx", "--ry"]) {
      (plant || stage).style.removeProperty(property);
    }
  }
  stage.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      if (plant) {
        plant.style.setProperty("--tilt-x", `${x * 12}px`);
        plant.style.setProperty("--tilt-y", `${y * 10}px`);
      } else {
        stage.style.setProperty("--rx", `${-y * 5}deg`);
        stage.style.setProperty("--ry", `${x * 5}deg`);
      }
    });
  });
  stage.addEventListener("pointerleave", reset);
  reducedMotion.addEventListener("change", reset);
  finePointer.addEventListener("change", reset);
});

// Empty slots make no image requests. A broken replacement restores the guide.
document.querySelectorAll("[data-photo-src]").forEach((image) => {
  const slot = image.closest(".photo-slot");
  const placeholder = slot.querySelector(".photo-placeholder");
  const message = slot.querySelector(".photo-status");
  image.addEventListener("load", () => {
    image.hidden = false;
    placeholder.hidden = true;
    message.textContent = image.alt;
  });
  image.addEventListener("error", () => {
    image.hidden = true;
    placeholder.hidden = false;
    message.textContent = "사진을 불러오지 못했습니다. 파일 이름과 경로를 확인해 주세요.";
  });
  if (image.dataset.photoSrc.trim()) image.src = image.dataset.photoSrc.trim();
});
const heroImage = document.querySelector(".hero-plant");
function fallbackHero() {
  heroImage.hidden = true;
  document.querySelector(".hero-fallback").hidden = false;
}
heroImage.addEventListener("error", fallbackHero);
if (heroImage.complete && !heroImage.naturalWidth) fallbackHero();
updatePosition();
