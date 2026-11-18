/* effects.js —— 视觉故障/闪烁/钥匙碎片动画 */
window.ECHO = window.ECHO || {};

ECHO.Effects = (function () {

  function shake(el) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(function () { el.classList.remove("shake"); }, 450);
  }

  function flashRed(el) {
    if (!el) return;
    el.classList.remove("flash-red");
    void el.offsetWidth;
    el.classList.add("flash-red");
    setTimeout(function () { el.classList.remove("flash-red"); }, 550);
  }

  /* 解出钥匙字符时的全屏闪现 */
  function flashFragment(ch) {
    const wrap = document.getElementById("fragment-flash");
    const chr = document.getElementById("fragment-char");
    if (!wrap || !chr) return;
    chr.textContent = ch;
    wrap.classList.remove("hidden");
    // 重启动画
    chr.style.animation = "none";
    void chr.offsetWidth;
    chr.style.animation = "";
    wrap.classList.add("show");
    setTimeout(function () {
      wrap.classList.remove("show");
      setTimeout(function () { wrap.classList.add("hidden"); }, 400);
    }, 1500);
  }

  /* 随机故障闪烁：给元素加 glitch */
  function glitch(el, times) {
    if (!el) return;
    let n = 0;
    const max = times || 3;
    const iv = setInterval(function () {
      el.classList.add("shake");
      setTimeout(function () { el.classList.remove("shake"); }, 180);
      n++;
      if (n >= max) clearInterval(iv);
    }, 320);
  }

  /* 开机扫描条 */
  function bootScan() {
    const bar = document.createElement("div");
    bar.className = "boot-scan";
    document.body.appendChild(bar);
    setTimeout(function () { bar.remove(); }, 4400);
  }

  function sleep(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  return { shake, flashRed, flashFragment, glitch, bootScan, sleep };
})();
