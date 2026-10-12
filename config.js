/**
 * ====================================================================
 * Locatm - Backend Cloud Database Configuration (config.js)
 * ====================================================================
 * ১০০% লাইভ সুপাবেস কানেকশন গ্লোবাল উইন্ডো স্কোপে নিশ্চিত করা হয়েছে।
 */

const SUPABASE_URL = "https://wixfgflqghyffjbbayuv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeGZnZmxxZ2h5ZmZqYmJheXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1Mjg2MjgsImV4cCI6MjA1NDEwNDYyOH0.XwZ0vT0Xm5C7o9I4y0h_tL0fF1v3U1N2j6K5o8G9h8";

// গ্লোবালি উইন্ডো স্কোপে db ইনিশিয়ালাইজেশন
try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    window.db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    var db = window.db;
  } else {
    console.warn("Supabase লাইব্রেরি এখনও ব্রাউজারে পুরোপুরি প্রস্তুত হচ্ছে...");
  }
} catch (err) {
  console.error("Config Initialization Error:", err);
}