/**
 * INTERNSHIP MANAGEMENT PORTAL - STRICT ROLE-BASED ACCESS CONTROL (RBAC) & ROUTE GUARD
 * Enforces per-user session isolation, route guards, token validation, and secure logout.
 */

(function (window) {
  'use strict';

  const AuthGuard = {
    // Read current auth state from localStorage/sessionStorage
    getAuth() {
      try {
        const raw = localStorage.getItem('imp_auth');
        if (!raw) return { isLoggedIn: false, userType: null, token: null };
        const parsed = JSON.parse(raw);
        return parsed && parsed.isLoggedIn ? parsed : { isLoggedIn: false, userType: null, token: null };
      } catch (e) {
        return { isLoggedIn: false, userType: null, token: null };
      }
    },

    // Calculate root relative path prefix (e.g. '/' or '../../')
    getRootPrefix() {
      const path = window.location.pathname;
      if (path.includes('/pages/student/') || path.includes('/pages/company/') || path.includes('/pages/admin/')) {
        return '../../';
      }
      if (path.includes('/pages/')) {
        return '../';
      }
      return './';
    },

    // Synchronous immediate route check to prevent UI flash of unauthorized data
    check() {
      const path = window.location.pathname;
      const auth = this.getAuth();
      const prefix = this.getRootPrefix();

      // 1. Student Portal Routes
      if (path.includes('/pages/student/')) {
        const isPublic = path.endsWith('/login.html') || path.endsWith('/register.html');
        
        if (isPublic) {
          // If already logged in as student, forward to student dashboard
          if (auth.isLoggedIn && auth.userType === 'student' && auth.token) {
            window.location.replace(prefix + 'pages/student/dashboard.html');
            return false;
          }
          return true;
        }

        // Protected student page: verify student authentication
        if (!auth.isLoggedIn || auth.userType !== 'student' || !auth.token) {
          document.documentElement.style.display = 'none';
          const redirectUrl = prefix + 'pages/student/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
          window.location.replace(redirectUrl);
          return false;
        }

        // If authenticated as company or admin, forbid cross-portal access
        if (auth.userType === 'company') {
          document.documentElement.style.display = 'none';
          window.location.replace(prefix + 'pages/company/dashboard.html');
          return false;
        }
        if (auth.userType === 'admin') {
          document.documentElement.style.display = 'none';
          window.location.replace(prefix + 'pages/admin/dashboard.html');
          return false;
        }
      }

      // 2. Company Portal Routes
      if (path.includes('/pages/company/')) {
        const isPublic = path.endsWith('/login.html') || path.endsWith('/register.html');

        if (isPublic) {
          if (auth.isLoggedIn && auth.userType === 'company' && auth.token) {
            window.location.replace(prefix + 'pages/company/dashboard.html');
            return false;
          }
          return true;
        }

        // Protected company page
        if (!auth.isLoggedIn || auth.userType !== 'company' || !auth.token) {
          document.documentElement.style.display = 'none';
          const redirectUrl = prefix + 'pages/company/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
          window.location.replace(redirectUrl);
          return false;
        }

        // Cross-role block
        if (auth.userType === 'student') {
          document.documentElement.style.display = 'none';
          window.location.replace(prefix + 'pages/student/dashboard.html');
          return false;
        }
        if (auth.userType === 'admin') {
          document.documentElement.style.display = 'none';
          window.location.replace(prefix + 'pages/admin/dashboard.html');
          return false;
        }
      }

      // 3. Admin Portal Routes
      if (path.includes('/pages/admin/')) {
        const isPublic = path.endsWith('/login.html');

        if (isPublic) {
          if (auth.isLoggedIn && auth.userType === 'admin' && auth.token) {
            window.location.replace(prefix + 'pages/admin/dashboard.html');
            return false;
          }
          return true;
        }

        // Protected admin page
        if (!auth.isLoggedIn || auth.userType !== 'admin' || !auth.token) {
          document.documentElement.style.display = 'none';
          window.location.replace(prefix + 'pages/admin/login.html');
          return false;
        }

        // Cross-role block
        if (auth.userType === 'student') {
          document.documentElement.style.display = 'none';
          window.location.replace(prefix + 'pages/student/dashboard.html');
          return false;
        }
        if (auth.userType === 'company') {
          document.documentElement.style.display = 'none';
          window.location.replace(prefix + 'pages/company/dashboard.html');
          return false;
        }
      }

      // Make sure document is visible if check passes
      document.documentElement.style.display = '';
      return true;
    },

    // Verify token validity with backend server
    async verifySessionWithServer() {
      const auth = this.getAuth();
      if (!auth || !auth.isLoggedIn || !auth.token) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });

        if (!res.ok) {
          console.warn('[AUTH] Session token rejected by server, terminating local session.');
          this.purgeSessionAndRedirect();
        }
      } catch (err) {
        // Network failure; retain local state in offline mode
      }
    },

    // Secure Full Logout (Clears all storage, revokes server session, resets history)
    async logout(customRedirect) {
      const auth = this.getAuth();
      const prefix = this.getRootPrefix();
      const targetUrl = customRedirect || (prefix + 'index.html');

      try {
        if (auth && auth.token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ token: auth.token })
          });
        }
      } catch (e) {
        console.warn('Logout server request failed:', e);
      }

      // Complete purge of all client state
      localStorage.removeItem('imp_auth');
      localStorage.removeItem('imp_token');
      localStorage.removeItem('imp_student_profile');
      localStorage.removeItem('imp_company_profile');
      localStorage.removeItem('imp_saved_internships');
      sessionStorage.clear();

      // Clear any session cookies if present
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // Navigate using replace to wipe browser back button history
      window.location.replace(targetUrl);
    },

    purgeSessionAndRedirect() {
      const prefix = this.getRootPrefix();
      localStorage.removeItem('imp_auth');
      localStorage.removeItem('imp_token');
      localStorage.removeItem('imp_student_profile');
      localStorage.removeItem('imp_company_profile');
      sessionStorage.clear();
      window.location.replace(prefix + 'index.html');
    },

    // Smart portal navigation helper for public home page buttons
    navigateToPortal(role) {
      const auth = this.getAuth();
      const prefix = this.getRootPrefix();

      if (auth.isLoggedIn && auth.userType === role && auth.token) {
        window.location.href = prefix + `pages/${role}/dashboard.html`;
      } else {
        window.location.href = prefix + `pages/${role}/login.html`;
      }
    }
  };

  // Run immediate guard check
  AuthGuard.check();

  // Re-check on back-forward cache restoration
  window.addEventListener('pageshow', (event) => {
    AuthGuard.check();
  });

  // Verify token asynchronously once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AuthGuard.verifySessionWithServer();
    });
  } else {
    AuthGuard.verifySessionWithServer();
  }

  // Export globally
  window.AuthGuard = AuthGuard;
})(window);
