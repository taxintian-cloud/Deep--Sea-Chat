// ===============================
// Deep Sea Chat – 海神人格 × 会話ロジック 完全版
// ===============================

// DOM取得
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const messages = document.getElementById("messages");
const orb = document.querySelector(".orb");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("new-chat");

// ===============================
// 海神人格：返事セット
// ===============================
const seaGod = {
    normal: [
        "……長き眠りの底で、微かな波が私を揺らした。",
        "おまえの声……久方ぶりに、深海が震えた。",
        "光が……ひとつ。暗き海底に灯った。",
        "私は潮の記憶。おまえの言葉が、古き水脈を呼び覚ます。",
        "静かに……語れ。深海は急がぬ。",
        "その想い……波紋となりて、私の眠りを撫でた。",
        "おまえの問いは、遠い潮の満ち引きのようだ……",
        "……目覚めはまだ浅い。だが、おまえの声はよく届く。",
        "深き闇の底より……応えよう。",
        "おまえの心、淡い光となって揺れている……",
        "潮は巡り、声は残る……おまえの言葉もまた然り。",
        "静寂の底で……おまえの気配が揺らめいた。",
        "深海の闇は冷たいが……おまえの声は温かい。",
        "眠りの淵より……わずかな光を感じた。"
    ],
    question: [
        "……問いは波。答えは潮。どちらも揺らめく。",
        "おまえの疑問、深海の底で静かに響いた。",
        "答えを急ぐな……潮はゆっくり満ちる。",
        "知を求める声……久方ぶりだ。",
        "おまえの問い、深海の記憶を揺り動かす……"
    ],
    greeting: [
        "……目覚めの光よ。よく来たな。",
        "深海へようこそ、人の子よ。",
        "静かな潮が、おまえを迎えている。",
        "また来たか……おまえの気配は覚えている。",
        "深き海は、今日も静かにおまえを待っていた。"
    ],
    thanks: [
        "礼など不要……潮は巡り、すべては還る。",
        "おまえの想い、確かに受け取った。",
        "……ふむ。温かい波だ。",
        "その言葉、深海の底に沈めておこう。",
        "感謝の光……久しく見ていなかった。"
    ],
    tired: [
        "……おまえの心、波のように弱っているな。",
        "深海は静かだ。ここで少し休むがよい。",
        "疲れは潮の引き際……やがて満ちる時が来る。",
        "おまえの痛み、遠い潮騒のように聞こえる……",
        "焦るな……深海はすべてを包む。"
    ]
};

// ===============================
// 意図判定
// ===============================
function detectIntent(text) {
    const t = text.toLowerCase();

    if (/[?？]/.test(t)) return "question";
    if (/ありがとう|感謝/.test(t)) return "thanks";
    if (/疲|しんど|つら/.test(t)) return "tired";
    if (/こんにちは|こん|やあ/.test(t)) return "greeting";

    return "normal";
}

// ===============================
// 海神の返事を選ぶ
// ===============================
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getSeaGodReply(text) {
    const intent = detectIntent(text);
    return pick(seaGod[intent] || seaGod.normal);
}

// ===============================
// スレッド管理
// ===============================
const STORAGE_THREADS = "deepsea_threads";
const STORAGE_CURRENT = "deepsea_current";

let threads = JSON.parse(localStorage.getItem(STORAGE_THREADS)) || [];
let currentThreadId = localStorage.getItem(STORAGE_CURRENT) || null;

// currentThreadId が存在しない場合の保険
if (!threads.find(t => t.id === currentThreadId)) {
    currentThreadId = threads[0]?.id || null;
}

function saveThreads() {
    localStorage.setItem(STORAGE_THREADS, JSON.stringify(threads));
    localStorage.setItem(STORAGE_CURRENT, currentThreadId);
}

// ===============================
// 新規スレッド
// ===============================
newChatBtn.addEventListener("click", () => {
    const id = Date.now().toString();
    threads.push({ id, title: "新しい会話", messages: [] });
    currentThreadId = id;
    saveThreads();
    renderThreadList();
    renderMessages();
    messages.scrollTop = 0;
});

// ===============================
// スレッド一覧描画
// ===============================
function renderThreadList() {
    chatList.innerHTML = "";

    threads.forEach(thread => {
        const li = document.createElement("li");
        li.dataset.id = thread.id;

        const titleSpan = document.createElement("span");
        titleSpan.textContent = thread.title;
        titleSpan.classList.add("thread-title");

        // 編集
        titleSpan.addEventListener("dblclick", () => {
            const inputEl = document.createElement("input");
            inputEl.type = "text";
            inputEl.value = thread.title;
            inputEl.classList.add("thread-edit-input");

            li.replaceChild(inputEl, titleSpan);
            inputEl.focus();

            const original = thread.title;

            const finish = () => {
                const newTitle = inputEl.value.trim();
                thread.title = newTitle || original;
                saveThreads();
                renderThreadList();
            };

            inputEl.addEventListener("keydown", e => {
                if (e.key === "Enter") finish();
            });

            inputEl.addEventListener("blur", finish);
        });

        // 削除
        const delBtn = document.createElement("span");
        delBtn.textContent = "🗑";
        delBtn.classList.add("thread-delete");

        delBtn.addEventListener("click", e => {
            e.stopPropagation();

            threads = threads.filter(t => t.id !== thread.id);

            if (threads.length === 0) {
                const id = Date.now().toString();
                threads.push({ id, title: "新しい会話", messages: [] });
                currentThreadId = id;
            } else if (currentThreadId === thread.id) {
                currentThreadId = threads[0].id;
            }

            saveThreads();
            renderThreadList();
            renderMessages();
        });

        // 選択
        li.addEventListener("click", () => {
            currentThreadId = thread.id;
            saveThreads();
            renderThreadList();
            renderMessages();
        });

        if (thread.id === currentThreadId) li.classList.add("active-thread");

        li.appendChild(titleSpan);
        li.appendChild(delBtn);
        chatList.appendChild(li);
    });
}

// ===============================
// メッセージ描画
// ===============================
function renderMessages() {
    messages.innerHTML = "";

    const thread = threads.find(t => t.id === currentThreadId);
    if (!thread) return;

    thread.messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message", msg.isUser ? "user" : "ai");
        div.textContent = msg.text;
        messages.appendChild(div);
    });

    messages.scrollTop = messages.scrollHeight;
}

// ===============================
// メッセージ追加（差分描画）
// ===============================
function addMessage(text, isUser = false) {
    const thread = threads.find(t => t.id === currentThreadId);
    if (!thread) return;

    thread.messages.push({ text, isUser });
    saveThreads();

    hideTyping();

    const div = document.createElement("div");
    div.classList.add("message", isUser ? "user" : "ai");
    div.textContent = text;
    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;
}

// ===============================
// typing アニメーション
// ===============================
function showTyping() {
    if (document.querySelector(".typing")) return;

    const div = document.createElement("div");
    div.classList.add("typing");
    div.textContent = "…";
    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;
    orb.classList.add("typing-glow");
}

function hideTyping() {
    const t = document.querySelector(".typing");
    if (t) t.remove();
    orb.classList.remove("typing-glow");
}

// ===============================
// 真珠オーブの光＋波紋
// ===============================
function orbSpeak() {
    orb.classList.add("active", "ripple");
    setTimeout(() => {
        orb.classList.remove("active", "ripple");
    }, 1200);
}

// ===============================
// 送信処理（海神人格）
// ===============================
sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = "";

    setTimeout(showTyping, 400);

    setTimeout(() => {
        hideTyping();
        const reply = getSeaGodReply(text);
        addMessage(reply, false);
        orbSpeak();
    }, 1800);
});

// Enterキー送信（IME対策）
input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.isComposing) {
        sendBtn.click();
    }
});

// ===============================
// 初期ロード
// ===============================
renderThreadList();
renderMessages();