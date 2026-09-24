/**
 * INTERNSHIP MANAGEMENT PORTAL - STUDENT MODULE
 * Student Dashboard, Profile, Edit Profile, Resume Manager, Settings
 */

document.addEventListener('DOMContentLoaded', () => {
  // Student Dashboard
  if (document.getElementById('student-dashboard-container')) {
    initStudentDashboard();
  }

  // Student Profile View
  if (document.getElementById('student-profile-container')) {
    initStudentProfileView();
  }

  // Student Edit Profile Form
  if (document.getElementById('edit-profile-form')) {
    initStudentEditProfile();
  }

  // Student Resume Page
  if (document.getElementById('student-resume-container')) {
    initStudentResumePage();
  }

  // Student Settings
  if (document.getElementById('student-settings-form')) {
    initStudentSettings();
  }
});

/**
 * Initialize Student Dashboard
 */
function initStudentDashboard() {
  const student = DB.getStudentProfile();
  const applications = DB.getApplications();
  const interviews = DB.getInterviews().filter(i => i.studentId === student.id || i.status === 'Upcoming');
  const allInternships = DB.getInternships();
  const notifications = DB.getNotifications('student').slice(0, 4);

  // Student Name greeting
  const greetingEl = document.getElementById('dashboard-student-name');
  if (greetingEl) greetingEl.textContent = student.name.split(' ')[0];

  // Calculate Statistics
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'Applied' || a.status === 'Reviewed').length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewApps = applications.filter(a => a.status === 'Interview').length;
  const selectedApps = applications.filter(a => a.status === 'Selected').length;

  document.getElementById('stat-total-apps').textContent = totalApps;
  document.getElementById('stat-pending-apps').textContent = pendingApps;
  document.getElementById('stat-shortlisted-apps').textContent = shortlistedApps;
  document.getElementById('stat-interviews').textContent = interviewApps;
  document.getElementById('stat-selected').textContent = selectedApps;

  // Render Application Status Chart (Chart.js)
  renderApplicationStatusChart(applications);

  // Render Recent Applications List
  const recentAppsContainer = document.getElementById('dashboard-recent-apps');
  if (recentAppsContainer) {
    const recent = applications.slice(0, 4);
    if (recent.length === 0) {
      recentAppsContainer.innerHTML = `<p class="text-xs text-slate-500 py-4">No applications submitted yet.</p>`;
    } else {
      recentAppsContainer.innerHTML = recent.map(app => `
        <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-700/30">
          <div class="flex items-center gap-3">
            <img src="${app.companyLogo}" alt="${app.company}" class="w-10 h-10 rounded-lg object-cover" />
            <div>
              <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">${app.jobTitle}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">${app.company} • ${app.appliedDate}</p>
            </div>
          </div>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
            ${app.status}
          </span>
        </div>
      `).join('');
    }
  }

  // Render Recommended Internships (matching student skills)
  const recommendedContainer = document.getElementById('dashboard-recommended-internships');
  if (recommendedContainer) {
    const recommended = allInternships
      .filter(item => item.skills.some(s => student.skills.includes(s)))
      .slice(0, 3);

    recommendedContainer.innerHTML = recommended.map(item => `
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 transition flex flex-col justify-between">
        <div class="flex items-start gap-3 mb-3">
          <img src="${item.logo}" alt="${item.company}" class="w-11 h-11 rounded-xl object-cover" />
          <div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600">
              <a href="internship-details.html?id=${item.id}">${item.title}</a>
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">${item.company} • ${item.location} (${item.workMode})</p>
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
          <span class="font-bold text-indigo-600 dark:text-indigo-400">${item.stipend}</span>
          <a href="internship-details.html?id=${item.id}" class="font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600">Apply &rarr;</a>
        </div>
      </div>
    `).join('');
  }

  // Render Upcoming Interview Spotlight
  const interviewSpotlight = document.getElementById('dashboard-interview-spotlight');
  if (interviewSpotlight) {
    const upcoming = interviews.find(i => i.status === 'Upcoming') || interviews[0];
    if (upcoming) {
      interviewSpotlight.innerHTML = `
        <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-600/20">
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white backdrop-blur-sm">
              <i class="fa-solid fa-video text-xs mr-1"></i> Upcoming Interview
            </span>
            <span class="text-xs text-indigo-100 font-semibold">${upcoming.date}</span>
          </div>
          <h4 class="text-lg font-bold mb-1">${upcoming.position}</h4>
          <p class="text-xs text-indigo-100 mb-4 flex items-center gap-1.5">
            <i class="fa-regular fa-building"></i> ${upcoming.company} • ${upcoming.time}
          </p>
          <a href="${upcoming.meetingLink}" target="_blank" class="w-full py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Join Meeting Room
          </a>
        </div>
      `;
    } else {
      interviewSpotlight.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 text-center">
          <i class="fa-regular fa-calendar-check text-slate-400 text-2xl mb-2"></i>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">No interviews scheduled yet</p>
          <p class="text-xs text-slate-400 mt-1">Keep applying to receive technical interview invitations.</p>
        </div>
      `;
    }
  }

  // Render Approaching Deadlines
  const deadlinesContainer = document.getElementById('dashboard-upcoming-deadlines');
  if (deadlinesContainer) {
    const sortedByDeadline = [...allInternships].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3);
    deadlinesContainer.innerHTML = sortedByDeadline.map(item => `
      <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-700/20">
        <div>
          <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
            <a href="internship-details.html?id=${item.id}" class="hover:underline">${item.title}</a>
          </h5>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">${item.company}</p>
        </div>
        <span class="text-xs font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40">
          ${item.deadline}
        </span>
      </div>
    `).join('');
  }
}

function renderApplicationStatusChart(applications) {
  const chartCanvas = document.getElementById('applicationStatusChart');
  if (!chartCanvas || typeof Chart === 'undefined') return;

  const counts = {
    Applied: applications.filter(a => a.status === 'Applied').length,
    Reviewed: applications.filter(a => a.status === 'Reviewed').length,
    Shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    Interview: applications.filter(a => a.status === 'Interview').length,
    Selected: applications.filter(a => a.status === 'Selected').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const isDark = document.documentElement.classList.contains('dark');

  new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      datasets: [{
        data: [counts.Applied, counts.Reviewed, counts.Shortlisted, counts.Interview, counts.Selected, counts.Rejected],
        backgroundColor: [
          '#3b82f6', // blue
          '#a855f7', // purple
          '#f59e0b', // amber
          '#6366f1', // indigo
          '#10b981', // emerald
          '#f43f5e'  // rose
        ],
        borderWidth: 2,
        borderColor: isDark ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
            color: isDark ? '#cbd5e1' : '#475569'
          }
        }
      },
      cutout: '70%'
    }
  });
}

/**
 * Initialize Student Profile View
 */
function initStudentProfileView() {
  const student = DB.getStudentProfile();

  document.getElementById('profile-name').textContent = student.name;
  document.getElementById('profile-id').textContent = student.studentId;
  document.getElementById('profile-dept').textContent = student.department;
  document.getElementById('profile-univ').textContent = student.university;
  document.getElementById('profile-cgpa').textContent = student.cgpa;
  document.getElementById('profile-semester').textContent = student.semester;
  document.getElementById('profile-grad-year').textContent = student.graduationYear;
  document.getElementById('profile-email').textContent = student.email;
  document.getElementById('profile-phone').textContent = student.phone;
  document.getElementById('profile-location').textContent = student.location;
  document.getElementById('profile-bio').textContent = student.bio;
  document.getElementById('profile-avatar').src = student.avatar;

  // Social Links
  const githubLink = document.getElementById('profile-github');
  if (githubLink) githubLink.href = student.socials?.github || '#';
  const linkedinLink = document.getElementById('profile-linkedin');
  if (linkedinLink) linkedinLink.href = student.socials?.linkedin || '#';
  const portfolioLink = document.getElementById('profile-portfolio');
  if (portfolioLink) portfolioLink.href = student.socials?.portfolio || '#';

  // Skills chips
  const skillsContainer = document.getElementById('profile-skills-container');
  if (skillsContainer) {
    skillsContainer.innerHTML = student.skills.map(s => `
      <span class="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold">
        ${s}
      </span>
    `).join('');
  }

  // Languages chips
  const langContainer = document.getElementById('profile-languages-container');
  if (langContainer) {
    langContainer.innerHTML = student.languages.map(l => `
      <span class="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
        ${l}
      </span>
    `).join('');
  }

  // Education Timeline
  const eduContainer = document.getElementById('profile-education-container');
  if (eduContainer) {
    eduContainer.innerHTML = (student.education || []).map(edu => `
      <div class="relative pl-6 pb-6 border-l-2 border-indigo-200 dark:border-indigo-800 last:border-0 last:pb-0">
        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-950"></div>
        <h4 class="font-bold text-base text-slate-900 dark:text-white">${edu.degree}</h4>
        <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">${edu.institution}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${edu.year} • <span class="font-bold text-emerald-600 dark:text-emerald-400">${edu.grade}</span></p>
        <p class="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">${edu.description}</p>
      </div>
    `).join('');
  }

  // Projects
  const projContainer = document.getElementById('profile-projects-container');
  if (projContainer) {
    projContainer.innerHTML = (student.projects || []).map(proj => `
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
        <div class="flex items-center justify-between mb-1">
          <h4 class="font-bold text-sm text-slate-900 dark:text-white">${proj.title}</h4>
          <a href="${proj.link}" target="_blank" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Code &rarr;</a>
        </div>
        <p class="text-xs font-semibold text-indigo-500 mb-2">${proj.tech}</p>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${proj.description}</p>
      </div>
    `).join('');
  }

  // Certifications
  const certContainer = document.getElementById('profile-certs-container');
  if (certContainer) {
    certContainer.innerHTML = (student.certifications || []).map(cert => `
      <div class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm">
        <i class="fa-solid fa-award text-amber-500 text-xl mt-0.5"></i>
        <div>
          <h5 class="text-sm font-bold text-slate-900 dark:text-white">${cert.name}</h5>
          <p class="text-xs text-slate-500 dark:text-slate-400">${cert.issuer} • ${cert.year}</p>
        </div>
      </div>
    `).join('');
  }
}

/**
 * Global Avatar Handlers for Student Edit Profile
 */
window.handleStudentAvatarFile = async function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file exceeds 5MB size limit.', 'warning');
      input.value = '';
      return;
    }
    const statusEl = document.getElementById('photo-upload-status');
    if (statusEl) {
      statusEl.classList.remove('hidden');
      statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Uploading to persistent storage...';
    }

    // Local instant preview
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('edit-avatar-preview');
      if (preview) preview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    try {
      const res = await DB.uploadImage(file);
      if (res && res.url) {
        document.getElementById('edit-avatar-url').value = res.url;
        if (statusEl) {
          statusEl.innerHTML = '<i class="fa-solid fa-check text-emerald-500 mr-1"></i> Photo uploaded!';
          setTimeout(() => statusEl.classList.add('hidden'), 3000);
        }
        showToast('Photo uploaded and verified on server!', 'success');
      } else {
        throw new Error(res.error || 'Upload failed');
      }
    } catch (err) {
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-500 mr-1"></i> Upload failed';
      }
      showToast('Failed to upload image. Please retry.', 'error');
    }
  }
};

window.handleStudentAvatarRemove = async function() {
  const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
  document.getElementById('edit-avatar-url').value = defaultPhoto;
  const preview = document.getElementById('edit-avatar-preview');
  if (preview) preview.src = defaultPhoto;
  await DB.removeProfileImage();
  showToast('Profile photo reset to default avatar.', 'info');
};

/**
 * Initialize Student Edit Profile Form
 */
function initStudentEditProfile() {
  const form = document.getElementById('edit-profile-form');
  const student = DB.getStudentProfile();

  // Populate existing fields
  document.getElementById('edit-name').value = student.name || '';
  document.getElementById('edit-studentid').value = student.studentId || '';
  document.getElementById('edit-email').value = student.email || '';
  document.getElementById('edit-phone').value = student.phone || '';
  document.getElementById('edit-location').value = student.location || '';
  document.getElementById('edit-university').value = student.university || '';
  document.getElementById('edit-department').value = student.department || '';
  document.getElementById('edit-semester').value = student.semester || '';
  document.getElementById('edit-cgpa').value = student.cgpa || '';
  const gradYearEl = document.getElementById('edit-gradyear');
  if (gradYearEl) gradYearEl.value = student.graduationYear || '';
  document.getElementById('edit-skills').value = (student.skills || []).join(', ');
  document.getElementById('edit-languages').value = (student.languages || []).join(', ');
  document.getElementById('edit-bio').value = student.bio || '';
  document.getElementById('edit-github').value = student.socials?.github || '';
  document.getElementById('edit-linkedin').value = student.socials?.linkedin || '';
  document.getElementById('edit-portfolio').value = student.socials?.portfolio || '';
  
  const avatarUrl = student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
  document.getElementById('edit-avatar-url').value = avatarUrl;
  const preview = document.getElementById('edit-avatar-preview');
  if (preview) preview.src = avatarUrl;

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const updatedStudent = {
      ...student,
      name: document.getElementById('edit-name').value.trim(),
      studentId: document.getElementById('edit-studentid').value.trim(),
      email: document.getElementById('edit-email').value.trim(),
      phone: document.getElementById('edit-phone').value.trim(),
      location: document.getElementById('edit-location').value.trim(),
      university: document.getElementById('edit-university').value.trim(),
      department: document.getElementById('edit-department').value.trim(),
      semester: document.getElementById('edit-semester').value.trim(),
      cgpa: document.getElementById('edit-cgpa').value.trim(),
      graduationYear: (document.getElementById('edit-gradyear')?.value || '').trim() || student.graduationYear,
      skills: document.getElementById('edit-skills').value.split(',').map(s => s.trim()).filter(Boolean),
      languages: document.getElementById('edit-languages').value.split(',').map(l => l.trim()).filter(Boolean),
      bio: document.getElementById('edit-bio').value.trim(),
      avatar: document.getElementById('edit-avatar-url').value.trim() || student.avatar,
      socials: {
        github: document.getElementById('edit-github').value.trim(),
        linkedin: document.getElementById('edit-linkedin').value.trim(),
        portfolio: document.getElementById('edit-portfolio').value.trim(),
      }
    };

    DB.saveStudentProfile(updatedStudent);
    showToast('Profile updated successfully! Synced across portal.', 'success');

    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 800);
  });
}

/**
 * Initialize Student Resume Page
 */
function initStudentResumePage() {
  const student = DB.getStudentProfile();
  const resume = student.resume || {
    fileName: "Mehedi_Hasan_CSE_Resume_2026.pdf",
    fileSize: "1.4 MB",
    uploadDate: "2026-08-15",
    status: "Verified"
  };

  document.getElementById('resume-file-name').textContent = resume.fileName;
  document.getElementById('resume-file-size').textContent = resume.fileSize;
  document.getElementById('resume-upload-date').textContent = resume.uploadDate;
  document.getElementById('resume-status-badge').textContent = resume.status;

  // Drag and drop / file input simulation
  const fileInput = document.getElementById('resume-file-input');
  const dropZone = document.getElementById('resume-drop-zone');

  if (fileInput && dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500', 'bg-indigo-50/50');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) handleResumeUpload(files[0]);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) handleResumeUpload(fileInput.files[0]);
    });
  }
}

function handleResumeUpload(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a valid PDF document only!', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('File size exceeds the 5 MB limit!', 'error');
    return;
  }

  const student = DB.getStudentProfile();
  student.resume = {
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    uploadDate: new Date().toISOString().split('T')[0],
    status: "Verified"
  };

  DB.saveStudentProfile(student);
  showToast(`Resume '${file.name}' uploaded successfully!`, 'success');
  initStudentResumePage();
}

function handleDeleteResume() {
  if (confirm('Are you sure you want to remove your uploaded resume?')) {
    const student = DB.getStudentProfile();
    student.resume = {
      fileName: "No resume uploaded",
      fileSize: "0 KB",
      uploadDate: "N/A",
      status: "Missing"
    };
    DB.saveStudentProfile(student);
    showToast('Resume removed', 'info');
    initStudentResumePage();
  }
}

/**
 * Initialize Student Settings
 */
function initStudentSettings() {
  const form = document.getElementById('student-settings-form');
  const student = DB.getStudentProfile();

  document.getElementById('settings-name').value = student.name || '';
  document.getElementById('settings-email').value = student.email || '';
  document.getElementById('settings-phone').value = student.phone || '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    student.name = document.getElementById('settings-name').value.trim();
    student.email = document.getElementById('settings-email').value.trim();
    student.phone = document.getElementById('settings-phone').value.trim();
    DB.saveStudentProfile(student);
    showToast('Account preferences updated successfully!', 'success');
  });

  const pwForm = document.getElementById('student-password-form');
  if (pwForm) {
    pwForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPw = document.getElementById('new-password').value;
      const confirmPw = document.getElementById('confirm-password').value;
      if (newPw !== confirmPw) {
        showToast('New passwords do not match!', 'error');
        return;
      }
      pwForm.reset();
      showToast('Password updated successfully!', 'success');
    });
  }
}
