/**
 * INTERNSHIP MANAGEMENT PORTAL - INTERVIEWS MODULE
 * Student interview calendar, join room modal, company interview scheduler
 */

document.addEventListener('DOMContentLoaded', () => {
  // Student Interviews Page
  if (document.getElementById('student-interviews-container')) {
    initStudentInterviews();
  }

  // Company Interviews Page
  if (document.getElementById('company-interviews-container')) {
    initCompanyInterviews();
  }
});

/**
 * Initialize Student Interviews
 */
let currentStudentInterviewTab = 'Upcoming';

async function initStudentInterviews() {
  const container = document.getElementById('student-interviews-container');
  if (!container) return;

  const tabs = document.querySelectorAll('.student-interview-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => {
        t.classList.remove('bg-indigo-600', 'text-white');
        t.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      tab.classList.add('bg-indigo-600', 'text-white');
      tab.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      currentStudentInterviewTab = tab.dataset.status;
      await renderStudentInterviews();
    });
  });

  await renderStudentInterviews();
}

async function renderStudentInterviews() {
  const container = document.getElementById('student-interviews-container');
  if (!container) return;

  const student = DB.getStudentProfile();
  const allInterviews = await DB.fetchInterviews();
  const filtered = allInterviews.filter(i => {
    const forStudent = !i.studentId || i.studentId === student.id || i.studentName === student.name;
    const matchesTab = currentStudentInterviewTab === 'All' || (i.status && i.status.toLowerCase() === currentStudentInterviewTab.toLowerCase());
    return forStudent && matchesTab;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fa-solid fa-video"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No ${currentStudentInterviewTab} Interviews</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-4">When companies shortlist your profile, scheduled technical & HR interviews will appear here.</p>
        <a href="internships.html" class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition">
          Find More Internships
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover-card-lift shadow-sm mb-4">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div class="flex items-start gap-4">
          <img src="${item.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}" alt="${item.company}" class="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white">${item.position}</h3>
              <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${item.status === 'Upcoming' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400'}">
                ${item.status}
              </span>
            </div>
            
            <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
              <i class="fa-regular fa-building text-indigo-500 text-xs"></i> ${item.company}
              <span class="text-slate-300 dark:text-slate-600">•</span>
              <span class="text-xs text-slate-500">${item.type}</span>
            </p>

            <div class="flex flex-wrap items-center gap-4 mt-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="flex items-center gap-1.5"><i class="fa-regular fa-calendar text-indigo-500"></i> ${item.date}</span>
              <span class="flex items-center gap-1.5"><i class="fa-regular fa-clock text-purple-500"></i> ${item.time}</span>
              <span class="flex items-center gap-1.5"><i class="fa-solid fa-user-tie text-emerald-500"></i> ${item.interviewer}</span>
            </div>

            ${item.notes ? `
              <div class="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span class="font-bold text-slate-800 dark:text-white">Note:</span> ${item.notes}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Join / Actions -->
        <div class="flex items-center gap-3 w-full lg:w-auto justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
          ${item.status === 'Upcoming' ? `
            <a href="${item.meetingLink}" target="_blank" class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-2">
              <i class="fa-solid fa-video"></i> Join Live Interview
            </a>
          ` : `
            <span class="text-xs font-semibold text-slate-400">Interview Completed</span>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Initialize Company Interviews Page
 */
let currentCompanyInterviewTab = 'Upcoming';

async function initCompanyInterviews() {
  const container = document.getElementById('company-interviews-container');
  if (!container) return;

  const company = DB.getCompanyProfile();
  const applicants = await DB.fetchCompanyApplicants(company.name);

  // Auto-populate applicant selector if query param applicantId is given
  const paramApplicantId = getQueryParam('applicantId');
  const applicantSelect = document.getElementById('sched-applicant');

  if (applicantSelect) {
    if (applicants.length === 0) {
      applicantSelect.innerHTML = `<option value="">No applicants found yet</option>`;
    } else {
      applicantSelect.innerHTML = applicants.map(a => `
        <option value="${a.id}" ${a.id === paramApplicantId ? 'selected' : ''}>
          ${a.studentName} (${a.jobTitle} - CGPA ${a.studentCgpa || '3.8'})
        </option>
      `).join('');
    }
  }

  // Populate job selector
  const jobSelect = document.getElementById('sched-job');
  if (jobSelect) {
    const jobs = [...new Set(applicants.map(a => a.jobTitle))];
    if (jobs.length === 0) {
      jobSelect.innerHTML = `<option value="Internship Position">General Interview</option>`;
    } else {
      jobSelect.innerHTML = jobs.map(j => `<option value="${j}">${j}</option>`).join('');
    }
  }

  // Tab Filtering
  const tabs = document.querySelectorAll('.comp-interview-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => {
        t.classList.remove('bg-indigo-600', 'text-white');
        t.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      tab.classList.add('bg-indigo-600', 'text-white');
      tab.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      currentCompanyInterviewTab = tab.dataset.status;
      await renderCompanyInterviews();
    });
  });

  // Schedule Interview Form Handler
  const schedForm = document.getElementById('schedule-interview-form');
  if (schedForm) {
    schedForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const applicantId = document.getElementById('sched-applicant').value;
      const applicant = applicants.find(a => a.id === applicantId);
      const companyProf = DB.getCompanyProfile();

      const newInterview = {
        id: `intv-${Date.now()}`,
        applicationId: applicantId,
        studentId: applicant?.studentId || "std-2022001",
        studentName: applicant?.studentName || "Student Candidate",
        company: companyProf.name,
        companyLogo: companyProf.logo,
        position: document.getElementById('sched-job').value,
        date: document.getElementById('sched-date').value,
        time: document.getElementById('sched-time').value,
        type: document.getElementById('sched-type').value,
        meetingLink: document.getElementById('sched-link').value || "https://meet.google.com/new",
        status: "Upcoming",
        interviewer: document.getElementById('sched-interviewer').value || `${companyProf.hrName || 'HR Team'} (Recruitment Lead)`,
        notes: document.getElementById('sched-notes').value
      };

      await DB.createInterview(newInterview);

      // Update applicant status to "Interview"
      if (applicantId) {
        await DB.updateApplicationStatus(applicantId, 'Interview');
      }

      showToast('Interview scheduled successfully! Notification sent to student.', 'success');
      closeModal('schedule-interview-modal');
      schedForm.reset();
      await renderCompanyInterviews();
    });
  }

  await renderCompanyInterviews();
}

async function renderCompanyInterviews() {
  const container = document.getElementById('company-interviews-container');
  if (!container) return;

  const company = DB.getCompanyProfile();
  const interviews = await DB.fetchInterviews();
  const filtered = interviews.filter(i => {
    const isCompany = !i.company || i.company.toLowerCase() === company.name.toLowerCase();
    const isTab = currentCompanyInterviewTab === 'All' || (i.status && i.status.toLowerCase() === currentCompanyInterviewTab.toLowerCase());
    return isCompany && isTab;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No ${currentCompanyInterviewTab} Interviews</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-4">Schedule technical or behavioral video evaluations with shortlisted candidates.</p>
        <button onclick="openModal('schedule-interview-modal')" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition">
          + Schedule New Interview
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover-card-lift shadow-sm mb-4">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">${item.position}</h3>
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${item.status === 'Upcoming' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
              ${item.status}
            </span>
          </div>

          <p class="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Candidate: <span class="font-bold text-indigo-600 dark:text-indigo-400">${item.studentName}</span>
          </p>

          <div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span><i class="fa-regular fa-calendar text-indigo-500 mr-1"></i> ${item.date}</span>
            <span><i class="fa-regular fa-clock text-purple-500 mr-1"></i> ${item.time}</span>
            <span><i class="fa-solid fa-video text-rose-500 mr-1"></i> ${item.type}</span>
            <span><i class="fa-solid fa-user-tie text-emerald-500 mr-1"></i> ${item.interviewer}</span>
          </div>

          ${item.notes ? `
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
              <span class="font-bold">Notes:</span> ${item.notes}
            </p>
          ` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
          <a href="${item.meetingLink}" target="_blank" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5">
            <i class="fa-solid fa-video"></i> Start Meeting
          </a>
          ${item.status === 'Upcoming' ? `
            <button onclick="handleCompleteInterview('${item.id}')" class="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition">
              Mark Completed
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function handleCompleteInterview(id) {
  const interviews = DB.getInterviews();
  const item = interviews.find(i => i.id === id);
  if (item) {
    item.status = 'Completed';
    DB.saveInterviews(interviews);
    showToast('Interview marked as Completed', 'success');
    renderCompanyInterviews();
  }
}
