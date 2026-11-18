/* state.js —— 存档与游戏状态 */
window.ECHO = window.ECHO || {};

ECHO.State = (function () {
  const SAVE_KEY = "echo_archive_save_v1";

  const defaultState = {
    chapter: 0,            // 当前章节索引
    phase: "boot",         // boot | story | puzzle | ending
    keys: [],              // 已获得的钥匙字符
    solved: {},            // { puzzleId: true }
    muted: false,
    seenIntro: false,
    startedAt: 0
  };

  let state = JSON.parse(JSON.stringify(defaultState));

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(JSON.parse(JSON.stringify(defaultState)), parsed);
      }
    } catch (e) {
      state = JSON.parse(JSON.stringify(defaultState));
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) { /* 忽略配额错误 */ }
  }

  function reset() {
    state = JSON.parse(JSON.stringify(defaultState));
    state.startedAt = Date.now();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    save();
    return state;
  }

  function get() { return state; }

  function set(patch) {
    Object.assign(state, patch);
    save();
    return state;
  }

  function addKey(k) {
    if (!state.keys.includes(k)) {
      state.keys.push(k);
      save();
    }
  }

  function markSolved(id) {
    state.solved[id] = true;
    save();
  }

  return { load, save, reset, get, set, addKey, markSolved };
})();
