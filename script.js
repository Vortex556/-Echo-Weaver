let bookLibrary = [];

// 渲染书架
function renderBooks(data = bookLibrary) {
    const grid = document.getElementById('bookGrid');
    grid.innerHTML = data.map(book => `
        <div class="book-card" onclick="showDetail(${book.id})">
            <div class="delete-btn" onclick="deleteBook(event, ${book.id})">✕</div>
            <div class="book-cover">${book.cover ? `<img src="${book.cover}">` : (book.format === 'txt' ? '📄' : '📖')}</div>
            <div class="book-info">
                <h3 style="font-size:16px; margin:5px 0">${book.title}</h3>
                <p style="font-size:12px; color:var(--text-dim)">${book.author}</p>
            </div>
        </div>
    `).join('');
}

// 删除功能
function deleteBook(event, id) {
    event.stopPropagation();
    if (confirm("确定要删除这个灵感吗？")) {
        bookLibrary = bookLibrary.filter(b => b.id !== id);
        renderBooks();
        document.getElementById('detailPanel').innerHTML = '<div class="empty-state">已移除</div>';
    }
}

// 显示详情
function showDetail(id) {
    const book = bookLibrary.find(b => b.id === id);
    if (!book) return;
    const panel = document.getElementById('detailPanel');
    panel.innerHTML = `
        <h2 style="color:var(--accent); margin:0;">${book.title}</h2>
        <p style="color:var(--text-dim); font-size:14px;">来源：${book.author}</p>
        <div style="margin-top:25px; font-weight:bold; border-bottom:1px solid var(--border-color); padding-bottom:5px; font-size:12px; color:var(--text-dim);">文本摘要</div>
        <div class="summary-text">${book.summary}</div>
        <div style="margin-top:25px; font-weight:bold; font-size:12px; color:var(--text-dim);">意象看版 (Ctrl+V 粘贴)</div>
        <div class="image-grid" id="dropZone"></div>
    `;
}

// 文件解析核心逻辑
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const format = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (format === 'txt') {
        reader.onload = function(event) {
            const buffer = event.target.result;
            const view = new Uint8Array(buffer);
            
            // 自动检测并解决乱码 (UTF-8 vs GBK)
            let encoding = 'utf-8';
            try {
                new TextDecoder('utf-8', { fatal: true }).decode(view);
            } catch (err) {
                encoding = 'gbk';
            }

            const decoder = new TextDecoder(encoding);
            const text = decoder.decode(view);
            
            bookLibrary.push({
                id: Date.now(),
                title: file.name.replace('.txt',''),
                author: "本地文稿 (" + encoding.toUpperCase() + ")",
                format: 'txt',
                summary: text.substring(0, 800) + (text.length > 800 ? "..." : ""),
                cover: null
            });
            renderBooks();
        };
        reader.readAsArrayBuffer(file);
    } else if (format === 'epub') {
        reader.onload = async function(event) {
            try {
                const epub = ePub(event.target.result);
                const meta = await epub.loaded.metadata;
                const cover = await epub.coverUrl().catch(() => null);
                bookLibrary.push({
                    id: Date.now(),
                    title: meta.title || file.name,
                    author: meta.creator || "未知作者",
                    format: 'epub',
                    summary: meta.description || "EPUB 内容解析成功。",
                    cover: cover
                });
                renderBooks();
            } catch (err) {
                alert("EPUB 解析失败，请检查文件格式。");
            }
        };
        reader.readAsArrayBuffer(file);
    }
    e.target.value = ''; // 允许重复上传
});

// 粘贴图片
document.addEventListener('paste', (e) => {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const url = URL.createObjectURL(item.getAsFile());
            const img = document.createElement('img');
            img.src = url;
            dropZone.appendChild(img);
        }
    }
});

// 主题切换
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('themeToggle').innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// 搜索
document.getElementById('searchBar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderBooks(bookLibrary.filter(b => b.title.toLowerCase().includes(term)));
});