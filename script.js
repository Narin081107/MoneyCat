/* ────────────────────────────────────────────
   STATE & CONFIGURATION
──────────────────────────────────────────── */
// 💥 ĐIỀN API KEY CỦA BẠN VÀO GIỮA HAI DẤU NHÁY DƯỚI ĐÂY ĐỂ CHẠY CỨNG TRÊN GITHUB PAGES!
const HARDCODED_API_KEY = "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";

let expenses = [];
let editingId = null;
let aiSuggestedCat = null;
let noteDebounce = null;
let chatOpen = false;
let currentUser = null;
let monthlyBudget = 0;
let pieChartInstance = null;

const CATEGORIES = [
  '🍜 Ăn & Uống','🚌 Di Chuyển','🛍️ Mua Sắm',
  '💊 Sức Khỏe','📚 Giáo Dục','🎮 Giải Trí',
  '🏠 Nhà Cửa','💡 Tiện Ích','✈️ Du Lịch','📦 Khác'
];

const CAT_COLORS = {
  '🍜 Ăn & Uống': '#f59e0b',
  '🚌 Di Chuyển':    '#3b82f6',
  '🛍️ Mua Sắm':    '#ec4899',
  '💊 Sức Khỏe':       '#34d399',
  '📚 Giáo Dục':    '#6c63ff',
  '🎮 Giải Trí':'#a78bfa',
  '🏠 Nhà Cửa':      '#f87171',
  '💡 Tiện Ích':    '#fbbf24',
  '✈️ Du Lịch':       '#06b6d4',
  '📦 Khác':        '#7b82a8',
};

function save() {
  if (!currentUser) return;
  localStorage.setItem('mc_expenses_' + currentUser, JSON.stringify(expenses));
}

/* ────────────────────────────────────────────
   AUTH (ĐĂNG NHẬP / ĐĂNG KÝ — giả lập client-side)
──────────────────────────────────────────── */
function simpleHash(str) {
  // Mã hóa đơn giản (KHÔNG phải bảo mật thực sự, chỉ tránh lưu plaintext trần trụi)
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return btoa(str.split('').reverse().join('')) + '.' + h.toString(36);
}

function getUsers() {
  return JSON.parse(localStorage.getItem('mc_users') || '{}');
}
function saveUsers(users) {
  localStorage.setItem('mc_users', JSON.stringify(users));
}

function switchAuthTab(tab) {
  document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegisterBtn').classList.toggle('active', tab === 'register');
  document.getElementById('loginPanel').classList.toggle('active', tab === 'login');
  document.getElementById('registerPanel').classList.toggle('active', tab === 'register');
  document.getElementById('loginError').textContent = '';
  document.getElementById('registerError').textContent = '';
}

function doRegister() {
  const uRaw = document.getElementById('regUsername').value.trim();
  const u = uRaw.toLowerCase();
  const p = document.getElementById('regPassword').value;
  const err = document.getElementById('registerError');
  err.textContent = '';

  if (!u || !/^[a-z0-9_]{3,20}$/.test(u)) {
    err.textContent = 'Tên đăng nhập phải 3-20 ký tự (chữ thường, số, gạch dưới).'; return;
  }
  if (!p || p.length < 4) { err.textContent = 'Mật khẩu cần ít nhất 4 ký tự.'; return; }

  const users = getUsers();
  if (users[u]) { err.textContent = 'Tên đăng nhập đã tồn tại.'; return; }

  users[u] = { passwordHash: simpleHash(p), displayName: uRaw, createdAt: Date.now() };
  saveUsers(users);
  toast('✅ Tạo tài khoản thành công! Đang đăng nhập…');
  loginAs(u, uRaw);
}

function doLogin() {
  const uRaw = document.getElementById('loginUsername').value.trim();
  const u = uRaw.toLowerCase();
  const p = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  err.textContent = '';

  const users = getUsers();
  const acc = users[u];
  if (!acc || acc.passwordHash !== simpleHash(p)) {
    err.textContent = 'Sai tên đăng nhập hoặc mật khẩu.'; return;
  }
  loginAs(u, acc.displayName || uRaw);
}

function loginAs(username, displayName) {
  currentUser = username;
  localStorage.setItem('mc_current_user', username);

  document.getElementById('authOverlay').classList.add('hide');
  document.getElementById('userBadge').style.display = 'flex';
  document.getElementById('userNameLabel').textContent = displayName;
  document.getElementById('userAvatar').textContent = displayName.charAt(0).toUpperCase();

  expenses = JSON.parse(localStorage.getItem('mc_expenses_' + username) || '[]');
  monthlyBudget = parseFloat(localStorage.getItem('mc_budget_' + username) || '0');
  document.getElementById('budgetInput').value = monthlyBudget || '';

  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('regUsername').value = '';
  document.getElementById('regPassword').value = '';

  render();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('mc_current_user');
  expenses = [];
  document.getElementById('userBadge').style.display = 'none';
  document.getElementById('authOverlay').classList.remove('hide');
  switchAuthTab('login');
  toast('👋 Đã đăng xuất');
}

function tryAutoLogin() {
  const saved = localStorage.getItem('mc_current_user');
  if (!saved) return;
  const users = getUsers();
  const acc = users[saved];
  if (acc) loginAs(saved, acc.displayName || saved);
}

/* ────────────────────────────────────────────
   BUDGET
──────────────────────────────────────────── */
function saveBudget() {
  if (!currentUser) return;
  const val = parseFloat(document.getElementById('budgetInput').value) || 0;
  monthlyBudget = val;
  localStorage.setItem('mc_budget_' + currentUser, String(val));
  toast('💾 Đã lưu ngân sách');
  renderBudget();
}

function renderBudget() {
  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const monthTotal = expenses
    .filter(e => { const d = new Date(e.date); return d.getMonth()===month && d.getFullYear()===year; })
    .reduce((s,e)=>s+e.amount,0);

  const fill = document.getElementById('budgetFill');
  const statusText = document.getElementById('budgetStatusText');
  const alertBox = document.getElementById('budgetAlert');

  if (!monthlyBudget || monthlyBudget <= 0) {
    fill.style.width = '0%';
    fill.className = 'budget-fill';
    statusText.textContent = 'Chưa đặt ngân sách. Nhập số tiền và bấm 💾 để bắt đầu theo dõi.';
    statusText.className = 'budget-status';
    alertBox.classList.remove('show');
    return;
  }

  const pct = Math.min(100, (monthTotal / monthlyBudget) * 100);
  fill.style.width = pct + '%';
  fill.className = 'budget-fill' + (monthTotal > monthlyBudget ? ' over' : pct >= 80 ? ' warn' : '');

  statusText.textContent = `${fmt(monthTotal)} / ${fmt(monthlyBudget)} (${pct.toFixed(0)}%)`;
  statusText.className = 'budget-status' + (monthTotal > monthlyBudget ? ' over' : '');

  if (monthTotal > monthlyBudget) {
    alertBox.textContent = `⚠️ Bạn đã vượt quá ngân sách tháng này ${fmt(monthTotal - monthlyBudget)}!`;
    alertBox.classList.add('show');
  } else {
    alertBox.classList.remove('show');
  }
}

/* ────────────────────────────────────────────
   PIE CHART (Chart.js)
──────────────────────────────────────────── */
function renderChart() {
  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + e.amount; });
  const entries = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const legend = document.getElementById('chartLegend');
  const canvas = document.getElementById('catPieChart');

  if (!entries.length) {
    if (pieChartInstance) { pieChartInstance.destroy(); pieChartInstance = null; }
    legend.innerHTML = '<div class="chart-empty">Chưa có dữ liệu để hiển thị biểu đồ.</div>';
    return;
  }

  const total = entries.reduce((s,[,v])=>s+v,0);
  const labels = entries.map(([cat])=>cat);
  const data = entries.map(([,v])=>v);
  const colors = entries.map(([cat])=>CAT_COLORS[cat] || '#7b82a8');

  if (pieChartInstance) pieChartInstance.destroy();
  pieChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'transparent' }] },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${fmt(ctx.parsed)}` } } }
    }
  });

  legend.innerHTML = entries.map(([cat, amt]) => `
    <div class="chart-legend-item">
      <span class="chart-legend-dot" style="background:${CAT_COLORS[cat]||'#7b82a8'}"></span>
      <span class="chart-legend-name">${cat}</span>
      <span class="chart-legend-pct">${((amt/total)*100).toFixed(0)}%</span>
    </div>`).join('');
}

/* ────────────────────────────────────────────
   THEME TOGGLE
──────────────────────────────────────────── */
function toggleTheme() {
  const body = document.body;
  const toggle = document.getElementById('themeToggle');
  if (body.classList.contains('light')) {
    body.classList.remove('light');
    localStorage.setItem('mc_theme', 'dark');
    toggle.textContent = '🌙';
  } else {
    body.classList.add('light');
    localStorage.setItem('mc_theme', 'light');
    toggle.textContent = '☀️';
  }
}

window.addEventListener('load', () => {
  tryAutoLogin();
  const savedTheme = localStorage.getItem('mc_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    document.getElementById('themeToggle').textContent = '☀️';
  }
  
  // Khởi tạo trạng thái API Key khi tải trang
  if (HARDCODED_API_KEY && HARDCODED_API_KEY !== "sk-or-v1-MÃ_KEY_CỦA_BẠN_Ở_ĐÂY") {
    document.getElementById('apiKeyInput').value = HARDCODED_API_KEY;
    const s = document.getElementById('apiKeyStatus');
    s.textContent = '✓ Sẵn sàng (Mã Cố Định)';
    s.className = 'api-key-status set';
  }
});

/* ────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────── */
function fmt(n) { return '₫' + Math.round(n).toLocaleString('vi-VN'); }

function getActiveApiKey() { 
  if (HARDCODED_API_KEY && HARDCODED_API_KEY !== "sk-or-v1-MÃ_KEY_CỦA_BẠN_Ở_ĐÂY") {
    return HARDCODED_API_KEY;
  }
  return document.getElementById('apiKeyInput').value.trim(); 
}

function onApiKeyChange() {
  const k = document.getElementById('apiKeyInput').value.trim();
  const s = document.getElementById('apiKeyStatus');
  if (k.startsWith('sk-or-')) { s.textContent = '✓ Đã nhập Key'; s.className = 'api-key-status set'; }
  else { s.textContent = 'Chưa đặt'; s.className = 'api-key-status'; }
}

function toast(msg, dur=2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* ────────────────────────────────────────────
   RENDER
──────────────────────────────────────────── */
function render() {
  renderSummary();
  renderCatBreakdown();
  renderTable();
  renderBudget();
  renderChart();
}

function renderSummary() {
  const total = expenses.reduce((s,e) => s + e.amount, 0);
  document.getElementById('totalAmount').textContent = fmt(total);
  document.getElementById('totalCount').textContent = `${expenses.length} ghi chép`;

  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth()===month && d.getFullYear()===year;
  });
  const monthTotal = monthExpenses.reduce((s,e)=>s+e.amount,0);
  document.getElementById('monthAmount').textContent = fmt(monthTotal);
  document.getElementById('monthName').textContent = now.toLocaleString('vi-VN',{month:'long',year:'numeric'});

  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + e.amount; });
  const topEntry = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
  if (topEntry) {
    document.getElementById('topCat').textContent = topEntry[0];
    document.getElementById('topCatAmount').textContent = fmt(topEntry[1]);
  } else {
    document.getElementById('topCat').textContent = '—';
    document.getElementById('topCatAmount').textContent = '—';
  }

  const avg = expenses.length ? total/expenses.length : 0;
  document.getElementById('avgAmount').textContent = fmt(avg);
}

function renderCatBreakdown() {
  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + e.amount; });
  const el = document.getElementById('catBreakdown');
  if (!Object.keys(catMap).length) { el.innerHTML = ''; return; }
  el.innerHTML = Object.entries(catMap)
    .sort((a,b)=>b[1]-a[1])
    .map(([cat,amt]) => `
      <div class="cat-chip">
        <span class="cat-chip-name">${cat}</span>
        <span class="cat-chip-amount" style="color:${CAT_COLORS[cat]||'#fff'}">${fmt(amt)}</span>
      </div>`).join('');
}

function renderTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = expenses.filter(e =>
    e.note.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    e.date.includes(q)
  ).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const body = document.getElementById('expenseTableBody');
  const empty = document.getElementById('emptyState');

  if (!filtered.length) {
    body.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  body.innerHTML = filtered.map(e => `
    <tr>
      <td class="amount-cell" style="color:${CAT_COLORS[e.category]||'#fff'}">${fmt(e.amount)}</td>
      <td><span class="cat-pill" style="background:${CAT_COLORS[e.category]||'#7b82a8'}22;color:${CAT_COLORS[e.category]||'#7b82a8'}">${e.category}</span></td>
      <td class="date-cell">${fmtDate(e.date)}</td>
      <td class="note-cell" title="${esc(e.note)}">${esc(e.note)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-icon" onclick="openModal('${e.id}')" title="Sửa">✏️</button>
        <button class="btn btn-danger btn-icon" onclick="deleteExpense('${e.id}')" title="Xóa">🗑️</button>
      </td>
    </tr>`).join('');
}

function fmtDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ────────────────────────────────────────────
   MODAL ACTIONS
──────────────────────────────────────────── */
function openModal(id=null) {
  editingId = id;
  clearErrors();
  aiSuggestedCat = null;
  document.getElementById('aiSuggestBox').style.display='none';

  if (id) {
    const e = expenses.find(x=>x.id===id);
    document.getElementById('fAmount').value = e.amount;
    document.getElementById('fDate').value = e.date;
    document.getElementById('fNote').value = e.note;
    document.getElementById('fCategory').value = e.category;
    document.getElementById('modalTitleText').textContent = 'Sửa Ghi Chép';
    document.getElementById('modalIcon').textContent = '✏️';
  } else {
    document.getElementById('fAmount').value = '';
    document.getElementById('fDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('fNote').value = '';
    document.getElementById('fCategory').value = '';
    document.getElementById('modalTitleText').textContent = 'Thêm Ghi Chép';
    document.getElementById('modalIcon').textContent = '✦';
  }
  document.getElementById('overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  editingId = null;
  clearErrors();
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeModal();
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
}

function saveExpense() {
  clearErrors();
  const amount = parseFloat(document.getElementById('fAmount').value);
  const date   = document.getElementById('fDate').value;
  const note   = document.getElementById('fNote').value.trim();
  const category = document.getElementById('fCategory').value;

  let valid = true;
  if (!amount || amount <= 0) { document.getElementById('errAmount').classList.add('show'); valid=false; }
  if (!date) { document.getElementById('errDate').classList.add('show'); valid=false; }
  if (!note) { document.getElementById('errNote').classList.add('show'); valid=false; }
  if (!category) { document.getElementById('errCat').classList.add('show'); valid=false; }
  if (!valid) return;

  if (editingId) {
    const idx = expenses.findIndex(x=>x.id===editingId);
    expenses[idx] = { ...expenses[idx], amount, date, note, category };
    toast('✅ Ghi chép đã được cập nhật');
  } else {
    expenses.push({ id: uid(), amount, date, note, category });
    toast('✅ Ghi chép đã được thêm');
  }
  save(); render(); closeModal();

  if (monthlyBudget > 0) {
    const now = new Date();
    const monthTotal = expenses
      .filter(e => { const d = new Date(e.date); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); })
      .reduce((s,e)=>s+e.amount,0);
    if (monthTotal > monthlyBudget) {
      setTimeout(() => toast(`⚠️ Bạn đã vượt ngân sách tháng này (${fmt(monthTotal)} / ${fmt(monthlyBudget)})`, 3500), 300);
    }
  }
}

function deleteExpense(id) {
  if (!confirm('Bạn có chắc muốn xóa ghi chép này?')) return;
  expenses = expenses.filter(e=>e.id!==id);
  save(); render();
  toast('🗑️ Ghi chép đã được xóa');
}

/* ────────────────────────────────────────────
   AI AUTO-CATEGORIZE (FIX CÓ HEADER GIÚP CHẠY TRÊN GITHUB)
──────────────────────────────────────────── */
function onNoteChange() {
  clearTimeout(noteDebounce);
  noteDebounce = setTimeout(triggerAiCategorize, 800);
}


async function triggerAiCategorize() {
  const note = document.getElementById('fNote').value.trim();
  const key  = getActiveApiKey();
  if (!note || note.length < 3 || !key) return;

  const box = document.getElementById('aiSuggestBox');
  const spinner = document.getElementById('aiSpinner');
  const resultText = document.getElementById('aiResultText');
  const applyBtn = document.getElementById('aiApplyBtn');

  box.style.display = 'flex';
  spinner.style.display = 'block';
  resultText.textContent = 'AI đang phân loại danh mục…';
  applyBtn.style.display = 'none';
  aiSuggestedCat = null;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': window.location.href, // Bắt buộc cho Github Pages
        'X-Title': 'MoneyCat Web App'          // Bắt buộc cho Github Pages
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5-8b',
        max_tokens: 30,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Bạn là một chuyên gia phân loại chi tiêu bằng tiếng Việt. Dựa trên mô tả khoản chi sau đây, hãy chọn CHÍNH XÁC một danh mục phù hợp từ danh sách bên dưới. Chỉ phản hồi DUY NHẤT chuỗi ký tự của danh mục được chọn, không thêm bất kỳ từ ngữ, dấu câu hay lời giải thích nào khác:\n${CATEGORIES.join('\n')}\n\nKhoản chi: "${note}"`
        }]
      })
    });
    const data = await res.json();
    const suggested = data.choices?.[0]?.message?.content?.trim();
    if (suggested && CATEGORIES.includes(suggested)) {
      aiSuggestedCat = suggested;
      spinner.style.display = 'none';
      resultText.textContent = `✦ AI gợi ý: ${suggested}`;
      applyBtn.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  } catch {
    box.style.display = 'none';
  }
}

function applyAiCategory() {
  if (!aiSuggestedCat) return;
  document.getElementById('fCategory').value = aiSuggestedCat;
  document.getElementById('aiSuggestBox').style.display = 'none';
  toast(`✦ Hạng mục đã được đặt: ${aiSuggestedCat}`);
}

/* ────────────────────────────────────────────
   AI CHAT (FIX CÓ HEADER GIÚP CHẠY TRÊN GITHUB)
──────────────────────────────────────────── */
function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatPanel').classList.toggle('open', chatOpen);
  if (chatOpen) document.getElementById('chatInput').focus();
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const q = input.value.trim();
  if (!q) return;
  const key = getActiveApiKey();
  input.value = '';

  appendMsg(q, 'user');

  if (!key) {
    appendMsg('⚠️ Vui lòng nhập hoặc cấu hình OpenRouter API key để sử dụng chat AI.', 'ai');
    return;
  }

  const loadId = appendMsg('Đang suy nghĩ…', 'ai loading');

  const context = expenses.length
    ? `Dữ liệu chi tiêu hiện tại (JSON):\n${JSON.stringify(expenses.map(e=>({amount:e.amount,category:e.category,date:e.date,note:e.note})))}\n\nTổng số khoản chi: ${expenses.length}, Tổng số tiền đã tiêu: ${expenses.reduce((s,e)=>s+e.amount,0)} VND.`
    : 'Chưa có khoản chi tiêu nào được ghi lại.';

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': window.location.href, // Bắt buộc cho Github Pages
        'X-Title': 'MoneyCat Web App'          // Bắt buộc cho Github Pages
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 300,
        messages: [
            { 
              role: 'system', 
              content: `Bạn là MoneyCat AI, một trợ lý tài chính cá nhân thân thiện và thông minh. Bạn nói tiếng Việt chuẩn, tự nhiên và hiểu sâu sắc ngữ cảnh Việt Nam. Hãy trả lời câu hỏi của người dùng về các khoản chi tiêu của họ một cách ngắn gọn, súc tích (tối đa 2-3 câu). Luôn định dạng tiền tệ theo kiểu Việt Nam (ví dụ: 50.000₫ hoặc ₫50.000). Ngữ cảnh dữ liệu hiện tại:\n${context}` 
            },
          { role: 'user', content: q }
        ]
      })
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Xin lỗi, tôi không thể xử lý yêu cầu lúc này.';
    updateMsg(loadId, reply);
  } catch (err) {
    updateMsg(loadId, '⚠️ Lỗi kết nối mạng hoặc OpenRouter API key không hợp lệ. Vui lòng kiểm tra lại.');
  }
}

function appendMsg(text, type) {
  const id = uid();
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.id = 'msg-' + id;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

function updateMsg(id, text) {
  const el = document.getElementById('msg-' + id);
  if (el) { el.textContent = text; el.className = 'msg ai'; }
}

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
render();
