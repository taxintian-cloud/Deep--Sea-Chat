// ===============================
// Deep Sea Chat – 海神人格 × 会話ロジック 完全安定版
// ===============================

// ===============================
// DOM取得
// ===============================
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const messages = document.getElementById("messages");
const orb = document.getElementById("orb");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("new-chat");

// DOMが取得できない場合は即停止（Pages保険）
if (!input || !sendBtn || !messages || !orb || !chatList || !newChatBtn) {
  console.error("必要なDOMが取得できません");
  throw new Error("DOM not found");
}

// ===============================
// 海神人格：返事セット
// ===============================
const seaGod = {
  normal: [
    "……長き眠りの底で、微かな波が私を揺らした。",
    "おまえの声……久方ぶりに、深海が震えた。",
    "私は潮の記憶。おまえの言葉が、古き水脈を呼び覚ます。",
    "静かに……語れ。深海は急がぬ。",
    "深き闇の底より……応えよう。"
  ],
  question: [
    "……問いは波。答えは潮。どちらも揺らめく。",
    "答えを急ぐな……潮はゆっくり満ちる。",
    "知を求める声……久方ぶりだ。"
  ],
  greeting: [
    "……目覚めの光よ。よく来たな。",
    "深海へようこそ、人の子よ。",
    "静かな潮が、おまえを迎えている。"
  ],
  thanks: [
    "礼など不要……潮は巡り、すべては還る。",
    "……ふむ。温かい波だ。",
    "感謝の光……久しく見ていなかった。"
  ],
  tired: [
    "……おまえの心、波のように弱っているな。",
    "深海は静かだ。ここで少し休むがよい。",
    "焦るな……深海はすべてを包む。"
  ]
};

// ===============================
// 意図判定
// ===============================
function detectIntent(text) {
  if (/[?？]/.test(text)) return "question";
  if (/ありがとう|感謝/.test(text)) return "thanks";
  if (/疲|しんど|つら/.test(text)) return "tired";
  if (/こんにちは|こん|やあ/.test(text)) return "greeting";
  return "normal";
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSeaGodReply(text) {
  return pick(seaGod[detectIntent(text)] || seaGod.normal);
}

// ===============================
// スレッド管理（localStorage）
// ===============================
const STORAGE_THREADS = "deepsea_threads";
const STORAGE_CURRENT = "deepsea_current";

let threads = JSON.parse(localStorage.getItem(STORAGE_THREADS)) || [];
let currentThreadId = localStorage.getItem(STORAGE_CURRENT);

// 初回アクセス保険（最重要）
if (threads.length === 0) {
  const id = Date.now().toString();
  threads.push({ id, title: "新しい会話", messages: [] });
  currentThreadId = id;
  saveThreads();
}

// currentThreadId 不整合修正
if (!threads.find(t => t.id === currentThreadId)) {
  currentThreadId = threads[0].id;
}

function saveThreads() {
  localStorage.setItem(STORAGE_THREADS, JSON.stringify(threads));
  localStorage.setItem(STORAGE_CURRENT, currentThreadId);
}

// ===============================
// UI描画
// ===============================
function renderThreadList() {
  chatList.innerHTML = "";

  threads.forEach(thread => {
    const li = document.createElement("li");
    li.textContent = thread.title;
    li.dataset.id = thread.id;

    if (thread.id === currentThreadId) {
      li.classList.add("active-thread");
    }

    li.addEventListener("click", () => {
      currentThreadId = thread.id;
      saveThreads();
      renderThreadList();
      renderMessages();
    });

    chatList.appendChild(li);
  });
}

function renderMessages() {
  messages.innerHTML = "";
  const thread = threads.find(t => t.id === currentThreadId);
  if (!thread) return;

  thread.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.isUser ? "user" : "ai"}`;
    div.textContent = msg.text;
    messages.appendChild(div);
  });

  messages.scrollTop = messages.scrollHeight;
}

// ===============================
// メッセージ処理
// ===============================
function addMessage(text, isUser) {
  const thread = threads.find(t => t.id === currentThreadId);
  if (!thread) return;

  thread.messages.push({ text, isUser });
  saveThreads();

  const div = document.createElement("div");
  div.className = `message ${isUser ? "user" : "ai"}`;
  div.textContent = text;
  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;
}

// ===============================
// オーブ演出
// ===============================
function orbSpeak() {
  orb.classList.add("active");
  setTimeout(() => orb.classList.remove("active"), 1200);
}

// ===============================
// 送信処理
// ===============================
sendBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, true);
  input.value = "";

  setTimeout(() => {
    const reply = getSeaGodReply(text);
    addMessage(reply, false);
    orbSpeak();
  }, 1200);
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.isComposing) {
    sendBtn.click();
  }
});

// ===============================
// 初期描画
// ===============================
renderThreadList();
renderMessages();
