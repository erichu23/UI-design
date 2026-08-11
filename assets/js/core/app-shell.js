/* =========================================================
   平台外壳脚本：Footer 高度 / 侧边栏 / iframe 模块切换
   iframe 内页面通过 window.parent.enterWorkbook 调用这里。
   ========================================================= */

(function () {
  function syncFooterHeight() {
    var footer = document.getElementById('app-footer');
    if (!footer) return;
    var h = footer.offsetHeight || 76;
    document.documentElement.style.setProperty('--footer-h', h + 'px');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncFooterHeight);
  } else {
    syncFooterHeight();
  }

  window.addEventListener('load', syncFooterHeight);
  window.addEventListener('resize', syncFooterHeight);
})();

function toggleSb(el){
  el.classList.toggle('open');
}

function initCollapsedSidebarFlyout(){
  const sidebar = document.getElementById('appSidebar');
  if (!sidebar) return;

  let flyout = document.getElementById('sidebarFlyout');
  if (!flyout) {
    flyout = document.createElement('div');
    flyout.id = 'sidebarFlyout';
    flyout.className = 'sidebar-flyout';
    document.body.appendChild(flyout);
  }

  let hideTimer = null;
  let activeGroup = null;

  const closeFlyout = () => {
    flyout.classList.remove('is-open');
    activeGroup = null;
  };

  const scheduleClose = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(closeFlyout, 160);
  };

  const cancelClose = () => {
    clearTimeout(hideTimer);
  };

  const getGroupTitle = (group) => group.querySelector(':scope > .sb-toggle-head .sb-txt')?.textContent.trim() || '';
  const getGroupIconClass = (group) => group.querySelector(':scope > .sb-toggle-head .ico')?.className || 'fa-regular fa-folder ico';

  const renderFlyout = (group) => {
    const title = getGroupTitle(group);
    const iconClass = getGroupIconClass(group);
    const rows = Array.from(group.querySelectorAll(':scope > .sb-submenu > .sb-row'));
    const itemsHtml = rows.length ? rows.map((row, index) => {
      const text = row.querySelector('.sb-txt')?.textContent.trim() || '未命名页面';
      const icon = row.querySelector('i')?.className || 'fa-regular fa-circle ico';
      const disabled = !row.getAttribute('onclick');
      const current = row.classList.contains('current');
      return `
        <button class="sidebar-flyout-item ${current ? 'is-current' : ''} ${disabled ? 'is-disabled' : ''}"
                type="button"
                data-flyout-index="${index}"
                ${disabled ? 'disabled' : ''}>
          <i class="${icon}"></i>
          <span>${text}</span>
          <small>${disabled ? '待配置' : '进入'}</small>
        </button>
      `;
    }).join('') : '<div class="sidebar-flyout-empty">暂无可进入页面</div>';

    flyout.innerHTML = `
      <div class="sidebar-flyout-head">
        <i class="${iconClass}"></i>
        <span>${title}</span>
      </div>
      <div class="sidebar-flyout-list">${itemsHtml}</div>
    `;

    flyout.querySelectorAll('[data-flyout-index]').forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const row = rows[Number(btn.dataset.flyoutIndex)];
        if (!row || !row.getAttribute('onclick')) return;
        row.click();
        closeFlyout();
      });
    });
  };

  const openFlyout = (group) => {
    if (!sidebar.classList.contains('is-collapsed')) return;
    cancelClose();
    activeGroup = group;
    renderFlyout(group);
    const rect = group.querySelector(':scope > .sb-toggle-head')?.getBoundingClientRect() || group.getBoundingClientRect();
    const top = Math.min(Math.max(rect.top - 8, 50), window.innerHeight - flyout.offsetHeight - 12);
    flyout.style.left = `${rect.right + 8}px`;
    flyout.style.top = `${top}px`;
    flyout.classList.add('is-open');
  };

  sidebar.querySelectorAll('.sb-toggle').forEach(group => {
    const head = group.querySelector(':scope > .sb-toggle-head');
    if (!head) return;
    head.addEventListener('mouseenter', () => openFlyout(group));
    head.addEventListener('focusin', () => openFlyout(group));
    head.addEventListener('click', (event) => {
      if (!sidebar.classList.contains('is-collapsed')) return;
      event.preventDefault();
      event.stopPropagation();
      if (activeGroup === group && flyout.classList.contains('is-open')) closeFlyout();
      else openFlyout(group);
    });
  });

  sidebar.addEventListener('mouseleave', scheduleClose);
  flyout.addEventListener('mouseenter', cancelClose);
  flyout.addEventListener('mouseleave', scheduleClose);
  window.addEventListener('resize', closeFlyout);
  document.addEventListener('click', (event) => {
    if (!flyout.contains(event.target) && !sidebar.contains(event.target)) closeFlyout();
  });
}

const APP_FRAME_STATE_KEY = 'auditCompass.currentFrameState';
const DEFAULT_PROJECT = 'Test2';
const DEFAULT_BOOK = '20251022';
const BANK_ANALYSIS_SRC = './fragments/bank-analysis.html?v=20260811-guide-right1';
const DATA_MANAGEMENT_SRC = './fragments/data-management.html?v=20260811-balance-restore1';
const DATA_SUMMARY_SRC = './fragments/data-summary.html?v=20260811-unit5';
const WORKINGPAPER_EXPORT_SRC = './fragments/workingpaper-export.html?v=20260811-materiality1';
const PROJECT_LIST_SRC = './fragments/project-list.html';
const AMOUNT_UNIT_KEY = 'auditCompass.amountUnit';
const AMOUNT_DECIMAL_KEY = 'auditCompass.amountDecimals';
const AMOUNT_UNIT_LABELS = { yuan:'元', k:'千元/K', w:'万元/W', m:'百万元/M', b:'亿元/B' };

function getAmountDisplayState(){
  const storedUnit = localStorage.getItem(AMOUNT_UNIT_KEY);
  const unit = AMOUNT_UNIT_LABELS[storedUnit] ? storedUnit : 'm';
  const decimals = Math.max(0, Math.min(4, Number(localStorage.getItem(AMOUNT_DECIMAL_KEY) ?? 0) || 0));
  if (!storedUnit) localStorage.setItem(AMOUNT_UNIT_KEY, unit);
  return { unit, decimals };
}

function syncAmountDisplayControls(){
  const { unit, decimals } = getAmountDisplayState();
  const unitValue = document.getElementById('amountUnitValue');
  const decimalValue = document.getElementById('amountDecimalValue');
  if (unitValue) unitValue.textContent = AMOUNT_UNIT_LABELS[unit];
  if (decimalValue) decimalValue.textContent = decimals === 0 ? '0' : `0.${'0'.repeat(decimals)}`;
  document.querySelectorAll('#amountUnitMenu [data-value]').forEach(item => {
    const selected = item.dataset.value === unit;
    item.classList.toggle('is-selected', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  document.querySelectorAll('#amountDecimalMenu [data-value]').forEach(item => {
    const selected = Number(item.dataset.value) === decimals;
    item.classList.toggle('is-selected', selected);
    item.setAttribute('aria-selected', String(selected));
  });
}

function reloadCurrentModuleForAmountDisplay(){
  const frame = document.getElementById('module-frame');
  try { frame?.contentWindow?.location.reload(); } catch (error) { if (frame) frame.src = frame.src; }
}

function injectAmountUnitRuntime(){
  const frame = document.getElementById('module-frame');
  const doc = frame?.contentDocument;
  if (!doc?.head || doc.getElementById('auditUnitRuntime')) return;
  const script = doc.createElement('script');
  script.id = 'auditUnitRuntime';
  script.src = new URL('./assets/js/core/unit-runtime.js?v=20260811-unit-sync1', window.location.href).href;
  doc.head.appendChild(script);
}

function initAmountDisplayControls(){
  syncAmountDisplayControls();
  const dropdowns = Array.from(document.querySelectorAll('.header-dropdown'));
  const hoverTimers = new WeakMap();
  const setDropdownOpen = (dropdown, open) => {
    if (!dropdown) return;
    dropdown.classList.toggle('is-open', open);
    dropdown.querySelector('.header-btn')?.setAttribute('aria-expanded', String(open));
  };
  const clearHoverTimer = dropdown => {
    const timer = hoverTimers.get(dropdown);
    if (timer) window.clearTimeout(timer);
    hoverTimers.delete(dropdown);
  };
  const closeDropdowns = except => dropdowns.forEach(dropdown => {
    if (dropdown === except) return;
    clearHoverTimer(dropdown);
    setDropdownOpen(dropdown, false);
  });
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.header-btn');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!button || !menu) return;
    dropdown.addEventListener('pointerenter', () => {
      clearHoverTimer(dropdown);
      closeDropdowns(dropdown);
      const timer = window.setTimeout(() => setDropdownOpen(dropdown, true), 70);
      hoverTimers.set(dropdown, timer);
    });
    dropdown.addEventListener('pointerleave', () => {
      clearHoverTimer(dropdown);
      const timer = window.setTimeout(() => setDropdownOpen(dropdown, false), 260);
      hoverTimers.set(dropdown, timer);
    });
    button.addEventListener('click', event => {
      event.stopPropagation();
      clearHoverTimer(dropdown);
      closeDropdowns(dropdown);
      setDropdownOpen(dropdown, true);
      menu.querySelector('.is-selected')?.focus({preventScroll:true});
    });
    menu.addEventListener('click', event => event.stopPropagation());
  });
  document.querySelectorAll('#amountUnitMenu [data-value]').forEach(item => item.addEventListener('click', event => {
    event.stopPropagation();
    localStorage.setItem(AMOUNT_UNIT_KEY, item.dataset.value);
    syncAmountDisplayControls();
    closeDropdowns();
    reloadCurrentModuleForAmountDisplay();
  }));
  document.querySelectorAll('#amountDecimalMenu [data-value]').forEach(item => item.addEventListener('click', event => {
    event.stopPropagation();
    localStorage.setItem(AMOUNT_DECIMAL_KEY, item.dataset.value);
    syncAmountDisplayControls();
    closeDropdowns();
    reloadCurrentModuleForAmountDisplay();
  }));
  document.addEventListener('click', () => closeDropdowns());
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDropdowns(); });
  const frame = document.getElementById('module-frame');
  frame?.addEventListener('load', () => window.setTimeout(injectAmountUnitRuntime, 0));
  if (frame?.contentDocument?.readyState === 'complete') injectAmountUnitRuntime();
}

function normalizeFrameSrc(src){
  if (!src) return src;
  if (src.includes('bank-analysis.html')) return BANK_ANALYSIS_SRC;
  if (src.includes('data-management.html')) return DATA_MANAGEMENT_SRC;
  if (src.includes('data-upload.html')) return DATA_MANAGEMENT_SRC;
  if (src.includes('data-validation.html')) return DATA_MANAGEMENT_SRC;
  if (src.includes('data-summary.html')) return DATA_SUMMARY_SRC;
  if (src.includes('workingpaper-export.html')) return WORKINGPAPER_EXPORT_SRC;
  return src;
}

function getWorkspaceContext(){
  const crumbProject = document.getElementById('crumbProject')?.textContent || DEFAULT_PROJECT;
  const crumbBook = document.getElementById('crumbBook')?.textContent || DEFAULT_BOOK;
  return {
    project: crumbProject === '项目列表' ? DEFAULT_PROJECT : crumbProject,
    book: crumbBook === '-' ? DEFAULT_BOOK : crumbBook
  };
}

function saveFrameState(src, title, project, book){
  try {
    localStorage.setItem(APP_FRAME_STATE_KEY, JSON.stringify({
      src: normalizeFrameSrc(src),
      title,
      project: project || DEFAULT_PROJECT,
      book: book || DEFAULT_BOOK
    }));
  } catch (e) {
    // localStorage 不可用时不影响页面切换。
  }
}

function clearFrameState(){
  try {
    localStorage.removeItem(APP_FRAME_STATE_KEY);
  } catch (e) {}
}

function getSavedFrameState(){
  try {
    return JSON.parse(localStorage.getItem(APP_FRAME_STATE_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

function setCurrentModuleBySrc(src){
  const baseSrc = (src || '').split('?')[0];
  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('current'));
  const matched = Array.from(document.querySelectorAll('.module-item')).find(item => {
    const action = item.getAttribute('onclick') || '';
    return baseSrc && action.includes(baseSrc);
  });
  if (matched) matched.classList.add('current');
}

function setProjectListState(){
  const sidebar = document.getElementById('appSidebar');
  const titleEl = document.getElementById('module-title');
  const crumbProject = document.getElementById('crumbProject');
  const crumbBook = document.getElementById('crumbBook');

  if (sidebar) sidebar.classList.add('is-project-list');
  if (titleEl) titleEl.textContent = '项目列表';
  if (crumbProject) crumbProject.textContent = '项目列表';
  if (crumbBook) crumbBook.textContent = '-';
  const issueEntry = document.getElementById('breadcrumbDataIssue');
  if (issueEntry) issueEntry.hidden = true;

  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('current'));
  document.querySelector('.current-project-list')?.classList.add('current');
}

function setWorkspaceState(project, book, title){
  const sidebar = document.getElementById('appSidebar');
  const titleEl = document.getElementById('module-title');
  const crumbProject = document.getElementById('crumbProject');
  const crumbBook = document.getElementById('crumbBook');

  if (sidebar) sidebar.classList.remove('is-project-list');
  if (titleEl) titleEl.textContent = title || '银行流水分析';
  if (crumbProject) crumbProject.textContent = project || 'Test2';
  if (crumbBook) crumbBook.textContent = book || '20251022';
  const issueEntry = document.getElementById('breadcrumbDataIssue');
  if (issueEntry) issueEntry.hidden = title !== '银行流水分析';

  document.querySelector('.current-project-list')?.classList.remove('current');
}

function goProjectList(){
  const frame = document.getElementById('module-frame');
  const breadcrumb = document.getElementById('breadcrumbBar');

  if (frame) frame.src = PROJECT_LIST_SRC;
  if (breadcrumb) breadcrumb.style.display = 'none';

  clearFrameState();
  setProjectListState();
}

function switchFrame(src, title, el){
  const frame = document.getElementById('module-frame');
  const breadcrumb = document.getElementById('breadcrumbBar');
  const ctx = getWorkspaceContext();
  const nextSrc = normalizeFrameSrc(src);

  if (frame) frame.src = nextSrc;
  if (breadcrumb) breadcrumb.style.display = 'flex';

  setWorkspaceState(ctx.project, ctx.book, title);

  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('current'));
  if (el) el.classList.add('current');

  saveFrameState(nextSrc, title, ctx.project, ctx.book);
}

function enterWorkbook(project, book){
  const frame = document.getElementById('module-frame');
  const bankMenu = document.querySelector('.module-item.bank-analysis');
  const breadcrumb = document.getElementById('breadcrumbBar');

  if (frame) frame.src = BANK_ANALYSIS_SRC;
  if (breadcrumb) breadcrumb.style.display = 'flex';

  setWorkspaceState(project, book, '银行流水分析');

  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('current'));
  if (bankMenu) bankMenu.classList.add('current');

  saveFrameState(BANK_ANALYSIS_SRC, '银行流水分析', project, book);
}

document.getElementById('backToProjectList')?.addEventListener('click', function(){
  goProjectList();
});

document.getElementById('breadcrumbDataIssueLink')?.addEventListener('click', function(){
  try { localStorage.setItem('dataManagement.activeTab', 'verify'); } catch (e) {}
  const menu = document.querySelector('.module-item.data-management');
  switchFrame(DATA_MANAGEMENT_SRC, '数据上传及管理', menu);
});

function restoreFrameState(){
  const frame = document.getElementById('module-frame');
  const breadcrumb = document.getElementById('breadcrumbBar');
  const saved = getSavedFrameState();

  if (!saved || !saved.src || saved.src.includes('project-list.html')) {
    if (frame) frame.src = PROJECT_LIST_SRC;
    if (breadcrumb) breadcrumb.style.display = 'none';
    setProjectListState();
    return;
  }

  const restoredSrc = normalizeFrameSrc(saved.src);
  if (frame) frame.src = restoredSrc;
  if (breadcrumb) breadcrumb.style.display = 'flex';
  setWorkspaceState(saved.project, saved.book, saved.title);
  setCurrentModuleBySrc(restoredSrc);
  saveFrameState(restoredSrc, saved.title, saved.project, saved.book);
}

(function(){
  const sidebar = document.getElementById('appSidebar');
  const toggle = document.getElementById('sidebarToggle');

  if (toggle && sidebar){
    toggle.addEventListener('click', function(){
      sidebar.classList.toggle('is-collapsed');
      document.getElementById('sidebarFlyout')?.classList.remove('is-open');
    });
  }

  initCollapsedSidebarFlyout();
  initAmountDisplayControls();
  restoreFrameState();
})();
