/**
 * ====================================================================
 * Locatm - Backend Cloud Database Configuration (config.js)
 * ====================================================================
 */

const SUPABASE_URL = "https://wixfgflqghyffjbbayuv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeGZnZmxxZ2h5ZmZqYmJheXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1Mjg2MjgsImV4cCI6MjA1NDEwNDYyOH0.XwZ0vT0Xm5C7o9I4y0h_tL0fF1v3U1N2j6K5o8G9h8";

// গ্লোবাল ইনিশিয়ালাইজার
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

// অবিলম্বে ইনিট
getDatabaseClient();