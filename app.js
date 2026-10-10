/**
 * ====================================================================
 * Locatm - Frontend Engine (app.js)
 * ====================================================================
 * সকল ইউজার অ্যাকশন, ১০০+ ইউনিক স্টক মার্কেট জেনারেশন, 
 * এজেন্ট হায়ারার্কিকাল ফিল্টারিং, ফিচার সুইচ চেকার এবং
 * বাধ্যতামূলক Yes/No ডাবল কনফার্মেশন হ্যান্ডলার।
 */

// ১. Supabase ক্লায়েন্ট ইনিশিয়ালাইজেশন
let supabaseClient = null;
if (typeof supabase !== 'undefined' && window.CONFIG) {
  supabaseClient = supabase.createClient(
    window.CONFIG.SUPABASE.URL,
    window.CONFIG.SUPABASE.ANON_KEY
  );
}

// ২. ১০০+ ইউনিক গ্লোবাল কোম্পানি ডেটাবেজ (লোগো, নাম, টিকার ও ব্র্যান্ড কালার)
const GLOBAL_STOCKS = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL", logo: "🍎", bg: "#1e293b", min: 0.10 },
  { id: 2, name: "Microsoft Corp.", ticker: "MSFT", logo: "🪟", bg: "#0f172a", min: 0.10 },
  { id: 3, name: "Google Alphabet", ticker: "GOOGL", logo: "🌐", bg: "#1e1b4b", min: 0.10 },
  { id: 4, name: "Amazon.com Inc.", ticker: "AMZN", logo: "📦", bg: "#2d1b0d", min: 0.10 },
  { id: 5, name: "Nvidia Corp.", ticker: "NVDA", logo: "⚡", bg: "#0d2818", min: 0.10 },
  { id: 6, name: "Tesla Motors", ticker: "TSLA", logo: "🚗", bg: "#2b090a", min: 0.10 },
  { id: 7, name: "Meta Platforms", ticker: "META", logo: "♾️", bg: "#082f49", min: 0.10 },
  { id: 8, name: "Berkshire Hathaway", ticker: "BRK", logo: "🏦", bg: "#1e293b", min: 0.10 },
  { id: 9, name: "Taiwan Semi (TSMC)", ticker: "TSM", logo: "💾", bg: "#111827", min: 0.10 },
  { id: 10, name: "Tencent Holdings", ticker: "TCEHY", logo: "🐧", bg: "#075985", min: 0.10 },
  { id: 11, name: "Samsung Electronics", ticker: "SSNG", logo: "📱", bg: "#1e3a8a", min: 0.10 },
  { id: 12, name: "Visa International", ticker: "V", logo: "💳", bg: "#1e1b4b", min: 0.10 },
  { id: 13, name: "Mastercard Inc.", ticker: "MA", logo: "🔴", bg: "#431407", min: 0.10 },
  { id: 14, name: "JPMorgan Chase", ticker: "JPM", logo: "🏛️", bg: "#0f172a", min: 0.10 },
  { id: 15, name: "Johnson & Johnson", ticker: "JNJ", logo: "💊", bg: "#7f1d1d", min: 0.10 },
  { id: 16, name: "Walmart Global", ticker: "WMT", logo: "🛒", bg: "#1e3a8a", min: 0.10 },
  { id: 17, name: "Procter & Gamble", ticker: "PG", logo: "🧼", bg: "#14532d", min: 0.10 },
  { id: 18, name: "Oracle Corp.", ticker: "ORCL", logo: "📊", bg: "#7f1d1d", min: 0.10 },
  { id: 19, name: "ASML Holding", ticker: "ASML", logo: "🔬", bg: "#1e293b", min: 0.10 },
  { id: 20, name: "Toyota Motor Corp.", ticker: "TM", logo: "🚘", bg: "#450a0a", min: 0.10 },
  { id: 21, name: "Alibaba Group", ticker: "BABA", logo: "🛍️", bg: "#7c2d12", min: 0.10 },
  { id: 22, name: "Coca-Cola Company", ticker: "KO", logo: "🥤", bg: "#991b1b", min: 0.10 },
  { id: 23, name: "PepsiCo International", ticker: "PEP", logo: "🥫", bg: "#1e3a8a", min: 0.10 },
  { id: 24, name: "Costco Wholesale", ticker: "COST", logo: "🏬", bg: "#082f49", min: 0.10 },
  { id: 25, name: "Netflix Streaming", ticker: "NFLX", logo: "🎬", bg: "#450a0a", min: 0.10 },
  { id: 26, name: "Broadcom Inc.", ticker: "AVGO", logo: "📡", bg: "#111827", min: 0.10 },
  { id: 27, name: "Cisco Systems", ticker: "CSCO", logo: "🖧", bg: "#075985", min: 0.10 },
  { id: 28, name: "Adobe Creative", ticker: "ADBE", logo: "🎨", bg: "#831843", min: 0.10 },
  { id: 29, name: "Walt Disney Co.", ticker: "DIS", logo: "🏰", bg: "#1e1b4b", min: 0.10 },
  { id: 30, name: "Shell Energy", ticker: "SHEL", logo: "🐚", bg: "#713f12", min: 0.10 },
  { id: 31, name: "Exxon Mobil", ticker: "XOM", logo: "⛽", bg: "#7f1d1d", min: 0.10 },
  { id: 32, name: "Chevron Oil", ticker: "CVX", logo: "🛢️", bg: "#1e3a8a", min: 0.10 },
  { id: 33, name: "Sony Group", ticker: "SONY", logo: "🎮", bg: "#0f172a", min: 0.10 },
  { id: 34, name: "Intel Corp.", ticker: "INTC", logo: "💻", bg: "#0369a1", min: 0.10 },
  { id: 35, name: "AMD Micro Devices", ticker: "AMD", logo: "⚙️", bg: "#14532d", min: 0.10 },
  { id: 36, name: "Qualcomm Tech", ticker: "QCOM", logo: "📶", bg: "#1e293b", min: 0.10 },
  { id: 37, name: "Nike Athletics", ticker: "NKE", logo: "👟", bg: "#09090b", min: 0.10 },
  { id: 38, name: "McDonald's Corp.", ticker: "MCD", logo: "🍔", bg: "#713f12", min: 0.10 },
  { id: 39, name: "Starbucks Coffee", ticker: "SBUX", logo: "☕", bg: "#064e3b", min: 0.10 },
  { id: 40, name: "Pfizer Health", ticker: "PFE", logo: "🧬", bg: "#1e3a8a", min: 0.10 },
  { id: 41, name: "AstraZeneca", ticker: "AZN", logo: "🧪", bg: "#4c1d95", min: 0.10 },
  { id: 42, name: "Novartis Pharma", ticker: "NVS", logo: "🔬", bg: "#701a75", min: 0.10 },
  { id: 43, name: "SAP Software", ticker: "SAP", logo: "💻", bg: "#0f172a", min: 0.10 },
  { id: 44, name: "Siemens Energy", ticker: "SIE", logo: "💡", bg: "#134e4a", min: 0.10 },
  { id: 45, name: "IBM Computing", ticker: "IBM", logo: "🖥️", bg: "#1e3a8a", min: 0.10 },
  { id: 46, name: "Airbus Aerospace", ticker: "AIR", logo: "✈️", bg: "#075985", min: 0.10 },
  { id: 47, name: "Boeing Aviation", ticker: "BA", logo: "🛫", bg: "#1e1b4b", min: 0.10 },
  { id: 48, name: "SpaceX Starlink", ticker: "SPCX", logo: "🚀", bg: "#0f172a", min: 0.10 },
  { id: 49, name: "Uber Technologies", ticker: "UBER", logo: "🚕", bg: "#18181b", min: 0.10 },
  { id: 50, name: "Spotify Music", ticker: "SPOT", logo: "🎧", bg: "#065f46", min: 0.10 },
  { id: 51, name: "Airbnb Travel", ticker: "ABNB", logo: "🏡", bg: "#831843", min: 0.10 },
  { id: 52, name: "Shopify E-Commerce", ticker: "SHOP", logo: "🛍️", bg: "#064e3b", min: 0.10 },
  { id: 53, name: "PayPal Payments", ticker: "PYPL", logo: "💵", bg: "#0284c7", min: 0.10 },
  { id: 54, name: "Square Block", ticker: "SQ", logo: "⏹️", bg: "#18181b", min: 0.10 },
  { id: 55, name: "Robinhood Finance", ticker: "HOOD", logo: "🏹", bg: "#15803d", min: 0.10 },
  { id: 56, name: "Binance Ecosystem", ticker: "BNB", logo: "🪙", bg: "#854d0e", min: 0.10 },
  { id: 57, name: "Coinbase Global", ticker: "COIN", logo: "🔵", bg: "#1d4ed8", min: 0.10 },
  { id: 58, name: "Sony Music", ticker: "SME", logo: "🎵", bg: "#0f172a", min: 0.10 },
  { id: 59, name: "Nintendo Corp.", ticker: "NTDOY", logo: "🍄", bg: "#991b1b", min: 0.10 },
  { id: 60, name: "EA Electronic Arts", ticker: "EA", logo: "⚽", bg: "#312e81", min: 0.10 },
  { id: 61, name: "Target Retail", ticker: "TGT", logo: "🎯", bg: "#991b1b", min: 0.10 },
  { id: 62, name: "LVMH Luxury", ticker: "MC", logo: "👜", bg: "#78350f", min: 0.10 },
  { id: 63, name: "Hermes Fashion", ticker: "RMS", logo: "🧣", bg: "#9a3412", min: 0.10 },
  { id: 64, name: "Ferrari Motors", ticker: "RACE", logo: "🏎️", bg: "#b91c1c", min: 0.10 },
  { id: 65, name: "Porsche Auto", ticker: "P911", logo: "🏁", bg: "#18181b", min: 0.10 },
  { id: 66, name: "BMW Group", ticker: "BMW", logo: "🚙", bg: "#0284c7", min: 0.10 },
  { id: 67, name: "Mercedes-Benz", ticker: "MBG", logo: "⭐", bg: "#334155", min: 0.10 },
  { id: 68, name: "Audi Motors", ticker: "AUDI", logo: "🔘", bg: "#18181b", min: 0.10 },
  { id: 69, name: "Honda Motor", ticker: "HMC", logo: "🏍️", bg: "#991b1b", min: 0.10 },
  { id: 70, name: "Hyundai Auto", ticker: "HYMTF", logo: "🚘", bg: "#1e3a8a", min: 0.10 },
  { id: 71, name: "FedEx Express", ticker: "FDX", logo: "📫", bg: "#581c87", min: 0.10 },
  { id: 72, name: "UPS Logistics", ticker: "UPS", logo: "📦", bg: "#713f12", min: 0.10 },
  { id: 73, name: "DHL Global", ticker: "DPW", logo: "🚚", bg: "#854d0e", min: 0.10 },
  { id: 74, name: "Baidu Search", ticker: "BIDU", logo: "🐾", bg: "#1d4ed8", min: 0.10 },
  { id: 75, name: "JD.com Retail", ticker: "JD", logo: "🐕", bg: "#991b1b", min: 0.10 },
  { id: 76, name: "Xiaomi Tech", ticker: "XIACF", logo: "📱", bg: "#ea580c", min: 0.10 },
  { id: 77, name: "BYD Electric Auto", ticker: "BYDDY", logo: "🔋", bg: "#0f172a", min: 0.10 },
  { id: 78, name: "Foxconn Industry", ticker: "HNHPF", logo: "🏭", bg: "#1e293b", min: 0.10 },
  { id: 79, name: "Dell Technologies", ticker: "DELL", logo: "💻", bg: "#0369a1", min: 0.10 },
  { id: 80, name: "HP Computers", ticker: "HPQ", logo: "🖥️", bg: "#0284c7", min: 0.10 },
  { id: 81, name: "Lenovo Group", ticker: "LNVGY", logo: "⌨️", bg: "#b91c1c", min: 0.10 },
  { id: 82, name: "Canon Optics", ticker: "CAJ", logo: "📷", bg: "#991b1b", min: 0.10 },
  { id: 83, name: "Nikon Imaging", ticker: "NINOY", logo: "📸", bg: "#ca8a04", min: 0.10 },
  { id: 84, name: "Panasonic Corp.", ticker: "PCRFY", logo: "📺", bg: "#1e3a8a", min: 0.10 },
  { id: 85, name: "LG Electronics", ticker: "LGEIY", logo: "📡", bg: "#9f1239", min: 0.10 },
  { id: 86, name: "Tata Motors Global", ticker: "TTM", logo: "🚛", bg: "#1d4ed8", min: 0.10 },
  { id: 87, name: "Infosys Tech", ticker: "INFY", logo: "💡", bg: "#0284c7", min: 0.10 },
  { id: 88, name: "Reliance Industries", ticker: "RIGD", logo: "🛢️", bg: "#1e1b4b", min: 0.10 },
  { id: 89, name: "Unilever Consumer", ticker: "UL", logo: "🧴", bg: "#0f766e", min: 0.10 },
  { id: 90, name: "Nestle Nutrition", ticker: "NSRGY", logo: "🍫", bg: "#78350f", min: 0.10 },
  { id: 91, name: "Mondelez Snacks", ticker: "MDLZ", logo: "🍪", bg: "#581c87", min: 0.10 },
  { id: 92, name: "Danone Dairy", ticker: "DANOY", logo: "🥛", bg: "#1d4ed8", min: 0.10 },
  { id: 93, name: "Rolex Holdings", ticker: "ROLX", logo: "👑", bg: "#065f46", min: 0.10 },
  { id: 94, name: "Zara Inditex", ticker: "IDEXY", logo: "👗", bg: "#18181b", min: 0.10 },
  { id: 95, name: "H&M Fashion", ticker: "HNNMY", logo: "👕", bg: "#991b1b", min: 0.10 },
  { id: 96, name: "Puma Sportswear", ticker: "PUMSY", logo: "🐆", bg: "#18181b", min: 0.10 },
  { id: 97, name: "Lego Group", ticker: "LEGO", logo: "🧱", bg: "#dc2626", min: 0.10 },
  { id: 98, name: "Colgate-Palmolive", ticker: "CL", logo: "🪥", bg: "#b91c1c", min: 0.10 },
  { id: 99, name: "Red Bull Energy", ticker: "RDBL", logo: "🐂", bg: "#1e3a8a", min: 0.10 },
  { id: 100, name: "Monster Beverage", ticker: "MNST", logo: "⚡", bg: "#15803d", min: 0.10 },
  { id: 101, name: "Zoom Communications", ticker: "ZM", logo: "📹", bg: "#0284c7", min: 0.10 },
  { id: 102, name: "Slack Technologies", ticker: "WORK", logo: "💬", bg: "#4a044e", min: 0.10 },
  { id: 103, name: "Dropbox Cloud", ticker: "DBX", logo: "📁", bg: "#1d4ed8", min: 0.10 },
  { id: 104, name: "Palantir Tech", ticker: "PLTR", logo: "🛰️", bg: "#0f172a", min: 0.10 }
];

// ৩. ফিচার সুইচ স্টেট (অ্যাডমিন প্যানেল থেকে নিয়ন্ত্রিত)
let SYSTEM_SWITCHES = {
  agent_system: false, // ইউজার সংখ্যা না বাড়া পর্যন্ত ডিফল্ট OFF
  direct_deposit: true,
  direct_withdraw: true,
  p2p_transfer: true,
  token_swap: true,
  stock_invest: true,
  referral_commission: true
};

// ৪. পেজ লোড ও রেন্ডারিং
document.addEventListener("DOMContentLoaded", () => {
  renderStocks();
  syncPlatformConfig();
  filterAgents();
});

// ব্র্যান্ড ও কনফিগ সিঙ্ক
function syncPlatformConfig() {
  if (window.CONFIG) {
    document.getElementById("brandTitle").innerText = window.CONFIG.PLATFORM.NAME;
    document.getElementById("tokenBadge").innerText = window.CONFIG.TOKEN.SYMBOL + " Token";
  }
}

// ১০০+ কোম্পানি রেন্ডার (লোগো ও বাটন সহ)
function renderStocks() {
  const container = document.getElementById("stockGridContainer");
  if (!container) return;
  container.innerHTML = "";

  GLOBAL_STOCKS.forEach(stock => {
    const card = document.createElement("div");
    card.className = "stock-card";
    card.onclick = () => openInvestModal(stock);
    card.innerHTML = `
      <div class="stock-logo" style="background:${stock.bg}">${stock.logo}</div>
      <h5 title="${stock.name}">${stock.name}</h5>
      <span>Min: $${stock.min.toFixed(2)}</span>
    `;
    container.appendChild(card);
  });
}

// ৫. বাধ্যতামূলক YES / NO ডাবল কনফার্মেশন প্রম্পট ইঞ্জিন
let pendingActionCallback = null;

function requestConfirmation(message, onConfirmCallback) {
  document.getElementById("confirmMessage").innerText = message;
  pendingActionCallback = onConfirmCallback;
  openModal("confirmModal");
}

document.getElementById("confirmOkBtn").addEventListener("click", () => {
  closeModal("confirmModal");
  if (typeof pendingActionCallback === "function") {
    pendingActionCallback();
    pendingActionCallback = null;
  }
});

// ৬. ইনভেস্টমেন্ট প্রসেসিং
let selectedStock = null;

function openInvestModal(stock) {
  if (!SYSTEM_SWITCHES.stock_invest) {
    alert("ইনভেস্টমেন্ট সিস্টেম বর্তমানে সাময়িকভাবে বন্ধ আছে।");
    return;
  }
  selectedStock = stock;
  document.getElementById("investModalTitle").innerText = "Invest in " + stock.name;
  openModal("investModal");
}

function submitInvestOrder() {
  const amount = parseFloat(document.getElementById("investAmountInput").value);
  if (isNaN(amount) || amount < (selectedStock ? selectedStock.min : 0.1)) {
    alert("সঠিক অ্যামাউন্ট লিখুন (মিনিমাম $0.10)!");
    return;
  }
  closeModal("investModal");

  // ডাবল কনফার্মেশন চাইবে
  requestConfirmation(
    `আপনি কি নিশ্চিতভাবে ${selectedStock.name}-এ $${amount.toFixed(2)} ইনভেস্ট করতে চাচ্ছেন?`,
    () => {
      alert(`সফল হয়েছে! $${amount.toFixed(2)} ইনভেস্ট করা হয়েছে। ঠিক ২৪ ঘণ্টা পর লাভ ও মূল টাকা আপনার ওয়ালেটে জমা হবে।`);
      // ডেটাবেজ আপডেট কল এখানে এক্সিকিউট হবে
    }
  );
}

// ৭. উইথড্রাল প্রসেসিং (সোশ্যাল ভিডিও রিভিউ ডিসকাউন্ট সহ)
function submitWithdraw() {
  if (!SYSTEM_SWITCHES.direct_withdraw) {
    alert("কোম্পানি সরাসরি উইথড্রাল বর্তমানে বন্ধ আছে। লোকাল এজেন্টের মাধ্যমে ক্যাশ তুলুন।");
    return;
  }

  const amt = parseFloat(document.getElementById("withdrawAmount").value);
  const videoUrl = document.getElementById("socialReviewUrl").value.trim();

  if (isNaN(amt) || amt < 50) {
    alert("কোম্পানি থেকে সরাসরি উইথড্রালের মিনিমাম লিমিট $৫০!");
    return;
  }

  let feePct = (amt >= 100) ? 0 : 10;
  let bonusMsg = "";

  // ভিডিও রিভিউ লিংক দিলে ফি ডিসকাউন্ট ও বোনাস
  if (videoUrl.length > 5) {
    feePct = 0;
    bonusMsg = " (ভিডিও রিভিউ দেওয়ার জন্য ০% ফি এবং $১ বোনাস কার্যকর হয়েছে!)";
  }

  const fee = (amt * feePct) / 100;
  const net = amt - fee;

  closeModal("withdrawModal");

  requestConfirmation(
    `উত্তোলন নিশ্চিতকরণ:\nঅ্যামাউন্ট: $${amt}\nফি (${feePct}%): $${fee}\nআপনি পাবেন: $${net}${bonusMsg}\nআপনি কি নিশ্চিত?`,
    () => {
      alert("উইথড্রাল রিকোয়েস্ট সফলভাবে জমা হয়েছে!");
    }
  );
}

// ৮. লোকাল এজেন্ট হায়ারার্কিকাল ফিল্টারিং ও ক্যাশ-আউট
const DUMMY_AGENTS = [
  { id: 1, name: "জামান টেলিকম", phone: "01866989184", district: "গাজীপুর", thana: "কোনাবাড়ী", area: "মৌচাক বাজার", rating: "5.0★" },
  { id: 2, name: "ডিজিটাল ক্যাশ পয়েন্ট", phone: "01711000000", district: "গাজীপুর", thana: "কোনাবাড়ী", area: "কাশিমপুর রোড", rating: "4.9★" },
  { id: 3, name: "রাজীব ট্রেডার্স", phone: "01922000000", district: "গাজীপুর", thana: "জয়দেবপুর", area: "চৌরাস্তা", rating: "4.8★" }
];

function filterAgents() {
  const container = document.getElementById("agentListContainer");
  if (!container) return;

  if (!SYSTEM_SWITCHES.agent_system) {
    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border); padding:20px; border-radius:10px; text-align:center; color:var(--text-muted); font-size:13px;">
        🔒 লোকাল এজেন্ট ক্যাশ-আউট নেটওয়ার্ক বর্তমানে মেইনটেনেন্সে রয়েছে। পর্যাপ্ত মেম্বার পৌঁছানোর পর এটি উন্মুক্ত করা হবে।
      </div>`;
    return;
  }

  const d = document.getElementById("filterDistrict").value;
  const t = document.getElementById("filterThana").value;
  const a = document.getElementById("filterArea").value.trim().toLowerCase();

  container.innerHTML = "";

  const filtered = DUMMY_AGENTS.filter(ag => {
    let match = true;
    if (d && ag.district !== d) match = false;
    if (t && ag.thana !== t) match = false;
    if (a && !ag.area.toLowerCase().includes(a)) match = false;
    return match;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); font-size:13px; text-align:center; padding:15px;">আপনার নির্বাচিত ঠিকানায় কোনো এজেন্ট পাওয়া যায়নি।</div>`;
    return;
  }

  filtered.forEach(ag => {
    const isExactMatch = a && ag.area.toLowerCase().includes(a);
    const card = document.createElement("div");
    card.className = `agent-card ${isExactMatch ? 'top-matched' : ''}`;
    card.innerHTML = `
      <div>
        <h4>${ag.name} <span class="badge-verified">✔ ভেরিফাইড (${ag.rating})</span></h4>
        <p style="font-size:13px; color:var(--text-muted);">ঠিকানা: ${ag.area}, ${ag.thana}, ${ag.district}</p>
        <p style="font-size:12px; color:#38bdf8;">📞 ${ag.phone}</p>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-outline" style="padding:6px 10px; font-size:12px;" onclick="window.open('tel:${ag.phone}')">📞 Call</button>
        <button class="btn btn-outline" style="padding:6px 10px; font-size:12px;" onclick="window.open('https://wa.me/88${ag.phone}')">💬 WhatsApp</button>
        <button class="btn btn-accent" style="padding:6px 10px; font-size:12px;" onclick="cashoutViaAgent('${ag.name}')">💸 Cashout</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function cashoutViaAgent(agentName) {
  const amt = prompt(`${agentName} এজেন্টের মাধ্যমে কত ডলার ক্যাশ-আউট করবেন?`);
  if (!amt || isNaN(amt) || parseFloat(amt) <= 0) return;

  const numAmt = parseFloat(amt);
  const fee = numAmt * 0.10; // ১০% ফি
  const total = numAmt + fee;

  requestConfirmation(
    `আপনি কি নিশ্চিতভাবে ${agentName} এজেন্টকে $${numAmt.toFixed(2)} ক্যাশ-আউট পাঠাবেন?\n(১০% প্রসেসিং ফিসহ ওয়ালেট থেকে কর্তন হবে: $${total.toFixed(2)})`,
    () => {
      alert(`ট্রান্সফার সফল! এজেন্ট আপনাকে সরাসরি নগদ অর্থ বুঝিয়ে দেবেন।`);
    }
  );
}

// ৯. এজেন্ট আবেদন সাবমিট (কেওয়াইসি)
function submitAgentApplication() {
  const name = document.getElementById("agentNidName").value.trim();
  const nid = document.getElementById("agentNidNumber").value.trim();
  const phone = document.getElementById("agentPhone").value.trim();

  if (!name || !nid || !phone) {
    alert("দয়া করে এনআইডি নাম, নম্বর ও ফোন নম্বর পূরণ করুন!");
    return;
  }

  closeModal("agentApplyModal");

  requestConfirmation(
    `আপনি কি $১০০ সিকিউরিটি ডিপোজিট দিয়ে এজেন্টের আবেদন নিশ্চিত করতে চান?`,
    () => {
      alert("আপনার এজেন্টের আবেদন অ্যাডমিন রিভিউয়ের জন্য জমা নেওয়া হয়েছে!");
    }
  );
}

// ১০. ইউটিলিটি মোডাল কন্ট্রোলার
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "flex";
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "none";
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function copyRefLink() {
  const link = document.getElementById("myRefLink");
  link.select();
  navigator.clipboard.writeText(link.value);
  alert("রেফারেল লিংক কপি হয়েছে!");
}