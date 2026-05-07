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

function setProjectListState(){
  const sidebar = document.getElementById('appSidebar');
  const titleEl = document.getElementById('module-title');
  const crumbProject = document.getElementById('crumbProject');
  const crumbBook = document.getElementById('crumbBook');

  if (sidebar) sidebar.classList.add('is-project-list');
  if (titleEl) titleEl.textContent = '项目列表';
  if (crumbProject) crumbProject.textContent = '项目列表';
  if (crumbBook) crumbBook.textContent = '-';

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

  document.querySelector('.current-project-list')?.classList.remove('current');
}

function goProjectList(){
  const frame = document.getElementById('module-frame');
  const breadcrumb = document.getElementById('breadcrumbBar');

  if (frame) frame.src = './fragments/project-list.html';
  if (breadcrumb) breadcrumb.style.display = 'none';

  setProjectListState();
}

function switchFrame(src, title, el){
  const frame = document.getElementById('module-frame');
  const breadcrumb = document.getElementById('breadcrumbBar');

  if (frame) frame.src = src;
  if (breadcrumb) breadcrumb.style.display = 'flex';

  setWorkspaceState(
    document.getElementById('crumbProject')?.textContent || 'Test2',
    document.getElementById('crumbBook')?.textContent || '20251022',
    title
  );

  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('current'));
  if (el) el.classList.add('current');
}

function enterWorkbook(project, book){
  const frame = document.getElementById('module-frame');
  const bankMenu = document.querySelector('.module-item.bank-analysis');
  const breadcrumb = document.getElementById('breadcrumbBar');

  if (frame) frame.src = './fragments/bank-analysis.html';
  if (breadcrumb) breadcrumb.style.display = 'flex';

  setWorkspaceState(project, book, '银行流水分析');

  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('current'));
  if (bankMenu) bankMenu.classList.add('current');
}

document.addEventListener("DOMContentLoaded",function(){
  const breadcrumb = document.getElementById('breadcrumbBar');

  if(breadcrumb) breadcrumb.style.display = "none";
});

document.getElementById('backToProjectList')?.addEventListener('click', function(){
  goProjectList();
});

(function(){
  const sidebar = document.getElementById('appSidebar');
  const toggle = document.getElementById('sidebarToggle');

  if (toggle && sidebar){
    toggle.addEventListener('click', function(){
      sidebar.classList.toggle('is-collapsed');
    });
  }

  // 平台默认打开项目列表
  setProjectListState();
})();
