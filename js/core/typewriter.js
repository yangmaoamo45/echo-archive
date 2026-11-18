/* typewriter.js —— 逐字打印，支持跳过 */
window.ECHO = window.ECHO || {};

ECHO.Typewriter = (function () {
  let running = null;

  function createLine(cls) {
    const div = document.createElement("div");
    div.className = "line " + (cls || "");
    return div;
  }

  /* 打字输出一段文字到 output 容器
     opts: { cls, speed(ms/字), sound(bool), onDone(fn), instant(bool) } */
  function type(container, text, opts) {
    opts = opts || {};
    const el = createLine(opts.cls);
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;

    const speed = opts.instant ? 0 : (opts.speed || 18);
    const sound = opts.sound !== false;
    let i = 0;
    let cancelled = false;

    if (opts.instant || speed === 0) {
      el.textContent = text;
      container.scrollTop = container.scrollHeight;
      if (opts.onDone) opts.onDone();
      return { cancel() {}, el, skip() {} };
    }

    const handle = {
      el,
      cancel() {
        cancelled = true;
        if (running === handle) running = null;
      },
      skip() {
        cancelled = true;
        el.textContent = text;
        container.scrollTop = container.scrollHeight;
        if (running === handle) running = null;
        if (opts.onDone) opts.onDone();
      }
    };

    running = handle;

    const timer = setInterval(function () {
      if (cancelled) { clearInterval(timer); return; }
      el.textContent += text.charAt(i);
      i++;
      if (sound && i % 2 === 0 && text.charAt(i - 1) !== " ") {
        try { ECHO.Audio.type(); } catch (e) {}
      }
      container.scrollTop = container.scrollHeight;
      if (i >= text.length) {
        clearInterval(timer);
        if (running === handle) running = null;
        if (opts.onDone) opts.onDone();
      }
    }, speed);

    return handle;
  }

  function skipAll() {
    if (running) running.skip();
  }

  function isRunning() { return !!running; }

  return { type, skipAll, isRunning };
})();
