/**
 * JukaMedical — Main Application Script
 *
 * Architecture: OOP with ES6+ classes, single entry point via App class.
 * All DOM selectors are configurable via CONFIG object.
 * Data is loaded from local JSON files via DataService.
 */

// =============================================================================
// CONFIG — all configurable values in one place
// =============================================================================
const CONFIG = {
  // Data file paths
  data: {
    team: 'data/team.json',
    services: 'data/services.json',
    trainings: 'data/trainings.json',
  },

  // DOM selectors (data-attributes preferred)
  selectors: {
    header: '[data-header]',
    nav: '[data-nav]',
    navToggle: '[data-nav-toggle]',
    scrollLinks: '[data-scroll-link]',
    teamContainer: '[data-team-container]',
    servicesContainer: '[data-services-container]',
    trainingsContainer: '[data-trainings-container]',
  },

  // CSS class names
  classes: {
    headerScrolled: 'header--scrolled',
    navOpen: 'header__nav--mobile-open',
    burgerActive: 'header__burger--active',
    fadeIn: 'fade-in',
    fadeInVisible: 'fade-in--visible',
  },

  // Behavior thresholds
  scrollOffset: 80,       // px offset for smooth scroll (header clearance)
  stickyThreshold: 10,    // px before header gets "scrolled" style
  observerThreshold: 0.1, // IntersectionObserver visibility threshold
};


// =============================================================================
// Helpers — utility functions
// =============================================================================

/**
 * Escape HTML special characters to prevent XSS.
 * Use this for any external data (e.g. from JSON) inserted into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate a URL is safe for use in href/src attributes (http/https only).
 * Returns an empty string for unsafe or malformed URLs.
 * Allows relative paths (no protocol) for local assets.
 * @param {string} url
 * @returns {string}
 */
function safeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
  // Allow relative paths that have no protocol (e.g. "images/photo.jpg")
  if (!trimmed.includes(':')) return trimmed;
  return '';
}


// =============================================================================
// DataService — fetches and caches JSON data
// =============================================================================
class DataService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Fetch JSON from a URL. Returns cached data if available.
   * @param {string} url — path to JSON file
   * @returns {Promise<any>} parsed JSON data
   */
  async fetch(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error(`[DataService] Error loading ${url}:`, error);
      return null;
    }
  }
}


// =============================================================================
// ComponentRenderer — renders arrays of data into HTML
// =============================================================================
class ComponentRenderer {
  /**
   * @param {HTMLElement} container — DOM element to render into
   * @param {Function} templateFn — function that receives a data item and returns HTML string
   */
  constructor(container, templateFn) {
    this.container = container;
    this.templateFn = templateFn;
  }

  /**
   * Render an array of items into the container.
   * @param {Array} items — data to render
   */
  render(items) {
    if (!this.container || !items) return;

    const html = items.map((item, index) => this.templateFn(item, index)).join('');
    this.container.innerHTML = html;
  }
}


// =============================================================================
// StickyHeader — adds a class to the header when scrolled past threshold
// =============================================================================
class StickyHeader {
  /**
   * @param {string} headerSelector — selector for the header element
   * @param {string} scrolledClass — class to add when scrolled
   * @param {number} threshold — scroll distance in px before activating
   */
  constructor(headerSelector, scrolledClass, threshold) {
    this.header = document.querySelector(headerSelector);
    this.scrolledClass = scrolledClass;
    this.threshold = threshold;
    this.handleScroll = this.handleScroll.bind(this);
  }

  /** Start listening for scroll events. */
  init() {
    if (!this.header) return;
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll(); // check initial state
  }

  /** Toggle the scrolled class based on scroll position. */
  handleScroll() {
    const isScrolled = window.scrollY > this.threshold;
    this.header.classList.toggle(this.scrolledClass, isScrolled);
  }

  /** Stop listening. */
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}


// =============================================================================
// MobileNav — toggles mobile navigation menu
// =============================================================================
class MobileNav {
  /**
   * @param {string} toggleSelector — selector for the hamburger button
   * @param {string} navSelector — selector for the nav element
   * @param {string} navOpenClass — class for open state on nav
   * @param {string} burgerActiveClass — class for active state on burger
   */
  constructor(toggleSelector, navSelector, navOpenClass, burgerActiveClass) {
    this.toggle = document.querySelector(toggleSelector);
    this.nav = document.querySelector(navSelector);
    this.navOpenClass = navOpenClass;
    this.burgerActiveClass = burgerActiveClass;
    this.isOpen = false;

    this.handleToggle = this.handleToggle.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
  }

  /** Start listening for toggle clicks. */
  init() {
    if (!this.toggle || !this.nav) return;
    this.toggle.addEventListener('click', this.handleToggle);
    this.nav.addEventListener('click', this.handleNavClick);
  }

  /** Toggle the menu open/closed. */
  handleToggle() {
    this.isOpen = !this.isOpen;
    this.nav.classList.toggle(this.navOpenClass, this.isOpen);
    this.toggle.classList.toggle(this.burgerActiveClass, this.isOpen);
    this.toggle.setAttribute('aria-expanded', String(this.isOpen));
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }

  /** Close the menu when a nav link is clicked. */
  handleNavClick(event) {
    if (event.target.closest('a') && this.isOpen) {
      this.close();
    }
  }

  /** Close the menu programmatically. */
  close() {
    this.isOpen = false;
    this.nav.classList.remove(this.navOpenClass);
    this.toggle.classList.remove(this.burgerActiveClass);
    this.toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /** Clean up event listeners. */
  destroy() {
    if (this.toggle) this.toggle.removeEventListener('click', this.handleToggle);
    if (this.nav) this.nav.removeEventListener('click', this.handleNavClick);
  }
}


// =============================================================================
// SmoothScroll — smooth scrolling for anchor links
// =============================================================================
class SmoothScroll {
  /**
   * @param {string} linkSelector — selector for all scroll-trigger links
   * @param {number} offset — px offset from top (e.g., header height)
   */
  constructor(linkSelector, offset) {
    this.linkSelector = linkSelector;
    this.offset = offset;
    this.handleClick = this.handleClick.bind(this);
  }

  /** Attach click listeners to all matching links. */
  init() {
    document.addEventListener('click', this.handleClick);
  }

  /** Handle click on a scroll link. */
  handleClick(event) {
    const link = event.target.closest(this.linkSelector);
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - this.offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /** Clean up. */
  destroy() {
    document.removeEventListener('click', this.handleClick);
  }
}


// =============================================================================
// ScrollAnimator — fade-in elements as they enter viewport
// =============================================================================
class ScrollAnimator {
  /**
   * @param {string} fadeClass — class marking elements to animate
   * @param {string} visibleClass — class added when visible
   * @param {number} threshold — IntersectionObserver threshold
   */
  constructor(fadeClass, visibleClass, threshold) {
    this.fadeClass = fadeClass;
    this.visibleClass = visibleClass;
    this.threshold = threshold;
    this.observer = null;
  }

  /** Create observer and observe all matching elements. */
  init() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(this.visibleClass);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: this.threshold }
    );

    this.observeAll();
  }

  /** Find and observe all fade-in elements currently in the DOM. */
  observeAll() {
    const elements = document.querySelectorAll(`.${this.fadeClass}`);
    elements.forEach((el) => this.observer.observe(el));
  }

  /** Observe new elements (call after dynamic content renders). */
  refresh() {
    this.observeAll();
  }

  /** Clean up. */
  destroy() {
    if (this.observer) this.observer.disconnect();
  }
}


// =============================================================================
// TeamSection — renders team member cards
// =============================================================================
class TeamSection {
  /**
   * @param {DataService} dataService — shared data service instance
   * @param {string} dataUrl — path to team.json
   * @param {string} containerSelector — selector for the team container
   */
  constructor(dataService, dataUrl, containerSelector) {
    this.dataService = dataService;
    this.dataUrl = dataUrl;
    this.container = document.querySelector(containerSelector);
  }

  /** Load data and render. */
  async init() {
    if (!this.container) return;

    this.container.innerHTML = '<p class="section__loading">Loading team…</p>';

    const data = await this.dataService.fetch(this.dataUrl);
    if (!data) {
      this.container.innerHTML = '<p class="section__error">Team information is currently unavailable. Please try again later.</p>';
      return;
    }

    const renderer = new ComponentRenderer(this.container, this.template);
    renderer.render(data);
    this.attachImageFallbacks();
  }

  /** Generate HTML for a single team member. */
  template(member, index) {
    const initials = member.name.split(' ').map(n => n[0]).join('');

    const specialtiesHtml = member.specialties
      .map(s => `<span class="team__specialty">${escapeHtml(s)}</span>`)
      .join('');

    const socialsHtml = Object.entries(member.socials || {})
      .map(([platform, url]) => {
        const icon = TeamSection.socialIcon(platform);
        const href = safeUrl(url);
        if (!href) return '';
        return `<a href="${href}" class="team__social-link" aria-label="${escapeHtml(member.name)} on ${escapeHtml(platform)}" target="_blank" rel="noopener noreferrer">${icon}</a>`;
      })
      .join('');

    return `
      <article class="team__card fade-in" style="--stagger-index: ${index}">
        <div class="team__photo-wrapper">
          <img
            src="${safeUrl(member.photo)}"
            alt="Portrait of ${escapeHtml(member.name)}, ${escapeHtml(member.role)} at JukaMedical"
            class="team__photo"
            loading="lazy"
            data-initials="${escapeHtml(initials)}"
          >
        </div>
        <div class="team__body">
          <h3 class="team__name">${escapeHtml(member.name)}</h3>
          <p class="team__role">${escapeHtml(member.role)}</p>
          <p class="team__bio">${escapeHtml(member.bio)}</p>
          <div class="team__specialties">${specialtiesHtml}</div>
          <div class="team__footer">
            <span class="team__experience">${escapeHtml(member.experience)}</span>
            <div class="team__socials">${socialsHtml}</div>
          </div>
        </div>
      </article>
    `;
  }

  /** Return an inline SVG icon for a social platform. */
  static socialIcon(platform) {
    const icons = {
      instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>',
      linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="2"/><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="2"/></svg>',
      facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    };
    return icons[platform] || '';
  }

  /** Replace broken images with an initials placeholder. */
  attachImageFallbacks() {
    const images = this.container.querySelectorAll('.team__photo');
    images.forEach((img) => {
      const applyFallback = () => {
        const initials = img.getAttribute('data-initials') || '?';
        const placeholder = document.createElement('div');
        placeholder.className = 'team__photo-placeholder';
        placeholder.textContent = initials;
        placeholder.setAttribute('aria-hidden', 'true');
        img.replaceWith(placeholder);
      };

      img.addEventListener('error', applyFallback);

      // Handle race condition: image may have already failed before the listener was attached
      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      }
    });
  }
}


// =============================================================================
// ServicesSection — renders service categories as a wrapping tab grid
// =============================================================================
class ServicesSection {
  /**
   * @param {DataService} dataService — shared data service instance
   * @param {string} dataUrl — path to services.json
   * @param {string} containerSelector — selector for the services container
   */
  constructor(dataService, dataUrl, containerSelector) {
    this.dataService = dataService;
    this.dataUrl = dataUrl;
    this.container = document.querySelector(containerSelector);
  }

  /** Load data and render. */
  async init() {
    if (!this.container) return;

    this.container.innerHTML = '<p class="section__loading">Loading services…</p>';

    const data = await this.dataService.fetch(this.dataUrl);
    if (!data) {
      this.container.innerHTML = '<p class="section__error">Services are currently unavailable. Please try again later.</p>';
      return;
    }

    this.render(data);
  }

  /** Build wrapping tab grid + panels from JSON data and attach switching logic. */
  render(data) {
    const tabsHtml = data.map((category, i) => `
      <button
        class="services__tab${i === 0 ? ' services__tab--active' : ''}"
        role="tab"
        aria-selected="${i === 0 ? 'true' : 'false'}"
        aria-controls="services-panel-${i}"
        id="services-tab-${i}"
        data-tab="${i}"
      >${escapeHtml(category.category)}</button>
    `).join('');

    const panelsHtml = data.map((category, i) => {
      const itemsHtml = category.items.map(item => this.itemTemplate(item)).join('');
      const hasCategoryDesc = category.description && category.description !== 'n/a';
      const categoryDescHtml = hasCategoryDesc
        ? `<p class="services__panel-desc">${escapeHtml(category.description)}</p>` : '';
      return `
        <div
          class="services__panel${i === 0 ? ' services__panel--active' : ''}"
          role="tabpanel"
          id="services-panel-${i}"
          aria-labelledby="services-tab-${i}"
          ${i !== 0 ? 'hidden' : ''}
        >
          ${categoryDescHtml}
          <div class="services__list">${itemsHtml}</div>
        </div>
      `;
    }).join('');

    const selectOptionsHtml = data.map((category, i) =>
      `<option value="${i}">${escapeHtml(category.category)}</option>`
    ).join('');

    this.container.innerHTML = `
      <div class="services__select-wrapper">
        <select class="services__select" aria-label="Service categories">
          ${selectOptionsHtml}
        </select>
      </div>
      <div class="services__tab-bar" role="tablist" aria-label="Service categories">
        ${tabsHtml}
      </div>
      <div class="services__panels">
        ${panelsHtml}
      </div>
    `;

    const switchPanel = (idx) => {
      this.container.querySelectorAll('.services__tab').forEach((t, i) => {
        const active = i === idx;
        t.classList.toggle('services__tab--active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      this.container.querySelectorAll('.services__panel').forEach((p, i) => {
        const active = i === idx;
        p.classList.toggle('services__panel--active', active);
        if (active) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    };

    // Tab bar click (desktop)
    this.container.querySelector('.services__tab-bar').addEventListener('click', (e) => {
      const tab = e.target.closest('.services__tab');
      if (!tab) return;
      switchPanel(Number(tab.dataset.tab));
    });

    // Select change (mobile)
    this.container.querySelector('.services__select').addEventListener('change', (e) => {
      switchPanel(Number(e.target.value));
    });
  }

  /** Generate HTML for a single service item. */
  itemTemplate(item) {
    const isPopular = item.isPopular === true;
    const popularBadge = isPopular ? '<span class="services__item-badge">Popular</span>' : '';
    const modifierClass = isPopular ? ' services__item--popular' : '';
    const hasDescription = item.description && item.description !== 'n/a';
    const hasDuration = item.duration && item.duration !== 'n/a';
    const descHtml = hasDescription
      ? `<p class="services__item-desc">${escapeHtml(item.description)}</p>` : '';
    const durationHtml = hasDuration
      ? `<span class="services__item-duration">${escapeHtml(item.duration)}</span>` : '';

    return `
      <div class="services__item${modifierClass}">
        <div>
          <div class="services__item-header">
            <span class="services__item-name">${escapeHtml(item.name)}</span>
            ${popularBadge}
          </div>
          ${descHtml}
        </div>
        <div class="services__item-meta">
          ${durationHtml}
          <span class="services__item-price">${escapeHtml(String(item.price))} ${escapeHtml(item.currency)}</span>
        </div>
      </div>
    `;
  }
}


// =============================================================================
// TrainingsSection — renders training program cards
// =============================================================================
class TrainingsSection {
  /**
   * @param {DataService} dataService — shared data service instance
   * @param {string} dataUrl — path to trainings.json
   * @param {string} containerSelector — selector for the trainings container
   */
  constructor(dataService, dataUrl, containerSelector) {
    this.dataService = dataService;
    this.dataUrl = dataUrl;
    this.container = document.querySelector(containerSelector);
  }

  /** Load data and render. */
  async init() {
    if (!this.container) return;

    this.container.innerHTML = '<p class="section__loading">Loading trainings…</p>';

    const data = await this.dataService.fetch(this.dataUrl);
    if (!data) {
      this.container.innerHTML = '<p class="section__error">Training information is currently unavailable. Please try again later.</p>';
      return;
    }

    const renderer = new ComponentRenderer(this.container, this.template.bind(this));
    renderer.render(data);
    this.attachImageFallbacks();
  }

  /** Generate HTML for a single training card. */
  template(training, index) {
    const levelClass = training.level.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const levelModifier = levelClass === 'beginner' ? '' : ` trainings__level--${levelClass}`;

    const includesHtml = training.includes
      .map(item => `<span class="trainings__includes-item">${escapeHtml(item)}</span>`)
      .join('');

    const availabilityHtml = this.availabilityText(training);

    return `
      <article class="trainings__card fade-in" style="--stagger-index: ${index}">
        <div class="trainings__image-wrapper">
          <img
            src="${safeUrl(training.image)}"
            alt="${escapeHtml(training.title)} — professional podology training at JukaMedical"
            class="trainings__image"
            loading="lazy"
          >
        </div>
        <div class="trainings__body">
          <div class="trainings__meta">
            <span class="trainings__level${levelModifier}">${escapeHtml(training.level)}</span>
            <span class="trainings__duration-badge">${escapeHtml(training.duration)}</span>
          </div>
          <h3 class="trainings__title">${escapeHtml(training.title)}</h3>
          <p class="trainings__desc">${escapeHtml(training.description)}</p>
          <div class="trainings__includes">
            <p class="trainings__includes-label">Includes</p>
            <div class="trainings__includes-list">${includesHtml}</div>
          </div>
          <div class="trainings__footer">
            <div>
              <span class="trainings__price">${escapeHtml(String(training.price))}</span>
              <span class="trainings__price-currency">${escapeHtml(training.currency)}</span>
            </div>
            ${availabilityHtml}
          </div>
        </div>
      </article>
    `;
  }

  /** Build availability text from nextDate and spotsAvailable. */
  availabilityText(training) {
    if (!training.nextDate) {
      return '<span class="trainings__availability trainings__availability--tba">Dates coming soon</span>';
    }

    const date = new Date(training.nextDate);
    const formatted = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const spots = training.spotsAvailable !== null
      ? ` · ${training.spotsAvailable} spots left`
      : '';

    return `<span class="trainings__availability trainings__availability--soon">${formatted}${spots}</span>`;
  }

  /** Replace broken images with a styled placeholder. */
  attachImageFallbacks() {
    const images = this.container.querySelectorAll('.trainings__image');
    images.forEach((img) => {
      const applyFallback = () => {
        const placeholder = document.createElement('div');
        placeholder.className = 'trainings__image-placeholder';
        placeholder.textContent = 'Training';
        placeholder.setAttribute('aria-hidden', 'true');

        // Apply a soft gradient background
        const gradients = [
          'linear-gradient(135deg, #ddeece, #FAFAF9)',
          'linear-gradient(135deg, #ffd4d4, #FAFAF9)',
          'linear-gradient(135deg, #BCD9A2, #ffd4d4)',
          'linear-gradient(135deg, #F4F3F0, #ddeece)',
        ];
        const idx = Math.floor(Math.random() * gradients.length);
        placeholder.style.background = gradients[idx];

        img.replaceWith(placeholder);
      };

      img.addEventListener('error', applyFallback);

      // Handle race condition: image may have already failed before the listener was attached
      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      }
    });
  }
}


// =============================================================================
// App — bootstraps all components (single entry point)
// =============================================================================
class App {
  constructor() {
    this.dataService = new DataService();
    this.components = [];
  }

  /** Initialize all components. */
  async init() {
    // UI components (no data needed)
    const stickyHeader = new StickyHeader(
      CONFIG.selectors.header,
      CONFIG.classes.headerScrolled,
      CONFIG.stickyThreshold
    );
    stickyHeader.init();
    this.components.push(stickyHeader);

    const mobileNav = new MobileNav(
      CONFIG.selectors.navToggle,
      CONFIG.selectors.nav,
      CONFIG.classes.navOpen,
      CONFIG.classes.burgerActive
    );
    mobileNav.init();
    this.components.push(mobileNav);

    const smoothScroll = new SmoothScroll(
      CONFIG.selectors.scrollLinks,
      CONFIG.scrollOffset
    );
    smoothScroll.init();
    this.components.push(smoothScroll);

    // Data-driven sections (loaded in parallel)
    const teamSection = new TeamSection(
      this.dataService,
      CONFIG.data.team,
      CONFIG.selectors.teamContainer
    );

    const servicesSection = new ServicesSection(
      this.dataService,
      CONFIG.data.services,
      CONFIG.selectors.servicesContainer
    );

    const trainingsSection = new TrainingsSection(
      this.dataService,
      CONFIG.data.trainings,
      CONFIG.selectors.trainingsContainer
    );

    // Load all data sections in parallel.
    // allSettled ensures a single failed section doesn't block the others from rendering.
    const results = await Promise.allSettled([
      teamSection.init(),
      servicesSection.init(),
      trainingsSection.init(),
    ]);

    const sectionNames = ['Team', 'Services', 'Trainings'];
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`[App] ${sectionNames[i]} section failed to load:`, result.reason);
      }
    });

    // Initialize scroll animations after dynamic content is rendered
    const scrollAnimator = new ScrollAnimator(
      CONFIG.classes.fadeIn,
      CONFIG.classes.fadeInVisible,
      CONFIG.observerThreshold
    );
    scrollAnimator.init();
    this.components.push(scrollAnimator);
  }
}


// =============================================================================
// Bootstrap — start the application when DOM is ready
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
