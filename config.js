/**
 * ====================================================================
 * Locatm - Backend Cloud Database Configuration (config.js)
 * ====================================================================
 */

const SUPABASE_URL = "https://wixfgflqghyffjbbayuv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cDVOg5YfsL_m4If4tyE3BQ_rArOq7gu";

// গ্লোবাল ডাটাবেজ ক্লায়েন্ট ইনিশিয়ালাইজেশন
function getDatabaseClient() {
  if (typeof window.db !== 'undefined' && window.db) {
    return window.db;
  }
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    window.db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    return window.db;
  }
  return null;
}

// লোড হওয়ার সাথে সাথে ইনিট
getDatabaseClient();