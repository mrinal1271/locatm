/**
 * ====================================================================
 * Locatm - Ultra Master Admin Engine (admin.js) [Realtime Sync Engine]
 * ====================================================================
 */

let pendingAdminAction = null;
let activeEditingUser = null;
let adminUsersList = [];
let allMessagesList = [];
let currentMessageFilter = 'unread';
let adminRealtimeChannels = [];

// সেন্ট্রাল স্টেট
let adminSettings = {
  admin_credentials: { email: "admin@locatm.com", pass: "admin12345" },
  ltm_rate: 0.10,
  stock_profit_settings: { mode: "auto", min_percent: -5.0, max_percent: 5.0, manual_overrides: {}, timed_boosts: {} },
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

// স্টক কোম্পানি তালিকা
const ADMIN_STOCKS = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL" },
  { id: 2, name: "Microsoft Corp.", ticker: "MSFT" },
  { id: 3, name: "Google Alphabet", ticker: "GOOGL" },
  { id: 4, name: "Amazon.com Inc.", ticker: "AMZN" },
  { id: 5, name: "Nvidia Corp.", ticker: "NVDA" },
  { id: 6, name: "Tesla Motors", ticker: "TSLA" },
  { id: 7, name: "Meta Platforms", ticker: "META" },
  { id: 8, name: "Berkshire Hathaway", ticker: "BRK" },
  { id: 9, name: "Taiwan Semi (TSMC)", ticker: "TSM" },
  { id: 10, name: "Tencent Holdings", ticker: "TCEHY" }
];

function getDB() {
  if (typeof getDatabaseClient === 'function') {
    return getDatabaseClient();
  }
  return window.db || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPlatformSettings();
  checkAdminSession();
});

async function fetchPlatformSettings() {
  const dbClient = getDB();
  if (!dbClient) return;

  try {
    const { data, error } = await dbClient.from('platform_settings').select('*');
    if (!error && data) {
      data.forEach(item => {
        adminSettings[item.key] = item.value;
      });
    }
  } catch (e) {
    console.error("Settings load error:", e);
  }
}

function checkAdminSession() {
  const isAuth = sessionStorage.getItem("locatm_admin_auth");
  if (isAuth === "true") {
    document.getElementById("adminAuthScreen").classList.remove("active");
    document.getElementById("adminDashboardWrapper").style.display = "block";
    loadAllAdminData();
    initAdminRealtimeListener();
  } else {
    document.getElementById("adminAuthScreen").classList.add("active");
    document.getElementById("adminDashboardWrapper").style.display = "none";
  }
}

function verifyAdminLogin() {
  const em = document.getElementById("adminLogEmail").value.trim();
  const ps = document.getElementById("adminLogPass").value.trim();
  const creds = adminSettings.admin_credentials || { email: "admin@locatm.com", pass: "admin12345" };

  if (em === creds.email && ps === creds.pass) {
    sessionStorage.setItem("locatm_admin_auth", "true");
    document.getElementById("adminAuthScreen").classList.remove("active");
    document.getElementById("adminDashboardWrapper").style.display = "block";
    loadAllAdminData();
    initAdminRealtimeListener();
  } else {
    alert("ভুল অ্যাডমিন ইমেইল অথবা মাস্টার পাসওয়ার্ড!");
  }
}

function adminLogout() {
  sessionStorage.removeItem("locatm_admin_auth");
  window.location.reload();
}

// রিয়েল-টাইম লিসেনার (কোনো রিফ্রেশ লাগবে না)
function initAdminRealtimeListener() {
  const dbClient = getDB();
  if (!dbClient) return;

  adminRealtimeChannels.forEach(ch => dbClient.removeChannel(ch));
  adminRealtimeChannels = [];

  const txChan = dbClient.channel('admin-tx-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
      await loadPendingTransactions();
      await loadPlatformOverview();
    })
    .subscribe();
  adminRealtimeChannels.push(txChan);

  const msgChan = dbClient.channel('admin-msg-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_messages' }, async () => {
      await loadAdminSentMessages();
    })
    .subscribe();
  adminRealtimeChannels.push(msgChan);

  const invChan = dbClient.channel('admin-inv-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'investments' }, async () => {
      await loadPlatformOverview();
    })
    .subscribe();
  adminRealtimeChannels.push(invChan);
}

function toggleAdminDrawer(open) {
  const d = document.getElementById("adminDrawerMenu");
  const o = document.getElementById("adminDrawerOverlay");
  if (open) {
    d.classList.add("open");
    o.classList.add("active");
  } else {
    d.classList.remove("open");
    o.classList.remove("active");
  }
}

function switchAdminSection(secId) {
  toggleAdminDrawer(false);
  document.querySelectorAll('.admin-panel-section').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(secId);
  if (target) target.classList.add('active');
}

async function loadAllAdminData() {
  await loadPlatformOverview();
  await loadUserAuditList();
  await loadPendingTransactions();
  await loadAgentAuditList();
  await loadAdminSentMessages();
  renderActiveDepositMethods();
  renderActiveWithdrawMethods();
  renderStocksProfitTable();
  renderCustomButtonsTable();
  syncMasterTogglesUI();
}

async function loadPlatformOverview() {
  const dbClient = getDB();
  if (!dbClient) return;

  try {
    const { count: userCount } = await dbClient.from('users').select('*', { count: 'exact', head: true });
    document.getElementById("statTotalUsers").innerText = `${userCount || 0} জন`;

    const { data: activeInvs } = await dbClient.from('investments').select('amount').eq('status', 'active');
    let totalActiveInvAmount = 0;
    if (activeInvs) {
      activeInvs.forEach(i => {
        totalActiveInvAmount += parseFloat(i.amount || 0);
      });
    }
    document.getElementById("statActiveInvestments").innerText = `$${totalActiveInvAmount.toFixed(2)}`;

    const { data: txs } = await dbClient.from('transactions').select('type, amount, status');
    let depTotal = 0, withTotal = 0, pendingWithdraws = 0;
    if (txs) {
      txs.forEach(t => {
        if (t.status === 'approved') {
          if (t.type === 'deposit') depTotal += parseFloat(t.amount);
          if (t.type === 'withdraw') withTotal += parseFloat(t.amount);
        }
        if (t.status === 'pending' && t.type === 'withdraw') {
          pendingWithdraws++;
        }
      });
    }
    document.getElementById("statTotalDeposit").innerText = `$${depTotal.toFixed(2)}`;
    document.getElementById("statTotalWithdraw").innerText = `$${withTotal.toFixed(2)}`;
    document.getElementById("statPendingWithdrawals").innerText = `${pendingWithdraws} টি`;
    document.getElementById("statLtmRate").innerText = `$${parseFloat(adminSettings.ltm_rate || 0.10).toFixed(2)}`;

    document.getElementById("settingLtmRateInput").value = parseFloat(adminSettings.ltm_rate || 0.10).toFixed(2);
    document.getElementById("settingWtdFeeInput").value = parseFloat(adminSettings.withdraw_fee_percent || 0.0);
    document.getElementById("settingP2pFeeInput").value = parseFloat(adminSettings.p2p_fee_percent || 0.0);
    document.getElementById("settingAgentFeeInput").value = parseFloat(adminSettings.agent_security_fee || 10.0);
    document.getElementById("settingRefRateInput").value = parseFloat(adminSettings.referral_commission_percent || 10.0);
    document.getElementById("settingMarqueeInput").value = adminSettings.marquee_notice || "";
    document.getElementById("settingWelcomeInput").value = adminSettings.welcome_notice || "";
  } catch (e) {
    console.error("Overview error:", e);
  }
}

function syncMasterTogglesUI() {
  const toggles = adminSettings.feature_toggles || {};
  document.getElementById("switchAgent").checked = !!toggles.agent_system;
  document.getElementById("switchWithdraw").checked = toggles.withdrawals !== false;
  document.getElementById("switchInvest").checked = toggles.investments !== false;
  document.getElementById("switchP2P").checked = toggles.p2p !== false;
}

async function toggleMasterFeature(featureKey, isEnabled) {
  adminConfirmAction(`ফিচারটি ${isEnabled ? 'চালু' : 'বন্ধ'} করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.feature_toggles) adminSettings.feature_toggles = {};
    adminSettings.feature_toggles[featureKey] = isEnabled;

    await dbClient.from('platform_settings').upsert({
      key: 'feature_toggles',
      value: adminSettings.feature_toggles
    });
    alert("আপডেট হয়েছে!");
  });
}

async function loadUserAuditList() {
  const dbClient = getDB();
  if (!dbClient) return;

  const { data, error } = await dbClient.from('users').select('*').order('created_at', { ascending: false });
  if (!error && data) {
    adminUsersList = data;
    renderUserAuditTable(adminUsersList);
  }
}

function renderUserAuditTable(users) {
  const tbody = document.getElementById("userAuditTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;">${u.user_id}</strong></td>
      <td><strong>${u.name}</strong><br><small style="color:var(--text-muted);">${u.email}</small></td>
      <td>${u.phone}</td>
      <td style="color:#38bdf8; font-weight:800;">$${parseFloat(u.main_balance || 0).toFixed(2)}</td>
      <td style="color:var(--gold); font-weight:800;">${parseFloat(u.ltm_balance || 0).toFixed(2)}</td>
      <td>$${parseFloat(u.locked_balance || 0).toFixed(2)}</td>
      <td style="color:var(--text-dim);">${u.referred_by || 'Direct'}</td>
      <td>
        <button class="btn btn-outline" style="padding:3px 6px; font-size:10px;" onclick="openAdminEditUserModal('${u.user_id}')">✏️ Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterUserAuditTable() {
  const q = document.getElementById("userFilterInput").value.toLowerCase();
  const filtered = adminUsersList.filter(u =>
    u.user_id.toLowerCase().includes(q) ||
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.phone.includes(q)
  );
  renderUserAuditTable(filtered);
}

function openAdminEditUserModal(userId) {
  activeEditingUser = adminUsersList.find(u => u.user_id === userId);
  if (!activeEditingUser) return;

  document.getElementById("editUserTargetIdText").innerText = `${activeEditingUser.name} (${activeEditingUser.user_id})`;
  document.getElementById("editUserMainBal").value = activeEditingUser.main_balance;
  document.getElementById("editUserLtmBal").value = activeEditingUser.ltm_balance;
  document.getElementById("editUserLockedBal").value = activeEditingUser.locked_balance;

  document.getElementById("adminEditUserModal").classList.add("active");
}

function closeAdminEditUserModal() {
  document.getElementById("adminEditUserModal").classList.remove("active");
}

async function submitUserBalanceChanges() {
  if (!activeEditingUser) return;
  const newMain = parseFloat(document.getElementById("editUserMainBal").value);
  const newLtm = parseFloat(document.getElementById("editUserLtmBal").value);
  const newLocked = parseFloat(document.getElementById("editUserLockedBal").value);

  adminConfirmAction(`ইউজার ${activeEditingUser.user_id}-এর ব্যালেন্স পরিবর্তন করতে চান?`, async () => {
    const dbClient = getDB();
    const { error } = await dbClient.from('users').update({
      main_balance: newMain,
      ltm_balance: newLtm,
      locked_balance: newLocked
    }).eq('user_id', activeEditingUser.user_id);

    if (!error) {
      closeAdminEditUserModal();
      await loadUserAuditList();
      await loadPlatformOverview();
      alert("ব্যালেন্স আপডেট হয়েছে!");
    }
  });
}

// পেন্ডিং ট্রানজেকশন
async function loadPendingTransactions() {
  const tbody = document.getElementById("pendingRequestsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const dbClient = getDB();
  if (!dbClient) return;

  const { data: txs, error } = await dbClient.from('transactions').select('*').eq('status', 'pending').order('created_at', { ascending: false });
  if (error || !txs || txs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:14px;">কোনো পেন্ডিং রিকোয়েস্ট নেই।</td></tr>`;
    return;
  }

  txs.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;">${t.user_id}</strong></td>
      <td><span style="color:${t.type === 'deposit' ? 'var(--accent)' : 'var(--gold)'}; font-weight:700;">${t.type === 'deposit' ? 'ডিপোজিট' : 'উত্তোলন'}</span></td>
      <td>$${parseFloat(t.amount).toFixed(2)}</td>
      <td>${t.method} <br><small style="color:#38bdf8;">${t.trx_id ? 'TrxID: ' + t.trx_id : ''}</small></td>
      <td>${new Date(t.created_at).toLocaleString('bn-BD')}</td>
      <td>
        <button class="btn btn-accent" style="padding:3px 6px; font-size:10px;" onclick="approveTransaction(${t.id}, '${t.user_id}', '${t.type}', ${t.amount})">Approve</button>
        <button class="btn btn-danger" style="padding:3px 6px; font-size:10px; margin-left:4px;" onclick="rejectTransaction(${t.id}, '${t.user_id}', '${t.type}', ${t.amount})">Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function approveTransaction(txId, userId, type, amount) {
  adminConfirmAction(`$${amount} ${type === 'deposit' ? 'ডিপোজিট' : 'উইথড্রাল'} অনুমোদন করতে চান?`, async () => {
    const dbClient = getDB();
    if (type === 'deposit') {
      const { data: user } = await dbClient.from('users').select('main_balance').eq('user_id', userId).single();
      if (user) {
        const newBal = parseFloat(user.main_balance || 0) + parseFloat(amount);
        await dbClient.from('users').update({ main_balance: newBal }).eq('user_id', userId);
      }
    }
    await dbClient.from('transactions').update({ status: 'approved' }).eq('id', txId);
    alert("অনুমোদন সফল হয়েছে!");
    await loadPendingTransactions();
    await loadPlatformOverview();
    await loadUserAuditList();
  });
}

async function rejectTransaction(txId, userId, type, amount) {
  adminConfirmAction(`ট্রানজেকশন বাতিল করতে চান?`, async () => {
    const dbClient = getDB();
    if (type === 'withdraw') {
      const { data: user } = await dbClient.from('users').select('main_balance').eq('user_id', userId).single();
      if (user) {
        const refundBal = parseFloat(user.main_balance || 0) + parseFloat(amount);
        await dbClient.from('users').update({ main_balance: refundBal }).eq('user_id', userId);
      }
    }
    await dbClient.from('transactions').update({ status: 'rejected' }).eq('id', txId);
    alert("ট্রানজেকশন বাতিল করা হয়েছে!");
    await loadPendingTransactions();
    await loadPlatformOverview();
    await loadUserAuditList();
  });
}

// লাইভ চ্যাট হ্যান্ডলার
async function loadAdminSentMessages() {
  const dbClient = getDB();
  if (!dbClient) return;

  const { data: msgs, error } = await dbClient.from('user_messages').select('*').order('created_at', { ascending: false });
  if (!error && msgs) {
    allMessagesList = msgs;
    renderAdminMessagesTable();
  }
}

function filterAdminMessages(filterType) {
  currentMessageFilter = filterType;
  if (filterType === 'unread') {
    document.getElementById("chatFilterUnread").className = "btn btn-primary";
    document.getElementById("chatFilterAll").className = "btn btn-outline";
  } else {
    document.getElementById("chatFilterUnread").className = "btn btn-outline";
    document.getElementById("chatFilterAll").className = "btn btn-primary";
  }
  renderAdminMessagesTable();
}

function renderAdminMessagesTable() {
  const tbody = document.getElementById("adminSentMessagesTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let list = allMessagesList;
  if (currentMessageFilter === 'unread') {
    list = allMessagesList.filter(m => m.sender !== 'Admin Support' && !m.is_read);
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:14px;">কোনো মেসেজ নেই।</td></tr>`;
    return;
  }

  list.forEach(m => {
    const isFromAdmin = m.sender === 'Admin Support';
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;" onclick="selectReplyTarget('${m.user_id}')">${m.user_id} 💬</strong></td>
      <td><span style="color:${isFromAdmin ? 'var(--accent)' : '#fff'}; font-weight:700;">${m.sender}</span></td>
      <td onclick="selectReplyTarget('${m.user_id}')">${m.message}</td>
      <td>${isFromAdmin ? '<small style="color:var(--text-muted);">Sent</small>' : (m.is_read ? '<span style="color:var(--accent);">Seen</span>' : '<span style="color:var(--gold); font-weight:700;">Unread</span>')}</td>
      <td><small style="color:var(--text-dim);">${new Date(m.created_at).toLocaleString('bn-BD')}</small></td>
      <td>
        ${!isFromAdmin && !m.is_read ? `<button class="btn btn-outline" style="padding:3px 6px; font-size:10px;" onclick="markMessageAsRead(${m.id})">Seen</button>` : ''}
        ${isFromAdmin ? `<button class="btn btn-outline" style="padding:3px 6px; font-size:10px;" onclick="editAdminMessage(${m.id}, '${m.user_id}', \`${m.message.replace(/`/g, "\\`")}\`)">Edit</button>` : ''}
        <button class="btn btn-danger" style="padding:3px 6px; font-size:10px; margin-left:3px;" onclick="deleteAdminMessage(${m.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function selectReplyTarget(userId) {
  document.getElementById("adminMsgTargetUserId").value = userId;
  document.getElementById("replyTargetLabel").innerText = `প্রাপক: ${userId}-কে রিপ্লাই দেওয়া হচ্ছে`;
  document.getElementById("adminMsgContent").focus();
}

function clearReplyTarget() {
  document.getElementById("adminMsgTargetUserId").value = "";
  document.getElementById("adminMsgContent").value = "";
  document.getElementById("editingMsgId").value = "";
  document.getElementById("replyTargetLabel").innerText = "প্রাপক নির্বাচন করুন (মেসেজে ক্লিক করুন)";
  document.getElementById("sendReplyBtn").innerText = "রিপ্লাই পাঠান";
  document.getElementById("cancelEditBtn").style.display = "none";
}

async function markMessageAsRead(msgId) {
  const dbClient = getDB();
  await dbClient.from('user_messages').update({ is_read: true }).eq('id', msgId);
  await loadAdminSentMessages();
}

function editAdminMessage(msgId, userId, currentText) {
  document.getElementById("editingMsgId").value = msgId;
  document.getElementById("adminMsgTargetUserId").value = userId;
  document.getElementById("adminMsgContent").value = currentText;
  document.getElementById("replyTargetLabel").innerText = `এডিট মোড (ID: ${userId})`;
  document.getElementById("sendReplyBtn").innerText = "আপডেট করুন";
  document.getElementById("cancelEditBtn").style.display = "inline-block";
  document.getElementById("adminMsgContent").focus();
}

function cancelMessageEdit() {
  clearReplyTarget();
}

async function deleteAdminMessage(msgId) {
  adminConfirmAction("মেসেজটি মুছে ফেলতে চান?", async () => {
    const dbClient = getDB();
    await dbClient.from('user_messages').delete().eq('id', msgId);
    await loadAdminSentMessages();
  });
}

async function sendAdminDirectMessage() {
  const targetId = document.getElementById("adminMsgTargetUserId").value.trim();
  const content = document.getElementById("adminMsgContent").value.trim();
  const editId = document.getElementById("editingMsgId").value.trim();

  if (!targetId || !content) {
    alert("User ID এবং মেসেজ লিখুন!");
    return;
  }

  const dbClient = getDB();

  if (editId) {
    adminConfirmAction("মেসেজটি আপডেট করতে চান?", async () => {
      const { error } = await dbClient.from('user_messages').update({ message: content, updated_at: new Date() }).eq('id', editId);
      if (!error) {
        clearReplyTarget();
        await loadAdminSentMessages();
        alert("মেসেজ আপডেট হয়েছে!");
      }
    });
  } else {
    adminConfirmAction(`মেসেজ পাঠাতে চান?`, async () => {
      const { error } = await dbClient.from('user_messages').insert([{
        user_id: targetId,
        sender: 'Admin Support',
        message: content,
        is_read: false
      }]);

      if (!error) {
        document.getElementById("adminMsgContent").value = "";
        await loadAdminSentMessages();
        alert("মেসেজ পৌঁছেছে!");
      }
    });
  }
}

// ডিপোজিট ও উইথড্রাল মেথডস
function renderActiveDepositMethods() {
  const tbody = document.getElementById("activeDepMethodsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const methods = adminSettings.deposit_methods || [];
  methods.forEach((m, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${m.name}</strong></td>
      <td><span style="color:#38bdf8;">${m.address}</span></td>
      <td><button class="btn btn-danger" style="padding:3px 6px; font-size:10px;" onclick="deleteDepositMethod(${idx})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveNewDepositMethod() {
  const name = document.getElementById("newDepName").value.trim();
  const addr = document.getElementById("newDepAddress").value.trim();
  const note = document.getElementById("newDepNote").value.trim();

  if (!name || !addr) return;

  adminConfirmAction(`ডিপোজিট মেথড "${name}" সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.deposit_methods) adminSettings.deposit_methods = [];
    adminSettings.deposit_methods.push({ name, address: addr, note });

    await dbClient.from('platform_settings').upsert({
      key: 'deposit_methods',
      value: adminSettings.deposit_methods
    });

    renderActiveDepositMethods();
    document.getElementById("newDepName").value = "";
    document.getElementById("newDepAddress").value = "";
    document.getElementById("newDepNote").value = "";
    alert("মেথড যোগ হয়েছে!");
  });
}

async function deleteDepositMethod(idx) {
  adminConfirmAction("মেথডটি ডিলিট করতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.deposit_methods.splice(idx, 1);
    await dbClient.from('platform_settings').upsert({
      key: 'deposit_methods',
      value: adminSettings.deposit_methods
    });
    renderActiveDepositMethods();
  });
}

function renderActiveWithdrawMethods() {
  const tbody = document.getElementById("activeWtdMethodsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const methods = adminSettings.withdraw_methods || [];
  methods.forEach((m, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${m.name}</strong></td>
      <td><button class="btn btn-danger" style="padding:3px 6px; font-size:10px;" onclick="deleteWithdrawMethod(${idx})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveNewWithdrawMethod() {
  const name = document.getElementById("newWtdName").value.trim();
  if (!name) return;

  adminConfirmAction(`উত্তোলন মেথড "${name}" সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.withdraw_methods) adminSettings.withdraw_methods = [];
    adminSettings.withdraw_methods.push({ name });

    await dbClient.from('platform_settings').upsert({
      key: 'withdraw_methods',
      value: adminSettings.withdraw_methods
    });

    renderActiveWithdrawMethods();
    document.getElementById("newWtdName").value = "";
    alert("মেথড যোগ হয়েছে!");
  });
}

async function deleteWithdrawMethod(idx) {
  adminConfirmAction("মেথডটি ডিলিট করতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.withdraw_methods.splice(idx, 1);
    await dbClient.from('platform_settings').upsert({
      key: 'withdraw_methods',
      value: adminSettings.withdraw_methods
    });
    renderActiveWithdrawMethods();
  });
}

async function saveWithdrawFee() {
  const fee = parseFloat(document.getElementById("settingWtdFeeInput").value);
  adminConfirmAction(`উত্তোলন ফি ${fee}% সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    adminSettings.withdraw_fee_percent = fee;
    await dbClient.from('platform_settings').upsert({
      key: 'withdraw_fee_percent',
      value: fee
    });
    alert("ফি আপডেট হয়েছে!");
  });
}

function renderStocksProfitTable() {
  const tbody = document.getElementById("stockProfitTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const settings = adminSettings.stock_profit_settings || { mode: 'auto', min_percent: -5.0, max_percent: 5.0, manual_overrides: {}, timed_boosts: {} };
  const overrides = settings.manual_overrides || {};

  ADMIN_STOCKS.forEach(stk => {
    const isManual = overrides[stk.id] !== undefined;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${stk.name}</strong></td>
      <td><span style="color:#38bdf8;">${stk.ticker}</span></td>
      <td><input type="number" id="manual_rate_${stk.id}" value="${isManual ? overrides[stk.id] : ''}" placeholder="${isManual ? overrides[stk.id] : 'Auto'}" step="0.1" style="width:65px; padding:3px; background:#0b0f19; border:1px solid var(--glass-border); border-radius:6px; color:#fff; text-align:center;"> %</td>
      <td>
        <div style="display:flex; gap:3px;">
          <input type="number" id="boost_rate_${stk.id}" placeholder="Rate%" style="width:50px; padding:3px; background:#0b0f19; border:1px solid var(--glass-border); border-radius:6px; color:var(--accent); text-align:center;">
          <input type="number" id="boost_hrs_${stk.id}" placeholder="Hrs" style="width:45px; padding:3px; background:#0b0f19; border:1px solid var(--glass-border); border-radius:6px; color:var(--gold); text-align:center;">
          <button class="btn btn-accent" style="padding:3px 6px; font-size:10px;" onclick="applyTimedStockBoost(${stk.id}, '${stk.name}')">Boost</button>
        </div>
      </td>
      <td><button class="btn btn-outline" style="padding:3px 6px; font-size:10px;" onclick="saveSingleStockManualRate(${stk.id}, '${stk.name}')">Save</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveGlobalStockRange() {
  const minP = parseFloat(document.getElementById("autoMinPercent").value);
  const maxP = parseFloat(document.getElementById("autoMaxPercent").value);

  adminConfirmAction(`গ্লোবাল রেঞ্জ সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.stock_profit_settings) adminSettings.stock_profit_settings = {};
    adminSettings.stock_profit_settings.min_percent = minP;
    adminSettings.stock_profit_settings.max_percent = maxP;

    await dbClient.from('platform_settings').upsert({
      key: 'stock_profit_settings',
      value: adminSettings.stock_profit_settings
    });
    alert("রেঞ্জ সেভ হয়েছে!");
  });
}

async function saveSingleStockManualRate(stockId, stockName) {
  const val = document.getElementById(`manual_rate_${stockId}`).value.trim();
  if (val === "") return;
  const rate = parseFloat(val);

  adminConfirmAction(`${stockName}-এর রেট ${rate}% নির্ধারণ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.stock_profit_settings.manual_overrides) {
      adminSettings.stock_profit_settings.manual_overrides = {};
    }
    adminSettings.stock_profit_settings.manual_overrides[stockId] = rate;

    await dbClient.from('platform_settings').upsert({
      key: 'stock_profit_settings',
      value: adminSettings.stock_profit_settings
    });
    alert("সেভ হয়েছে!");
  });
}

async function applyTimedStockBoost(stockId, stockName) {
  const rateVal = parseFloat(document.getElementById(`boost_rate_${stockId}`).value);
  const hrsVal = parseFloat(document.getElementById(`boost_hrs_${stockId}`).value);

  if (isNaN(rateVal) || isNaN(hrsVal) || hrsVal <= 0) return;

  adminConfirmAction(`${stockName}-এ ${hrsVal} ঘণ্টার জন্য বুস্ট দিতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.stock_profit_settings.timed_boosts) {
      adminSettings.stock_profit_settings.timed_boosts = {};
    }

    const expiresAt = new Date(Date.now() + hrsVal * 60 * 60 * 1000).toISOString();
    adminSettings.stock_profit_settings.timed_boosts[stockId] = { rate: rateVal, expires_at: expiresAt };

    await dbClient.from('platform_settings').upsert({
      key: 'stock_profit_settings',
      value: adminSettings.stock_profit_settings
    });
    alert("বুস্ট অ্যাক্টিভ হয়েছে!");
  });
}

async function saveAgentSecurityFee() {
  const fee = parseFloat(document.getElementById("settingAgentFeeInput").value);
  adminConfirmAction(`এজেন্ট ফি $${fee} সেভ করতে চান?`, async () => {
    const dbClient = getDB();
    adminSettings.agent_security_fee = fee;
    await dbClient.from('platform_settings').upsert({
      key: 'agent_security_fee',
      value: fee
    });
    alert("ফি সেভ হয়েছে!");
  });
}

async function loadAgentAuditList() {
  const tbody = document.getElementById("agentAuditTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const dbClient = getDB();
  if (!dbClient) return;

  const { data: agents, error } = await dbClient.from('agent_applications').select('*').order('created_at', { ascending: false });
  if (error || !agents || agents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:14px;">কোনো আবেদন নেই।</td></tr>`;
    return;
  }

  agents.forEach(ag => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong style="color:#38bdf8;">${ag.user_id}</strong></td>
      <td><strong>${ag.full_name || 'N/A'}</strong><br><small style="color:var(--text-muted);">${ag.shop_name}</small></td>
      <td>${ag.nid_number || 'N/A'}</td>
      <td>📞 ${ag.phone}</td>
      <td><small style="color:var(--text-muted);">${ag.location || '-'}</small></td>
      <td>
        ${ag.status === 'pending' ? `
          <button class="btn btn-accent" style="padding:3px 6px; font-size:10px;" onclick="approveAgentApplication(${ag.id}, '${ag.user_id}')">Approve</button>
          <button class="btn btn-danger" style="padding:3px 6px; font-size:10px; margin-left:3px;" onclick="rejectAgentApplication(${ag.id})">Reject</button>
        ` : `<span style="color:${ag.status === 'approved' ? 'var(--accent)' : 'var(--danger)'};">${ag.status.toUpperCase()}</span>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function approveAgentApplication(appId, userId) {
  adminConfirmAction("আবেদনটি অনুমোদন করতে চান?", async () => {
    const dbClient = getDB();
    await dbClient.from('agent_applications').update({ status: 'approved' }).eq('id', appId);
    await dbClient.from('users').update({ is_agent: true }).eq('user_id', userId);
    alert("অনুমোদিত হয়েছে!");
    await loadAgentAuditList();
  });
}

async function rejectAgentApplication(appId) {
  adminConfirmAction("আবেদনটি বাতিল করতে চান?", async () => {
    const dbClient = getDB();
    await dbClient.from('agent_applications').update({ status: 'rejected' }).eq('id', appId);
    alert("বাতিল করা হয়েছে!");
    await loadAgentAuditList();
  });
}

function renderCustomButtonsTable() {
  const tbody = document.getElementById("customButtonsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const btns = adminSettings.custom_buttons || [];
  btns.forEach((b, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${b.title}</strong></td>
      <td><small style="color:#38bdf8;">${b.url}</small></td>
      <td>${b.isEmbed ? 'In-App' : 'External'}</td>
      <td><button class="btn btn-danger" style="padding:3px 6px; font-size:10px;" onclick="deleteCustomButton(${idx})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveCustomButton() {
  const title = document.getElementById("customButtonTitleInput").value.trim();
  const url = document.getElementById("customButtonUrlInput").value.trim();
  const isEmbed = document.getElementById("customButtonEmbedCheck").checked;

  if (!title || !url) return;

  adminConfirmAction(`বাটন যোগ করতে চান?`, async () => {
    const dbClient = getDB();
    if (!adminSettings.custom_buttons) adminSettings.custom_buttons = [];
    adminSettings.custom_buttons.push({ title, url, isEmbed });

    await dbClient.from('platform_settings').upsert({
      key: 'custom_buttons',
      value: adminSettings.custom_buttons
    });

    renderCustomButtonsTable();
    document.getElementById("customButtonTitleInput").value = "";
    document.getElementById("customButtonUrlInput").value = "";
    alert("বাটন যোগ হয়েছে!");
  });
}

async function deleteCustomButton(idx) {
  adminConfirmAction("বাটনটি মুছে ফেলতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.custom_buttons.splice(idx, 1);
    await dbClient.from('platform_settings').upsert({
      key: 'custom_buttons',
      value: adminSettings.custom_buttons
    });
    renderCustomButtonsTable();
  });
}

async function saveLtmRate() {
  const rate = parseFloat(document.getElementById("settingLtmRateInput").value);
  adminConfirmAction(`LTM রেট $${rate} নির্ধারণ করতে চান?`, async () => {
    const dbClient = getDB();
    adminSettings.ltm_rate = rate;
    await dbClient.from('platform_settings').upsert({ key: 'ltm_rate', value: rate });
    document.getElementById("statLtmRate").innerText = `$${rate.toFixed(2)}`;
    alert("রেট সেভ হয়েছে!");
  });
}

async function saveP2pFee() {
  const fee = parseFloat(document.getElementById("settingP2pFeeInput").value);
  adminConfirmAction(`P2P ফি ${fee}% নির্ধারণ করতে চান?`, async () => {
    const dbClient = getDB();
    adminSettings.p2p_fee_percent = fee;
    await dbClient.from('platform_settings').upsert({ key: 'p2p_fee_percent', value: fee });
    alert("ফি সেভ হয়েছে!");
  });
}

async function saveReferralCommission() {
  const rate = parseFloat(document.getElementById("settingRefRateInput").value);
  adminConfirmAction(`রেফারেল রেট ${rate}% নির্ধারণ করতে চান?`, async () => {
    const dbClient = getDB();
    adminSettings.referral_commission_percent = rate;
    await dbClient.from('platform_settings').upsert({ key: 'referral_commission_percent', value: rate });
    alert("রেট সেভ হয়েছে!");
  });
}

async function saveMarqueeNotice() {
  const text = document.getElementById("settingMarqueeInput").value.trim();
  adminConfirmAction("মারকুই নোটিস সেভ করতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.marquee_notice = text;
    await dbClient.from('platform_settings').upsert({ key: 'marquee_notice', value: text });
    alert("মারকুই সেভ হয়েছে!");
  });
}

async function saveWelcomeNotice() {
  const text = document.getElementById("settingWelcomeInput").value.trim();
  adminConfirmAction("ওয়েলকাম নোটিস সেভ করতে চান?", async () => {
    const dbClient = getDB();
    adminSettings.welcome_notice = text;
    await dbClient.from('platform_settings').upsert({ key: 'welcome_notice', value: text });
    alert("ওয়েলকাম নোটিস সেভ হয়েছে!");
  });
}

function adminConfirmAction(message, callback) {
  document.getElementById("adminConfirmMessage").innerText = message;
  pendingAdminAction = callback;
  document.getElementById("adminConfirmModal").classList.add("active");
}

function closeAdminConfirm() {
  document.getElementById("adminConfirmModal").classList.remove("active");
}

document.getElementById("adminConfirmOkBtn").addEventListener("click", () => {
  closeAdminConfirm();
  if (typeof pendingAdminAction === "function") {
    pendingAdminAction();
    pendingAdminAction = null;
  }
});