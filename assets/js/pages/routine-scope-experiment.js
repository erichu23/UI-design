(function () {
  'use strict';
  if (document.currentScript?.dataset.enabled !== 'true') return;
  const workspace = document.querySelector('.main-layout');
  if (!workspace || typeof checkMeta === 'undefined') return;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('../../css/pages/routine-scope-experiment.css?v=20261020-10', document.currentScript.src).href;
  document.head.appendChild(css);
  const ids = Object.keys(checkMeta);
  const storageKey = 'auditCompass.routineScopeExperiment.v2:' + (document.querySelector('.header-title')?.textContent.trim() || location.pathname);
  const labels = {run:'执行', skip:'不执行'};
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const copy = value => JSON.parse(JSON.stringify(value));
  function normalize(row) {
    const decision = ['run', 'skip'].includes(row?.decision) ? row.decision
      : typeof row?.include === 'boolean' ? (row.include ? 'run' : 'skip') : 'run';
    return {decision, reason:typeof row?.reason === 'string' ? row.reason.slice(0, 500) : ''};
  }
  function normalizeScope(scope) { return Object.fromEntries(ids.map(id => [id, normalize(scope?.[id])])); }
  let applied = normalizeScope();
  let draft = copy(applied);
  let hasSaved = false;
  let savedAt = '';
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved?.applied) { applied = normalizeScope(saved.applied); hasSaved = true; }
    draft = saved?.draft ? normalizeScope(saved.draft) : copy(applied);
    savedAt = typeof saved?.savedAt === 'string' ? saved.savedAt : '';
  } catch (error) { /* The experiment remains usable without storage. */ }

  function needsReason(row) { return row.decision === 'skip' && !row.reason.trim(); }
  function missingReasonIds(scope) { return ids.filter(id => needsReason(scope[id])); }
  function isIncluded(id) { return applied[id].decision !== 'skip' || needsReason(applied[id]); }
  function changedIds() { return ids.filter(id => draft[id].decision !== applied[id].decision || draft[id].reason !== applied[id].reason); }
  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({draft, applied:hasSaved ? applied : null, savedAt})); return true; }
    catch (error) { return false; }
  }
  const columns = [
    {key:'id', label:'编号', cls:'rs-number'},
    {key:'name', label:'核查程序', cls:''},
    {key:'decision', label:'是否执行', cls:'rs-choice'},
    {key:'reason', label:'不执行原因', cls:'rs-reason-col'}
  ];
  const columnFilters = Object.create(null);
  const sort = {key:'id', direction:'asc'};
  riskColumnFilterUiState.routineScope = Object.create(null);
  function columnValue(id, key) {
    if (key === 'id') return id;
    if (key === 'name') return checkMeta[id].title.replace(id, '').trim();
    if (key === 'decision') return labels[draft[id].decision];
    if (key === 'reason') return draft[id].decision !== 'skip' ? '\u2014' : draft[id].reason.trim() || '待补充';
    return checkMeta[id].badge || '未执行';
  }
  function columnHeading(col) {
    return `<span>${col.label}</span>`;
  }

  document.body.classList.add('routine-scope-experiment');
  document.body.dataset.routineStep = '1';
  workspace.id = workspace.id || 'routineWorkspace';
  const steps = document.createElement('nav');
  steps.className = 'rs-steps';
  steps.setAttribute('aria-label', '核查流程');
  steps.innerHTML = `<ol><li><button type="button" data-step="1" aria-current="step" aria-controls="routineScope"><span class="rs-step-number">1</span>核查安排</button></li><li class="rs-step-connector" aria-hidden="true"></li><li><button type="button" data-step="2" aria-controls="${workspace.id}"><span class="rs-step-number">2</span>核查程序</button></li></ol><span id="rsStepSummary" role="status" hidden></span>`;
  const panel = document.createElement('section');
  panel.id = 'routineScope';
  panel.setAttribute('aria-labelledby', 'routineScopeTitle');
  panel.innerHTML = `
    <div class="rs-head">
      <div class="rs-heading"><h2 id="routineScopeTitle">本次核查范围</h2><span id="rsCounts"></span></div>
      <div class="rs-head-actions"><label class="rs-all-execute" title="勾选全部执行；取消则全部不执行。包含筛选隐藏的程序。"><input type="checkbox" id="rsAllExecute" checked aria-label="全部程序执行">全部执行</label><span id="rsStatus" role="status"></span></div>
    </div>
    <div id="rsBody">
      <div class="rs-scroll"><table class="rs-table"><thead><tr>${columns.map(col => `<th class="${col.cls}" data-column="${col.key}" aria-sort="none"><div class="rs-th-content">${columnHeading(col)}<span class="rs-th-tools"><button class="th-sort-icons rs-head-sort" data-sort="${col.key}" type="button" title="${col.label}排序" aria-label="${col.label}排序"><span class="th-sort-arrow" aria-hidden="true">▲</span><span class="th-sort-arrow" aria-hidden="true">▼</span></button><button class="th-filter-icon rs-head-filter" data-filter="${col.key}" type="button" title="筛选${col.label}" aria-label="筛选${col.label}"></button></span></div></th>`).join('')}</tr></thead><tbody>${ids.map(id => `<tr data-routine="${escape(id)}"><td>${escape(id)}</td><td class="rs-name" title="${escape(getGroupLabel(id))}">${escape(columnValue(id, 'name'))}</td><td><select data-decision="${escape(id)}" aria-label="${escape(checkMeta[id].title)}是否执行"><option value="run">执行</option><option value="skip">不执行</option></select></td><td><div class="rs-reason-field"><input type="text" data-reason="${escape(id)}" maxlength="500" aria-label="${escape(checkMeta[id].title)}不执行原因"><span data-reason-status>待补充</span></div></td></tr>`).join('')}</tbody></table><div class="rs-no-match" hidden>暂无匹配的核查程序</div></div>
      <div class="rs-footer"><span id="rsMessage" role="status"></span><button type="button" id="rsConfirm">下一步：核查程序</button></div>
    </div>`;
  workspace.before(steps, panel);
  const empty = document.createElement('div');
  empty.className = 'rs-workspace-empty';
  empty.hidden = true;
  empty.innerHTML = '<p>本次安排的全部程序均不执行</p><p>可返回第一步调整核查安排</p><button type="button">导出核查安排</button>';
  workspace.after(empty);
  const $ = id => panel.querySelector('#' + id);
  const rows = Array.from(panel.querySelectorAll('[data-routine]'));
  let currentStep = 1;
  let validationAttempted = false;
  let visibilityKey = '';
  let storageAvailable = true;

  function matches(id) { return Object.entries(columnFilters).every(([key, allowed]) => allowed.has(columnValue(id, key))); }
  function filterRows() {
    rows.forEach(row => { row.hidden = !matches(row.dataset.routine); });
    const ordered = rows.slice().sort((a, b) => {
      const left = a.dataset.routine, right = b.dataset.routine;
      const value = sort.key ? columnValue(left, sort.key).localeCompare(columnValue(right, sort.key), 'zh-CN', {numeric:true}) : 0;
      return value ? value * (sort.direction === 'desc' ? -1 : 1) : left.localeCompare(right, 'zh-CN', {numeric:true});
    });
    const body = panel.querySelector('tbody');
    ordered.forEach(row => body.appendChild(row));
    panel.querySelectorAll('[data-column]').forEach(th => {
      const key = th.dataset.column;
      th.setAttribute('aria-sort', sort.key === key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none');
      th.classList.toggle('sort-asc', sort.key === key && sort.direction === 'asc');
      th.classList.toggle('sort-desc', sort.key === key && sort.direction === 'desc');
      th.querySelector('[data-filter]').classList.toggle('is-active', Boolean(columnFilters[key]));
    });
    panel.querySelector('.rs-no-match').hidden = rows.some(row => !row.hidden);
  }
  function updateSummary() {
    const changed = changedIds().length;
    const pendingReasons = ids.filter(id => needsReason(draft[id])).length;
    const counts = Object.fromEntries(Object.keys(labels).map(key => [key, ids.filter(id => draft[id].decision === key).length]));
    $('rsAllExecute').checked = counts.run === ids.length;
    $('rsAllExecute').indeterminate = counts.run > 0 && counts.run < ids.length;
    $('rsCounts').textContent = `共 ${ids.length} 项 · 执行 ${counts.run} · 不执行 ${counts.skip}`;
    $('rsStatus').textContent = changed ? `${changed} 项已调整` : hasSaved ? '已确认范围' : '默认全部执行';
    $('rsStatus').classList.toggle('is-confirmed', !changed && hasSaved);
    $('rsMessage').textContent = `${pendingReasons ? `请补充 ${pendingReasons} 项不执行原因后进入下一步` : `本次执行 ${counts.run} 项核查程序`}${storageAvailable ? '' : ' · 当前浏览器无法保留会话记录'}`;
    $('rsMessage').classList.toggle('is-error', validationAttempted && pendingReasons > 0);
  }
  function updateRow(row) {
    const id = row.dataset.routine;
    const value = draft[id];
    row.querySelector('[data-decision]').value = value.decision;
    row.querySelector('[data-decision]').dataset.state = value.decision;
    row.classList.toggle('is-pending', needsReason(value));
    const input = row.querySelector('[data-reason]');
    input.value = value.decision === 'skip' ? value.reason : '';
    input.disabled = value.decision !== 'skip';
    input.placeholder = value.decision === 'skip' ? '请填写具体原因' : '\u2014';
    input.setAttribute('aria-required', String(value.decision === 'skip'));
    input.setAttribute('aria-invalid', String(validationAttempted && needsReason(value)));
    input.setAttribute('aria-describedby', 'rsMessage');
    row.querySelector('[data-reason-status]').hidden = !needsReason(value);
  }
  function applyScope() {
    const selected = new Set(ids.filter(isIncluded));
    workspace.classList.toggle('rs-gated', currentStep !== 2 || !selected.size);
    empty.hidden = currentStep !== 2 || selected.size > 0;
    document.querySelectorAll('#checkList .check-item[data-id]').forEach(item => {
      item.classList.toggle('rs-excluded', !selected.has(item.dataset.id));
    });
    document.querySelectorAll('#checkList .check-group').forEach(group => {
      group.classList.toggle('rs-excluded', !Array.from(group.querySelectorAll('.check-item[data-id]')).some(item => selected.has(item.dataset.id)));
    });
    const count = document.querySelector('.sidebar-count');
    if (count) count.textContent = `当前保留 ${selected.size} 项`;
    const nextKey = Array.from(selected).join(',');
    if (nextKey !== visibilityKey && currentStep === 2) {
      visibilityKey = nextKey;
      Object.keys(checkColumnFilters).forEach(id => { if (!selected.has(id)) delete checkColumnFilters[id]; });
      if (selected.size) selectCheck(selected.has(activeCheck) ? activeCheck : selected.values().next().value);
      window.dispatchEvent(new Event('resize'));
    }
    rows.forEach(updateRow);
  }
  function showMissingReasonDialog(missing, input) {
    if (document.getElementById('rsMissingReasonDialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'rsMissingReasonDialog';
    dialog.className = 'clear-modal rs-reason-dialog';
    dialog.setAttribute('aria-labelledby', 'rsReasonDialogTitle');
    dialog.setAttribute('aria-describedby', 'rsReasonDialogMessage');
    dialog.innerHTML = `<h4 id="rsReasonDialogTitle">请补充不执行原因</h4><p id="rsReasonDialogMessage">还有 ${missing.length} 项不执行原因未填写，暂时无法进入第二步。</p><div class="clear-sub">首个待补项：${escape(checkMeta[missing[0]].title)}</div><div class="clear-btns"><button class="primary" type="button" autofocus>返回填写</button></div>`;
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.remove();
      input.scrollIntoView({block:'nearest'});
      input.focus({preventScroll:true});
    });
    document.body.appendChild(dialog);
    dialog.showModal();
  }
  function goToStep(next) {
    closeRiskColumnFilterPopovers();
    if (next === 2) {
      const missing = missingReasonIds(draft);
      if (missing.length) {
        validationAttempted = true;
        if (currentStep !== 1) goToStep(1);
        Object.keys(columnFilters).forEach(key => delete columnFilters[key]);
        riskColumnFilterUiState.routineScope = Object.create(null);
        filterRows();
        rows.forEach(updateRow);
        updateSummary();
        const input = panel.querySelector(`[data-reason="${missing[0]}"]`);
        input.scrollIntoView({block:'nearest'});
        showMissingReasonDialog(missing, input);
        return false;
      }
      validationAttempted = false;
    }
    if (next === 2 && (!hasSaved || changedIds().length)) {
      applied = copy(draft);
      hasSaved = true;
      savedAt = new Date().toISOString();
      storageAvailable = persist();
    }
    currentStep = next;
    document.body.dataset.routineStep = String(next);
    panel.hidden = next !== 1;
    steps.querySelectorAll('[data-step]').forEach(button => {
      const active = Number(button.dataset.step) === next;
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const summary = steps.querySelector('#rsStepSummary');
    summary.hidden = next !== 2;
    const excluded = ids.filter(id => !isIncluded(id)).length;
    summary.textContent = `执行 ${ids.length - excluded} 项 · 不执行 ${excluded} 项`;
    applyScope();
    updateSummary();
    steps.querySelector(`[data-step="${next}"]`).focus();
    window.dispatchEvent(new Event('resize'));
  }

  // Scope wraps navigation and column layout, leaving the existing calculations intact.
  const originalSelect = window.selectCheck;
  window.selectCheck = function (id) {
    if (!isIncluded(id)) return;
    const result = originalSelect(id);
    rows.forEach(updateRow);
    return result;
  };
  const originalVisibleGroups = window.getVisibleCheckGroups;
  window.getVisibleCheckGroups = function () {
    return originalVisibleGroups().map(group => ({...group, checks:group.checks.filter(check => isIncluded(check.id))})).filter(group => group.checks.length);
  };
  const originalGroupHeader = window.renderCheckGroupHeader;
  window.renderCheckGroupHeader = group => originalGroupHeader({...group, checks:group.checks.filter(check => isIncluded(check.id))});
  const originalGroupControls = window.renderCheckGroupDisplayControls;
  window.renderCheckGroupDisplayControls = function () {
    originalGroupControls();
    document.querySelectorAll('#checkGroupDisplay .check-display-option').forEach((option, index) => {
      const count = CHECK_COLUMNS[index].checks.filter(check => isIncluded(check.id)).length;
      option.hidden = !count;
      option.querySelector('em').textContent = count;
    });
  };

  // Export defaults, rows and the arrangement sheet all use saved decisions.
  const originalExportRender = window.renderRiskExportChecks;
  window.renderRiskExportChecks = function () {
    riskExportSelectedChecks = new Set(Array.from(riskExportSelectedChecks).filter(isIncluded));
    originalExportRender();
    document.querySelectorAll('#riskExportChecks .risk-export-check input').forEach((input, index) => {
      const id = ALL_CHECK_IDS[index];
      input.disabled = !isIncluded(id);
      if (input.disabled) input.closest('label').title = '已按保存的核查安排排除';
    });
    document.querySelectorAll('#riskExportChecks .risk-export-group').forEach((group, index) => {
      const available = CHECK_COLUMNS[index].checks.filter(check => isIncluded(check.id));
      const selected = available.filter(check => riskExportSelectedChecks.has(check.id)).length;
      const input = group.querySelector('.risk-export-group-head input');
      input.disabled = !available.length;
      input.checked = available.length > 0 && selected === available.length;
      input.indeterminate = selected > 0 && selected < available.length;
      group.querySelector('.risk-export-group-head em').textContent = `${selected}/${available.length}`;
    });
  };
  const originalExportRows = window.getRiskExportRows;
  window.getRiskExportRows = (kind, checks = riskExportSelectedChecks) => originalExportRows(kind, new Set(Array.from(checks).filter(isIncluded)));
  window.getRiskScopeExportSheet = function () {
    const time = !hasSaved ? '尚未保存' : Number.isNaN(Date.parse(savedAt)) ? '未记录' : new Date(savedAt).toLocaleString('zh-CN', {timeZone:'Asia/Shanghai'});
    return riskExportSheet('核查安排', ['编号', '核查程序', '是否执行', '不执行原因', '安排完整性', '结果范围', '保存时间'], ids.map(id => {
      const row = applied[id];
      const completeness = needsReason(row) ? '待补不执行原因' : '已填写';
      return [id, checkMeta[id].title, labels[row.decision], row.decision === 'skip' ? row.reason : '', completeness, isIncluded(id) ? '保留展示' : '不纳入本次结果', time];
    }));
  };

  function draftChanged() {
    filterRows();
    storageAvailable = persist();
    updateSummary();
  }
  function setAllExecution(execute) {
    ids.forEach(id => { draft[id].decision = execute ? 'run' : 'skip'; });
    ['decision', 'reason'].forEach(key => {
      delete columnFilters[key];
      delete riskColumnFilterUiState.routineScope[key];
    });
    validationAttempted = false;
    rows.forEach(updateRow);
    draftChanged();
  }
  panel.addEventListener('change', event => {
    if (event.target === $('rsAllExecute')) {
      setAllExecution(event.target.checked);
      return;
    }
    const id = event.target.dataset.decision;
    if (id) { draft[id].decision = event.target.value; updateRow(event.target.closest('tr')); }
    draftChanged();
  });
  panel.addEventListener('input', event => {
    const id = event.target.dataset.reason;
    if (id) {
      draft[id].reason = event.target.value;
      event.target.closest('tr').classList.toggle('is-pending', needsReason(draft[id]));
      event.target.closest('tr').querySelector('[data-reason-status]').hidden = !needsReason(draft[id]);
      event.target.setAttribute('aria-invalid', String(validationAttempted && needsReason(draft[id])));
      storageAvailable = persist();
      updateSummary();
    }
  });
  panel.addEventListener('click', event => {
    const sorter = event.target.closest('[data-sort]');
    if (sorter) {
      const key = sorter.dataset.sort;
      if (sort.key !== key) { sort.key = key; sort.direction = 'asc'; }
      else if (sort.direction === 'asc') sort.direction = 'desc';
      else { sort.key = ''; sort.direction = ''; }
      filterRows();
      return;
    }
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      const key = filter.dataset.filter;
      const values = Array.from(new Set(ids.map(id => columnValue(id, key))));
      openRiskColumnFilter({event, kind:'routineScope', col:key, title:columns.find(col => col.key === key).label, values, numeric:false,
        onApply:allowed => {
          if (allowed === null) delete columnFilters[key];
          else columnFilters[key] = new Set(allowed);
          filterRows();
        }
      });
      return;
    }
  });
  steps.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (button && Number(button.dataset.step) !== currentStep) goToStep(Number(button.dataset.step));
  });
  empty.querySelector('button').addEventListener('click', () => downloadRiskExportWorkbook([], []));
  $('rsConfirm').addEventListener('click', () => goToStep(2));
  rows.forEach(updateRow);
  filterRows();
  applyScope();
  updateSummary();
})();
