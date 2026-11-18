/* story.js —— 剧情与章节数据（恐怖版）
   主线：25 年前的「回声计划」，与一个不该被听见的东西
   基调：不是怪兽吓人，是"它一直在听你"的那种不安
*/
window.ECHO = window.ECHO || {};

ECHO.STORY = [
  /* ============ 序章 ============ */
  {
    id: "prologue",
    no: "00",
    name: "匿名包裹",
    sub: "PACKAGE / 2019-12-07",
    horror: 0,
    lines: [
      { t: "2019 年 12 月 7 日，凌晨三点十四分。", cls: "sys" },
      { t: "你的门缝下，被塞进一个牛皮纸包裹。没有邮票，没有寄件人。", cls: "" },
      { t: "包裹是湿的。摸上去像刚从海水里捞出来。", cls: "creep" },
      { t: "可你的城市，离海有七百公里。", cls: "creep" },
      { t: "", cls: "sep" },
      { t: "里面有一块硬盘、一封信、一卷磁带，和一张被泡皱的照片。", cls: "" },
      { t: "硬盘贴着标签，上面只有一行手写的字：", cls: "dim" },
      { t: "「给愿意听的人。」", cls: "doc accent" },
      { t: "", cls: "sep" },
      { t: "你把硬盘接上电脑。屏幕亮起的一瞬间——", cls: "" },
      { t: "你听见了海浪声。", cls: "creep" },
      { t: "还有别的什么。很低，很轻，像是有人在很远的地方，念着你的名字。", cls: "creep-big" },
      { t: "", cls: "sep" },
      { t: "系统识别到一份加密档案：《回声计划 / ECHO PROJECT》。", cls: "sys" },
      { t: "档案共 5 层加密。解开全部，才能读到最后一页。", cls: "sys" },
      { t: "而最后一页，是一个已经死了 25 年的人，录给「你」的。", cls: "warn" },
      { t: "", cls: "sep" },
      { t: "你打开了第一份文件。", cls: "accent" },
      { t: "（戴上耳机。有些东西，只对愿意听的人说话。）", cls: "dim" }
    ],
    puzzle: null,
    autoNext: true,
    onEnter: function () {
      // 序章的低语开场
      ECHO.Horror.setIntensity(8);
    }
  },

  /* ============ 第 1 层 ============ */
  {
    id: "layer1",
    no: "01",
    name: "第一封信",
    sub: "LAYER 01 / CAESAR",
    horror: 14,
    lines: [
      { t: "第一个文件是一张扫描的信纸。纸边发黄，字迹工整得反常。", cls: "" },
      { t: "正文只有一行字母，像是被人故意打乱了。", cls: "sys" },
      { t: "", cls: "sep" },
      { t: "信纸左下角有一行更小的铅笔字：", cls: "dim" },
      { t: "「记住——往回退三步。这是晚姐教我的。」", cls: "doc amber" },
      { t: "", cls: "sep" },
      { t: "你把信纸翻过来，背面用指甲刻着一行几乎看不见的字：", cls: "dim" },
      { t: "「别解开它。趁你还能停下来。」", cls: "creep-big" }
    ],
    puzzle: "p1",
    onEnter: function () { ECHO.Horror.setIntensity(14); }
  },

  /* ============ 第 2 层 ============ */
  {
    id: "layer2",
    no: "02",
    name: "海面上的声音",
    sub: "LAYER 02 / MORSE",
    horror: 26,
    lines: [
      { t: "解开的字母拼成一句话：《海在倾听》。", cls: "accent" },
      { t: "你点开第二份文件。一段录音的转录稿，来自白鲸天文台的夜间值守频道。", cls: "" },
      { t: "1999 年 2 月 14 日，凌晨。值班员林晚记录下一段持续的脉冲。", cls: "sys" },
      { t: "转录稿上，那些脉冲被翻译成了点和划。", cls: "dim" },
      { t: "", cls: "sep" },
      { t: "脉冲的节奏很慢，很稳。像是某种东西，在有耐心地敲。", cls: "creep" },
      { t: "你戴上耳机，点开了播放。", cls: "" },
      { t: "第一个音落下的瞬间，你房间的灯，闪了一下。", cls: "creep-big" }
    ],
    puzzle: "p2",
    onEnter: function () {
      ECHO.Horror.setIntensity(26);
      ECHO.Horror.startVHS();
      // 进场时轻微血雾
      setTimeout(function () { ECHO.Horror.bloodPulse(0.35); }, 1200);
    }
  },

  /* ============ 第 3 层 ============ */
  {
    id: "layer3",
    no: "03",
    name: "三个研究员",
    sub: "LAYER 03 / TESTIMONY",
    horror: 44,
    lines: [
      { t: "点划拼出一个词：《ECHO》。回声。", cls: "accent" },
      { t: "第三份文件，是 1999 年 2 月 15 日的一份内部问询记录。", cls: "" },
      { t: "白鲸天文台的三名研究员，被问及是谁在深夜关闭了中继站。", cls: "sys" },
      { t: "记录末尾，调查员用红笔写着一行字：", cls: "dim" },
      { t: "「三个人里，只有一个人说了真话。」", cls: "doc warn" },
      { t: "", cls: "sep" },
      { t: "但档案里所有证词的下方，都有一行被强行划掉的批注：", cls: "dim" },
      { t: "「……被问询者共三人。现场发现四把椅子。」", cls: "creep-big" },
      { t: "", cls: "sep" },
      { t: "系统提示：请根据证词，指出是谁关掉了中继站。", cls: "sys" },
      { t: "（你数了三遍证词。确实只有三个人。）", cls: "dim" }
    ],
    puzzle: "p3",
    onEnter: function () {
      ECHO.Horror.setIntensity(44);
      document.body.classList.add("tense");
      // 进场中惊吓：椅子多了一把
      setTimeout(function () {
        ECHO.Horror.mediumScare("第四把椅子，是给谁留的？");
      }, 6200);
      // 讲"现场发现四把椅子"时，信号栏被入侵
      setTimeout(function () {
        ECHO.Horror.corruptHUD(5000);
      }, 15500);
      // 解谜前，来一次"假死机"
      setTimeout(function () {
        ECHO.Horror.fakeCrash("CONNECTION LOST … 请勿关闭", 1500);
      }, 30000);
    }
  },

  /* ============ 第 4 层 ============ */
  {
    id: "layer4",
    no: "04",
    name: "频谱里的星星",
    sub: "LAYER 04 / A1Z26",
    horror: 58,
    lines: [
      { t: "答案是 B。研究员周砚。", cls: "accent" },
      { t: "你还没按下回车，身后传来一声很轻的响动。像有人在挪动椅子。", cls: "creep" },
      { t: "你回过头。房间里什么都没有。", cls: "" },
      { t: "", cls: "sep" },
      { t: "第四份文件是一张频谱图。每一段信号的峰值频率旁，标着数字。", cls: "" },
      { t: "数字在 1 到 26 之间跳动。旁边有一句潦草的笔记：", cls: "dim" },
      { t: "「有人把字母，藏进了频率里。」", cls: "doc amber" },
      { t: "", cls: "sep" },
      { t: "你把这张频谱图放大。在那一排峰值的最右边，", cls: "dim" },
      { t: "还有一道很淡、很低、不属于任何一次脉冲的波形。", cls: "creep" },
      { t: "它只出现了一次。持续了 4 秒。", cls: "creep-big" }
    ],
    puzzle: "p4",
    onEnter: function () {
      ECHO.Horror.setIntensity(58);
      ECHO.Horror.startHeartbeat(60);
      setTimeout(function () { ECHO.Horror.stopHeartbeat(); }, 9000);
      setTimeout(function () { ECHO.Horror.minorScare(); }, 9000);
      // 讲到"身后的响动"时，鬼影真的飘过
      setTimeout(function () { ECHO.Horror.ghostPass(); }, 5600);
      // 画面抽搐一下，像信号出问题
      setTimeout(function () { ECHO.Horror.seizure(); }, 17500);
    }
  },

  /* ============ 第 5 层 ============ */
  {
    id: "layer5",
    no: "05",
    name: "照片背面",
    sub: "LAYER 05 / MIRROR",
    horror: 74,
    lines: [
      { t: "数字拼出一个词：《STARLIGHT》。星光。", cls: "accent" },
      { t: "第五份文件，是那个被海水泡皱的信封里唯一没烂的东西——", cls: "" },
      { t: "一张照片的背面。照片正面是白鲸天文台的穹顶，背面抄着一行字。", cls: "sys" },
      { t: "但字是反的。像是有人趴在一面镜子上写完的。", cls: "dim" },
      { t: "", cls: "sep" },
      { t: "你把屏幕翻过来，试着读它。", cls: "" },
      { t: "读到一半，你忽然意识到——", cls: "creep" },
      { t: "这张照片不是从外面拍的。", cls: "creep-big" },
      { t: "拍摄者站在穹顶里面，镜头对着镜子。", cls: "creep-big" },
      { t: "而镜子里，拍照的人身后，还站着一个人。", cls: "creep-big" },
      { t: "", cls: "sep" },
      { t: "那张脸被海水泡得看不清了。但你总觉得，在哪里见过。", cls: "warn" }
    ],
    puzzle: "p5",
    onEnter: function () {
      ECHO.Horror.setIntensity(74);
      document.body.classList.add("tense");
      ECHO.Horror.startHeartbeat(72);
      // 这层会真给一下大的
      setTimeout(function () {
        ECHO.Horror.bigScare();
      }, 14000);
      // 讲到"镜子里还站着一个人"时，整块屏幕真的翻转过来
      setTimeout(function () {
        ECHO.Horror.flipScreen(1800);
      }, 9200);
      // 解谜时，鬼影从角落飘过
      setTimeout(function () {
        ECHO.Horror.ghostPass();
      }, 26000);
    }
  },

  /* ============ 终章 ============ */
  {
    id: "finale",
    no: "06",
    name: "回声室",
    sub: "FINAL / THE ECHO CHAMBER",
    horror: 90,
    lines: [
      { t: "镜像翻转后，那行字是：", cls: "dim" },
      { t: "「YOU ARE NOT ALONE.」——你并不孤单。", cls: "doc accent" },
      { t: "", cls: "sep" },
      { t: "最后一层加密，没有文件。只有一扇门。", cls: "sys" },
      { t: "门上嵌着六个凹槽，正好是你一路收集来的六个字符。", cls: "" },
      { t: "系统弹出提示：", cls: "sys" },
      { t: "「输入六个字符组成的最终指令。」", cls: "doc amber" },
      { t: "", cls: "sep" },
      { t: "你输入指纹，按下确认。门开了。", cls: "" },
      { t: "门后不是房间。是一片海。", cls: "creep-big" },
      { t: "海浪声从屏幕里涌出来，灌满你的房间。", cls: "creep" },
      { t: "然后，你听见了那个声音。", cls: "creep-big" }
    ],
    puzzle: "p6",
    onEnter: function () {
      ECHO.Horror.setIntensity(90);
      document.body.classList.add("tense");
      ECHO.Horror.startHeartbeat(88);
      // 终章进场：先给一次在场感
      setTimeout(function () {
        ECHO.Horror.whisper("它已经进来了。", { cls: "dark", duration: 3000 });
      }, 5000);
      // 伪系统警告：你的身份
      setTimeout(function () {
        ECHO.Horror.fakeSystemAlert(
          "SYSTEM ALERT",
          "检测到本机存在 2 个活跃会话。\n其中一个不是由你发起的。\n是否结束？",
          5200
        );
      }, 12000);
      // 画面抽搐
      setTimeout(function () { ECHO.Horror.seizure(); }, 21000);
      // 鬼影
      setTimeout(function () { ECHO.Horror.ghostPass(); }, 28000);
    }
  }
];
