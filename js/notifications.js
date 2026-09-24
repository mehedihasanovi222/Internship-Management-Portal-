/**
 * INTERNSHIP MANAGEMENT PORTAL - NOTIFICATIONS MODULE
 * Real-time notification list, unread filtering, mark all read, deletion
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('notifications-list-container')) {
    initNotificationsPage();
  }
});

let currentNotifFilter = 'all';

function initNotificationsPage() {
  const isCompany = window.location.pathname.includes('/company/');
  const target = isCompany ? 'company' : 'student';

  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      let list = DB.getNotifications();
      list.forEach(n => {
        if (n.target === target) n.read = true;
      });
      DB.saveNotifications(list);
      showToast('All notifications marked as read', 'info');
      renderNotificationsList(target);
      updateNotificationBadges();
    });
  }

  // Filter chips (All / Unread)
  const filterBtns = document.querySelectorAll('.notif-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      currentNotifFilter = btn.dataset.filter;
      renderNotificationsList(target);
    });
  });

  renderNotificationsList(target);
}

function renderNotificationsList(target) {
  const container = document.getElementById('notifications-list-container');
  if (!container) return;

  const notifications = DB.getNotifications(target);
  const filtered = notifications.filter(n => {
    if (currentNotifFilter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('unread-count-text');
  if (badge) badge.textContent = `${unreadCount} unread`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fa-regular fa-bell-slash"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Notifications</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">You are completely caught up! New alerts and interview invites will appear right here.</p>
      </div>
    `;
    return;
  }

  const icons = {
    interview: '<i class="fa-solid fa-video text-indigo-500"></i>',
    offer: '<i class="fa-solid fa-trophy text-emerald-500"></i>',
    status: '<i class="fa-solid fa-circle-check text-blue-500"></i>',
    recommendation: '<i class="fa-solid fa-wand-magic-sparkles text-purple-500"></i>',
    reminder: '<i class="fa-solid fa-clock text-rose-500"></i>',
    applicant: '<i class="fa-solid fa-user-plus text-indigo-500"></i>',
    post: '<i class="fa-solid fa-bullhorn text-emerald-500"></i>'
  };

  container.innerHTML = filtered.map(item => `
    <div class="p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 mb-3 ${item.read ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 shadow-sm'}">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-lg shadow-sm flex-shrink-0 mt-0.5">
          ${icons[item.type] || '<i class="fa-solid fa-bell text-indigo-500"></i>'}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">${item.title}</h4>
            ${!item.read ? '<span class="w-2 h-2 rounded-full bg-indigo-600"></span>' : ''}
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${item.message}</p>
          <span class="text-[11px] text-slate-400 font-medium mt-2 block">${item.date}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        ${!item.read ? `
          <button onclick="handleMarkNotifRead('${item.id}', '${target}')" class="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-xs font-semibold" title="Mark as Read">
            <i class="fa-solid fa-check"></i>
          </button>
        ` : ''}
        <button onclick="handleDeleteNotif('${item.id}', '${target}')" class="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition text-xs" title="Delete">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function handleMarkNotifRead(id, target) {
  let list = DB.getNotifications();
  const item = list.find(n => n.id === id);
  if (item) {
    item.read = true;
    DB.saveNotifications(list);
    renderNotificationsList(target);
    updateNotificationBadges();
  }
}

function handleDeleteNotif(id, target) {
  let list = DB.getNotifications();
  list = list.filter(n => n.id !== id);
  DB.saveNotifications(list);
  showToast('Notification deleted', 'info');
  renderNotificationsList(target);
  updateNotificationBadges();
}
