/* puzzles.js —— 六道谜题数据与渲染（恐怖版）
   钥匙字符按顺序收集：L I S T E N → 终章答案 LISTEN
   每个谜题可带 scares: 在解谜过程中的惊吓钩子
*/
window.ECHO = window.ECHO || {};

ECHO.PUZZLES = {

  /* ============ 第一层：凯撒密码 ============ */
  p1: {
    id: "p1",
    name: "第一封信 / 凯撒位移",
    key: "L",
    prompt: "请输入解密后的那句话（英文，空格可有可无）：",
    hint: "「往回退三步」——每个字母在字母表上往前数三个。W 往前三步是 T。",
    accept: ["THESEAISLISTENING", "THESEAISLISTEN", "海在倾听"],
    onWrong: function (attempts) {
      if (attempts === 2) {
        // 第三次错时，屏幕抖一下
        ECHO.Horror.minorScare();
        ECHO.Horror.whisper("它在等你写对。", { duration: 2200 });
      }
    },
    build: function (wrap) {
      const box = document.createElement("div");
      box.className = "fs-out";
      box.style.textAlign = "center";
      box.innerHTML =
        '<span class="k" style="font-size:20px;letter-spacing:6px;display:block;padding:8px 0;">' +
        "WKH VHD LV OLVWHQLQJ" +
        "</span>" +
        '<span style="font-size:11px;letter-spacing:.2em;color:var(--ink-faint);">ENCRYPTED TEXT · 位移不明</span>';
      wrap.appendChild(box);

      const note = document.createElement("div");
      note.className = "line dim";
      note.style.marginTop = "10px";
      note.textContent = "铅笔小字：往回退三步。";
      wrap.appendChild(note);

      const creep = document.createElement("div");
      creep.className = "line creep";
      creep.style.marginTop = "8px";
      creep.style.opacity = ".55";
      creep.textContent = "（信纸背面，有一行几乎看不见的字：别解开它。）";
      wrap.appendChild(creep);
    }
  },

  /* ============ 第二层：摩斯电码 ============ */
  p2: {
    id: "p2",
    name: "海面上的声音 / 摩斯",
    key: "I",
    prompt: "这些点划拼出了一个词（英文）：",
    hint: "点 = 短音，划 = 长音。四个字母：第一个是 E（一个点），最后是 O（三个划）。",
    accept: ["ECHO", "回声"],
    onWrong: function (attempts) {
      if (attempts >= 2) {
        ECHO.Horror.minorScare();
      }
    },
    onSolvedHook: function () {
      // 解开后，多响一下不属于摩斯的声音
      setTimeout(function () {
        ECHO.Horror.whisper("……不是我发的。", { cls: "dark", duration: 2600 });
      }, 900);
    },
    build: function (wrap) {
      const morse = [".", "-.-.", "....", "---"];

      const box = document.createElement("div");
      box.className = "fs-out";
      box.style.textAlign = "center";
      const m = document.createElement("div");
      m.className = "morse-str";
      m.textContent = morse.join("  /  ");
      box.appendChild(m);
      wrap.appendChild(box);

      const btnRow = document.createElement("div");
      btnRow.style.marginTop = "4px";
      const btn = document.createElement("button");
      btn.className = "act-btn";
      btn.textContent = "▶ 播放脉冲";
      let played = 0;
      btn.addEventListener("click", function () {
        playMorse(morse, btn);
        played++;
        // 第二次播放时，会多出一个不该存在的音
        if (played >= 2) {
          setTimeout(function () {
            ECHO.Horror.minorScare();
          }, 2600);
        }
      });
      btnRow.appendChild(btn);
      wrap.appendChild(btnRow);

      const legend = document.createElement("div");
      legend.className = "line dim";
      legend.style.marginTop = "12px";
      legend.textContent = "参考：A .-  E .  H ....  C -.-.  O ---  S ...  I ..";
      wrap.appendChild(legend);
    }
  },

  /* ============ 第三层：逻辑推理 ============ */
  p3: {
    id: "p3",
    name: "三个研究员 / 证词",
    key: "S",
    prompt: "是谁关掉了中继站？输入姓名或代号（A/B/C 或 陈默/周砚/苏禾）：",
    hint: "假设每个人分别是肇事者，检验「只有一个人说真话」是否成立。只有一个人能让条件成立。",
    accept: ["C", "苏禾", "丙", "SUHE"],
    onWrong: function (attempts) {
      if (attempts >= 1) {
        ECHO.Horror.minorScare();
      }
      if (attempts === 3) {
        ECHO.Horror.mediumScare("有人在你身后看你选。");
      }
    },
    build: function (wrap) {
      const table = document.createElement("table");
      table.className = "logic-table";
      table.innerHTML =
        "<tr><th>研究员</th><th>证词</th></tr>" +
        '<tr><td>陈默（A）</td><td>「周砚是清白的。」</td></tr>' +
        '<tr><td>周砚（B）</td><td>「陈默在说谎。」</td></tr>' +
        '<tr><td>苏禾（C）</td><td>「不是我关的。」</td></tr>';
      wrap.appendChild(table);

      const note = document.createElement("div");
      note.className = "line dim";
      note.style.marginTop = "10px";
      note.textContent = "红笔批注：三个人里，只有一个人说了真话。";
      wrap.appendChild(note);

      const creep = document.createElement("div");
      creep.className = "line creep-big";
      creep.style.marginTop = "8px";
      creep.textContent = "（可记录里，现场有四把椅子。）";
      wrap.appendChild(creep);
    }
  },

  /* ============ 第四层：A1Z26 ============ */
  p4: {
    id: "p4",
    name: "频谱里的星星 / A1Z26",
    key: "T",
    prompt: "一串数字拼出一个词（英文）：",
    hint: "A=1, B=2, C=3 … Z=26。19=S，20=T，1=A。",
    accept: ["STARLIGHT", "星光"],
    onWrong: function (attempts) {
      if (attempts >= 2) ECHO.Horror.minorScare();
    },
    build: function (wrap) {
      const nums = [19, 20, 1, 18, 12, 9, 7, 8, 20];
      const box = document.createElement("div");
      box.className = "coord-box";
      box.style.textAlign = "center";
      box.style.fontSize = "20px";
      box.style.letterSpacing = "6px";
      box.innerHTML = '<span class="hl">' + nums.join(" ") + "</span>";
      wrap.appendChild(box);

      const note = document.createElement("div");
      note.className = "line dim";
      note.style.marginTop = "8px";
      note.textContent = "峰值频率（单位：格）：19 / 20 / 1 / 18 / 12 / 9 / 7 / 8 / 20";
      wrap.appendChild(note);

      const creep = document.createElement("div");
      creep.className = "line creep";
      creep.style.marginTop = "8px";
      creep.style.opacity = ".6";
      creep.textContent = "（频谱最右侧，还有一道很淡的波形。只持续了 4 秒。）";
      wrap.appendChild(creep);
    }
  },

  /* ============ 第五层：镜像 ============ */
  p5: {
    id: "p5",
    name: "照片背面 / 镜像",
    key: "E",
    prompt: "把字反转过来，它说的是（英文，空格可有可无）：",
    hint: "从最后一个字母开始倒着读。ENOLA → ALONE。",
    accept: ["YOUARENOTALONE", "你并不孤单"],
    onWrong: function (attempts) {
      if (attempts >= 1) ECHO.Horror.minorScare();
      if (attempts === 3) ECHO.Horror.mediumScare("再看仔细一点。");
    },
    build: function (wrap) {
      const box = document.createElement("div");
      box.className = "fs-out";
      box.style.textAlign = "center";
      box.style.fontSize = "22px";
      box.style.letterSpacing = "5px";
      box.style.transform = "scaleX(-1)";
      box.style.display = "inline-block";
      box.textContent = "ENOLA TON ERA UOY";

      const holder = document.createElement("div");
      holder.style.textAlign = "center";
      holder.appendChild(box);
      wrap.appendChild(holder);

      const tip = document.createElement("div");
      tip.className = "line dim";
      tip.style.marginTop = "14px";
      tip.style.textAlign = "center";
      tip.textContent = "（试着把屏幕、或你自己的头，转过来。）";
      wrap.appendChild(tip);

      const creep = document.createElement("div");
      creep.className = "line creep";
      creep.style.marginTop = "10px";
      creep.style.textAlign = "center";
      creep.style.opacity = ".55";
      creep.textContent = "（照片是站在穹顶里、对着镜子拍的。镜子里，拍照的人身后还站着一个人。）";
      wrap.appendChild(creep);
    }
  },

  /* ============ 终章：最终指令 ============ */
  p6: {
    id: "p6",
    name: "回声室 / 最终指令",
    key: "N",
    prompt: "输入六个字符组成的最终指令（大写英文）：",
    hint: "你一路收集的六个钥匙字符，按顺序拼起来就是那个词。它一直在你耳边。",
    accept: ["LISTEN", "倾听"],
    onWrong: function (attempts) {
      if (attempts >= 1) ECHO.Horror.minorScare();
    },
    build: function (wrap) {
      const keys = ["L", "I", "S", "T", "E", "_"];
      const holder = document.createElement("div");
      holder.className = "code-cells";
      holder.style.justifyContent = "center";
      keys.forEach(function (k) {
        const c = document.createElement("div");
        c.className = "code-cell " + (k === "_" ? "" : "filled");
        c.textContent = k === "_" ? "?" : k;
        holder.appendChild(c);
      });
      wrap.appendChild(holder);

      const note = document.createElement("div");
      note.className = "line dim";
      note.style.marginTop = "10px";
      note.style.textAlign = "center";
      note.textContent = "六个凹槽，只差最后一个字。";
      wrap.appendChild(note);

      const creep = document.createElement("div");
      creep.className = "line creep-big";
      creep.style.marginTop = "10px";
      creep.style.textAlign = "center";
      creep.textContent = "门后是海。海在等一个愿意听的人。";
      wrap.appendChild(creep);
    }
  }
};

/* 播放摩斯电码 */
function playMorse(groups, btn) {
  const origin = btn.textContent;
  btn.disabled = true;
  btn.textContent = "● 播放中…";
  let t = 0;
  groups.forEach(function (group) {
    group.split("").forEach(function (sym) {
      const isLong = sym === "-";
      const dur = isLong ? 300 : 110;
      setTimeout(function () { ECHO.Audio.beep(isLong); }, t * 1000);
      t += (dur + 90) / 1000;
    });
    t += 0.35; // 字母间隔
  });
  setTimeout(function () {
    btn.disabled = false;
    btn.textContent = origin;
  }, t * 1000 + 200);
}
