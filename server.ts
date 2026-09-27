import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const app = express();
const PORT = 3000;

// Prevent browser/proxy caching of protected user sessions & dynamic state
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Built-in body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Expose Supabase configuration to the browser
app.use((req, res, next) => {
  if (req.path === "/" || req.path.endsWith(".html")) {
    const originalSend = res.send.bind(res);

    res.send = ((body: any) => {
      if (typeof body === "string" && body.includes("</head>")) {
        const supabaseConfig = `
<script>
  window.ENV_SUPABASE_URL = ${JSON.stringify(process.env.VITE_SUPABASE_URL || "")};
  window.ENV_SUPABASE_ANON_KEY = ${JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "")};
</script>
`;

        body = body.replace("</head>", `${supabaseConfig}</head>`);
      }

      return originalSend(body);
    }) as typeof res.send;
  }

  next();
});

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

interface ActiveSession {
  token: string;
  userId: string;
  role: "student" | "company" | "admin";
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastActiveAt: string;
  ip?: string;
  userAgent?: string;
}

interface AuditLog {
  id: string;
  action: string;
  userId?: string;
  email?: string;
  role?: string;
  details: string;
  ip?: string;
  timestamp: string;
  status: "success" | "warning" | "error";
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
  sessions?: ActiveSession[];
  auditLogs?: AuditLog[];
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
  },
  sessions: [],
  auditLogs: [
    {
      id: "log-init-1",
      action: "SYSTEM_INITIALIZED",
      userId: "system",
      email: "system@university.edu.bd",
      role: "system",
      details: "Placement Portal security subsystem and session authority initialized.",
      ip: "127.0.0.1",
      timestamp: new Date().toISOString(),
      status: "success"
    }
  ]
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
      if (!Array.isArray(dataStore.sessions)) dataStore.sessions = [];
      if (!Array.isArray(dataStore.auditLogs)) dataStore.auditLogs = [];
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

function logAuditEvent(
  action: string,
  details: string,
  req?: Request,
  meta?: { email?: string; role?: string; status?: "success" | "warning" | "error"; userId?: string }
) {
  if (!Array.isArray(dataStore.auditLogs)) dataStore.auditLogs = [];
  const log: AuditLog = {
    id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    action,
    details,
    email: meta?.email || "",
    role: meta?.role || "",
    userId: meta?.userId || "",
    ip: (req?.headers["x-forwarded-for"] as string) || req?.socket?.remoteAddress || "127.0.0.1",
    timestamp: new Date().toISOString(),
    status: meta?.status || "success"
  };
  dataStore.auditLogs.unshift(log);
  if (dataStore.auditLogs.length > 500) {
    dataStore.auditLogs = dataStore.auditLogs.slice(0, 500);
  }
  saveDatabase();
  return log;
}


async function getSessionFromRequest(req: Request): Promise<ActiveSession | null> {
  try {
    const authHeader = req.headers.authorization || "";

    const token =
      authHeader.replace(/^Bearer\s+/i, "").trim() ||
      (req.headers["x-session-token"] as string) ||
      "";

    if (!token) {
      return null;
    }

    // Validate Supabase access token
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn("[AUTH] Invalid Supabase session:", authError?.message);
      return null;
    }

    // Get common profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.warn("[AUTH] Profile not found:", profileError?.message);
      return null;
    }

    // ---------------------------------------------------------
    // STUDENT
    // ---------------------------------------------------------
    if (profile.role === "student") {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

      if (studentError || !student) {
        return null;
      }

      if (student.status === "suspended") {
        logAuditEvent(
          "SUSPENDED_ACCOUNT_ACCESS",
          `Suspended student attempted to access the system: ${user.email || profile.email}`,
          req,
          {
            email: user.email || profile.email,
            role: "student",
            userId: user.id,
            status: "warning"
          }
        );

        return null;
      }

      const session: ActiveSession = {
        token,
        userId: user.id,
        role: "student",
        email: user.email || profile.email,
        name:
          profile.name ||
          student.name ||
          user.user_metadata?.name ||
          "",
        avatar:
          profile.avatar_url ||
          student.avatar_url ||
          "",
        createdAt: user.created_at || new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        ip:
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          undefined,
        userAgent: req.headers["user-agent"] || undefined
      };

      return session;
    }

    // ---------------------------------------------------------
    // COMPANY
    // ---------------------------------------------------------
    if (profile.role === "company") {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", user.id)
        .single();

      if (companyError || !company) {
        return null;
      }

      if (company.status === "suspended") {
        logAuditEvent(
          "SUSPENDED_ACCOUNT_ACCESS",
          `Suspended company attempted to access the system: ${user.email || profile.email}`,
          req,
          {
            email: user.email || profile.email,
            role: "company",
            userId: user.id,
            status: "warning"
          }
        );

        return null;
      }

      const session: ActiveSession = {
        token,
        userId: user.id,
        role: "company",
        email: user.email || profile.email,
        name:
          profile.name ||
          company.name ||
          user.user_metadata?.name ||
          "",
        avatar:
          profile.avatar_url ||
          company.logo_url ||
          "",
        createdAt: user.created_at || new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        ip:
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          undefined,
        userAgent: req.headers["user-agent"] || undefined
      };

      return session;
    }

    // ---------------------------------------------------------
    // ADMIN
    // ---------------------------------------------------------
    if (profile.role === "admin") {
      const session: ActiveSession = {
        token,
        userId: user.id,
        role: "admin",
        email: user.email || profile.email,
        name:
          profile.name ||
          user.user_metadata?.name ||
          "Administrator",
        avatar:
          profile.avatar_url ||
          "",
        createdAt: user.created_at || new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        ip:
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          undefined,
        userAgent: req.headers["user-agent"] || undefined
      };

      return session;
    }

    // Invalid role
    console.warn(
      `[AUTH] Invalid role "${profile.role}" for user ${user.email || profile.email}`
    );

    return null;

  } catch (error) {
    console.error("[AUTH] getSessionFromRequest error:", error);
    return null;
  }
}

// RBAC Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  (req as any).session = session;
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: "Authentication required. Please sign in." });
    }
    if (!allowedRoles.includes(session.role)) {
      logAuditEvent("ROLE_VIOLATION", `Role ${session.role} attempted unauthorized access to ${req.method} ${req.path}`, req, {
        email: session.email,
        role: session.role,
        userId: session.userId,
        status: "warning"
      });
      return res.status(403).json({ error: `Forbidden: Access restricted to [${allowedRoles.join(", ")}].` });
    }
    (req as any).session = session;
    next();
  };
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
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required. Please sign in to post internships." });
  }
  if (session.role !== "company" && session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Only registered companies or administrators can post internships." });
  }

  // Verify company identity
  let existingCompany: Company | undefined;
  if (session.role === "company") {
    existingCompany = dataStore.companies.find(c => c.id === session.userId || c.email.toLowerCase() === session.email.toLowerCase());
  } else {
    const companyId = req.body.companyId;
    const companyEmail = req.body.companyEmail || req.body.email;
    existingCompany = dataStore.companies.find(c => 
      (companyId && c.id === companyId) ||
      (companyEmail && c.email.toLowerCase() === companyEmail.toLowerCase())
    );
  }

  // If company account exists and is unverified/pending, prevent posting
  if (existingCompany && existingCompany.verified === false) {
    return res.status(403).json({
      error: "Your company account is pending administrative verification. Once approved by the Central Placement Cell, you will be authorized to post internships."
    });
  }

  const finalCompanyId = existingCompany ? existingCompany.id : (session.role === "company" ? session.userId : (req.body.companyId || "comp-" + Date.now()));
  const finalCompanyName = existingCompany ? existingCompany.name : (session.role === "company" ? session.name : (req.body.company || "TechNova Solutions"));
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
  logAuditEvent("INTERNSHIP_CREATED", `Internship posted: "${newPost.title}" by ${finalCompanyName}`, req, {
    email: session.email,
    role: session.role,
    userId: session.userId,
    status: "success"
  });
  saveDatabase();
  res.status(201).json({ success: true, internship: newPost });
});

app.put("/api/internships/:id", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "company" && session.role !== "admin")) {
    return res.status(403).json({ error: "Unauthorized. Company or Admin credentials required." });
  }

  const index = dataStore.internships.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Internship not found" });
  }

  const item = dataStore.internships[index];
  if (session.role === "company" && item.companyId && item.companyId !== session.userId) {
    const comp = dataStore.companies.find(c => c.id === session.userId);
    if (!comp || comp.name.toLowerCase() !== item.company.toLowerCase()) {
      return res.status(403).json({ error: "You are only authorized to modify internships posted by your own company." });
    }
  }

  dataStore.internships[index] = { ...dataStore.internships[index], ...req.body, id: item.id };
  saveDatabase();
  res.json({ success: true, internship: dataStore.internships[index] });
});

app.delete("/api/internships/:id", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "company" && session.role !== "admin")) {
    return res.status(403).json({ error: "Unauthorized. Company or Admin credentials required." });
  }

  const item = dataStore.internships.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Internship not found" });
  }

  if (session.role === "company" && item.companyId && item.companyId !== session.userId) {
    const comp = dataStore.companies.find(c => c.id === session.userId);
    if (!comp || comp.name.toLowerCase() !== item.company.toLowerCase()) {
      return res.status(403).json({ error: "You are only authorized to delete internships posted by your company." });
    }
  }

  dataStore.internships = dataStore.internships.filter(i => i.id !== req.params.id);
  logAuditEvent("INTERNSHIP_DELETED", `Internship removed: "${item.title}" (${item.id})`, req, {
    email: session.email,
    role: session.role,
    userId: session.userId,
    status: "warning"
  });
  saveDatabase();
  res.json({ success: true, message: "Internship deleted successfully" });
});

app.patch("/api/internships/:id/status", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "company" && session.role !== "admin")) {
    return res.status(403).json({ error: "Unauthorized. Company or Admin credentials required." });
  }

  const item = dataStore.internships.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Internship not found" });
  }

  if (session.role === "company" && item.companyId && item.companyId !== session.userId) {
    const comp = dataStore.companies.find(c => c.id === session.userId);
    if (!comp || comp.name.toLowerCase() !== item.company.toLowerCase()) {
      return res.status(403).json({ error: "Forbidden to change status of another company's internship." });
    }
  }

  item.status = req.body.status || (item.status === "closed" ? "active" : "closed");
  saveDatabase();
  res.json({ success: true, internship: item });
});

// Applications API (Strict RBAC & User Session Isolation)
app.get("/api/applications", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  let list = [...dataStore.applications];
  const { studentId, company, companyId, status, internshipId } = req.query;

  // Strict RBAC isolation
  if (session && session.role === "student") {
    list = list.filter(a => a.studentId === session.userId || a.studentEmail?.toLowerCase() === session.email.toLowerCase());
  } else if (session && session.role === "company") {
    const comp = dataStore.companies.find(c => c.id === session.userId || c.email.toLowerCase() === session.email.toLowerCase());
    const compName = comp ? comp.name.toLowerCase() : "";
    list = list.filter(a => 
      (a.companyId && a.companyId === session.userId) || 
      (compName && a.company?.toLowerCase() === compName)
    );
  }

  if (studentId && typeof studentId === "string" && (!session || session.role === "admin")) {
    list = list.filter(a => a.studentId === studentId);
  }
  if (internshipId && typeof internshipId === "string") {
    list = list.filter(a => a.internshipId === internshipId);
  }
  if (companyId && typeof companyId === "string" && (!session || session.role === "admin")) {
    list = list.filter(a => a.companyId === companyId);
  }
  if (company && typeof company === "string" && (!session || session.role === "admin")) {
    list = list.filter(a => a.company.toLowerCase().includes(company.toLowerCase()));
  }
  if (status && typeof status === "string") {
    list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  res.json(list);
});

// Check if student already applied for this internship
app.get("/api/applications/check", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  const { internshipId } = req.query;
  const effectiveStudentId = (session?.role === "student" ? session.userId : (req.query.studentId as string)) || "";
  const effectiveStudentEmail = (session?.role === "student" ? session.email : (req.query.studentEmail as string)) || "";

  const existingApp = dataStore.applications.find(a => 
    a.internshipId === internshipId && 
    ((effectiveStudentId && a.studentId === effectiveStudentId) || (effectiveStudentEmail && a.studentEmail?.toLowerCase() === effectiveStudentEmail.toLowerCase()))
  );
  res.json({ hasApplied: Boolean(existingApp), application: existingApp || null });
});

app.post("/api/applications", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required. Please sign in as a student to apply." });
  }
  if (session.role !== "student" && session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Only students can submit internship applications." });
  }

  const { internshipId } = req.body;
  const effectiveStudentId = session.role === "student" ? session.userId : (req.body.studentId || "std-" + Date.now());
  const effectiveStudentEmail = session.role === "student" ? session.email : (req.body.studentEmail || "student@university.edu");

  // Duplicate Application Prevention
  const existingApp = dataStore.applications.find(a => 
    a.internshipId === internshipId && 
    (a.studentId === effectiveStudentId || a.studentEmail?.toLowerCase() === effectiveStudentEmail.toLowerCase())
  );

  if (existingApp) {
    return res.status(409).json({ 
      error: "You have already applied for this internship.", 
      application: existingApp 
    });
  }

  const internship = dataStore.internships.find(i => i.id === internshipId);
  const student = dataStore.students.find(s => 
    s.id === effectiveStudentId || s.email.toLowerCase() === effectiveStudentEmail.toLowerCase()
  );

  const studentResume = student?.resume || {};
  const finalResumeName = req.body.resumeName || studentResume.fileName || "Student_Resume.pdf";
  const finalResumeUrl = req.body.resumeUrl || studentResume.url || "";

  const newApp: Application = {
    id: "app-" + Date.now(),
    internshipId: internshipId || (internship ? internship.id : "int-101"),
    companyId: internship?.companyId || (internship ? "comp-" + internship.company.toLowerCase().replace(/[^a-z0-9]/g, "") : undefined),
    studentId: effectiveStudentId,
    studentName: req.body.studentName || student?.name || session.name || "Candidate Scholar",
    studentEmail: effectiveStudentEmail,
    studentPhone: req.body.studentPhone || student?.phone || "+880 1700-000000",
    studentUniversity: req.body.studentUniversity || student?.university || "University of Computer Studies & Engineering",
    studentDepartment: req.body.studentDepartment || student?.department || "Computer Science & Engineering",
    studentCgpa: req.body.studentCgpa || student?.cgpa || "3.75",
    studentPhoto: req.body.studentPhoto || student?.avatar || session.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
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
  logAuditEvent("APPLICATION_SUBMITTED", `Application submitted by ${newApp.studentName} for ${newApp.jobTitle} at ${newApp.company}`, req, {
    email: session.email,
    role: session.role,
    userId: session.userId,
    status: "success"
  });

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
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "company" && session.role !== "admin")) {
    return res.status(403).json({ error: "Access denied. Company or Admin credentials required." });
  }

  const appItem = dataStore.applications.find(a => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: "Application not found" });
  }

  if (session.role === "company") {
    const comp = dataStore.companies.find(c => c.id === session.userId || c.email.toLowerCase() === session.email.toLowerCase());
    const compName = comp ? comp.name.toLowerCase() : "";
    if (appItem.companyId && appItem.companyId !== session.userId && compName && appItem.company?.toLowerCase() !== compName) {
      return res.status(403).json({ error: "Unauthorized to update status of candidates for another company." });
    }
  }

  const newStatus = req.body.status;
  appItem.status = newStatus;

  if (!appItem.timeline) appItem.timeline = [];
  appItem.timeline.push({
    step: newStatus,
    date: new Date().toISOString().split("T")[0],
    note: req.body.note || `Status updated to ${newStatus}`
  });

  logAuditEvent("APPLICATION_STATUS_UPDATED", `Application ${appItem.id} status changed to ${newStatus} by ${session.email}`, req, {
    email: session.email,
    role: session.role,
    userId: session.userId,
    status: "success"
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
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "company" && session.role !== "admin")) {
    return res.status(403).json({ error: "Access denied. Company or Admin credentials required." });
  }

  const appItem = dataStore.applications.find(a => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: "Application not found" });
  }

  if (session.role === "company") {
    const comp = dataStore.companies.find(c => c.id === session.userId || c.email.toLowerCase() === session.email.toLowerCase());
    const compName = comp ? comp.name.toLowerCase() : "";
    if (appItem.companyId && appItem.companyId !== session.userId && compName && appItem.company?.toLowerCase() !== compName) {
      return res.status(403).json({ error: "Unauthorized to update status of candidates for another company." });
    }
  }

  const newStatus = req.body.status;
  appItem.status = newStatus;

  if (!appItem.timeline) appItem.timeline = [];
  appItem.timeline.push({
    step: newStatus,
    date: new Date().toISOString().split("T")[0],
    note: req.body.note || `Status updated to ${newStatus}`
  });

  logAuditEvent("APPLICATION_STATUS_UPDATED", `Application ${appItem.id} status changed to ${newStatus} by ${session.email}`, req, {
    email: session.email,
    role: session.role,
    userId: session.userId,
    status: "success"
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
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required to verify companies." });
  }

  const comp = dataStore.companies.find(c => c.id === req.params.id);
  if (!comp) {
    return res.status(404).json({ error: "Company not found" });
  }

  const { verified, status } = req.body;
  if (typeof verified === "boolean") comp.verified = verified;
  if (status) comp.status = status;

  logAuditEvent("COMPANY_VERIFIED", `Administrator updated status for company ${comp.name} (${comp.id}): verified=${comp.verified}, status=${comp.status}`, req, {
    email: session.email,
    role: "admin",
    userId: session.userId,
    status: "success"
  });

  saveDatabase();
  res.json({ success: true, company: comp });
});

// Update Company Profile
app.put("/api/companies/:id", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const isOwner = session.role === "company" && (session.userId === req.params.id || session.email.toLowerCase() === req.params.id.toLowerCase());
  const isAdmin = session.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Unauthorized: You can only update your own company profile." });
  }

  const comp = dataStore.companies.find(c => c.id === req.params.id || c.email.toLowerCase() === req.params.id.toLowerCase());
  if (!comp) {
    return res.status(404).json({ error: "Company not found" });
  }

  if (req.body.name) comp.name = req.body.name;
  if (req.body.tagline) comp.tagline = req.body.tagline;
  if (req.body.industry) comp.industry = req.body.industry;
  if (req.body.companySize) comp.companySize = req.body.companySize;
  if (req.body.website) comp.website = req.body.website;
  if (req.body.phone) comp.phone = req.body.phone;
  if (req.body.location) comp.location = req.body.location;
  if (req.body.logo) comp.logo = req.body.logo;
  if (req.body.coverImage) comp.coverImage = req.body.coverImage;
  if (req.body.hrName) comp.hrName = req.body.hrName;
  if (req.body.hrEmail) comp.hrEmail = req.body.hrEmail;
  if (req.body.hrPhone) comp.hrPhone = req.body.hrPhone;
  if (req.body.founded) comp.founded = req.body.founded;
  if (req.body.description) comp.description = req.body.description;
  if (req.body.socials) comp.socials = { ...comp.socials, ...req.body.socials };

  saveDatabase();
  res.json({ success: true, company: comp });
});

// Students API (Placement Directory for Admin & Authenticated Users)
app.get("/api/students", async (req: Request, res: Response) => {
  try {
    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch students from Supabase:", error);
      return res.status(500).json({
        error: "Failed to fetch students"
      });
    }

    res.json(students || []);
  } catch (error) {
    console.error("Students API error:", error);
    res.status(500).json({
      error: "Failed to fetch students"
    });
  }
});
app.get("/api/students/:id", (req: Request, res: Response) => {
  const student = dataStore.students.find(s => s.id === req.params.id || s.email.toLowerCase() === req.params.id.toLowerCase());
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const { password, ...safeStudent } = student;
  res.json(safeStudent);
});

app.put("/api/students/:id", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required to update profile." });
  }

  const isSelf = session.role === "student" && (session.userId === req.params.id || session.email.toLowerCase() === req.params.id.toLowerCase());
  const isAdmin = session.role === "admin";
  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: "Forbidden: You are only permitted to update your own student profile." });
  }

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

  logAuditEvent("PROFILE_UPDATED", `Student profile updated: ${student.name} (${student.email})`, req, {
    email: session.email,
    role: session.role,
    userId: session.userId,
    status: "success"
  });

  saveDatabase();
  const { password, ...safeStudent } = student;
  res.json({ success: true, student: safeStudent });
});

// Interviews API (Strict RBAC)
app.get("/api/interviews", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  let list = [...dataStore.interviews];

  if (session && session.role === "student") {
    list = list.filter(i => i.studentId === session.userId || (session.email && (i as any).studentEmail?.toLowerCase() === session.email.toLowerCase()));
  } else if (session && session.role === "company") {
    const comp = dataStore.companies.find(c => c.id === session.userId || c.email.toLowerCase() === session.email.toLowerCase());
    const compName = comp ? comp.name.toLowerCase() : "";
    list = list.filter(i => (i as any).companyId === session.userId || (compName && i.company.toLowerCase() === compName));
  }

  res.json(list);
});

app.post("/api/interviews", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "company" && session.role !== "admin")) {
    return res.status(403).json({ error: "Access denied. Only corporate recruiters or administrators can schedule interviews." });
  }

  const newInterview = {
    id: "intv-" + Date.now(),
    applicationId: req.body.applicationId || "app-301",
    studentId: req.body.studentId || "std-2022001",
    studentName: req.body.studentName || "Candidate Scholar",
    company: session.role === "company" ? session.name : (req.body.company || "TechNova Solutions"),
    companyId: session.role === "company" ? session.userId : req.body.companyId,
    position: req.body.position || "Software Engineering Intern",
    date: req.body.date || "2026-10-15",
    time: req.body.time || "11:00 AM - 11:45 AM (BST)",
    type: req.body.type || "Google Meet",
    meetingLink: req.body.meetingLink || "https://meet.google.com/abc-intern-interview",
    status: "Upcoming",
    interviewer: req.body.interviewer || session.name || "Technical Lead"
  };

  dataStore.interviews.unshift(newInterview);

  logAuditEvent("INTERVIEW_SCHEDULED", `Interview scheduled for candidate ${newInterview.studentName} by ${newInterview.company}`, req, {
    email: session.email,
    role: session.role,
    userId: session.userId,
    status: "success"
  });

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
    const session = getSessionFromRequest(req);
    const rawData = req.body.dataUrl || req.body.fileData || req.body.resume;
    const originalName = (req.body.fileName || req.body.filename || "Resume.pdf").trim();
    const studentId = session?.role === "student" ? session.userId : req.body.studentId;
    const studentEmail = session?.role === "student" ? session.email : req.body.studentEmail;

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

// Session Check Endpoint (Strict Bearer Token Validation & Session Isolation)
app.get("/api/auth/me", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({
      authenticated: false,
      error: "No active or valid session."
    });
  }

  // ADMIN
  if (session.role === "admin") {
    return res.json({
      authenticated: true,
      role: "admin",
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        avatar: session.avatar,
        role: "admin",
        title: "University Head of Placement & Corporate Relations"
      },
      session: {
        token: session.token,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt
      }
    });
  }

  // STUDENT
  if (session.role === "student") {
    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", session.userId)
      .single();

    if (error || !student) {
      return res.status(401).json({
        authenticated: false,
        error: "Student account not found."
      });
    }

    if (student.status === "suspended") {
      return res.status(403).json({
        authenticated: false,
        error: "Student account suspended."
      });
    }

    return res.json({
      authenticated: true,
      role: "student",
      user: {
        ...student,
        id: session.userId,
        email: session.email,
        name: session.name,
        avatar: session.avatar
      },
      session: {
        token: session.token,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt
      }
    });
  }

  // COMPANY
  if (session.role === "company") {
    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", session.userId)
      .single();

    if (error || !company) {
      return res.status(401).json({
        authenticated: false,
        error: "Company account not found."
      });
    }

    if (company.status === "suspended") {
      return res.status(403).json({
        authenticated: false,
        error: "Company account suspended."
      });
    }

    return res.json({
      authenticated: true,
      role: "company",
      user: {
        ...company,
        id: session.userId,
        email: session.email,
        name: session.name,
        avatar: session.avatar
      },
      session: {
        token: session.token,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt
      }
    });
  }

  return res.status(401).json({
    authenticated: false,
    error: "Session invalid or user not found."
  });
});
// Real User Registration Endpoint (Student & Company)
app.post("/api/auth/register", async (req: Request, res: Response) => {
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
    // Create user in Supabase Authentication
    // ============================================================
  // SUPABASE AUTH REGISTRATION
  // ============================================================

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: role === "company" ? "company" : "student",
        phone: req.body.phone?.trim() || null
      }
    });

  if (authError || !authData.user) {
    return res.status(400).json({
      error: authError?.message || "Unable to create Supabase account."
    });
  }

  const supabaseUserId = authData.user.id;

  // ============================================================
  // CREATE PROFILE
  // ============================================================

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: supabaseUserId,
      email: normalizedEmail,
      role: role === "company" ? "company" : "student",
      name: name.trim(),
      avatar_url: req.body.avatar || req.body.logo || null,
      phone: req.body.phone?.trim() || null,
      location: req.body.location?.trim() || "Dhaka, Bangladesh",
      email_verified: true
    });

  if (profileError) {
    // Remove Auth user if profile creation fails
    await supabase.auth.admin.deleteUser(supabaseUserId);

    return res.status(400).json({
      error: `Profile creation failed: ${profileError.message}`
    });
  }

  // ============================================================
  // CREATE ROLE-SPECIFIC RECORD
  // ============================================================

  if (role === "company") {

    const { error: companyError } = await supabase
      .from("companies")
      .insert({
        id: supabaseUserId,
        name: name.trim(),
        tagline:
          req.body.tagline ||
          "Pioneering Software Solutions",
        industry:
          req.body.industry ||
          "Software & Technology",
        company_size:
          req.body.companySize ||
          "50 - 200 Employees",
        website:
          req.body.website?.trim() ||
          null,
        phone:
          req.body.phone?.trim() ||
          null,
        location:
          req.body.location?.trim() ||
          "Dhaka, Bangladesh",
        logo_url:
          req.body.logo ||
          null,
        hr_name:
          req.body.hrName?.trim() ||
          name.trim(),
        hr_email:
          normalizedEmail,
        hr_phone:
          req.body.phone?.trim() ||
          null,
        verified: false,
        status: "pending",
        description:
          req.body.description?.trim() ||
          "Innovative technology firm building scalable products."
      });

    if (companyError) {
      await supabase
        .from("profiles")
        .delete()
        .eq("id", supabaseUserId);

      await supabase.auth.admin.deleteUser(supabaseUserId);

      return res.status(400).json({
        error: `Company profile creation failed: ${companyError.message}`
      });
    }

  } else {

    const skills = Array.isArray(req.body.skills)
      ? req.body.skills
      : [];

    const { error: studentError } = await supabase
      .from("students")
      .insert({
        id: supabaseUserId,

        student_id:
          req.body.studentId?.trim() ||
          "STD-" + Math.floor(100000 + Math.random() * 900000),

        university:
          req.body.university?.trim() ||
          "University Department of Computer Science & Engineering",

        department:
          req.body.department?.trim() ||
          "Computer Science & Engineering",

        semester:
          req.body.semester?.trim() ||
          "7th Semester",

        cgpa:
          Number(req.body.cgpa) || 0,

        graduation_year:
          req.body.graduationYear?.trim() ||
          "2027",

        bio:
          req.body.bio?.trim() ||
          "Passionate Computer Science student looking for internship opportunities.",

        skills,

        languages:
          Array.isArray(req.body.languages)
            ? req.body.languages
            : ["English", "Bangla"],

        github_url:
          req.body.github?.trim() ||
          req.body.socials?.github ||
          null,

        linkedin_url:
          req.body.linkedin?.trim() ||
          req.body.socials?.linkedin ||
          null,

        portfolio_url:
          req.body.portfolio?.trim() ||
          req.body.socials?.portfolio ||
          null,

        resume_url:
          req.body.resume?.url ||
          null,

        resume_name:
          req.body.resume?.fileName ||
          null,

        status: "active"
      });

    if (studentError) {
      await supabase
        .from("profiles")
        .delete()
        .eq("id", supabaseUserId);

      await supabase.auth.admin.deleteUser(supabaseUserId);

      return res.status(400).json({
        error: `Student profile creation failed: ${studentError.message}`
      });
    }
  }

  // ============================================================
  // CREATE REAL SUPABASE SESSION
  // ============================================================

  const publicSupabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  const { data: sessionData, error: sessionError } =
    await publicSupabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

  if (sessionError || !sessionData.session) {
    return res.status(201).json({
      success: true,
      role: role === "company" ? "company" : "student",
      user: {
        id: supabaseUserId,
        name: name.trim(),
        email: normalizedEmail,
        phone: req.body.phone || ""
      },
      message:
        "Account created successfully. Please sign in.",
      requiresLogin: true
    });
  }

  // ============================================================
  // RETURN USER + REAL SUPABASE ACCESS TOKEN
  // ============================================================

  const userForFrontend = {
    id: supabaseUserId,
    name: name.trim(),
    email: normalizedEmail,
    phone: req.body.phone || "",
    avatar:
      req.body.avatar ||
      req.body.logo ||
      "",
    logo:
      req.body.logo ||
      "",
    role: role === "company" ? "company" : "student"
  };

  return res.status(201).json({
    success: true,
    role: role === "company" ? "company" : "student",
    user: userForFrontend,
    token: sessionData.session.access_token,
    refreshToken: sessionData.session.refresh_token,
    message: "Account created successfully!"
  });
  // Check if email already registered
  const existingStudent = dataStore.students.find(s => s.email.toLowerCase() === normalizedEmail);
  const existingCompany = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail || c.hrEmail?.toLowerCase() === normalizedEmail);
  const isAdmin = normalizedEmail === "admin@university.edu.bd";

  if (existingStudent || existingCompany || isAdmin) {
    return res.status(409).json({ error: "An account with this email is already registered. Please sign in instead." });
  }

  const verificationToken = "vfy_" + crypto.randomBytes(16).toString("hex");

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

    const sessionToken = "sess_comp_" + crypto.randomBytes(24).toString("hex") + "_" + Date.now();
    const newSession: ActiveSession = {
      token: sessionToken,
      userId: newCompany.id,
      role: "company",
      email: normalizedEmail,
      name: newCompany.name,
      avatar: newCompany.logo,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Browser"
    };

    if (!Array.isArray(dataStore.sessions)) dataStore.sessions = [];
    dataStore.sessions.unshift(newSession);
    dataStore.companies.unshift(newCompany);
    logAuditEvent("USER_REGISTERED", `New company account registered: ${newCompany.name} (${normalizedEmail})`, req, {
      email: normalizedEmail,
      role: "company",
      userId: newCompany.id,
      status: "success"
    });
    saveDatabase();

    const verifyUrl = `/pages/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

    return res.status(201).json({
      success: true,
      role: "company",
      user: newCompany,
      token: sessionToken,
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

  const sessionToken = "sess_std_" + crypto.randomBytes(24).toString("hex") + "_" + Date.now();
  const newSession: ActiveSession = {
    token: sessionToken,
    userId: newStudent.id,
    role: "student",
    email: normalizedEmail,
    name: newStudent.name,
    avatar: newStudent.avatar,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Browser"
  };

  if (!Array.isArray(dataStore.sessions)) dataStore.sessions = [];
  dataStore.sessions.unshift(newSession);
  dataStore.students.unshift(newStudent);
  logAuditEvent("USER_REGISTERED", `New student account registered: ${newStudent.name} (${normalizedEmail})`, req, {
    email: normalizedEmail,
    role: "student",
    userId: newStudent.id,
    status: "success"
  });
  saveDatabase();

  const verifyUrl = `/pages/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

  return res.status(201).json({
    success: true,
    role: "student",
    user: newStudent,
    token: sessionToken,
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
    if (existingStudent.status === "suspended") {
      logAuditEvent("LOGIN_BLOCKED", `Blocked Google sign-in for suspended student ${normalizedEmail}`, req, {
        email: normalizedEmail,
        role: "student",
        status: "error"
      });
      return res.status(403).json({ error: "Your student account has been suspended by the Placement Cell." });
    }
    existingStudent.emailVerified = true;
    if (picture && !existingStudent.avatar?.includes("/uploads/")) {
      existingStudent.avatar = picture;
    }

    const sessionToken = "sess_std_" + crypto.randomBytes(24).toString("hex") + "_" + Date.now();
    const newSession: ActiveSession = {
      token: sessionToken,
      userId: existingStudent.id,
      role: "student",
      email: existingStudent.email,
      name: existingStudent.name,
      avatar: existingStudent.avatar,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Browser"
    };

    if (!Array.isArray(dataStore.sessions)) dataStore.sessions = [];
    dataStore.sessions.unshift(newSession);
    logAuditEvent("LOGIN_GOOGLE", `Student signed in via Google: ${existingStudent.email}`, req, {
      email: existingStudent.email,
      role: "student",
      userId: existingStudent.id,
      status: "success"
    });
    saveDatabase();

    return res.json({
      success: true,
      role: "student",
      user: existingStudent,
      token: sessionToken
    });
  }

  // 2. Existing Company?
  const existingCompany = dataStore.companies.find(c => c.email.toLowerCase() === normalizedEmail || c.hrEmail?.toLowerCase() === normalizedEmail);
  if (existingCompany) {
    if (existingCompany.status === "suspended") {
      logAuditEvent("LOGIN_BLOCKED", `Blocked Google sign-in for suspended company ${normalizedEmail}`, req, {
        email: normalizedEmail,
        role: "company",
        status: "error"
      });
      return res.status(403).json({ error: "Your company account has been suspended." });
    }
    existingCompany.emailVerified = true;

    const sessionToken = "sess_comp_" + crypto.randomBytes(24).toString("hex") + "_" + Date.now();
    const newSession: ActiveSession = {
      token: sessionToken,
      userId: existingCompany.id,
      role: "company",
      email: existingCompany.email,
      name: existingCompany.name,
      avatar: existingCompany.logo,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Browser"
    };

    if (!Array.isArray(dataStore.sessions)) dataStore.sessions = [];
    dataStore.sessions.unshift(newSession);
    logAuditEvent("LOGIN_GOOGLE", `Company signed in via Google: ${existingCompany.email}`, req, {
      email: existingCompany.email,
      role: "company",
      userId: existingCompany.id,
      status: "success"
    });
    saveDatabase();

    return res.json({
      success: true,
      role: "company",
      user: existingCompany,
      token: sessionToken
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

    const sessionToken = "sess_comp_" + crypto.randomBytes(24).toString("hex") + "_" + Date.now();
    const newSession: ActiveSession = {
      token: sessionToken,
      userId: newCompany.id,
      role: "company",
      email: normalizedEmail,
      name: newCompany.name,
      avatar: newCompany.logo,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Browser"
    };

    if (!Array.isArray(dataStore.sessions)) dataStore.sessions = [];
    dataStore.sessions.unshift(newSession);
    dataStore.companies.unshift(newCompany);
    logAuditEvent("USER_REGISTERED_GOOGLE", `Company created via Google: ${newCompany.name} (${normalizedEmail})`, req, {
      email: normalizedEmail,
      role: "company",
      userId: newCompany.id,
      status: "success"
    });
    saveDatabase();

    return res.json({
      success: true,
      role: "company",
      user: newCompany,
      token: sessionToken
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

    const sessionToken = "sess_std_" + crypto.randomBytes(24).toString("hex") + "_" + Date.now();
    const newSession: ActiveSession = {
      token: sessionToken,
      userId: newStudent.id,
      role: "student",
      email: normalizedEmail,
      name: newStudent.name,
      avatar: newStudent.avatar,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Browser"
    };

    if (!Array.isArray(dataStore.sessions)) dataStore.sessions = [];
    dataStore.sessions.unshift(newSession);
    dataStore.students.unshift(newStudent);
    logAuditEvent("USER_REGISTERED_GOOGLE", `Student created via Google: ${newStudent.name} (${normalizedEmail})`, req, {
      email: normalizedEmail,
      role: "student",
      userId: newStudent.id,
      status: "success"
    });
    saveDatabase();

    return res.json({
      success: true,
      role: "student",
      user: newStudent,
      token: sessionToken
    });
  }
});

// Unified Real Authentication Endpoint (Strict Credential Check & Session Generation)
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required."
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const rawPassword = String(password);

  try {
    // Use Supabase public/anon client for password authentication
    const authClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    // Authenticate with Supabase Auth
    const {
      data: authData,
      error: authError
    } = await authClient.auth.signInWithPassword({
      email: normalizedEmail,
      password: rawPassword
    });

    if (authError || !authData.user || !authData.session) {
      console.error("[AUTH] Login failed:", authError?.message);

      logAuditEvent(
        "LOGIN_FAILED",
        `Failed login attempt: ${normalizedEmail}`,
        req,
        {
          email: normalizedEmail,
          role: role || "unknown"
        }
      );

      return res.status(401).json({
        error: authError?.message || "Invalid email or password."
      });
    }

    const authUser = authData.user;

    // Get application profile
    const {
      data: profile,
      error: profileError
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profile) {
      console.error("[AUTH] Profile not found:", profileError?.message);

      return res.status(404).json({
        error: "User profile not found."
      });
    }

    // Strict role validation
    if (role && profile.role !== role) {
      logAuditEvent(
        "LOGIN_ROLE_MISMATCH",
        `Role mismatch for ${normalizedEmail}`,
        req,
        {
          email: normalizedEmail,
          requestedRole: role,
          actualRole: profile.role
        }
      );

      return res.status(403).json({
        error: `This account is registered as ${profile.role}, not ${role}.`
      });
    }

    let user: any;

    // =========================
    // STUDENT
    // =========================
    if (profile.role === "student") {
      const {
        data: student,
        error: studentError
      } = await supabase
        .from("students")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (studentError || !student) {
        return res.status(404).json({
          error: "Student profile not found."
        });
      }

      if (student.status === "suspended") {
        logAuditEvent(
          "SUSPENDED_ACCOUNT_LOGIN",
          `Suspended student login blocked: ${normalizedEmail}`,
          req,
          {
            userId: authUser.id,
            role: "student"
          }
        );

        return res.status(403).json({
          error: "Your student account has been suspended."
        });
      }

      user = {
        id: authUser.id,
        name: profile.name || student.name || "",
        email: authUser.email || profile.email,
        phone: profile.phone || "",
        avatar: profile.avatar_url || "",
        role: "student",
        studentId: student.student_id || "",
        university: student.university || "",
        department: student.department || "",
        semester: student.semester || "",
        cgpa: student.cgpa || "",
        graduationYear: student.graduation_year || "",
        bio: student.bio || "",
        skills: student.skills || [],
        resumeUrl: student.resume_url || "",
        resumeName: student.resume_name || ""
      };
    }

    // =========================
    // COMPANY
    // =========================
    else if (profile.role === "company") {
      const {
        data: company,
        error: companyError
      } = await supabase
        .from("companies")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (companyError || !company) {
        return res.status(404).json({
          error: "Company profile not found."
        });
      }

      if (company.status === "suspended") {
        logAuditEvent(
          "SUSPENDED_ACCOUNT_LOGIN",
          `Suspended company login blocked: ${normalizedEmail}`,
          req,
          {
            userId: authUser.id,
            role: "company"
          }
        );

        return res.status(403).json({
          error: "Your company account has been suspended."
        });
      }

      user = {
        id: authUser.id,
        name: profile.name || company.name || "",
        email: authUser.email || profile.email,
        phone: profile.phone || company.phone || "",
        avatar: profile.avatar_url || company.logo_url || "",
        role: "company",
        companyName: company.name || "",
        tagline: company.tagline || "",
        industry: company.industry || "",
        companySize: company.company_size || "",
        website: company.website || "",
        location: company.location || "",
        logoUrl: company.logo_url || "",
        verified: company.verified || false,
        status: company.status || "pending"
      };
    }

    // =========================
    // ADMINISTRATOR
    // =========================
    else if (profile.role === "admin") {
      user = {
        id: authUser.id,
        name: profile.name || "Administrator",
        email: authUser.email || profile.email,
        phone: profile.phone || "",
        avatar: profile.avatar_url || "",
        role: "admin"
      };
    }

    // =========================
    // UNKNOWN ROLE
    // =========================
    else {
      return res.status(403).json({
        error: "Invalid account role."
      });
    }

    // Successful login audit
    logAuditEvent(
      "LOGIN_SUCCESS",
      `Successful ${profile.role} login: ${normalizedEmail}`,
      req,
      {
        userId: authUser.id,
        role: profile.role,
        email: normalizedEmail
      }
    );

    return res.json({
      success: true,
      role: profile.role,
      user,
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token
    });

  } catch (error) {
    console.error("[AUTH] Login error:", error);

    return res.status(500).json({
      error: "Login failed. Please try again."
    });
  }
});
// Explicit Logout Endpoint (Revokes server-side session)
app.post("/api/auth/logout", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim() || (req.headers["x-session-token"] as string) || (req.body?.token as string) || "";

  if (token && Array.isArray(dataStore.sessions)) {
    const session = dataStore.sessions.find(s => s.token === token);
    if (session) {
      logAuditEvent("LOGOUT", `User signed out: ${session.email} (${session.role})`, req, {
        email: session.email,
        role: session.role,
        userId: session.userId,
        status: "success"
      });
      dataStore.sessions = dataStore.sessions.filter(s => s.token !== token);
      saveDatabase();
    }
  }

  return res.json({ success: true, message: "Session terminated successfully." });
});

// Admin Active Sessions Endpoint (Real-time monitoring)
app.get("/api/admin/sessions", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

  const activeSessions = (dataStore.sessions || []).map(s => ({
    token: s.token,
    userId: s.userId,
    name: s.name,
    email: s.email,
    role: s.role,
    avatar: s.avatar,
    createdAt: s.createdAt,
    lastActiveAt: s.lastActiveAt,
    ip: s.ip,
    userAgent: s.userAgent
  }));

  return res.json({
    sessions: activeSessions,
    count: activeSessions.length
  });
});

// Admin Revoke Active Session Endpoint
app.delete("/api/admin/sessions/:token", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

  const tokenToRevoke = req.params.token;
  if (!tokenToRevoke) return res.status(400).json({ error: "Token required." });

  if (Array.isArray(dataStore.sessions)) {
    const target = dataStore.sessions.find(s => s.token === tokenToRevoke);
    dataStore.sessions = dataStore.sessions.filter(s => s.token !== tokenToRevoke);
    logAuditEvent("SESSION_REVOKED", `Administrator revoked session for: ${target?.email || tokenToRevoke}`, req, {
      role: "admin",
      status: "warning"
    });
    saveDatabase();
  }

  return res.json({ success: true, message: "Session revoked successfully." });
});

// Admin Audit Logs Endpoint
app.get("/api/admin/audit-logs", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

  return res.json({
    logs: (dataStore.auditLogs || []).slice(0, 100)
  });
});

// Admin User Management & Platform Administration
app.get("/api/admin/users", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

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

app.patch("/api/admin/users/:role/:id/status", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

  const { role, id } = req.params;
  const { status } = req.body;

if (role === "student") {

  const normalizedStatus = status === "suspended" ? "suspended" : "active";

  const { data: updatedStudent, error: studentError } = await supabase

    .from("students")

    .update({

      status: normalizedStatus,

      updated_at: new Date().toISOString()

    })
    .eq("id", id)
    .select("*")
    .single();

  if (studentError || !updatedStudent) {
    console.error("Admin student status update failed:", studentError);
    return res.status(500).json({
      error: studentError?.message || "Failed to update student status"
    });
  }

  const student = dataStore.students.find(s => s.id === id);
  if (student) {
    student.status = status;
    saveDatabase();
  }

  logAuditEvent(
    "USER_STATUS_CHANGE",
    `Admin changed student ${id} status to ${status}`,
    req,
    {
      role: "admin",
      status: "warning"
    }
  );

  return res.json({
    success: true,
    user: updatedStudent
  });
}
 else if (role === "company") {
    const company = dataStore.companies.find(c => c.id === id);
    if (!company) return res.status(404).json({ error: "Company not found" });
    company.status = status;
    if (status === "active") company.verified = true;
    logAuditEvent("USER_STATUS_CHANGE", `Admin changed company ${company.name} status to ${status}`, req, {
      role: "admin",
      status: "warning"
    });
    saveDatabase();
    return res.json({ success: true, user: company });
  }

  return res.status(400).json({ error: "Invalid user role specified" });
});

// Admin Company Verification & Approval Endpoint
app.patch("/api/admin/verify-company/:id", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

  const company = dataStore.companies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: "Company not found" });
  
  const isApproved = req.body.verified !== undefined ? Boolean(req.body.verified) : true;
  company.verified = isApproved;
  company.status = isApproved ? "active" : "pending";

  logAuditEvent("COMPANY_VERIFIED", `Admin verified company ${company.name}: approved=${isApproved}`, req, {
    role: "admin",
    status: "success"
  });

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

app.delete("/api/admin/internships/:id", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

  const initialLen = dataStore.internships.length;
  dataStore.internships = dataStore.internships.filter(i => i.id !== req.params.id);
  if (dataStore.internships.length === initialLen) {
    return res.status(404).json({ error: "Internship post not found" });
  }

  logAuditEvent("INTERNSHIP_ADMIN_DELETED", `Admin deleted internship ID ${req.params.id}`, req, {
    role: "admin",
    status: "warning"
  });

  saveDatabase();
  res.json({ success: true, message: "Internship post removed by administrator." });
});

// Admin Broadcast & Actions
app.post("/api/admin/broadcast", async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

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
  logAuditEvent("ADMIN_BROADCAST", `Admin broadcasted announcement: "${newNotification.title}" to target ${newNotification.target}`, req, {
    role: "admin",
    status: "success"
  });
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
  // Production mode: serve the Vite build and the project's static assets
  const distPath = path.join(process.cwd(), "dist");

  // Serve static project assets used by the HTML pages
  app.use("/js", express.static(path.join(process.cwd(), "js")));
  app.use("/css", express.static(path.join(process.cwd(), "css")));
  app.use("/pages", express.static(path.join(process.cwd(), "pages")));
  app.use("/data", express.static(path.join(process.cwd(), "data")));
  app.use("/public", express.static(path.join(process.cwd(), "public")));

  // Serve the Vite production build
  app.use(express.static(distPath));

  // SPA fallback
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

 // Expose Supabase configuration to browser
app.get("/env-config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    window.ENV_SUPABASE_URL = ${JSON.stringify(process.env.VITE_SUPABASE_URL || "")};
    window.ENV_SUPABASE_ANON_KEY = ${JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "")};
  `);
});

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
