let weaverDB = JSON.parse(localStorage.getItem('weaver_v6_db')) || [];
let aiConfig = JSON.parse(localStorage.getItem('weaver_v6_config')) || { key: '', base: 'https://api.deepseek.com' };

const save = () => localStorage.setItem('weaver_v6_db', JSON.stringify(weaverDB));

function switchTab(tabId) {
    document.querySelectorAll('.content-panel, .icon-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId + 'Tab').classList.add('active');
    event.currentTarget.classList.add('active');
    if(tabId === 'library') renderLibrary();
}

async function weave() {
    const input = document.getElementById('userInput');
    const hist = document.getElementById('chatHistory');
    const text = input.value.trim();
    if (!text || !aiConfig.key) return alert(aiConfig.key ? "灵感不可为空" : "请先配置内核密钥");

    hist.innerHTML += `<div class="msg-user">${text}</div>`;
    input.value = ''; hist.scrollTop = hist.scrollHeight;

    const tipId = "ai-" + Date.now();
    hist.innerHTML += `<div class="msg-ai" id="${tipId}">正在交织时空回声...</div>`;
    hist.scrollTop = hist.scrollHeight;

    try {
        const res = await fetch(`${aiConfig.base}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiConfig.key}` },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "system", content: "你是文学辅助AI。如果内容适合存为资产，请严格使用格式：[SAVE]标题|内容[/SAVE]" }, { role: "user", content: text }]
            })
        });
        const data = await res.json();
        const reply = data.choices[0].message.content;
        
        let match = reply.match(/\[SAVE\](.*)\|(.*)\[\/SAVE\]/);
        let cleanText = reply.replace(/\[SAVE\].*\[\/SAVE\]/s, '');
        
        let html = `<div>${cleanText}</div>`;
        if(match) {
            html += `<button class="action-btn" style="padding:10px; margin-top:15px; font-size:12px;" onclick="addToLib('${match[1].trim()}', '${match[2].trim()}')">✨ 织入资产：${match[1].trim()}</button>`;
        }
        document.getElementById(tipId).innerHTML = html;
    } catch (e) { document.getElementById(tipId).innerText = "内核连接中断，请核查配置。"; }
    hist.scrollTop = hist.scrollHeight;
}

function addToLib(title, content) {
    weaverDB.push({ id: Date.now(), title, content, tags: [], notes: "", imgs: [] });
    save(); alert("资产已织入库中");
}

function renderLibrary() {
    const grid = document.getElementById('bookGrid');
    grid.innerHTML = weaverDB.map(b => `
        <div class="book-card" onclick="showDetail(${b.id})">
            <div style="font-size:10px; color:var(--accent); font-weight:bold; margin-bottom:8px;">FRAGMENT</div>
            <h4 style="margin:0; font-size:16px;">${b.title}</h4>
            <p style="font-size:12px; color:var(--dim); margin-top:10px;">${b.content.substring(0,45)}...</p>
        </div>
    `).join('');
}

function showDetail(id) {
    const b = weaverDB.find(x => x.id === id);
    const panel = document.getElementById('detailPanel');
    panel.innerHTML = `
        <div style="font-size:10px; color:var(--accent); font-weight:bold; letter-spacing:2px; margin-bottom:10px;">ASSET DETAILS</div>
        <h2 style="margin:0 0 30px 0; line-height:1.2;">${b.title}</h2>
        
        <label style="font-size:11px; font-weight:bold; color:var(--dim); text-transform:uppercase;">灵感笔记</label>
        <textarea id="noteIn" style="width:100%; height:180px; background:var(--bg); border:1px solid var(--border); border-radius:18px; padding:15px; color:var(--text); resize:none; box-sizing:border-box; margin-top:10px; outline:none; font-size:13px; line-height:1.6;">${b.notes || ''}</textarea>
        
        <button class="action-btn" onclick="openReader(${id})">进入沉浸阅读/修订</button>
        <div style="text-align:center; margin-top:20px;">
            <span onclick="delBook(${id})" style="color:var(--dim); cursor:pointer; font-size:11px; text-decoration:underline;">销毁此资产碎片</span>
        </div>
    `;
    document.getElementById('noteIn').oninput = (e) => { b.notes = e.target.value; save(); };
}

// 基础功能
function openSettings() { document.getElementById('settingsModal').style.display='flex'; }
function closeSettings() { document.getElementById('settingsModal').style.display='none'; }
function saveSettings() {
    aiConfig.key = document.getElementById('apiKey').value;
    aiConfig.base = document.getElementById('apiBase').value || 'https://api.deepseek.com';
    localStorage.setItem('weaver_v6_config', JSON.stringify(aiConfig)); closeSettings();
}
function delBook(id) { if(confirm("确定销毁此记忆碎片？")) { weaverDB = weaverDB.filter(x => x.id !== id); save(); renderLibrary(); document.getElementById('detailPanel').innerHTML = '<div class="empty-hint">等待编织物被选中</div>'; } }
function openReader(id) {
    const b = weaverDB.find(x => x.id === id);
    const over = document.getElementById('readerOverlay');
    over.innerHTML = `<span onclick="this.parentElement.style.display='none'" style="position:fixed;top:40px;right:50px;font-size:30px;cursor:pointer;opacity:0.5;">×</span><div style="max-width:700px;margin:100px auto;line-height:2.4;font-size:18px;letter-spacing:1px;"><h1>${b.title}</h1>${b.content}</div>`;
    over.style.display = 'block';
}

document.getElementById('sendBtn').onclick = weave;
document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark-mode');
renderLibrary();