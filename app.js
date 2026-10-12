/**
 * ====================================================================
 * Locatm - Ultra Client Engine (app.js) [Real-time Cloud Sync]
 * ====================================================================
 * লাইভ রিয়েল-টাইম ডাটা সিঙ্ক (রিফ্রেশ ছাড়া আপডেট), লেনদেন হিস্টোরি,
 * ক্লিকেবল লকড শেয়ার পোর্টফোলিও এবং নিরাপদ ক্লাউড লেনদেন।
 */

let currentUser = null;
let pendingConfirmCallback = null;
let currentTradeMode = 'buy';
let currentLanguage = localStorage.getItem('locatm_lang') || 'bn';
let deferredPwaPrompt = null;
let activeSpecialStockTimerInterval = null;
let userTransactionsCache = [];
let realtimeSubscriptions = [];

// প্ল্যাটফর্ম সেটিংস
let platformConfig = {
  ltm_rate: 0.10,
  stock_profit_settings: { mode: 'auto', min_percent: -5.0, max_percent: 5.0, manual_overrides: {}, timed_boosts: {} },
  feature_toggles: { agent_system: false, withdrawals: true, investments: true, p2p: true, trade_ltm: true },
  deposit_methods: [],
  withdraw_methods: [],
  withdraw_fee_percent: 0.0,
  p2p_fee_percent: 0.0,
  agent_security_fee: 10.0,
  referral_commission_percent: 10.0,
  welcome_notice: "",
  marquee_notice: "",
  tutorial_video_url: "",
  company_posts: [],
  custom_buttons: []
};

// বহুভাষিক ডিকশনারি
const TRANSLATIONS = {
  bn: {
    tagline: "Decentralized Pocket ATM & Stock Hub",
    login_tab: "লগইন",
    signup_tab: "রেজিস্ট্রেশন",
    login_btn: "লগইন করুন",
    signup_btn: "অ্যাকাউন্ট তৈরি করুন",
    forgot_pass_link: "পাসওয়ার্ড ভুলে গেছেন?",
    welcome_title: "🎉 বিশেষ ঘোষণা",
    close_btn: "আমি পড়েছি ও বুঝেছি",
    menu_title: "কন্ট্রোল মেনু",
    menu_dep: "ডিপোজিট (Deposit)",
    menu_wtd: "উত্তোলন (Withdraw)",
    menu_p2p: "P2P ফান্ড ট্রান্সফার",
    menu_trd: "Trade LTM মার্কেট",
    menu_history: "লেনদেন হিস্টোরি (History)",
    menu_agents: "ক্যাশআউট এজেন্ট তালিকা",
    menu_agent_apply: "এজেন্ট হওয়ার আবেদন",
    menu_refer: "রেফার ড্যাশবোর্ড ও ইনকাম",
    menu_profile: "প্রোফাইল তথ্য পরিবর্তন",
    menu_roadmap: "কোম্পানি ভবিষ্যৎ রোডম্যাপ",
    menu_video: "কাজের ভিডিও গাইড",
    menu_logout: "লগআউট করুন",
    notice_badge: "নোটিস",
    w_main: "Main Balance",
    w_locked: "Locked / Invested 🔍",
    w_ltm: "LTM Token",
    w_profit: "Total Profit",
    action_dep: "ডিপোজিট",
    action_wtd: "উত্তোলন",
    action_p2p: "P2P পাঠান",
    action_history: "হিস্টোরি",
    stock_title: "Global Stock Market (100+ Companies)",
    stock_cycle: "২৪ ঘণ্টা সাইকেল",
    active_inv_title: "আপনার সক্রিয় শেয়ার ও ইনভেস্টমেন্ট",
    no_active_inv: "বর্তমানে কোনো ইনভেস্টমেন্ট সক্রিয় নেই।",
    live_extra_title: "লাইভ আপডেট ও বিনোদন",
    confirm_title: "⚠️ নিশ্চিতকরণ",
    no_btn: "না (No)",
    yes_btn: "হ্যাঁ (Yes)",
    dep_modal_title: "💳 ডিপোজিট ফান্ড",
    dep_modal_desc: "মেথড নির্বাচন করে দেওয়া ঠিকানায় টাকা পাঠিয়ে TrxID দিন।",
    select_method: "পেমেন্ট মেথড:",
    copy_addr: "📋 অ্যাড্রেস / নম্বর কপি করুন",
    amount_usd: "ডিপোজিট অ্যামাউন্ট ($):",
    trx_id: "ট্রানজেকশন আইডি (TrxID / Hash):",
    submit_dep: "ডিপোজিট সাবমিট",
    wtd_modal_title: "💸 ব্যালেন্স উত্তোলন (Withdraw)",
    select_wtd_method: "উইথড্রাল মেথড নির্বাচন করুন:",
    wtd_amount: "উত্তোলন অ্যামাউন্ট ($):",
    wtd_addr: "আপনার ওয়ালেট বা ফোন নম্বর:",
    confirm_wtd: "উত্তোলন নিশ্চিত করুন",
    p2p_modal_title: "🔄 P2P ইনস্ট্যান্ট ফান্ড ট্রান্সফার",
    target_user_id: "প্রাপকের User ID:",
    transfer_amount: "ট্রান্সফার অ্যামাউন্ট ($):",
    send_now: "ট্রান্সফার করুন",
    trade_modal_title: "🪙 Trade LTM Token",
    buy_coin: "কয়েন কিনুন",
    sell_coin: "কয়েন বেচুন",
    trade_amount_label: "কত ডলারের LTM কিনবেন ($):",
    confirm_order: "অর্ডার সম্পন্ন করুন",
    agents_list_title: "📍 ভেরিফাইড ক্যাশআউট এজেন্ট নেটওয়ার্ক",
    agents_list_desc: "আপনার লোকাল এজেন্টের সাথে যোগাযোগ করে ক্যাশআউট করুন।",
    agent_apply_title: "📝 এজেন্ট হওয়ার আবেদন ফর্ম",
    submit_apply: "ফি দিয়ে আবেদন জমা দিন",
    invest_desc: "২৪ ঘণ্টা সাইকেল শেষে মূল ডলার ও লভ্যাংশ সরাসরি আপনার মেইন ব্যালেন্সে যুক্ত হবে।",
    invest_amount_label: "কত ডলারের শেয়ার কিনবেন ($):",
    confirm_invest: "শেয়ার কিনুন",
    refer_dash_title: "👥 রেফারেল ড্যাশবোর্ড ও আর্নিং",
    profile_edit_title: "👤 প্রোফাইল এডিটর",
    save_changes: "আপডেট করুন",
    video_title: "📺 কাজের নিয়ম ও ভিডিও গাইড",
    cancel: "Cancel"
  },
  en: {
    tagline: "Decentralized Pocket ATM & Stock Hub",
    login_tab: "Login",
    signup_tab: "Sign Up",
    login_btn: "Login Now",
    signup_btn: "Create Account",
    forgot_pass_link: "Forgot Password?",
    welcome_title: "🎉 Special Announcement",
    close_btn: "I have read & understand",
    menu_title: "Control Menu",
    menu_dep: "Deposit Funds",
    menu_wtd: "Withdraw Funds",
    menu_p2p: "P2P Fund Transfer",
    menu_trd: "Trade LTM Token",
    menu_history: "Transaction History",
    menu_agents: "Cashout Agent List",
    menu_agent_apply: "Apply for Verified Agent",
    menu_refer: "Referral Dashboard",
    menu_profile: "Edit Profile Info",
    menu_roadmap: "Company Roadmap",
    menu_video: "Video Tutorial Guide",
    menu_logout: "Sign Out",
    notice_badge: "NOTICE",
    w_main: "Main Balance",
    w_locked: "Locked / Invested 🔍",
    w_ltm: "LTM Token",
    w_profit: "Total Profit",
    action_dep: "Deposit",
    action_wtd: "Withdraw",
    action_p2p: "P2P Transfer",
    action_history: "History",
    stock_title: "Global Stock Market (100+ Companies)",
    stock_cycle: "24 Hours Cycle",
    active_inv_title: "Your Active Shares & Investments",
    no_active_inv: "No active investments at this moment.",
    live_extra_title: "Live Updates & Action",
    confirm_title: "⚠️ Confirmation",
    no_btn: "No",
    yes_btn: "Yes",
    dep_modal_title: "💳 Deposit Funds",
    dep_modal_desc: "Select method, send funds to given address and submit TrxID.",
    select_method: "Payment Method:",
    copy_addr: "📋 Copy Address / Number",
    amount_usd: "Deposit Amount ($):",
    trx_id: "Transaction ID (TrxID / Hash):",
    submit_dep: "Submit Deposit",
    wtd_modal_title: "💸 Withdraw Balance",
    select_wtd_method: "Select Withdrawal Method:",
    wtd_amount: "Withdraw Amount ($):",
    wtd_addr: "Your Wallet Address or Phone:",
    confirm_wtd: "Confirm Withdraw",
    p2p_modal_title: "🔄 Instant P2P Transfer",
    target_user_id: "Recipient User ID:",
    transfer_amount: "Transfer Amount ($):",
    send_now: "Transfer Funds",
    trade_modal_title: "🪙 Trade LTM Token",
    buy_coin: "Buy Coin",
    sell_coin: "Sell Coin",
    trade_amount_label: "Amount in USD ($):",
    confirm_order: "Complete Order",
    agents_list_title: "📍 Verified Cashout Agents",
    agents_list_desc: "Contact your local agent directly to cash out.",
    agent_apply_title: "📝 Verified Agent Application Form",
    submit_apply: "Pay Fee & Submit Application",
    invest_desc: "Capital and earnings will be credited to main balance after 24 hours.",
    invest_amount_label: "Investment Amount ($):",
    confirm_invest: "Buy Share",
    refer_dash_title: "👥 Referral Dashboard & Earnings",
    profile_edit_title: "👤 Edit Profile",
    save_changes: "Save Changes",
    video_title: "📺 Work Tutorials & Video Guide",
    cancel: "Cancel"
  }
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

function getDB() {
  if (typeof getDatabaseClient === 'function') {
    return getDatabaseClient();
  }
  return window.db || null;
}

// পেজ লোড ও ইনিট
document.addEventListener("DOMContentLoaded", async () => {
  registerServiceWorker();
  setupPwaInstallPrompt();
  applyLanguage(currentLanguage);
  initStockMarket();
  await loadPlatformConfig();
  await checkSavedAuth();
});

// সার্ভিস ওয়ার্কার
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .catch((err) => console.warn('Service Worker registration skipped:', err));
  }
}

// PWA ইনস্টল প্রম্পট
function setupPwaInstallPrompt() {
  const pwaBtn = document.getElementById("pwaInstallBtn");
  if (pwaBtn) pwaBtn.style.display = "flex";

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    if (pwaBtn) pwaBtn.style.display = "none";
    deferredPwaPrompt = null;
  });
}

function triggerPWAInstall() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        const btn = document.getElementById("pwaInstallBtn");
        if (btn) btn.style.display = "none";
      }
      deferredPwaPrompt = null;
    });
  } else {
    alert("আপনার ব্রাউজারের থ্রি-ডট মেনু (⋮) থেকে 'Install app' বা 'Add to Home screen' চাপুন। অ্যাপটি সরাসরি ফোনে বা পিসিতে ইনস্টল হয়ে যাবে।");
  }
}

// প্ল্যাটফর্ম সেটিংস লোড
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

  const wFee = parseFloat(platformConfig.withdraw_fee_percent || 0.0);
  if (document.getElementById("withdrawFeeRateText")) {
    document.getElementById("withdrawFeeRateText").innerText = `${wFee}%`;
  }

  const p2pFee = parseFloat(platformConfig.p2p_fee_percent || 0.0);
  if (document.getElementById("p2pFeeRateText")) {
    document.getElementById("p2pFeeRateText").innerText = `${p2pFee}%`;
  }

  const refRate = parseFloat(platformConfig.referral_commission_percent || 10.0);
  if (document.getElementById("referralCommissionRateText")) {
    document.getElementById("referralCommissionRateText").innerText = `${refRate}%`;
  }

  const agentFee = parseFloat(platformConfig.agent_security_fee || 10.0);
  if (document.getElementById("agentFeeNoticeAmount")) {
    document.getElementById("agentFeeNoticeAmount").innerText = `$${agentFee.toFixed(2)}`;
  }

  // এজেন্ট ফিচার বন্ধ থাকলে আবেদন অপশন লুকানো
  const agentApplyLi = document.getElementById("agentApplyDrawerItem");
  if (agentApplyLi) {
    if (platformConfig.feature_toggles && platformConfig.feature_toggles.agent_system === false) {
      agentApplyLi.style.display = "none";
    } else {
      agentApplyLi.style.display = "block";
    }
  }

  checkAndShowWelcomeNotice();
  renderDepositMethods();
  renderWithdrawMethods();
  renderDynamicButtons();
  renderCompanyRoadmapPosts();
  await renderAgentDirectory();
}

function checkAndShowWelcomeNotice() {
  const hasSeen = sessionStorage.getItem("locatm_welcome_seen");
  if (!hasSeen && platformConfig.welcome_notice && platformConfig.welcome_notice.trim() !== "") {
    document.getElementById("welcomeAnnouncementContent").innerText = platformConfig.welcome_notice;
    openModal("welcomeAnnouncementModal");
  }
}

function closeWelcomeModal() {
  sessionStorage.setItem("locatm_welcome_seen", "true");
  closeModal("welcomeAnnouncementModal");
}

// সেশন চেক ও রিয়েল-টাইম লিসেনার সক্রিয়করণ
async function checkSavedAuth() {
  const savedUserId = localStorage.getItem("locatm_session_uid");
  const dbClient = getDB();
  if (savedUserId && dbClient) {
    try {
      const { data: user, error } = await dbClient.from('users').select('*').eq('user_id', savedUserId).maybeSingle();
      if (!error && user) {
        currentUser = user;
        updateUserUI();
        document.getElementById("authScreen").classList.remove("active");
        
        // রিয়েলটাইম লাইভ সিঙ্ক শুরু
        initUserRealtimeSync();

        await checkInvestmentsExpiry();
        await loadUserMessages();
        await loadUserTransactionHistory();
        return;
      }
    } catch (e) {
      console.error("Session check error:", e);
    }
  }
  document.getElementById("authScreen").classList.add("active");
}

// ================= রিয়েল-টাইম অটো সিঙ্ক (কোনো রিফ্রেশ লাগবে না) =================
function initUserRealtimeSync() {
  const dbClient = getDB();
  if (!dbClient || !currentUser) return;

  // পুরানো লিসেনার সরানো
  realtimeSubscriptions.forEach(sub => dbClient.removeChannel(sub));
  realtimeSubscriptions = [];

  // ১. ইউজার ব্যালেন্স পরিবর্তন শুনবে (অ্যাডমিন অ্যাপ্রুভ করলে সাথে সাথে লাইভ আপডেট)
  const userChannel = dbClient.channel(`user-sync-${currentUser.user_id}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `user_id=eq.${currentUser.user_id}` }, payload => {
      currentUser = payload.new;
      updateUserUI();
    })
    .subscribe();
  realtimeSubscriptions.push(userChannel);

  // ২. প্ল্যাটফর্ম সেটিংস লাইভ আপডেট শুনবে
  const settingsChannel = dbClient.channel('platform-settings-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_settings' }, async () => {
      await loadPlatformConfig();
    })
    .subscribe();
  realtimeSubscriptions.push(settingsChannel);

  // ৩. ট্রানজেকশন পরিবর্তন শুনবে (হিস্টোরি রিয়েলটাইম রিফ্রেশ)
  const txChannel = dbClient.channel(`tx-sync-${currentUser.user_id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${currentUser.user_id}` }, async () => {
      await loadUserTransactionHistory();
    })
    .subscribe();
  realtimeSubscriptions.push(txChannel);

  // ৪. লাইভ চ্যাট মেসেজ শুনবে
  const msgChannel = dbClient.channel(`msg-sync-${currentUser.user_id}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_messages', filter: `user_id=eq.${currentUser.user_id}` }, async () => {
      await loadUserMessages();
    })
    .subscribe();
  realtimeSubscriptions.push(msgChannel);
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

// লগইন
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
    document.getElementById("authScreen").classList.remove("active");
    
    initUserRealtimeSync();

    await loadPlatformConfig();
    await checkInvestmentsExpiry();
    await loadUserMessages();
    await loadUserTransactionHistory();
    alert(`স্বাগতম ${matchedUser.name}! সফলভাবে লগইন হয়েছে।`);
  } catch (err) {
    alert("লগইন সমস্যা: " + err.message);
  }
}

// সাইন-আপ
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
    alert("ডাটাবেজ প্রস্তুত হচ্ছে, ৫ সেকেন্ড পর আবার চেষ্টা করুন...");
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
      referred_by: ref || null
    };

    const { data, error } = await dbClient.from('users').insert([newUserPayload]).select().single();

    if (error) {
      alert("অ্যাকাউন্ট তৈরি ব্যর্থ: " + error.message);
      return;
    }

    currentUser = data;
    localStorage.setItem("locatm_session_uid", data.user_id);
    updateUserUI();
    document.getElementById("authScreen").classList.remove("active");
    initUserRealtimeSync();
    alert(`অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। User ID: ${currentUser.user_id}`);
  } catch (err) {
    alert("সাইন-আপ সমস্যা: " + err.message);
  }
}

function openForgotPasswordModal() {
  openModal("forgotPassModal");
}

async function submitForgotPassword() {
  const ident = document.getElementById("forgotIdentInput").value.trim();
  if (!ident) {
    alert("ইমেইল বা ফোন নম্বর দিন!");
    return;
  }

  const dbClient = getDB();
  const { data: user, error } = await dbClient.from('users').select('user_id, phone, email').or(`email.eq.${ident},phone.eq.${ident}`).maybeSingle();

  if (error || !user) {
    alert("এই তথ্যে কোনো ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি!");
    return;
  }

  closeModal("forgotPassModal");
  alert(`পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড আপনার নিবন্ধিত মোবাইল নম্বরে (${user.phone}) পাঠানো হয়েছে।`);
}

function triggerLogout() {
  toggleDrawer(false);
  requestConfirm("আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট থেকে লগআউট করতে চান?", () => {
    localStorage.removeItem("locatm_session_uid");
    currentUser = null;
    document.getElementById("authScreen").classList.add("active");
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
  
  document.getElementById("profUserId").value = currentUser.user_id;
  document.getElementById("profName").value = currentUser.name;
  document.getElementById("profEmail").value = currentUser.email;
  document.getElementById("profPhone").value = currentUser.phone;

  document.getElementById("myReferralLinkInput").value = `${window.location.origin}/?ref=${currentUser.user_id}`;
  loadReferralData();
}

async function submitProfileUpdate() {
  const nm = document.getElementById("profName").value.trim();
  const em = document.getElementById("profEmail").value.trim();
  const ph = document.getElementById("profPhone").value.trim();

  if (!nm || !em || !ph) {
    alert("সব ফিল্ড পূরণ করুন!");
    return;
  }

  requestConfirm("আপনি কি প্রোফাইল তথ্য আপডেট করতে চান?", async () => {
    const dbClient = getDB();
    const { error } = await dbClient.from('users').update({ name: nm, email: em, phone: ph }).eq('user_id', currentUser.user_id);

    if (!error) {
      currentUser.name = nm;
      currentUser.email = em;
      currentUser.phone = ph;
      updateUserUI();
      closeModal("profileModal");
      alert("প্রোফাইল সফলভাবে আপডেট হয়েছে!");
    } else {
      alert("প্রোফাইল আপডেট ব্যর্থ: " + error.message);
    }
  });
}

// রেফারেল ডেটা
async function loadReferralData() {
  if (!currentUser) return;
  const dbClient = getDB();
  if (!dbClient) return;

  try {
    const { data: refs, error } = await dbClient.from('users').select('user_id, name, created_at, total_profit').eq('referred_by', currentUser.user_id);
    const countEl = document.getElementById("refTotalCount");
    const earningEl = document.getElementById("refTotalEarning");
    const listEl = document.getElementById("referredUsersList");

    if (error || !refs || refs.length === 0) {
      countEl.innerText = "0 জন";
      earningEl.innerText = "$0.00";
      listEl.innerHTML = `<div style="color:var(--text-muted); font-size:12px; text-align:center; padding:10px;">কোনো রেফারেল মেম্বার যুক্ত হয়নি।</div>`;
      return;
    }

    countEl.innerText = `${refs.length} জন`;
    const commissionPercent = parseFloat(platformConfig.referral_commission_percent || 10.0);
    let totalRefEarning = 0;

    listEl.innerHTML = "";
    refs.forEach(r => {
      const profit = parseFloat(r.total_profit || 0);
      const earnedFromThis = profit * (commissionPercent / 100);
      totalRefEarning += earnedFromThis;

      const item = document.createElement("div");
      item.style.cssText = "background:rgba(11,17,32,0.8); border:1px solid var(--glass-border); padding:8px 12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;";
      item.innerHTML = `
        <div>
          <strong style="color:#fff; font-size:12px;">${r.name}</strong><br>
          <small style="color:var(--text-muted); font-size:11px;">ID: ${r.user_id}</small>
        </div>
        <div style="text-align:right;">
          <span style="color:var(--accent); font-weight:800; font-size:12px;">+$${earnedFromThis.toFixed(2)}</span><br>
          <small style="color:var(--text-dim); font-size:10px;">${new Date(r.created_at).toLocaleDateString('bn-BD')}</small>
        </div>
      `;
      listEl.appendChild(item);
    });

    earningEl.innerText = `$${totalRefEarning.toFixed(2)}`;
  } catch (e) {
    console.error("Referral fetch error:", e);
  }
}

// ডিপোজিট
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
  const cur = (platformConfig.deposit_methods || [])[idx];
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
  const curMethod = (platformConfig.deposit_methods || [])[idx];
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
      alert("ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! পর্যালোচনার পর ব্যালেন্স যুক্ত হবে।");
      document.getElementById("depositAmountInput").value = "";
      document.getElementById("depositTrxInput").value = "";
      await loadUserTransactionHistory();
    } else {
      alert("রিকোয়েস্ট জমা দেওয়া সম্ভব হয়নি: " + error.message);
    }
  });
}

// উত্তোলন
function renderWithdrawMethods() {
  const sel = document.getElementById("withdrawMethodSelect");
  if (!sel) return;
  sel.innerHTML = "";

  const methods = platformConfig.withdraw_methods || [];
  if (methods.length === 0) {
    sel.innerHTML = "<option value='Standard USDT'>Standard USDT (Default)</option>";
    return;
  }

  methods.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.name;
    opt.textContent = m.name;
    sel.appendChild(opt);
  });
}

async function submitWithdrawal() {
  if (platformConfig.feature_toggles && platformConfig.feature_toggles.withdrawals === false) {
    alert("উত্তোলন সাময়িকভাবে বন্ধ আছে।");
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

  const feePercent = parseFloat(platformConfig.withdraw_fee_percent || 0.0);
  const feeAmount = amt * (feePercent / 100);
  const totalDeduct = amt + feeAmount;

  if (parseFloat(currentUser.main_balance) < totalDeduct) {
    alert(`আপনার ব্যালেন্স পর্যাপ্ত নেই! ফি সহ মোট $${totalDeduct.toFixed(2)} প্রয়োজন।`);
    return;
  }

  closeModal("withdrawModal");

  requestConfirm(`উত্তোলন নিশ্চিতকরণ:\nমেথড: ${method}\nপরিমাণ: $${amt}\nফি (${feePercent}%): $${feeAmount.toFixed(2)}\nমোট কাটবে: $${totalDeduct.toFixed(2)}\nঅ্যাকাউন্ট: ${target}`, async () => {
    const dbClient = getDB();
    const newBal = parseFloat(currentUser.main_balance) - totalDeduct;

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
    await loadUserTransactionHistory();
    alert("উত্তোলন রিকোয়েস্ট সফলভাবে জমা হয়েছে!");
  });
}

// P2P ট্রান্সফার
async function submitP2PTransfer() {
  if (platformConfig.feature_toggles && platformConfig.feature_toggles.p2p === false) {
    alert("P2P ট্রান্সফার বন্ধ আছে।");
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

  const p2pFeePercent = parseFloat(platformConfig.p2p_fee_percent || 0.0);
  const p2pFeeAmount = amt * (p2pFeePercent / 100);
  const totalSenderDeduct = amt + p2pFeeAmount;

  if (parseFloat(currentUser.main_balance) < totalSenderDeduct) {
    alert(`পর্যাপ্ত ব্যালেন্স নেই! ফি (${p2pFeePercent}%) সহ মোট $${totalSenderDeduct.toFixed(2)} প্রয়োজন।`);
    return;
  }

  const dbClient = getDB();
  const { data: recipient, error } = await dbClient.from('users').select('*').eq('user_id', targetId).maybeSingle();
  if (error || !recipient) {
    alert("এই User ID-এর কোনো মেম্বার পাওয়া যায়নি!");
    return;
  }

  closeModal("p2pModal");

  requestConfirm(`${recipient.name} (${targetId})-কে $${amt} পাঠাতে চান?\nফি (${p2pFeePercent}%): $${p2pFeeAmount.toFixed(2)}\nমোট কাটবে: $${totalSenderDeduct.toFixed(2)}`, async () => {
    const senderBal = parseFloat(currentUser.main_balance) - totalSenderDeduct;
    const recBal = parseFloat(recipient.main_balance) + amt;

    await dbClient.from('users').update({ main_balance: senderBal }).eq('user_id', currentUser.user_id);
    await dbClient.from('users').update({ main_balance: recBal }).eq('user_id', targetId);

    await dbClient.from('transactions').insert([
      { user_id: currentUser.user_id, type: 'p2p_send', amount: amt, target_user_id: targetId, status: 'approved' },
      { user_id: targetId, type: 'p2p_receive', amount: amt, target_user_id: currentUser.user_id, status: 'approved' }
    ]);

    currentUser.main_balance = senderBal;
    updateUserUI();
    await loadUserTransactionHistory();
    alert(`$${amt} সফলভাবে ট্রান্সফার হয়েছে!`);
  });
}

// ================= সম্পূর্ণ লেনদেন হিস্টোরি (Transaction History) =================
async function loadUserTransactionHistory() {
  if (!currentUser) return;
  const dbClient = getDB();
  if (!dbClient) return;

  try {
    const { data: txs, error } = await dbClient.from('transactions')
      .select('*')
      .or(`user_id.eq.${currentUser.user_id},target_user_id.eq.${currentUser.user_id}`)
      .order('created_at', { ascending: false });

    if (!error && txs) {
      userTransactionsCache = txs;
      renderHistoryList(userTransactionsCache);
    }
  } catch (e) {
    console.error("History fetch error:", e);
  }
}

function filterUserHistory(filterType) {
  document.querySelectorAll('#historyModal .btn').forEach(b => {
    if (b.id && b.id.startsWith('histFilter')) b.className = 'btn btn-outline';
  });

  if (filterType === 'all') {
    document.getElementById("histFilterAll").className = 'btn btn-primary';
    renderHistoryList(userTransactionsCache);
  } else if (filterType === 'deposit') {
    document.getElementById("histFilterDep").className = 'btn btn-primary';
    renderHistoryList(userTransactionsCache.filter(t => t.type === 'deposit'));
  } else if (filterType === 'withdraw') {
    document.getElementById("histFilterWtd").className = 'btn btn-primary';
    renderHistoryList(userTransactionsCache.filter(t => t.type === 'withdraw'));
  } else if (filterType === 'p2p') {
    document.getElementById("histFilterP2P").className = 'btn btn-primary';
    renderHistoryList(userTransactionsCache.filter(t => t.type.includes('p2p')));
  }
}

function renderHistoryList(txList) {
  const container = document.getElementById("userTransactionHistoryList");
  if (!container) return;
  container.innerHTML = "";

  if (!txList || txList.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">কোনো লেনদেনের তথ্য পাওয়া যায়নি।</div>`;
    return;
  }

  txList.forEach(t => {
    let title = t.type;
    let badgeColor = '#fbbf24';
    let sign = '';

    if (t.type === 'deposit') {
      title = `💳 ডিপোজিট (${t.method || 'Cash'})`;
      sign = '+';
    } else if (t.type === 'withdraw') {
      title = `💸 উত্তোলন (${t.method || 'Wallet'})`;
      sign = '-';
    } else if (t.type === 'p2p_send') {
      title = `🔄 P2P পাঠানো (To: ${t.target_user_id})`;
      sign = '-';
    } else if (t.type === 'p2p_receive') {
      title = `📥 P2P রিসিভ (From: ${t.target_user_id})`;
      sign = '+';
    } else if (t.type === 'agent_security_fee') {
      title = `🛡️ এজেন্ট সিকিউরিটি ফি`;
      sign = '-';
    }

    if (t.status === 'approved') badgeColor = 'var(--accent)';
    if (t.status === 'rejected') badgeColor = 'var(--danger)';

    const item = document.createElement("div");
    item.style.cssText = "background:rgba(11,17,32,0.8); border:1px solid var(--glass-border); padding:10px 14px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;";
    item.innerHTML = `
      <div>
        <strong style="color:#fff; font-size:13px;">${title}</strong><br>
        <small style="color:var(--text-muted); font-size:11px;">${new Date(t.created_at).toLocaleString('bn-BD')}</small>
        ${t.trx_id ? `<br><small style="color:#38bdf8; font-size:10px;">Trx: ${t.trx_id}</small>` : ''}
      </div>
      <div style="text-align:right;">
        <span style="font-size:14px; font-weight:800; color:${sign === '+' ? 'var(--accent)' : '#fff'};">${sign}$${parseFloat(t.amount).toFixed(2)}</span><br>
        <small style="color:${badgeColor}; font-weight:700; text-transform:uppercase; font-size:10px;">${t.status}</small>
      </div>
    `;
    container.appendChild(item);
  });
}

// এজেন্ট পূর্ণাঙ্গ আবেদন
async function submitFullAgentApplication() {
  const fullName = document.getElementById("agFullName").value.trim();
  const shop = document.getElementById("agShopName").value.trim();
  const nid = document.getElementById("agNidNumber").value.trim();
  const em = document.getElementById("agEmail").value.trim();
  const phone = document.getElementById("agPrimaryPhone").value.trim();
  const alt1 = document.getElementById("agAltPhone1").value.trim();
  const alt2 = document.getElementById("agAltPhone2").value.trim();
  const address = document.getElementById("agFullAddress").value.trim();

  if (!fullName || !shop || !nid || !em || !phone || !alt1 || !alt2 || !address) {
    alert("সবগুলো তথ্য পূরণ করুন!");
    return;
  }

  const securityFee = parseFloat(platformConfig.agent_security_fee || 10.0);

  if (parseFloat(currentUser.main_balance) < securityFee) {
    alert(`এজেন্ট হওয়ার জন্য ন্যূনতম $${securityFee.toFixed(2)} সিকিউরিটি ফি থাকতে হবে!`);
    return;
  }

  closeModal("agentApplyModal");

  requestConfirm(`সিকিউরিটি ভেরিফিকেশন ফি: $${securityFee.toFixed(2)}\nব্যালেন্স থেকে কেটে জমা হবে। নিশ্চিত?`, async () => {
    const dbClient = getDB();
    const newBal = parseFloat(currentUser.main_balance) - securityFee;

    await dbClient.from('users').update({ main_balance: newBal }).eq('user_id', currentUser.user_id);

    const { error } = await dbClient.from('agent_applications').insert([{
      user_id: currentUser.user_id,
      shop_name: shop,
      full_name: fullName,
      nid_number: nid,
      email: em,
      phone: phone,
      alt_phone_1: alt1,
      alt_phone_2: alt2,
      location: address,
      status: 'pending'
    }]);

    await dbClient.from('transactions').insert([{
      user_id: currentUser.user_id,
      type: 'agent_security_fee',
      amount: securityFee,
      method: 'Agent Security Deposit',
      status: 'approved'
    }]);

    currentUser.main_balance = newBal;
    updateUserUI();
    await loadUserTransactionHistory();

    if (!error) {
      alert("আবেদন ও সিকিউরিটি ফি সফলভাবে গৃহীত হয়েছে!");
    } else {
      alert("আবেদন জমা দিতে সমস্যা হয়েছে: " + error.message);
    }
  });
}

async function renderAgentDirectory() {
  const list = document.getElementById("agentDirectoryList");
  if (!list) return;
  list.innerHTML = "";

  if (platformConfig.feature_toggles && platformConfig.feature_toggles.agent_system === false) {
    list.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">এজেন্ট ক্যাশ-আউট নেটওয়ার্ক বর্তমানে বন্ধ আছে।</div>`;
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
        <strong style="color:#fff;">${ag.shop_name}</strong> (${ag.full_name || 'Agent'})<br>
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

// স্টক মার্কেট
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
      document.getElementById("investModalStockTitle").innerText = `${stk.name} শেয়ার`;
      checkStockSpecialTimedBoost(stk.id);
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

function checkStockSpecialTimedBoost(stockId) {
  if (activeSpecialStockTimerInterval) {
    clearInterval(activeSpecialStockTimerInterval);
  }

  const box = document.getElementById("stockSpecialOfferBox");
  const txt = document.getElementById("stockSpecialOfferText");
  const timerEl = document.getElementById("stockSpecialOfferTimer");
  
  const settings = platformConfig.stock_profit_settings || {};
  const boosts = settings.timed_boosts || {};
  const boost = boosts[stockId];

  if (boost && new Date(boost.expires_at) > new Date()) {
    box.style.display = "block";
    txt.innerText = `বিশেষ অফার চলমান! নিশ্চিত বোনাস বরাদ্দ।`;
    
    activeSpecialStockTimerInterval = setInterval(() => {
      const remainingMs = new Date(boost.expires_at) - new Date();
      if (remainingMs <= 0) {
        clearInterval(activeSpecialStockTimerInterval);
        box.style.display = "none";
      } else {
        const hrs = Math.floor(remainingMs / (1000 * 60 * 60));
        const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
        timerEl.innerText = `বাকি সময়: ${hrs}h ${mins}m ${secs}s`;
      }
    }, 1000);
  } else {
    box.style.display = "none";
  }
}

// শেয়ার ইনভেস্টমেন্ট বার্তা সংশোধন (প্রত্যাশিত রেট ছাড়া সরাসরি প্রশ্ন)
async function confirmStockInvest() {
  if (platformConfig.feature_toggles && platformConfig.feature_toggles.investments === false) {
    alert("ইনভেস্টমেন্ট সিস্টেম বন্ধ আছে।");
    return;
  }

  const amt = parseFloat(document.getElementById("investStockAmount").value);
  if (isNaN(amt) || amt < 0.10) {
    alert("ন্যূনতম $0.10 ডলারের শেয়ার কিনতে হবে!");
    return;
  }
  if (parseFloat(currentUser.main_balance) < amt) {
    alert("আপনার ব্যালেন্স পর্যাপ্ত নেই!");
    return;
  }

  closeModal("investModal");

  const settings = platformConfig.stock_profit_settings || {};
  let finalRate = 0;

  const boosts = settings.timed_boosts || {};
  const boost = boosts[activeInvestStock.id];
  if (boost && new Date(boost.expires_at) > new Date()) {
    finalRate = parseFloat(boost.rate);
  } else if (settings.manual_overrides && settings.manual_overrides[activeInvestStock.id] !== undefined) {
    finalRate = parseFloat(settings.manual_overrides[activeInvestStock.id]);
  } else {
    const minP = parseFloat(settings.min_percent !== undefined ? settings.min_percent : -5.0);
    const maxP = parseFloat(settings.max_percent !== undefined ? settings.max_percent : 5.0);
    finalRate = parseFloat((Math.random() * (maxP - minP) + minP).toFixed(2));
  }

  // পরিষ্কার ও প্রফেশনাল বার্তা
  requestConfirm(`আপনি কি নিশ্চিতভাবে ${activeInvestStock.name} কোম্পানির $${amt} ডলারের শেয়ার কিনতে চান?`, async () => {
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
    alert(`$${amt} ডলার দিয়ে শেয়ার কেনা সফল হয়েছে!`);
  });
}

// সক্রিয় ইনভেস্টমেন্ট এবং লকড ব্যালেন্স পপআপ রেন্ডার
async function checkInvestmentsExpiry() {
  if (!currentUser) return;
  const dbClient = getDB();
  if (!dbClient) return;

  const { data: list } = await dbClient.from('investments')
    .select('*')
    .eq('user_id', currentUser.user_id)
    .eq('status', 'active');

  const container = document.getElementById("activeInvestList");
  const modalContainer = document.getElementById("modalActiveInvestList");

  if (!list || list.length === 0) {
    if (container) {
      container.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid var(--glass-border); padding:16px; border-radius:14px; color:var(--text-muted); font-size:13px; text-align:center;">
          বর্তমানে কোনো ইনভেস্টমেন্ট সক্রিয় নেই।
        </div>
      `;
    }
    if (modalContainer) {
      modalContainer.innerHTML = `<div style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">আপনার কোনো সক্রিয় শেয়ার নেই।</div>`;
    }
    return;
  }

  // হোম স্ক্রিনের লিস্ট এবং লকড ব্যালেন্স পপআপ উভয়ের জন্য রেন্ডার
  let htmlCards = "";
  list.forEach(i => {
    htmlCards += `
      <div style="background:var(--bg-card); border:1px solid var(--glass-border); padding:14px; border-radius:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#38bdf8; font-size:14px;">${i.stock_name}</strong><br>
          <small style="color:var(--text-muted);">কেনা শেয়ার: $${parseFloat(i.amount).toFixed(2)}</small>
        </div>
        <div style="text-align:right;">
          <span style="color:${i.profit_percent >= 0 ? 'var(--accent)' : 'var(--danger)'}; font-weight:800; font-size:14px;">${i.profit_percent >= 0 ? '+' : ''}${i.profit_percent}%</span><br>
          <small style="color:var(--gold); font-size:11px;">চলমান (২৪ ঘণ্টা)</small>
        </div>
      </div>
    `;
  });

  if (container) container.innerHTML = htmlCards;
  if (modalContainer) modalContainer.innerHTML = htmlCards;

  // এক্সপায়ারি চেক (লাভ বণ্টন)
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

// ট্রেড LTM
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

// লাইভ চ্যাট
function toggleLiveChatWindow() {
  const m = document.getElementById("liveChatModal");
  if (m.classList.contains("active")) {
    closeModal("liveChatModal");
  } else {
    openModal("liveChatModal");
    loadUserMessages();
  }
}

async function loadUserMessages() {
  if (!currentUser) return;
  const dbClient = getDB();
  if (!dbClient) return;

  try {
    const { data: msgs, error } = await dbClient.from('user_messages')
      .select('*')
      .eq('user_id', currentUser.user_id)
      .order('created_at', { ascending: true });

    const box = document.getElementById("liveChatMessagesBox");
    if (!error && msgs && box) {
      box.innerHTML = `
        <div style="background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:10px; border-radius:12px; font-size:12px; color:#fff;">
          স্বাগতম! আপনার যেকোনো সমস্যা বা প্রশ্নের জন্য এখানে মেসেজ দিন। সাপোর্ট টিম দ্রুত উত্তর দেবে।
        </div>
      `;
      msgs.forEach(m => {
        const isMe = m.sender === currentUser.name || m.sender === 'User';
        const d = document.createElement("div");
        d.style.cssText = `padding:8px 12px; border-radius:12px; font-size:12px; max-width:80%; ${isMe ? 'align-self:flex-end; background:#2563eb; color:#fff;' : 'align-self:flex-start; background:rgba(30,41,59,0.9); border:1px solid var(--glass-border); color:#38bdf8;'}`;
        d.innerHTML = `<strong>${m.sender}:</strong> ${m.message}`;
        box.appendChild(d);
      });
      box.scrollTop = box.scrollHeight;
    }
  } catch (e) {
    console.error("Messages fetch error:", e);
  }
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') {
    sendLiveChatMessage();
  }
}

async function sendLiveChatMessage() {
  const inp = document.getElementById("liveChatInput");
  const msg = inp.value.trim();
  if (!msg) return;

  inp.value = "";
  const dbClient = getDB();
  await dbClient.from('user_messages').insert([{
    user_id: currentUser.user_id,
    sender: currentUser.name || 'User',
    message: msg
  }]);

  await loadUserMessages();
}

// রোডম্যাপ
function toggleFullscreenRoadmap(open) {
  toggleDrawer(false);
  const view = document.getElementById("fullscreenRoadmapView");
  if (open) {
    view.classList.add("active");
  } else {
    view.classList.remove("active");
  }
}

function renderCompanyRoadmapPosts() {
  const container = document.getElementById("roadmapPostsContainer");
  if (!container) return;
  container.innerHTML = "";

  const posts = platformConfig.company_posts || [];
  if (posts.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">বর্তমানে কোনো রোডম্যাপ পোস্ট প্রকাশিত হয়নি।</div>`;
    return;
  }

  posts.forEach(p => {
    const card = document.createElement("div");
    card.style.cssText = "background:var(--bg-card); border:1px solid var(--glass-border-bright); padding:20px; border-radius:18px; box-shadow:0 8px 24px rgba(0,0,0,0.3);";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="color:#38bdf8; font-size:18px;">${p.title}</h3>
        <span style="font-size:12px; color:var(--text-muted);">${p.date || 'Active Mission'}</span>
      </div>
      <p style="color:var(--text-main); font-size:14px; line-height:1.7;">${p.content}</p>
    `;
    container.appendChild(card);
  });
}

// ভাষা পরিবর্তন
function toggleLanguage() {
  currentLanguage = currentLanguage === 'bn' ? 'en' : 'bn';
  localStorage.setItem('locatm_lang', currentLanguage);
  applyLanguage(currentLanguage);
}

function applyLanguage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.bn;
  document.getElementById("currentLangLabel").innerText = lang.toUpperCase();

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.innerText = dict[key];
    }
  });

  document.querySelectorAll("[data-placeholder]").forEach(el => {
    const key = el.getAttribute("data-placeholder");
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
}

// বাটন ও ভিডিও
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

// ড্রয়ার ও মোডাল হেল্পার
function toggleDrawer(open) {
  const d = document.getElementById("drawerMenu");
  const o = document.getElementById("drawerOverlay");
  if (open) {
    d.classList.add("open");
    o.classList.add("active");
  } else {
    d.classList.remove("open");
    o.classList.remove("active");
  }
}

function openModalAndCloseDrawer(modalId) {
  toggleDrawer(false);
  openModal(modalId);
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("active");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("active");
}

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

function copyReferralLink() {
  const l = document.getElementById("myReferralLinkInput");
  l.select();
  navigator.clipboard.writeText(l.value);
  alert("রেফারেল লিংক কপি হয়েছে!");
}