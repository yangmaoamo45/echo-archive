/* input.js —— 命令行输入封装 */
window.ECHO = window.ECHO || {};

ECHO.Input = (function () {
  const lineEl = document.getElementById("inputline");
  const cmd = document.getElementById("cmd");
  const caret = document.getElementById("caret");
  let handler = null;

  function show(placeholder) {
    lineEl.classList.remove("hidden");
    caret.classList.remove("hidden");
    cmd.value = "";
    cmd.placeholder = placeholder || "";
    cmd.focus();
  }

  function hide() {
    lineEl.classList.add("hidden");
    cmd.value = "";
  }

  function setHandler(fn) {
    handler = fn;
  }

  function echo(value) {
    const output = document.getElementById("output");
    const div = document.createElement("div");
    div.className = "cmd-echo fade-in";
    div.innerHTML = "<b>" + escapeHtml(value) + "</b>";
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function init() {
    cmd.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const v = cmd.value.trim();
        if (v.length === 0) return;
        ECHO.Audio.enter();
        echo(v);
        cmd.value = "";
        if (handler) handler(v);
      }
      // 让光标视觉贴合
      caret.style.opacity = "1";
    });
    cmd.addEventListener("input", function () {
      caret.classList.toggle("hidden", cmd.value.length > 0);
    });
    // 点击任意处聚焦输入
    document.addEventListener("click", function () {
      if (!lineEl.classList.contains("hidden")) cmd.focus();
    });
  }

  function focus() {
    if (!lineEl.classList.contains("hidden")) cmd.focus();
  }

  return { init, show, hide, setHandler, echo, focus };
})();
