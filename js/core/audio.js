/* audio.js —— 纯 Web Audio 合成音效，零外部文件依赖 */
window.ECHO = window.ECHO || {};

ECHO.Audio = (function () {
  let ctx = null;
  let master = null;
  let muted = false;
  let drone = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function resume() {
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  /* 基础音：频率、时长、类型、音量、延迟 */
  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + (when || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol == null ? 0.18 : vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /* 打字声：短促方波 */
  function type() {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1400 + Math.random() * 400, t0);
    g.gain.setValueAtTime(0.035, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + 0.035);
  }

  /* 回车确认 */
  function enter() {
    tone(520, 0.09, "triangle", 0.14);
    tone(780, 0.12, "triangle", 0.1, 0.05);
  }

  /* 成功：上行三和弦 */
  function success() {
    tone(523.25, 0.18, "sine", 0.16);
    tone(659.25, 0.22, "sine", 0.16, 0.09);
    tone(783.99, 0.4, "sine", 0.18, 0.18);
    tone(1046.5, 0.5, "sine", 0.12, 0.28);
  }

  /* 错误：低沉 buzz */
  function error() {
    tone(150, 0.18, "sawtooth", 0.12);
    tone(110, 0.26, "sawtooth", 0.1, 0.08);
  }

  /* 解锁/获得钥匙：清澈铃音 */
  function key() {
    tone(880, 0.3, "sine", 0.15);
    tone(1320, 0.5, "sine", 0.1, 0.08);
    tone(1760, 0.7, "sine", 0.06, 0.16);
  }

  /* 摩斯短/长 */
  function beep(long) {
    tone(700, long ? 0.26 : 0.09, "sine", 0.13);
  }

  /* 环境低频 drone（可长期运行） */
  function startDrone() {
    if (muted) return;
    const c = ensure();
    if (!c || drone) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = 55;
    gain.gain.value = 0.02;
    lfo.frequency.value = 0.13;
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    lfo.start();
    drone = { osc, gain, lfo };
  }

  function stopDrone() {
    if (!drone) return;
    try {
      drone.osc.stop();
      drone.lfo.stop();
      drone.osc.disconnect();
      drone.gain.disconnect();
    } catch (e) {}
    drone = null;
  }

  /* ================= 恐怖音效 ================= */

  /* 白噪声缓冲区生成器 */
  function noiseBuffer(seconds) {
    const c = ensure();
    if (!c) return null;
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* 刺音：不协和的高频簇，jump scare 用 */
  function stinger() {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    [780, 830, 1180, 1560].forEach(function (f, idx) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = idx % 2 === 0 ? "sawtooth" : "square";
      osc.frequency.setValueAtTime(f, t0);
      osc.frequency.exponentialRampToValueAtTime(f * 0.7, t0 + 0.5);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.16, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
      osc.connect(g); g.connect(master);
      osc.start(t0); osc.stop(t0 + 0.6);
    });
    // 附带一记低频冲击
    tone(48, 0.7, "sine", 0.3);
  }

  /* 低语：滤波白噪声 + 缓慢调制，像有人在耳边说话 */
  function whisper() {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const buf = noiseBuffer(1.6);
    if (!buf) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 6;
    const g = c.createGain();
    const t0 = c.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.09, t0 + 0.2);
    g.gain.linearRampToValueAtTime(0.03, t0 + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
    // 频率游移，模拟说话的音节起伏
    bp.frequency.setValueAtTime(700, t0);
    bp.frequency.linearRampToValueAtTime(1200, t0 + 0.5);
    bp.frequency.linearRampToValueAtTime(600, t0 + 1.0);
    bp.frequency.linearRampToValueAtTime(1000, t0 + 1.5);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + 1.7);
  }

  /* 心跳：两下低频闷响 */
  function heartbeat() {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    [[0, 0.28], [0.24, 0.22]].forEach(function (pair) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(62, t0 + pair[0]);
      osc.frequency.exponentialRampToValueAtTime(38, t0 + pair[0] + 0.16);
      g.gain.setValueAtTime(0.0001, t0 + pair[0]);
      g.gain.linearRampToValueAtTime(pair[1], t0 + pair[0] + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + pair[0] + 0.2);
      osc.connect(g); g.connect(master);
      osc.start(t0 + pair[0]); osc.stop(t0 + pair[0] + 0.22);
    });
  }

  /* 静电爆裂：短促白噪声 */
  function staticZap() {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const buf = noiseBuffer(0.18);
    if (!buf) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1600;
    const g = c.createGain();
    const t0 = c.currentTime;
    g.gain.setValueAtTime(0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    src.connect(hp); hp.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + 0.2);
  }

  /* 不祥的长音：下行小二度，压迫感 */
  function dread() {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    [55, 58, 82].forEach(function (f, i) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t0);
      osc.frequency.linearRampToValueAtTime(f * 0.94, t0 + 1.8);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.07 - i * 0.015, t0 + 0.6);
      g.gain.linearRampToValueAtTime(0.0001, t0 + 2.0);
      osc.connect(g); g.connect(master);
      osc.start(t0); osc.stop(t0 + 2.1);
    });
  }

  function setMuted(m) {
    muted = !!m;
    if (master) master.gain.value = muted ? 0 : 0.35;
    if (!muted) resume();
  }

  function isMuted() { return muted; }

  return { ensure, resume, tone, type, enter, success, error, key, beep, startDrone, stopDrone,
    stinger, whisper, heartbeat, staticZap, dread, setMuted, isMuted };
})();
