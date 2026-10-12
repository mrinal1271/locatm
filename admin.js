/**
 * ====================================================================
 * Locatm - Ultra Master Admin Engine (admin.js) [100% Direct Cloud Sync]
 * ====================================================================
 * সরাসরি ক্লাউড ডাটাবেজ (Supabase)-এ সমস্ত পরিবর্তন লাইভ সেভ হবে।
 */

let pendingAdminAction = null;
let activeEditingUser = null;
let adminUsersList = [];

let adminSettings = {
  admin_credentials: { email: "admin@locatm.com", pass: "admin12345" },
  ltm_rate: 0.10,
  stock_profit_settings: { mode: "auto", min_percent: -5.0, max_percent: 5.0, manual_overrides: {} },
  feature_toggles: { agent_system: false, withdrawals: true, investments: true, p2p: true, trade_ltm: true },
  deposit_methods: [],
  custom_buttons: [],
  company_posts: [],
  marquee_notice: "",
  tutorial_video_url: ""
};

// ১০০+ স্টক কোম্পানি
const ADMIN_STOCKS = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL", logo: "https://logo.clearbit.com/apple.com" },
  { id: 2, name: "Microsoft Corp.", ticker: "MSFT", logo: "https://logo.clearbit.com/microsoft.com" },
  { id: 3, name: "Google Alphabet", ticker: "GOOGL", logo: "https://logo.clearbit.com/google.com" },
  { id: 4, name: "Amazon.com Inc.", ticker: "AMZN", logo: "https://logo.clearbit.com/amazon.com" },
  { id: 5, name: "Nvidia Corp.", ticker: "NVDA", logo: "https://logo.clearbit.com/nvidia.com" },
  { id: 6, name: "Tesla Motors", ticker: "TSLA", logo: "https://logo.clearbit.com/tesla.com" },
  { id: 7, name: "Meta Platforms", ticker: "META", logo: "https://logo.clearbit.com/meta.com" },
  { id: 8, name: "Berkshire Hathaway", ticker: "BRK", logo: "https://logo.clearbit.com/berkshirehathaway.com" },
  { id: 9, name: "Taiwan Semi (TSMC)", ticker: "TSM", logo: "https://logo.clearbit.com/tsmc.com" },
  { id: 10, name: "Tencent Holdings", ticker: "TCEHY", logo: "https://logo.clearbit.com/tencent.com" },
  { id: 11, name: "Samsung Electronics", ticker: "SSNG", logo: "https://logo.clearbit.com/samsung.com" },
  { id: 12, name: "Visa International", ticker: "V", logo: "https://logo.clearbit.com/visa.com" },
  { id: 13, name: "Mastercard Inc.", ticker: "MA", logo: "https://logo.clearbit.com/mastercard.com" },
  { id: 14, name: "JPMorgan Chase", ticker: "JPM", logo: "https://logo.clearbit.com/jpmorganchase.com" },
  { id: 15, name: "Johnson & Johnson", ticker: "JNJ", logo: "https://logo.clearbit.com/jnj.com" },
  { id: 16, name: "Walmart Global", ticker: "WMT", logo: "https://logo.clearbit.com/walmart.com" },
  { id: 17, name: "Procter & Gamble", ticker: "PG", logo: "https://logo.clearbit.com/pg.com" },
  { id: 18, name: "Oracle Corp.", ticker: "ORCL", logo: "https://logo.clearbit.com/oracle.com" },
  { id: 19, name: "ASML Holding", ticker: "ASML", logo: "https://logo.clearbit.com/asml.com" },
  { id: 20, name: "Toyota Motor Corp.", ticker: "TM", logo: "https://logo.clearbit.com/toyota.com" },
  { id: 21, name: "Alibaba Group", ticker: "BABA", logo: "https://logo.clearbit.com/alibaba.com" },
  { id: 22, name: "Coca-Cola Company", ticker: "KO", logo: "https://logo.clearbit.com/coca-cola.com" },
  { id: 23, name: "PepsiCo International", ticker: "PEP", logo: "https://logo.clearbit.com/pepsico.com" },
  { id: 24, name: "Costco Wholesale", ticker: "COST", logo: "https://logo.clearbit.com/costco.com" },
  { id: 25, name: "Netflix Streaming", ticker: "NFLX", logo: "https://logo.clearbit.com/netflix.com" },
  { id: 26, name: "Broadcom Inc.", ticker: "AVGO", logo: "https://logo.clearbit.com/broadcom.com" },
  { id: 27, name: "Cisco Systems", ticker: "CSCO", logo: "https://logo.clearbit.com/cisco.com" },
  { id: 28, name: "Adobe Creative", ticker: "ADBE", logo: "https://logo.clearbit.com/adobe.com" },
  { id: 29, name: "Walt Disney Co.", ticker: "DIS", logo: "https://logo.clearbit.com/thewaltdisneycompany.com" },
  { id: 30, name: "Shell Energy", ticker: "SHEL", logo: "https://logo.clearbit.com/shell.com" },
  { id: 31, name: "Exxon Mobil", ticker: "XOM", logo: "https://logo.clearbit.com/corporate.exxonmobil.com" },
  { id: 32, name: "Chevron Oil", ticker: "CVX", logo: "https://logo.clearbit.com/chevron.com" },
  { id: 33, name: "Sony Group", ticker: "SONY", logo: "https://logo.clearbit.com/sony.com" },
  { id: 34, name: "Intel Corp.", ticker: "INTC", logo: "https://logo.clearbit.com/intel.com" },
  { id: 35, name: "AMD Micro Devices", ticker: "AMD", logo: "https://logo.clearbit.com/amd.com" },
  { id: 36, name: "Qualcomm Tech", ticker: "QCOM", logo: "https://logo.clearbit.com/qualcomm.com" },
  { id: 37, name: "Nike Athletics", ticker: "NKE", logo: "https://logo.clearbit.com/nike.com" },
  { id: 38, name: "McDonald's Corp.", ticker: "MCD", logo: "https://logo.clearbit.com/mcdonalds.com" },
  { id: 39, name: "Starbucks Coffee", ticker: "SBUX", logo: "https://logo.clearbit.com/starbucks.com" },
  { id: 40, name: "Pfizer Health", ticker: "PFE", logo: "https://logo.clearbit.com/pfizer.com" },
  { id: 41, name: "AstraZeneca", ticker: "AZN", logo: "https://logo.clearbit.com/astrazeneca.com" },
  { id: 42, name: "Novartis Pharma", ticker: "NVS", logo: "https://logo.clearbit.com/novartis.com" },
  { id: 43, name: "SAP Software", ticker: "SAP", logo: "https://logo.clearbit.com/sap.com" },
  { id: 44, name: "Siemens Energy", ticker: "SIE", logo: "https://logo.clearbit.com/siemens.com" },
  { id: 45, name: "IBM Computing", ticker: "IBM", logo: "https://logo.clearbit.com/ibm.com" },
  { id: 46, name: "Airbus Aerospace", ticker: "AIR", logo: "https://logo.clearbit.com/airbus.com" },
  { id: 47, name: "Boeing Aviation", ticker: "BA", logo: "https://logo.clearbit.com/boeing.com" },
  { id: 48, name: "SpaceX Starlink", ticker: "SPCX", logo: "https://logo.clearbit.com/spacex.com" },
  { id: 49, name: "Uber Technologies", ticker: "UBER", logo: "https://logo.clearbit.com/uber.com" },
  { id: 50, name: "Spotify Music", ticker: "SPOT", logo: "https://logo.clearbit.com/spotify.com" },
  { id: 51, name: "Airbnb Travel", ticker: "ABNB", logo: "https://logo.clearbit.com/airbnb.com", min: 0.10 },
  { id: 52, name: "Shopify E-Commerce", ticker: "SHOP", logo: "https://logo.clearbit.com/shopify.com", min: 0.10 },
  { id: 53, name: "PayPal Payments", ticker: "PYPL", logo: "https://logo.clearbit.com/paypal.com", min: 0.10 },
  { id: 54, name: "Square Block", ticker: "SQ", logo: "https://logo.clearbit.com/squareup.com", min: 0.10 },
  { id: 55, name: "Robinhood Finance", ticker: "HOOD", logo: "https://logo.clearbit.com/robinhood.com", min: 0.10 },
  { id: 56, name: "Binance Ecosystem", ticker: "BNB", logo: "https://logo.clearbit.com/binance.com", min: 0.10 },
  { id: 57, name: "Coinbase Global", ticker: "COIN", logo: "https://logo.clearbit.com/coinbase.com", min: 0.10 },
  { id: 58, name: "Sony Music", ticker: "SME", logo: "https://logo.clearbit.com/sonymusic.com", min: 0.10 },
  { id: 59, name: "Nintendo Corp.", ticker: "NTDOY", logo: "https://logo.clearbit.com/nintendo.com", min: 0.10 },
  { id: 60, name: "EA Electronic Arts", ticker: "EA", logo: "https://logo.clearbit.com/ea.com", min: 0.10 },
  { id: 61, name: "Target Retail", ticker: "TGT", logo: "https://logo.clearbit.com/target.com", min: 0.10 },
  { id: 62, name: "LVMH Luxury", ticker: "MC", logo: "https://logo.clearbit.com/lvmh.com", min: 0.10 },
  { id: 63, name: "Hermes Fashion", ticker: "RMS", logo: "https://logo.clearbit.com/hermes.com", min: 0.10 },
  { id: 64, name: "Ferrari Motors", ticker: "RACE", logo: "https://logo.clearbit.com/ferrari.com", min: 0.10 },
  { id: 65, name: "Porsche Auto", ticker: "P911", logo: "https://logo.clearbit.com/porsche.com", min: 0.10 },
  { id: 66, name: "BMW Group", ticker: "BMW", logo: "https://logo.clearbit.com/bmw.com", min: 0.10 },
  { id: 67, name: "Mercedes-Benz", ticker: "MBG", logo: "https://logo.clearbit.com/mercedes-benz.com", min: 0.10 },
  { id: 68, name: "Audi Motors", ticker: "AUDI", logo: "https://logo.clearbit.com/audi.com", min: 0.10 },
  { id: 69, name: "Honda Motor", ticker: "HMC", logo: "https://logo.clearbit.com/honda.com", min: 0.10 },
  { id: 70, name: "Hyundai Auto", ticker: "HYMTF", logo: "https://logo.clearbit.com/hyundai.com", min: 0.10 },
  { id: 71, name: "FedEx Express", ticker: "FDX", logo: "https://logo.clearbit.com/fedex.com", min: 0.10 },
  { id: 72, name: "UPS Logistics", ticker: "UPS", logo: "https://logo.clearbit.com/ups.com", min: 0.10 },
  { id: 73, name: "DHL Global", ticker: "DPW", logo: "https://logo.clearbit.com/dhl.com", min: 0.10 },
  { id: 74, name: "Baidu Search", ticker: "BIDU", logo: "https://logo.clearbit.com/baidu.com", min: 0.10 },
  { id: 75, name: "JD.com Retail", ticker: "JD", logo: "https://logo.clearbit.com/jd.com", min: 0.10 },
  { id: 76, name: "Xiaomi Tech", ticker: "XIACF", logo: "https://logo.clearbit.com/mi.com", min: 0.10 },
  { id: 77, name: "BYD Electric Auto", ticker: "BYDDY", logo: "https://logo.clearbit.com/byd.com", min: 0.10 },
  { id: 78, name: "Foxconn Industry", ticker: "HNHPF", logo: "https://logo.clearbit.com/foxconn.com", min: 0.10 },
  { id: 79, name: "Dell Technologies", ticker: "DELL", logo: "https://logo.clearbit.com/dell.com", min: 0.10 },
  { id: 80, name: "HP Computers", ticker: "HPQ", logo: "https://logo.clearbit.com/hp.com", min: 0.10 },
  { id: 81, name: "Lenovo Group", ticker: "LNVGY", logo: "https://logo.clearbit.com/lenovo.com", min: 0.10 },
  { id: 82, name: "Canon Optics", ticker: "CAJ", logo: "https://logo.clearbit.com/canon.com", min: 0.10 },
  { id: 83, name: "Nikon Imaging", ticker: "NINOY", logo: "https://logo.clearbit.com/nikon.com", min: 0.10 },
  { id: 84, name: "Panasonic Corp.", ticker: "PCRFY", logo: "https://logo.clearbit.com/panasonic.com", min: 0.10 },
  { id: 85, name: "LG Electronics", ticker: "LG", logo: "https://logo.clearbit.com/lg.com", min: 0.10 },
  { id: 86, name: "Tata Motors Global", ticker: "TTM", logo: "https://logo.clearbit.com/tatamotors.com", min: 0.10 },
  { id: 87, name: "Infosys Tech", ticker: "INFY", logo: "https://logo.clearbit.com/infosys.com", min: 0.10 },
  { id: 88, name: "Reliance Industries", ticker: "RIGD", logo: "https://logo.clearbit.com/ril.com", min: 0.10 },
  { id: 89, name: "Unilever Consumer", ticker: "UL", logo: "https://logo.clearbit.com/unilever.com", min: 0.10 },
  { id: 90, name: "Nestle Nutrition", ticker: "NSRGY", logo: "https://logo.clearbit.com/nestle.com", min: 0.10 },
  { id: 91, name: "Mondelez Snacks", ticker: "MDLZ", logo: "https://logo.clearbit.com/mondelezinternational.com", min: 0.10 },
  { id: 92, name: "Danone Dairy", ticker: "DANOY", logo: "https://logo.clearbit.com/danone.com", min: 0.10 },
  { id: 93, name: "Rolex Holdings", ticker: "ROLX", logo: "https://logo.clearbit.com/rolex.com", min: 0.10 },
  { id: 94, name: "Zara Inditex", ticker: "IDEXY", logo: "https://logo.clearbit.com/zara.com", min: 0.10 },
  { id: 95, name: "H&M Fashion", ticker: "HNNMY", logo: "https://logo.clearbit.com/hm.com", min: 0.10 },
  { id: 96, name: "Puma Sportswear", ticker: "PUMSY", logo: "https://logo.clearbit.com/puma.com", min: 0.10 },
  { id: 97, name: "Lego Group", ticker: "LEGO", logo: "https://logo.clearbit.com/lego.com", min: 0.10 },
  { id: 98, name: "Colgate-Palmolive", ticker: "CL", logo: "https://logo.clearbit.com/colgatepalmolive.com", min: 0.10 },
  { id: 99, name: "Red Bull Energy", ticker: "RDBL", logo: "https://logo.clearbit.com/redbull.com", min: 0.10 },
  { id: 100, name: "Monster Beverage", ticker: "MNST", logo: "https://logo.clearbit.com/monsterenergy.com", min: 0.10 },
  { id: 101, name: "Zoom Communications", ticker: "ZM", logo: "https://logo.clearbit.com/zoom.us", min: 0.10 },
  { id: 102, name: "Slack Technologies", ticker: "WORK", logo: "https://logo.clearbit.com/slack.com", min: 0.10 },
  { id: 103, name: "Dropbox Cloud", ticker: "DBX", logo: "https://logo.clearbit.com/dropbox.com", min: 0.10 },
  { id: 104, name: "Palantir Tech", ticker: "PLTR", logo: "https://logo.clearbit.com/palantir.com", min: 0.10 }
];

function getDB() {
  if (typeof getDatabaseClient === 'function') {
    return getDatabaseClient();
  }
  return window.db || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPlatformSettings();
  checkAdminSession();
});

// ক্লাউড সেটিংস ফেচ
async function fetchPlatformSettings() {
  const dbClient = getDB();
  if (!dbClient) return;

  try {
    const { data, error } = await dbClient.from('platform_settings').select('*');
    if (!error && data) {
      data.forEach(item => {
        adminSettings[item.key] = item.value;
      });
    }
  } catch (e) {
    console.error("Settings load error:", e);
  }
}

function checkAdminSession() {
  const isAuth = sessionStorage.getItem("locatm_admin_auth");
  if (isAuth === "true") {
    document.getElementById("adminAuthScreen").style.display = "none";
    document.getElementById("adminDashboardWrapper").style.display = "block";
    loadAllAdminData();
  } else {
    document.getElementById("adminAuthScreen").style.display = "flex";
    document.getElementById("adminDashboardWrapper").style.display = "none";
  }
}

function verifyAdminLogin() {
  const em = document.getElementById("adminLogEmail").value.trim();
  const ps = document.getElementById("adminLogPass").value.trim();
  const creds = adminSettings.admin_credentials || { email: "admin@locatm.com", pass: "admin12345" };

  if (em === creds.email && ps === creds.pass) {
    sessionStorage.setItem("locatm_admin_auth", "true");
    document.getElementById("adminAuthScreen").style.display = "none";
    document.getElementById("adminDashboardWrapper").style.display = "block";
    loadAllAdminData();
  } else {
    alert("ভুল অ্যাডমিন ইমেইল অথবা মাস্টার পাসওয়ার্ড!");
  }
}

function adminLogout() {
  sessionStorage.removeItem("locatm_admin_auth");
  window.location.reload();
}

async function loadAllAdminData() {
  await loadPlatformOverview();
  await loadUserAuditList();
  await loadPendingTransactions();
  await loadAgentAuditList();
  renderActiveDepositMethods();
  renderStocksProfitTable();
  renderCustomButtonsTable();
  syncMasterTogglesUI();
}

async function loadPlatformOverview() {
  const dbClient = getDB();
  if (!dbClient) return;

  const { count: userCount } = await dbClient.from('users').select('*', { count: 'exact', head: true });
  document.getElementById("statTotalUsers").innerText = `${userCount || 0} জন`;

  const { data: txs } = await dbClient.from('transactions').select('type, amount, status');
  let depTotal = 0, withTotal = 0;
  if (txs) {
    txs.forEach(t => {
      if (t.status === 'approved') {
        if (t.type === 'deposit') depTotal += parseFloat(t.amount);
        if (t.type === 'withdraw') withTotal += parseFloat(t.amount);
      }
    });
  }
  document.getElementById("statTotalDeposit").innerText = `$${depTotal.toFixed(2)}`;
  document.getElementById("statTotalWithdraw").innerText = `$${withTotal.toFixed(2)}`;
  document.getElementById("statLtmRate").innerText = `$${parseFloat(adminSettings.ltm_rate || 0.10).toFixed(2)}`;

  document.getElementById("settingLtmRateInput").value = parseFloat(adminSettings.ltm_rate || 0.10).toFixed(2);
  document.getElementById("settingMarqueeInput").value = adminSettings.marquee_notice || "";
  document.getElementById("settingVideoUrlInput").value = adminSettings.tutorial_video_url || "";
}

function switchAdminTab(tabId, btn) {
  document.querySelectorAll('.admin-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  btn.classList.add('active');
}

function syncMasterTogglesUI() {
  const toggles = adminSettings.feature_toggles || {};
  document.getElementById("switchAgent").checked = !!toggles.agent_system;
  document.getElementById("switchWithdraw").checked = toggles.withdrawals !== false;
  document.getElementById("switchInvest").checked = toggles.investments !== false;
  document.getElementById("switchP2P").checked = toggles.p2p !== false;
  document.getElementById("switchTrade").checked = toggles.trade_ltm !== false;
}

async function toggleMasterFeature(featureKey, isEnabled) {
  adminConfirmAction(`আপনি কি নিশ্চিতভাবে এই ফিচারটি ${isEnabled ? 'চালু' : 'বন্ধ'} করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.feature_toggles) adminSettings.feature_toggles = {};
    adminSettings.feature_toggles[featureKey] = isEnabled;

    await dbClient.from('platform_settings').upsert({
      key: 'feature_toggles',
      value: adminSettings.feature_toggles
    });
    alert("ফিচার স্ট্যাটাস সরাসরি ক্লাউডে আপডেট হয়েছে!");
  });
}

// ক্লাউড ইউজার তালিকা ও ব্যালেন্স এডিটর
async function loadUserAuditList() {
  const dbClient = getDB();
  if (!dbClient) return;

  const { data, error } = await dbClient.from('users').select('*').order('created_at', { ascending: false });
  if (!error && data) {
    adminUsersList = data;
    renderUserAuditTable(adminUsersList);
  }
}

function renderUserAuditTable(users) {
  const tbody = document.getElementById("userAuditTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;">${u.user_id}</strong></td>
      <td><strong>${u.name}</strong><br><small style="color:var(--text-muted);">${u.email}</small></td>
      <td>${u.phone}</td>
      <td style="color:#38bdf8; font-weight:800;">$${parseFloat(u.main_balance || 0).toFixed(2)}</td>
      <td style="color:var(--gold); font-weight:800;">${parseFloat(u.ltm_balance || 0).toFixed(2)}</td>
      <td>$${parseFloat(u.locked_balance || 0).toFixed(2)}</td>
      <td style="color:var(--accent); font-weight:800;">+$${parseFloat(u.total_profit || 0).toFixed(2)}</td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="openAdminEditUserModal('${u.user_id}')">✏️ Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterUserAuditTable() {
  const q = document.getElementById("userFilterInput").value.toLowerCase();
  const filtered = adminUsersList.filter(u =>
    u.user_id.toLowerCase().includes(q) ||
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.phone.includes(q)
  );
  renderUserAuditTable(filtered);
}

function openAdminEditUserModal(userId) {
  activeEditingUser = adminUsersList.find(u => u.user_id === userId);
  if (!activeEditingUser) return;

  document.getElementById("editUserTargetIdText").innerText = `${activeEditingUser.name} (${activeEditingUser.user_id})`;
  document.getElementById("editUserMainBal").value = activeEditingUser.main_balance;
  document.getElementById("editUserLtmBal").value = activeEditingUser.ltm_balance;
  document.getElementById("editUserLockedBal").value = activeEditingUser.locked_balance;
  document.getElementById("editUserVipLevel").value = activeEditingUser.vip_level || 1;

  document.getElementById("adminEditUserModal").style.display = "flex";
}

function closeAdminEditUserModal() {
  document.getElementById("adminEditUserModal").style.display = "none";
}

async function submitUserBalanceChanges() {
  if (!activeEditingUser) return;
  const newMain = parseFloat(document.getElementById("editUserMainBal").value);
  const newLtm = parseFloat(document.getElementById("editUserLtmBal").value);
  const newLocked = parseFloat(document.getElementById("editUserLockedBal").value);
  const newVip = parseInt(document.getElementById("editUserVipLevel").value);

  adminConfirmAction(`ইউজার ${activeEditingUser.user_id}-এর ব্যালেন্স সরাসরি ক্লাউডে আপডেট করতে চান?`, async () => {
    const dbClient = getDB();
    const { error } = await dbClient.from('users').update({
      main_balance: newMain,
      ltm_balance: newLtm,
      locked_balance: newLocked,
      vip_level: newVip
    }).eq('user_id', activeEditingUser.user_id);

    if (!error) {
      closeAdminEditUserModal();
      await loadUserAuditList();
      alert("ইউজার ডেটাবেজ সফলভাবে আপডেট হয়েছে! ইউজারের পেজে নতুন ব্যালেন্স শো করবে।");
    } else {
      alert("আপডেট সম্ভব হয়নি: " + error.message);
    }
  });
}

// ডিপোজিট মেথডস (সরাসরি ক্লাউড platform_settings)
function renderActiveDepositMethods() {
  const tbody = document.getElementById("activeMethodsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const methods = adminSettings.deposit_methods || [];
  methods.forEach((m, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${m.name}</strong></td>
      <td><span style="color:#38bdf8; word-break:break-all;">${m.address}</span></td>
      <td>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="deleteDepositMethod(${idx})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveNewDepositMethod() {
  const name = document.getElementById("newMethodTitle").value.trim();
  const addr = document.getElementById("newMethodTarget").value.trim();
  const note = document.getElementById("newMethodInstruction").value.trim();

  if (!name || !addr) {
    alert("মেথডের নাম এবং নম্বর/অ্যাড্রেস দিন!");
    return;
  }

  adminConfirmAction(`নতুন ডিপোজিট মেথড "${name}" ক্লাউডে সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.deposit_methods) adminSettings.deposit_methods = [];
    adminSettings.deposit_methods.push({ name, address: addr, note });

    await dbClient.from('platform_settings').upsert({
      key: 'deposit_methods',
      value: adminSettings.deposit_methods
    });

    renderActiveDepositMethods();
    document.getElementById("newMethodTitle").value = "";
    document.getElementById("newMethodTarget").value = "";
    document.getElementById("newMethodInstruction").value = "";
    alert("নতুন পেমেন্ট মেথড ক্লাউডে সক্রিয় হয়েছে!");
  });
}

async function deleteDepositMethod(idx) {
  adminConfirmAction("আপনি কি এই ডিপোজিট মেথডটি ডিলিট করতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.deposit_methods.splice(idx, 1);
    await dbClient.from('platform_settings').upsert({
      key: 'deposit_methods',
      value: adminSettings.deposit_methods
    });
    renderActiveDepositMethods();
    alert("মেথডটি ডিলিট করা হয়েছে!");
  });
}

// পেন্ডিং ডিপোজিট ও উইথড্রাল অনুমোদন
async function loadPendingTransactions() {
  const tbody = document.getElementById("pendingRequestsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const dbClient = getDB();
  if (!dbClient) return;

  const { data: txs, error } = await dbClient.from('transactions').select('*').eq('status', 'pending').order('created_at', { ascending: false });
  if (error || !txs || txs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">বর্তমানে কোনো পেন্ডিং রিকোয়েস্ট নেই।</td></tr>`;
    return;
  }

  txs.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;">${t.user_id}</strong></td>
      <td><span style="color:${t.type === 'deposit' ? 'var(--accent)' : 'var(--gold)'}; font-weight:700;">${t.type === 'deposit' ? 'ডিপোজিট' : 'উত্তোলন'}</span></td>
      <td>$${parseFloat(t.amount).toFixed(2)}</td>
      <td>${t.method} <br><small style="color:#38bdf8;">TrxID: ${t.trx_id || '-'}</small></td>
      <td>${new Date(t.created_at).toLocaleString('bn-BD')}</td>
      <td>
        <button class="btn btn-accent" style="padding:4px 8px; font-size:12px;" onclick="approveTransaction(${t.id}, '${t.user_id}', '${t.type}', ${t.amount})">Approve</button>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="rejectTransaction(${t.id}, '${t.user_id}', '${t.type}', ${t.amount})">Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function approveTransaction(txId, userId, type, amount) {
  adminConfirmAction(`আপনি কি নিশ্চিতভাবে এই $${amount} ${type === 'deposit' ? 'ডিপোজিট' : 'উইথড্রাল'} অনুমোদন করতে চান?`, async () => {
    const dbClient = getDB();
    if (type === 'deposit') {
      const { data: user } = await dbClient.from('users').select('main_balance').eq('user_id', userId).single();
      if (user) {
        const newBal = parseFloat(user.main_balance || 0) + parseFloat(amount);
        await dbClient.from('users').update({ main_balance: newBal }).eq('user_id', userId);
      }
    }
    await dbClient.from('transactions').update({ status: 'approved' }).eq('id', txId);
    alert("অনুমোদন সফল হয়েছে! ইউজারের ব্যালেন্স যুক্ত হয়েছে।");
    await loadPendingTransactions();
    await loadPlatformOverview();
    await loadUserAuditList();
  });
}

async function rejectTransaction(txId, userId, type, amount) {
  adminConfirmAction(`আপনি কি নিশ্চিতভাবে এই ট্রানজেকশন বাতিল করতে চান?`, async () => {
    const dbClient = getDB();
    if (type === 'withdraw') {
      const { data: user } = await dbClient.from('users').select('main_balance').eq('user_id', userId).single();
      if (user) {
        const refundBal = parseFloat(user.main_balance || 0) + parseFloat(amount);
        await dbClient.from('users').update({ main_balance: refundBal }).eq('user_id', userId);
      }
    }
    await dbClient.from('transactions').update({ status: 'rejected' }).eq('id', txId);
    alert("ট্রানজেকশন বাতিল করা হয়েছে!");
    await loadPendingTransactions();
    await loadUserAuditList();
  });
}

// ১০০+ স্টক কমিশন রেঞ্জ (-5% to +5% অটো ও ম্যানুয়াল ওভাররাইড)
function renderStocksProfitTable() {
  const tbody = document.getElementById("stockProfitTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const settings = adminSettings.stock_profit_settings || { mode: 'auto', min_percent: -5.0, max_percent: 5.0, manual_overrides: {} };
  const overrides = settings.manual_overrides || {};

  document.getElementById("autoMinPercent").value = settings.min_percent !== undefined ? settings.min_percent : -5.0;
  document.getElementById("autoMaxPercent").value = settings.max_percent !== undefined ? settings.max_percent : 5.0;

  ADMIN_STOCKS.forEach(stk => {
    const isManual = overrides[stk.id] !== undefined;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="width:28px; height:28px; border-radius:50%; background:#0b0f19; overflow:hidden; display:flex; align-items:center; justify-content:center;">
          <img src="${stk.logo}" alt="${stk.ticker}" style="width:100%; height:100%; object-fit:contain;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(stk.ticker)}&background=2563eb&color=fff';">
        </div>
      </td>
      <td><strong>${stk.name}</strong></td>
      <td><span style="color:#38bdf8; font-weight:700;">${stk.ticker}</span></td>
      <td>
        <input type="number" id="manual_profit_input_${stk.id}" value="${isManual ? overrides[stk.id] : ''}" placeholder="${isManual ? overrides[stk.id] : 'Auto'}" step="0.1" style="width:85px; padding:6px; background:#0b0f19; border:1px solid var(--glass-border); border-radius:8px; color:#fff; text-align:center;"> %
      </td>
      <td>
        <span style="font-size:11px; padding:3px 8px; border-radius:6px; background:${isManual ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}; color:${isManual ? 'var(--gold)' : 'var(--accent)'}; font-weight:700;">
          ${isManual ? 'Manual Target' : 'Auto Range'}
        </span>
      </td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="saveSingleStockManualRate(${stk.id}, '${stk.name}')">Save</button>
        ${isManual ? `<button class="btn btn-danger" style="padding:4px 8px; font-size:12px; margin-left:4px;" onclick="resetStockToAuto(${stk.id})">Reset</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveGlobalStockRange() {
  const minP = parseFloat(document.getElementById("autoMinPercent").value);
  const maxP = parseFloat(document.getElementById("autoMaxPercent").value);

  if (isNaN(minP) || isNaN(maxP)) {
    alert("সঠিক মিনিমাম ও ম্যাক্সিমাম পারসেন্টেজ দিন!");
    return;
  }

  adminConfirmAction(`গ্লোবাল অটো-কমিশন রেঞ্জ ${minP}% থেকে ${maxP}% ক্লাউডে সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.stock_profit_settings) adminSettings.stock_profit_settings = {};
    adminSettings.stock_profit_settings.min_percent = minP;
    adminSettings.stock_profit_settings.max_percent = maxP;

    await dbClient.from('platform_settings').upsert({
      key: 'stock_profit_settings',
      value: adminSettings.stock_profit_settings
    });

    renderStocksProfitTable();
    alert("গ্লোবাল অটো-কমিশন রেঞ্জ ক্লাউডে সেভ হয়েছে!");
  });
}

async function saveSingleStockManualRate(stockId, stockName) {
  const inputVal = document.getElementById(`manual_profit_input_${stockId}`).value.trim();
  if (inputVal === "") {
    alert("পারসেন্টেজ লিখুন অথবা Auto রাখতে খালি রাখুন!");
    return;
  }

  const rate = parseFloat(inputVal);
  adminConfirmAction(`${stockName}-এর জন্য নির্দিষ্ট ম্যানুয়াল রেট ${rate}% নির্ধারণ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.stock_profit_settings.manual_overrides) {
      adminSettings.stock_profit_settings.manual_overrides = {};
    }
    adminSettings.stock_profit_settings.manual_overrides[stockId] = rate;

    await dbClient.from('platform_settings').upsert({
      key: 'stock_profit_settings',
      value: adminSettings.stock_profit_settings
    });

    renderStocksProfitTable();
    alert(`${stockName}-এর রেট সফলভাবে ক্লাউডে সেভ হয়েছে!`);
  });
}

async function resetStockToAuto(stockId) {
  adminConfirmAction("এই কোম্পানিটিকে পুনরায় গ্লোবাল অটো রেঞ্জে ফিরিয়ে নিতে চান?", async () => {
    const dbClient = getDB();
    delete adminSettings.stock_profit_settings.manual_overrides[stockId];
    await dbClient.from('platform_settings').upsert({
      key: 'stock_profit_settings',
      value: adminSettings.stock_profit_settings
    });
    renderStocksProfitTable();
    alert("কোম্পানিটি পুনরায় গ্লোবাল অটো রেঞ্জে সক্রিয় হয়েছে!");
  });
}

// এজেন্ট আবেদন ও ভেরিফিকেশন
async function loadAgentAuditList() {
  const tbody = document.getElementById("agentAuditTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const dbClient = getDB();
  if (!dbClient) return;

  const { data: agents, error } = await dbClient.from('agent_applications').select('*').order('created_at', { ascending: false });
  if (error || !agents || agents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">বর্তমানে কোনো এজেন্ট আবেদন নেই।</td></tr>`;
    return;
  }

  agents.forEach(ag => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;">${ag.user_id}</strong></td>
      <td><strong>${ag.shop_name}</strong></td>
      <td>📞 ${ag.phone}</td>
      <td>${ag.location}</td>
      <td>${new Date(ag.created_at).toLocaleDateString('bn-BD')}</td>
      <td>
        ${ag.status === 'pending' ? `
          <button class="btn btn-accent" style="padding:4px 8px; font-size:12px;" onclick="approveAgentApplication(${ag.id}, '${ag.user_id}')">Approve</button>
          <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="rejectAgentApplication(${ag.id})">Reject</button>
        ` : `
          <span style="color:${ag.status === 'approved' ? 'var(--accent)' : 'var(--danger)'}; font-weight:700;">${ag.status.toUpperCase()}</span>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function approveAgentApplication(appId, userId) {
  adminConfirmAction("এই এজেন্ট আবেদনটি অনুমোদন করতে চান?", async () => {
    const dbClient = getDB();
    await dbClient.from('agent_applications').update({ status: 'approved' }).eq('id', appId);
    await dbClient.from('users').update({ is_agent: true }).eq('user_id', userId);
    alert("এজেন্ট অনুমোদন সম্পন্ন হয়েছে! ইউজার প্যানেলের লাইভ ডিরেক্টরিতে সাথে সাথে যুক্ত হয়েছে।");
    await loadAgentAuditList();
  });
}

async function rejectAgentApplication(appId) {
  adminConfirmAction("এই আবেদনটি বাতিল করতে চান?", async () => {
    const dbClient = getDB();
    await dbClient.from('agent_applications').update({ status: 'rejected' }).eq('id', appId);
    alert("আবেদন বাতিল করা হয়েছে!");
    await loadAgentAuditList();
  });
}

// কাস্টম ডায়নামিক বাটন
function renderCustomButtonsTable() {
  const tbody = document.getElementById("customButtonsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const btns = adminSettings.custom_buttons || [];
  btns.forEach((b, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${b.title}</strong></td>
      <td><small style="color:#38bdf8; word-break:break-all;">${b.url}</small></td>
      <td>${b.isEmbed ? 'In-App Player' : 'External Link'}</td>
      <td>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="deleteCustomButton(${idx})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveCustomButton() {
  const title = document.getElementById("customButtonTitleInput").value.trim();
  const url = document.getElementById("customButtonUrlInput").value.trim();
  const isEmbed = document.getElementById("customButtonEmbedCheck").checked;

  if (!title || !url) {
    alert("বাটনের শিরোনাম ও লিংক দিন!");
    return;
  }

  adminConfirmAction(`হোমপেজে "${title}" বাটনটি সরাসরি ক্লাউডে সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.custom_buttons) adminSettings.custom_buttons = [];
    adminSettings.custom_buttons.push({ title, url, isEmbed });

    await dbClient.from('platform_settings').upsert({
      key: 'custom_buttons',
      value: adminSettings.custom_buttons
    });

    renderCustomButtonsTable();
    document.getElementById("customButtonTitleInput").value = "";
    document.getElementById("customButtonUrlInput").value = "";
    alert("বাটন ক্লাউডে যোগ করা হয়েছে! ইউজারদের হোমপেজে দৃশ্যমান হবে।");
  });
}

async function deleteCustomButton(idx) {
  adminConfirmAction("আপনি কি এই বাটনটি মুছে ফেলতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.custom_buttons.splice(idx, 1);
    await dbClient.from('platform_settings').upsert({
      key: 'custom_buttons',
      value: adminSettings.custom_buttons
    });
    renderCustomButtonsTable();
    alert("বাটনটি ডিলিট করা হয়েছে!");
  });
}

// সেন্ট্রাল সেটিংস (LTM রেট, মারকুই, ভিডিও, কোম্পানি পোস্ট)
async function saveLtmRate() {
  const rate = parseFloat(document.getElementById("settingLtmRateInput").value);
  if (isNaN(rate) || rate <= 0) return;

  adminConfirmAction(`LTM টোকেনের লাইভ রেট $${rate} ক্লাউডে নির্ধারণ করতে চান?`, async () => {
    const dbClient = getDB();
    adminSettings.ltm_rate = rate;
    await dbClient.from('platform_settings').upsert({
      key: 'ltm_rate',
      value: rate
    });
    document.getElementById("statLtmRate").innerText = `$${rate.toFixed(2)}`;
    alert("LTM রেট সরাসরি ক্লাউডে সেভ হয়েছে! ইউজার প্যানেলের লাইভ রেট বদলে গেছে।");
  });
}

async function saveMarqueeNotice() {
  const text = document.getElementById("settingMarqueeInput").value.trim();
  adminConfirmAction("হোমপেজ মারকুই নোটিস ক্লাউডে সেভ করতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.marquee_notice = text;
    await dbClient.from('platform_settings').upsert({
      key: 'marquee_notice',
      value: text
    });
    alert("মারকুই নোটিস সেভ হয়েছে! ইউজারদের হোমপেজে স্ক্রোল করা শুরু হবে।");
  });
}

async function saveTutorialVideo() {
  const url = document.getElementById("settingVideoUrlInput").value.trim();
  adminConfirmAction("কাজের ভিডিও লিংক ক্লাউডে আপডেট করতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.tutorial_video_url = url;
    await dbClient.from('platform_settings').upsert({
      key: 'tutorial_video_url',
      value: url
    });
    alert("ভিডিও লিংক সেভ হয়েছে! ইউজার প্যানেল থেকে দেখা যাবে।");
  });
}

async function saveCompanyPost() {
  const title = document.getElementById("companyPostTitleInput").value.trim();
  const content = document.getElementById("companyPostContentInput").value.trim();

  if (!title || !content) {
    alert("পোস্টের শিরোনাম ও বিবরণ দিন!");
    return;
  }

  adminConfirmAction("কোম্পানি রোডম্যাপে এই পোস্টটি পাবলিশ করতে চান?", async () => {
    const dbClient = getDB();
    if (!adminSettings.company_posts) adminSettings.company_posts = [];
    adminSettings.company_posts.push({ title, content, date: new Date().toLocaleDateString('bn-BD') });

    await dbClient.from('platform_settings').upsert({
      key: 'company_posts',
      value: adminSettings.company_posts
    });

    document.getElementById("companyPostTitleInput").value = "";
    document.getElementById("companyPostContentInput").value = "";
    alert("পোস্ট ক্লাউডে পাবলিশ হয়েছে!");
  });
}

// ডাবল কনফার্মেশন মোডাল
function adminConfirmAction(message, callback) {
  document.getElementById("adminConfirmMessage").innerText = message;
  pendingAdminAction = callback;
  document.getElementById("adminConfirmModal").style.display = "flex";
}

function closeAdminConfirm() {
  document.getElementById("adminConfirmModal").style.display = "none";
}

document.getElementById("adminConfirmOkBtn").addEventListener("click", () => {
  closeAdminConfirm();
  if (typeof pendingAdminAction === "function") {
    pendingAdminAction();
    pendingAdminAction = null;
  }
});