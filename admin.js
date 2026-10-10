/**
 * ====================================================================
 * Locatm - Master Admin Controller (admin.js)
 * ====================================================================
 * সুপার অ্যাডমিন ড্যাশবোর্ড লজিক, রিয়েল-টাইম ইউজার ব্যালেন্স কন্ট্রোল,
 * ১০০+ স্টক প্রফিট পার্সেন্টেজ কনফিগারেশন এবং সিকিউর একশন হ্যান্ডলার।
 */

// ১. Supabase ক্লায়েন্ট ইনিশিয়ালাইজেশন
let supabaseClient = null;
if (typeof supabase !== 'undefined' && window.CONFIG) {
  supabaseClient = supabase.createClient(
    window.CONFIG.SUPABASE.URL,
    window.CONFIG.SUPABASE.ANON_KEY
  );
}

// ২. ১০০+ কোম্পানির সেন্ট্রাল রেফারেন্স ডেটা
const ADMIN_STOCKS = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL", logo: "🍎", defaultProfit: 7.5 },
  { id: 2, name: "Microsoft Corp.", ticker: "MSFT", logo: "🪟", defaultProfit: 7.2 },
  { id: 3, name: "Google Alphabet", ticker: "GOOGL", logo: "🌐", defaultProfit: 8.0 },
  { id: 4, name: "Amazon.com Inc.", ticker: "AMZN", logo: "📦", defaultProfit: 7.8 },
  { id: 5, name: "Nvidia Corp.", ticker: "NVDA", logo: "⚡", defaultProfit: 9.5 },
  { id: 6, name: "Tesla Motors", ticker: "TSLA", logo: "🚗", defaultProfit: 8.8 },
  { id: 7, name: "Meta Platforms", ticker: "META", logo: "♾️", defaultProfit: 8.2 },
  { id: 8, name: "Berkshire Hathaway", ticker: "BRK", logo: "🏦", defaultProfit: 6.5 },
  { id: 9, name: "Taiwan Semi (TSMC)", ticker: "TSM", logo: "💾", defaultProfit: 8.5 },
  { id: 10, name: "Tencent Holdings", ticker: "TCEHY", logo: "🐧", defaultProfit: 7.6 },
  { id: 11, name: "Samsung Electronics", ticker: "SSNG", logo: "📱", defaultProfit: 6.8 },
  { id: 12, name: "Visa International", ticker: "V", logo: "💳", defaultProfit: 6.9 },
  { id: 13, name: "Mastercard Inc.", ticker: "MA", logo: "🔴", defaultProfit: 7.0 },
  { id: 14, name: "JPMorgan Chase", ticker: "JPM", logo: "🏛️", defaultProfit: 6.7 },
  { id: 15, name: "Johnson & Johnson", ticker: "JNJ", logo: "💊", defaultProfit: 6.2 },
  { id: 16, name: "Walmart Global", ticker: "WMT", logo: "🛒", defaultProfit: 6.4 },
  { id: 17, name: "Procter & Gamble", ticker: "PG", logo: "🧼", defaultProfit: 6.3 },
  { id: 18, name: "Oracle Corp.", ticker: "ORCL", logo: "📊", defaultProfit: 7.4 },
  { id: 19, name: "ASML Holding", ticker: "ASML", logo: "🔬", defaultProfit: 8.9 },
  { id: 20, name: "Toyota Motor Corp.", ticker: "TM", logo: "🚘", defaultProfit: 6.5 },
  { id: 21, name: "Alibaba Group", ticker: "BABA", logo: "🛍️", defaultProfit: 8.4 },
  { id: 22, name: "Coca-Cola Company", ticker: "KO", logo: "🥤", defaultProfit: 5.8 },
  { id: 23, name: "PepsiCo International", ticker: "PEP", logo: "🥫", defaultProfit: 6.0 },
  { id: 24, name: "Costco Wholesale", ticker: "COST", logo: "🏬", defaultProfit: 6.6 },
  { id: 25, name: "Netflix Streaming", ticker: "NFLX", logo: "🎬", defaultProfit: 8.2 },
  { id: 26, name: "Broadcom Inc.", ticker: "AVGO", logo: "📡", defaultProfit: 8.1 },
  { id: 27, name: "Cisco Systems", ticker: "CSCO", logo: "🖧", defaultProfit: 6.5 },
  { id: 28, name: "Adobe Creative", ticker: "ADBE", logo: "🎨", defaultProfit: 7.3 },
  { id: 29, name: "Walt Disney Co.", ticker: "DIS", logo: "🏰", defaultProfit: 6.8 },
  { id: 30, name: "Shell Energy", ticker: "SHEL", logo: "🐚", defaultProfit: 7.0 },
  { id: 31, name: "Exxon Mobil", ticker: "XOM", logo: "⛽", defaultProfit: 7.2 },
  { id: 32, name: "Chevron Oil", ticker: "CVX", logo: "🛢️", defaultProfit: 7.1 },
  { id: 33, name: "Sony Group", ticker: "SONY", logo: "🎮", defaultProfit: 7.3 },
  { id: 34, name: "Intel Corp.", ticker: "INTC", logo: "💻", defaultProfit: 7.0 },
  { id: 35, name: "AMD Micro Devices", ticker: "AMD", logo: "⚙️", defaultProfit: 8.6 },
  { id: 36, name: "Qualcomm Tech", ticker: "QCOM", logo: "📶", defaultProfit: 7.7 },
  { id: 37, name: "Nike Athletics", ticker: "NKE", logo: "👟", defaultProfit: 6.9 },
  { id: 38, name: "McDonald's Corp.", ticker: "MCD", logo: "🍔", defaultProfit: 6.2 },
  { id: 39, name: "Starbucks Coffee", ticker: "SBUX", logo: "☕", defaultProfit: 6.4 },
  { id: 40, name: "Pfizer Health", ticker: "PFE", logo: "🧬", defaultProfit: 6.8 },
  { id: 41, name: "AstraZeneca", ticker: "AZN", logo: "🧪", defaultProfit: 7.0 },
  { id: 42, name: "Novartis Pharma", ticker: "NVS", logo: "🔬", defaultProfit: 6.6 },
  { id: 43, name: "SAP Software", ticker: "SAP", logo: "💻", defaultProfit: 7.1 },
  { id: 44, name: "Siemens Energy", ticker: "SIE", logo: "💡", defaultProfit: 7.0 },
  { id: 45, name: "IBM Computing", ticker: "IBM", logo: "🖥️", defaultProfit: 6.7 },
  { id: 46, name: "Airbus Aerospace", ticker: "AIR", logo: "✈️", defaultProfit: 7.5 },
  { id: 47, name: "Boeing Aviation", ticker: "BA", logo: "🛫", defaultProfit: 7.4 },
  { id: 48, name: "SpaceX Starlink", ticker: "SPCX", logo: "🚀", defaultProfit: 10.0 },
  { id: 49, name: "Uber Technologies", ticker: "UBER", logo: "🚕", defaultProfit: 8.0 },
  { id: 50, name: "Spotify Music", ticker: "SPOT", logo: "🎧", defaultProfit: 7.9 },
  { id: 51, name: "Airbnb Travel", ticker: "ABNB", logo: "🏡", defaultProfit: 8.1 },
  { id: 52, name: "Shopify E-Commerce", ticker: "SHOP", logo: "🛍️", defaultProfit: 8.3 },
  { id: 53, name: "PayPal Payments", ticker: "PYPL", logo: "💵", defaultProfit: 7.2 },
  { id: 54, name: "Square Block", ticker: "SQ", logo: "⏹️", defaultProfit: 7.5 },
  { id: 55, name: "Robinhood Finance", ticker: "HOOD", logo: "🏹", defaultProfit: 8.5 },
  { id: 56, name: "Binance Ecosystem", ticker: "BNB", logo: "🪙", defaultProfit: 9.0 },
  { id: 57, name: "Coinbase Global", ticker: "COIN", logo: "🔵", defaultProfit: 8.7 },
  { id: 58, name: "Sony Music", ticker: "SME", logo: "🎵", defaultProfit: 6.8 },
  { id: 59, name: "Nintendo Corp.", ticker: "NTDOY", logo: "🍄", defaultProfit: 7.0 },
  { id: 60, name: "EA Electronic Arts", ticker: "EA", logo: "⚽", defaultProfit: 7.2 },
  { id: 61, name: "Target Retail", ticker: "TGT", logo: "🎯", defaultProfit: 6.4 },
  { id: 62, name: "LVMH Luxury", ticker: "MC", logo: "👜", defaultProfit: 7.5 },
  { id: 63, name: "Hermes Fashion", ticker: "RMS", logo: "🧣", defaultProfit: 7.3 },
  { id: 64, name: "Ferrari Motors", ticker: "RACE", logo: "🏎️", defaultProfit: 8.0 },
  { id: 65, name: "Porsche Auto", ticker: "P911", logo: "🏁", defaultProfit: 7.9 },
  { id: 66, name: "BMW Group", ticker: "BMW", logo: "🚙", defaultProfit: 7.1 },
  { id: 67, name: "Mercedes-Benz", ticker: "MBG", logo: "⭐", defaultProfit: 7.2 },
  { id: 68, name: "Audi Motors", ticker: "AUDI", logo: "🔘", defaultProfit: 7.0 },
  { id: 69, name: "Honda Motor", ticker: "HMC", logo: "🏍️", defaultProfit: 6.5 },
  { id: 70, name: "Hyundai Auto", ticker: "HYMTF", logo: "🚘", defaultProfit: 6.7 },
  { id: 71, name: "FedEx Express", ticker: "FDX", logo: "📫", defaultProfit: 6.8 },
  { id: 72, name: "UPS Logistics", ticker: "UPS", logo: "📦", defaultProfit: 6.6 },
  { id: 73, name: "DHL Global", ticker: "DPW", logo: "🚚", defaultProfit: 6.7 },
  { id: 74, name: "Baidu Search", ticker: "BIDU", logo: "🐾", defaultProfit: 7.8 },
  { id: 75, name: "JD.com Retail", ticker: "JD", logo: "🐕", defaultProfit: 7.9 },
  { id: 76, name: "Xiaomi Tech", ticker: "XIACF", logo: "📱", defaultProfit: 8.0 },
  { id: 77, name: "BYD Electric Auto", ticker: "BYDDY", logo: "🔋", defaultProfit: 8.8 },
  { id: 78, name: "Foxconn Industry", ticker: "HNHPF", logo: "🏭", defaultProfit: 6.8 },
  { id: 79, name: "Dell Technologies", ticker: "DELL", logo: "💻", defaultProfit: 7.1 },
  { id: 80, name: "HP Computers", ticker: "HPQ", logo: "🖥️", defaultProfit: 6.6 },
  { id: 81, name: "Lenovo Group", ticker: "LNVGY", logo: "⌨️", defaultProfit: 6.9 },
  { id: 82, name: "Canon Optics", ticker: "CAJ", logo: "📷", defaultProfit: 6.3 },
  { id: 83, name: "Nikon Imaging", ticker: "NINOY", logo: "📸", defaultProfit: 6.4 },
  { id: 84, name: "Panasonic Corp.", ticker: "PCRFY", logo: "📺", defaultProfit: 6.5 },
  { id: 85, name: "LG Electronics", ticker: "LGEIY", logo: "📡", defaultProfit: 6.8 },
  { id: 86, name: "Tata Motors Global", ticker: "TTM", logo: "🚛", defaultProfit: 7.5 },
  { id: 87, name: "Infosys Tech", ticker: "INFY", logo: "💡", defaultProfit: 7.2 },
  { id: 88, name: "Reliance Industries", ticker: "RIGD", logo: "🛢️", defaultProfit: 7.3 },
  { id: 89, name: "Unilever Consumer", ticker: "UL", logo: "🧴", defaultProfit: 6.1 },
  { id: 90, name: "Nestle Nutrition", ticker: "NSRGY", logo: "🍫", defaultProfit: 6.0 },
  { id: 91, name: "Mondelez Snacks", ticker: "MDLZ", logo: "🍪", defaultProfit: 6.3 },
  { id: 92, name: "Danone Dairy", ticker: "DANOY", logo: "🥛", defaultProfit: 6.2 },
  { id: 93, name: "Rolex Holdings", ticker: "ROLX", logo: "👑", defaultProfit: 7.8 },
  { id: 94, name: "Zara Inditex", ticker: "IDEXY", logo: "👗", defaultProfit: 7.4 },
  { id: 95, name: "H&M Fashion", ticker: "HNNMY", logo: "👕", defaultProfit: 6.8 },
  { id: 96, name: "Puma Sportswear", ticker: "PUMSY", logo: "🐆", defaultProfit: 7.0 },
  { id: 97, name: "Lego Group", ticker: "LEGO", logo: "🧱", defaultProfit: 7.1 },
  { id: 98, name: "Colgate-Palmolive", ticker: "CL", logo: "🪥", defaultProfit: 5.9 },
  { id: 99, name: "Red Bull Energy", ticker: "RDBL", logo: "🐂", defaultProfit: 7.6 },
  { id: 100, name: "Monster Beverage", ticker: "MNST", logo: "⚡", defaultProfit: 7.5 },
  { id: 101, name: "Zoom Communications", ticker: "ZM", logo: "📹", defaultProfit: 7.3 },
  { id: 102, name: "Slack Technologies", ticker: "WORK", logo: "💬", defaultProfit: 7.2 },
  { id: 103, name: "Dropbox Cloud", ticker: "DBX", logo: "📁", defaultProfit: 6.8 },
  { id: 104, name: "Palantir Tech", ticker: "PLTR", logo: "🛰️", defaultProfit: 9.2 }
];

// ৩. ডেমো ইউজার ডেটা (A to Z অডিট ট্রেইল সহ)
let USER_DATABASE = [
  {
    id: "usr_001",
    name: "মৃণাল দাস",
    email: "mrinal@example.com",
    phone: "01866989184",
    location: "মৌচাক, কোনাবাড়ী, গাজীপুর",
    joined: "12 Mar 2026",
    mainBal: 1250.00,
    ltmBal: 450.0,
    invested: 300.00,
    totalProfit: 485.50,
    referrals: 18,
    refCommission: 74.20,
    vip: 1,
    status: "active"
  },
  {
    id: "usr_002",
    name: "জাহিদ হাসান",
    email: "zahid@example.com",
    phone: "01711223344",
    location: "টঙ্গী, গাজীপুর",
    joined: "05 Apr 2026",
    mainBal: 220.00,
    ltmBal: 80.0,
    invested: 100.00,
    totalProfit: 62.00,
    referrals: 3,
    refCommission: 12.50,
    vip: 1,
    status: "active"
  }
];

// ৪. পেজ লোড ও ইনিশিয়ালাইজেশন
document.addEventListener("DOMContentLoaded", () => {
  renderUsersTable(USER_DATABASE);
  renderStockControlTable();
});

// ৫. ট্যাব পরিবর্তন ফাংশন
function switchAdminTab(tabId, btn) {
  document.querySelectorAll('.admin-tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
  });
  document.getElementById(tabId).style.display = 'block';
  btn.classList.add('active');
}

// ৬. গ্লোবাল ফিচার টগল সুইচ হ্যান্ডলার
function toggleFeature(featureKey, isEnabled) {
  adminConfirm(
    `আপনি কি নিশ্চিতভাবে ${featureKey} ফিচারটি ${isEnabled ? 'চালু (Enable)' : 'বন্ধ (Disable)'} করতে চাচ্ছেন?`,
    () => {
      console.log(`Feature ${featureKey} set to ${isEnabled}`);
      alert(`ফিচার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!`);
    }
  );
}

// ৭. ইউজার টেবিল রেন্ডার ও ডিপ-ইনস্পেকশন
function renderUsersTable(users) {
  const tbody = document.getElementById("userTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <strong>${user.name}</strong><br>
        <small style="color:var(--text-muted);">${user.email}</small>
      </td>
      <td>
        <span>${user.phone}</span><br>
        <small style="color:var(--text-muted);">${user.location}</small>
      </td>
      <td>${user.joined}</td>
      <td style="color:#38bdf8; font-weight:700;">$${user.mainBal.toFixed(2)}</td>
      <td style="color:var(--gold);">${user.ltmBal.toFixed(1)} LTM</td>
      <td>$${user.invested.toFixed(2)}</td>
      <td style="color:var(--accent); font-weight:700;">+$${user.totalProfit.toFixed(2)}</td>
      <td>
        <span>${user.referrals} জন</span><br>
        <small style="color:var(--accent);">+$${user.refCommission.toFixed(2)}</small>
      </td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="openEditUser('${user.id}')">✏️ Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ইউজার টেবিল সার্চ ফিল্টার
function filterUserTable() {
  const query = document.getElementById("searchUserInput").value.toLowerCase();
  const filtered = USER_DATABASE.filter(u => 
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    u.phone.includes(query)
  );
  renderUsersTable(filtered);
}

// ৮. ইউজার এডিটর ও ব্যালেন্স ম্যানিপুলেটর
let activeEditingUser = null;

function openEditUser(userId) {
  const user = USER_DATABASE.find(u => u.id === userId);
  if (!user) return;
  activeEditingUser = user;

  document.getElementById("editUserTitle").innerText = user.name;
  document.getElementById("editUserMainBal").value = user.mainBal;
  document.getElementById("editUserCoinBal").value = user.ltmBal;
  document.getElementById("editUserVip").value = user.vip;
  
  document.getElementById("editUserModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editUserModal").style.display = "none";
}

function saveUserEdit() {
  if (!activeEditingUser) return;
  const newMain = parseFloat(document.getElementById("editUserMainBal").value);
  const newCoin = parseFloat(document.getElementById("editUserCoinBal").value);
  const newVip = parseInt(document.getElementById("editUserVip").value);

  adminConfirm(
    `${activeEditingUser.name}-এর ব্যালেন্স আপডেট নিশ্চিত করতে চান?\nমেইন ব্যালেন্স: $${newMain}\nLTM কয়েন: ${newCoin}`,
    () => {
      activeEditingUser.mainBal = newMain;
      activeEditingUser.ltmBal = newCoin;
      activeEditingUser.vip = newVip;
      closeEditModal();
      renderUsersTable(USER_DATABASE);
      alert("ইউজার ডাটা সফলভাবে সংরক্ষিত হয়েছে!");
    }
  );
}

// ৯. ১০০+ কোম্পানির হিডেন প্রফিট পার্সেন্টেজ টেবিল রেন্ডার
function renderStockControlTable() {
  const tbody = document.getElementById("stockControlBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  ADMIN_STOCKS.forEach(stock => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-size:18px;">${stock.logo}</td>
      <td><strong>${stock.name}</strong></td>
      <td><span class="token-badge">${stock.ticker}</span></td>
      <td>$0.10</td>
      <td>
        <input type="number" id="profit_input_${stock.id}" value="${stock.defaultProfit}" step="0.1" style="width:75px; padding:6px; background:#0b0f19; border:1px solid var(--border); border-radius:6px; color:#fff; text-align:center;"> %
      </td>
      <td><span style="color:var(--accent);">● Active</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="saveStockProfit(${stock.id}, '${stock.name}')">Save</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function saveStockProfit(stockId, stockName) {
  const inputEl = document.getElementById(`profit_input_${stockId}`);
  const newRate = parseFloat(inputEl.value);

  adminConfirm(
    `${stockName}-এর ২৪ ঘণ্টার প্রফিট রেট ${newRate}% করতে চান?`,
    () => {
      alert(`${stockName}-এর নতুন প্রফিট রেট (${newRate}%) সফলভাবে ডেটাবেজে আপডেট হয়েছে!`);
    }
  );
}

// ১০. সর্বজনীন ডাবল কনফার্মেশন মোডাল (অ্যাডমিন সিকিউরিটি)
let adminPendingAction = null;

function adminConfirm(message, callback) {
  document.getElementById("adminConfirmMsg").innerText = message;
  adminPendingAction = callback;
  document.getElementById("adminConfirmModal").style.display = "flex";
}

function closeAdminModal() {
  document.getElementById("adminConfirmModal").style.display = "none";
}

document.getElementById("adminOkBtn").addEventListener("click", () => {
  closeAdminModal();
  if (typeof adminPendingAction === "function") {
    adminPendingAction();
    adminPendingAction = null;
  }
});