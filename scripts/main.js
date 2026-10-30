const stage = document.querySelector("[data-tilt]");
const plant = stage?.querySelector(".plant-wrap");

if (stage && plant && window.matchMedia("(pointer: fine)").matches) {
  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    plant.style.setProperty("--tilt-x", `${x * 12}px`);
    plant.style.setProperty("--tilt-y", `${y * 10}px`);
  });

  stage.addEventListener("pointerleave", () => {
    plant.style.setProperty("--tilt-x", "0px");
    plant.style.setProperty("--tilt-y", "0px");
  });
}

const startButton = document.querySelector("[data-start]");

startButton?.addEventListener("click", (event) => {
  const target = document.querySelector(startButton.getAttribute("href"));

  if (target && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
