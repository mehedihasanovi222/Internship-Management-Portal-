-- ==============================================================================
-- SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Project: University Internship Management Portal (Placement Cell)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'company', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE internship_status AS ENUM ('active', 'under_review', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interview_status AS ENUM ('Upcoming', 'Completed', 'Rescheduled', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL,
    university TEXT NOT NULL DEFAULT 'University Department of Computer Science & Engineering',
    department TEXT NOT NULL,
    semester TEXT NOT NULL,
    cgpa NUMERIC(3,2) NOT NULL CHECK (cgpa >= 0.00 AND cgpa <= 4.00),
    graduation_year TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{"English", "Bangla"}',
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    resume_name TEXT,
    resume_updated_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT,
    industry TEXT NOT NULL,
    company_size TEXT,
    website TEXT,
    phone TEXT,
    location TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    hr_name TEXT,
    hr_email TEXT,
    hr_phone TEXT,
    founded TEXT,
    verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
    description TEXT,
    linkedin_url TEXT,
    facebook_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    department TEXT,
    location TEXT NOT NULL,
    work_mode TEXT NOT NULL CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid')),
    internship_type TEXT NOT NULL CHECK (internship_type IN ('Full-time', 'Part-time', 'Contract')),
    duration TEXT NOT NULL,
    stipend TEXT NOT NULL,
    stipend_amount NUMERIC(10,2) DEFAULT 0,
    openings INT NOT NULL DEFAULT 1,
    posted_date DATE DEFAULT CURRENT_DATE,
    deadline DATE NOT NULL,
    start_date DATE,
    skills TEXT[] NOT NULL DEFAULT '{}',
    preferred_skills TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    qualifications TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    status internship_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    student_university TEXT,
    student_department TEXT,
    student_cgpa TEXT,
    student_photo TEXT,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    resume_url TEXT NOT NULL,
    resume_name TEXT,
    cover_letter TEXT,
    availability TEXT DEFAULT 'Immediate',
    portfolio_url TEXT,
    github_url TEXT,
    status application_status NOT NULL DEFAULT 'Applied',
    timeline JSONB DEFAULT '[]'::jsonb,
    applied_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    -- Prevent duplicate application from same student to same internship
    UNIQUE(student_id, internship_id)
);

-- 8. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    position TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    interview_type TEXT NOT NULL, -- Google Meet, Zoom, On-site
    meeting_link TEXT,
    location TEXT,
    interviewer TEXT,
    notes TEXT,
    status interview_status NOT NULL DEFAULT 'Upcoming',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target TEXT NOT NULL, -- 'student', 'company', 'admin', 'all'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'info', -- 'status', 'interview', 'offer', 'applicant', 'announcement'
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. SAVED INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.saved_internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(student_id, internship_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;

-- Helper function to check current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- STUDENTS POLICIES
CREATE POLICY "Students profile viewable by authenticated"
ON public.students FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can update only own student profile"
ON public.students FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Students can insert own student profile"
ON public.students FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- COMPANIES POLICIES
CREATE POLICY "Companies viewable by all authenticated users"
ON public.companies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Company can update only their own profile"
ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Company can insert own company profile"
ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- INTERNSHIPS POLICIES
CREATE POLICY "Active internships are viewable by everyone"
ON public.internships FOR SELECT USING (true);

CREATE POLICY "Company can insert internships for their own company"
ON public.internships FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = company_id OR public.get_user_role() = 'admin');

CREATE POLICY "Company can update their own internships"
ON public.internships FOR UPDATE TO authenticated 
USING (auth.uid() = company_id OR public.get_user_role() = 'admin');

CREATE POLICY "Company can delete their own internships"
ON public.internships FOR DELETE TO authenticated 
USING (auth.uid() = company_id OR public.get_user_role() = 'admin');

-- APPLICATIONS POLICIES
CREATE POLICY "Students can see their own applications"
ON public.applications FOR SELECT TO authenticated
USING (auth.uid() = student_id OR auth.uid() = company_id OR public.get_user_role() = 'admin');

CREATE POLICY "Students can create applications for themselves"
ON public.applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Companies can update status of applications for their jobs"
ON public.applications FOR UPDATE TO authenticated
USING (auth.uid() = company_id OR public.get_user_role() = 'admin');

-- INTERVIEWS POLICIES
CREATE POLICY "Interviews viewable by respective student and company"
ON public.interviews FOR SELECT TO authenticated
USING (auth.uid() = student_id OR auth.uid() = company_id OR public.get_user_role() = 'admin');

CREATE POLICY "Companies can schedule interviews"
ON public.interviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = company_id OR public.get_user_role() = 'admin');

CREATE POLICY "Companies can update interviews"
ON public.interviews FOR UPDATE TO authenticated
USING (auth.uid() = company_id OR public.get_user_role() = 'admin');

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users view their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR target = 'all' OR target = public.get_user_role()::text);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- SAVED INTERNSHIPS POLICIES
CREATE POLICY "Students can view their saved internships"
ON public.saved_internships FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their saved internships"
ON public.saved_internships FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete their saved internships"
ON public.saved_internships FOR DELETE TO authenticated USING (auth.uid() = student_id);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ==============================================================================

-- Create buckets for profile images and student resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images');

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Resumes viewable by student and recruiting companies"
ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes');
