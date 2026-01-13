// 数据模型
let bookLibrary = [
    {
        id: 1,
        title: "我的妓女生涯",
        author: "康素珍 等",
        tags: ["底层叙事", "异化"],
        summary: "关于身体如何被社会结构异化为商品的纪实探讨。",
        snippets: ["我这辈子，就像是被推着走的..."]
    }
];

// 初始化
const bookGrid = document.getElementById('bookGrid');
const detailPanel = document.getElementById('detailPanel');
const themeToggle = document.getElementById('themeToggle');

// 渲染书架
function renderBooks(data = bookLibrary) {
    bookGrid.innerHTML = data.map(book => `
        <div class="book-card" onclick="showDetail(${book.id})">
            <div class="book-cover">📖</div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p style="font-size:12px; color:var(--text-dim)">${book.author}</p>
            </div>
        </div>
    `).join('');
}

// 显示详情
function showDetail(id) {
    const book = bookLibrary.find(b => b.id === id);
    detailPanel.innerHTML = `
        <h2>${book.title}</h2>
        <p style="color:var(--text-dim)">${book.author}</p>
        <div class="section-title">核心命题</div>
        <p style="font-size:14px">${book.summary}</p>
        <div class="section-title">意象看板 (粘贴图片)</div>
        <div class="image-placeholder" id="dropZone">Ctrl+V 粘贴</div>
        <div class="section-title">金句卡片</div>
        ${book.snippets.map(s => `<div class="snippet-card">${s}</div>`).join('')}
    `;
}

// 主题切换
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerText = isDark ? '☀️' : '🌙';
});

// 图片粘贴逻辑
document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const url = URL.createObjectURL(blob);
            const dropZone = document.getElementById('dropZone');
            if (dropZone) {
                if (dropZone.innerText.includes('粘贴')) dropZone.innerHTML = '';
                const div = document.createElement('div');
                div.className = 'mood-img-wrapper';
                div.innerHTML = `<img src="${url}">`;
                dropZone.appendChild(div);
            }
        }
    }
});

renderBooks();