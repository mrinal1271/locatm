/**
 * ====================================================================
 * Locatm - Central System Configuration File
 * ====================================================================
 * এই ফাইলটিতে পুরো প্ল্যাটফর্মের ব্র্যান্ডিং, Supabase ক্রেডেনশিয়াল এবং
 * প্ল্যাটফর্মের বেসিক কনফিগারেশন সংরক্ষিত রয়েছে।
 * ভবিষ্যতে কোনো তথ্য পরিবর্তন করতে হলে শুধুমাত্র এই একটি ফাইল এডিট করলেই হবে।
 */

const CONFIG = {
  // ১. ব্র্যান্ডিং ও প্ল্যাটফর্ম বিবরণ
  PLATFORM: {
    NAME: "Locatm",
    DOMAIN: "locatm.com",
    TAGLINE: "Your Pocket ATM & Global Stock Investment Hub",
    CURRENCY_SYMBOL: "$",
    DEFAULT_VIP_LEVEL: 1
  },

  // ২. অফিসিয়াল নেটিভ টোকেন কনফিগারেশন
  TOKEN: {
    NAME: "Loca Token",
    SYMBOL: "LTM",
    DEFAULT_PRICE_USD: 0.10, // ১টি LTM কয়েনের প্রাথমিক মূল্য
    ALLOW_SWAP: true
  },

  // ৩. Supabase ক্লাউড কানেকশন (স্বয়ংক্রিয়ভাবে ইনজেক্ট করা হয়েছে)
  SUPABASE: {
    URL: "https://sxdacammcppmfrowparx.supabase.co",
    ANON_KEY: "sb_publishable_cDVOg5YfsL_m4If4tyE3BQ_rArOq7gu"
  },

  // ৪. উইথড্রাল ও এজেন্ট পলিসি ডিফল্ট সেটিংস
  FINANCE: {
    MIN_INVEST_AMOUNT: 0.10,
    AGENT_ACTIVATION_FEE: 100.00, // এজেন্ট অ্যাকাউন্ট চালু করার সিকিউরিটি ফি ($)
    AGENT_MIN_WITHDRAWAL: 1000.00, // এজেন্ট ব্যালেন্স তোলার মিনিমাম থ্রেশহোল্ড ($)
    DIRECT_WITHDRAW_FEE_PCT: 10,   // সাধারণ কোম্পানি উইথড্রাল ফি (%)
    AGENT_CASHOUT_FEE_PCT: 10,     // এজেন্ট ক্যাশ-আউট ফি (%) যা এজেন্টের লাভ
    REFERRAL_PROFIT_SHARE_PCT: 10  // ইউজারের লাভ থেকে রেফারারের আয় (%)
  },

  // ৫. সোশ্যাল রিভিউ ও মার্কেটিং ডিসকাউন্ট
  MARKETING: {
    VIDEO_REVIEW_DISCOUNT_PCT: 5,  // ফেসবুক/টিকটক ভিডিও দিলে উইথড্রাল ফি ছাড়
    BONUS_REWARD_USD: 1.00
  }
};

// গ্লোবালি অ্যাক্সেসযোগ্য করার জন্য উইন্ডো অবজেক্টে এক্সপোর্ট
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}

// নোড/মডিউলে ব্যবহারের জন্য সেফ এক্সপোর্ট
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}