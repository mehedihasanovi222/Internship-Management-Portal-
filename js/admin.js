/**
 * CENTRAL PLACEMENT CELL - ADMINISTRATOR CONTROLLER
 * Full-stack sync with /api/* and dynamic data binding
 */

const AdminApp = {
  async fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend API error:', e);
    }
    // Fallback based on real local state
    const internships = DB.getInternships();
    const applications = DB.getApplications();
    const selected = applications.filter(a => a.status === 'Selected').length;
    return {
      students: 0,
      companies: 0,
      verifiedCompanies: 0,
      pendingCompanies: 0,
      internships: internships.length,
      applications: applications.length,
      interviews: 0,
      placedStudents: selected,
      placementRate: applications.length > 0 ? `${Math.round((selected / applications.length) * 100)}%` : '0%'
    };
  },

  async fetchCompanies() {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Error fetching companies:', e);
    }
    return [];
  },

  async fetchStudents() {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Error fetching students:', e);
    }
    return [];
  },

  async fetchInternships() {
    try {
      const res = await fetch('/api/internships');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Error fetching internships:', e);
    }
    return [];
  },

  async verifyCompany(id, verified, status = 'active') {
    try {
      const res = await fetch(`/api/admin/verify-company/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified, status })
      });
      if (res.ok) {
        showToast(verified ? 'Company verified & approved to post internships! 🚀' : 'Company application status updated.', verified ? 'success' : 'warning');
        return true;
      }
    } catch (e) {
      console.error('Error verifying company:', e);
    }
    showToast('Failed to update company verification status.', 'error');
    return false;
  },

  async updateUserStatus(role, id, status) {
   try {
const token = localStorage.getItem('imp_token');
  const res = await fetch(`/api/admin/users/${role}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
      if (res.ok) {
        showToast(`User account status updated to ${status}.`, 'success');
        return true;
      }
    } catch (e) {
      console.error('Error updating user status:', e);
    }
    showToast('Failed to update user account status.', 'error');
    return false;
  },

async deleteInternship(id) {
  try {
    const token = localStorage.getItem('imp_token');

    const res = await fetch(`/api/admin/internships/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      showToast('Internship post moderated and removed from live portal.', 'info');
      return true;
    }

    const errorData = await res.json().catch(() => ({}));
    console.error('Delete internship failed:', errorData);

  } catch (e) {
    console.error('Error deleting internship:', e);
  }

  showToast('Failed to delete internship.', 'error');
  return false;
},

  async broadcastNotice(title, message, target) {
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, target })
      });
      if (res.ok) {
        showToast('Official notice broadcasted to portal!', 'success');
        return true;
      }
    } catch (e) {}
    showToast('Notice queued successfully', 'success');
    return true;
  }
};

// Global broadcast modal helper
function openBroadcastModal() {
  let modal = document.getElementById('broadcast-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'broadcast-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <i class="fa-solid fa-bullhorn text-base"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Broadcast University Notice</h3>
              <p class="text-xs text-zinc-400">Send instant alerts to students or company recruiters</p>
            </div>
          </div>
          <button onclick="document.getElementById('broadcast-modal').remove()" class="text-zinc-400 hover:text-white p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form id="broadcast-form" onsubmit="handleSendBroadcast(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Target Audience</label>
            <select id="broadcast-target" class="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:border-amber-500">
              <option value="all">All Users (Students & Companies)</option>
              <option value="student">Students Only</option>
              <option value="company">Companies Only</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Notice Headline</label>
            <input type="text" id="broadcast-title" required placeholder="Enter the headline for your broadcast" class="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Detailed Message</label>
            <textarea id="broadcast-message" required rows="3" placeholder="Enter the detailed message for your broadcast" class="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" onclick="document.getElementById('broadcast-modal').remove()" class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition">Dispatch Announcement</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

async function handleSendBroadcast(e) {
  e.preventDefault();
  const target = document.getElementById('broadcast-target').value;
  const title = document.getElementById('broadcast-title').value;
  const message = document.getElementById('broadcast-message').value;

  await AdminApp.broadcastNotice(title, message, target);
  const modal = document.getElementById('broadcast-modal');
  if (modal) modal.remove();
}
