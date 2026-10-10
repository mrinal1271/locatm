/**
 * ====================================================================
 * Locatm - Ultra Client Engine (app.js)
 * ====================================================================
 * ১০০+ বৈশ্বিক কোম্পানির অরিজিনাল ব্র্যান্ড লোগো ইমেজ CDN,
 * ডিপোজিট, উইথড্র, P2P, Trade LTM ও অ্যাডমিন কাস্টম বাটন কন্ট্রোলার।
 */

let currentUser = null;
let pendingConfirmCallback = null;
let currentTradeMode = 'buy';
let ltmTokenPrice = 0.10; // ১ LTM = $0.10

// অ্যাডমিন দ্বারা কনফিগারযোগ্য ডিপোজিট মেথডস
let DEPOSIT_METHODS = [
  { id: 'usdt_trc20', name: 'Binance USDT (TRC20)', address: 'TYDzsA94u762ZkpXpL89QweTq15Rt8YpLk', note: 'ন্যূনতম ১০০ ডলার পাঠান। ট্রানজেকশন হ্যাশ (TXID) দিন।' },
  { id: 'btc', name: 'Binance Bitcoin (BTC)', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', note: 'সঠিক বিটকয়েন নেটওয়ার্কে পাঠিয়ে TrxID দিন।' },
  { id: 'ltc', name: 'Binance Litecoin (LTC)', address: 'LTC_Mwc98kLsmNqp1209348ZqPox', note: 'লাইটকয়েন ডিপোজিট ইনস্ট্যান্ট ভেরিফাই হবে।' },
  { id: 'bkash', name: 'বিকাশ (Personal Cash Out / Send)', address: '01866989184', note: 'বিকাশ পার্সোনালে সেন্ড মানি করে Transaction ID দিন।' },
  { id: 'nagad', name: 'নগদ (Personal Send Money)', address: '01866989184', note: 'নগদ পার্সোনালে টাকা পাঠিয়ে TrxID লিখুন।' }
];

// এজেন্টের তালিকা (Direct Call & WhatsApp)
let AGENT_REGISTRY = [
  { id: 1, name: "জামান টেলিকম (অফিসিয়াল)", phone: "01866989184", location: "মৌচাক বাজার, কোনাবাড়ী, গাজীপুর", rating: "5.0 ★" },
  { id: 2, name: "ডিজিটাল ক্যাশ পয়েন্ট", phone: "01711000000", location: "কাশিমপুর রোড, গাজীপুর", rating: "4.9 ★" },
  { id: 3, name: "রাজীব এন্টারপ্রাইজ", phone: "01922000000", location: "চৌরাস্তা, জয়দেবপুর", rating: "4.8 ★" }
];

// ১০০+ ইউনিক কোম্পানি ডেটাবেজ (সরাসরি আসল লোগো ইমেজ ইউআরএল সহ)
const GLOBAL_STOCKS = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL", logo: "https://logo.clearbit.com/apple.com", min: 0.10 },
  { id: 2, name: "Microsoft Corp.", ticker: "MSFT", logo: "https://logo.clearbit.com/microsoft.com", min: 0.10 },
  { id: 3, name: "Google Alphabet", ticker: "GOOGL", logo: "https://logo.clearbit.com/google.com", min: 0.10 },
  { id: 4, name: "Amazon.com Inc.", ticker: "AMZN", logo: "https://logo.clearbit.com/amazon.com", min: 0.10 },
  { id: 5, name: "Nvidia Corp.", ticker: "NVDA", logo: "https://logo.clearbit.com/nvidia.com", min: 0.10 },
  { id: 6, name: "Tesla Motors", ticker: "TSLA", logo: "https://logo.clearbit.com/tesla.com", min: 0.10 },
  { id: 7, name: "Meta Platforms", ticker: "META", logo: "https://logo.clearbit.com/meta.com", min: 0.10 },
  { id: 8, name: "Berkshire Hathaway", ticker: "BRK", logo: "https://logo.clearbit.com/berkshirehathaway.com", min: 0.10 },
  { id: 9, name: "Taiwan Semi (TSMC)", ticker: "TSM", logo: "https://logo.clearbit.com/tsmc.com", min: 0.10 },
  { id: 10, name: "Tencent Holdings", ticker: "TCEHY", logo: "https://logo.clearbit.com/tencent.com", min: 0.10 },
  { id: 11, name: "Samsung Electronics", ticker: "SSNG", logo: "https://logo.clearbit.com/samsung.com", min: 0.10 },
  { id: 12, name: "Visa International", ticker: "V", logo: "https://logo.clearbit.com/visa.com", min: 0.10 },
  { id: 13, name: "Mastercard Inc.", ticker: "MA", logo: "https://logo.clearbit.com/mastercard.com", min: 0.10 },
  { id: 14, name: "JPMorgan Chase", ticker: "JPM", logo: "https://logo.clearbit.com/jpmorganchase.com", min: 0.10 },
  { id: 15, name: "Johnson & Johnson", ticker: "JNJ", logo: "https://logo.clearbit.com/jnj.com", min: 0.10 },
  { id: 16, name: "Walmart Global", ticker: "WMT", logo: "https://logo.clearbit.com/walmart.com", min: 0.10 },
  { id: 17, name: "Procter & Gamble", ticker: "PG", logo: "https://logo.clearbit.com/pg.com", min: 0.10 },
  { id: 18, name: "Oracle Corp.", ticker: "ORCL", logo: "https://logo.clearbit.com/oracle.com", min: 0.10 },
  { id: 19, name: "ASML Holding", ticker: "ASML", logo: "https://logo.clearbit.com/asml.com", min: 0.10 },
  { id: 20, name: "Toyota Motor Corp.", ticker: "TM", logo: "https://logo.clearbit.com/toyota.com", min: 0.10 },
  { id: 21, name: "Alibaba Group", ticker: "BABA", logo: "https://logo.clearbit.com/alibaba.com", min: 0.10 },
  { id: 22, name: "Coca-Cola Company", ticker: "KO", logo: "https://logo.clearbit.com/coca-cola.com", min: 0.10 },
  { id: 23, name: "PepsiCo International", ticker: "PEP", logo: "https://logo.clearbit.com/pepsico.com", min: 0.10 },
  { id: 24, name: "Costco Wholesale", ticker: "COST", logo: "https://logo.clearbit.com/costco.com", min: 0.10 },
  { id: 25, name: "Netflix Streaming", ticker: "NFLX", logo: "https://logo.clearbit.com/netflix.com", min: 0.10 },
  { id: 26, name: "Broadcom Inc.", ticker: "AVGO", logo: "https://logo.clearbit.com/broadcom.com", min: 0.10 },
  { id: 27, name: "Cisco Systems", ticker: "CSCO", logo: "https://logo.clearbit.com/cisco.com", min: 0.10 },
  { id: 28, name: "Adobe Creative", ticker: "ADBE", logo: "https://logo.clearbit.com/adobe.com", min: 0.10 },
  { id: 29, name: "Walt Disney Co.", ticker: "DIS", logo: "https://logo.clearbit.com/thewaltdisneycompany.com", min: 0.10 },
  { id: 30, name: "Shell Energy", ticker: "SHEL", logo: "https://logo.clearbit.com/shell.com", min: 0.10 },
  { id: 31, name: "Exxon Mobil", ticker: "XOM", logo: "https://logo.clearbit.com/corporate.exxonmobil.com", min: 0.10 },
  { id: 32, name: "Chevron Oil", ticker: "CVX", logo: "https://logo.clearbit.com/chevron.com", min: 0.10 },
  { id: 33, name: "Sony Group", ticker: "SONY", logo: "https://logo.clearbit.com/sony.com", min: 0.10 },
  { id: 34, name: "Intel Corp.", ticker: "INTC", logo: "https://logo.clearbit.com/intel.com", min: 0.10 },
  { id: 35, name: "AMD Micro Devices", ticker: "AMD", logo: "https://logo.clearbit.com/amd.com", min: 0.10 },
  { id: 36, name: "Qualcomm Tech", ticker: "QCOM", logo: "https://logo.clearbit.com/qualcomm.com", min: 0.10 },
  { id: 37, name: "Nike Athletics", ticker: "NKE", logo: "https://logo.clearbit.com/nike.com", min: 0.10 },
  { id: 38, name: "McDonald's Corp.", ticker: "MCD", logo: "https://logo.clearbit.com/mcdonalds.com", min: 0.10 },
  { id: 39, name: "Starbucks Coffee", ticker: "SBUX", logo: "https://logo.clearbit.com/starbucks.com", min: 0.10 },
  { id: 40, name: "Pfizer Health", ticker: "PFE", logo: "https://logo.clearbit.com/pfizer.com", min: 0.10 },
  { id: 41, name: "AstraZeneca", ticker: "AZN", logo: "https://logo.clearbit.com/astrazeneca.com", min: 0.10 },
  { id: 42, name: "Novartis Pharma", ticker: "NVS", logo: "https://logo.clearbit.com/novartis.com", min: 0.10 },
  { id: 43, name: "SAP Software", ticker: "SAP", logo: "https://logo.clearbit.com/sap.com", min: 0.10 },
  { id: 44, name: "Siemens Energy", ticker: "SIE", logo: "https://logo.clearbit.com/siemens.com", min: 0.10 },
  { id: 45, name: "IBM Computing", ticker: "IBM", logo: "https://logo.clearbit.com/ibm.com", min: 0.10 },
  { id: 46, name: "Airbus Aerospace", ticker: "AIR", logo: "https://logo.clearbit.com/airbus.com", min: 0.10 },
  { id: 47, name: "Boeing Aviation", ticker: "BA", logo: "https://logo.clearbit.com/boeing.com", min: 0.10 },
  { id: 48, name: "SpaceX Starlink", ticker: "SPCX", logo: "https://logo.clearbit.com/spacex.com", min: 0.10 },
  { id: 49, name: "Uber Technologies", ticker: "UBER", logo: "https://logo.clearbit.com/uber.com", min: 0.10 },
  { id: 50, name: "Spotify Music", ticker: "SPOT", logo: "https://logo.clearbit.com/spotify.com", min: 0.10 },
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
  { id: 85, name: "LG Electronics", ticker: "LGEIY", logo: "https://logo.clearbit.com/lg.com", min: 0.10 },
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

document.addEventListener("DOMContentLoaded", () => {
  initStockMarket();
  initDepositDropdown();
  initAgentList();
  initDynamicButtons();
  initCompanyPosts();
  checkSavedAuth();
});

// অথেন্টিকেশন লজিক
function checkSavedAuth() {
  const saved = localStorage.getItem("locatm_user");
  if (saved) {
    currentUser = JSON.parse(saved);
    updateUserUI();
    document.getElementById("authScreen").style.display = "none";
  } else {
    document.getElementById("authScreen").style.display = "flex";
  }
}

function switchAuthTab(type) {
  if (type === 'login') {
    document.getElementById("authTabLogin").className = "btn btn-primary";
    document.getElementById("authTabSignup").className = "btn btn-outline";
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupForm").style.display = "none";
  } else {
    document.getElementById("authTabLogin").className = "btn btn-outline";
    document.getElementById("authTabSignup").className = "btn btn-primary";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
  }
}

function handleLogin() {
  const em = document.getElementById("loginEmail").value.trim();
  const ps = document.getElementById("loginPass").value.trim();
  if (!em || !ps) {
    alert("ইমেইল ও পাসওয়ার্ড দিন!");
    return;
  }
  currentUser = {
    userId: "LTM" + Math.floor(1000 + Math.random() * 9000),
    name: em.split('@')[0] || "User",
    email: em,
    phone: "01866989184",
    mainBal: 100.00,
    lockedBal: 0.00,
    ltmBal: 50.00,
    totalProfit: 0.00,
    vip: 1
  };
  localStorage.setItem("locatm_user", JSON.stringify(currentUser));
  updateUserUI();
  document.getElementById("authScreen").style.display = "none";
}

function handleSignup() {
  const nm = document.getElementById("regName").value.trim();
  const em = document.getElementById("regEmail").value.trim();
  const ph = document.getElementById("regPhone").value.trim();
  const ps = document.getElementById("regPass").value.trim();

  if (!nm || !em || !ph || !ps) {
    alert("সবগুলো তথ্য সঠিকভাবে পূরণ করুন!");
    return;
  }

  currentUser = {
    userId: "LTM" + Math.floor(1000 + Math.random() * 9000),
    name: nm,
    email: em,
    phone: ph,
    mainBal: 0.00,
    lockedBal: 0.00,
    ltmBal: 0.00,
    totalProfit: 0.00,
    vip: 1
  };
  localStorage.setItem("locatm_user", JSON.stringify(currentUser));
  updateUserUI();
  document.getElementById("authScreen").style.display = "none";
  alert(`স্বাগতম! আপনার অ্যাকাউন্ট তৈরি হয়েছে। আপনার ইউনিক User ID: ${currentUser.userId}`);
}

function triggerLogout() {
  toggleDrawer(false);
  requestConfirm("আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?", () => {
    localStorage.removeItem("locatm_user");
    currentUser = null;
    document.getElementById("authScreen").style.display = "flex";
  });
}

function updateUserUI() {
  if (!currentUser) return;
  document.getElementById("headerUserIdBadge").innerText = `ID: ${currentUser.userId}`;
  document.getElementById("drawerUserName").innerText = currentUser.name;
  document.getElementById("drawerUserEmail").innerText = currentUser.email;
  document.getElementById("drawerUserId").innerText = `User ID: ${currentUser.userId}`;
  document.getElementById("mainBalance").innerText = `$${currentUser.mainBal.toFixed(2)}`;
  document.getElementById("lockedBalance").innerText = `$${currentUser.lockedBal.toFixed(2)}`;
  document.getElementById("coinBalance").innerText = currentUser.ltmBal.toFixed(2);
  document.getElementById("coinUsdVal").innerText = `($${(currentUser.ltmBal * ltmTokenPrice).toFixed(2)})`;
  document.getElementById("totalProfit").innerText = `$${currentUser.totalProfit.toFixed(2)}`;
  
  document.getElementById("profileName").innerText = currentUser.name;
  document.getElementById("profileEmail").innerText = currentUser.email;
  document.getElementById("profilePhone").innerText = currentUser.phone;
  document.getElementById("profileUserId").innerText = currentUser.userId;

  document.getElementById("myReferralLinkInput").value = `${window.location.origin}/?ref=${currentUser.userId}`;
}

// থ্রি-ডট ড্রয়ার
function toggleDrawer(open) {
  const d = document.getElementById("drawerMenu");
  const o = document.getElementById("drawerOverlay");
  if (open) {
    d.classList.add("open");
    o.style.display = "block";
  } else {
    d.classList.remove("open");
    o.style.display = "none";
  }
}

function openModalAndCloseDrawer(modalId) {
  toggleDrawer(false);
  openModal(modalId);
}

// ডিপোজিট প্রসেসিং
function initDepositDropdown() {
  const sel = document.getElementById("depositMethodSelect");
  if (!sel) return;
  sel.innerHTML = "";
  DEPOSIT_METHODS.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name;
    sel.appendChild(opt);
  });
  updateDepositDetails();
}

function updateDepositDetails() {
  const sel = document.getElementById("depositMethodSelect");
  const cur = DEPOSIT_METHODS.find(m => m.id === sel.value);
  if (cur) {
    document.getElementById("depositAddressText").innerHTML = `
      <strong>${cur.name}</strong><br>
      <span style="color:#38bdf8; word-break:break-all;" id="depAddrVal">${cur.address}</span><br>
      <small style="color:var(--text-muted);">${cur.note}</small>
    `;
  }
}

function copyDepositAddress() {
  const addr = document.getElementById("depAddrVal")?.innerText;
  if (addr) {
    navigator.clipboard.writeText(addr);
    alert("অ্যাড্রেস/নম্বর কপি করা হয়েছে: " + addr);
  }
}

function submitDeposit() {
  const amt = parseFloat(document.getElementById("depositAmountInput").value);
  const trx = document.getElementById("depositTrxInput").value.trim();

  if (isNaN(amt) || amt <= 0 || !trx) {
    alert("সঠিক অ্যামাউন্ট এবং Transaction ID লিখুন!");
    return;
  }
  closeModal("depositModal");

  requestConfirm(`আপনি কি নিশ্চিতভাবে ${amt} ডলারের ডিপোজিট রিকোয়েস্ট পাঠাতে চান?\n(TrxID: ${trx})`, () => {
    alert("ডিপোজিট রিকোয়েস্ট সফলভাবে অ্যাডমিন প্যানেলে পাঠানো হয়েছে!");
    document.getElementById("depositAmountInput").value = "";
    document.getElementById("depositTrxInput").value = "";
  });
}

// উত্তোলন
function submitWithdrawal() {
  const amt = parseFloat(document.getElementById("withdrawAmountInput").value);
  const method = document.getElementById("withdrawMethodSelect").value;
  const target = document.getElementById("withdrawAddressInput").value.trim();

  if (isNaN(amt) || amt < 50) {
    alert("ন্যূনতম উত্তোলন সীমা $৫০ ডলার!");
    return;
  }
  if (!target) {
    alert("আপনার ওয়ালেট অ্যাড্রেস বা ফোন নম্বর দিন!");
    return;
  }
  if (currentUser && amt > currentUser.mainBal) {
    alert("আপনার মেইন ব্যালেন্সে পর্যাপ্ত ডলার নেই!");
    return;
  }

  closeModal("withdrawModal");

  requestConfirm(`উত্তোলন নিশ্চিতকরণ:\nমেথড: ${method}\nপরিমাণ: $${amt}\nঅ্যাড্রেস: ${target}\nআপনি কি এগিয়ে যেতে চান?`, () => {
    if (currentUser) {
      currentUser.mainBal -= amt;
      localStorage.setItem("locatm_user", JSON.stringify(currentUser));
      updateUserUI();
    }
    alert("উত্তোলন রিকোয়েস্ট জমা হয়েছে! অ্যাডমিন পর্যালোচনার পর সম্পন্ন হবে।");
  });
}

// Trade LTM
function switchTradeMode(mode) {
  currentTradeMode = mode;
  if (mode === 'buy') {
    document.getElementById("tradeTabBuy").className = "btn btn-primary";
    document.getElementById("tradeTabSell").className = "btn btn-outline";
    document.getElementById("tradeInputLabel").innerText = "কত ডলারের LTM কয়েন কিনবেন ($):";
  } else {
    document.getElementById("tradeTabBuy").className = "btn btn-outline";
    document.getElementById("tradeTabSell").className = "btn btn-primary";
    document.getElementById("tradeInputLabel").innerText = "কতটি LTM কয়েন বিক্রি করবেন (Coin):";
  }
}

function processTradeLTM() {
  const val = parseFloat(document.getElementById("tradeAmountInput").value);
  if (isNaN(val) || val <= 0) {
    alert("সঠিক পরিমাণ লিখুন!");
    return;
  }

  closeModal("tradeModal");

  if (currentTradeMode === 'buy') {
    if (currentUser && currentUser.mainBal < val) {
      alert("মেইন ব্যালেন্সে পর্যাপ্ত ডলার নেই!");
      return;
    }
    const coinsToGet = val / ltmTokenPrice;
    requestConfirm(`আপনি কি নিশ্চিতভাবে $${val} ডলার দিয়ে ${coinsToGet.toFixed(2)} LTM কয়েন কিনতে চান?`, () => {
      if (currentUser) {
        currentUser.mainBal -= val;
        currentUser.ltmBal += coinsToGet;
        localStorage.setItem("locatm_user", JSON.stringify(currentUser));
        updateUserUI();
      }
      alert(`অভিনন্দন! আপনার ওয়ালেটে ${coinsToGet.toFixed(2)} LTM কয়েন যুক্ত হয়েছে।`);
    });
  } else {
    if (currentUser && currentUser.ltmBal < val) {
      alert("আপনার পর্যাপ্ত LTM কয়েন নেই!");
      return;
    }
    const usdToGet = val * ltmTokenPrice;
    requestConfirm(`আপনি কি নিশ্চিতভাবে ${val}টি LTM কয়েন বিক্রি করে $${usdToGet.toFixed(2)} ডলার নিতে চান?`, () => {
      if (currentUser) {
        currentUser.ltmBal -= val;
        currentUser.mainBal += usdToGet;
        localStorage.setItem("locatm_user", JSON.stringify(currentUser));
        updateUserUI();
      }
      alert(`বিক্রি সফল হয়েছে! আপনার মেইন ব্যালেন্সে $${usdToGet.toFixed(2)} ডলার যুক্ত হয়েছে।`);
    });
  }
}

// এসক্রো P2P ট্রান্সফার
function submitP2PTransfer() {
  const targetId = document.getElementById("p2pTargetIdInput").value.trim();
  const amt = parseFloat(document.getElementById("p2pAmountInput").value);

  if (!targetId || isNaN(amt) || amt <= 0) {
    alert("সঠিক User ID এবং অ্যামাউন্ট লিখুন!");
    return;
  }
  if (currentUser && currentUser.userId === targetId) {
    alert("নিজের আইডিতে নিজে ডলার পাঠানো সম্ভব নয়!");
    return;
  }
  if (currentUser && currentUser.mainBal < amt) {
    alert("আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!");
    return;
  }

  closeModal("p2pModal");

  requestConfirm(`আপনি কি নিশ্চিতভাবে ${targetId} আইডিতে $${amt} ট্রান্সফার করতে চান?`, () => {
    if (currentUser) {
      currentUser.mainBal -= amt;
      localStorage.setItem("locatm_user", JSON.stringify(currentUser));
      updateUserUI();
    }
    alert(`সফল হয়েছে! $${amt} সফলভাবে ইউজার ${targetId}-এর অ্যাকাউন্টে ট্রান্সফার করা হয়েছে।`);
  });
}

// এজেন্ট ডিরেক্টরি
function initAgentList() {
  const list = document.getElementById("agentDirectoryList");
  if (!list) return;
  list.innerHTML = "";

  AGENT_REGISTRY.forEach(ag => {
    const item = document.createElement("div");
    item.style.cssText = "background:var(--bg-main); border:1px solid var(--border); padding:12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;";
    item.innerHTML = `
      <div>
        <strong style="color:#f8fafc;">${ag.name}</strong> <span style="color:var(--gold); font-size:12px;">${ag.rating}</span><br>
        <small style="color:var(--text-muted);">${ag.location}</small><br>
        <small style="color:#38bdf8;">📞 ${ag.phone}</small>
      </div>
      <div style="display:flex; gap:6px;">
        <a href="tel:${ag.phone}" class="btn btn-outline" style="padding:6px 10px; font-size:12px; text-decoration:none;">📞 Call</a>
        <a href="https://wa.me/88${ag.phone}" target="_blank" class="btn btn-accent" style="padding:6px 10px; font-size:12px; text-decoration:none;">💬 WhatsApp</a>
      </div>
    `;
    list.appendChild(item);
  });
}

// ১০০+ কোম্পানি রেন্ডার (আসল লোগো ইমেজ ট্যাগ সহ)
let activeInvestStock = null;

function initStockMarket() {
  const grid = document.getElementById("stockGridContainer");
  if (!grid) return;
  grid.innerHTML = "";

  GLOBAL_STOCKS.forEach(stk => {
    const card = document.createElement("div");
    card.className = "stock-card";
    card.onclick = () => {
      activeInvestStock = stk;
      document.getElementById("investModalStockTitle").innerText = `Invest in ${stk.name}`;
      openModal("investModal");
    };
    // আসল ইমেজ লোগো, ইমেজ লোড না হলে অটোমেটিক ফলব্যাক টেক্সট
    card.innerHTML = `
      <div class="stock-logo" style="background:#1e293b; overflow:hidden;">
        <img src="${stk.logo}" alt="${stk.ticker}" style="width:100%; height:100%; object-fit:contain; padding:4px;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(stk.ticker)}&background=2563eb&color=fff';">
      </div>
      <h5 title="${stk.name}">${stk.name}</h5>
      <span>Min $${stk.min.toFixed(2)}</span>
    `;
    grid.appendChild(card);
  });
}

function confirmStockInvest() {
  const amt = parseFloat(document.getElementById("investStockAmount").value);
  if (isNaN(amt) || amt < 0.10) {
    alert("ন্যূনতম ইনভেস্টমেন্ট $0.10!");
    return;
  }
  if (currentUser && currentUser.mainBal < amt) {
    alert("আপনার ব্যালেন্স পর্যাপ্ত নেই! আগে ডিপোজিট করুন।");
    return;
  }

  closeModal("investModal");

  requestConfirm(`আপনি কি নিশ্চিতভাবে ${activeInvestStock.name}-এ $${amt} ইনভেস্ট করতে চান? (২৪ ঘণ্টা পর লাভ সহ যোগ হবে)`, () => {
    if (currentUser) {
      currentUser.mainBal -= amt;
      currentUser.lockedBal += amt;
      localStorage.setItem("locatm_user", JSON.stringify(currentUser));
      updateUserUI();
    }
    alert(`অভিনন্দন! $${amt} সফলভাবে ইনভেস্ট করা হয়েছে।`);
  });
}

// কাস্টম বাটন ও ভিডিও
function initDynamicButtons() {
  const bar = document.getElementById("customActionBar");
  if (!bar) return;

  const defaultButtons = [
    { title: "🏏 লাইভ ক্রিকেট ম্যাচ", url: "https://www.youtube.com/embed/live_stream?channel=CRICKET_ID", isEmbed: true },
    { title: "📢 টেলিগ্রাম অফিশিয়াল গ্রুপ", url: "https://t.me/locatm_official", isEmbed: false },
    { title: "🎁 ডেইলি ফ্রি লাকি স্পিন", url: "#", isEmbed: false }
  ];

  bar.innerHTML = "";
  defaultButtons.forEach(b => {
    const btn = document.createElement("button");
    btn.className = "dynamic-btn";
    btn.innerHTML = b.title;
    btn.onclick = () => {
      if (b.isEmbed) {
        launchInAppVideo(b.title, b.url);
      } else if (b.url !== "#") {
        window.open(b.url, "_blank");
      } else {
        alert("আজকের স্পিন সম্পন্ন হয়েছে! আগামীকাল আবার আসুন।");
      }
    };
    bar.appendChild(btn);
  });
}

function launchInAppVideo(title, embedUrl) {
  document.getElementById("videoPlayerTitle").innerText = title;
  document.getElementById("inAppIframe").src = embedUrl;
  openModal("inAppPlayerModal");
}

function closeVideoPlayer() {
  document.getElementById("inAppIframe").src = "";
  closeModal("inAppPlayerModal");
}

function initCompanyPosts() {
  const box = document.getElementById("companyPostsContainer");
  if (!box) return;
  box.innerHTML = `
    <div style="background:var(--bg-main); border:1px solid var(--border); padding:12px; border-radius:8px; margin-bottom:10px;">
      <h4 style="color:#38bdf8;">📌 Locatm কি এবং এটি কীভাবে কাজ করে?</h4>
      <p style="color:var(--text-muted); font-size:12px; margin-top:4px;">
        Locatm হলো একটি আধুনিক ডিসেন্ট্রালাইজড পকেট এটিএম এবং মাইক্রো-স্টক প্ল্যাটফর্ম। ব্যবহারকারীরা ১০০টির বেশি বৈশ্বিক প্রতিষ্ঠানে মাইক্রো-ইনভেস্ট করে ২৪ ঘণ্টার সাইকেলে নিশ্চিত ক্যাশব্যাক লাভ করতে পারেন।
      </p>
    </div>
  `;
}

function applyColorTheme(themeName) {
  document.body.className = themeName;
}

function changeLanguage(lang) {
  alert(`ভাষা পরিবর্তন করা হয়েছে: ${lang.toUpperCase()}`);
}

// সর্বজনীন ডাবল কনফার্মেশন (Yes / No)
function requestConfirm(msg, callback) {
  document.getElementById("confirmMessage").innerText = msg;
  pendingConfirmCallback = callback;
  openModal("confirmModal");
}

document.getElementById("confirmOkBtn").addEventListener("click", () => {
  closeModal("confirmModal");
  if (typeof pendingConfirmCallback === "function") {
    pendingConfirmCallback();
    pendingConfirmCallback = null;
  }
});

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "flex";
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "none";
}

function copyReferralLink() {
  const l = document.getElementById("myReferralLinkInput");
  l.select();
  navigator.clipboard.writeText(l.value);
  alert("রেফারেল লিংক কপি হয়েছে!");
}