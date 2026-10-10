/**
 * ====================================================================
 * Locatm - 24-Hour Automated Engine & Reward Distributor (cron.js)
 * ====================================================================
 * এই ফাইলটি ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে ২৪ ঘণ্টার ইনভেস্টমেন্ট ম্যাচিউর করে,
 * ইউজারের ওয়ালেটে মূল ব্যালেন্স + লাভ ফেরত দেয় এবং লাভ থেকে রেফারারকে
 * কমিশন বন্টন করে। এছাড়া প্রতিদিন রাত ১২টায় সেরা ইনভেস্টরকে পুরস্কৃত করে।
 */

const { createClient } = require('@supabase/supabase-js');
const CONFIG = require('./config.js');

// Supabase অ্যাডমিন ক্লায়েন্ট ইনিশিয়ালাইজেশন
const supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY);

/**
 * ১. ম্যাচিউরড ইনভেস্টমেন্ট প্রসেসিং ইঞ্জিন (প্রতি ১ মিনিট পরপর রান হবে)
 */
async function processMaturedInvestments() {
  try {
    const nowIso = new Date().toISOString();

    // যে সকল ইনভেস্টমেন্টের ২৪ ঘণ্টা পার হয়েছে এবং এখনো 'running' আছে
    const { data: matureList, error } = await supabase
      .from('investments')
      .select('*, profiles(id, referred_by)')
      .eq('status', 'running')
      .lte('mature_time', nowIso);

    if (error) {
      console.error('Error fetching investments:', error.message);
      return;
    }

    if (!matureList || matureList.length === 0) {
      return; // প্রসেস করার মতো কোনো পেন্ডিং ইনভেস্টমেন্ট নেই
    }

    console.log(`[ENGINE] ${matureList.length}টি ম্যাচিউরড ইনভেস্টমেন্ট পাওয়া গেছে। প্রসেসিং শুরু হচ্ছে...`);

    for (const inv of matureList) {
      const principal = parseFloat(inv.amount);
      const profitPct = parseFloat(inv.profit_pct_locked);
      
      // নিট লাভের হিসাব: যেমন $১০০ ইনভেস্টে ১০\% হলে নিট লাভ $১০
      const netProfit = (principal * profitPct) / 100;
      const totalReturn = principal + netProfit;

      // ক. ইউজারের ওয়ালেটে মূল টাকা + লাভ ফেরত দেওয়া
      const { data: userWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', inv.user_id)
        .single();

      if (userWallet) {
        const newMainBal = parseFloat(userWallet.main_balance) + totalReturn;
        const newLockedBal = Math.max(0, parseFloat(userWallet.locked_balance) - principal);
        const newTotalProfit = parseFloat(userWallet.total_profit) + netProfit;

        await supabase
          .from('wallets')
          .update({
            main_balance: newMainBal,
            locked_balance: newLockedBal,
            total_profit: newTotalProfit,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', inv.user_id);
      }

      // খ. ইনভেস্টমেন্ট স্ট্যাটাস 'completed'-এ পরিবর্তন
      await supabase
        .from('investments')
        .update({ status: 'completed' })
        .eq('id', inv.id);

      // গ. লেনদেন লেজারে রেকর্ড যুক্ত করা
      await supabase.from('transactions').insert([
        {
          user_id: inv.user_id,
          type: 'profit_return',
          amount: totalReturn,
          fee: 0,
          status: 'completed',
          reference_id: `INV_RETURN_${inv.id}`
        }
      ]);

      // ঘ. প্রফিট-বেসড রেফারেল কমিশন বন্টন (রেফারার থাকলে)
      const referrerId = inv.profiles?.referred_by;
      if (referrerId && netProfit > 0) {
        const commissionPct = CONFIG.FINANCE.REFERRAL_PROFIT_SHARE_PCT || 10;
        const referralCommission = (netProfit * commissionPct) / 100;

        const { data: refWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', referrerId)
          .single();

        if (refWallet) {
          const updatedRefBal = parseFloat(refWallet.main_balance) + referralCommission;
          await supabase
            .from('wallets')
            .update({
              main_balance: updatedRefBal,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', referrerId);

          // রেফারারের ট্রানজ্যাকশন হিস্ট্রিতে রেকর্ড
          await supabase.from('transactions').insert([
            {
              user_id: referrerId,
              type: 'ref_commission',
              amount: referralCommission,
              fee: 0,
              status: 'completed',
              reference_id: `REF_COMM_${inv.user_id}`
            }
          ]);

          console.log(`[REFERRAL] ইউজার ${referrerId}-কে $${referralCommission.toFixed(2)} কমিশন দেওয়া হয়েছে।`);
        }
      }

      console.log(`[SUCCESS] ইনভেস্টমেন্ট #${inv.id} সফলভাবে ম্যাচিউর হয়েছে (রিটার্ন: $${totalReturn.toFixed(2)})`);
    }
  } catch (err) {
    console.error('[CRON ERROR]', err.message);
  }
}

/**
 * ২. ডেইলি টপ ইনভেস্টর অ্যাওয়ার্ড ও নোটিস রোবট (প্রতিদিন রাত ১২টায় চলবে)
 */
async function checkDailyTopInvestor() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: topInvestments, error } = await supabase
      .from('investments')
      .select('user_id, amount')
      .gte('created_at', today.toISOString())
      .order('amount', { ascending: false })
      .limit(1);

    if (error || !topInvestments || topInvestments.length === 0) return;

    const winner = topInvestments[0];
    const prizeBonus = 25.00; // ডেইলি টপ ইনভেস্টর বোনাস ($২৫)

    console.log(`[DAILY AWARD] আজকের সেরা ইনভেস্টর: ${winner.user_id} ($${winner.amount})`);

    // উইনারের ওয়ালেটে বোনাস যুক্ত করা
    const { data: wWallet } = await supabase
      .from('wallets')
      .select('main_balance')
      .eq('user_id', winner.user_id)
      .single();

    if (wWallet) {
      await supabase
        .from('wallets')
        .update({ main_balance: parseFloat(wWallet.main_balance) + prizeBonus })
        .eq('user_id', winner.user_id);
    }
  } catch (e) {
    console.error('[DAILY BOUNTY ERROR]', e.message);
  }
}

// প্রতি ১ মিনিট পরপর ম্যাচিউরড ইনভেস্টমেন্ট চেক হবে
setInterval(processMaturedInvestments, 60 * 1000);

// প্রতি ২৪ ঘণ্টা পরপর রাত ১২টায় ডেইলি উইনার চেক হবে
setInterval(checkDailyTopInvestor, 24 * 60 * 60 * 1000);

// স্ক্রিপ্ট স্টার্ট লগ
console.log('🚀 Locatm 24-Hour Cron Engine Active & Monitoring Supabase Database...');

module.exports = {
  processMaturedInvestments,
  checkDailyTopInvestor
};