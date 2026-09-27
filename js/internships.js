/**
 * INTERNSHIP MANAGEMENT PORTAL - INTERNSHIPS MODULE
 * Search, multi-filtering, sorting, pagination, details view, save toggle
 */

let currentPage = 1;
const ITEMS_PER_PAGE = 6;
let filteredInternships = [];

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the internships listing page
  if (document.getElementById('internships-list-container')) {
    initInternshipDirectory();
  }

  // Check if we are on the single internship details page
  if (document.getElementById('internship-detail-container')) {
    initInternshipDetails();
  }

  // Check if we are on the saved internships page
  if (document.getElementById('saved-internships-container')) {
    initSavedInternships();
  }
});

/**
 * Initialize Internship Directory (Search & Filter)
 */
async function initInternshipDirectory() {
  const container = document.getElementById('internships-list-container');
  if (container) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-600 mb-3"></i>
        <p class="text-slate-500 font-medium text-sm">Fetching real-time internships from verified employers...</p>
      </div>
    `;
  }

  // Fetch real-time internships from backend database API
  const allInternships = await DB.fetchInternships();
  filteredInternships = [...allInternships];

  // Read URL search param if available
  const urlSearch = getQueryParam('search');
  const urlCategory = getQueryParam('category');
  const urlWorkMode = getQueryParam('workMode');

  const searchInput = document.getElementById('search-job-input');
  if (urlSearch && searchInput) {
    searchInput.value = decodeURIComponent(urlSearch);
  }

  const categorySelect = document.getElementById('filter-category');
  if (urlCategory && categorySelect) {
    categorySelect.value = decodeURIComponent(urlCategory);
  }

  const workModeSelect = document.getElementById('filter-workmode');
  if (urlWorkMode && workModeSelect) {
    workModeSelect.value = decodeURIComponent(urlWorkMode);
  }

  // Populate dynamic category dropdown
  populateCategoryFilters(allInternships);

  // Setup event listeners for filtering
  setupFilterListeners();

  // Apply initial filter
  applyFiltersAndSort();
}

function populateCategoryFilters(list) {
  const categorySelect = document.getElementById('filter-category');
  if (!categorySelect) return;

  const categories = [...new Set(list.map(i => i.category))].sort();
  const currentVal = categorySelect.value;

  categories.forEach(cat => {
    if (!categorySelect.querySelector(`option[value="${cat}"]`)) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    }
  });

  if (currentVal) categorySelect.value = currentVal;
}

function setupFilterListeners() {
  const searchInput = document.getElementById('search-job-input');
  const locationInput = document.getElementById('filter-location');
  const categorySelect = document.getElementById('filter-category');
  const workModeSelect = document.getElementById('filter-workmode');
  const typeSelect = document.getElementById('filter-type');
  const sortSelect = document.getElementById('sort-internships');
  const resetBtn = document.getElementById('reset-filters-btn');

  const triggerFilter = () => {
    currentPage = 1;
    applyFiltersAndSort();
  };

  if (searchInput) searchInput.addEventListener('input', debounce(triggerFilter, 300));
  if (locationInput) locationInput.addEventListener('input', debounce(triggerFilter, 300));
  if (categorySelect) categorySelect.addEventListener('change', triggerFilter);
  if (workModeSelect) workModeSelect.addEventListener('change', triggerFilter);
  if (typeSelect) typeSelect.addEventListener('change', triggerFilter);
  if (sortSelect) sortSelect.addEventListener('change', triggerFilter);

  // Skill pill filters
  const skillChips = document.querySelectorAll('.skill-filter-chip');
  skillChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      chip.classList.toggle('bg-indigo-600');
      chip.classList.toggle('text-white');
      chip.classList.toggle('bg-slate-100');
      chip.classList.toggle('dark:bg-slate-800');
      triggerFilter();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (locationInput) locationInput.value = '';
      if (categorySelect) categorySelect.value = '';
      if (workModeSelect) workModeSelect.value = '';
      if (typeSelect) typeSelect.value = '';
      if (sortSelect) sortSelect.value = 'latest';
      
      skillChips.forEach(chip => {
        chip.classList.remove('active', 'bg-indigo-600', 'text-white');
        chip.classList.add('bg-slate-100', 'dark:bg-slate-800');
      });

      triggerFilter();
      showToast('Filters cleared', 'info', 2000);
    });
  }
}

function applyFiltersAndSort() {
  const all = DB.getInternships();
  const search = (document.getElementById('search-job-input')?.value || '').toLowerCase().trim();
  const location = (document.getElementById('filter-location')?.value || '').toLowerCase().trim();
  const category = document.getElementById('filter-category')?.value || '';
  const workMode = document.getElementById('filter-workmode')?.value || '';
  const type = document.getElementById('filter-type')?.value || '';
  const sort = document.getElementById('sort-internships')?.value || 'latest';

  const selectedSkills = Array.from(document.querySelectorAll('.skill-filter-chip.active')).map(c => c.dataset.skill.toLowerCase());

  filteredInternships = all.filter(item => {
    // Search match (title, company, skills, description)
    const matchesSearch = !search || 
      item.title.toLowerCase().includes(search) ||
      item.company.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.skills.some(s => s.toLowerCase().includes(search));

    // Location match
    const matchesLocation = !location || item.location.toLowerCase().includes(location);

    // Category match
    const matchesCategory = !category || item.category === category;

    // Work Mode match
    const matchesWorkMode = !workMode || item.workMode.toLowerCase() === workMode.toLowerCase();

    // Internship Type match
    const matchesType = !type || item.type.toLowerCase() === type.toLowerCase();

    // Skill chips match
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(s => item.skills.some(is => is.toLowerCase() === s));

    return matchesSearch && matchesLocation && matchesCategory && matchesWorkMode && matchesType && matchesSkills;
  });

  // Sorting
  filteredInternships.sort((a, b) => {
    if (sort === 'latest') return new Date(b.postedDate) - new Date(a.postedDate);
    if (sort === 'oldest') return new Date(a.postedDate) - new Date(b.postedDate);
    if (sort === 'stipend-high') return (b.stipendAmount || 0) - (a.stipendAmount || 0);
    if (sort === 'stipend-low') return (a.stipendAmount || 0) - (b.stipendAmount || 0);
    if (sort === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    if (sort === 'popular') return (b.openings || 1) - (a.openings || 1);
    return 0;
  });

  // Update total count
  const countEl = document.getElementById('results-count');
  if (countEl) countEl.textContent = `${filteredInternships.length} internship${filteredInternships.length === 1 ? '' : 's'} available`;

  renderInternshipCards();
}

function renderInternshipCards() {
  const container = document.getElementById('internships-list-container');
  if (!container) return;

  if (filteredInternships.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div class="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fa-solid fa-briefcase"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No matching internships found</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">Try adjusting your search terms, removing filters, or clearing skill chips to discover more opportunities.</p>
        <button onclick="document.getElementById('reset-filters-btn')?.click()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition">
          Clear All Filters
        </button>
      </div>
    `;
    renderPagination(0);
    return;
  }

  // Calculate slice for pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = filteredInternships.slice(startIndex, endIndex);

  const isStudentPortal = window.location.pathname.includes('/student/');
  const detailsBasePath = isStudentPortal ? 'internship-details.html' : 'pages/student/internship-details.html';

  container.innerHTML = pageItems.map(item => {
    const isSaved = DB.isInternshipSaved(item.id);
    const skillBadges = item.skills.slice(0, 4).map(s => `
      <span class="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-lg">
        ${s}
      </span>
    `).join('');

    const workModeColor = item.workMode === 'Remote' 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
      : item.workMode === 'Hybrid'
      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800';

    return `
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover-card-lift flex flex-col justify-between relative group">
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-3.5">
              <img src="${item.logo}" alt="${item.company}" class="w-13 h-13 rounded-xl object-cover border border-slate-100 dark:border-slate-700 shadow-sm" />
              <div>
                <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  <a href="${detailsBasePath}?id=${item.id}">${item.title}</a>
                </h3>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <i class="fa-regular fa-building text-xs text-indigo-500"></i> ${item.company}
                </p>
              </div>
            </div>

            <!-- Save Bookmark Button -->
            <button onclick="handleToggleSave('${item.id}', this)" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 dark:hover:text-indigo-400 transition ${isSaved ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200' : 'bg-slate-50 dark:bg-slate-700/40'}" title="${isSaved ? 'Remove from saved' : 'Save internship'}">
              <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
            </button>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-md border ${workModeColor}">
              <i class="fa-solid fa-laptop-code text-xs mr-1"></i> ${item.workMode}
            </span>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-md border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800">
              <i class="fa-regular fa-clock text-xs mr-1"></i> ${item.duration}
            </span>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-md border bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600">
              <i class="fa-solid fa-location-dot text-xs mr-1"></i> ${item.location}
            </span>
          </div>

          <!-- Description snippet -->
          <p class="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4">
            ${item.description}
          </p>

          <!-- Skills tags -->
          <div class="flex flex-wrap gap-1.5 mb-5">
            ${skillBadges}
            ${item.skills.length > 4 ? `<span class="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">+${item.skills.length - 4} more</span>` : ''}
          </div>
        </div>

        <!-- Footer / Action Row -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
          <div>
            <span class="text-xs text-slate-500 dark:text-slate-400 block font-medium">Monthly Stipend</span>
            <span class="text-base font-bold text-slate-900 dark:text-white text-indigo-600 dark:text-indigo-400">${item.stipend}</span>
          </div>

          <div class="flex items-center gap-2">
            <a href="${detailsBasePath}?id=${item.id}" class="px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              Details
            </a>
            <button onclick="openApplyModal('${item.id}')" class="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition">
              Apply
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  renderPagination(filteredInternships.length);
}

function renderPagination(totalItems) {
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let buttonsHtml = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
      <i class="fa-solid fa-chevron-left mr-1"></i> Prev
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    buttonsHtml += `
      <button onclick="changePage(${i})" class="w-10 h-10 rounded-xl text-sm font-semibold transition ${currentPage === i ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
        ${i}
      </button>
    `;
  }

  buttonsHtml += `
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
      Next <i class="fa-solid fa-chevron-right ml-1"></i>
    </button>
  `;

  paginationContainer.innerHTML = `
    <div class="flex items-center justify-center gap-2 mt-8 flex-wrap">
      ${buttonsHtml}
    </div>
  `;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredInternships.length / ITEMS_PER_PAGE);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderInternshipCards();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }
}

function handleToggleSave(id, btnElement) {
  const isSaved = DB.toggleSaveInternship(id);
  const icon = btnElement.querySelector('i');
  
  if (isSaved) {
    btnElement.classList.add('text-indigo-600', 'dark:text-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-950/50', 'border-indigo-200');
    btnElement.classList.remove('bg-slate-50', 'dark:bg-slate-700/40');
    if (icon) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
    }
    showToast('Internship saved to your bookmarks!', 'success');
  } else {
    btnElement.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-950/50', 'border-indigo-200');
    btnElement.classList.add('bg-slate-50', 'dark:bg-slate-700/40');
    if (icon) {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
    }
    showToast('Removed from saved internships', 'info');
  }
}

/**
 * Initialize Single Internship Details Page
 */
/**
 * Initialize Single Internship Details Page
 */
async function initInternshipDetails() {
  const container =
    document.getElementById('internship-details-container') ||
    document.getElementById('internship-detail-container');

  if (!container) return;

  const id = getQueryParam('id');

  if (!id) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
          No internship was selected.
        </p>
        <a
          href="internships.html"
          class="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
        >
          View All Internships
        </a>
      </div>
    `;
    return;
  }

  // Show loading state while fetching the real internship
  container.innerHTML = `
    <div class="py-20 text-center">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-600 mb-4"></i>
      <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
        Loading internship details...
      </p>
    </div>
  `;

  let item = null;

  /*
   * IMPORTANT:
   * Always try the real backend first.
   * This prevents raw/localStorage Supabase objects from breaking
   * the Details page.
   */
  try {
    const res = await fetch(`/api/internships/${encodeURIComponent(id)}`);

    if (res.ok) {
      const apiItem = await res.json();

      if (apiItem && apiItem.id) {
        item = apiItem;
      }
    }
  } catch (error) {
    console.warn(
      'Could not fetch internship details from API:',
      error
    );
  }

  /*
   * Fallback only if the real API could not return the internship.
   */
  if (!item) {
    const cachedItem = DB.getInternshipById(id);

    if (cachedItem) {
      item = cachedItem;
    }
  }

  /*
   * Final fallback from the local internship list.
   */
  if (!item) {
    const list = DB.getInternships();

    if (Array.isArray(list)) {
      item = list.find(
        internship => String(internship.id) === String(id)
      );
    }
  }

  /*
   * Internship does not exist.
   */
  if (!item) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <i class="fa-solid fa-briefcase text-2xl text-slate-400"></i>
        </div>

        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Internship Not Found
        </h3>

        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This internship opportunity may have been removed or is no longer available.
        </p>

        <a
          href="internships.html"
          class="inline-flex px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
        >
          View All Internships
        </a>
      </div>
    `;

    return;
  }

  /*
   * Normalize all fields so the page never crashes
   * because of missing/null Supabase values.
   */

  const internshipId = item.id || id;

  const title = item.title || 'Untitled Internship';

  const company =
    item.company ||
    item.company_name ||
    'Company';

  const logo =
    item.logo ||
    item.company_logo ||
    'https://via.placeholder.com/160';

  const category =
    item.category ||
    'Software & Development';

  const department =
    item.department ||
    'Engineering';

  const location =
    item.location ||
    'Dhaka, Bangladesh';

  const workMode =
    item.workMode ||
    item.work_mode ||
    'Hybrid';

  const internshipType =
    item.type ||
    item.internship_type ||
    'Full-time';

  const duration =
    item.duration ||
    'Not specified';

  const stipend =
    item.stipend ||
    'Not specified';

  const openings =
    Number(item.openings) ||
    0;

  const deadline =
    item.deadline ||
    'Not specified';

  const description =
    item.description ||
    'No description has been provided for this internship.';

  const skills =
    Array.isArray(item.skills)
      ? item.skills
      : [];

  const preferredSkills =
    Array.isArray(item.preferredSkills)
      ? item.preferredSkills
      : Array.isArray(item.preferred_skills)
        ? item.preferred_skills
        : [];

  const responsibilities =
    Array.isArray(item.responsibilities)
      ? item.responsibilities
      : [];

  const qualifications =
    Array.isArray(item.qualifications)
      ? item.qualifications
      : [];

  const benefits =
    Array.isArray(item.benefits)
      ? item.benefits
      : [];

  /*
   * Company information can come from the internship object
   * or can be unavailable. Never assume it exists.
   */
  const companyInfo =
    item.companyInfo &&
    typeof item.companyInfo === 'object'
      ? item.companyInfo
      : {};

  const companyIndustry =
    companyInfo.industry ||
    item.industry ||
    'Software & Development';

  const companyAbout =
    companyInfo.about ||
    item.companyDescription ||
    item.description ||
    'Company information is currently available through the internship listing.';

  const companySize =
    companyInfo.size ||
    companyInfo.companySize ||
    item.companySize ||
    item.company_size ||
    'Not specified';

  const companyLocation =
    companyInfo.location ||
    location;

  const companyEmail =
    companyInfo.email ||
    item.hrEmail ||
    item.hr_email ||
    '';

  const companyWebsite =
    companyInfo.website ||
    item.website ||
    '';

  const companyWebsiteDisplay =
    companyWebsite
      ? companyWebsite
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '')
      : '';

  const isSaved =
    DB.isInternshipSaved(internshipId);

  const isStudentPortal =
    window.location.pathname.includes('/student/');

  /*
   * Render the complete internship details page.
   */
  container.innerHTML = `
    <!-- Top Hero Card -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">

      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        <div class="flex items-center gap-5">

          <img
            src="${logo}"
            alt="${company}"
            class="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
            onerror="this.src='https://via.placeholder.com/160'"
          />

          <div>

            <div class="flex items-center gap-2.5 flex-wrap">

              <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                ${title}
              </h1>

              <span class="px-3 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400">
                ${item.status || 'Active'}
              </span>

            </div>

            <p class="text-base font-semibold text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap">

              <i class="fa-regular fa-building text-indigo-500"></i>

              ${company}

              <span class="text-slate-300 dark:text-slate-600">
                •
              </span>

              <span class="text-sm font-normal text-slate-500 dark:text-slate-400">

                <i class="fa-solid fa-location-dot text-rose-500 text-xs mr-1"></i>

                ${location}

                (${workMode})

              </span>

            </p>

          </div>

        </div>


        <div class="flex items-center gap-3 w-full md:w-auto">

          <button
            onclick="handleToggleSave('${internshipId}', this)"
            class="flex-1 md:flex-initial px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 ${
              isSaved
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200'
                : ''
            }"
          >

            <i class="${
              isSaved
                ? 'fa-solid'
                : 'fa-regular'
            } fa-bookmark"></i>

            <span>
              ${isSaved ? 'Saved' : 'Save'}
            </span>

          </button>


          <button
            onclick="openApplyModal('${internshipId}')"
            class="flex-1 md:flex-initial px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
          >

            <i class="fa-regular fa-paper-plane"></i>

            <span>
              Apply Now
            </span>

          </button>

        </div>

      </div>


      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/60">

        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">

          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Monthly Stipend
          </span>

          <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            ${stipend}
          </span>

        </div>


        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">

          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Duration
          </span>

          <span class="text-lg font-bold text-slate-900 dark:text-white">
            ${duration}
          </span>

        </div>


        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">

          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Openings
          </span>

          <span class="text-lg font-bold text-slate-900 dark:text-white">
            ${openings} Vacancies
          </span>

        </div>


        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">

          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Apply Before
          </span>

          <span class="text-lg font-bold text-rose-600 dark:text-rose-400">
            ${deadline}
          </span>

        </div>

      </div>

    </div>


    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">


      <!-- Left Content -->
      <div class="lg:col-span-2 space-y-8">


        <!-- Job Details -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">

            <i class="fa-solid fa-align-left text-indigo-500"></i>

            Role Description

          </h2>


          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
            ${description}
          </p>


          <!-- Department -->
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
            Department
          </h3>

          <p class="text-sm text-slate-600 dark:text-slate-300">
            ${department}
          </p>


          <!-- Internship Type -->
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
            Internship Type
          </h3>

          <p class="text-sm text-slate-600 dark:text-slate-300">
            ${internshipType}
          </p>


          <!-- Key Responsibilities -->
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
            Key Responsibilities
          </h3>

          ${
            responsibilities.length > 0
              ? `
                <ul class="space-y-2.5">

                  ${responsibilities
                    .map(
                      r => `
                        <li class="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">

                          <i class="fa-solid fa-check text-emerald-500 mt-1"></i>

                          <span>
                            ${r}
                          </span>

                        </li>
                      `
                    )
                    .join('')}

                </ul>
              `
              : `
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  No specific responsibilities were provided.
                </p>
              `
          }


          <!-- Qualifications -->
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
            Qualifications & Requirements
          </h3>

          ${
            qualifications.length > 0
              ? `
                <ul class="space-y-2.5">

                  ${qualifications
                    .map(
                      q => `
                        <li class="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">

                          <i class="fa-regular fa-circle-dot text-indigo-500 mt-1"></i>

                          <span>
                            ${q}
                          </span>

                        </li>
                      `
                    )
                    .join('')}

                </ul>
              `
              : `
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  No specific qualifications were provided.
                </p>
              `
          }


          <!-- Skills -->
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
            Required & Preferred Skills
          </h3>

          ${
            skills.length > 0 || preferredSkills.length > 0
              ? `
                <div class="flex flex-wrap gap-2">

                  ${skills
                    .map(
                      s => `
                        <span class="px-3 py-1.5 text-sm font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800">
                          ${s}
                        </span>
                      `
                    )
                    .join('')}

                  ${preferredSkills
                    .map(
                      ps => `
                        <span class="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">
                          ${ps} (Preferred)
                        </span>
                      `
                    )
                    .join('')}

                </div>
              `
              : `
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  No skills were specified.
                </p>
              `
          }


          <!-- Benefits -->
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
            Perks & Benefits
          </h3>

          ${
            benefits.length > 0
              ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  ${benefits
                    .map(
                      b => `
                        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium">

                          <i class="fa-solid fa-gift text-amber-500"></i>

                          ${b}

                        </div>
                      `
                    )
                    .join('')}

                </div>
              `
              : `
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  No benefits were specified.
                </p>
              `
          }

        </div>


        <!-- Similar Internships -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">

            <span>
              Similar Internship Opportunities
            </span>

            <a
              href="internships.html"
              class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </a>

          </h2>


          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4"
            id="similar-internships-container"
          >
          </div>

        </div>

      </div>


      <!-- Company Sidebar -->
      <div class="space-y-6">

        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm sticky top-24">

          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            About the Company
          </h3>


          <div class="flex items-center gap-3.5 mb-4">

            <img
              src="${logo}"
              alt="${company}"
              class="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              onerror="this.src='https://via.placeholder.com/160'"
            />

            <div>

              <h4 class="font-bold text-slate-900 dark:text-white">
                ${company}
              </h4>

              <p class="text-xs text-slate-500 dark:text-slate-400">
                ${companyIndustry}
              </p>

            </div>

          </div>


          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            ${companyAbout}
          </p>


          <div class="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-6">


            <div class="flex items-center gap-3">

              <i class="fa-solid fa-users text-indigo-500 w-4"></i>

              <span>
                ${companySize}
              </span>

            </div>


            <div class="flex items-center gap-3">

              <i class="fa-solid fa-location-dot text-rose-500 w-4"></i>

              <span>
                ${companyLocation}
              </span>

            </div>


            ${
              companyEmail
                ? `
                  <div class="flex items-center gap-3">

                    <i class="fa-solid fa-envelope text-blue-500 w-4"></i>

                    <a
                      href="mailto:${companyEmail}"
                      class="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      ${companyEmail}
                    </a>

                  </div>
                `
                : ''
            }


            ${
              companyWebsite
                ? `
                  <div class="flex items-center gap-3">

                    <i class="fa-solid fa-globe text-emerald-500 w-4"></i>

                    <a
                      href="${companyWebsite}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                    >
                      ${companyWebsiteDisplay}
                    </a>

                  </div>
                `
                : ''
            }

          </div>


          <button
            onclick="openApplyModal('${internshipId}')"
            class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 mb-3"
          >

            <i class="fa-regular fa-paper-plane"></i>

            <span>
              Apply for this Role
            </span>

          </button>


          <button
            onclick="navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied to clipboard!', 'info')).catch(() => showToast('Could not copy link.', 'error'))"
            class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >

            <i class="fa-regular fa-share-from-square"></i>

            <span>
              Share Opportunity
            </span>

          </button>

        </div>

      </div>

    </div>
  `;


  /*
   * Render similar internships.
   */
  const similarContainer =
    document.getElementById('similar-internships-container');

  if (similarContainer) {

    let allInternships = [];

    try {
      allInternships = await DB.fetchInternships();
    } catch (error) {
      console.warn(
        'Could not fetch internships for similar jobs:',
        error
      );

      allInternships = DB.getInternships();
    }

    if (!Array.isArray(allInternships)) {
      allInternships = [];
    }

    const similar = allInternships
      .filter(
        internship =>
          String(internship.id) !== String(internshipId)
      )
      .filter(
        internship =>
          internship.category === category ||
          (
            Array.isArray(internship.skills) &&
            internship.skills.some(skill =>
              skills.includes(skill)
            )
          )
      )
      .slice(0, 2);


    if (similar.length === 0) {

      similarContainer.innerHTML = `
        <p class="text-sm text-slate-500 dark:text-slate-400 col-span-full">
          No similar internships available right now.
        </p>
      `;

    } else {

      similarContainer.innerHTML = similar
        .map(
          s => {

            const similarLogo =
              s.logo ||
              s.company_logo ||
              'https://via.placeholder.com/100';

            const similarCompany =
              s.company ||
              s.company_name ||
              'Company';

            const similarWorkMode =
              s.workMode ||
              s.work_mode ||
              'Hybrid';

            const similarLocation =
              s.location ||
              'Dhaka, Bangladesh';

            const similarStipend =
              s.stipend ||
              'Not specified';

            return `
              <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition flex flex-col justify-between">

                <div class="flex items-start gap-3 mb-3">

                  <img
                    src="${similarLogo}"
                    alt="${similarCompany}"
                    class="w-10 h-10 rounded-lg object-cover"
                    onerror="this.src='https://via.placeholder.com/100'"
                  />

                  <div>

                    <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">

                      <a
                        href="internship-details.html?id=${s.id}"
                        class="hover:text-indigo-600"
                      >
                        ${s.title || 'Internship'}
                      </a>

                    </h4>

                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      ${similarCompany} • ${similarLocation} (${similarWorkMode})
                    </p>

                  </div>

                </div>


                <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">

                  <span class="font-bold text-indigo-600 dark:text-indigo-400">
                    ${similarStipend}
                  </span>

                  <a
                    href="internship-details.html?id=${s.id}"
                    class="font-semibold text-slate-700 dark:text-slate-300 hover:underline"
                  >
                    View →
                  </a>

                </div>

              </div>
            `;
          }
        )
        .join('');
    }
  }
}

/**
 * Initialize Saved Internships Page
 */
function initSavedInternships() {
  const container = document.getElementById('saved-internships-container');
  if (!container) return;

  const savedIds = DB.getSavedInternships();
  const all = DB.getInternships();
  const savedItems = all.filter(i => savedIds.includes(i.id));

  const countBadge = document.getElementById('saved-count');
  if (countBadge) countBadge.textContent = `${savedItems.length} saved`;

  if (savedItems.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fa-regular fa-bookmark"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Saved Internships Yet</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">Explore thousands of active internship opportunities and bookmark your favorites to review and apply anytime.</p>
        <a href="internships.html" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition">
          <i class="fa-solid fa-magnifying-glass"></i> Browse Internships
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = savedItems.map(item => `
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover-card-lift flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm mb-4">
      <div class="flex items-start sm:items-center gap-4">
        <img src="${item.logo}" alt="${item.company}" class="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-700" />
        <div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-white hover:text-indigo-600 transition">
            <a href="internship-details.html?id=${item.id}">${item.title}</a>
          </h3>
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-0.5">
            <i class="fa-regular fa-building text-indigo-500 text-xs"></i> ${item.company}
            <span class="text-slate-300 dark:text-slate-600">•</span>
            <span><i class="fa-solid fa-location-dot text-rose-500 text-xs mr-1"></i>${item.location} (${item.workMode})</span>
          </p>
          <div class="flex items-center gap-3 mt-2 text-xs font-semibold">
            <span class="text-indigo-600 dark:text-indigo-400">${item.stipend}</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-500 dark:text-slate-400">Deadline: ${item.deadline}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <button onclick="handleRemoveSaved('${item.id}')" class="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm font-semibold transition flex items-center gap-1.5">
          <i class="fa-regular fa-trash-can"></i> Remove
        </button>
        <a href="internship-details.html?id=${item.id}" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition">
          View Details
        </a>
        <button onclick="openApplyModal('${item.id}')" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition">
          Apply
        </button>
      </div>
    </div>
  `).join('');
}

function handleRemoveSaved(id) {
  DB.toggleSaveInternship(id);
  showToast('Removed from saved internships', 'info');
  initSavedInternships();
}

// Global debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Open Application Modal and bind submission
 */
window.openApplyModal = function(id) {
  const auth = DB.getAuth();
  const isStudentPortal = window.location.pathname.includes('/student/');
  const loginUrl = isStudentPortal ? 'login.html' : 'pages/student/login.html';

  if (!auth.isLoggedIn) {
    showToast('Please sign in as a student to apply for internships.', 'warning');
    setTimeout(() => {
      window.location.href = `${loginUrl}?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1200);
    return;
  }

  const internship = DB.getInternshipById(id) || DB.getInternships().find(i => i.id === id);
  if (!internship) {
    showToast('Selected internship not found.', 'error');
    return;
  }

  // Check if student already applied
  const existingApps = DB.getApplications();
  const alreadyApplied = existingApps.some(a => a.internshipId === id || a.jobId === id);
  if (alreadyApplied) {
    showToast('You have already applied for this role. View status in My Applications.', 'info');
    return;
  }

  const modal = document.getElementById('apply-internship-modal');
  if (!modal) {
    // If modal not in DOM, navigate directly to details page
    if (!window.location.pathname.includes('internship-details.html')) {
      const detailsPage = isStudentPortal ? `internship-details.html?id=${id}` : `pages/student/internship-details.html?id=${id}`;
      window.location.href = detailsPage;
      return;
    }
  }

  const titleEl = document.getElementById('modal-job-title');
  const compEl = document.getElementById('modal-company-name');
  const idEl = document.getElementById('modal-internship-id');

  if (titleEl) titleEl.textContent = internship.title;
  if (compEl) compEl.textContent = internship.company;
  if (idEl) idEl.value = id;

  openModal('apply-internship-modal');
};

// Bind application modal form on page load
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('apply-modal-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const internshipId = document.getElementById('modal-internship-id')?.value;
      const coverLetter = document.getElementById('modal-cover-letter')?.value.trim() || '';
      const portfolio = document.getElementById('modal-portfolio-link')?.value.trim() || '';
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!internshipId) {
        showToast('Internship identifier missing.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Submitting...';
      }

      const student = DB.getStudentProfile();
      const newApp = { 
  internshipId: internshipId,
  studentId: student.id,
  coverLetter: coverLetter, 
  portfolioLink: portfolio, 
  resumeName: student.resume?.fileName || "Mehedi_Hasan_CSE_Resume_2026.pdf" 
};

      try {
        const result = await DB.applyForInternship(newApp.internshipId, newApp);
        closeModal('apply-internship-modal');
        showToast('Application submitted successfully with your attached profile & resume!', 'success');

        const isStudentPortal = window.location.pathname.includes('/student/');
        setTimeout(() => {
          window.location.href = isStudentPortal ? 'applications.html' : 'pages/student/applications.html';
        }, 1200);
      } catch (err) {
        showToast(err.message || 'Submission error. Please try again.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
        }
      }
    });
  }
});
