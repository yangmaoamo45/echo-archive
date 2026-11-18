/* engine.js —— 游戏引擎：章节推进 / 谜题校验 / 存档 */
window.ECHO = window.ECHO || {};

ECHO.Engine = (function () {
  const output = document.getElementById("output");
  const keydots = document.getElementById("keydots");

  let currentChapter = 0;
  let awaitingAnswer = false;
  let attempts = 0;

  /* ---------- 工具 ---------- */
  function norm(s) {
    return String(s)
      .toUpperCase()
      .replace(/[\s\.\,\!\?\'"“”‘’·、。，！？；：\-—_]/g, "");
  }

  function el(cls, text) {
    const d = document.createElement("div");
    d.className = "line " + (cls || "");
    if (text != null) d.textContent = text;
    output.appendChild(d);
    output.scrollTop = output.scrollHeight;
    return d;
  }

  function clear() {
    output.innerHTML = "";
  }

  function scrollBottom() {
    output.scrollTop = output.scrollHeight;
  }

  /* ---------- 钥匙点 ---------- */
  function renderKeydots() {
    const keys = ECHO.State.get().keys;
    keydots.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const d = document.createElement("div");
      d.className = "key-dot" + (i < keys.length ? " on" : "");
      keydots.appendChild(d);
    }
  }

  /* ---------- 章节标题 ---------- */
  function renderChapterTitle(ch) {
    const wrap = document.createElement("div");
    wrap.className = "chapter-title fade-in";
    wrap.innerHTML =
      '<span class="ct-no">CHAPTER ' + ch.no + "</span>" +
      '<span class="ct-name">' + ch.name + "</span>" +
      '<span class="ct-sub">' + ch.sub + "</span>";
    output.appendChild(wrap);
    scrollBottom();
  }

  /* ---------- 逐行播放剧情 ---------- */
  function playLines(lines, done) {
    let i = 0;
    function next() {
      if (i >= lines.length) { if (done) done(); return; }
      const ln = lines[i++];
      if (ln.t === "") {
        el(ln.cls || "sep", "");
        setTimeout(next, 120);
        return;
      }
      const speed = ln.cls && ln.cls.indexOf("dim") >= 0 ? 12 : 20;
      ECHO.Typewriter.type(output, ln.t, {
        cls: ln.cls,
        speed: speed,
        onDone: function () {
          setTimeout(next, 90);
        }
      });
    }
    next();
  }

  /* ---------- 谜题渲染 ---------- */
  let puzzleScareTimer = null;
  let puzzleAlertTimer = null;

  function clearPuzzleTimers() {
    if (puzzleScareTimer) { clearTimeout(puzzleScareTimer); puzzleScareTimer = null; }
    if (puzzleAlertTimer) { clearTimeout(puzzleAlertTimer); puzzleAlertTimer = null; }
  }

  function renderPuzzle(pz) {
    el("head", "── " + pz.name + " ──");
    const wrap = document.createElement("div");
    wrap.className = "fade-in";
    wrap.style.margin = "6px 0 4px";
    if (pz.build) pz.build(wrap);
    output.appendChild(wrap);
    scrollBottom();

    el("sys", pz.prompt);

    awaitingAnswer = true;
    attempts = 0;
    ECHO.Input.setHandler(function (value) { submitAnswer(pz, value); });
    ECHO.Input.show("在此输入答案，回车确认…");

    // 玩家思考时，偶尔来点"不该有的动静"
    clearPuzzleTimers();
    const delay = 11000 + Math.random() * 9000;
    puzzleScareTimer = setTimeout(function () {
      if (attempts === 0) {
        ECHO.Horror.ghostPass();
      }
    }, delay);

    // 后面几层会弹伪系统警告
    const idx = ECHO.STORY.findIndex(function (c) { return c.puzzle === pz.id; });
    if (idx >= 3) {
      puzzleAlertTimer = setTimeout(function () {
        ECHO.Horror.fakeSystemAlert(
          "SYSTEM ALERT",
          "检测到第二个输入源。\n来源：本机键盘。\n操作者：未知。",
          4600
        );
      }, 7000 + Math.random() * 4000);
    }
  }

  /* ---------- 提交答案 ---------- */
  function submitAnswer(pz, value) {
    ECHO.Input.hide();
    awaitingAnswer = false;

    const ok = pz.accept.some(function (a) { return norm(a) === norm(value); });

    if (ok) {
      onSolved(pz);
    } else {
      attempts++;
      ECHO.Audio.error();
      ECHO.Effects.flashRed(output);
      ECHO.Effects.shake(output);
      const wrong = el("warn err-shake", "✗ 无响应。");

      // 恐怖钩子：答错时的惊吓
      if (pz.onWrong) {
        try { pz.onWrong(attempts); } catch (e) {}
      }

      if (attempts === 1) {
        el("dim", "（不匹配。再想想。）");
      } else if (attempts === 2) {
        el("dim", "提示：" + pz.hint);
      } else {
        el("dim", "再提示：" + pz.hint);
        el("dim", "输入「提示」可以再看一遍，或直接再试一次。");
      }

      // 允许重试
      awaitingAnswer = true;
      ECHO.Input.setHandler(function (v) {
        if (norm(v) === "提示" || norm(v) === "HINT") {
          el("dim", "提示：" + pz.hint);
          ECHO.Input.show("在此输入答案，回车确认…");
          return;
        }
        submitAnswer(pz, v);
      });
      ECHO.Input.show("再试一次…（输入「提示」获取帮助）");
      setTimeout(scrollBottom, 60);
    }
  }

  /* ---------- 解出谜题 ---------- */
  function onSolved(pz) {
    clearPuzzleTimers();
    ECHO.Audio.success();
    ECHO.Effects.flashFragment(pz.key);

    ECHO.State.markSolved(pz.id);
    ECHO.State.addKey(pz.key);
    renderKeydots();

    // 谜题自定义解出钩子（比如解出后多一声不该有的响动）
    if (pz.onSolvedHook) {
      try { pz.onSolvedHook(); } catch (e) {}
    }

    setTimeout(function () {
      el("accent", "✓ 解密成功。");
      el("dim", "一枚钥匙字符浮现在屏幕上：【" + pz.key + "】");
      ECHO.Audio.key();
      setTimeout(function () {
        el("sep", "");
        advanceChapter();
      }, 900);
    }, 420);
  }

  /* ---------- 推进章节 ---------- */
  function advanceChapter() {
    currentChapter++;
    ECHO.State.set({ chapter: currentChapter });
    const ch = ECHO.STORY[currentChapter];
    if (!ch) { showEnding(); return; }
    startChapter(ch);
  }

  /* ---------- 开始章节 ---------- */
  function startChapter(ch) {
    el("sep", "");
    renderChapterTitle(ch);

    // 章节进场钩子：调恐怖强度、启动心跳/BGM/惊吓
    if (ch.onEnter) {
      try { ch.onEnter(); } catch (e) {}
    }
    if (ch.horror != null) {
      ECHO.Horror.setIntensity(ch.horror);
    }

    playLines(ch.lines, function () {
      if (ch.puzzle && ECHO.PUZZLES[ch.puzzle]) {
        const pz = ECHO.PUZZLES[ch.puzzle];
        // 如果已解过则跳过（存档兼容）
        if (ECHO.State.get().solved[pz.id]) {
          el("dim", "（此层已解密。）");
          setTimeout(advanceChapter, 600);
          return;
        }
        setTimeout(function () { renderPuzzle(pz); }, 300);
      } else {
        setTimeout(advanceChapter, 700);
      }
    });
  }

  /* ---------- 结局（恐怖版） ---------- */
  function showEnding() {
    clear();
    ECHO.Input.hide();
    ECHO.State.set({ phase: "ending" });
    ECHO.Audio.stopDrone();
    ECHO.Horror.setIntensity(100);
    ECHO.Horror.startHeartbeat(92);
    document.body.classList.add("tense");

    const cl = document.createElement("div");
    cl.className = "chapter-title fade-in";
    cl.innerHTML =
      '<span class="ct-no">EPILOGUE</span>' +
      '<span class="ct-name">回声室</span>' +
      '<span class="ct-sub">THE ECHO CHAMBER</span>';
    output.appendChild(cl);

    const ending = [
      { t: "门开了。", cls: "accent" },
      { t: "", cls: "sep" },
      { t: "不是房间。是一片黑。很深、很冷、很咸的黑。", cls: "creep" },
      { t: "然后你听见了海浪声——可它不在屏幕里。", cls: "creep" },
      { t: "它在你身后，在你床底，在你头顶的天花板里。", cls: "creep-big" },
      { t: "", cls: "sep" },
      { t: "有人在你耳边开口了。", cls: "creep" },
      { t: "声音很轻，很旧，像是录坏了的磁带。", cls: "dim" },
      { t: "「你终于来了。」", cls: "doc warn" },
      { t: "「我等了你二十五年。」", cls: "doc warn" },
      { t: "", cls: "sep" },
      { t: "「每一个来听的人，最后都成了回声的一部分。」", cls: "doc" },
      { t: "「你也一样。」", cls: "doc warn" },
      { t: "", cls: "sep" },
      { t: "你想关掉电脑。手抬到一半，停住了。", cls: "creep" },
      { t: "因为屏幕的倒影里，", cls: "dim" },
      { t: "你身后，站着一个人。", cls: "creep-big" },
      { t: "", cls: "sep" },
      { t: "而你的手，正按在键盘上，一个字一个字地，替它输入——", cls: "creep" },
      { t: "L    I    S    T    E    N", cls: "creep-big" },
      { t: "", cls: "sep" },
      { t: "《回声档案》 · 完", cls: "warn center big" },
      { t: "", cls: "sep" },
      { t: "（屏幕黑了。但你真的关掉它了吗？）", cls: "dim" }
    ];

    playLines(ending, function () {
      // 结尾的最后一击：闪脸 + 全黑
      ECHO.Horror.bigScare();
      setTimeout(function () {
        ECHO.Horror.flashFace({ duration: 900 });
      }, 1400);

      // 假死机 → 逼真的"结束"
      setTimeout(function () {
        ECHO.Horror.fakeCrash("SIGNAL TERMINATED", 2600);
      }, 3200);

      // 玩家以为结束了，屏幕黑着的时候，再来一句耳语
      setTimeout(function () {
        ECHO.Horror.whisper("你还在吗？", { cls: "dark", duration: 4000 });
      }, 6200);

      setTimeout(function () {
        const actions = document.getElementById("actions");
        actions.classList.remove("hidden");
        actions.innerHTML = "";
        const btn = document.createElement("button");
        btn.className = "act-btn";
        btn.textContent = "↺ 再来一次（它还在听）";
        btn.addEventListener("click", function () {
          ECHO.State.reset();
          location.reload();
        });
        actions.appendChild(btn);
      }, 9000);
    });
  }

  /* ---------- 开场 boot ---------- */
  function boot() {
    ECHO.Effects.bootScan();
    const bootLines = [
      "ECHO ARCHIVE v2.5  —  OFFLINE TERMINAL",
      "正在挂载外部磁盘 …  OK",
      "读取加密档案 …  ECHO_PROJECT.bin",
      "────────────────────────────",
      "警告：检测到 5 层加密 / 1 道最终指令锁",
      "警告：磁盘存在异常写入。来源不明。",
      "────────────────────────────",
      "建议连接音频设备。有些东西，只对愿意听的人说话。",
      "────────────────────────────"
    ];
    let i = 0;
    function step() {
      if (i >= bootLines.length) {
        // 开机结束：一次极轻的静电 + 启动恐怖系统
        ECHO.Horror.start();
        setTimeout(function () {
          ECHO.Horror.staticBurst(160);
          ECHO.Horror.whisper("……你打开了。", { duration: 2000 });
        }, 400);
        setTimeout(startFromState, 1800);
        return;
      }
      const line = bootLines[i++];
      el(line.indexOf("警告") === 0 ? "warn" : "sys", line);
      setTimeout(step, line.indexOf("─") >= 0 ? 120 : 340);
    }
    step();
  }

  /* ---------- 根据存档恢复 ---------- */
  function startFromState() {
    const st = ECHO.State.get();
    renderKeydots();
    currentChapter = Math.min(st.chapter || 0, ECHO.STORY.length - 1);
    const ch = ECHO.STORY[currentChapter];

    if (st.phase === "ending") { showEnding(); return; }

    // 若中途存档有进度，给个提示
    if (currentChapter > 0 || st.keys.length > 0) {
      el("dim", "检测到中途存档。已恢复至第 " + (currentChapter + 1) + " 章。");
    }
    startChapter(ch);
  }

  function start() {
    ECHO.Input.init();
    renderKeydots();

    // 首个交互时启动音频（浏览器策略）
    document.addEventListener("pointerdown", function once() {
      ECHO.Audio.ensure();
      ECHO.Audio.resume();
      if (!ECHO.State.get().muted) ECHO.Audio.startDrone();
      document.removeEventListener("pointerdown", once);
    });

    // 声音开关
    const btnSound = document.getElementById("btn-sound");
    btnSound.addEventListener("click", function () {
      const muted = !ECHO.Audio.isMuted();
      ECHO.Audio.setMuted(muted);
      ECHO.State.set({ muted: muted });
      btnSound.classList.toggle("muted", muted);
      btnSound.textContent = muted ? "×" : "♪";
      if (!muted) ECHO.Audio.startDrone(); else ECHO.Audio.stopDrone();
    });
    if (ECHO.State.get().muted) {
      ECHO.Audio.setMuted(true);
      btnSound.classList.add("muted");
      btnSound.textContent = "×";
    }

    // 重置
    document.getElementById("btn-reset").addEventListener("click", function () {
      if (confirm("确定要清除进度，从头开始吗？")) {
        ECHO.State.reset();
        location.reload();
      }
    });

    // 点击空白跳过打字
    output.addEventListener("click", function () {
      ECHO.Typewriter.skipAll();
    });

    boot();
  }

  return { start, el, clear };
})();
