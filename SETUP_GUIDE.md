# Internship Management Portal — Real Cloud & Backend Setup Guide

This guide provides step-by-step instructions to configure **Supabase**, **Google OAuth**, **Email Verification**, **Cloud Storage**, and **Production Deployment** for the University Internship Management Portal.

---

## 1. Quick Start (Development / Out-of-the-Box Mode)

The application already includes a built-in **Node.js Express + REST API** server with file-based persistence in `data/db.json` and permanent local/cloud file uploads in `/public/uploads`.

To run locally:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Setting Up Supabase (Database, Auth & Storage)

### Step 2.1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **New Project**, choose an organization, and name your project (e.g. `university-internship-portal`).
3. Set a secure database password and select a region closest to your users.
4. Click **Create new project** and wait for provisioning (~1 minute).

### Step 2.2: Apply Database Schema & RLS Policies
1. In your Supabase Dashboard, navigate to the **SQL Editor** tab (left sidebar).
2. Click **New query**.
3. Copy the entire contents of `supabase-schema.sql` from the root of this project and paste it into the editor.
4. Click **Run**. This creates:
   - `profiles`, `students`, `companies`, `internships`, `applications`, `interviews`, `notifications`, `saved_internships`
   - Row Level Security (RLS) policies for all 3 roles (Student, Company, Admin)
   - Supabase Storage buckets `profile-images` and `resumes` with secure public/authenticated access policies.

### Step 2.3: Configure Supabase Storage Buckets
1. Go to **Storage** in the Supabase Dashboard.
2. Verify that two buckets exist:
   - `profile-images` (Public: Enabled)
   - `resumes` (Public: Enabled for recruiters/students)
3. Maximum upload size recommendation: `5MB` for profile images, `10MB` for resumes.
4. Allowed MIME types: `image/png, image/jpeg, image/webp` for images; `application/pdf` for resumes.

---

## 3. Configuring Authentication

### Step 3.1: Enable Email & Password Sign-in
1. Go to **Authentication** -> **Providers** -> **Email**.
2. Ensure **Enable Email provider** is turned **ON**.
3. Enable **Confirm email** if you want Supabase to require email confirmation before sign-in.
4. Under **Email Templates**, customize:
   - **Confirm signup**: Subject `Verify your University Internship Portal account`
   - **Reset password**: Subject `Reset your Internship Portal password`
   - Redirect URL: `https://your-domain.com/pages/reset-password.html`

### Step 3.2: Configure Google OAuth ("Continue with Google")
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project: `Internship Portal`.
3. Go to **APIs & Services** -> **OAuth consent screen**:
   - User Type: **External**
   - App Name: `University Internship Portal`
   - User support email: your email.
   - Developer contact email: your email.
4. Go to **Credentials** -> **Create Credentials** -> **OAuth Client ID**:
   - Application type: **Web application**
   - Name: `Internship Portal Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://your-production-app-url.run.app`
   - **Authorized redirect URIs**:
     - `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`
     - `http://localhost:3000/api/auth/google/callback`
5. Copy the **Client ID** and **Client Secret**.
6. In Supabase Dashboard -> **Authentication** -> **Providers** -> **Google**:
   - Toggle **Enable Google provider** ON.
   - Paste your **Client ID** and **Client Secret**.
   - Click **Save**.

---

## 4. Environment Variables

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Fill in the values:
```env
PORT=3000
NODE_ENV=production
VITE_APP_URL=https://your-domain.com

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-random-32-char-secret
```

---

## 5. Pre-Configured Administrator Account

To access the Administrator Portal:
- **Email**: `admin@university.edu.bd`
- **Password**: `admin123` *(or `admin2026`)*
- Portal URL: `/pages/admin/dashboard.html`

In Supabase, to grant admin status to any email, update the role in the `public.profiles` table:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@university.edu.bd';
```

---

## 6. Cloud Deployment Instructions

### Deploying on Google Cloud Run / Container:
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```
3. Exposes port `3000` with automated health checks at `/api/health`.

### Deploying Frontend on Vercel / Netlify:
1. Connect your GitHub repository.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`).
