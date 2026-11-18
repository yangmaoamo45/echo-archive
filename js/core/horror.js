/* horror.js —— 恐怖氛围系统
   血雾脉冲 / 静电噪点 / 闪脸 / 在场感 / 心跳 / 录像带时间戳
*/
window.ECHO = window.ECHO || {};

ECHO.Horror = (function () {
  const blood = document.getElementById("blood-layer");
  const staticLayer = document.getElementById("static-layer");
  const faceFlash = document.getElementById("face-flash");
  const presence = document.getElementById("presence");
  const presenceText = presence.querySelector(".presence-text");
  const heartbeat = document.getElementById("heartbeat");
  const vhs = document.getElementById("vhs-timestamp");
  const ghost = document.getElementById("ghost-layer");
  const fakeAlert = document.getElementById("fake-alert");
  const fakeAlertBody = fakeAlert ? fakeAlert.querySelector(".fa-body") : null;
  const blackout = document.getElementById("blackout");

  let intensity = 0;        // 0 平静 ~ 100 崩坏
  let ambientTimer = null;
  let heartTimer = null;
  let presenceTimer = null;
  let active = false;

  /* ---------- 血雾脉冲 ---------- */
  function bloodPulse(strength) {
    strength = strength || 0.5;
    blood.classList.remove("pulse");
    void blood.offsetWidth;
    blood.style.setProperty("--pulse", strength);
    blood.classList.add("pulse");
    setTimeout(function () { blood.classList.remove("pulse"); }, 1400);
  }

  /* ---------- 静电噪点 ---------- */
  function staticBurst(ms) {
    staticLayer.classList.remove("on");
    void staticLayer.offsetWidth;
    staticLayer.classList.add("on");
    if (ms) {
      setTimeout(function () { staticLayer.classList.remove("on"); }, ms);
    }
    return {
      stop: function () { staticLayer.classList.remove("on"); }
    };
  }

  /* ---------- 闪脸（jump scare） ---------- */
  function flashFace(opts) {
    opts = opts || {};
    const dur = opts.duration || 220;
    faceFlash.classList.remove("hidden");
    faceFlash.classList.remove("show");
    void faceFlash.offsetWidth;
    faceFlash.classList.add("show");
    if (!ECHO.Audio.isMuted()) {
      try { ECHO.Audio.stinger(); } catch (e) {}
    }
    try { ECHO.Effects.shake(document.getElementById("crt")); } catch (e) {}
    setTimeout(function () {
      faceFlash.classList.remove("show");
      setTimeout(function () { faceFlash.classList.add("hidden"); }, 200);
    }, dur);
  }

  /* ---------- 在场感：一句冷不丁的话 ---------- */
  function whisper(text, opts) {
    opts = opts || {};
    presenceText.textContent = text;
    presenceText.className = "presence-text " + (opts.cls || "");
    presence.classList.remove("hidden");
    presence.classList.add("show");
    if (!ECHO.Audio.isMuted()) {
      try { ECHO.Audio.whisper(); } catch (e) {}
    }
    const dur = opts.duration || 2600;
    setTimeout(function () {
      presence.classList.remove("show");
      setTimeout(function () { presence.classList.add("hidden"); }, 600);
    }, dur);
  }

  /* ---------- 心跳 ---------- */
  function startHeartbeat(bpm) {
    if (heartTimer) return;
    bpm = bpm || 66;
    const interval = (60 / bpm) * 1000;
    heartbeat.classList.remove("hidden");
    function beat() {
      heartbeat.classList.remove("beat");
      void heartbeat.offsetWidth;
      heartbeat.classList.add("beat");
      if (!ECHO.Audio.isMuted()) {
        try { ECHO.Audio.heartbeat(); } catch (e) {}
      }
    }
    beat();
    heartTimer = setInterval(beat, interval);
  }

  function stopHeartbeat() {
    if (heartTimer) { clearInterval(heartTimer); heartTimer = null; }
    heartbeat.classList.add("hidden");
    heartbeat.classList.remove("beat");
  }

  /* ---------- 录像带时间戳 ---------- */
  function startVHS() {
    vhs.classList.remove("hidden");
    function upd() {
      const d = new Date();
      const p = function (n) { return String(n).padStart(2, "0"); };
      // 故意做成 1999 年的样子，偶尔跳一下
      const fakeYear = 1999;
      const sec = d.getSeconds();
      vhs.textContent = "REC ● " + fakeYear + "-02-14  " +
        p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(sec);
      vhs.classList.toggle("blink", sec % 2 === 0);
    }
    upd();
    setInterval(upd, 1000);
  }

  function stopVHS() { vhs.classList.add("hidden"); }

  /* ---------- 强度调节 ---------- */
  function setIntensity(v) {
    intensity = Math.max(0, Math.min(100, v));
    document.documentElement.style.setProperty("--horror", intensity / 100);
    // 强度越高，血雾底色越重
    blood.style.opacity = String(0.06 + (intensity / 100) * 0.22);
  }

  function getIntensity() { return intensity; }

  /* ---------- 随机氛围事件 ---------- */
  function scheduleAmbient() {
    if (ambientTimer) clearInterval(ambientTimer);
    ambientTimer = setInterval(function () {
      if (!active) return;
      const roll = Math.random();
      const p = intensity / 100;

      if (roll < 0.18 + p * 0.25) {
        // 轻微血雾
        bloodPulse(0.3 + p * 0.6);
      }
      if (roll > 0.9 - p * 0.15) {
        // 短促静电
        staticBurst(140 + Math.random() * 220);
      }
    }, 5200);
  }

  /* ---------- 各种预设惊吓 ---------- */

  // 小惊吓：屏幕一抖 + 静电
  function minorScare() {
    staticBurst(180);
    try { ECHO.Effects.shake(document.getElementById("crt")); } catch (e) {}
    if (!ECHO.Audio.isMuted()) { try { ECHO.Audio.staticZap(); } catch (e) {} }
  }

  // 中惊吓：血雾 + 低语 + 心跳加速
  function mediumScare(text) {
    bloodPulse(0.7);
    staticBurst(320);
    if (text) whisper(text, { cls: "dark", duration: 3000 });
    if (!ECHO.Audio.isMuted()) { try { ECHO.Audio.dread(); } catch (e) {} }
    try { ECHO.Effects.shake(document.getElementById("screen")); } catch (e) {}
  }

  // 大惊吓：闪脸
  function bigScare() {
    bloodPulse(1);
    staticBurst(600);
    startHeartbeat(96);
    setTimeout(function () {
      flashFace({ duration: 180 });
    }, 120);
    setTimeout(function () { stopHeartbeat(); }, 4200);
  }

  /* ---------- 鬼影飘过 ---------- */
  function ghostPass() {
    if (!ghost) return;
    ghost.classList.remove("hidden");
    ghost.classList.remove("show", "drift");
    void ghost.offsetWidth;
    ghost.classList.add("show", "drift");
    if (!ECHO.Audio.isMuted()) { try { ECHO.Audio.whisper(); } catch (e) {} }
    setTimeout(function () {
      ghost.classList.remove("show");
      setTimeout(function () { ghost.classList.add("hidden"); ghost.classList.remove("drift"); }, 1700);
    }, 7600);
  }

  /* ---------- 伪系统弹窗 ---------- */
  function fakeSystemAlert(title, body, holdMs) {
    if (!fakeAlert || !fakeAlertBody) return;
    const t = fakeAlert.querySelector(".fa-title");
    if (t && title) t.textContent = title;
    fakeAlertBody.textContent = body;
    fakeAlert.classList.remove("hidden");
    void fakeAlert.offsetWidth;
    fakeAlert.classList.add("show");
    if (!ECHO.Audio.isMuted()) { try { ECHO.Audio.error(); } catch (e) {} }
    if (holdMs !== 0) {
      setTimeout(function () {
        fakeAlert.classList.remove("show");
        setTimeout(function () { fakeAlert.classList.add("hidden"); }, 200);
      }, holdMs || 4200);
    }
  }

  function closeFakeAlert() {
    if (!fakeAlert) return;
    fakeAlert.classList.remove("show");
    setTimeout(function () { fakeAlert.classList.add("hidden"); }, 200);
  }

  /* ---------- 假死机：全屏黑掉一行字 ---------- */
  function fakeCrash(text, holdMs) {
    if (!blackout) return;
    const t = blackout.querySelector(".bo-text");
    t.className = "bo-text" + (text && text.indexOf("!") >= 0 ? " warn" : "");
    t.textContent = text || "";
    blackout.classList.remove("hidden");
    void blackout.offsetWidth;
    blackout.classList.add("show");
    // 死机时，音频也停一拍
    ECHO.Audio.stopDrone();
    setTimeout(function () {
      blackout.classList.remove("show");
      setTimeout(function () { blackout.classList.add("hidden"); }, 160);
      if (!ECHO.Audio.isMuted()) ECHO.Audio.startDrone();
    }, holdMs || 1400);
  }

  /* ---------- HUD 被入侵：信号变成"有人在看" ---------- */
  function corruptHUD(ms) {
    const sig = document.getElementById("hud-signal");
    const left = document.querySelector(".hud-left");
    if (!sig) return;
    const orig = sig.textContent;
    sig.textContent = "SIGNAL - - - 有人在看";
    sig.classList.add("watching");
    if (left) left.classList.add("corrupted");
    setTimeout(function () {
      sig.textContent = orig;
      sig.classList.remove("watching");
      if (left) left.classList.remove("corrupted");
    }, ms || 4200);
  }

  /* ---------- 全屏镜像翻转 ---------- */
  function flipScreen(ms) {
    const crt = document.getElementById("crt");
    if (!crt) return;
    crt.classList.remove("flip");
    void crt.offsetWidth;
    crt.classList.add("flip");
    if (!ECHO.Audio.isMuted()) { try { ECHO.Audio.dread(); } catch (e) {} }
    setTimeout(function () { crt.classList.remove("flip"); }, ms || 1800);
  }

  /* ---------- 画面抽搐 ---------- */
  function seizure() {
    const crt = document.getElementById("crt");
    if (!crt) return;
    crt.classList.remove("seizure");
    void crt.offsetWidth;
    crt.classList.add("seizure");
    staticBurst(500);
    if (!ECHO.Audio.isMuted()) { try { ECHO.Audio.stinger(); } catch (e) {} }
    setTimeout(function () { crt.classList.remove("seizure"); }, 520);
  }

  /* ---------- 把某一行文字悄悄改掉（细思极恐） ---------- */
  function rewriteLine(el, newText) {
    if (!el) return;
    el.textContent = newText;
    el.classList.add("rewritten");
    setTimeout(function () { el.classList.remove("rewritten"); }, 1200);
  }

  /* ---------- 随机决定要不要吓一下（按强度） ---------- */
  function maybeScare() {
    const p = intensity / 100;
    const roll = Math.random();
    if (roll < 0.55 + p * 0.3) {
      minorScare();
    } else if (roll < 0.85 + p * 0.1) {
      mediumScare(randomWhisper());
    } else {
      ghostPass();
    }
  }

  /* ---------- 关键词触发的低语 ---------- */
  const WHISPERS = [
    "别回头。",
    "她就在你后面。",
    "你听见了吗？",
    "再看一眼那张照片。",
    "你不是一个人。",
    "它已经进来了。",
    "为什么你还坐着不动？",
    "关掉它。求你。",
    "它在学你打字。",
    "你的房间，也有海浪声吗？"
  ];

  function randomWhisper() {
    return WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
  }

  /* ---------- 启动 / 停止 ---------- */
  function start() {
    active = true;
    setIntensity(10);
    scheduleAmbient();
  }

  function stop() {
    active = false;
    if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; }
    stopHeartbeat();
    staticLayer.classList.remove("on");
    blood.classList.remove("pulse");
  }

  return {
    start, stop,
    bloodPulse, staticBurst, flashFace, whisper, startHeartbeat, stopHeartbeat,
    startVHS, stopVHS, setIntensity, getIntensity,
    minorScare, mediumScare, bigScare, randomWhisper,
    ghostPass, fakeSystemAlert, closeFakeAlert, flipScreen, seizure, rewriteLine, maybeScare,
    fakeCrash, corruptHUD,
    isActive: function () { return active; }
  };
})();
