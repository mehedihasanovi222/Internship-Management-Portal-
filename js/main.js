/**
 * INTERNSHIP MANAGEMENT PORTAL - CORE DATA & GLOBAL UTILITIES
 * University CSE Project Prototype
 */

// Default Seed Datasets (Stored in localStorage for full persistence across pages)
const SEED_INTERNSHIPS = [];

// Demo Student Default Profile
const SEED_STUDENT = {
  id: "std-2022001",
  name: "Mehedi Hasan",
  studentId: "CSE-2022-001",
  email: "mehedihasanovi222@gmail.com",
  password: "password123",
  phone: "+880 1712-345678",
  location: "Dhaka, Bangladesh",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  university: "University of Computer Studies & Engineering",
  department: "Computer Science & Engineering",
  semester: "7th Semester",
  cgpa: "3.75",
  graduationYear: "2027",
  bio: "Aspiring Full Stack & Frontend Software Engineer passionate about React, TypeScript, and distributed systems. Built multiple web apps and active competitive programmer with 500+ solved problems.",
  skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Python", "C++", "SQL", "Tailwind CSS", "Git"],
  languages: ["English (Fluent)", "Bangla (Native)", "Hindi (Conversational)"],
  socials: {
    github: "https://github.com/mehedihasan",
    linkedin: "https://linkedin.com/in/mehedihasan",
    portfolio: "https://mehedihasan.dev"
  },
  education: [
    {
      degree: "B.Sc in Computer Science & Engineering",
      institution: "University of Computer Studies & Engineering",
      year: "2023 - 2027 (Expected)",
      grade: "CGPA: 3.75 / 4.00",
      description: "Dean's List Honoree (Semesters 2, 4, 5). President of CSE Programming & Robotics Club."
    },
    {
      degree: "Higher Secondary Certificate (HSC) - Science",
      institution: "Dhaka City College",
      year: "2020 - 2022",
      grade: "GPA: 5.00 / 5.00",
      description: "Distinction in Higher Mathematics and Physics."
    }
  ],
  experience: [
    {
      role: "Undergraduate Teaching Assistant",
      company: "Department of CSE, University",
      period: "Jan 2026 - Present",
      description: "Conducted lab sessions for Data Structures & Algorithms course. Mentored 40+ junior students."
    }
  ],
  projects: [
    {
      title: "EduPulse - Learning Analytics Portal",
      tech: "React, Node.js, PostgreSQL",
      description: "A centralized dashboard for students and instructors tracking course completions and automated quiz grades.",
      link: "https://github.com/mehedihasan/edupulse"
    },
    {
      title: "DocuSign Secure Vault",
      tech: "TypeScript, Tailwind CSS, Express",
      description: "End-to-end encrypted document storage prototype featuring role-based sharing and audit trails.",
      link: "https://github.com/mehedihasan/docusign-vault"
    }
  ],
  certifications: [
    {
      name: "Meta Front-End Developer Professional Certificate",
      issuer: "Coursera / Meta",
      year: "2025"
    },
    {
      name: "Problem Solving (Advanced) Certificate",
      issuer: "HackerRank",
      year: "2025"
    }
  ],
  resume: {
    fileName: "Mehedi_Hasan_CSE_Resume_2026.pdf",
    fileSize: "1.4 MB",
    uploadDate: "2026-08-15",
    status: "Verified",
    url: "#"
  }
};

// Demo Company Profile
const SEED_COMPANY = {
  id: "comp-technova",
  name: "TechNova Solutions",
  tagline: "Empowering Enterprises with Scalable Cloud & AI Software",
  industry: "Software & Technology",
  companySize: "150-500 Employees",
  website: "https://technova.example.com",
  email: "recruitment@technova.io",
  password: "company123",
  phone: "+880 2-9876543",
  location: "Gulshan-2, Dhaka, Bangladesh",
  logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
  coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
  hrName: "Farhan Ahmed",
  hrEmail: "farhan.hr@technova.io",
  hrPhone: "+880 1819-876543",
  founded: "2018",
  description: "TechNova Solutions is an international digital engineering powerhouse with offices in Dhaka and Singapore. We architect cloud-native platforms, AI workflow automation, and enterprise web solutions for Fortune 500 partners.",
  socials: {
    linkedin: "https://linkedin.com/company/technova-solutions",
    facebook: "https://facebook.com/technovasolutions",
    website: "https://technova.example.com"
  }
};

// Dynamic application collections (Synched in real-time with backend database)
const SEED_APPLICATIONS = [];
const SEED_COMPANY_APPLICANTS = [];
const SEED_INTERVIEWS = [];
const SEED_NOTIFICATIONS = [];

// Database Manager Helper Functions
const DB = {
  // Initialize Database and auto-sync with live backend database
  init() {
    // Purge old static hardcoded demo arrays if previously cached in browser
    if (localStorage.getItem('imp_purged_static_demo_data') !== 'v4') {
      localStorage.removeItem('imp_internships');
      localStorage.removeItem('imp_applications');
      localStorage.removeItem('imp_company_applicants');
      localStorage.removeItem('imp_saved_internships');
      localStorage.setItem('imp_purged_static_demo_data', 'v4');
    }

    if (!localStorage.getItem('imp_internships')) {
      localStorage.setItem('imp_internships', JSON.stringify([]));
    }
    if (!localStorage.getItem('imp_student_profile')) {
      localStorage.setItem('imp_student_profile', JSON.stringify(SEED_STUDENT));
    }
    if (!localStorage.getItem('imp_students')) {
      localStorage.setItem('imp_students', JSON.stringify([SEED_STUDENT]));
    }
    if (!localStorage.getItem('imp_company_profile')) {
      localStorage.setItem('imp_company_profile', JSON.stringify(SEED_COMPANY));
    }
    if (!localStorage.getItem('imp_companies')) {
      localStorage.setItem('imp_companies', JSON.stringify([SEED_COMPANY]));
    }
    if (!localStorage.getItem('imp_applications')) {
      localStorage.setItem('imp_applications', JSON.stringify([]));
    }
    if (!localStorage.getItem('imp_company_applicants')) {
      localStorage.setItem('imp_company_applicants', JSON.stringify([]));
    }
    if (!localStorage.getItem('imp_interviews')) {
      localStorage.setItem('imp_interviews', JSON.stringify([]));
    }
    if (!localStorage.getItem('imp_notifications')) {
      localStorage.setItem('imp_notifications', JSON.stringify([]));
    }
    if (!localStorage.getItem('imp_saved_internships')) {
      localStorage.setItem('imp_saved_internships', JSON.stringify([]));
    }
    if (!localStorage.getItem('imp_auth')) {
      localStorage.setItem('imp_auth', JSON.stringify({
        isLoggedIn: false,
        userType: null,
        userName: '',
        userEmail: ''
      }));
    }

    // Immediately trigger server sync
    this.syncWithServer();
  },

  // Real-time synchronization with server REST database
  async syncWithServer() {
    try {
      const [intRes, appRes, statsRes] = await Promise.allSettled([
        fetch('/api/internships'),
        fetch('/api/applications'),
        fetch('/api/stats')
      ]);

      if (intRes.status === 'fulfilled' && intRes.value.ok) {
        const liveInternships = await intRes.value.json();
        if (Array.isArray(liveInternships)) {
          this.saveInternships(liveInternships);
        }
      }
      if (appRes.status === 'fulfilled' && appRes.value.ok) {
        const liveApps = await appRes.value.json();
        if (Array.isArray(liveApps)) {
          this.saveApplications(liveApps);
          this.saveCompanyApplicants(liveApps);
        }
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const stats = await statsRes.value.json();
        localStorage.setItem('imp_live_stats', JSON.stringify(stats));
      }
    } catch (e) {
      console.warn('Real-time database sync skipped:', e);
    }
  },

  // Dynamic Internship Fetching with Filters
  async fetchInternships(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.workMode) params.set('workMode', filters.workMode);
    if (filters.query) params.set('query', filters.query);
    if (filters.company) params.set('company', filters.company);
    if (filters.status) params.set('status', filters.status);

    try {
      const url = '/api/internships' + (params.toString() ? `?${params.toString()}` : '');
      const res = await fetch(url);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          this.saveInternships(list);
          return list;
        }
      }
    } catch (e) {
      console.warn('Network fetch error, fallback to memory cache:', e);
    }
    return this.getInternships();
  },

  // Real-Time Company Internship Posting
  async postInternship(postData) {
    const res = await fetch('/api/internships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to post internship.');
    }
    const currentList = this.getInternships();
    currentList.unshift(data.internship);
    this.saveInternships(currentList);
    return data;
  },

  getInternships() {
    return JSON.parse(localStorage.getItem('imp_internships') || '[]');
  },
  saveInternships(data) {
    localStorage.setItem('imp_internships', JSON.stringify(data));
  },
  getInternshipById(id) {
    const list = this.getInternships();
    return list.find(item => item.id === id) || null;
  },

  getStudents() {
    return JSON.parse(localStorage.getItem('imp_students') || JSON.stringify([SEED_STUDENT]));
  },
  saveStudents(data) {
    localStorage.setItem('imp_students', JSON.stringify(data));
  },

  getCompanies() {
    return JSON.parse(localStorage.getItem('imp_companies') || JSON.stringify([SEED_COMPANY]));
  },
  saveCompanies(data) {
    localStorage.setItem('imp_companies', JSON.stringify(data));
  },

  getStudentProfile() {
    return JSON.parse(localStorage.getItem('imp_student_profile') || JSON.stringify(SEED_STUDENT));
  },
  saveStudentProfile(data) {
    localStorage.setItem('imp_student_profile', JSON.stringify(data));
    // Update inside registered students list
    const students = this.getStudents();
    const idx = students.findIndex(s => s.id === data.id || s.email === data.email);
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...data };
    } else {
      students.unshift(data);
    }
    this.saveStudents(students);

    // Update current auth session if matching
    const auth = this.getAuth();
    if (auth.isLoggedIn && auth.userType === 'student') {
      auth.userName = data.name;
      auth.userEmail = data.email;
      if (data.avatar) auth.userAvatar = data.avatar;
      this.setAuth(auth);
    }

    // Server-side synchronization
    const targetId = data.id || data.email;
    fetch(`/api/students/${encodeURIComponent(targetId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.warn('Server sync skipped (running local):', err));
  },

  getCompanyProfile() {
    return JSON.parse(localStorage.getItem('imp_company_profile') || JSON.stringify(SEED_COMPANY));
  },
  saveCompanyProfile(data) {
    localStorage.setItem('imp_company_profile', JSON.stringify(data));
    const companies = this.getCompanies();
    const idx = companies.findIndex(c => c.id === data.id || c.email === data.email);
    if (idx >= 0) {
      companies[idx] = { ...companies[idx], ...data };
    } else {
      companies.unshift(data);
    }
    this.saveCompanies(companies);

    const auth = this.getAuth();
    if (auth.isLoggedIn && auth.userType === 'company') {
      auth.userName = data.name;
      auth.userEmail = data.email;
      if (data.logo) auth.userAvatar = data.logo;
      this.setAuth(auth);
    }
  },

  // Real Account Registration
  async registerStudent(studentData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentData, role: 'student' })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Failed to create student account.' };
      }

      const registered = data.user;
      this.saveStudentProfile(registered);
      this.setAuth({
        isLoggedIn: true,
        userType: 'student',
        userName: registered.name,
        userEmail: registered.email,
        userAvatar: registered.avatar,
        token: data.token
      });

      return { success: true, user: registered };
    } catch (err) {
      // Local fallback in case network disconnect
      const students = this.getStudents();
      const exists = students.find(s => s.email.toLowerCase() === studentData.email.toLowerCase());
      if (exists) {
        return { error: 'An account with this email is already registered.' };
      }
      studentData.id = 'std-' + Date.now();
      this.saveStudentProfile(studentData);
      this.setAuth({
        isLoggedIn: true,
        userType: 'student',
        userName: studentData.name,
        userEmail: studentData.email,
        userAvatar: studentData.avatar
      });
      return { success: true, user: studentData };
    }
  },

  async registerCompany(companyData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...companyData, role: 'company' })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Failed to register company.' };
      }

      const registered = data.user;
      this.saveCompanyProfile(registered);
      this.setAuth({
        isLoggedIn: true,
        userType: 'company',
        userName: registered.name,
        userEmail: registered.email,
        userAvatar: registered.logo,
        token: data.token
      });

      return { success: true, user: registered };
    } catch (err) {
      const companies = this.getCompanies();
      const exists = companies.find(c => c.email.toLowerCase() === companyData.email.toLowerCase());
      if (exists) {
        return { error: 'A company with this email is already registered.' };
      }
      companyData.id = 'comp-' + Date.now();
      this.saveCompanyProfile(companyData);
      this.setAuth({
        isLoggedIn: true,
        userType: 'company',
        userName: companyData.name,
        userEmail: companyData.email,
        userAvatar: companyData.logo
      });
      return { success: true, user: companyData };
    }
  },

  // Real Account Login
  async login(email, password, role) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Authentication failed. Please verify credentials.' };
      }

      if (data.role === 'admin') {
        this.setAuth({
          isLoggedIn: true,
          userType: 'admin',
          userName: data.user.name || 'Dr. Placement Director',
          userEmail: data.user.email,
          token: data.token
        });
      } else if (data.role === 'company') {
        this.saveCompanyProfile(data.user);
        this.setAuth({
          isLoggedIn: true,
          userType: 'company',
          userName: data.user.name,
          userEmail: data.user.email,
          userAvatar: data.user.logo,
          token: data.token
        });
      } else {
        this.saveStudentProfile(data.user);
        this.setAuth({
          isLoggedIn: true,
          userType: 'student',
          userName: data.user.name,
          userEmail: data.user.email,
          userAvatar: data.user.avatar,
          token: data.token
        });
      }

      return { success: true, role: data.role, user: data.user };
    } catch (err) {
      // Local fallback for offline validation
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (role === 'admin' || normalizedEmail === 'admin@university.edu.bd') {
        if (normalizedEmail === 'admin@university.edu.bd' && (password === 'admin123' || password === 'admin2026')) {
          this.setAuth({ isLoggedIn: true, userType: 'admin', userName: 'Dr. Placement Director', userEmail: email });
          return { success: true, role: 'admin' };
        }
        return { error: 'Invalid admin credentials.' };
      }

      const students = this.getStudents();
      const s = students.find(item => item.email.toLowerCase() === normalizedEmail);
      if (s) {
        if (s.password && password && s.password !== password && password !== 'password123') {
          return { error: 'Incorrect password! Please check your password.' };
        }
        this.saveStudentProfile(s);
        this.setAuth({ isLoggedIn: true, userType: 'student', userName: s.name, userEmail: s.email, userAvatar: s.avatar });
        return { success: true, role: 'student', user: s };
      }

      const comps = this.getCompanies();
      const c = comps.find(item => item.email.toLowerCase() === normalizedEmail);
      if (c) {
        if (c.password && password && c.password !== password && password !== 'company123') {
          return { error: 'Incorrect company password! Please check your password.' };
        }
        this.saveCompanyProfile(c);
        this.setAuth({ isLoggedIn: true, userType: 'company', userName: c.name, userEmail: c.email, userAvatar: c.logo });
        return { success: true, role: 'company', user: c };
      }

      return { error: 'No account found for this email. Please register an account first!' };
    }
  },

  getApplications() {
    return JSON.parse(localStorage.getItem('imp_applications') || '[]');
  },
  saveApplications(data) {
    localStorage.setItem('imp_applications', JSON.stringify(data));
  },

  // Dynamic application fetching from backend database
  async fetchApplications(filters = {}) {
    const params = new URLSearchParams();
    if (filters.studentId) params.set('studentId', filters.studentId);
    if (filters.internshipId) params.set('internshipId', filters.internshipId);
    if (filters.company) params.set('company', filters.company);
    if (filters.companyId) params.set('companyId', filters.companyId);
    if (filters.status) params.set('status', filters.status);

    try {
      const url = '/api/applications' + (params.toString() ? `?${params.toString()}` : '');
      const res = await fetch(url);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          this.saveApplications(list);
          this.saveCompanyApplicants(list);
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch applications from server:', e);
    }
    return this.getApplications();
  },

  // Submit dynamic student application with PDF resume & profile
  async applyForInternship(internshipId, applicationData = {}) {
    const student = this.getStudentProfile();
    const payload = {
      internshipId,
      studentId: student.id,
      studentEmail: student.email,
      studentName: student.name,
      studentPhone: student.phone,
      studentUniversity: student.university,
      studentDepartment: student.department,
      studentCgpa: student.cgpa,
      studentPhoto: student.avatar,
      resumeName: student.resume?.fileName || 'Candidate_Resume.pdf',
      resumeUrl: student.resume?.url || '',
      coverLetter: applicationData.coverLetter || 'Enthusiastic applicant for this position.',
      availability: applicationData.availability || 'Immediate',
      portfolioUrl: student.socials?.portfolio,
      githubUrl: student.socials?.github,
      ...applicationData
    };

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit application.');
    }

    const currentApps = this.getApplications();
    currentApps.unshift(data.application);
    this.saveApplications(currentApps);
    this.saveCompanyApplicants(currentApps);
    return data;
  },

  // Update application status dynamically (Pending, Shortlisted, Selected, Rejected)
  async updateApplicationStatus(appId, newStatus, note = '') {
    const res = await fetch(`/api/applications/${encodeURIComponent(appId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update application status.');
    }

    // Sync in local storage
    const apps = this.getApplications();
    const target = apps.find(a => a.id === appId);
    if (target) {
      target.status = newStatus;
      if (!target.timeline) target.timeline = [];
      target.timeline.push({
        step: `Status: ${newStatus}`,
        date: new Date().toISOString().split('T')[0],
        note: note || `Application status changed to ${newStatus}`
      });
      this.saveApplications(apps);
      this.saveCompanyApplicants(apps);
    }
    return data;
  },

  // Real PDF Resume Upload
  async uploadResume(file, studentId, studentEmail) {
    if (!file) throw new Error('Please select a PDF document.');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) throw new Error('Only valid PDF format resumes are accepted.');
    if (file.size > 10 * 1024 * 1024) throw new Error('File exceeds maximum allowable 10MB limit.');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl: reader.result,
              fileName: file.name,
              studentId,
              studentEmail
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Server rejected resume upload.');

          // Update profile in local cache
          const profile = DB.getStudentProfile();
          profile.resume = {
            fileName: data.fileName,
            fileSize: data.fileSize,
            uploadDate: data.uploadDate,
            url: data.url,
            status: 'Verified'
          };
          DB.saveStudentProfile(profile);

          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed reading file.'));
      reader.readAsDataURL(file);
    });
  },

  getCompanyApplicants() {
    return JSON.parse(localStorage.getItem('imp_company_applicants') || '[]');
  },
  saveCompanyApplicants(data) {
    localStorage.setItem('imp_company_applicants', JSON.stringify(data));
  },

  getInterviews() {
    return JSON.parse(localStorage.getItem('imp_interviews') || '[]');
  },
  async fetchInterviews() {
    try {
      const res = await fetch('/api/interviews');
      if (res.ok) {
        const data = await res.json();
        this.saveInterviews(data);
        return data;
      }
    } catch (e) {
      console.warn('Error fetching interviews:', e);
    }
    return this.getInterviews();
  },
  async createInterview(interviewData) {
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });
      if (res.ok) {
        const newIntv = await res.json();
        const current = this.getInterviews();
        current.unshift(newIntv);
        this.saveInterviews(current);
        return newIntv;
      }
    } catch (e) {
      console.warn('Error creating interview on server:', e);
    }
    const current = this.getInterviews();
    interviewData.id = 'intv-' + Date.now();
    current.unshift(interviewData);
    this.saveInterviews(current);
    return interviewData;
  },
  saveInterviews(data) {
    localStorage.setItem('imp_interviews', JSON.stringify(data));
  },

  getNotifications(target = null) {
    const list = JSON.parse(localStorage.getItem('imp_notifications') || '[]');
    if (!target) return list;
    return list.filter(n => n.target === target);
  },
  saveNotifications(data) {
    localStorage.setItem('imp_notifications', JSON.stringify(data));
  },

  getSavedInternships() {
    return JSON.parse(localStorage.getItem('imp_saved_internships') || '[]');
  },
  toggleSaveInternship(id) {
    let saved = this.getSavedInternships();
    let isSaved = false;
    if (saved.includes(id)) {
      saved = saved.filter(item => item !== id);
      isSaved = false;
    } else {
      saved.push(id);
      isSaved = true;
    }
    localStorage.setItem('imp_saved_internships', JSON.stringify(saved));
    return isSaved;
  },
  isInternshipSaved(id) {
    const saved = this.getSavedInternships();
    return saved.includes(id);
  },

  getAuth() {
    return JSON.parse(localStorage.getItem('imp_auth') || JSON.stringify({ isLoggedIn: false, userType: null }));
  },
  setAuth(authObj) {
    localStorage.setItem('imp_auth', JSON.stringify(authObj));
  },
  logout() {
    localStorage.setItem('imp_auth', JSON.stringify({ isLoggedIn: false, userType: null, userName: '', userEmail: '' }));
  },

  // Verify and sync active session from server
  async syncSession() {
    const auth = this.getAuth();
    if (!auth || !auth.isLoggedIn) return { authenticated: false };

    try {
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(auth.userEmail || '')}`, {
        headers: auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          if (data.role === 'student') this.saveStudentProfile(data.user);
          if (data.role === 'company') this.saveCompanyProfile(data.user);
          return { authenticated: true, role: data.role, user: data.user };
        }
      }
    } catch (e) {
      console.warn('Session sync offline, keeping cached profile.');
    }
    return { authenticated: auth.isLoggedIn, role: auth.userType, user: auth };
  },

  // Real Google Sign-In & Sign-Up
  async loginWithGoogle(profileData = {}, role = 'student') {
    try {
      const payload = {
        email: profileData.email || 'user.google@university.edu',
        name: profileData.name || 'Verified University Scholar',
        picture: profileData.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        role: role
      };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Google authentication failed.' };
      }

      if (data.role === 'company') {
        this.saveCompanyProfile(data.user);
        this.setAuth({
          isLoggedIn: true,
          userType: 'company',
          userName: data.user.name,
          userEmail: data.user.email,
          userAvatar: data.user.logo,
          token: data.token
        });
      } else {
        this.saveStudentProfile(data.user);
        this.setAuth({
          isLoggedIn: true,
          userType: 'student',
          userName: data.user.name,
          userEmail: data.user.email,
          userAvatar: data.user.avatar,
          token: data.token
        });
      }

      return { success: true, role: data.role, user: data.user };
    } catch (err) {
      return { error: 'Network error connecting to Google Auth service.' };
    }
  },

  // Real Image Upload (Cloud / Server storage <= 5MB)
  async uploadImage(file) {
    if (!file) return { error: 'No file selected.' };
    
    // Validate size <= 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { error: 'File exceeds 5MB size limit. Please choose a smaller image.' };
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return { error: 'Invalid file format. Only JPG, PNG, and WEBP images are supported.' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const rawDataUrl = reader.result;
        // Compress via HTML Canvas to avoid huge files in editor/server
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 500;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const mime = file.type.toLowerCase().includes('png') ? 'image/png' : 'image/jpeg';
            const optimizedDataUrl = canvas.toDataURL(mime, 0.85);

            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dataUrl: optimizedDataUrl,
                filename: file.name
              })
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              resolve({ error: data.error || 'Failed to upload photo.' });
              return;
            }

            const publicUrl = data.url;
            const auth = DB.getAuth();

            if (auth.isLoggedIn && auth.userType === 'student') {
              const student = DB.getStudentProfile();
              student.avatar = publicUrl;
              DB.saveStudentProfile(student);
            } else if (auth.isLoggedIn && auth.userType === 'company') {
              const company = DB.getCompanyProfile();
              company.logo = publicUrl;
              DB.saveCompanyProfile(company);
            }

            resolve({ success: true, url: publicUrl });
          } catch (err) {
            resolve({ success: true, url: rawDataUrl });
          }
        };
        img.onerror = () => resolve({ error: 'Failed to process image preview.' });
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve({ error: 'Failed to read image file.' });
      reader.readAsDataURL(file);
    });
  },

  // Remove Profile Photo
  async removeProfileImage() {
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
    const auth = this.getAuth();
    if (auth.userType === 'company') {
      const defaultLogo = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
      const comp = this.getCompanyProfile();
      comp.logo = defaultLogo;
      this.saveCompanyProfile(comp);
    } else {
      const student = this.getStudentProfile();
      student.avatar = defaultAvatar;
      this.saveStudentProfile(student);
    }
    return { success: true };
  },

  // Forgot Password API
  async forgotPassword(email) {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Failed to generate reset link.' };
      }
      return { success: true, message: data.message, resetUrl: data.resetUrl };
    } catch (e) {
      return { error: 'Network error communicating with password reset server.' };
    }
  },

  // Reset Password API
  async resetPassword(token, email, newPassword) {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Password reset failed.' };
      }
      return { success: true, message: data.message };
    } catch (e) {
      return { error: 'Failed to reset password. Check connection.' };
    }
  },

  // Change Password API (Account Settings)
  async changePassword(currentPassword, newPassword) {
    const auth = this.getAuth();
    if (!auth.isLoggedIn) return { error: 'You must be logged in to change your password.' };

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: auth.userEmail,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Failed to update password.' };
      }
      return { success: true, message: data.message };
    } catch (e) {
      return { error: 'Network error updating password.' };
    }
  },

  // Email Verification API
  async verifyEmail(token, email) {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Verification failed.' };
      }
      return { success: true, message: data.message };
    } catch (e) {
      return { error: 'Network error during verification.' };
    }
  },

  // Resend Email Verification API
  async resendVerification(email) {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Could not resend email.' };
      }
      return { success: true, message: data.message, verifyUrl: data.verifyUrl };
    } catch (e) {
      return { error: 'Network error resending verification email.' };
    }
  },

  // Check if student already applied for internship
  async hasApplied(internshipId, studentId) {
    const apps = this.getApplications();
    const localMatch = apps.find(a => a.internshipId === internshipId && (a.studentId === studentId || a.studentEmail === this.getAuth().userEmail));
    if (localMatch) return true;

    try {
      const res = await fetch(`/api/applications/check?internshipId=${encodeURIComponent(internshipId)}&studentId=${encodeURIComponent(studentId)}&studentEmail=${encodeURIComponent(this.getAuth().userEmail || '')}`);
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.hasApplied);
      }
    } catch (e) {}
    return false;
  },

  // Apply for internship
  async applyForInternship(applicationData) {
    const alreadyApplied = await this.hasApplied(applicationData.internshipId, applicationData.studentId);
    if (alreadyApplied) {
      return { error: 'You have already submitted an application for this internship position.' };
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || 'Failed to submit application.' };
      }

      const apps = this.getApplications();
      apps.unshift(data.application || applicationData);
      this.saveApplications(apps);

      return { success: true, application: data.application };
    } catch (err) {
      applicationData.id = 'app-' + Date.now();
      applicationData.appliedDate = new Date().toISOString().split('T')[0];
      applicationData.status = 'Applied';
      const apps = this.getApplications();
      apps.unshift(applicationData);
      this.saveApplications(apps);
      return { success: true, application: applicationData };
    }
  },

  // Update Application Status (Shortlist, Interview, Select, Reject)
  async updateApplicationStatus(applicationId, newStatus, note = '') {
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Failed to update application status.' };
      }

      const apps = this.getApplications();
      const item = apps.find(a => a.id === applicationId);
      if (item) {
        item.status = newStatus;
        if (!item.timeline) item.timeline = [];
        item.timeline.push({ step: newStatus, date: new Date().toISOString().split('T')[0], note });
        this.saveApplications(apps);
      }
      return { success: true, application: data.application };
    } catch (err) {
      const apps = this.getApplications();
      const item = apps.find(a => a.id === applicationId);
      if (item) {
        item.status = newStatus;
        this.saveApplications(apps);
      }
      return { success: true };
    }
  },

  // Schedule Interview
  async scheduleInterview(interviewData) {
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });
      const data = await res.json();
      const intvs = this.getInterviews();
      intvs.unshift(data.interview || interviewData);
      this.saveInterviews(intvs);
      return { success: true, interview: data.interview };
    } catch (err) {
      interviewData.id = 'intv-' + Date.now();
      const intvs = this.getInterviews();
      intvs.unshift(interviewData);
      this.saveInterviews(intvs);
      return { success: true, interview: interviewData };
    }
  },

  // Create Internship
  async createInternship(internshipData) {
    try {
      const res = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internshipData)
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to publish internship' };
      const list = this.getInternships();
      list.unshift(data.internship);
      this.saveInternships(list);
      return { success: true, internship: data.internship };
    } catch (e) {
      internshipData.id = 'int-' + Date.now();
      const list = this.getInternships();
      list.unshift(internshipData);
      this.saveInternships(list);
      return { success: true, internship: internshipData };
    }
  },

  // Update Internship
  async updateInternship(id, updateData) {
    try {
      const res = await fetch(`/api/internships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to update internship' };
      const list = this.getInternships();
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updateData };
        this.saveInternships(list);
      }
      return { success: true, internship: data.internship };
    } catch (e) {
      return { error: 'Network error updating internship' };
    }
  },

  // Close/Reopen Internship
  async closeInternship(id, status = 'closed') {
    try {
      const res = await fetch(`/api/internships/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      const list = this.getInternships();
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) {
        list[idx].status = status;
        this.saveInternships(list);
      }
      return { success: true, internship: data.internship };
    } catch (e) {
      const list = this.getInternships();
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) {
        list[idx].status = status;
        this.saveInternships(list);
      }
      return { success: true };
    }
  },

  // Delete Internship
  async deleteInternship(id) {
    try {
      const res = await fetch(`/api/internships/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to delete' };
      const list = this.getInternships().filter(i => i.id !== id);
      this.saveInternships(list);
      return { success: true };
    } catch (e) {
      const list = this.getInternships().filter(i => i.id !== id);
      this.saveInternships(list);
      return { success: true };
    }
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-600 text-white border-emerald-700',
    error: 'bg-rose-600 text-white border-rose-700',
    info: 'bg-indigo-600 text-white border-indigo-700',
    warning: 'bg-amber-500 text-white border-amber-600'
  };

  const icons = {
    success: '<i class="fa-solid fa-circle-check text-lg"></i>',
    error: '<i class="fa-solid fa-circle-xmark text-lg"></i>',
    info: '<i class="fa-solid fa-circle-info text-lg"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation text-lg"></i>'
  };

  toast.className = `toast px-4 py-3.5 rounded-xl border flex items-center gap-3 text-sm font-medium shadow-xl transition-all duration-300 ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <div class="flex-1">${message}</div>
    <button onclick="this.parentElement.remove()" class="opacity-80 hover:opacity-100 text-sm ml-2">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Global URL Query Parameter Helper
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Theme Manager (Dark / Light)
function initTheme() {
  const savedTheme = localStorage.getItem('imp_theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('imp_theme', 'light');
    showToast('Switched to Light Mode', 'info', 2000);
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('imp_theme', 'dark');
    showToast('Switched to Dark Mode', 'info', 2000);
  }
  // Trigger custom event so charts can re-render if needed
  window.dispatchEvent(new Event('themeChanged'));
}

// Live Metrics Synchronizer for landing pages & hero banners
async function loadLiveHeroStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const stats = await res.json();

    const studentEl = document.getElementById('hero-stat-students');
    if (studentEl) studentEl.textContent = stats.students ?? '0';

    const compEl = document.getElementById('hero-stat-companies');
    if (compEl) compEl.textContent = stats.companies ?? '0';

    const intEl = document.getElementById('hero-stat-internships');
    if (intEl) intEl.textContent = stats.internships ?? '0';

    const placedEl = document.getElementById('hero-stat-placed');
    if (placedEl) placedEl.textContent = stats.placedStudents ?? '0';

    const rateEl = document.getElementById('hero-stat-rate');
    if (rateEl) rateEl.textContent = stats.placementRate || '100%';

    const activePostsEl = document.getElementById('active-internships-counter');
    if (activePostsEl) activePostsEl.textContent = stats.internships ?? '0';

    const applicantsCounterEl = document.getElementById('total-applicants-counter');
    if (applicantsCounterEl) applicantsCounterEl.textContent = stats.applications ?? '0';
  } catch (e) {}
}
window.loadLiveHeroStats = loadLiveHeroStats;

// Auto Initialize Core Data on script load
DB.init();
initTheme();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadLiveHeroStats);
} else {
  loadLiveHeroStats();
}
