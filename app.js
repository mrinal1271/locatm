/**
 * ====================================================================
 * Locatm - Ultra Client Engine (app.js) [100% Direct Cloud Sync]
 * ====================================================================
 * সরাসরি ক্লাউড ডাটাবেজ (Supabase) এর সাথে লাইভ সিঙ্ক।
 */

let currentUser = null;
let pendingConfirmCallback = null;
let currentTradeMode = 'buy';

let platformConfig = {
  ltm_rate: 0.10,
  stock_profit_settings: { mode: 'auto', min_percent: -5.0, max_percent: 5.0, manual_overrides: {} },
  feature_toggles: { agent_system: false, withdrawals: true, investments: true, p2p: true, trade_ltm: true },
  deposit_methods: [],
  custom_buttons: [],
  company_posts: [],
  marquee_notice: "",
  tutorial_video_url: ""
};

// ১০০+ গ্লোবাল স্টক কোম্পানি
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

// ক্লাউড ডেটাবেজ ক্লায়েন্ট নিশ্চিতকরণ
function getDB() {
  if (typeof getDatabaseClient === 'function') {
    return getDatabaseClient();
  }
  return window.db || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  initStockMarket();
  await loadPlatformConfig();
  await checkSavedAuth();
});

// ১. ক্লাউড কনফিগারেশন সরাসরি লোড
async function loadPlatformConfig() {
  const dbClient = getDB();
  if (!dbClient) return;

  try {
    const { data, error } = await dbClient.from('platform_settings').select('*');
    if (!error && data) {
      data.forEach(item => {
        platformConfig[item.key] = item.value;
      });
    }
  } catch (e) {
    console.error("Config fetch error:", e);
  }

  // রিয়েল-টাইম রেট ও নোটিস আপডেট
  if (document.getElementById("tradeCoinRate")) {
    document.getElementById("tradeCoinRate").innerText = `$${parseFloat(platformConfig.ltm_rate || 0.10).toFixed(2)}`;
  }
  if (platformConfig.marquee_notice && platformConfig.marquee_notice.trim() !== "") {
    document.getElementById("marqueeNoticeText").innerText = platformConfig.marquee_notice;
    document.getElementById("marqueeBarContainer").style.display = "flex";
  } else {
    document.getElementById("marqueeBarContainer").style.display = "none";
  }
  if (platformConfig.tutorial_video_url && platformConfig.tutorial_video_url.trim() !== "") {
    document.getElementById("tutorialVideoIframe").src = platformConfig.tutorial_video_url;
  }

  renderDepositMethods();
  renderDynamicButtons();
  renderCompanyPosts();
  await renderAgentDirectory();
}

// ২. অথেন্টিকেশন ও সেশন (সরাসরি ক্লাউড ডাটাবেজ থেকে)
async function checkSavedAuth() {
  const savedUserId = localStorage.getItem("locatm_session_uid");
  const dbClient = getDB();
  if (savedUserId && dbClient) {
    try {
      const { data: user, error } = await dbClient.from('users').select('*').eq('user_id', savedUserId).maybeSingle();
      if (!error && user) {
        currentUser = user;
        updateUserUI();
        document.getElementById("authScreen").style.display = "none";
        await checkInvestmentsExpiry();
        return;
      }
    } catch (e) {
      console.error("Session check error:", e);
    }
  }
  document.getElementById("authScreen").style.display = "flex";
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

// ৩. সরাসরি ক্লাউড লগইন
async function handleLogin() {
  const ident = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  if (!ident || !pass) {
    alert("অনুগ্রহ করে ইমেইল/ফোন এবং পাসওয়ার্ড দিন!");
    return;
  }

  const dbClient = getDB();
  if (!dbClient) {
    alert("ডাটাবেজ কানেক্ট হচ্ছে, অনুগ্রহ করে ৫ সেকেন্ড অপেক্ষা করুন...");
    return;
  }

  try {
    const { data: users, error } = await dbClient.from('users')
      .select('*')
      .or(`email.eq.${ident},phone.eq.${ident}`);

    if (error) {
      alert("ডাটাবেজ এরর: " + error.message);
      return;
    }

    const matchedUser = users ? users.find(u => u.password === pass) : null;
    if (!matchedUser) {
      alert("লগইন ব্যর্থ! ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
      return;
    }

    currentUser = matchedUser;
    localStorage.setItem("locatm_session_uid", matchedUser.user_id);
    updateUserUI();
    document.getElementById("authScreen").style.display = "none";
    await loadPlatformConfig();
    await checkInvestmentsExpiry();
    alert(`স্বাগতম ${matchedUser.name}! সফলভাবে লগইন হয়েছে।`);
  } catch (err) {
    alert("লগইন সমস্যা: " + err.message);
  }
}

// ৪. সরাসরি ক্লাউড সাইন-আপ (জিরো ডেমো)
async function handleSignup() {
  const nm = document.getElementById("regName").value.trim();
  const em = document.getElementById("regEmail").value.trim();
  const ph = document.getElementById("regPhone").value.trim();
  const ps = document.getElementById("regPass").value.trim();
  const ref = document.getElementById("regRef").value.trim();

  if (!nm || !em || !ph || !ps) {
    alert("অনুগ্রহ করে সবগুলো তথ্য পূরণ করুন!");
    return;
  }
  if (ps.length < 6) {
    alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!");
    return;
  }

  const dbClient = getDB();
  if (!dbClient) {
    alert("ডাটাবেজ কানেক্ট হচ্ছে, অনুগ্রহ করে ৫ সেকেন্ড অপেক্ষা করুন...");
    return;
  }

  try {
    const { data: existing, error: checkErr } = await dbClient.from('users')
      .select('id')
      .or(`email.eq.${em},phone.eq.${ph}`);

    if (!checkErr && existing && existing.length > 0) {
      alert("এই ইমেইল বা ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে! অনুগ্রহ করে লগইন করুন।");
      return;
    }

    const newUserId = "LTM" + Math.floor(100000 + Math.random() * 900000);

    const newUserPayload = {
      user_id: newUserId,
      name: nm,
      email: em,
      phone: ph,
      password: ps,
      main_balance: 0.00,
      locked_balance: 0.00,
      ltm_balance: 0.00,
      total_profit: 0.00,
      vip_level: 1,
      referred_by: ref || null,
      is_agent: false
    };

    const { data, error } = await dbClient.from('users').insert([newUserPayload]).select().single();

    if (error) {
      alert("অ্যাকাউন্ট তৈরি ব্যর্থ: " + error.message);
      return;
    }

    currentUser = data;
    localStorage.setItem("locatm_session_uid", data.user_id);
    updateUserUI();
    document.getElementById("authScreen").style.display = "none";
    alert(`অভিনন্দন! আপনার অ্যাকাউন্ট ক্লাউডে সফলভাবে তৈরি হয়েছে। User ID: ${currentUser.user_id}`);
  } catch (err) {
    alert("সাইন-আপ সমস্যা: " + err.message);
  }
}

function triggerLogout() {
  toggleDrawer(false);
  requestConfirm("আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট থেকে লগআউট করতে চান?", () => {
    localStorage.removeItem("locatm_session_uid");
    currentUser = null;
    document.getElementById("authScreen").style.display = "flex";
  });
}

function updateUserUI() {
  if (!currentUser) return;
  document.getElementById("headerUserIdBadge").innerText = `ID: ${currentUser.user_id}`;
  document.getElementById("drawerUserName").innerText = currentUser.name;
  document.getElementById("drawerUserEmail").innerText = currentUser.email;
  document.getElementById("drawerUserId").innerText = `User ID: ${currentUser.user_id}`;
  document.getElementById("mainBalance").innerText = `$${parseFloat(currentUser.main_balance || 0).toFixed(2)}`;
  document.getElementById("lockedBalance").innerText = `$${parseFloat(currentUser.locked_balance || 0).toFixed(2)}`;
  document.getElementById("coinBalance").innerText = parseFloat(currentUser.ltm_balance || 0).toFixed(2);
  document.getElementById("coinUsdVal").innerText = `($${(parseFloat(currentUser.ltm_balance || 0) * (platformConfig.ltm_rate || 0.10)).toFixed(2)})`;
  document.getElementById("totalProfit").innerText = `$${parseFloat(currentUser.total_profit || 0).toFixed(2)}`;
  
  document.getElementById("profileName").innerText = currentUser.name;
  document.getElementById("profileEmail").innerText = currentUser.email;
  document.getElementById("profilePhone").innerText = currentUser.phone;
  document.getElementById("profileUserId").innerText = currentUser.user_id;

  document.getElementById("myReferralLinkInput").value = `${window.location.origin}/?ref=${currentUser.user_id}`;
}

// ড্রয়ার ও মোডাল লজিক
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

// ৫. ডিপোজিট সাবমিট (সরাসরি ক্লাউড টেবিলে জমা)
function renderDepositMethods() {
  const sel = document.getElementById("depositMethodSelect");
  if (!sel) return;
  sel.innerHTML = "";

  const methods = platformConfig.deposit_methods || [];
  if (methods.length === 0) {
    sel.innerHTML = "<option>কোনো ডিপোজিট মেথড সক্রিয় নেই</option>";
    document.getElementById("depositAddressText").innerText = "বর্তমানে ডিপোজিট সাময়িকভাবে বন্ধ আছে।";
    return;
  }

  methods.forEach((m, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = m.name;
    sel.appendChild(opt);
  });
  onDepositMethodChange();
}

function onDepositMethodChange() {
  const sel = document.getElementById("depositMethodSelect");
  const idx = parseInt(sel.value);
  const cur = platformConfig.deposit_methods[idx];
  if (cur) {
    document.getElementById("depositAddressText").innerHTML = `
      <strong>${cur.name}</strong><br>
      <span style="color:#38bdf8; word-break:break-all;" id="depAddrVal">${cur.address}</span><br>
      <small style="color:var(--text-muted);">${cur.note || ''}</small>
    `;
  }
}

function copyDepositAddress() {
  const addr = document.getElementById("depAddrVal")?.innerText;
  if (addr) {
    navigator.clipboard.writeText(addr);
    alert("কপি করা হয়েছে: " + addr);
  }
}

async function submitDeposit() {
  const sel = document.getElementById("depositMethodSelect");
  const idx = parseInt(sel.value);
  const curMethod = platformConfig.deposit_methods[idx];
  const amt = parseFloat(document.getElementById("depositAmountInput").value);
  const trx = document.getElementById("depositTrxInput").value.trim();

  if (!curMethod || isNaN(amt) || amt <= 0 || !trx) {
    alert("সঠিক পরিমাণ এবং Transaction ID লিখুন!");
    return;
  }

  closeModal("depositModal");

  requestConfirm(`আপনি কি নিশ্চিতভাবে $${amt} ডিপোজিটের রিকোয়েস্ট পাঠাতে চান?\n(TrxID: ${trx})`, async () => {
    const dbClient = getDB();
    const { error } = await dbClient.from('transactions').insert([{
      user_id: currentUser.user_id,
      type: 'deposit',
      amount: amt,
      method: curMethod.name,
      trx_id: trx,
      status: 'pending'
    }]);

    if (!error) {
      alert("ডিপোজিট রিকোয়েস্ট সরাসরি অ্যাডমিন প্যানেলে জমা হয়েছে! অ্যাডমিন পর্যালোচনার পর ব্যালেন্স যুক্ত হবে।");
      document.getElementById("depositAmountInput").value = "";
      document.getElementById("depositTrxInput").value = "";
    } else {
      alert("রিকোয়েস্ট জমা দেওয়া সম্ভব হয়নি: " + error.message);
    }
  });
}

// ৬. উত্তোলন (সরাসরি ক্লাউড টেবিলে জমা ও ব্যালেন্স ডিডাক্ট)
async function submitWithdrawal() {
  if (platformConfig.feature_toggles && platformConfig.feature_toggles.withdrawals === false) {
    alert("কোম্পানি সরাসরি উত্তোলন বর্তমানে বন্ধ আছে।");
    return;
  }

  const amt = parseFloat(document.getElementById("withdrawAmountInput").value);
  const method = document.getElementById("withdrawMethodSelect").value;
  const target = document.getElementById("withdrawAddressInput").value.trim();

  if (isNaN(amt) || amt < 50) {
    alert("ন্যূনতম উত্তোলন সীমা $৫০ ডলার!");
    return;
  }
  if (!target) {
    alert("ওয়ালেট নম্বর বা ঠিকানা দিন!");
    return;
  }
  if (parseFloat(currentUser.main_balance) < amt) {
    alert("আপনার ব্যালেন্স পর্যাপ্ত নেই!");
    return;
  }

  closeModal("withdrawModal");

  requestConfirm(`উত্তোলন নিশ্চিতকরণ:\nমেথড: ${method}\nপরিমাণ: $${amt}\nঅ্যাকাউন্ট: ${target}`, async () => {
    const dbClient = getDB();
    const newBal = parseFloat(currentUser.main_balance) - amt;

    const { error: uErr } = await dbClient.from('users').update({ main_balance: newBal }).eq('user_id', currentUser.user_id);
    if (uErr) {
      alert("উত্তোলন ব্যর্থ: " + uErr.message);
      return;
    }

    await dbClient.from('transactions').insert([{
      user_id: currentUser.user_id,
      type: 'withdraw',
      amount: amt,
      method: `${method} (${target})`,
      status: 'pending'
    }]);

    currentUser.main_balance = newBal;
    updateUserUI();
    alert("উত্তোলন রিকোয়েস্ট সফলভাবে জমা হয়েছে!");
  });
}

// ৭. Trade LTM
function switchTradeMode(mode) {
  currentTradeMode = mode;
  if (mode === 'buy') {
    document.getElementById("tradeTabBuy").className = "btn btn-primary";
    document.getElementById("tradeTabSell").className = "btn btn-outline";
    document.getElementById("tradeInputLabel").innerText = "কত ডলারের LTM কিনবেন ($):";
  } else {
    document.getElementById("tradeTabBuy").className = "btn btn-outline";
    document.getElementById("tradeTabSell").className = "btn btn-primary";
    document.getElementById("tradeInputLabel").innerText = "কতটি LTM বিক্রি করবেন (Coin):";
  }
}

async function processTradeLTM() {
  if (platformConfig.feature_toggles && platformConfig.feature_toggles.trade_ltm === false) {
    alert("ট্রেড মার্কেট বর্তমানে বন্ধ আছে।");
    return;
  }

  const val = parseFloat(document.getElementById("tradeAmountInput").value);
  if (isNaN(val) || val <= 0) {
    alert("সঠিক পরিমাণ লিখুন!");
    return;
  }

  closeModal("tradeModal");
  const rate = parseFloat(platformConfig.ltm_rate || 0.10);
  const dbClient = getDB();

  if (currentTradeMode === 'buy') {
    if (parseFloat(currentUser.main_balance) < val) {
      alert("মেইন ব্যালেন্সে পর্যাপ্ত ডলার নেই!");
      return;
    }
    const coinsToGet = val / rate;
    requestConfirm(`আপনি কি নিশ্চিতভাবে $${val} ডলার দিয়ে ${coinsToGet.toFixed(2)} LTM কিনতে চান?`, async () => {
      const newMain = parseFloat(currentUser.main_balance) - val;
      const newLtm = parseFloat(currentUser.ltm_balance) + coinsToGet;

      await dbClient.from('users').update({ main_balance: newMain, ltm_balance: newLtm }).eq('user_id', currentUser.user_id);
      currentUser.main_balance = newMain;
      currentUser.ltm_balance = newLtm;
      updateUserUI();
      alert(`সফলভাবে ${coinsToGet.toFixed(2)} LTM কেনা হয়েছে!`);
    });
  } else {
    if (parseFloat(currentUser.ltm_balance) < val) {
      alert("পর্যাপ্ত LTM টোকেন নেই!");
      return;
    }
    const usdToGet = val * rate;
    requestConfirm(`আপনি কি নিশ্চিতভাবে ${val} LTM বিক্রি করে $${usdToGet.toFixed(2)} নিতে চান?`, async () => {
      const newLtm = parseFloat(currentUser.ltm_balance) - val;
      const newMain = parseFloat(currentUser.main_balance) + usdToGet;

      await dbClient.from('users').update({ main_balance: newMain, ltm_balance: newLtm }).eq('user_id', currentUser.user_id);
      currentUser.main_balance = newMain;
      currentUser.ltm_balance = newLtm;
      updateUserUI();
      alert(`বিক্রি সফল! মেইন ব্যালেন্সে $${usdToGet.toFixed(2)} যুক্ত হয়েছে।`);
    });
  }
}

// ৮. P2P ট্রান্সফার (ক্লাউড এসক্রো)
async function submitP2PTransfer() {
  if (platformConfig.feature_toggles && platformConfig.feature_toggles.p2p === false) {
    alert("P2P ট্রান্সফার বর্তমানে বন্ধ আছে।");
    return;
  }

  const targetId = document.getElementById("p2pTargetIdInput").value.trim();
  const amt = parseFloat(document.getElementById("p2pAmountInput").value);

  if (!targetId || isNaN(amt) || amt <= 0) {
    alert("সঠিক User ID এবং পরিমাণ দিন!");
    return;
  }
  if (currentUser.user_id === targetId) {
    alert("নিজের আইডিতে পাঠানো সম্ভব নয়!");
    return;
  }
  if (parseFloat(currentUser.main_balance) < amt) {
    alert("পর্যাপ্ত ব্যালেন্স নেই!");
    return;
  }

  const dbClient = getDB();
  const { data: recipient, error } = await dbClient.from('users').select('*').eq('user_id', targetId).maybeSingle();
  if (error || !recipient) {
    alert("এই User ID-এর কোনো মেম্বার ক্লাউড ডাটাবেজে পাওয়া যায়নি!");
    return;
  }

  closeModal("p2pModal");

  requestConfirm(`${recipient.name} (${targetId})-কে $${amt} ট্রান্সফার করতে চান?`, async () => {
    const senderBal = parseFloat(currentUser.main_balance) - amt;
    const recBal = parseFloat(recipient.main_balance) + amt;

    await dbClient.from('users').update({ main_balance: senderBal }).eq('user_id', currentUser.user_id);
    await dbClient.from('users').update({ main_balance: recBal }).eq('user_id', targetId);

    await dbClient.from('transactions').insert([
      { user_id: currentUser.user_id, type: 'p2p_send', amount: amt, target_user_id: targetId, status: 'approved' },
      { user_id: targetId, type: 'p2p_receive', amount: amt, target_user_id: currentUser.user_id, status: 'approved' }
    ]);

    currentUser.main_balance = senderBal;
    updateUserUI();
    alert(`$${amt} সফলভাবে ট্রান্সফার হয়েছে!`);
  });
}

// ৯. এজেন্ট আবেদন ও ভেরিফায়েড ডিরেক্টরি
async function submitAgentApplication() {
  const shop = document.getElementById("agentShopInput").value.trim();
  const phone = document.getElementById("agentPhoneInput").value.trim();
  const loc = document.getElementById("agentLocationInput").value.trim();

  if (!shop || !phone || !loc) {
    alert("সব তথ্য সঠিকভাবে দিন!");
    return;
  }

  closeModal("agentApplyModal");
  const dbClient = getDB();

  const { error } = await dbClient.from('agent_applications').insert([{
    user_id: currentUser.user_id,
    shop_name: shop,
    phone: phone,
    location: loc,
    status: 'pending'
  }]);

  if (!error) {
    alert("আবেদন সরাসরি অ্যাডমিন প্যানেলে জমা হয়েছে! পর্যালোচনার পর অ্যাপ্রুভ করা হবে।");
  } else {
    alert("আবেদন জমা হয়নি: " + error.message);
  }
}

async function renderAgentDirectory() {
  const list = document.getElementById("agentDirectoryList");
  if (!list) return;
  list.innerHTML = "";

  if (platformConfig.feature_toggles && platformConfig.feature_toggles.agent_system === false) {
    list.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">এজেন্ট ক্যাশ-আউট নেটওয়ার্ক বর্তমানে প্রস্তুত করা হচ্ছে। শীঘ্রই চালু হবে।</div>`;
    return;
  }

  const dbClient = getDB();
  const { data: agents } = await dbClient.from('agent_applications').select('*').eq('status', 'approved');

  if (!agents || agents.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">বর্তমানে কোনো অনুমোদিত এজেন্ট নেই।</div>`;
    return;
  }

  agents.forEach(ag => {
    const item = document.createElement("div");
    item.style.cssText = "background:rgba(11,17,32,0.8); border:1px solid var(--glass-border); padding:12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;";
    item.innerHTML = `
      <div>
        <strong style="color:#fff;">${ag.shop_name}</strong><br>
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

// ১০. স্টক মার্কেট ও আপনার চাওয়া -৫% থেকে +৫% কমিশন রেঞ্জ
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
    card.innerHTML = `
      <div class="stock-logo">
        <img src="${stk.logo}" alt="${stk.ticker}" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(stk.ticker)}&background=2563eb&color=fff';">
      </div>
      <h5 title="${stk.name}">${stk.name}</h5>
      <span>Min $${stk.min.toFixed(2)}</span>
    `;
    grid.appendChild(card);
  });
}

async function confirmStockInvest() {
  if (platformConfig.feature_toggles && platformConfig.feature_toggles.investments === false) {
    alert("ইনভেস্টমেন্ট সিস্টেম বন্ধ আছে।");
    return;
  }

  const amt = parseFloat(document.getElementById("investStockAmount").value);
  if (isNaN(amt) || amt < 0.10) {
    alert("ন্যূনতম ইনভেস্টমেন্ট $0.10!");
    return;
  }
  if (parseFloat(currentUser.main_balance) < amt) {
    alert("আপনার ব্যালেন্স পর্যাপ্ত নেই!");
    return;
  }

  closeModal("investModal");

  const settings = platformConfig.stock_profit_settings || {};
  let finalRate = 0;
  if (settings.manual_overrides && settings.manual_overrides[activeInvestStock.id] !== undefined) {
    finalRate = parseFloat(settings.manual_overrides[activeInvestStock.id]);
  } else {
    const minP = parseFloat(settings.min_percent !== undefined ? settings.min_percent : -5.0);
    const maxP = parseFloat(settings.max_percent !== undefined ? settings.max_percent : 5.0);
    finalRate = parseFloat((Math.random() * (maxP - minP) + minP).toFixed(2));
  }

  requestConfirm(`আপনি কি নিশ্চিতভাবে ${activeInvestStock.name}-এ $${amt} ইনভেস্ট করতে চান?\n(২৪ ঘণ্টা সাইকেল, রেট: ${finalRate > 0 ? '+' : ''}${finalRate}%)`, async () => {
    const dbClient = getDB();
    const newMain = parseFloat(currentUser.main_balance) - amt;
    const newLocked = parseFloat(currentUser.locked_balance) + amt;

    await dbClient.from('users').update({ main_balance: newMain, locked_balance: newLocked }).eq('user_id', currentUser.user_id);
    await dbClient.from('investments').insert([{
      user_id: currentUser.user_id,
      stock_name: activeInvestStock.name,
      amount: amt,
      profit_percent: finalRate,
      status: 'active'
    }]);

    currentUser.main_balance = newMain;
    currentUser.locked_balance = newLocked;
    updateUserUI();
    await checkInvestmentsExpiry();
    alert(`$${amt} সফলভাবে ইনভেস্ট হয়েছে!`);
  });
}

async function checkInvestmentsExpiry() {
  if (!currentUser) return;
  const dbClient = getDB();
  if (!dbClient) return;

  const { data: list } = await dbClient.from('investments')
    .select('*')
    .eq('user_id', currentUser.user_id)
    .eq('status', 'active');

  const container = document.getElementById("activeInvestList");

  if (!list || list.length === 0) {
    if (container) {
      container.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid var(--glass-border); padding:16px; border-radius:14px; color:var(--text-muted); font-size:13px; text-align:center;">
          বর্তমানে কোনো ইনভেস্টমেন্ট সক্রিয় নেই।
        </div>
      `;
    }
    return;
  }

  if (container) {
    container.innerHTML = "";
    list.forEach(i => {
      const d = document.createElement("div");
      d.style.cssText = "background:var(--bg-card); border:1px solid var(--glass-border); padding:14px; border-radius:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;";
      d.innerHTML = `
        <div>
          <strong style="color:#38bdf8;">${i.stock_name}</strong><br>
          <small style="color:var(--text-muted);">ইনভেস্ট: $${parseFloat(i.amount).toFixed(2)}</small>
        </div>
        <div style="text-align:right;">
          <span style="color:${i.profit_percent >= 0 ? 'var(--accent)' : 'var(--danger)'}; font-weight:700;">${i.profit_percent >= 0 ? '+' : ''}${i.profit_percent}%</span><br>
          <small style="color:var(--gold);">চলমান (Active)</small>
        </div>
      `;
      container.appendChild(d);
    });
  }

  const now = new Date();
  for (let inv of list) {
    if (new Date(inv.ends_at) <= now) {
      const capital = parseFloat(inv.amount);
      const profit = capital * (parseFloat(inv.profit_percent) / 100);
      const totalReturn = capital + profit;

      const updatedMain = parseFloat(currentUser.main_balance) + totalReturn;
      const updatedLocked = parseFloat(currentUser.locked_balance) - capital;
      const updatedTotalProfit = parseFloat(currentUser.total_profit) + profit;

      await dbClient.from('users').update({
        main_balance: updatedMain,
        locked_balance: updatedLocked,
        total_profit: updatedTotalProfit
      }).eq('user_id', currentUser.user_id);

      await dbClient.from('investments').update({ status: 'completed' }).eq('id', inv.id);

      currentUser.main_balance = updatedMain;
      currentUser.locked_balance = updatedLocked;
      currentUser.total_profit = updatedTotalProfit;
      updateUserUI();
    }
  }
}

// ১১. ডায়নামিক বাটন ও ভিডিও
function renderDynamicButtons() {
  const wrapper = document.getElementById("dynamicActionBarWrapper");
  const bar = document.getElementById("customActionBar");
  if (!wrapper || !bar) return;

  const btns = platformConfig.custom_buttons || [];
  if (btns.length === 0) {
    wrapper.style.display = "none";
    return;
  }

  bar.innerHTML = "";
  wrapper.style.display = "block";

  btns.forEach(b => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline";
    btn.style.cssText = "flex:1; min-width:140px; padding:12px; font-size:13px;";
    btn.innerText = b.title;
    btn.onclick = () => {
      if (b.isEmbed) {
        launchInAppVideo(b.title, b.url);
      } else {
        window.open(b.url, "_blank");
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

function renderCompanyPosts() {
  const box = document.getElementById("companyPostsContainer");
  if (!box) return;
  box.innerHTML = "";

  const posts = platformConfig.company_posts || [];
  if (posts.length === 0) {
    box.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted);">বর্তমানে কোনো নোটিস নেই।</div>`;
    return;
  }

  posts.forEach(p => {
    const item = document.createElement("div");
    item.style.cssText = "background:rgba(11,17,32,0.8); border:1px solid var(--glass-border); padding:12px; border-radius:12px; margin-bottom:10px;";
    item.innerHTML = `<h4 style="color:#38bdf8; margin-bottom:4px;">${p.title}</h4><p style="color:var(--text-muted); font-size:12px;">${p.content}</p>`;
    box.appendChild(item);
  });
}

// কনফার্মেশন ও মোডাল হেল্পার
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