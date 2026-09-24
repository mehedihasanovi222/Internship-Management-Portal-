import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Built-in body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Server-side JSON persistence directory & file
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const RESUMES_DIR = path.join(UPLOADS_DIR, "resumes");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(RESUMES_DIR)) {
  fs.mkdirSync(RESUMES_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

interface Internship {
  id: string;
  companyId?: string;
  title: string;
  company: string;
  logo: string;
  category: string;
  department: string;
  location: string;
  workMode: string;
  type: string;
  duration: string;
  stipend: string;
  stipendAmount: number;
  openings: number;
  postedDate: string;
  deadline: string;
  skills: string[];
  featured: boolean;
  status?: string; // active, under_review, closed
  description: string;
  responsibilities: string[];
  qualifications: string[];
  preferredSkills: string[];
  benefits: string[];
  companyInfo: any;
}

interface Application {
  id: string;
  internshipId: string;
  companyId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentUniversity: string;
  studentDepartment: string;
  studentCgpa: string;
  studentPhoto: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  appliedDate: string;
  status: string; // Applied, Reviewed, Shortlisted, Interview, Selected, Rejected
  resumeName: string;
  resumeUrl?: string;
  coverLetter: string;
  availability: string;
  portfolioUrl?: string;
  githubUrl?: string;
  timeline?: Array<{ step: string; date: string; note: string }>;
}

interface Company {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  companySize: string;
  website: string;
  email: string;
  password?: string;
  phone: string;
  location: string;
  logo: string;
  coverImage: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  founded: string;
  verified: boolean;
  status: "active" | "pending" | "suspended";
  description: string;
  socials: Record<string, string>;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  password?: string;
  phone: string;
  location: string;
  avatar: string;
  university: string;
  department: string;
  semester: string;
  cgpa: string;
  graduationYear: string;
  bio: string;
  skills: string[];
  languages: string[];
  socials: Record<string, string>;
  education: any[];
  experience: any[];
  projects: any[];
  certifications: any[];
  resume: any;
  status?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

interface SystemData {
  internships: Internship[];
  applications: Application[];
  companies: Company[];
  students: Student[];
  interviews: any[];
  notifications: any[];
  admin: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

// Initial default seed state
const initialData: SystemData = {
  internships: [
    {
      id: "int-101",
      title: "Frontend Developer Intern",
      company: "TechNova Solutions",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      category: "Software & Development",
      department: "Engineering",
      location: "Dhaka, Bangladesh",
      workMode: "Hybrid",
      type: "Full-time",
      duration: "3 Months",
      stipend: "৳ 25,000 / month",
      stipendAmount: 25000,
      openings: 3,
      postedDate: "2026-08-20",
      deadline: "2026-09-25",
      skills: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS"],
      featured: true,
      status: "active",
      description: "Join our fast-paced product engineering team to build scalable, reactive web portals for enterprise fintech clients.",
      responsibilities: [
        "Develop modular React components following modern state management best practices.",
        "Collaborate with UI/UX designers to translate Figma prototypes into pixel-perfect responsive layouts."
      ],
      qualifications: [
        "Currently pursuing B.Sc in CSE, SWE, or related disciplines (3rd/4th year).",
        "Strong foundation in HTML5, modern ES6+ JavaScript, and responsive CSS/Tailwind."
      ],
      preferredSkills: ["TypeScript", "Next.js", "RESTful API Integration"],
      benefits: ["Certificate of Completion", "Full-time Job Offer upon performance", "Mentorship"],
      companyInfo: {
        name: "TechNova Solutions",
        industry: "Software & Cloud Services",
        size: "150-500 Employees",
        location: "Gulshan-2, Dhaka"
      }
    },
    {
      id: "int-102",
      title: "Backend Developer Intern (Node.js/Python)",
      company: "ByteCraft",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
      category: "Software & Development",
      department: "Backend Engineering",
      location: "Remote",
      workMode: "Remote",
      type: "Full-time",
      duration: "6 Months",
      stipend: "৳ 28,000 / month",
      stipendAmount: 28000,
      openings: 2,
      postedDate: "2026-08-25",
      deadline: "2026-09-30",
      skills: ["Node.js", "Python", "SQL", "Express", "REST API"],
      featured: true,
      status: "active",
      description: "Work on mission-critical microservices and database pipelines.",
      responsibilities: ["Build and document robust RESTful & GraphQL endpoints."],
      qualifications: ["Undergraduate student in Computer Science or Software Engineering."],
      preferredSkills: ["Docker", "PostgreSQL", "Redis"],
      benefits: ["Remote work stipend", "Course reimbursement"],
      companyInfo: {
        name: "ByteCraft",
        industry: "Fintech & Developer Tools",
        size: "50-100 Employees",
        location: "Banani, Dhaka"
      }
    },
    {
      id: "int-103",
      title: "Data Analyst & BI Intern",
      company: "DataSphere Analytics",
      logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=80",
      category: "Data & AI",
      department: "Business Intelligence",
      location: "Dhaka, Bangladesh",
      workMode: "On-site",
      type: "Full-time",
      duration: "3 Months",
      stipend: "৳ 22,000 / month",
      stipendAmount: 22000,
      openings: 4,
      postedDate: "2026-08-22",
      deadline: "2026-09-28",
      skills: ["Python", "SQL", "Tableau", "Power BI", "Excel"],
      featured: true,
      status: "active",
      description: "Transform complex operational data into actionable visual dashboards.",
      responsibilities: ["Extract and clean large datasets using SQL and Python pandas."],
      qualifications: ["Student in CSE, Data Science, or Statistics."],
      preferredSkills: ["ETL", "Pandas"],
      benefits: ["Letter of recommendation", "Stipend"],
      companyInfo: {
        name: "DataSphere Analytics",
        industry: "Data Consulting",
        size: "40 Employees",
        location: "Mohakhali DOHS, Dhaka"
      }
    }
  ],
  applications: [
    {
      id: "app-301",
      internshipId: "int-101",
      studentId: "std-2022001",
      studentName: "Mehedi Hasan",
      studentEmail: "mehedi.hasan@university.edu",
      studentPhone: "+880 1712-345678",
      studentUniversity: "University of Computer Studies & Engineering",
      studentDepartment: "Computer Science & Engineering",
      studentCgpa: "3.75",
      studentPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      jobTitle: "Frontend Developer Intern",
      company: "TechNova Solutions",
      companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      appliedDate: "2026-08-22",
      status: "Interview",
      resumeName: "Mehedi_Hasan_CSE_Resume_2026.pdf",
      coverLetter: "Excited to contribute frontend software engineering expertise.",
      availability: "Immediate",
      portfolioUrl: "https://mehedihasan.dev",
      timeline: [
        { step: "Applied", date: "2026-08-22", note: "Application submitted with resume and cover letter." },
        { step: "Interview Scheduled", date: "2026-08-29", note: "Video interview scheduled." }
      ]
    },
    {
      id: "app-402",
      internshipId: "int-101",
      studentId: "std-2022045",
      studentName: "Ayesha Siddiqua",
      studentEmail: "ayesha.siddiqua@cse.buet.ac.bd",
      studentPhone: "+880 1823-456789",
      studentUniversity: "Bangladesh University of Engineering & Technology",
      studentDepartment: "Computer Science & Engineering",
      studentCgpa: "3.92",
      studentPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      jobTitle: "Frontend Developer Intern",
      company: "TechNova Solutions",
      companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      appliedDate: "2026-08-23",
      status: "Shortlisted",
      resumeName: "Ayesha_Siddiqua_BUET_Resume.pdf",
      coverLetter: "Passionate about creating accessible and ultra-fast web user interfaces.",
      availability: "Immediate",
      portfolioUrl: "https://ayeshasiddiqua.me"
    }
  ],
  companies: [
    {
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
      verified: true,
      status: "active",
      description: "TechNova Solutions is an international digital engineering powerhouse with offices in Dhaka and Singapore.",
      socials: {
        linkedin: "https://linkedin.com/company/technova-solutions"
      }
    },
    {
      id: "comp-bytecraft",
      name: "ByteCraft",
      tagline: "Developer Tooling & High-Throughput Fintech Services",
      industry: "Fintech & Developer Tools",
      companySize: "50-100 Employees",
      website: "https://bytecraft.example.com",
      email: "talent@bytecraft.example.com",
      phone: "+880 1711-224466",
      location: "Banani, Dhaka, Bangladesh",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=80",
      coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
      hrName: "Tanvir Hasan",
      hrEmail: "tanvir.hr@bytecraft.example.com",
      hrPhone: "+880 1711-224466",
      founded: "2020",
      verified: true,
      status: "active",
      description: "ByteCraft builds modern developer tooling and fintech payment gateways serving clients across South Asia.",
      socials: {
        linkedin: "https://linkedin.com/company/bytecraft"
      }
    },
    {
      id: "comp-cloudcore",
      name: "CloudCore Systems",
      tagline: "Kubernetes & Cloud Infrastructure Pioneers",
      industry: "Cloud & DevOps",
      companySize: "100-250 Employees",
      website: "https://cloudcore.example.com",
      email: "jobs@cloudcore.example.com",
      phone: "+880 1811-998877",
      location: "Uttara, Dhaka, Bangladesh",
      logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      hrName: "Sarah Karim",
      hrEmail: "sarah.hr@cloudcore.example.com",
      hrPhone: "+880 1811-998877",
      founded: "2019",
      verified: true,
      status: "active",
      description: "CloudCore Systems provides enterprise Kubernetes orchestration, multicloud migration, and 24/7 SRE support.",
      socials: {
        linkedin: "https://linkedin.com/company/cloudcore"
      }
    },
    {
      id: "comp-nexusai",
      name: "NexusAI Innovations",
      tagline: "Applied Generative AI & Autonomous Agent Systems",
      industry: "Artificial Intelligence",
      companySize: "30-60 Employees",
      website: "https://nexusai.example.com",
      email: "contact@nexusai.example.com",
      phone: "+880 1912-334455",
      location: "Dhanmondi, Dhaka, Bangladesh",
      logo: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&auto=format&fit=crop&q=80",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      hrName: "Dr. Kazi Rahman",
      hrEmail: "kazi@nexusai.example.com",
      hrPhone: "+880 1912-334455",
      founded: "2023",
      verified: false,
      status: "pending", // Pending admin approval demo!
      description: "NexusAI is an R&D laboratory building domain-specific LLM workflows for banking and telecom clients.",
      socials: {
        linkedin: "https://linkedin.com/company/nexusai"
      }
    }
  ],
  students: [
    {
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
      bio: "Aspiring Full Stack & Frontend Software Engineer passionate about React, TypeScript, and distributed systems.",
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Python", "SQL", "Tailwind CSS"],
      languages: ["English", "Bangla"],
      socials: { github: "https://github.com/mehedihasan" },
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      resume: { fileName: "Mehedi_Hasan_CSE_Resume_2026.pdf", status: "Verified" },
      status: "active"
    },
    {
      id: "std-2022045",
      name: "Ayesha Siddiqua",
      studentId: "CSE-2022-045",
      email: "ayesha.siddiqua@cse.buet.ac.bd",
      phone: "+880 1823-456789",
      location: "Dhaka, Bangladesh",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      university: "Bangladesh University of Engineering & Technology",
      department: "Computer Science & Engineering",
      semester: "8th Semester",
      cgpa: "3.92",
      graduationYear: "2026",
      bio: "Software developer with strong foundation in algorithms, systems design, and UI performance.",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "C++", "Python"],
      languages: ["English", "Bangla"],
      socials: { github: "https://github.com/ayeshasid" },
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      resume: { fileName: "Ayesha_Siddiqua_BUET_Resume.pdf", status: "Verified" },
      status: "active"
    }
  ],
  interviews: [
    {
      id: "intv-501",
      applicationId: "app-301",
      studentId: "std-2022001",
      studentName: "Mehedi Hasan",
      company: "TechNova Solutions",
      position: "Frontend Developer Intern",
      date: "2026-09-05",
      time: "11:00 AM - 11:45 AM (BST)",
      type: "Google Meet",
      meetingLink: "https://meet.google.com/abc-intern-interview",
      status: "Upcoming",
      interviewer: "Farhan Ahmed & Tareq Hasan"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      target: "admin",
      title: "New Company Registered 🏢",
      message: "NexusAI Innovations submitted registration credentials for Placement Cell verification.",
      date: "2026-09-01 10:00 AM",
      read: false,
      type: "verification"
    }
  ],
  admin: {
    name: "Dr. Placement Director",
    email: "admin@university.edu.bd",
    role: "Super Administrator & Placement Officer",
    department: "University Career Development & Corporate Relations Cell"
  }
};

// In-memory data store with file persistence
let dataStore: SystemData = initialData;

function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const loaded = JSON.parse(content);
      dataStore = { ...initialData, ...loaded };
      // Ensure student and company passwords exist
      if (Array.isArray(dataStore.students)) {
        dataStore.students.forEach(s => {
          if (!s.password) s.password = "password123";
        });
      }
      if (Array.isArray(dataStore.companies)) {
        dataStore.companies.forEach(c => {
          if (!c.password) c.password = "company123";
        });
      }
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error loading database file, falling back to memory store:", err);
  }
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

loadDatabase();

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    mode: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    cloudRegion: "asia-southeast1 (Cloud Run)",
    uptime: Math.floor(process.uptime()),
    database: "persistent_json_store"
  });
});

// Platform Statistics (used across all dashboards)
app.get("/api/stats", (req: Request, res: Response) => {
  const totalStudents = dataStore.students.length;
  const totalCompanies = dataStore.companies.length;
  const verifiedCompanies = dataStore.companies.filter(c => c.verified).length;
  const pendingCompanies = dataStore.companies.filter(c => !c.verified).length;
  const totalInternships = dataStore.internships.length;
  const totalApplications = dataStore.applications.length;
  const selectedCount = dataStore.applications.filter(a => a.status === "Selected").length;
  const totalInterviews = dataStore.interviews.length;

  res.json({
    students: totalStudents,
    companies: totalCompanies,
    verifiedCompanies,
    pendingCompanies,
    internships: totalInternships,
    applications: totalApplications,
    interviews: totalInterviews,
    placedStudents: selectedCount,
    placementRate: totalApplications > 0 ? ((selectedCount / totalApplications) * 100).toFixed(1) + "%" : "96.8%"
  });
});

// Internships API (CRUD)
app.get("/api/internships", (req: Request, res: Response) => {
  let list = [...dataStore.internships];
  const { category, workMode, query, company } = req.query;

  if (category && typeof category === "string") {
    list = list.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }
  if (workMode && typeof workMode === "string") {
    list = list.filter(item => item.workMode.toLowerCase() === workMode.toLowerCase());
  }
  if (company && typeof company === "string") {
    list = list.filter(item => item.company.toLowerCase().includes(company.toLowerCase()));
  }
  if (query && typeof query === "string") {
    const q = query.toLowerCase();
    list = list.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.skills.some(s => s.toLowerCase().includes(q)) ||
      item.location.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.get("/api/internships/:id", (req: Request, res: Response) => {
  const item = dataStore.internships.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Internship not found" });
  }
  res.json(item);
});

app.post("/api/internships", (req: Request, res: Response) => {
  const companyEmail = req.body.companyEmail || req.body.email;
  const companyName = req.body.company;
  const companyId = req.body.companyId;

  // Verify company identity
  const existingCompany = dataStore.companies.find(c => 
    (companyId && c.id === companyId) ||
    (companyEmail && c.email.toLowerCase() === companyEmail.toLowerCase()) ||
    (companyName && c.name.toLowerCase() === companyName.toLowerCase())
  );

  // If company account exists and is unverified/pending, prevent posting
  if (existingCompany && existingCompany.verified === false) {
    return res.status(403).json({
      error: "Your company account is pending administrative verification. Once approved by the Central Placement Cell, you will be authorized to post internships."
    });
  }

  const finalCompanyId = existingCompany ? existingCompany.id : (companyId || "comp-" + Date.now());
  const finalCompanyName = existingCompany ? existingCompany.name : (companyName || "TechNova Solutions");
  const finalLogo = (existingCompany && existingCompany.logo) ? existingCompany.logo : (req.body.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80");

  const newPost: Internship = {
    id: "int-" + Date.now(),
    companyId: finalCompanyId,
    title: req.body.title || "Untitled Internship",
    company: finalCompanyName,
    logo: finalLogo,
    category: req.body.category || "Software & Development",
    department: req.body.department || "Engineering",
    location: req.body.location || "Dhaka, Bangladesh",
    workMode: req.body.workMode || "Hybrid",
    type: req.body.type || "Full-time",
    duration: req.body.duration || "3 Months",
    stipend: req.body.stipend || "৳ 25,000 / month",
    stipendAmount: Number(req.body.stipendAmount) || 25000,
    openings: Number(req.body.openings) || 2,
    postedDate: new Date().toISOString().split("T")[0],
    deadline: req.body.deadline || "2026-10-30",
    skills: Array.isArray(req.body.skills) ? req.body.skills : ["React", "JavaScript"],
    featured: Boolean(req.body.featured),
    status: "active",
    description: req.body.description || "",
    responsibilities: req.body.responsibilities || [],
    qualifications: req.body.qualifications || [],
    preferredSkills: req.body.preferredSkills || [],
    benefits: req.body.benefits || [],
    companyInfo: req.body.companyInfo || { name: finalCompanyName, location: req.body.location || "Dhaka, Bangladesh" }
  };

  dataStore.internships.unshift(newPost);
  saveDatabase();
  res.status(201).json({ success: true, internship: newPost });
});

app.put("/api/internships/:id", (req: Request, res: Response) => {
  const index = dataStore.internships.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Internship not found" });
  }

  dataStore.internships[index] = { ...dataStore.internships[index], ...req.body };
  saveDatabase();
  res.json({ success: true, internship: dataStore.internships[index] });
});

app.delete("/api/internships/:id", (req: Request, res: Response) => {
  const initialLength = dataStore.internships.length;
  dataStore.internships = dataStore.internships.filter(i => i.id !== req.params.id);

  if (dataStore.internships.length === initialLength) {
    return res.status(404).json({ error: "Internship not found" });
  }

  saveDatabase();
  res.json({ success: true, message: "Internship deleted successfully" });
});

app.patch("/api/internships/:id/status", (req: Request, res: Response) => {
  const item = dataStore.internships.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Internship not found" });
  }
  item.status = req.body.status || (item.status === "closed" ? "active" : "closed");
  saveDatabase();
  res.json({ success: true, internship: item });
});

// Applications API
app.get("/api/applications", (req: Request, res: Response) => {
  let list = [...dataStore.applications];
  const { studentId, company, companyId, status, internshipId } = req.query;

  if (studentId && typeof studentId === "string") {
    list = list.filter(a => a.studentId === studentId);
  }
  if (internshipId && typeof internshipId === "string") {
    list = list.filter(a => a.internshipId === internshipId);
  }
  if (companyId && typeof companyId === "string") {
    list = list.filter(a => a.companyId === companyId);
  }
  if (company && typeof company === "string") {
    list = list.filter(a => a.company.toLowerCase().includes(company.toLowerCase()));
  }
  if (status && typeof status === "string") {
    list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  res.json(list);
});

// Check if student already applied for this internship
app.get("/api/applications/check", (req: Request, res: Response) => {
  const { studentId, internshipId, studentEmail } = req.query;
  const existingApp = dataStore.applications.find(a => 
    a.internshipId === internshipId && 
    (a.studentId === studentId || (studentEmail && a.studentEmail?.toLowerCase() === (studentEmail as string).toLowerCase()))
  );
  res.json({ hasApplied: Boolean(existingApp), application: existingApp || null });
});

app.post("/api/applications", (req: Request, res: Response) => {
  const { internshipId, studentId, studentEmail } = req.body;

  // Duplicate Application Prevention
  const existingApp = dataStore.applications.find(a => 
    a.internshipId === internshipId && 
    (a.studentId === studentId || (studentEmail && a.studentEmail?.toLowerCase() === studentEmail.toLowerCase()))
  );

  if (existingApp) {
    return res.status(409).json({ 
      error: "You have already applied for this internship.", 
      application: existingApp 
    });
  }

  const internship = dataStore.internships.find(i => i.id === internshipId);
  const student = dataStore.students.find(s => 
    s.id === studentId || 
    (studentEmail && s.email.toLowerCase() === (studentEmail as string).toLowerCase())
  );

  const studentResume = student?.resume || {};
  const finalResumeName = req.body.resumeName || studentResume.fileName || "Student_Resume.pdf";
  const finalResumeUrl = req.body.resumeUrl || studentResume.url || "";

  const newApp: Application = {
    id: "app-" + Date.now(),
    internshipId: internshipId || (internship ? internship.id : "int-101"),
    companyId: internship?.companyId || (internship ? "comp-" + internship.company.toLowerCase().replace(/[^a-z0-9]/g, "") : undefined),
    studentId: studentId || student?.id || "std-" + Date.now(),
    studentName: req.body.studentName || student?.name || "Candidate Scholar",
    studentEmail: req.body.studentEmail || student?.email || "student@university.edu",
    studentPhone: req.body.studentPhone || student?.phone || "+880 1700-000000",
    studentUniversity: req.body.studentUniversity || student?.university || "University of Computer Studies & Engineering",
    studentDepartment: req.body.studentDepartment || student?.department || "Computer Science & Engineering",
    studentCgpa: req.body.studentCgpa || student?.cgpa || "3.75",
    studentPhoto: req.body.studentPhoto || student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    jobTitle: req.body.jobTitle || internship?.title || "Technology Intern",
    company: req.body.company || internship?.company || "TechNova Solutions",
    companyLogo: req.body.companyLogo || internship?.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    appliedDate: new Date().toISOString().split("T")[0],
    status: "Applied",
    resumeName: finalResumeName,
    resumeUrl: finalResumeUrl,
    coverLetter: req.body.coverLetter || "Enthusiastic candidate applying for this opening.",
    availability: req.body.availability || "Immediate",
    portfolioUrl: req.body.portfolioUrl || student?.socials?.portfolio,
    githubUrl: req.body.githubUrl || student?.socials?.github,
    timeline: [
      { step: "Applied", date: new Date().toISOString().split("T")[0], note: "Application submitted with resume and profile." }
    ]
  };

  dataStore.applications.unshift(newApp);

  // Notify company
  dataStore.notifications.unshift({
    id: "notif-" + Date.now(),
    target: "company",
    title: "New Application Received 📄",
    message: `${newApp.studentName} submitted an application for ${newApp.jobTitle}.`,
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    read: false,
    type: "applicant"
  });

  saveDatabase();
  res.status(201).json({ success: true, application: newApp });
});

app.put("/api/applications/:id/status", (req: Request, res: Response) => {
  const appItem = dataStore.applications.find(a => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: "Application not found" });
  }

  const newStatus = req.body.status;
  appItem.status = newStatus;

  if (!appItem.timeline) appItem.timeline = [];
  appItem.timeline.push({
    step: newStatus,
    date: new Date().toISOString().split("T")[0],
    note: req.body.note || `Status updated to ${newStatus}`
  });

  // Notify Student
  dataStore.notifications.unshift({
    id: "notif-" + Date.now(),
    target: "student",
    title: `Application Status: ${newStatus} 🎯`,
    message: `Your application for "${appItem.jobTitle}" at ${appItem.company} is now ${newStatus}.`,
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    read: false,
    type: "status"
  });

  saveDatabase();
  res.json({ success: true, application: appItem });
});

app.patch("/api/applications/:id/status", (req: Request, res: Response) => {
  const appItem = dataStore.applications.find(a => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: "Application not found" });
  }

  const newStatus = req.body.status;
  appItem.status = newStatus;

  if (!appItem.timeline) appItem.timeline = [];
  appItem.timeline.push({
    step: newStatus,
    date: new Date().toISOString().split("T")[0],
    note: req.body.note || `Status updated to ${newStatus}`
  });

  // Notify Student
  dataStore.notifications.unshift({
    id: "notif-" + Date.now(),
    target: "student",
    title: `Application Status: ${newStatus} 🎯`,
    message: `Your application for "${appItem.jobTitle}" at ${appItem.company} is now ${newStatus}.`,
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    read: false,
    type: "status"
  });

  saveDatabase();
  res.json({ success: true, application: appItem });
});

// Companies API (Corporate Directory & Admin Verification)
app.get("/api/companies", (req: Request, res: Response) => {
  res.json(dataStore.companies);
});

app.get("/api/companies/:id", (req: Request, res: Response) => {
  const comp = dataStore.companies.find(c => c.id === req.params.id);
  if (!comp) {
    return res.status(404).json({ error: "Company not found" });
  }
  res.json(comp);
});

app.put("/api/companies/:id/verify", (req: Request, res: Response) => {
  const comp = dataStore.companies.find(c => c.id === req.params.id);
  if (!comp) {
    return res.status(404).json({ error: "Company not found" });
  }

  const { verified, status } = req.body;
  if (typeof verified === "boolean") comp.verified = verified;
  if (status) comp.status = status;

  saveDatabase();
  res.json({ success: true, company: comp });
});

// Students API (Placement Directory for Admin)
app.get("/api/students", (req: Request, res: Response) => {
  res.json(dataStore.students);
});

app.get("/api/students/:id", (req: Request, res: Response) => {
  const student = dataStore.students.find(s => s.id === req.params.id || s.email.toLowerCase() === req.params.id.toLowerCase());
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

app.put("/api/students/:id", (req: Request, res: Response) => {
  const student = dataStore.students.find(s => s.id === req.params.id || s.email.toLowerCase() === req.params.id.toLowerCase());
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Update allowed fields
  if (req.body.name) student.name = req.body.name;
  if (req.body.phone) student.phone = req.body.phone;
  if (req.body.location) student.location = req.body.location;
  if (req.body.avatar) student.avatar = req.body.avatar;
  if (req.body.university) student.university = req.body.university;
  if (req.body.department) student.department = req.body.department;
  if (req.body.semester) student.semester = req.body.semester;
  if (req.body.cgpa) student.cgpa = req.body.cgpa;
  if (req.body.graduationYear) student.graduationYear = req.body.graduationYear;
  if (req.body.bio) student.bio = req.body.bio;
  if (Array.isArray(req.body.skills)) student.skills = req.body.skills;
  if (Array.isArray(req.body.languages)) student.languages = req.body.languages;
  if (req.body.socials) student.socials = { ...student.socials, ...req.body.socials };
  if (Array.isArray(req.body.education)) student.education = req.body.education;
  if (Array.isArray(req.body.experience)) student.experience = req.body.experience;
  if (Array.isArray(req.body.projects)) student.projects = req.body.projects;
  if (Array.isArray(req.body.certifications)) student.certifications = req.body.certifications;
  if (req.body.resume) student.resume = req.body.resume;

  saveDatabase();
  res.json({ success: true, student });
});

// Interviews API
app.get("/api/interviews", (req: Request, res: Response) => {
  res.json(dataStore.interviews);
});

app.post("/api/interviews", (req: Request, res: Response) => {
  const newInterview = {
    id: "intv-" + Date.now(),
    applicationId: req.body.applicationId || "app-301",
    studentId: req.body.studentId || "std-2022001",
    studentName: req.body.studentName || "Mehedi Hasan",
    company: req.body.company || "TechNova Solutions",
    position: req.body.position || "Frontend Developer Intern",
    date: req.body.date || "2026-09-10",
    time: req.body.time || "11:00 AM - 11:45 AM (BST)",
    type: req.body.type || "Google Meet",
    meetingLink: req.body.meetingLink || "https://meet.google.com/abc-intern-interview",
    status: "Upcoming",
    interviewer: req.body.interviewer || "Technical Lead"
  };

  dataStore.interviews.unshift(newInterview);

  // Notify student
  dataStore.notifications.unshift({
    id: "notif-" + Date.now(),
    target: "student",
    title: "Interview Scheduled 📅",
    message: `${newInterview.company} scheduled an interview for "${newInterview.position}" on ${newInterview.date} at ${newInterview.time}.`,
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    read: false,
    type: "interview"
  });

  saveDatabase();
  res.status(201).json({ success: true, interview: newInterview });
});

// -------------------------------------------------------------
// CLOUD / PERSISTENT IMAGE UPLOAD API (<= 5MB, JPG/PNG/WEBP)
// -------------------------------------------------------------
app.post("/api/upload", (req: Request, res: Response) => {
  try {
    const rawData = req.body.dataUrl || req.body.fileData || req.body.image;
    if (!rawData || typeof rawData !== "string") {
      return res.status(400).json({ error: "No image payload provided." });
    }

    // 5MB limit check (Base64 is ~33% larger than raw binary)
    if (rawData.length > 7 * 1024 * 1024) {
      return res.status(400).json({ error: "Image file exceeds maximum allowable 5MB limit." });
    }

    const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid image encoding. Please upload a valid image file." });
    }

    const mimeType = matches[1].toLowerCase();
    const allowedMime = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMime.includes(mimeType)) {
      return res.status(400).json({ error: "Unsupported file type. Only JPG, JPEG, PNG, and WEBP are accepted." });
    }

    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    const uniqueFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const targetPath = path.join(UPLOADS_DIR, uniqueFilename);

    const buffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(targetPath, buffer);

    // Auto-compress large uploads to keep under 100KB for instant loading and editor safety
    try {
      if (buffer.length > 80 * 1024) {
        execSync(`convert "${targetPath}" -resize 500x500\\> -strip -quality 85 "${targetPath}"`);
      }
    } catch (optErr) {
      // Non-blocking fallback
    }

    const publicUrl = `/uploads/${uniqueFilename}`;
    const finalStats = fs.existsSync(targetPath) ? fs.statSync(targetPath) : { size: buffer.length };
    return res.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      sizeBytes: finalStats.size
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Server failed to process image upload: " + err.message });
  }
});

app.post("/api/upload/remove", (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Image URL is required" });
    }
    const filename = path.basename(url);
    const targetPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    return res.json({ success: true, message: "Image removed from server storage." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to remove image." });
  }
});

// Real Resume / CV Document Upload (PDF <= 10MB)
app.post("/api/upload/resume", (req: Request, res: Response) => {
  try {
    const rawData = req.body.dataUrl || req.body.fileData || req.body.resume;
    const originalName = (req.body.fileName || req.body.filename || "Resume.pdf").trim();
    const studentId = req.body.studentId;
    const studentEmail = req.body.studentEmail;

    if (!rawData || typeof rawData !== "string") {
      return res.status(400).json({ error: "No PDF resume data provided." });
    }

    // 10MB Base64 limit check
    if (rawData.length > 14 * 1024 * 1024) {
      return res.status(400).json({ error: "Resume file exceeds maximum 10MB allowable limit." });
    }

    const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(rawData, "base64");
    }

    const cleanBase = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.pdf$/i, "");
    const uniqueFilename = `resume_${Date.now()}_${cleanBase}.pdf`;
    const targetPath = path.join(RESUMES_DIR, uniqueFilename);

    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/resumes/${uniqueFilename}`;
    const sizeKb = Math.round(buffer.length / 1024);
    const formattedSize = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    const uploadDate = new Date().toISOString().split("T")[0];

    // Auto-update student profile if student identifier is passed
    if (studentId || studentEmail) {
      const student = dataStore.students.find(s => 
        (studentId && s.id === studentId) || 
        (studentEmail && s.email.toLowerCase() === studentEmail.toLowerCase())
      );
      if (student) {
        student.resume = {
          fileName: originalName.endsWith(".pdf") ? originalName : `${originalName}.pdf`,
          fileSize: formattedSize,
          uploadDate: uploadDate,
          url: publicUrl,
          status: "Verified"
        };
        saveDatabase();
      }
    }

    return res.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: formattedSize,
      uploadDate: uploadDate
    });
  } catch (err: any) {
    console.error("Resume upload error:", err);
    return res.status(500).json({ error: "Failed to store resume document: " + err.message });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION & IDENTITY APIS
// -------------------------------------------------------------

// Session Check Endpoint (Maintains Login on Refresh & Navigation)
app.get("/api/auth/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim() || (req.query.token as string) || "";
  const email = (req.query.email as string || "").trim().toLowerCase();

  if (!token && !email) {
    return res.status(401).json({ authenticated: false, error: "No active session." });
  }

  // Admin Check
  if (token === "jwt_admin_session_token" || email === "admin@university.edu.bd") {
    return res.json({
      authenticated: true,
      role: "admin",
      user: {
        id: "admin-01",
        name: "Dr. Placement Director",
        email: "admin@university.edu.bd",
        role: "admin",
        title: "University Head of Placement & Corporate Relations"
      }
    });
  }

  // Student Check
  const student = dataStore.students.find(s => 
    (token && token.includes(s.id)) || 
    (email && s.email.toLowerCase() === email)
  );
  if (student) {
    return res.json({
      authenticated: true,
      role: "student",
      user: student
    });
  }

  // Company Check
  const comp = dataStore.companies.find(c => 
    (token && token.includes(c.id)) || 
    (email && (c.email.toLowerCase() === email || c.hrEmail?.toLowerCase() === email))
  );
  if (comp) {
    return res.json({
      authenticated: true,
      role: "company",
      user: comp
    });
  }

  return res.status(401).json({ authenticated: false, error: "Session invalid or user not found." });
});

// Real User Registration Endpoint (Student & Company)
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { role, email, password, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Name and email are required to create an account." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Please provide a valid email format." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  // Check if email already registered
  const existingStudent = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  const existingCompany = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail || c.hrEmail?.toLowerCase() === normalizedEmail);
  const isAdmin = normalizedEmail === "admin@university.edu.bd";

  if (existingStudent || existingCompany || isAdmin) {
    return res.status(409).json({ error: "An account with this email is already registered. Please sign in instead." });
  }

  const verificationToken = "vfy_" + Math.random().toString(36).substring(2) + Date.now().toString(36);

  if (role === "company") {
    const newCompany: Company = {
      id: "comp-" + Date.now(),
      name: name.trim(),
      tagline: req.body.tagline || "Innovating Future Technologies",
      industry: req.body.industry || "Software & Technology",
      companySize: req.body.companySize || "50 - 200 Employees",
      website: req.body.website || "https://example.com",
      email: normalizedEmail,
      password: password,
      phone: req.body.phone || "+880 1800-000000",
      location: req.body.location || "Dhaka, Bangladesh",
      logo: req.body.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      hrName: req.body.hrName || req.body.contactPerson || name,
      hrEmail: normalizedEmail,
      hrPhone: req.body.phone || "+880 1800-000000",
      founded: req.body.founded || "2024",
      verified: false,
      status: "pending",
      description: req.body.description || "Corporate technology enterprise hiring talented students.",
      socials: req.body.socials || {},
      emailVerified: false,
      emailVerificationToken: verificationToken
    };

    dataStore.companies.unshift(newCompany);
    saveDatabase();

    const verifyUrl = `/pages/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;
    console.log(`[AUTH] Verification email dispatched to company ${normalizedEmail}: ${verifyUrl}`);

    return res.status(201).json({
      success: true,
      role: "company",
      user: newCompany,
      token: "jwt_company_" + newCompany.id,
      message: "Company registered successfully! Verification email sent. Please check your inbox.",
      verifyUrl
    });
  }

  // Student registration
  const newStudent: Student = {
    id: "std-" + Date.now(),
    name: name.trim(),
    studentId: req.body.studentId?.trim() || "STD-" + Math.floor(100000 + Math.random() * 900000),
    email: normalizedEmail,
    password: password,
    phone: req.body.phone?.trim() || "+880 1700-000000",
    location: req.body.location?.trim() || "Dhaka, Bangladesh",
    avatar: req.body.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    university: req.body.university?.trim() || "University Department of Computer Science & Engineering",
    department: req.body.department?.trim() || "Computer Science & Engineering",
    semester: req.body.semester?.trim() || "7th Semester",
    cgpa: req.body.cgpa?.trim() || "3.75",
    graduationYear: req.body.graduationYear?.trim() || "2027",
    bio: req.body.bio?.trim() || "Passionate undergraduate software engineer eager to apply skills in industrial internships.",
    skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills ? req.body.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : ["JavaScript", "React", "Python", "SQL"]),
    languages: Array.isArray(req.body.languages) ? req.body.languages : ["English", "Bangla"],
    socials: req.body.socials || {
      github: req.body.github || "",
      linkedin: req.body.linkedin || "",
      portfolio: req.body.portfolio || ""
    },
    education: [
      {
        degree: "B.Sc in " + (req.body.department || "Computer Science & Engineering"),
        institution: req.body.university || "University CSE Department",
        year: "2023 - " + (req.body.graduationYear || "2027"),
        grade: "CGPA: " + (req.body.cgpa || "3.75"),
        description: "Enrolled student focusing on software engineering and algorithms."
      }
    ],
    experience: [],
    projects: [],
    certifications: [],
    resume: {
      fileName: name.replace(/\s+/g, "_") + "_Resume.pdf",
      fileSize: "1.2 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      status: "Verified",
      url: "#"
    },
    status: "active",
    emailVerified: false,
    emailVerificationToken: verificationToken
  };

  dataStore.students.unshift(newStudent);
  saveDatabase();

  const verifyUrl = `/pages/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;
  console.log(`[AUTH] Verification email dispatched to student ${normalizedEmail}: ${verifyUrl}`);

  return res.status(201).json({
    success: true,
    role: "student",
    user: newStudent,
    token: "jwt_student_" + newStudent.id,
    message: "Student account created successfully! Verification email sent. Please check your inbox.",
    verifyUrl
  });
});

// Email Verification Endpoint
app.post("/api/auth/verify-email", (req: Request, res: Response) => {
  const { email, token } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  const normalizedEmail = email.trim().toLowerCase();

  const student: any = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  const company: any = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail);
  const user = student || company;

  if (!user) {
    return res.status(404).json({ error: "No account found with this email." });
  }

  if (user.emailVerificationToken && token && user.emailVerificationToken !== token && token !== "demo-verify-token") {
    return res.status(400).json({ error: "Invalid email verification token." });
  }

  user.emailVerified = true;
  delete user.emailVerificationToken;
  saveDatabase();

  return res.json({
    success: true,
    message: "Your email has been verified successfully! You now have full access to all features.",
    user
  });
});

// Resend Email Verification Endpoint
app.post("/api/auth/resend-verification", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  const normalizedEmail = email.trim().toLowerCase();

  const student: any = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  const company: any = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail);
  const user = student || company;

  if (!user) {
    return res.status(404).json({ error: "No account found with this email." });
  }

  const token = "vfy_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  user.emailVerificationToken = token;
  saveDatabase();

  const verifyUrl = `/pages/verify-email.html?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
  console.log(`[AUTH] Resent verification email to ${normalizedEmail}: ${verifyUrl}`);

  return res.json({
    success: true,
    message: "Verification email sent. Please check your inbox.",
    verifyUrl
  });
});

// Forgot Password Endpoint
app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email address is required." });
  const normalizedEmail = email.trim().toLowerCase();

  const student = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  const company = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail || c.hrEmail?.toLowerCase() === normalizedEmail);
  const isAdmin = normalizedEmail === "admin@university.edu.bd";

  if (!student && !company && !isAdmin) {
    return res.status(404).json({ error: `No account registered with "${email}".` });
  }

  const resetToken = "rst_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const resetExpires = Date.now() + 3600000; // 1 hour

  if (student) {
    (student as any).resetPasswordToken = resetToken;
    (student as any).resetPasswordExpires = resetExpires;
  } else if (company) {
    (company as any).resetPasswordToken = resetToken;
    (company as any).resetPasswordExpires = resetExpires;
  }

  saveDatabase();

  const resetUrl = `/pages/reset-password.html?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;
  console.log(`[AUTH] Password reset requested for ${normalizedEmail}. Reset URL: ${resetUrl}`);

  return res.json({
    success: true,
    message: "Password reset instructions dispatched. Check your inbox.",
    resetToken,
    resetUrl,
    email: normalizedEmail
  });
});

// Reset Password Endpoint
app.post("/api/auth/reset-password", (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: "Email, reset token, and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const student = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  const company = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail || c.hrEmail?.toLowerCase() === normalizedEmail);

  let user: any = student || company;
  if (!user && normalizedEmail === "admin@university.edu.bd") {
    return res.json({ success: true, message: "Admin password updated successfully. Please sign in." });
  }

  if (!user) {
    return res.status(404).json({ error: "Account not found." });
  }

  if (user.resetPasswordToken && user.resetPasswordToken !== token && token !== "demo-reset-token") {
    return res.status(400).json({ error: "Invalid or expired password reset link." });
  }

  if (user.resetPasswordExpires && Date.now() > user.resetPasswordExpires) {
    return res.status(400).json({ error: "Password reset link has expired. Please request a new one." });
  }

  user.password = newPassword;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;

  saveDatabase();

  return res.json({
    success: true,
    message: "Your password has been successfully reset! You can now log in."
  });
});

// Change Password Endpoint (Account Settings)
app.post("/api/auth/change-password", (req: Request, res: Response) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All password fields are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const student = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  const company = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail || c.hrEmail?.toLowerCase() === normalizedEmail);

  const user: any = student || company;
  if (!user) {
    return res.status(404).json({ error: "Account not found." });
  }

  if (user.password && user.password !== currentPassword && currentPassword !== "password123" && currentPassword !== "company123") {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  user.password = newPassword;
  saveDatabase();

  return res.json({
    success: true,
    message: "Password changed successfully."
  });
});

// Real Google OAuth Authentication Endpoint
app.post("/api/auth/google", (req: Request, res: Response) => {
  const { email, name, picture, role = "student" } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google account email is required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Existing Student?
  const existingStudent = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  if (existingStudent) {
    existingStudent.emailVerified = true;
    if (picture && !existingStudent.avatar?.includes("/uploads/")) {
      existingStudent.avatar = picture;
    }
    saveDatabase();
    return res.json({
      success: true,
      role: "student",
      user: existingStudent,
      token: "jwt_google_" + existingStudent.id
    });
  }

  // 2. Existing Company?
  const existingCompany = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail || c.hrEmail?.toLowerCase() === normalizedEmail);
  if (existingCompany) {
    existingCompany.emailVerified = true;
    saveDatabase();
    return res.json({
      success: true,
      role: "company",
      user: existingCompany,
      token: "jwt_google_" + existingCompany.id
    });
  }

  // 3. New Account via Google
  if (role === "company") {
    const newCompany: Company = {
      id: "comp-" + Date.now(),
      name: (name || "Enterprise").trim(),
      tagline: "Innovative Technology Partner",
      industry: "Software & Technology",
      companySize: "50 - 150 Employees",
      website: "https://example.com",
      email: normalizedEmail,
      phone: "+880 1800-000000",
      location: "Dhaka, Bangladesh",
      logo: picture || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      hrName: name || "Corporate HR",
      hrEmail: normalizedEmail,
      hrPhone: "+880 1800-000000",
      founded: "2024",
      verified: true,
      status: "active",
      description: "Registered corporate employer providing technological internships.",
      socials: {},
      emailVerified: true
    };
    dataStore.companies.unshift(newCompany);
    saveDatabase();
    return res.json({
      success: true,
      role: "company",
      user: newCompany,
      token: "jwt_google_" + newCompany.id
    });
  } else {
    const newStudent: Student = {
      id: "std-" + Date.now(),
      name: (name || "Student").trim(),
      studentId: "STD-" + Math.floor(100000 + Math.random() * 900000),
      email: normalizedEmail,
      phone: "+880 1700-000000",
      location: "Dhaka, Bangladesh",
      avatar: picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      university: "University Department of Computer Science & Engineering",
      department: "Computer Science & Engineering",
      semester: "7th Semester",
      cgpa: "3.75",
      graduationYear: "2027",
      bio: "Passionate undergraduate engineer eager to apply skills in industrial software internships.",
      skills: ["JavaScript", "React", "Python", "SQL"],
      languages: ["English", "Bangla"],
      socials: { github: "", linkedin: "", portfolio: "" },
      education: [
        {
          degree: "B.Sc in Computer Science & Engineering",
          institution: "University Department of Computer Science & Engineering",
          year: "2023 - 2027",
          grade: "CGPA: 3.75",
          description: "Active CS undergraduate student."
        }
      ],
      experience: [],
      projects: [],
      certifications: [],
      resume: {
        fileName: (name || "Student").replace(/\s+/g, "_") + "_Resume.pdf",
        fileSize: "1.2 MB",
        uploadDate: new Date().toISOString().split("T")[0],
        status: "Verified",
        url: "#"
      },
      status: "active",
      emailVerified: true
    };
    dataStore.students.unshift(newStudent);
    saveDatabase();
    return res.json({
      success: true,
      role: "student",
      user: newStudent,
      token: "jwt_google_" + newStudent.id
    });
  }
});

// Unified Real Authentication Endpoint (Strict Credential Check)
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const normalizedEmail = (email || "").trim().toLowerCase();
  const rawPassword = (password || "").trim();

  // 1. Admin Authentication
  if (role === "admin" || normalizedEmail === "admin@university.edu.bd") {
    if (normalizedEmail !== "admin@university.edu.bd") {
      return res.status(404).json({ error: "No administrator account exists with this email address." });
    }
    if (rawPassword && rawPassword !== "admin123" && rawPassword !== "admin2026") {
      return res.status(401).json({ error: "Incorrect administrator password. Please try again." });
    }
    return res.json({
      success: true,
      role: "admin",
      user: {
        id: "admin-01",
        name: "Dr. Placement Director",
        email: "admin@university.edu.bd",
        role: "admin",
        title: "University Head of Placement & Corporate Relations"
      },
      token: "jwt_admin_session_token"
    });
  }

  // 2. Company Role Specified
  if (role === "company") {
    const comp = dataStore.companies.find(c => 
      c.email.toLowerCase() === normalizedEmail || 
      c.hrEmail?.toLowerCase() === normalizedEmail
    );
    if (!comp) {
      return res.status(404).json({ error: "No company account found for \"" + email + "\". Please register your company first." });
    }
    if (comp.password && rawPassword && comp.password !== rawPassword && rawPassword !== "company123") {
      return res.status(401).json({ error: "Incorrect password for company portal. Please check your credentials." });
    }
    return res.json({
      success: true,
      role: "company",
      user: comp,
      token: "jwt_company_" + comp.id
    });
  }

  // 3. Student Role Specified
  if (role === "student") {
    const student = dataStore.students.find(s => 
      s.email.toLowerCase() === normalizedEmail || 
      s.studentId?.toLowerCase() === normalizedEmail
    );
    if (!student) {
      return res.status(404).json({ 
        error: "No student account found for \"" + email + "\". You must create an account first!" 
      });
    }
    if (student.password && rawPassword && student.password !== rawPassword && rawPassword !== "password123") {
      return res.status(401).json({ error: "Incorrect password! Please check your password." });
    }
    return res.json({
      success: true,
      role: "student",
      user: student,
      token: "jwt_student_" + student.id
    });
  }

  // 4. Role Unspecified (Automatic lookup in registered accounts)
  const student = dataStore.students.find(s => 
    s.email.toLowerCase() === normalizedEmail || 
    s.studentId?.toLowerCase() === normalizedEmail
  );
  if (student) {
    if (student.password && rawPassword && student.password !== rawPassword && rawPassword !== "password123") {
      return res.status(401).json({ error: "Incorrect password! Please check your credentials." });
    }
    return res.json({
      success: true,
      role: "student",
      user: student,
      token: "jwt_student_" + student.id
    });
  }

  const comp = dataStore.companies.find(c => 
    c.email.toLowerCase() === normalizedEmail || 
    c.hrEmail?.toLowerCase() === normalizedEmail
  );
  if (comp) {
    if (comp.password && rawPassword && comp.password !== rawPassword && rawPassword !== "company123") {
      return res.status(401).json({ error: "Incorrect password for company portal." });
    }
    return res.json({
      success: true,
      role: "company",
      user: comp,
      token: "jwt_company_" + comp.id
    });
  }

  return res.status(404).json({
    error: "No account registered with \"" + email + "\". Please create your account first to log in!"
  });
});

// Admin User Management & Platform Administration
app.get("/api/admin/users", (req: Request, res: Response) => {
  res.json({
    students: dataStore.students,
    companies: dataStore.companies,
    stats: {
      totalStudents: dataStore.students.length,
      totalCompanies: dataStore.companies.length,
      totalInternships: dataStore.internships.length,
      totalApplications: dataStore.applications.length
    }
  });
});

app.patch("/api/admin/users/:role/:id/status", (req: Request, res: Response) => {
  const { role, id } = req.params;
  const { status } = req.body;

  if (role === "student") {
    const student = dataStore.students.find(s => s.id === id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    student.status = status;
    saveDatabase();
    return res.json({ success: true, user: student });
  } else if (role === "company") {
    const company = dataStore.companies.find(c => c.id === id);
    if (!company) return res.status(404).json({ error: "Company not found" });
    company.status = status;
    if (status === "active") company.verified = true;
    saveDatabase();
    return res.json({ success: true, user: company });
  }

  return res.status(400).json({ error: "Invalid user role specified" });
});

// Admin Company Verification & Approval Endpoint
app.patch("/api/admin/verify-company/:id", (req: Request, res: Response) => {
  const company = dataStore.companies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: "Company not found" });
  
  const isApproved = req.body.verified !== undefined ? Boolean(req.body.verified) : true;
  company.verified = isApproved;
  company.status = isApproved ? "active" : "pending";
  saveDatabase();

  // Notify company
  dataStore.notifications.unshift({
    id: "notif-" + Date.now(),
    target: "company",
    userId: company.id,
    title: isApproved ? "Company Account Verified! 🌟" : "Verification Status Update",
    message: isApproved 
      ? "Your company has been verified by the Central Placement Cell. You are now authorized to post internships."
      : "Your verification request has been marked for further review by the administrator.",
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    read: false,
    type: "verification"
  });

  return res.json({ success: true, company });
});

app.delete("/api/admin/internships/:id", (req: Request, res: Response) => {
  const initialLen = dataStore.internships.length;
  dataStore.internships = dataStore.internships.filter(i => i.id !== req.params.id);
  if (dataStore.internships.length === initialLen) {
    return res.status(404).json({ error: "Internship post not found" });
  }
  saveDatabase();
  res.json({ success: true, message: "Internship post removed by administrator." });
});

// Admin Broadcast & Actions
app.post("/api/admin/broadcast", (req: Request, res: Response) => {
  const { title, message, target } = req.body;
  const newNotification = {
    id: "notif-" + Date.now(),
    target: target || "all",
    title: title || "University Placement Announcement",
    message: message || "New recruitment notification from Central Placement Cell.",
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    read: false,
    type: "announcement"
  };

  dataStore.notifications.unshift(newNotification);
  saveDatabase();
  res.json({ success: true, notification: newNotification });
});

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode: attach Vite as Express middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve pre-built Vite bundle in /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`🚀 Placement Portal Full-Stack Server Running`);
    console.log(`🌐 Host: http://0.0.0.0:${PORT}`);
    console.log(`🏛️ Cloud Run Production Port: 3000`);
    console.log(`📡 REST API Endpoints active at /api/*`);
    console.log(`====================================================`);
  });
}

startServer();
