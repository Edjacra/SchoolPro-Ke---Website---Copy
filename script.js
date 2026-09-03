// SchoolPro Ke — shared site behaviour
(function () {
  // Use the dedicated SchoolPro Ke favicon in the browser tab.
  const favicon = document.querySelector('link[rel~="icon"]');
  if (favicon) {
    favicon.href = 'assets/SchoolProKeFavicon.png';
    favicon.type = 'image/png';
  }

  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
  }

  // Dropdown toggle on tap for touch/mobile (desktop uses hover via CSS)
  document.querySelectorAll('.has-dropdown > button.nav-top-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.has-dropdown');
      const isOpen = parent.classList.contains('open');
      document.querySelectorAll('.has-dropdown.open').forEach((el) => {
        if (el !== parent) el.classList.remove('open');
      });
      parent.classList.toggle('open', !isOpen);
    });
  });

  // Keep the "Who It's For" menu consistent on every page, including pages
  // that still contain the older combined Registrar/Accountant link.
  const roleLinks = {
    'For Principals': ['for-roles.html?role=principals', 'A school-wide dashboard, every approval in one place'],
    'For Teachers': ['for-roles.html?role=teachers', 'Class and subject-teacher workspaces'],
    'For Parents': ['for-roles.html?role=parents', "Each child's fees, learning and school life"],
    'For Registrars': ['for-registrars-accountants.html', 'Admissions, staff accounts and timetables'],
    'For Accountants': ['for-roles.html?role=accountants', 'Fees, notices and collection insights'],
    'For Librarians': ['for-librarians.html', 'Catalogue, issue and track returns']
  };
  const firstTextNode = (link) => Array.from(link.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()
  );
  document.querySelectorAll('.dropdown-item').forEach((link) => {
    const labelNode = firstTextNode(link);
    const label = labelNode && labelNode.nodeValue.trim();
    if (label === 'For Registrars & Accountants') {
      labelNode.nodeValue = 'For Registrars';
      link.href = roleLinks['For Registrars'][0];
      const subLabel = link.querySelector('.item-sub');
      if (subLabel) subLabel.textContent = roleLinks['For Registrars'][1];

      const accountantLink = link.cloneNode(true);
      const accountantLabel = firstTextNode(accountantLink);
      accountantLabel.nodeValue = 'For Accountants';
      accountantLink.href = roleLinks['For Accountants'][0];
      accountantLink.querySelector('.item-sub').textContent = roleLinks['For Accountants'][1];
      link.insertAdjacentElement('afterend', accountantLink);
    } else if (label && roleLinks[label]) {
      link.href = roleLinks[label][0];
      const subLabel = link.querySelector('.item-sub');
      if (subLabel) subLabel.textContent = roleLinks[label][1];
    }
  });

  // Each resource entry opens its own focused page while keeping the shared
  // navigation markup reusable across the site.
  const resourceLinks = {
    'Help Center / Docs': 'resource-detail.html?resource=help-center',
    'Product Blog': 'resource-detail.html?resource=blog',
    'Customer Case Studies': 'resource-detail.html?resource=case-studies',
    'System Status': 'resource-detail.html?resource=status'
  };
  document.querySelectorAll('.dropdown-item').forEach((link) => {
    const labelNode = firstTextNode(link);
    const label = labelNode && labelNode.nodeValue.trim();
    if (label && resourceLinks[label]) link.href = resourceLinks[label];
  });

  // Close mobile menu when a real link is followed
  document.querySelectorAll('.nav-menu-wrap a').forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  });

  // Role-based tabs (For Principals / For Teachers / For Parents)
  const roleTabs = document.querySelectorAll('.role-tab');
  const rolePanels = document.querySelectorAll('.role-panel');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const roleExamples = new Map();
  rolePanels.forEach((panel) => {
    const example = panel.querySelector('.role-example p');
    if (example) roleExamples.set(panel.dataset.role, example.textContent);
  });

  function typeRoleExample(role) {
    const panel = document.querySelector('.role-panel[data-role="' + role + '"]');
    const example = panel && panel.querySelector('.role-example p');
    const text = roleExamples.get(role);
    if (!example || !text || reduceMotion) return;

    window.clearTimeout(example.typewriterTimer);
    example.textContent = '';
    const duration = role === 'principals' ? 1600 : 1000;
    const interval = duration / text.length;
    let characterIndex = 0;

    const typeNextCharacter = () => {
      example.textContent += text[characterIndex++];
      if (characterIndex < text.length) {
        example.typewriterTimer = window.setTimeout(typeNextCharacter, interval);
      }
    };
    typeNextCharacter();
  }

  function activateRole(role, animateExample = true) {
    roleTabs.forEach((t) => t.classList.toggle('active', t.dataset.role === role));
    rolePanels.forEach((p) => p.classList.toggle('active', p.dataset.role === role));
    if (animateExample) typeRoleExample(role);
  }
  roleTabs.forEach((tab) => {
    tab.addEventListener('click', () => activateRole(tab.dataset.role));
  });

  // Allow header links like index.html#roles?role=teachers to preselect a tab
  function applyRoleFromHash() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    if (role && document.querySelector('.role-tab[data-role="' + role + '"]')) {
      activateRole(role, false);
    }
  }
  applyRoleFromHash();

  // Reveal the initial Principal dashboard summary only when the role section
  // is reached; the other summaries replay when their tabs are selected.
  const rolesSection = document.getElementById('roles');
  if (rolesSection && !reduceMotion && 'IntersectionObserver' in window) {
    const roleObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        roleObserver.disconnect();
        const activeTab = document.querySelector('.role-tab.active');
        if (activeTab) typeRoleExample(activeTab.dataset.role);
      }
    }, { threshold: 0.2 });
    roleObserver.observe(rolesSection);
  }

  // Type the Core Pillars copy once it comes into view. The source HTML remains
  // intact for visitors without JavaScript and for search engines.
  const corePillars = document.getElementById('core-sis');
  if (corePillars && !reduceMotion && 'IntersectionObserver' in window) {
    const textNodes = [];
    const walker = document.createTreeWalker(corePillars, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push({ node, text: node.nodeValue });
    }

    const typePillars = () => {
      const totalCharacters = textNodes.reduce((total, item) => total + item.text.length, 0);
      const duration = 5500;
      const interval = duration / totalCharacters;
      let nodeIndex = 0;
      let characterIndex = 0;

      textNodes.forEach((item) => { item.node.nodeValue = ''; });
      corePillars.classList.add('is-typing');

      const typeNextCharacter = () => {
        const current = textNodes[nodeIndex];
        if (!current) {
          corePillars.classList.remove('is-typing');
          return;
        }

        current.node.nodeValue += current.text[characterIndex++];
        if (characterIndex === current.text.length) {
          nodeIndex++;
          characterIndex = 0;
        }
        window.setTimeout(typeNextCharacter, interval);
      };
      typeNextCharacter();
    };

    const pillarObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        pillarObserver.disconnect();
        typePillars();
      }
    }, { threshold: 0.2 });
    pillarObserver.observe(corePillars);
  }

  // Use the homepage footer as the single footer for the whole site.
  const sharedFooter = document.querySelector('.footer');
  if (sharedFooter) {
    sharedFooter.innerHTML = `
      <div class="container footer-top">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="index.html" class="logo-link"><img src="assets/logo.png" alt="SchoolPro Ke logo" style="height:44px;width:44px;border-radius:10px;"></a>
            <p class="footer-brand-desc">Simplify. Manage. Achieve. One platform for Kenyan schools to run admissions, fees, academics and communication.</p>
            <div class="social-row">
              <a href="https://web.facebook.com/qiqiagns.edwin" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i class="fab fa-x-twitter"></i></a>
              <a href="https://web.facebook.com/qiqiagns.edwin" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="https://web.facebook.com/qiqiagns.edwin" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="https://web.facebook.com/qiqiagns.edwin" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
              <a href="https://web.facebook.com/qiqiagns.edwin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div class="footer-col"><h4>Product Modules</h4><ul class="footer-links">
            <li><a href="index.html#core-sis">Student Information System</a></li>
            <li><a href="index.html#fee-management">Fee &amp; Attendance Tracking</a></li>
            <li><a href="index.html#core-sis">Admission Automation</a></li>
            <li><a href="index.html#core-sis">CBC Exams &amp; Report Cards</a></li>
          </ul></div>
          <div class="footer-col"><h4>Resources</h4><ul class="footer-links">
            <li><a href="resource-detail.html?resource=help-center">Help Center / Docs</a></li>
            <li><a href="resource-detail.html?resource=blog">Product Blog</a></li>
            <li><a href="resource-detail.html?resource=case-studies">Customer Case Studies</a></li>
            <li><a href="resource-detail.html?resource=status">System Status Page</a></li>
          </ul></div>
          <div class="footer-col"><h4>Company &amp; Contact</h4><ul class="footer-links">
            <li><a href="contact.html">About Us</a></li>
            <li><a href="contact.html">Contact Sales</a></li>
            <li><a href="contact.html">Book a Demo</a></li>
          </ul>
          <div class="footer-contact-item" style="margin-top:14px;"><i class="fas fa-phone"></i><a href="tel:+254740682321">+254 740 682321</a></div>
          <div class="footer-contact-item"><i class="fas fa-envelope"></i><a href="mailto:schoolproke@gmail.com">schoolproke@gmail.com</a></div></div>
        </div>
      </div>
      <div class="container footer-bottom">
        <div class="footer-bottom-left"><p>&copy; 2026 SchoolPro Ke. All rights reserved.</p><p class="powered-by">Powered and Developed by <a href="https://velocetechcompany.com/" target="_blank" rel="noopener noreferrer">Veloce Tech Company</a></p></div>
        <div><a href="privacy-policy.html">Privacy Policy</a><a href="terms.html">Terms of Service</a></div>
      </div>`;
  }

  // Header shadow-on-scroll (subtle, no layout shift)
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 8 ? '0 1px 0 rgba(18,27,62,0.06)' : 'none';
    }, { passive: true });
  }
})();
