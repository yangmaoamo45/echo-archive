/* main.js —— 启动入口 */
window.addEventListener("DOMContentLoaded", function () {
  ECHO.State.load();

  /* 顶部时钟 */
  const clock = document.getElementById("hud-clock");
  function tick() {
    const d = new Date();
    const p = function (n) { return String(n).padStart(2, "0"); };
    clock.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* 信号强度随机跳动 */
  const sig = document.getElementById("hud-signal");
  const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇"];
  setInterval(function () {
    let s = "";
    const n = 2 + Math.floor(Math.random() * 5);
    for (let i = 0; i < 7; i++) {
      s += bars[Math.max(0, Math.min(6, n - Math.floor(Math.random() * 3))) ];
    }
    sig.textContent = "SIGNAL " + s;
  }, 900);

  /* 启动引擎 */
  ECHO.Engine.start();
});
