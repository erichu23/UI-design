(function(){
  const rowsEl = document.getElementById('projectWorkbookRows');
  const pagerEl = document.getElementById('projectWorkbookPager');
  const searchInput = document.querySelector('.pl-search input');
  const searchButton = document.querySelector('.pl-search button');
  const card = document.querySelector('.pl-card');
  const projectSearchEmpty = document.getElementById('projectSearchEmpty');
  const foldButton = document.getElementById('projectCardFold');
  const toast = document.getElementById('projectListToast');
  const workbookCount = document.getElementById('projectWorkbookCount');
  const createModal = document.getElementById('createWorkbookModal');
  const createForm = document.getElementById('createWorkbookForm');
  const modalTitle = document.getElementById('createWorkbookTitle');
  const formSubmit = document.getElementById('workbookFormSubmit');
  if (!rowsEl || !pagerEl) return;

  const WORKBOOKS_KEY = 'auditCompass.projectWorkbooks';
  const MATERIALITY_KEY = 'auditCompass.workingpaperMateriality';
  const MATERIALITY_BY_BOOK_KEY = 'auditCompass.workingpaperMaterialityByWorkbook';
  const defaultWorkbooks = [{
    name:'20251022',
    files:2,
    updated:'2026-04-08',
    period:'2026-04-01 - 2026-05-29',
    remark:'',
    analysisStart:'2026-04-01',
    analysisEnd:'2026-05-29',
    reportStart:'2026-04-01',
    reportEnd:'2026-05-29',
    ipo:false,
    pie:false,
    capitalMarket:'',
    fiscalYearEnd:'12-31',
    materiality:1000000
  }];
  const loadWorkbooks = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(WORKBOOKS_KEY) || 'null');
      return Array.isArray(saved) && saved.length ? saved : defaultWorkbooks.slice();
    } catch (error) {
      return defaultWorkbooks.slice();
    }
  };
  let workbooks = loadWorkbooks();
  let editingWorkbookName = null;

  const state = {
    page:1,
    pageSize:20,
    search:'',
    sortKey:'updated',
    sortDirection:'desc',
    filters:{name:'',files:'',updated:'',period:'',reportPeriod:'',fiscalYearEnd:'',ipo:'',pie:'',materiality:''}
  };
  let toastTimer = null;

  const projectMatchesSearch = search => {
    if (!search) return true;
    return [
      card?.dataset.projectNumber,
      card?.dataset.projectName,
      card?.dataset.customerName
    ].some(value => String(value || '').trim().toLowerCase() === search);
  };

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-show'), 1800);
  };

  const saveWorkbooks = () => {
    try { localStorage.setItem(WORKBOOKS_KEY, JSON.stringify(workbooks)); } catch (error) {}
  };

  const reportPeriod = row => row.reportPeriod || (row.reportStart && row.reportEnd ? `${row.reportStart} - ${row.reportEnd}` : '');
  const workbookValue = (row, key) => {
    if (key === 'reportPeriod') return reportPeriod(row);
    if (key === 'ipo') return row.ipo === true ? `是 ${row.capitalMarket || ''}` : '否';
    if (key === 'pie') return row.ipo === true ? '不适用' : row.pie === true ? `是 ${row.capitalMarket || ''}` : '否';
    return row[key] ?? '';
  };

  const filteredRows = () => {
    const search = state.search.trim().toLowerCase();
    const projectMatched = projectMatchesSearch(search);
    const filtered = workbooks.filter(row => {
      if (search && !projectMatched && String(row.name || '').trim().toLowerCase() !== search) return false;
      return Object.entries(state.filters).every(([key, value]) => {
        if (!value) return true;
        return String(workbookValue(row,key)).toLowerCase().includes(String(value).trim().toLowerCase());
      });
    });
    return filtered.sort((a, b) => {
      const left = workbookValue(a,state.sortKey);
      const right = workbookValue(b,state.sortKey);
      const result = typeof left === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'zh-CN', {numeric:true});
      return state.sortDirection === 'asc' ? result : -result;
    });
  };

  const pagerRange = (page, pages) => {
    if (pages <= 7) return Array.from({length:pages}, (_, index) => index + 1);
    if (page <= 4) return [1,2,3,4,5,'...',pages];
    if (page >= pages - 3) return [1,'...',pages - 4,pages - 3,pages - 2,pages - 1,pages];
    return [1,'...',page - 1,page,page + 1,'...',pages];
  };

  const updateHeaderState = () => {
    document.querySelectorAll('[data-sort]').forEach(button => {
      button.classList.toggle('is-active', button.dataset.sort === state.sortKey && button.dataset.direction === state.sortDirection);
    });
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.classList.toggle('is-active', Boolean(state.filters[button.dataset.filter]));
    });
  };

  const renderPager = (total, pages) => {
    pagerEl.innerHTML = `
      <span class="audit-pager-total">共 ${total.toLocaleString('zh-CN')} 条</span>
      <button class="audit-pager-btn audit-pager-arrow" type="button" data-page="prev" ${state.page <= 1 ? 'disabled' : ''}>‹</button>
      ${pagerRange(state.page, pages).map(item => item === '...'
        ? '<span class="audit-pager-ellipsis">...</span>'
        : `<button class="audit-pager-btn ${item === state.page ? 'is-active' : ''}" type="button" data-page="${item}">${item}</button>`).join('')}
      <button class="audit-pager-btn audit-pager-arrow" type="button" data-page="next" ${state.page >= pages ? 'disabled' : ''}>›</button>
      <label class="audit-pager-size"><select data-page-size>${[10,20,30,40,50].map(size => `<option value="${size}" ${size === state.pageSize ? 'selected' : ''}>${size} 条/页</option>`).join('')}</select></label>
      <span class="audit-pager-jump-label">跳至</span>
      <input class="audit-pager-jump" type="number" min="1" max="${pages}" inputmode="numeric" data-page-jump>
      <span class="audit-pager-jump-label">页</span>
    `;
  };

  const render = () => {
    const result = filteredRows();
    const search = state.search.trim().toLowerCase();
    const hasProjectResult = !search || projectMatchesSearch(search) || result.length > 0;
    if (card) card.hidden = !hasProjectResult;
    if (projectSearchEmpty) projectSearchEmpty.hidden = hasProjectResult;
    const pages = Math.max(1, Math.ceil(result.length / state.pageSize));
    state.page = Math.min(Math.max(1, state.page), pages);
    const start = (state.page - 1) * state.pageSize;
    const visible = result.slice(start, start + state.pageSize);

    const statusCell = (enabled, market, notApplicable=false) => notApplicable
      ? '<span class="pl-book-flag is-na">不适用</span>'
      : enabled
        ? `<span class="pl-book-flag is-yes" aria-label="是${market ? `，资本市场${escapeHtml(market)}` : ''}"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>${market ? `<small>${escapeHtml(market)}</small>` : ''}</span>`
        : '<span class="pl-book-flag is-no">否</span>';
    rowsEl.innerHTML = visible.length ? visible.map(row => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${row.files}</td>
        <td>${escapeHtml(row.updated)}</td>
        <td>${escapeHtml(row.period)}</td>
        <td>${escapeHtml(reportPeriod(row))}</td>
        <td>${escapeHtml(row.fiscalYearEnd || '—')}</td>
        <td>${statusCell(row.ipo === true,row.capitalMarket)}</td>
        <td>${statusCell(row.pie === true,row.capitalMarket,row.ipo === true)}</td>
        <td class="pl-materiality">${row.materiality === null || row.materiality === undefined || row.materiality === '' ? '—' : `${Number(row.materiality).toLocaleString('zh-CN')} 元`}</td>
        <td>${escapeHtml(row.remark)}</td>
        <td><span class="pl-row-actions"><a class="pl-row-action" href="javascript:void(0)" data-edit-workbook="${escapeHtml(row.name)}"><i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>编辑</a><a class="pl-row-action" href="javascript:void(0)" data-enter-workbook="${escapeHtml(row.name)}"><i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>进入</a></span></td>
      </tr>
    `).join('') : '<tr><td class="pl-empty" colspan="11">当前条件下暂无工作簿</td></tr>';

    renderPager(result.length, pages);
    updateHeaderState();
    if (workbookCount) workbookCount.textContent = String(workbooks.length);
  };

  const closeFilterPopover = () => document.querySelector('.pl-filter-popover')?.remove();
  const filterLabels = {name:'工作簿名称',files:'接口文件总数',updated:'更新日期',period:'分析期间',reportPeriod:'报告期间',fiscalYearEnd:'财年结束日期',ipo:'IPO',pie:'PIE',materiality:'重要性水平'};

  const openFilterPopover = (button, key) => {
    closeFilterPopover();
    const popover = document.createElement('div');
    popover.className = 'pl-filter-popover';
    const numericFilter = key === 'files' || key === 'materiality';
    const inputType = numericFilter ? 'number' : 'text';
    const placeholder = key === 'files' ? '请输入文件数量' : `请输入${filterLabels[key]}`;
    popover.innerHTML = `
      <label>${filterLabels[key]}筛选</label>
      <input type="${inputType}" ${numericFilter ? 'min="0"' : ''} value="${escapeHtml(state.filters[key])}" placeholder="${placeholder}">
      <div class="pl-filter-actions"><button class="pl-filter-clear" type="button">清空</button><button class="pl-filter-confirm" type="button">确定</button></div>
    `;
    document.body.appendChild(popover);
    const rect = button.getBoundingClientRect();
    const left = Math.min(rect.right - popover.offsetWidth, window.innerWidth - popover.offsetWidth - 8);
    popover.style.left = `${Math.max(8, left)}px`;
    popover.style.top = `${Math.min(rect.bottom + 5, window.innerHeight - popover.offsetHeight - 8)}px`;
    const input = popover.querySelector('input');
    const apply = () => {
      state.filters[key] = input.value.trim();
      state.page = 1;
      closeFilterPopover();
      render();
    };
    popover.querySelector('.pl-filter-confirm').addEventListener('click', apply);
    popover.querySelector('.pl-filter-clear').addEventListener('click', () => {
      state.filters[key] = '';
      state.page = 1;
      closeFilterPopover();
      render();
    });
    input.addEventListener('keydown', event => { if (event.key === 'Enter') apply(); });
    window.setTimeout(() => input.focus(), 0);
  };

  document.addEventListener('click', event => {
    const sortButton = event.target.closest('[data-sort]');
    if (sortButton) {
      state.sortKey = sortButton.dataset.sort;
      state.sortDirection = sortButton.dataset.direction;
      state.page = 1;
      render();
      return;
    }
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      event.stopPropagation();
      openFilterPopover(filterButton, filterButton.dataset.filter);
      return;
    }
    if (!event.target.closest('.pl-filter-popover')) closeFilterPopover();
    const edit = event.target.closest('[data-edit-workbook]');
    if (edit) {
      openEditModal(edit.dataset.editWorkbook);
      return;
    }
    const enter = event.target.closest('[data-enter-workbook]');
    if (enter) window.openWorkbook('Test2', enter.dataset.enterWorkbook);
  });

  searchButton?.addEventListener('click', () => {
    state.search = searchInput?.value || '';
    state.page = 1;
    render();
  });
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') searchButton?.click();
  });

  pagerEl.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    const result = filteredRows();
    const pages = Math.max(1, Math.ceil(result.length / state.pageSize));
    if (button.dataset.page === 'prev') state.page -= 1;
    else if (button.dataset.page === 'next') state.page += 1;
    else state.page = Number(button.dataset.page);
    state.page = Math.min(Math.max(1, state.page), pages);
    render();
  });
  pagerEl.addEventListener('change', event => {
    if (event.target.matches('[data-page-size]')) {
      state.pageSize = Number(event.target.value) || 20;
      state.page = 1;
      render();
    }
    if (event.target.matches('[data-page-jump]')) {
      const pages = Math.max(1, Math.ceil(filteredRows().length / state.pageSize));
      state.page = Math.min(Math.max(1, Number(event.target.value) || 1), pages);
      render();
    }
  });
  pagerEl.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.matches('[data-page-jump]')) event.target.dispatchEvent(new Event('change', {bubbles:true}));
  });

  foldButton?.addEventListener('click', () => {
    const collapsed = card.classList.toggle('is-collapsed');
    foldButton.setAttribute('aria-expanded', String(!collapsed));
    foldButton.setAttribute('aria-label', collapsed ? '展开工作簿列表' : '收起工作簿列表');
  });

  const closeCreateModal = () => {
    createModal?.classList.remove('is-open');
    createModal?.setAttribute('aria-hidden', 'true');
    editingWorkbookName = null;
  };
  const setIpoState = () => {
    const market = document.getElementById('newCapitalMarket');
    const marketField = document.getElementById('newCapitalMarketField');
    const pieField = document.getElementById('newPieField');
    const ipo = createForm?.querySelector('[name="newWorkbookIpo"]:checked')?.value || 'yes';
    const pie = createForm?.querySelector('[name="newWorkbookPie"]:checked')?.value || 'no';
    if (!market || !marketField || !pieField) return;
    if (ipo === 'no') {
      pieField.hidden = false;
      const showMarket = pie === 'yes';
      marketField.hidden = !showMarket;
      market.required = showMarket;
      marketField.classList.toggle('is-required', showMarket);
      if (!showMarket) market.value = '';
    } else {
      pieField.hidden = true;
      marketField.hidden = false;
      createForm.querySelector('[name="newWorkbookPie"][value="no"]').checked = true;
      market.required = true;
      marketField.classList.add('is-required');
      if (market.value === 'N/A') market.value = '';
    }
  };
  const openCreateModal = () => {
    if (!createModal || !createForm) return;
    editingWorkbookName = null;
    createForm.reset();
    if (modalTitle) modalTitle.textContent = '新建工作簿';
    if (formSubmit) formSubmit.textContent = '创建工作簿';
    setIpoState();
    createModal.classList.add('is-open');
    createModal.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => document.getElementById('newWorkbookName')?.focus(), 0);
  };

  const parsePeriod = period => {
    const dates = String(period || '').match(/\d{4}-\d{2}-\d{2}/g) || [];
    return {start:dates[0] || '', end:dates[1] || ''};
  };

  const readStoredMateriality = name => {
    try {
      const materialityByBook = JSON.parse(localStorage.getItem(MATERIALITY_BY_BOOK_KEY) || '{}');
      const value = materialityByBook[name];
      return value === null || value === undefined ? '' : value;
    } catch (error) {
      return '';
    }
  };

  function openEditModal(name) {
    if (!createModal || !createForm) return;
    const workbook = workbooks.find(item => item.name === name);
    if (!workbook) {
      showToast('未找到需要编辑的工作簿');
      return;
    }
    const period = parsePeriod(workbook.period);
    editingWorkbookName = workbook.name;
    createForm.reset();
    if (modalTitle) modalTitle.textContent = '编辑工作簿';
    if (formSubmit) formSubmit.textContent = '更新';

    document.getElementById('newWorkbookName').value = workbook.name || '';
    document.getElementById('newAnalysisStart').value = workbook.analysisStart || period.start;
    document.getElementById('newAnalysisEnd').value = workbook.analysisEnd || period.end;
    document.getElementById('newReportStart').value = workbook.reportStart || workbook.analysisStart || period.start;
    document.getElementById('newReportEnd').value = workbook.reportEnd || workbook.analysisEnd || period.end;
    document.getElementById('newProjectDescription').value = workbook.remark || '';

    const ipoValue = workbook.ipo === true ? 'yes' : 'no';
    const pieValue = workbook.pie === true ? 'yes' : 'no';
    createForm.querySelector(`[name="newWorkbookIpo"][value="${ipoValue}"]`).checked = true;
    createForm.querySelector(`[name="newWorkbookPie"][value="${pieValue}"]`).checked = true;
    setIpoState();

    const market = document.getElementById('newCapitalMarket');
    if (!document.getElementById('newCapitalMarketField').hidden) market.value = workbook.capitalMarket || '';
    document.getElementById('newFiscalYearEnd').value = workbook.fiscalYearEnd || '12-31';
    const materiality = workbook.materiality ?? readStoredMateriality(workbook.name);
    document.getElementById('newMateriality').value = materiality ?? '';

    createModal.classList.add('is-open');
    createModal.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => document.getElementById('newWorkbookName')?.focus(), 0);
  }

  document.querySelector('.pl-new-btn')?.addEventListener('click', openCreateModal);
  document.querySelectorAll('[data-create-close]').forEach(button => button.addEventListener('click', closeCreateModal));
  createModal?.addEventListener('click', event => { if (event.target === createModal) closeCreateModal(); });
  createForm?.querySelectorAll('[name="newWorkbookIpo"]').forEach(input => input.addEventListener('change', setIpoState));
  createForm?.querySelectorAll('[name="newWorkbookPie"]').forEach(input => input.addEventListener('change', setIpoState));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCreateModal(); });

  createForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!createForm.reportValidity()) return;
    const name = document.getElementById('newWorkbookName').value.trim();
    const analysisStart = document.getElementById('newAnalysisStart').value;
    const analysisEnd = document.getElementById('newAnalysisEnd').value;
    const reportStart = document.getElementById('newReportStart').value;
    const reportEnd = document.getElementById('newReportEnd').value;
    if (analysisStart > analysisEnd) {
      showToast('分析期间的结束日期不能早于开始日期');
      document.getElementById('newAnalysisEnd').focus();
      return;
    }
    if (reportStart > reportEnd) {
      showToast('报告期间的结束日期不能早于开始日期');
      document.getElementById('newReportEnd').focus();
      return;
    }
    if (workbooks.some(workbook => workbook.name.toLowerCase() === name.toLowerCase() && workbook.name !== editingWorkbookName)) {
      showToast('工作簿名称已存在，请更换名称');
      document.getElementById('newWorkbookName').focus();
      return;
    }

    const materialityRaw = document.getElementById('newMateriality').value.trim();
    const materiality = materialityRaw === '' ? null : Number(materialityRaw);
    const ipo = createForm.querySelector('[name="newWorkbookIpo"]:checked')?.value || 'yes';
    const pie = createForm.querySelector('[name="newWorkbookPie"]:checked')?.value || 'no';
    const editingIndex = editingWorkbookName === null ? -1 : workbooks.findIndex(item => item.name === editingWorkbookName);
    const previousWorkbook = editingIndex >= 0 ? workbooks[editingIndex] : null;
    const workbook = {
      name,
      files:previousWorkbook?.files ?? 0,
      updated:new Date().toISOString().slice(0, 10),
      period:`${analysisStart} - ${analysisEnd}`,
      remark:document.getElementById('newProjectDescription').value.trim(),
      analysisStart,
      analysisEnd,
      reportStart,
      reportEnd,
      reportPeriod:`${reportStart} - ${reportEnd}`,
      ipo:ipo === 'yes',
      pie:ipo === 'no' ? pie === 'yes' : null,
      capitalMarket:document.getElementById('newCapitalMarket').value,
      fiscalYearEnd:document.getElementById('newFiscalYearEnd').value,
      materiality
    };
    if (editingIndex >= 0) workbooks.splice(editingIndex, 1, workbook);
    else workbooks.unshift(workbook);
    saveWorkbooks();

    try {
      const materialityByBook = JSON.parse(localStorage.getItem(MATERIALITY_BY_BOOK_KEY) || '{}');
      if (editingWorkbookName && editingWorkbookName !== name) delete materialityByBook[editingWorkbookName];
      if (materiality !== null && Number.isFinite(materiality)) {
        materialityByBook[name] = materiality;
        localStorage.setItem(MATERIALITY_KEY, String(materiality));
      } else {
        delete materialityByBook[name];
        localStorage.removeItem(MATERIALITY_KEY);
      }
      localStorage.setItem(MATERIALITY_BY_BOOK_KEY, JSON.stringify(materialityByBook));
      if (editingWorkbookName && localStorage.getItem('auditCompass.currentWorkbook') === editingWorkbookName) {
        localStorage.setItem('auditCompass.currentWorkbook', name);
      }
    } catch (error) {}

    const wasEditing = editingIndex >= 0;
    state.search = '';
    state.filters = {name:'',files:'',updated:'',period:'',reportPeriod:'',fiscalYearEnd:'',ipo:'',pie:'',materiality:''};
    state.sortKey = 'updated';
    state.sortDirection = 'desc';
    state.page = 1;
    if (searchInput) searchInput.value = '';
    closeCreateModal();
    render();
    showToast(wasEditing ? `工作簿“${name}”已更新` : `工作簿“${name}”已创建`);
  });

  window.openWorkbook = function(project, book){
    const workbook = workbooks.find(item => item.name === book);
    try {
      localStorage.setItem('auditCompass.currentWorkbook', book);
      const materialityByBook = JSON.parse(localStorage.getItem(MATERIALITY_BY_BOOK_KEY) || '{}');
      const value = workbook?.materiality ?? materialityByBook[book];
      if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) {
        localStorage.setItem(MATERIALITY_KEY, String(value));
      } else if (workbook && Object.prototype.hasOwnProperty.call(workbook, 'materiality')) {
        localStorage.removeItem(MATERIALITY_KEY);
      }
    } catch (error) {}
    if (window.parent && typeof window.parent.enterWorkbook === 'function') window.parent.enterWorkbook(project, book);
  };

  window.enterWorkbook = window.openWorkbook;

  render();
})();
