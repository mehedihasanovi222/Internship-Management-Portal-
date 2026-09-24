/**
 * SUPABASE & REAL CLOUD CLIENT ADAPTER
 * Connects either to Supabase Cloud or to the local/Cloud Run Express REST backend.
 * Provides unified interfaces for Auth, Database CRUD, and Storage.
 */

(function (window) {
  // Configuration: read from environment meta tags or window global
  const SUPABASE_URL = window.ENV_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || '';

  class CloudClient {
    constructor() {
      this.isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project'));
      this.supabase = null;

      if (this.isSupabaseConfigured && window.supabase) {
        try {
          this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          console.info('⚡ Connected to Supabase Cloud Instance:', SUPABASE_URL);
        } catch (e) {
          console.warn('Could not initialize direct Supabase SDK, falling back to REST API.', e);
        }
      }

      this.auth = {
        signUp: this.signUp.bind(this),
        signInWithPassword: this.signInWithPassword.bind(this),
        signInWithOAuth: this.signInWithOAuth.bind(this),
        resetPasswordForEmail: this.resetPasswordForEmail.bind(this),
        updateUser: this.updateUser.bind(this),
        verifyEmail: this.verifyEmail.bind(this),
        getUser: this.getUser.bind(this),
        signOut: this.signOut.bind(this)
      };

      this.storage = {
        from: (bucket) => ({
          upload: (filePath, file) => this.uploadFile(bucket, filePath, file),
          getPublicUrl: (filePath) => ({ data: { publicUrl: filePath.startsWith('/') || filePath.startsWith('http') ? filePath : `/uploads/${filePath}` } })
        })
      };
    }

    async signUp({ email, password, options = {} }) {
      if (this.supabase) {
        return await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: options.data || {}
          }
        });
      }

      // REST API fallback
      const role = options.data?.role || 'student';
      const name = options.data?.name || email.split('@')[0];
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name, ...options.data })
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.error || 'Failed to create account.' } };
      }
      return { data: { user: data.user, session: { access_token: data.token } }, error: null };
    }

    async signInWithPassword({ email, password, role }) {
      if (this.supabase) {
        return await this.supabase.auth.signInWithPassword({ email, password });
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.error || 'Invalid credentials.' } };
      }
      return { data: { user: data.user, role: data.role, session: { access_token: data.token } }, error: null };
    }

    async signInWithOAuth({ provider, options = {} }) {
      if (this.supabase && provider === 'google') {
        return await this.supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: options.redirectTo || window.location.origin
          }
        });
      }

      // Simulated or Client-side Google Token handling
      return { error: { message: 'Use DB.loginWithGoogle(profile, role) for real Google authentication.' } };
    }

    async resetPasswordForEmail(email) {
      if (this.supabase) {
        return await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/pages/reset-password.html`
        });
      }

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.error || 'Could not send reset email.' } };
      }
      return { data, error: null };
    }

    async updateUser({ password, currentPassword, email }) {
      if (this.supabase) {
        return await this.supabase.auth.updateUser({ password });
      }

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.error || 'Password update failed.' } };
      }
      return { data, error: null };
    }

    async verifyEmail(token, email) {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.error || 'Email verification failed.' } };
      }
      return { data, error: null };
    }

    async getUser() {
      const auth = JSON.parse(localStorage.getItem('imp_auth') || '{}');
      if (!auth.isLoggedIn) return { data: { user: null }, error: null };

      try {
        const res = await fetch(`/api/auth/me?email=${encodeURIComponent(auth.userEmail || '')}`, {
          headers: auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}
        });
        if (res.ok) {
          const info = await res.json();
          return { data: { user: info.user, role: info.role }, error: null };
        }
      } catch (e) {
        // Fallback to local profile
      }
      return { data: { user: auth }, error: null };
    }

    async signOut() {
      if (this.supabase) {
        await this.supabase.auth.signOut();
      }
      localStorage.removeItem('imp_auth');
      return { error: null };
    }

    async uploadFile(bucket, filePath, file) {
      if (this.supabase) {
        return await this.supabase.storage.from(bucket).upload(filePath, file, {
          upsert: true
        });
      }

      // Convert File to base64 Data URL and post to /api/upload
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dataUrl: reader.result,
                filename: file.name
              })
            });
            const data = await res.json();
            if (!res.ok) {
              resolve({ data: null, error: { message: data.error || 'Upload failed' } });
            } else {
              resolve({ data: { path: data.url, fullPath: data.url }, error: null });
            }
          } catch (err) {
            resolve({ data: null, error: { message: err.message || 'Network error during upload.' } });
          }
        };
        reader.onerror = () => resolve({ data: null, error: { message: 'Failed to read file buffer.' } });
        reader.readAsDataURL(file);
      });
    }
  }

  window.CloudClient = new CloudClient();
})(window);
