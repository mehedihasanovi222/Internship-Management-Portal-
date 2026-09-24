import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'pages/about.html'),
          contact: path.resolve(__dirname, 'pages/contact.html'),
          studentLogin: path.resolve(__dirname, 'pages/student/login.html'),
          studentRegister: path.resolve(__dirname, 'pages/student/register.html'),
          studentDashboard: path.resolve(__dirname, 'pages/student/dashboard.html'),
          studentProfile: path.resolve(__dirname, 'pages/student/profile.html'),
          studentEditProfile: path.resolve(__dirname, 'pages/student/edit-profile.html'),
          studentResume: path.resolve(__dirname, 'pages/student/resume.html'),
          studentInternships: path.resolve(__dirname, 'pages/student/internships.html'),
          studentInternshipDetails: path.resolve(__dirname, 'pages/student/internship-details.html'),
          studentSavedInternships: path.resolve(__dirname, 'pages/student/saved-internships.html'),
          studentApplications: path.resolve(__dirname, 'pages/student/applications.html'),
          studentApplicationDetails: path.resolve(__dirname, 'pages/student/application-details.html'),
          studentInterviews: path.resolve(__dirname, 'pages/student/interviews.html'),
          studentNotifications: path.resolve(__dirname, 'pages/student/notifications.html'),
          studentSettings: path.resolve(__dirname, 'pages/student/settings.html'),
          companyLogin: path.resolve(__dirname, 'pages/company/login.html'),
          companyRegister: path.resolve(__dirname, 'pages/company/register.html'),
          companyDashboard: path.resolve(__dirname, 'pages/company/dashboard.html'),
          companyProfile: path.resolve(__dirname, 'pages/company/profile.html'),
          companyEditProfile: path.resolve(__dirname, 'pages/company/edit-profile.html'),
          companyPostInternship: path.resolve(__dirname, 'pages/company/post-internship.html'),
          companyMyInternships: path.resolve(__dirname, 'pages/company/my-internships.html'),
          companyInternshipDetails: path.resolve(__dirname, 'pages/company/internship-details.html'),
          companyApplicants: path.resolve(__dirname, 'pages/company/applicants.html'),
          companyApplicantDetails: path.resolve(__dirname, 'pages/company/applicant-details.html'),
          companyInterviews: path.resolve(__dirname, 'pages/company/interviews.html'),
          companyNotifications: path.resolve(__dirname, 'pages/company/notifications.html'),
          companySettings: path.resolve(__dirname, 'pages/company/settings.html'),
          adminLogin: path.resolve(__dirname, 'pages/admin/login.html'),
          adminDashboard: path.resolve(__dirname, 'pages/admin/dashboard.html'),
          adminCompanies: path.resolve(__dirname, 'pages/admin/companies.html'),
          adminStudents: path.resolve(__dirname, 'pages/admin/students.html'),
          adminInternships: path.resolve(__dirname, 'pages/admin/internships.html'),
          adminApplications: path.resolve(__dirname, 'pages/admin/applications.html'),
          adminSettings: path.resolve(__dirname, 'pages/admin/settings.html'),
        }
      }
    }
  };
});
