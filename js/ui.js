/**
 * INTERNSHIP MANAGEMENT PORTAL - UI & BENTO GRID NAVIGATION CONTROLLER
 * Handles Bento Grid sidebars, topbars, mobile drawer, global search, dropdowns, logout modal, active nav states
 */

document.addEventListener('DOMContentLoaded', () => {
  injectPortalNavigation();
  setupMobileNav();
  setupUserDropdowns();
  setupGlobalSearch();
  setupNavActiveState();
  updateNotificationBadges();
  setupThemeToggleButtons();
});

/**
 * Automatically inject Bento Grid Sidebars & Topbars across Student and Company portals
 */
function injectPortalNavigation() {
  const currentPath = window.location.pathname;
  const isStudent = currentPath.includes('/student/') || document.getElementById('student-sidebar-root');
  const isCompany = currentPath.includes('/company/') || document.getElementById('company-sidebar-root');

  // Inject Student Navigation
  const studentSidebarRoot = document.getElementById('student-sidebar-root');
  const studentTopbarRoot = document.getElementById('student-topbar-root');

  if (studentSidebarRoot) {
    const student = DB.getStudentProfile();
    studentSidebarRoot.className = "w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between shrink-0 z-30 transition-transform duration-300 -translate-x-full lg:translate-x-0 fixed lg:static inset-y-0 left-0 shadow-2xl lg:shadow-none";
    studentSidebarRoot.id = "app-sidebar";

    studentSidebarRoot.innerHTML = `
      <div class="p-6 flex flex-col h-full overflow-y-auto">
        <!-- Bento Brand Header -->
        <div class="flex items-center justify-between pb-6 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <a href="dashboard.html" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border border-white/20">
              <i class="fa-solid fa-graduation-cap text-base"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold font-heading text-base tracking-tighter text-zinc-900 dark:text-white">INTERN<span class="text-indigo-600 dark:text-indigo-400">PORTAL</span></span>
              </div>
              <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Student Console</span>
            </div>
          </a>
          <button id="close-sidebar-btn" class="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Bento Navigation Links -->
        <div class="space-y-1.5 flex-1">
          <!-- Direct Home Page Button -->
          <a href="../../index.html" class="flex items-center gap-3.5 px-4 py-2.5 mb-3 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition">
            <i class="fa-solid fa-house text-sm w-4"></i>
            <span>Return to Home</span>
            <i class="fa-solid fa-arrow-left text-[10px] ml-auto"></i>
          </a>

          <p class="bento-label px-3 mb-2">Workspace</p>
          
          <a href="dashboard.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-table-cells-large text-sm w-4"></i>
            <span>Overview Dashboard</span>
          </a>

          <a href="internships.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-magnifying-glass text-sm w-4"></i>
            <span>Browse Internships</span>
          </a>

          <a href="applications.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-regular fa-paper-plane text-sm w-4"></i>
            <span>My Applications</span>
          </a>

          <a href="interviews.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-video text-sm w-4"></i>
            <span>Interview Schedule</span>
          </a>

          <a href="saved-internships.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-regular fa-bookmark text-sm w-4"></i>
            <span>Saved Internships</span>
          </a>

          <p class="bento-label px-3 mt-6 mb-2">Credentials</p>

          <a href="resume.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-regular fa-file-pdf text-sm w-4 text-rose-500"></i>
            <span>Resume & CV Vault</span>
          </a>

          <a href="profile.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-regular fa-user text-sm w-4"></i>
            <span>Student Profile</span>
          </a>

          <a href="notifications.html" class="sidebar-link flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <div class="flex items-center gap-3.5">
              <i class="fa-regular fa-bell text-sm w-4"></i>
              <span>Notifications</span>
            </div>
            <span class="notif-badge-count hidden px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">0</span>
          </a>

          <a href="settings.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-gear text-sm w-4"></i>
            <span>Account Settings</span>
          </a>
        </div>

        <!-- Bento User Footer Card -->
        <div class="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative shrink-0">
                <img src="${student.avatar}" alt="${student.name}" class="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
              </div>
              <div class="min-w-0">
                <h5 class="text-xs font-bold text-zinc-900 dark:text-white truncate">${student.name}</h5>
                <p class="text-[10px] text-zinc-500 truncate">${student.email || 'Candidate Account'}</p>
              </div>
            </div>
            <button onclick="handleLogout()" title="Sign Out" class="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
              <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Inject Student Topbar
  if (studentTopbarRoot) {
    const student = DB.getStudentProfile();
    studentTopbarRoot.className = "h-20 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 z-20";
    studentTopbarRoot.innerHTML = `
      <div class="flex items-center gap-4 flex-1">
        <button id="mobile-menu-btn" class="lg:hidden p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
          <i class="fa-solid fa-bars text-sm"></i>
        </button>

        <!-- Bento Search Bar -->
        <div class="relative max-w-md w-full hidden sm:block">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
            <i class="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input type="text" id="global-search-input" placeholder="Search internships, roles, skills (Press Ctrl+K)..." class="w-full pl-9 pr-14 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition" />
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd class="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold">⌘K</kbd>
          </span>
        </div>
      </div>

      <!-- Right Bento Controls -->
      <div class="flex items-center gap-2.5">
        <!-- Return to Home Page Link -->
        <a href="../../index.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition" title="Go to Main Home Page">
          <i class="fa-solid fa-house text-xs text-indigo-500"></i>
          <span class="hidden sm:inline">Home</span>
        </a>

        <!-- Direct Switch to Company Portal -->
        <a href="../company/dashboard.html" class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition" title="Switch to Corporate Recruiter View">
          <i class="fa-solid fa-building text-xs text-cyan-500"></i>
          <span>Company Portal</span>
          <i class="fa-solid fa-arrow-right text-[10px] text-zinc-400"></i>
        </a>

        <!-- Live Drive Badge -->
        <div class="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full">
          <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>FALL 2026 LIVE</span>
        </div>

        <!-- Theme Switcher -->
        <button class="theme-toggle-btn p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition" title="Toggle Theme">
          <i class="fa-regular fa-moon dark:hidden text-sm"></i>
          <i class="fa-regular fa-sun hidden dark:block text-sm text-amber-400"></i>
        </button>

        <!-- Notification Dropdown -->
        <div class="relative">
          <button id="notif-dropdown-btn" class="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition relative">
            <i class="fa-regular fa-bell text-sm"></i>
            <span class="notif-badge-count hidden absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-zinc-950"></span>
          </button>
        </div>

        <!-- Student Pill Profile -->
        <a href="profile.html" class="flex items-center gap-3 bg-zinc-100/80 dark:bg-zinc-900/60 p-1.5 pl-3.5 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-indigo-400 dark:hover:border-indigo-500 transition">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-bold text-zinc-900 dark:text-white leading-tight">${student.name.split(' ')[0]}</p>
            <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Candidate</p>
          </div>
          <img src="${student.avatar}" alt="${student.name}" class="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" />
        </a>
      </div>
    `;
  }

  // Inject Company Navigation
  const companySidebarRoot = document.getElementById('company-sidebar-root');
  const companyTopbarRoot = document.getElementById('company-topbar-root');

  if (companySidebarRoot) {
    const company = DB.getCompanyProfile();
    companySidebarRoot.className = "w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between shrink-0 z-30 transition-transform duration-300 -translate-x-full lg:translate-x-0 fixed lg:static inset-y-0 left-0 shadow-2xl lg:shadow-none";
    companySidebarRoot.id = "app-sidebar";

    companySidebarRoot.innerHTML = `
      <div class="p-6 flex flex-col h-full overflow-y-auto">
        <!-- Bento Brand Header -->
        <div class="flex items-center justify-between pb-6 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <a href="dashboard.html" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 border border-white/20">
              <i class="fa-solid fa-briefcase text-base"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold font-heading text-base tracking-tighter text-zinc-900 dark:text-white">TECHNOVA</span>
              </div>
              <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Recruiter ATS</span>
            </div>
          </a>
          <button id="close-sidebar-btn" class="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Bento Navigation Links -->
        <div class="space-y-1.5 flex-1">
          <!-- Direct Home Page Button -->
          <a href="../../index.html" class="flex items-center gap-3.5 px-4 py-2.5 mb-3 rounded-2xl text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition">
            <i class="fa-solid fa-house text-sm w-4"></i>
            <span>Return to Home</span>
            <i class="fa-solid fa-arrow-left text-[10px] ml-auto"></i>
          </a>

          <p class="bento-label px-3 mb-2">Talent Suite</p>
          
          <a href="dashboard.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-chart-pie text-sm w-4"></i>
            <span>Recruiter Analytics</span>
          </a>

          <a href="post-internship.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-plus-circle text-sm w-4 text-indigo-500"></i>
            <span>Post New Internship</span>
          </a>

          <a href="applicants.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-users text-sm w-4"></i>
            <span>ATS Candidate Pool</span>
          </a>

          <a href="interviews.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-video text-sm w-4"></i>
            <span>Interview Pipeline</span>
          </a>

          <a href="my-internships.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-list-check text-sm w-4"></i>
            <span>Active Job Posts</span>
          </a>

          <p class="bento-label px-3 mt-6 mb-2">Corporate</p>

          <a href="profile.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-regular fa-building text-sm w-4"></i>
            <span>Company Profile</span>
          </a>

          <a href="notifications.html" class="sidebar-link flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <div class="flex items-center gap-3.5">
              <i class="fa-regular fa-bell text-sm w-4"></i>
              <span>ATS Alerts</span>
            </div>
            <span class="notif-badge-count hidden px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">0</span>
          </a>

          <a href="settings.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-gear text-sm w-4"></i>
            <span>Corporate Settings</span>
          </a>
        </div>

        <!-- Bento Recruiter Footer Card -->
        <div class="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative shrink-0">
                <img src="${company.logo}" alt="${company.name}" class="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700" />
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
              </div>
              <div class="min-w-0">
                <h5 class="text-xs font-bold text-zinc-900 dark:text-white truncate">${company.name}</h5>
                <p class="text-[10px] text-zinc-500 truncate">HR Lead: ${company.hrName}</p>
              </div>
            </div>
            <button onclick="handleLogout()" title="Sign Out" class="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
              <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Inject Company Topbar
  if (companyTopbarRoot) {
    const company = DB.getCompanyProfile();
    companyTopbarRoot.className = "h-20 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 z-20";
    companyTopbarRoot.innerHTML = `
      <div class="flex items-center gap-4 flex-1">
        <button id="mobile-menu-btn" class="lg:hidden p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
          <i class="fa-solid fa-bars text-sm"></i>
        </button>

        <!-- Bento Search Bar -->
        <div class="relative max-w-md w-full hidden sm:block">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
            <i class="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input type="text" id="global-search-input" placeholder="Search applicants, CGPA, skills (Press Ctrl+K)..." class="w-full pl-9 pr-14 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition" />
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd class="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold">⌘K</kbd>
          </span>
        </div>
      </div>

      <!-- Right Bento Controls -->
      <div class="flex items-center gap-2.5">
        <!-- Return to Home Page Link -->
        <a href="../../index.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition" title="Go to Main Home Page">
          <i class="fa-solid fa-house text-xs text-cyan-500"></i>
          <span class="hidden sm:inline">Home</span>
        </a>

        <!-- Direct Switch to Student Portal -->
        <a href="../student/dashboard.html" class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition" title="Switch to Student Candidate View">
          <i class="fa-solid fa-graduation-cap text-xs text-indigo-500"></i>
          <span>Student Portal</span>
          <i class="fa-solid fa-arrow-right text-[10px] text-zinc-400"></i>
        </a>

        <a href="post-internship.html" class="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition">
          <i class="fa-solid fa-plus text-xs"></i>
          <span>Post Internship</span>
        </a>

        <!-- Theme Switcher -->
        <button class="theme-toggle-btn p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition" title="Toggle Theme">
          <i class="fa-regular fa-moon dark:hidden text-sm"></i>
          <i class="fa-regular fa-sun hidden dark:block text-sm text-amber-400"></i>
        </button>

        <!-- Notification Dropdown -->
        <div class="relative">
          <button id="notif-dropdown-btn" class="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition relative">
            <i class="fa-regular fa-bell text-sm"></i>
            <span class="notif-badge-count hidden absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-zinc-950"></span>
          </button>
        </div>

        <!-- Corporate Pill Profile -->
        <a href="profile.html" class="flex items-center gap-3 bg-zinc-100/80 dark:bg-zinc-900/60 p-1.5 pl-3.5 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-indigo-400 dark:hover:border-indigo-500 transition">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-bold text-zinc-900 dark:text-white leading-tight">${company.hrName.split(' ')[0]}</p>
            <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Recruiter</p>
          </div>
          <img src="${company.logo}" alt="${company.name}" class="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" />
        </a>
      </div>
    `;
  }

  // Inject Admin Navigation
  const adminSidebarRoot = document.getElementById('admin-sidebar-root');
  const adminTopbarRoot = document.getElementById('admin-topbar-root');

  if (adminSidebarRoot) {
    adminSidebarRoot.className = "w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between shrink-0 z-30 transition-transform duration-300 -translate-x-full lg:translate-x-0 fixed lg:static inset-y-0 left-0 shadow-2xl lg:shadow-none";
    adminSidebarRoot.id = "app-sidebar";

    adminSidebarRoot.innerHTML = `
      <div class="p-6 flex flex-col h-full overflow-y-auto">
        <!-- Brand Header -->
        <div class="flex items-center justify-between pb-6 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <a href="dashboard.html" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20 border border-white/20">
              <i class="fa-solid fa-shield-halved text-base text-zinc-950 font-bold"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold font-heading text-base tracking-tighter text-zinc-900 dark:text-white">INTERN<span class="text-amber-500">ADMIN</span></span>
              </div>
              <span class="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">University Placement Cell</span>
            </div>
          </a>
          <button id="close-sidebar-btn" class="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Bento Navigation Links -->
        <div class="space-y-1.5 flex-1">
          <!-- Direct Home Page Button -->
          <a href="../../index.html" class="flex items-center gap-3.5 px-4 py-2.5 mb-3 rounded-2xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition">
            <i class="fa-solid fa-house text-sm w-4"></i>
            <span>Return to Home</span>
            <i class="fa-solid fa-arrow-left text-[10px] ml-auto"></i>
          </a>

          <p class="bento-label px-3 mb-2 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Placement Authority</p>
          
          <a href="dashboard.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-gauge-high text-sm w-4 text-amber-500"></i>
            <span>Command Center</span>
          </a>

          <a href="companies.html" class="sidebar-link flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <div class="flex items-center gap-3.5">
              <i class="fa-solid fa-building text-sm w-4 text-cyan-500"></i>
              <span>Corporate Partners</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Verify</span>
          </a>

          <a href="students.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-user-graduate text-sm w-4 text-indigo-500"></i>
            <span>Student Directory</span>
          </a>

          <a href="internships.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-briefcase text-sm w-4 text-purple-500"></i>
            <span>Job Moderation</span>
          </a>

          <a href="applications.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-clipboard-check text-sm w-4 text-emerald-500"></i>
            <span>Placement Tracker</span>
          </a>

          <a href="settings.html" class="sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            <i class="fa-solid fa-gear text-sm w-4 text-zinc-400"></i>
            <span>System Settings</span>
          </a>
        </div>

        <!-- Switch to Student / Company Portals -->
        <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Role Switcher</p>
          <div class="grid grid-cols-2 gap-2">
            <a href="../student/dashboard.html" class="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 flex items-center justify-center gap-1.5 transition">
              <i class="fa-solid fa-graduation-cap text-indigo-500 text-xs"></i>
              <span>Student</span>
            </a>
            <a href="../company/dashboard.html" class="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-cyan-500 flex items-center justify-center gap-1.5 transition">
              <i class="fa-solid fa-building text-cyan-500 text-xs"></i>
              <span>Company</span>
            </a>
          </div>

          <!-- Admin Profile Card -->
          <div class="pt-2 flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                <i class="fa-solid fa-user-shield"></i>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-zinc-900 dark:text-white truncate">Placement Director</p>
                <p class="text-[10px] text-zinc-400 truncate">Super Administrator</p>
              </div>
            </div>
            <a href="login.html" class="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition" title="Log Out">
              <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  if (adminTopbarRoot) {
    adminTopbarRoot.className = "h-16 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-20 shrink-0";
    adminTopbarRoot.innerHTML = `
      <div class="flex items-center gap-4">
        <button id="sidebar-toggle-btn" class="lg:hidden p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
          <i class="fa-solid fa-bars text-lg"></i>
        </button>

        <!-- Placement Cell Title / Status -->
        <div class="hidden sm:flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">Central Placement Cell Live System</span>
          <span class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">Admin Console</span>
        </div>
      </div>

      <!-- Right Bento Controls -->
      <div class="flex items-center gap-2.5">
        <!-- Return to Home Page Link -->
        <a href="../../index.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition" title="Go to Main Home Page">
          <i class="fa-solid fa-house text-xs text-amber-500"></i>
          <span class="hidden sm:inline">Home</span>
        </a>

        <!-- Portal Quick Links -->
        <a href="../student/dashboard.html" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold transition">
          <i class="fa-solid fa-graduation-cap"></i> Student
        </a>
        <a href="../company/dashboard.html" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold transition">
          <i class="fa-solid fa-building"></i> Company
        </a>

        <!-- Broadcast Button -->
        <button onclick="openBroadcastModal()" class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition">
          <i class="fa-solid fa-bullhorn text-xs"></i>
          <span>Broadcast Notice</span>
        </button>

        <!-- Theme Switcher -->
        <button class="theme-toggle-btn p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition" title="Toggle Theme">
          <i class="fa-regular fa-moon dark:hidden text-sm"></i>
          <i class="fa-regular fa-sun hidden dark:block text-sm text-amber-400"></i>
        </button>

        <!-- Admin Profile Pill -->
        <div class="flex items-center gap-2.5 bg-zinc-100/80 dark:bg-zinc-900/60 p-1.5 pl-3 border border-zinc-200 dark:border-zinc-800 rounded-full">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-bold text-zinc-900 dark:text-white leading-tight">Admin Director</p>
            <p class="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Placement Head</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-zinc-950 font-bold text-xs shadow-sm">
            <i class="fa-solid fa-user-shield"></i>
          </div>
        </div>
      </div>
    `;
  }
}

// Mobile Sidebar & Navigation Toggle
function setupMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-btn') || document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('app-sidebar') || document.getElementById('mobile-menu');
  const overlay = document.getElementById('sidebar-overlay') || document.getElementById('mobile-menu-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('-translate-x-full');
      sidebar.classList.toggle('hidden');
      if (overlay) {
        overlay.classList.toggle('hidden');
      }
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.add('hidden');
        overlay.classList.add('hidden');
      });
    }

    const closeBtn = document.getElementById('close-sidebar-btn') || document.getElementById('close-mobile-menu');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
      });
    }
  }
}

// User Profile & Notification Dropdown Menus
function setupUserDropdowns() {
  const profileDropdownBtn = document.getElementById('profile-dropdown-btn');
  const profileDropdownMenu = document.getElementById('profile-dropdown-menu');

  if (profileDropdownBtn && profileDropdownMenu) {
    profileDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdownMenu.contains(e.target) && !profileDropdownBtn.contains(e.target)) {
        profileDropdownMenu.classList.add('hidden');
      }
    });
  }

  // Notification Quick Dropdown
  const notifBtn = document.getElementById('notif-dropdown-btn');
  const notifMenu = document.getElementById('notif-dropdown-menu');
  if (notifBtn && notifMenu) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!notifMenu.contains(e.target) && !notifBtn.contains(e.target)) {
        notifMenu.classList.add('hidden');
      }
    });
  }
}

// Global Search UI and Shortcuts (Ctrl+K or Cmd+K)
function setupGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim().length > 0) {
        const query = encodeURIComponent(searchInput.value.trim());
        const isCompanyPortal = window.location.pathname.includes('/company/');
        if (isCompanyPortal) {
          window.location.href = `applicants.html?search=${query}`;
        } else if (window.location.pathname.includes('/student/')) {
          window.location.href = `internships.html?search=${query}`;
        } else {
          window.location.href = `pages/student/internships.html?search=${query}`;
        }
      }
    });
  }

  // Keyboard shortcut listener
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        showToast('Type keywords and press Enter to search', 'info', 2000);
      }
    }
  });
}

// Highlight active sidebar/nav item based on current URL
function setupNavActiveState() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath.endsWith(href) || (href !== '/' && href !== 'index.html' && currentPath.includes(href.replace('.html', ''))))) {
      link.classList.add('bg-indigo-600', 'text-white', 'dark:bg-indigo-600', 'dark:text-white', 'shadow-md', 'shadow-indigo-600/20');
      link.classList.remove('text-zinc-600', 'dark:text-zinc-400', 'text-slate-600', 'dark:text-slate-300');
    }
  });
}

// Update Notification Badges
function updateNotificationBadges() {
  const isCompany = window.location.pathname.includes('/company/');
  const target = isCompany ? 'company' : 'student';
  const notifications = DB.getNotifications(target);
  const unreadCount = notifications.filter(n => !n.read).length;

  const badgeElements = document.querySelectorAll('.notif-badge-count');
  badgeElements.forEach(el => {
    if (unreadCount > 0) {
      el.textContent = unreadCount > 9 ? '9+' : unreadCount;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

// Bind Theme Toggle Buttons across pages
function setupThemeToggleButtons() {
  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTheme();
    });
  });
}

// Modal open/close utilities
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

// Global Logout Handler
function handleLogout(redirectPath = '../../index.html') {
  if (confirm('Are you sure you want to sign out of your account?')) {
    DB.logout();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 500);
  }
}

