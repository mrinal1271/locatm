/**
 * ====================================================================
 * Locatm - Ultra Master Admin Engine (admin.js)
 * ====================================================================
 * ১০০+ কোম্পানির রিয়েল লোগো ও প্রফিট রেট কন্ট্রোল, আনলিমিটেড ডিপোজিট মেথড,
 * ইউজার ব্যালেন্স ম্যানিপুলেটর, লাইভ কাস্টম বাটন ও সিকিউর ডাবল কনফার্মেশন।
 */

let pendingAdminAction = null;
let activeEditingUser = null;

// ১০০+ কোম্পানি সেন্ট্রাল রেফারেন্স (রিয়েল লোগো ও ডিফল্ট প্রফিট রেট)
const ADMIN_STOCKS = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL", logo: "https://logo.clearbit.com/apple.com", profit: 7.5 },
  { id: 2, name: "Microsoft Corp.", ticker: "MSFT", logo: "https://logo.clearbit.com/microsoft.com", profit: 7.2 },
  { id: 3, name: "Google Alphabet", ticker: "GOOGL", logo: "https://logo.clearbit.com/google.com", profit: 8.0 },
  { id: 4, name: "Amazon.com Inc.", ticker: "AMZN", logo: "https://logo.clearbit.com/amazon.com", profit: 7.8 },
  { id: 5, name: "Nvidia Corp.", ticker: "NVDA", logo: "https://logo.clearbit.com/nvidia.com", profit: 9.5 },
  { id: 6, name: "Tesla Motors", ticker: "TSLA", logo: "https://logo.clearbit.com/tesla.com", profit: 8.8 },
  { id: 7, name: "Meta Platforms", ticker: "META", logo: "https://logo.clearbit.com/meta.com", profit: 8.2 },
  { id: 8, name: "Berkshire Hathaway", ticker: "BRK", logo: "https://logo.clearbit.com/berkshirehathaway.com", profit: 6.5 },
  { id: 9, name: "Taiwan Semi (TSMC)", ticker: "TSM", logo: "https://logo.clearbit.com/tsmc.com", profit: 8.5 },
  { id: 10, name: "Tencent Holdings", ticker: "TCEHY", logo: "https://logo.clearbit.com/tencent.com", profit: 7.6 },
  { id: 11, name: "Samsung Electronics", ticker: "SSNG", logo: "https://logo.clearbit.com/samsung.com", profit: 6.8 },
  { id: 12, name: "Visa International", ticker: "V", logo: "https://logo.clearbit.com/visa.com", profit: 6.9 },
  { id: 13, name: "Mastercard Inc.", ticker: "MA", logo: "https://logo.clearbit.com/mastercard.com", profit: 7.0 },
  { id: 14, name: "JPMorgan Chase", ticker: "JPM", logo: "https://logo.clearbit.com/jpmorganchase.com", profit: 6.7 },
  { id: 15, name: "Johnson & Johnson", ticker: "JNJ", logo: "https://logo.clearbit.com/jnj.com", profit: 6.2 },
  { id: 16, name: "Walmart Global", ticker: "WMT", logo: "https://logo.clearbit.com/walmart.com", profit: 6.4 },
  { id: 17, name: "Procter & Gamble", ticker: "PG", logo: "https://logo.clearbit.com/pg.com", profit: 6.3 },
  { id: 18, name: "Oracle Corp.", ticker: "ORCL", logo: "https://logo.clearbit.com/oracle.com", profit: 7.4 },
  { id: 19, name: "ASML Holding", ticker: "ASML", logo: "https://logo.clearbit.com/asml.com", profit: 8.9 },
  { id: 20, name: "Toyota Motor Corp.", ticker: "TM", logo: "https://logo.clearbit.com/toyota.com", profit: 6.5 },
  { id: 21, name: "Alibaba Group", ticker: "BABA", logo: "https://logo.clearbit.com/alibaba.com", profit: 8.4 },
  { id: 22, name: "Coca-Cola Company", ticker: "KO", logo: "https://logo.clearbit.com/coca-cola.com", profit: 5.8 },
  { id: 23, name: "PepsiCo International", ticker: "PEP", logo: "https://logo.clearbit.com/pepsico.com", profit: 6.0 },
  { id: 24, name: "Costco Wholesale", ticker: "COST", logo: "https://logo.clearbit.com/costco.com", profit: 6.6 },
  { id: 25, name: "Netflix Streaming", ticker: "NFLX", logo: "https://logo.clearbit.com/netflix.com", profit: 8.2 },
  { id: 26, name: "Broadcom Inc.", ticker: "AVGO", logo: "https://logo.clearbit.com/broadcom.com", profit: 8.1 },
  { id: 27, name: "Cisco Systems", ticker: "CSCO", logo: "https://logo.clearbit.com/cisco.com", profit: 6.5 },
  { id: 28, name: "Adobe Creative", ticker: "ADBE", logo: "https://logo.clearbit.com/adobe.com", profit: 7.3 },
  { id: 29, name: "Walt Disney Co.", ticker: "DIS", logo: "https://logo.clearbit.com/thewaltdisneycompany.com", profit: 6.8 },
  { id: 30, name: "Shell Energy", ticker: "SHEL", logo: "https://logo.clearbit.com/shell.com", profit: 7.0 },
  { id: 31, name: "Exxon Mobil", ticker: "XOM", logo: "https://logo.clearbit.com/corporate.exxonmobil.com", profit: 7.2 },
  { id: 32, name: "Chevron Oil", ticker: "CVX", logo: "https://logo.clearbit.com/chevron.com", profit: 7.1 },
  { id: 33, name: "Sony Group", ticker: "SONY", logo: "https://logo.clearbit.com/sony.com", profit: 7.3 },
  { id: 34, name: "Intel Corp.", ticker: "INTC", logo: "https://logo.clearbit.com/intel.com", profit: 7.0 },
  { id: 35, name: "AMD Micro Devices", ticker: "AMD", logo: "https://logo.clearbit.com/amd.com", profit: 8.6 },
  { id: 36, name: "Qualcomm Tech", ticker: "QCOM", logo: "https://logo.clearbit.com/qualcomm.com", profit: 7.7 },
  { id: 37, name: "Nike Athletics", ticker: "NKE", logo: "https://logo.clearbit.com/nike.com", profit: 6.9 },
  { id: 38, name: "McDonald's Corp.", ticker: "MCD", logo: "https://logo.clearbit.com/mcdonalds.com", profit: 6.2 },
  { id: 39, name: "Starbucks Coffee", ticker: "SBUX", logo: "https://logo.clearbit.com/starbucks.com", profit: 6.4 },
  { id: 40, name: "Pfizer Health", ticker: "PFE", logo: "https://logo.clearbit.com/pfizer.com", profit: 6.8 },
  { id: 41, name: "AstraZeneca", ticker: "AZN", logo: "https://logo.clearbit.com/astrazeneca.com", profit: 7.0 },
  { id: 42, name: "Novartis Pharma", ticker: "NVS", logo: "https://logo.clearbit.com/novartis.com", profit: 6.6 },
  { id: 43, name: "SAP Software", ticker: "SAP", logo: "https://logo.clearbit.com/sap.com", profit: 7.1 },
  { id: 44, name: "Siemens Energy", ticker: "SIE", logo: "https://logo.clearbit.com/siemens.com", profit: 7.0 },
  { id: 45, name: "IBM Computing", ticker: "IBM", logo: "https://logo.clearbit.com/ibm.com", profit: 6.7 },
  { id: 46, name: "Airbus Aerospace", ticker: "AIR", logo: "https://logo.clearbit.com/airbus.com", profit: 7.5 },
  { id: 47, name: "Boeing Aviation", ticker: "BA", logo: "https://logo.clearbit.com/boeing.com", profit: 7.4 },
  { id: 48, name: "SpaceX Starlink", ticker: "SPCX", logo: "https://logo.clearbit.com/spacex.com", profit: 10.0 },
  { id: 49, name: "Uber Technologies", ticker: "UBER", logo: "https://logo.clearbit.com/uber.com", profit: 8.0 },
  { id: 50, name: "Spotify Music", ticker: "SPOT", logo: "https://logo.clearbit.com/spotify.com", profit: 7.9 },
  { id: 51, name: "Airbnb Travel", ticker: "ABNB", logo: "https://logo.clearbit.com/airbnb.com", profit: 8.1 },
  { id: 52, name: "Shopify E-Commerce", ticker: "SHOP", logo: "https://logo.clearbit.com/shopify.com", profit: 8.3 },
  { id: 53, name: "PayPal Payments", ticker: "PYPL", logo: "https://logo.clearbit.com/paypal.com", profit: 7.2 },
  { id: 54, name: "Square Block", ticker: "SQ", logo: "https://logo.clearbit.com/squareup.com", profit: 7.5 },
  { id: 55, name: "Robinhood Finance", ticker: "HOOD", logo: "https://logo.clearbit.com/robinhood.com", profit: 8.5 },
  { id: 56, name: "Binance Ecosystem", ticker: "BNB", logo: "https://logo.clearbit.com/binance.com", profit: 9.0 },
  { id: 57, name: "Coinbase Global", ticker: "COIN", logo: "https://logo.clearbit.com/coinbase.com", profit: 8.7 },
  { id: 58, name: "Sony Music", ticker: "SME", logo: "https://logo.clearbit.com/sonymusic.com", profit: 6.8 },
  { id: 59, name: "Nintendo Corp.", ticker: "NTDOY", logo: "https://logo.clearbit.com/nintendo.com", profit: 7.0 },
  { id: 60, name: "EA Electronic Arts", ticker: "EA", logo: "https://logo.clearbit.com/ea.com", profit: 7.2 },
  { id: 61, name: "Target Retail", ticker: "TGT", logo: "https://logo.clearbit.com/target.com", profit: 6.4 },
  { id: 62, name: "LVMH Luxury", ticker: "MC", logo: "https://logo.clearbit.com/lvmh.com", profit: 7.5 },
  { id: 63, name: "Hermes Fashion", ticker: "RMS", logo: "https://logo.clearbit.com/hermes.com", profit: 7.3 },
  { id: 64, name: "Ferrari Motors", ticker: "RACE", logo: "https://logo.clearbit.com/ferrari.com", profit: 8.0 },
  { id: 65, name: "Porsche Auto", ticker: "P911", logo: "https://logo.clearbit.com/porsche.com", profit: 7.9 },
  { id: 66, name: "BMW Group", ticker: "BMW", logo: "https://logo.clearbit.com/bmw.com", profit: 7.1 },
  { id: 67, name: "Mercedes-Benz", ticker: "MBG", logo: "https://logo.clearbit.com/mercedes-benz.com", profit: 7.2 },
  { id: 68, name: "Audi Motors", ticker: "AUDI", logo: "https://logo.clearbit.com/audi.com", profit: 7.0 },
  { id: 69, name: "Honda Motor", ticker: "HMC", logo: "https://logo.clearbit.com/honda.com", profit: 6.5 },
  { id: 70, name: "Hyundai Auto", ticker: "HYMTF", logo: "https://logo.clearbit.com/hyundai.com", profit: 6.7 },
  { id: 71, name: "FedEx Express", ticker: "FDX", logo: "https://logo.clearbit.com/fedex.com", profit: 6.8 },
  { id: 72, name: "UPS Logistics", ticker: "UPS", logo: "https://logo.clearbit.com/ups.com", profit: 6.6 },
  { id: 73, name: "DHL Global", ticker: "DPW", logo: "https://logo.clearbit.com/dhl.com", profit: 6.7 },
  { id: 74, name: "Baidu Search", ticker: "BIDU", logo: "https://logo.clearbit.com/baidu.com", profit: 7.8 },
  { id: 75, name: "JD.com Retail", ticker: "JD", logo: "https://logo.clearbit.com/jd.com", profit: 7.9 },
  { id: 76, name: "Xiaomi Tech", ticker: "XIACF", logo: "https://logo.clearbit.com/mi.com", profit: 8.0 },
  { id: 77, name: "BYD Electric Auto", ticker: "BYDDY", logo: "https://logo.clearbit.com/byd.com", profit: 8.8 },
  { id: 78, name: "Foxconn Industry", ticker: "HNHPF", logo: "https://logo.clearbit.com/foxconn.com", profit: 6.8 },
  { id: 79, name: "Dell Technologies", ticker: "DELL", logo: "https://logo.clearbit.com/dell.com", profit: 7.1 },
  { id: 80, name: "HP Computers", ticker: "HPQ", logo: "https://logo.clearbit.com/hp.com", profit: 6.6 },
  { id: 81, name: "Lenovo Group", ticker: "LNVGY", logo: "https://logo.clearbit.com/lenovo.com", profit: 6.9 },
  { id: 82, name: "Canon Optics", ticker: "CAJ", logo: "https://logo.clearbit.com/canon.com", profit: 6.3 },
  { id: 83, name: "Nikon Imaging", ticker: "NINOY", logo: "https://logo.clearbit.com/nikon.com", profit: 6.4 },
  { id: 84, name: "Panasonic Corp.", ticker: "PCRFY", logo: "https://logo.clearbit.com/panasonic.com", profit: 6.5 },
  { id: 85, name: "LG Electronics", ticker: "LGEIY", logo: "https://logo.clearbit.com/lg.com", profit: 6.8 },
  { id: 86, name: "Tata Motors Global", ticker: "TTM", logo: "https://logo.clearbit.com/tatamotors.com", profit: 7.5 },
  { id: 87, name: "Infosys Tech", ticker: "INFY", logo: "https://logo.clearbit.com/infosys.com", profit: 7.2 },
  { id: 88, name: "Reliance Industries", ticker: "RIGD", logo: "https://logo.clearbit.com/ril.com", profit: 7.3 },
  { id: 89, name: "Unilever Consumer", ticker: "UL", logo: "https://logo.clearbit.com/unilever.com", profit: 6.1 },
  { id: 90, name: "Nestle Nutrition", ticker: "NSRGY", logo: "https://logo.clearbit.com/nestle.com", profit: 6.0 },
  { id: 91, name: "Mondelez Snacks", ticker: "MDLZ", logo: "https://logo.clearbit.com/mondelezinternational.com", profit: 6.3 },
  { id: 92, name: "Danone Dairy", ticker: "DANOY", logo: "https://logo.clearbit.com/danone.com", profit: 6.2 },
  { id: 93, name: "Rolex Holdings", ticker: "ROLX", logo: "https://logo.clearbit.com/rolex.com", profit: 7.8 },
  { id: 94, name: "Zara Inditex", ticker: "IDEXY", logo: "https://logo.clearbit.com/zara.com", profit: 7.4 },
  { id: 95, name: "H&M Fashion", ticker: "HNNMY", logo: "https://logo.clearbit.com/hm.com", profit: 6.8 },
  { id: 96, name: "Puma Sportswear", ticker: "PUMSY", logo: "https://logo.clearbit.com/puma.com", profit: 7.0 },
  { id: 97, name: "Lego Group", ticker: "LEGO", logo: "https://logo.clearbit.com/lego.com", profit: 7.1 },
  { id: 98, name: "Colgate-Palmolive", ticker: "CL", logo: "https://logo.clearbit.com/colgatepalmolive.com", profit: 5.9 },
  { id: 99, name: "Red Bull Energy", ticker: "RDBL", logo: "https://logo.clearbit.com/redbull.com", profit: 7.6 },
  { id: 100, name: "Monster Beverage", ticker: "MNST", logo: "https://logo.clearbit.com/monsterenergy.com", profit: 7.5 },
  { id: 101, name: "Zoom Communications", ticker: "ZM", logo: "https://logo.clearbit.com/zoom.us", profit: 7.3 },
  { id: 102, name: "Slack Technologies", ticker: "WORK", logo: "https://logo.clearbit.com/slack.com", profit: 7.2 },
  { id: 103, name: "Dropbox Cloud", ticker: "DBX", logo: "https://logo.clearbit.com/dropbox.com", profit: 6.8 },
  { id: 104, name: "Palantir Tech", ticker: "PLTR", logo: "https://logo.clearbit.com/palantir.com", profit: 9.2 }
];

// অ্যাক্টিভ ডিপোজিট মেথডস তালিকা
let ADMIN_DEPOSIT_METHODS = [
  { id: 1, name: 'Binance USDT (TRC20)', address: 'TYDzsA94u762ZkpXpL89QweTq15Rt8YpLk', note: 'ন্যূনতম ১০০ ডলার পাঠান।' },
  { id: 2, name: 'Binance Bitcoin (BTC)', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', note: 'সঠিক নেটওয়ার্কে পাঠিয়ে TrxID দিন।' },
  { id: 3, name: 'Binance Litecoin (LTC)', address: 'LTC_Mwc98kLsmNqp1209348ZqPox', note: 'ইনস্ট্যান্ট ভেরিফাই।' },
  { id: 4, name: 'বিকাশ (Personal)', address: '01866989184', note: 'সেন্ড মানি করে TrxID দিন।' },
  { id: 5, name: 'নগদ (Personal)', address: '01866989184', note: 'টাকা পাঠিয়ে TrxID দিন।' }
];

// ইউজার ডাটাবেজ (A to Z অডিট ট্রেইল)
let ADMIN_USERS = [
  {
    userId: "LTM8829",
    name: "মৃণাল দাস",
    email: "mrinal@example.com",
    phone: "01866989184",
    joined: "12 Oct 2026",
    mainBal: 1250.00,
    ltmBal: 450.00,
    lockedBal: 300.00,
    totalProfit: 485.50,
    referralIncome: 74.20,
    vip: 1
  },
  {
    userId: "LTM4190",
    name: "জাহিদ হাসান",
    email: "zahid@example.com",
    phone: "01711223344",
    joined: "08 Oct 2026",
    mainBal: 220.00,
    ltmBal: 80.00,
    lockedBal: 100.00,
    totalProfit: 62.00,
    referralIncome: 12.50,
    vip: 1
  }
];

// ১. পেজ লোড ও ইনিশিয়ালাইজেশন
document.addEventListener("DOMContentLoaded", () => {
  renderAdminUsersTable(ADMIN_USERS);
  renderAdminMethodsTable();
  renderAdminStocksTable();
});

// ২. ট্যাব নেভিগেশন
function showAdminTab(tabId, btn) {
  document.querySelectorAll('.admin-tab-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  btn.classList.add('active');
}

// ৩. মাস্টার ফিচার সুইচ হ্যান্ডলার
function toggleFeatureState(featureName, isEnabled) {
  adminConfirmAction(`আপনি কি নিশ্চিতভাবে "${featureName}" ফিচারটি ${isEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'} করতে চান?`, () => {
    alert(`"${featureName}" সফলভাবে ${isEnabled ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
  });
}

// ৪. ইউজার অডিট টেবিল ও সার্চ
function renderAdminUsersTable(users) {
  const tbody = document.getElementById("userTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;">${u.userId}</strong></td>
      <td><strong>${u.name}</strong><br><small style="color:var(--text-muted);">${u.email}</small></td>
      <td>${u.phone}</td>
      <td>${u.joined}</td>
      <td style="color:#38bdf8; font-weight:700;">$${u.mainBal.toFixed(2)}</td>
      <td style="color:var(--gold); font-weight:700;">${u.ltmBal.toFixed(1)} LTM</td>
      <td>$${u.lockedBal.toFixed(2)}</td>
      <td style="color:var(--accent); font-weight:700;">+$${u.totalProfit.toFixed(2)}</td>
      <td style="color:var(--accent);">+$${u.referralIncome.toFixed(2)}</td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="openEditUserModal('${u.userId}')">✏️ Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function searchUsers() {
  const q = document.getElementById("userSearchInput").value.toLowerCase();
  const filtered = ADMIN_USERS.filter(u =>
    u.userId.toLowerCase().includes(q) ||
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.phone.includes(q)
  );
  renderAdminUsersTable(filtered);
}

// ৫. ইউজার ব্যালেন্স ও ডাটা এডিটর
function openEditUserModal(userId) {
  activeEditingUser = ADMIN_USERS.find(u => u.userId === userId);
  if (!activeEditingUser) return;

  document.getElementById("editingUserTitle").innerText = `${activeEditingUser.name} (${activeEditingUser.userId})`;
  document.getElementById("editMainBal").value = activeEditingUser.mainBal;
  document.getElementById("editLtmBal").value = activeEditingUser.ltmBal;
  document.getElementById("editLockedBal").value = activeEditingUser.lockedBal;
  document.getElementById("editVipLevel").value = activeEditingUser.vip;

  document.getElementById("editUserModal").style.display = "flex";
}

function closeEditUserModal() {
  document.getElementById("editUserModal").style.display = "none";
}

function saveUserChanges() {
  if (!activeEditingUser) return;
  const newMain = parseFloat(document.getElementById("editMainBal").value);
  const newLtm = parseFloat(document.getElementById("editLtmBal").value);
  const newLocked = parseFloat(document.getElementById("editLockedBal").value);
  const newVip = parseInt(document.getElementById("editVipLevel").value);

  adminConfirmAction(`ইউজার ${activeEditingUser.userId}-এর ব্যালেন্স ও তথ্য আপডেট করতে চান?`, () => {
    activeEditingUser.mainBal = newMain;
    activeEditingUser.ltmBal = newLtm;
    activeEditingUser.lockedBal = newLocked;
    activeEditingUser.vip = newVip;
    closeEditUserModal();
    renderAdminUsersTable(ADMIN_USERS);
    alert("ইউজারের সমস্ত ব্যালেন্স সফলভাবে সংরক্ষিত হয়েছে!");
  });
}

// ৬. আনলিমিটেড ডিপোজিট মেথড ম্যানেজার
function renderAdminMethodsTable() {
  const tbody = document.getElementById("activeMethodsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  ADMIN_DEPOSIT_METHODS.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${m.name}</strong></td>
      <td><span style="color:#38bdf8; word-break:break-all;">${m.address}</span></td>
      <td>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="deleteDepositMethod(${m.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addNewDepositMethod() {
  const name = document.getElementById("newMethodName").value.trim();
  const addr = document.getElementById("newMethodAddress").value.trim();
  const note = document.getElementById("newMethodNote").value.trim();

  if (!name || !addr) {
    alert("মেথডের নাম এবং অ্যাড্রেস/নম্বর পূরণ করুন!");
    return;
  }

  adminConfirmAction(`আপনি কি নতুন ডিপোজিট মেথড "${name}" যোগ করতে চান?`, () => {
    ADMIN_DEPOSIT_METHODS.push({
      id: Date.now(),
      name: name,
      address: addr,
      note: note || "নির্দেশনা অনুযায়ী পেমেন্ট সম্পন্ন করুন।"
    });
    renderAdminMethodsTable();
    document.getElementById("newMethodName").value = "";
    document.getElementById("newMethodAddress").value = "";
    document.getElementById("newMethodNote").value = "";
    alert("নতুন ডিপোজিট মেথড সফলভাবে যুক্ত হয়েছে!");
  });
}

function deleteDepositMethod(id) {
  adminConfirmAction("আপনি কি এই ডিপোজিট মেথডটি মুছে ফেলতে চান?", () => {
    ADMIN_DEPOSIT_METHODS = ADMIN_DEPOSIT_METHODS.filter(m => m.id !== id);
    renderAdminMethodsTable();
    alert("মেথডটি সফলভাবে ডিলিট করা হয়েছে!");
  });
}

// ৭. ১০০+ স্টক প্রফিট রেট কন্ট্রোল
function renderAdminStocksTable() {
  const tbody = document.getElementById("stocksTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  ADMIN_STOCKS.forEach(stk => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="width:28px; height:28px; border-radius:50%; background:#1e293b; overflow:hidden; display:flex; align-items:center; justify-content:center;">
          <img src="${stk.logo}" alt="${stk.ticker}" style="width:100%; height:100%; object-fit:contain;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(stk.ticker)}&background=2563eb&color=fff';">
        </div>
      </td>
      <td><strong>${stk.name}</strong></td>
      <td><span class="token-badge">${stk.ticker}</span></td>
      <td>
        <input type="number" id="profit_input_${stk.id}" value="${stk.profit}" step="0.1" style="width:75px; padding:6px; background:#0b0f19; border:1px solid var(--border); border-radius:6px; color:#fff; text-align:center;"> %
      </td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="saveStockProfitRate(${stk.id}, '${stk.name}')">Save</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function saveStockProfitRate(id, name) {
  const val = parseFloat(document.getElementById(`profit_input_${id}`).value);
  adminConfirmAction(`${name}-এর ২৪ ঘণ্টার প্রফিট রেট ${val}% করতে চান?`, () => {
    const item = ADMIN_STOCKS.find(s => s.id === id);
    if (item) item.profit = val;
    alert(`${name}-এর প্রফিট রেট সফলভাবে আপডেট হয়েছে!`);
  });
}

// LTM টোকেন মার্কেট প্রাইস আপডেট
function updateLtmRate() {
  const rate = parseFloat(document.getElementById("ltmPriceInput").value);
  if (isNaN(rate) || rate <= 0) return;

  adminConfirmAction(`LTM টোকেনের রেট $${rate} নির্ধারণ করতে চান?`, () => {
    document.getElementById("statLtmRate").innerText = `$${rate.toFixed(2)} / LTM`;
    alert("LTM কয়েনের মার্কেট রেট সফলভাবে আপডেট হয়েছে!");
  });
}

// ৮. লাইভ বাটন ও ইন-অ্যাপ ভিডিও যোগ করা
function addCustomButton() {
  const title = document.getElementById("customBtnTitle").value.trim();
  const url = document.getElementById("customBtnUrl").value.trim();
  const isEmbed = document.getElementById("customBtnEmbed").checked;

  if (!title || !url) {
    alert("বাটনের শিরোনাম ও লিঙ্ক প্রদান করুন!");
    return;
  }

  adminConfirmAction(`হোমপেজে "${title}" বাটনটি যোগ করতে চান?`, () => {
    alert(`"${title}" বাটন সফলভাবে হোমপেজে যুক্ত হয়েছে!`);
    document.getElementById("customBtnTitle").value = "";
    document.getElementById("customBtnUrl").value = "";
  });
}

// ৯. কোম্পানি পোস্ট ও রোডম্যাপ পাবলিশার
function publishCompanyPost() {
  const title = document.getElementById("postTitleInput").value.trim();
  const content = document.getElementById("postContentInput").value.trim();

  if (!title || !content) {
    alert("পোস্টের শিরোনাম ও বিবরণ লিখুন!");
    return;
  }

  adminConfirmAction("এই পোস্টটি সবার জন্য প্রকাশ করতে চান?", () => {
    alert("কোম্পানি নোটিস/পরিকল্পনা সফলভাবে পোস্ট করা হয়েছে!");
    document.getElementById("postTitleInput").value = "";
    document.getElementById("postContentInput").value = "";
  });
}

// ১০. ডাবল কনফার্মেশন মোডাল ইঞ্জিন
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