/**
 * INTERNSHIP MANAGEMENT PORTAL - APPLICATIONS & APPLICANTS MODULE
 * Apply modal, application status tracking, timeline, company candidate screening
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if Apply Modal is in DOM, if not inject it dynamically
  setupApplyModal();

  // Student Applications List page
  if (document.getElementById('student-applications-container')) {
    initStudentApplications();
  }

  // Student Application Details page
  if (document.getElementById('application-detail-container')) {
    initApplicationDetails();
  }

  // Company Applicants Management page
  if (document.getElementById('company-applicants-container')) {
    initCompanyApplicants();
  }

  // Company Single Applicant Details page
  if (document.getElementById('company-applicant-detail-container')) {
    initCompanyApplicantDetails();
  }
});

/**
 * Setup and Inject Reusable Apply Modal
 */
function setupApplyModal() {
  if (document.getElementById('apply-internship-modal')) return;

  const modalHtml = `
    <div id="apply-internship-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 modal-backdrop">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
        <button onclick="closeModal('apply-internship-modal')" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="flex items-center gap-3.5 mb-6">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
            <i class="fa-regular fa-paper-plane"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white" id="modal-job-title">Apply for Internship</h3>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400" id="modal-company-name">Company Name</p>
          </div>
        </div>

        <form id="apply-form" onsubmit="submitInternshipApplication(event)">
          <input type="hidden" id="apply-internship-id" />

          <!-- Resume Attachment -->
          <div class="mb-5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Primary Resume / CV <span class="text-rose-500">*</span>
            </label>
            <div class="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i class="fa-solid fa-file-pdf text-rose-500 text-2xl"></i>
                <div>
                  <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200" id="apply-resume-name">Mehedi_Hasan_CSE_Resume_2026.pdf</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400">PDF • 1.4 MB (Default Profile Resume)</p>
                </div>
              </div>
              <a href="${window.location.pathname.includes('/student/') ? 'resume.html' : 'pages/student/resume.html'}" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Change</a>
            </div>
          </div>

          <!-- Availability -->
          <div class="mb-5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Earliest Availability / Start Date <span class="text-rose-500">*</span>
            </label>
            <select id="apply-availability" required class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="Immediate (Within 1 week)">Immediate (Within 1 week)</option>
              <option value="Within 2-3 weeks">Within 2-3 weeks</option>
              <option value="Next Month (After Semester Final Exams)">Next Month (After Semester Final Exams)</option>
              <option value="Part-time immediately, Full-time later">Part-time immediately, Full-time later</option>
            </select>
          </div>

          <!-- Portfolio / GitHub link -->
          <div class="mb-5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Portfolio / GitHub / Live Project URL
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <i class="fa-solid fa-link text-xs"></i>
              </span>
              <input type="url" id="apply-portfolio" value="https://Name.dev" placeholder="https://yourportfolio.dev" class="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <!-- Cover Letter -->
          <div class="mb-6">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Cover Letter / Statement of Interest <span class="text-rose-500">*</span>
            </label>
            <textarea id="apply-cover-letter" rows="4" required placeholder="Describe why you are interested in this position and how your skills align with the company's tech stack..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">Dear Hiring Manager, I am a 7th-semester CSE student with hands-on experience building modern, responsive applications. I am excited to apply for this role to learn from senior engineers and contribute to production features.</textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onclick="closeModal('apply-internship-modal')" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
            <button type="submit" id="submit-apply-btn" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-2">
              <i class="fa-regular fa-paper-plane"></i>
              <span>Submit Application</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);
}

function openApplyModal(internshipId) {
  setupApplyModal();
  const internship = DB.getInternshipById(internshipId);
  if (!internship) return;

  // Check if already applied
  const existingApps = DB.getApplications();
  const alreadyApplied = existingApps.some(a => a.internshipId === internshipId);
  if (alreadyApplied) {
    showToast('You have already applied for this internship!', 'warning');
    return;
  }

  document.getElementById('apply-internship-id').value = internship.id;
  document.getElementById('modal-job-title').textContent = internship.title;
  document.getElementById('modal-company-name').textContent = `${internship.company} • ${internship.location}`;
  
  openModal('apply-internship-modal');
}

async function submitInternshipApplication(e) {
  e.preventDefault();
  const internshipId = document.getElementById('apply-internship-id').value;
  const internship = DB.getInternshipById(internshipId);
  const student = DB.getStudentProfile();

  if (!internship) return;

  const availability = document.getElementById('apply-availability').value;
  const portfolioUrl = document.getElementById('apply-portfolio').value;
  const coverLetter = document.getElementById('apply-cover-letter').value;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Submitting...';
  }

  try {
    await DB.applyForInternship(internship.id, {
      coverLetter,
      availability,
      portfolioUrl,
      resumeName: student.resume?.fileName || "Student_Resume.pdf",
      resumeUrl: student.resume?.url || ""
    });

    closeModal('apply-internship-modal');
    showToast(`Application successfully submitted to ${internship.company}! 🎉`, 'success', 4000);

    // Refresh if on student applications page
    if (document.getElementById('student-applications-container')) {
      await initStudentApplications();
    }
  } catch (err) {
    showToast(err.message || 'Submission failed. Please try again.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Application';
    }
  }
}

/**
 * Initialize Student Applications Listing Page
 */
let currentAppFilter = 'All';

async function initStudentApplications() {
  const container = document.getElementById('student-applications-container');
  if (!container) return;

  const student = DB.getStudentProfile();
  // Fetch dynamic real applications from server
  await DB.fetchApplications({ studentId: student.id });

  // Setup filter tabs
  const tabButtons = document.querySelectorAll('.app-filter-tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
        b.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
      btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      currentAppFilter = btn.dataset.status;
      renderStudentApplicationsList();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-app-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderStudentApplicationsList();
    });
  }

  renderStudentApplicationsList();
}

function renderStudentApplicationsList() {
  const container = document.getElementById('student-applications-container');
  if (!container) return;

  const applications = DB.getApplications();
  const search = (document.getElementById('search-app-input')?.value || '').toLowerCase().trim();

  const filtered = applications.filter(app => {
    const matchesFilter = currentAppFilter === 'All' || app.status.toLowerCase() === currentAppFilter.toLowerCase();
    const matchesSearch = !search || 
      app.jobTitle.toLowerCase().includes(search) || 
      app.company.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  const countBadge = document.getElementById('apps-count-badge');
  if (countBadge) countBadge.textContent = `${filtered.length} Applications`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fa-regular fa-folder-open"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Applications Found</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">No applications match the selected status '${currentAppFilter}'. Search for new internships and apply with a single click.</p>
        <a href="internships.html" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition">
          <i class="fa-solid fa-magnifying-glass"></i> Explore Internships
        </a>
      </div>
    `;
    return;
  }

  const statusBadges = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    Reviewed: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800',
    Shortlisted: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    Interview: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800',
    Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
  };

  container.innerHTML = filtered.map(app => `
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover-card-lift shadow-sm mb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <img src="${app.companyLogo}" alt="${app.company}" class="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-700" />
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white">
                <a href="application-details.html?id=${app.id}" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition">${app.jobTitle}</a>
              </h3>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusBadges[app.status] || statusBadges.Applied}">
                ${app.status}
              </span>
            </div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <i class="fa-regular fa-building text-indigo-500 text-xs"></i> ${app.company}
              <span class="text-slate-300 dark:text-slate-600">•</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">Applied on: ${app.appliedDate}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <a href="application-details.html?id=${app.id}" class="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 transition flex items-center gap-1.5">
            <i class="fa-regular fa-eye"></i> Track Application
          </a>
          <button onclick="handleWithdrawApplication('${app.id}')" class="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition" title="Withdraw Application">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function handleWithdrawApplication(appId) {
  if (confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
    let apps = DB.getApplications();
    apps = apps.filter(a => a.id !== appId);
    DB.saveApplications(apps);

    // Also remove from company applicants if present
    let compApps = DB.getCompanyApplicants();
    compApps = compApps.filter(a => a.id !== appId);
    DB.saveCompanyApplicants(compApps);

    showToast('Application withdrawn successfully', 'info');
    initStudentApplications();
  }
}

/**
 * Initialize Student Application Details Page
 */
function initApplicationDetails() {
  const container = document.getElementById('application-detail-container');
  if (!container) return;

  const id = getQueryParam('id') || 'app-301';
  const app = DB.getApplications().find(a => a.id === id) || DB.getApplications()[0];

  const statusColors = {
    Applied: 'bg-blue-600',
    Reviewed: 'bg-purple-600',
    Shortlisted: 'bg-amber-600',
    Interview: 'bg-indigo-600',
    Selected: 'bg-emerald-600',
    Rejected: 'bg-rose-600'
  };

  container.innerHTML = `
    <!-- Top Status Card -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-4">
          <img src="${app.companyLogo}" alt="${app.company}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">${app.jobTitle}</h1>
            <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
              <i class="fa-regular fa-building text-indigo-500"></i> ${app.company}
              <span class="text-slate-300 dark:text-slate-600">•</span>
              <span class="text-xs text-slate-500">Application ID: ${app.id}</span>
            </p>
          </div>
        </div>

        <div class="text-right">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block">Current Status</span>
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 text-sm font-bold rounded-full text-white ${statusColors[app.status] || 'bg-indigo-600'} mt-1">
            <i class="fa-solid fa-circle text-[8px] animate-pulse"></i> ${app.status}
          </span>
        </div>
      </div>

      <!-- Application Timeline -->
      <div class="mt-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <i class="fa-solid fa-bars-progress text-indigo-500"></i> Application Progress Timeline
        </h2>

        <div class="relative pl-6 space-y-8">
          ${(app.timeline || []).map((t, index) => `
            <div class="timeline-item relative pl-4">
              <div class="absolute -left-[27px] top-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow-md shadow-indigo-600/30">
                <i class="fa-solid fa-check"></i>
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h4 class="font-bold text-base text-slate-900 dark:text-white">${t.step}</h4>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${t.date}</span>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${t.note}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- 2 Column Submitted Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <!-- Cover Letter -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">Submitted Statement / Cover Letter</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed text-sm bg-slate-50 dark:bg-slate-700/40 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
            ${app.coverLetter}
          </p>
        </div>

        <!-- Submitted Resume -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Attached Resume Document</h3>
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between">
            <div class="flex items-center gap-3.5">
              <i class="fa-solid fa-file-pdf text-rose-500 text-3xl"></i>
              <div>
                <h4 class="font-bold text-sm text-slate-800 dark:text-white">${app.resumeName}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">PDF • Verified Document</p>
              </div>
            </div>
            <a href="resume.html" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5">
              <i class="fa-regular fa-eye"></i> View Resume
            </a>
          </div>
        </div>
      </div>

      <!-- Right Column: Submission Info -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">Submission Details</h3>
          
          <div class="space-y-3.5 text-sm">
            <div>
              <span class="text-xs text-slate-400 block font-medium">Applied Date</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">${app.appliedDate}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 block font-medium">Earliest Availability</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">${app.availability || 'Immediate'}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 block font-medium">Portfolio / GitHub</span>
              <a href="${app.portfolioUrl || '#'}" target="_blank" class="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline break-all">${app.portfolioUrl || 'None provided'}</a>
            </div>
          </div>

          <div class="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
            <a href="internship-details.html?id=${app.internshipId}" class="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i> View Original Job Post
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize Company Applicants Management Page
 */
let currentApplicantStatusFilter = 'All';

async function initCompanyApplicants() {
  const container = document.getElementById('company-applicants-container');
  if (!container) return;

  const comp = DB.getCompanyProfile();
  const urlParams = new URLSearchParams(window.location.search);
  const internshipId = urlParams.get('internshipId');

  // Fetch real applications directly from database
  await DB.fetchApplications({
    companyId: comp.id,
    company: comp.name,
    internshipId: internshipId || undefined
  });

  const applicants = DB.getCompanyApplicants();

  // Populate dynamic internships dropdown filter
  const internshipFilterSelect = document.getElementById('filter-applicant-job');
  if (internshipFilterSelect) {
    const jobTitles = [...new Set(applicants.map(a => a.jobTitle))];
    jobTitles.forEach(title => {
      const opt = document.createElement('option');
      opt.value = title;
      opt.textContent = title;
      internshipFilterSelect.appendChild(opt);
    });

    internshipFilterSelect.addEventListener('change', () => renderCompanyApplicantsList());
  }

  // Event Listeners for Filters
  const searchInput = document.getElementById('search-applicant-input');
  const cgpaFilter = document.getElementById('filter-applicant-cgpa');
  const sortSelect = document.getElementById('sort-applicants');

  if (searchInput) searchInput.addEventListener('input', debounce(renderCompanyApplicantsList, 300));
  if (cgpaFilter) cgpaFilter.addEventListener('change', renderCompanyApplicantsList);
  if (sortSelect) sortSelect.addEventListener('change', renderCompanyApplicantsList);

  // Status Filter Tabs
  const tabs = document.querySelectorAll('.applicant-status-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-indigo-600', 'text-white');
        t.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      tab.classList.add('bg-indigo-600', 'text-white');
      tab.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      currentApplicantStatusFilter = tab.dataset.status;
      renderCompanyApplicantsList();
    });
  });

  renderCompanyApplicantsList();
}

function renderCompanyApplicantsList() {
  const container = document.getElementById('company-applicants-container');
  if (!container) return;

  const applicants = DB.getCompanyApplicants();
  const search = (document.getElementById('search-applicant-input')?.value || '').toLowerCase().trim();
  const jobFilter = document.getElementById('filter-applicant-job')?.value || '';
  const cgpaMin = parseFloat(document.getElementById('filter-applicant-cgpa')?.value || '0');
  const sort = document.getElementById('sort-applicants')?.value || 'latest';

  let filtered = applicants.filter(app => {
    const matchesStatus = currentApplicantStatusFilter === 'All' || app.status.toLowerCase() === currentApplicantStatusFilter.toLowerCase();
    const matchesJob = !jobFilter || app.jobTitle === jobFilter;
    const matchesCgpa = !cgpaMin || (parseFloat(app.studentCgpa || '0') >= cgpaMin);
    const matchesSearch = !search ||
      app.studentName.toLowerCase().includes(search) ||
      (app.studentId && app.studentId.toLowerCase().includes(search)) ||
      (app.studentDepartment && app.studentDepartment.toLowerCase().includes(search)) ||
      (app.studentSkills && app.studentSkills.some(s => s.toLowerCase().includes(search)));

    return matchesStatus && matchesJob && matchesCgpa && matchesSearch;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sort === 'cgpa-high') return parseFloat(b.studentCgpa || '0') - parseFloat(a.studentCgpa || '0');
    if (sort === 'oldest') return new Date(a.appliedDate) - new Date(b.appliedDate);
    return new Date(b.appliedDate) - new Date(a.appliedDate);
  });

  const countBadge = document.getElementById('applicants-total-count');
  if (countBadge) countBadge.textContent = `${filtered.length} Candidate${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fa-solid fa-users"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Candidates Found</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-4">Try clearing filters or search criteria.</p>
      </div>
    `;
    return;
  }

  const statusBadges = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    Shortlisted: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400',
    Interview: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400',
    Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400'
  };

  container.innerHTML = filtered.map(app => `
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover-card-lift shadow-sm mb-4">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <!-- Candidate Left Details -->
        <div class="flex items-start gap-4">
          <img src="${app.studentPhoto}" alt="${app.studentName}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white hover:text-indigo-600 transition">
                <a href="applicant-details.html?id=${app.id}">${app.studentName}</a>
              </h3>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusBadges[app.status] || statusBadges.Applied}">
                ${app.status}
              </span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ${app.studentUniversity} • <span class="font-bold text-slate-700 dark:text-slate-300">CGPA: ${app.studentCgpa}</span>
            </p>

            <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              Applied for: <span class="font-bold">${app.jobTitle}</span> <span class="text-slate-400">• ${app.appliedDate}</span>
            </p>

            <!-- Skills chips -->
            <div class="flex flex-wrap gap-1.5 mt-2.5">
              ${(app.studentSkills || []).slice(0, 5).map(s => `
                <span class="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md font-medium">${s}</span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Candidate Right Actions -->
        <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
          <a href="applicant-details.html?id=${app.id}" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition">
            View Profile
          </a>

          ${app.status !== 'Shortlisted' && app.status !== 'Selected' ? `
            <button onclick="updateApplicantStatus('${app.id}', 'Shortlisted')" class="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition">
              Shortlist
            </button>
          ` : ''}

          ${app.status !== 'Interview' && app.status !== 'Selected' ? `
            <a href="interviews.html?applicantId=${app.id}" class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition">
              Schedule Interview
            </a>
          ` : ''}

          ${app.status !== 'Selected' ? `
            <button onclick="updateApplicantStatus('${app.id}', 'Selected')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition">
              Accept
            </button>
          ` : ''}

          ${app.status !== 'Rejected' ? `
            <button onclick="updateApplicantStatus('${app.id}', 'Rejected')" class="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition">
              Reject
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

async function updateApplicantStatus(appId, newStatus) {
  try {
    await DB.updateApplicationStatus(appId, newStatus);
    showToast(`Applicant status updated to '${newStatus}'!`, 'success');

    if (document.getElementById('company-applicants-container')) {
      renderCompanyApplicantsList();
    }
    if (document.getElementById('company-applicant-detail-container')) {
      initCompanyApplicantDetails();
    }
  } catch (err) {
    showToast(err.message || 'Status update failed.', 'error');
  }
}

/**
 * Initialize Company Single Applicant Details Page
 */
async function initCompanyApplicantDetails() {
  const container = document.getElementById('company-applicant-detail-container');
  if (!container) return;

  const id = getQueryParam('id');
  const comp = DB.getCompanyProfile();
  await DB.fetchApplications({ companyId: comp.id, company: comp.name });

  const app = DB.getCompanyApplicants().find(a => a.id === id) || DB.getCompanyApplicants()[0];
  if (!app) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <i class="fa-regular fa-folder-open text-4xl text-slate-400 mb-3"></i>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Applicant Record Not Found</h3>
        <p class="text-slate-500 text-sm">No applications have been submitted for this query yet.</p>
        <a href="applicants.html" class="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">Back to Applicants</a>
      </div>
    `;
    return;
  }

  const resumeHref = app.resumeUrl || '../student/resume.html';

  container.innerHTML = `
    <!-- Top Applicant Card -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-5">
          <img src="${app.studentPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" alt="${app.studentName}" class="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md" />
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">${app.studentName}</h1>
              <span class="px-3 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400">
                ${app.status}
              </span>
            </div>
            <p class="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
              ${app.studentDepartment || 'CSE'} • ${app.studentUniversity || 'University'}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              CGPA: <span class="font-bold text-emerald-600 dark:text-emerald-400">${app.studentCgpa || '3.75'}</span> | Applied for: <span class="font-bold text-slate-800 dark:text-white">${app.jobTitle}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <button onclick="updateApplicantStatus('${app.id}', 'Shortlisted')" class="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 font-semibold text-xs transition">
            Shortlist
          </button>
          <a href="interviews.html?applicantId=${app.id}" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition">
            Schedule Interview
          </a>
          <button onclick="updateApplicantStatus('${app.id}', 'Selected')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition">
            Accept Offer
          </button>
          <button onclick="updateApplicantStatus('${app.id}', 'Rejected')" class="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 font-semibold text-xs transition">
            Reject
          </button>
        </div>
      </div>

      <!-- Quick Candidate Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-400 block font-medium">Email</span>
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 break-all">${app.studentEmail}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-400 block font-medium">Phone</span>
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">${app.studentPhone || 'N/A'}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-400 block font-medium">Availability</span>
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">${app.availability || 'Immediate'}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-400 block font-medium">Portfolio</span>
          <a href="${app.portfolioUrl || '#'}" target="_blank" class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Visit Portfolio &rarr;</a>
        </div>
      </div>
    </div>

    <!-- 2 Column Details: Skills, Cover Letter, Resume -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <!-- Cover Letter -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">Applicant Statement / Cover Letter</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed text-sm bg-slate-50 dark:bg-slate-700/40 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
            ${app.coverLetter || 'No cover letter provided.'}
          </p>
        </div>

        <!-- Skills list -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Technical Skills & Competencies</h3>
          <div class="flex flex-wrap gap-2">
            ${(app.studentSkills || ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL']).map(s => `
              <span class="px-3.5 py-1.5 text-sm font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ${s}
              </span>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right Column: Resume Card -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">Attached Candidate Resume</h3>
          
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 mb-4 text-center">
            <i class="fa-solid fa-file-pdf text-rose-500 text-4xl mb-2"></i>
            <h4 class="font-bold text-sm text-slate-800 dark:text-white">${app.resumeName || 'Candidate_Resume.pdf'}</h4>
            <p class="text-xs text-slate-400 mt-0.5">PDF • Official Attachment</p>
          </div>

          <a href="${resumeHref}" target="_blank" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 mb-2">
            <i class="fa-regular fa-eye"></i> View Full Document
          </a>

          <a href="${resumeHref}" download="${app.resumeName || 'Candidate_Resume.pdf'}" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-download"></i> Download PDF
          </a>
        </div>
      </div>
    </div>
  `;
}
