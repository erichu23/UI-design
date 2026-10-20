(function () {
  'use strict';
  if (document.currentScript?.dataset.enabled !== 'true') return;
  const workspace = document.querySelector('.main-layout');
  if (!workspace || typeof checkMeta === 'undefined') return;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('../../css/pages/routine-scope-experiment.css?v=20261020-1', document.currentScript.src).href;
  document.head.appendChild(css);
  const ids = Object.keys(checkMeta);
  const storageKey = 'auditCompass.routineScopeExperiment.v1:' + (document.querySelector('.header-title')?.textContent.trim() || location.pathname);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const copy = value => JSON.parse(JSON.stringify(value));
  let draft = Object.fromEntries(ids.map(id => [id, {include:true, reason:''}]));
  let applied = null;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved?.draft) ids.forEach(id => {
      const row = saved.draft[id];
      if (row && typeof row.include === 'boolean' && typeof row.reason === 'string') draft[id] = row;
    });
    if (saved?.applied && ids.every(id => {
      const row = saved.applied[id];
      return row && typeof row.include === 'boolean' && typeof row.reason === 'string' && (row.include || row.reason.trim());
    })) applied = copy(saved.applied);
  } catch (error) { /* Session storage is optional. */ }

  document.body.classList.add('routine-scope-experiment');
  const panel = document.createElement('section');
  panel.id = 'routineScope';
  panel.setAttribute('aria-labelledby', 'routineScopeTitle');
  panel.innerHTML = `
    <div class="rs-head">
      <div class="rs-heading"><span class="rs-step">1</span><h2 id="routineScopeTitle">核查范围</h2><span id="rsCounts"></span></div>
      <div class="rs-actions"><span id="rsStatus" role="status"></span><button type="button" id="rsFold" aria-expanded="true" aria-controls="rsBody">收起</button></div>
    </div>
    <div id="rsBody">
      <div class="rs-toolbar"><label class="rs-all"><input type="checkbox" id="rsAll">全部核查</label><label class="rs-search"><span aria-hidden="true">⌕</span><input id="rsSearch" type="search" placeholder="搜索核查程序" aria-label="搜索核查程序"></label><label class="rs-only"><input id="rsOnlyExcluded" type="checkbox">仅看不核查项</label></div>
      <div class="rs-scroll"><table class="rs-table"><thead><tr><th class="rs-number">编号</th><th>核查程序</th><th class="rs-category">类别</th><th class="rs-choice">本次核查</th><th class="rs-reason-col">不核查原因</th></tr></thead><tbody>${ids.map(id => `<tr data-routine="${escape(id)}"><td>${escape(id)}</td><td class="rs-name">${escape(checkMeta[id].title.replace(id, '').trim())}</td><td class="rs-category">${escape(getGroupLabel(id))}</td><td class="rs-choice"><label><input type="checkbox" data-include="${escape(id)}" aria-label="核查 ${escape(checkMeta[id].title)}"><span data-choice-label></span></label></td><td><input type="text" data-reason="${escape(id)}" maxlength="500" aria-label="${escape(checkMeta[id].title)}不核查原因" placeholder="请填写不核查的原因" aria-required="false"></td></tr>`).join('')}</tbody></table><div class="rs-no-match" hidden>暂无匹配的核查程序</div></div>
      <div class="rs-footer"><span id="rsMessage" role="status">不核查的程序需填写原因</span><button type="button" id="rsConfirm">确认核查范围</button></div>
    </div>`;
  workspace.before(panel);
  const empty = document.createElement('div');
  empty.className = 'rs-workspace-empty';
  empty.hidden = true;
  empty.textContent = '本次未选择核查程序，可展开核查范围重新选择';
  workspace.after(empty);
  const $ = id => panel.querySelector('#' + id);
  const rows = Array.from(panel.querySelectorAll('[data-routine]'));
  let collapsed = Boolean(applied);

  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({draft, applied})); } catch (error) {}
  }
  function isDirty() { return !applied || ids.some(id => draft[id].include !== applied[id].include || draft[id].reason !== applied[id].reason); }
  function filterRows() {
    const query = $('rsSearch').value.trim().toLowerCase();
    let count = 0;
    rows.forEach(row => {
      const id = row.dataset.routine;
      row.hidden = !((!$('rsOnlyExcluded').checked || !draft[id].include) && (checkMeta[id].title + getGroupLabel(id)).toLowerCase().includes(query));
      if (!row.hidden) count++;
    });
    panel.querySelector('.rs-no-match').hidden = count > 0;
  }
  function updateSummary() {
    const count = ids.filter(id => draft[id].include).length;
    $('rsCounts').textContent = `${ids.length} 项程序 · 核查 ${count} 项 · 不核查 ${ids.length - count} 项`;
    $('rsAll').checked = count === ids.length;
    $('rsAll').indeterminate = count > 0 && count < ids.length;
    $('rsStatus').textContent = isDirty() ? (applied ? '有未确认的修改' : '待确认') : '已确认';
    $('rsStatus').classList.toggle('is-confirmed', !isDirty());
    $('rsConfirm').disabled = !isDirty();
    $('rsBody').hidden = collapsed;
    $('rsFold').textContent = collapsed ? '展开' : '收起';
    $('rsFold').setAttribute('aria-expanded', String(!collapsed));
    $('rsFold').disabled = !applied;
  }
  function updateRow(row) {
    const value = draft[row.dataset.routine];
    row.querySelector('[data-include]').checked = value.include;
    row.querySelector('[data-choice-label]').textContent = value.include ? '核查' : '不核查';
    row.classList.toggle('is-excluded', !value.include);
    const input = row.querySelector('[data-reason]');
    input.value = value.reason;
    input.disabled = value.include;
    input.placeholder = value.include ? '\u2014' : '请填写不核查的原因';
    input.setAttribute('aria-required', String(!value.include));
    input.setAttribute('aria-invalid', 'false');
  }
  function applyScope() {
    const selected = new Set(ids.filter(id => applied?.[id].include));
    workspace.classList.toggle('rs-gated', !applied || !selected.size);
    empty.hidden = !applied || selected.size > 0;
    document.querySelectorAll('#checkList .check-item[data-id]').forEach(item => {
      item.classList.toggle('rs-excluded', Boolean(applied) && !selected.has(item.dataset.id));
    });
    document.querySelectorAll('#checkList .check-group').forEach(group => {
      const visible = Array.from(group.querySelectorAll('.check-item[data-id]')).some(item => selected.has(item.dataset.id));
      group.classList.toggle('rs-excluded', Boolean(applied) && !visible);
    });
    const count = document.querySelector('.sidebar-count');
    if (count && applied) count.textContent = `本次核查 ${selected.size} 项`;
    if (applied) Object.keys(checkColumnFilters).forEach(id => {
      if (!selected.has(id)) delete checkColumnFilters[id];
    });
    if (selected.size) selectCheck(selected.has(activeCheck) ? activeCheck : selected.values().next().value);
    window.dispatchEvent(new Event('resize'));
  }

  // Existing result rendering and routine calculations stay in the original page.
  const originalSelect = window.selectCheck;
  window.selectCheck = function (id) {
    if (!applied?.[id]?.include) return;
    return originalSelect(id);
  };
  const originalVisibleGroups = window.getVisibleCheckGroups;
  window.getVisibleCheckGroups = function () {
    const groups = originalVisibleGroups();
    if (!applied) return groups;
    return groups.map(group => ({...group, checks:group.checks.filter(check => applied[check.id]?.include)})).filter(group => group.checks.length);
  };
  const originalGroupHeader = window.renderCheckGroupHeader;
  window.renderCheckGroupHeader = function (group) {
    return originalGroupHeader(applied ? {...group, checks:group.checks.filter(check => applied[check.id]?.include)} : group);
  };
  const originalGroupControls = window.renderCheckGroupDisplayControls;
  window.renderCheckGroupDisplayControls = function () {
    originalGroupControls();
    if (!applied) return;
    document.querySelectorAll('#checkGroupDisplay .check-display-option').forEach((option, index) => {
      const group = CHECK_COLUMNS[index];
      const count = group.checks.filter(check => applied[check.id]?.include).length;
      option.hidden = !count;
      option.querySelector('em').textContent = count;
    });
  };
  panel.addEventListener('change', event => {
    const id = event.target.dataset.include;
    if (id) {
      draft[id].include = event.target.checked;
      updateRow(event.target.closest('tr'));
      if (!draft[id].include) event.target.closest('tr').querySelector('[data-reason]').focus();
    } else if (event.target === $('rsAll')) {
      ids.forEach(key => { draft[key].include = event.target.checked; });
      rows.forEach(updateRow);
    }
    filterRows();
    updateSummary();
    persist();
  });
  panel.addEventListener('input', event => {
    const id = event.target.dataset.reason;
    if (id) {
      draft[id].reason = event.target.value;
      event.target.setAttribute('aria-invalid', 'false');
      updateSummary();
      persist();
    }
    if (event.target === $('rsSearch')) filterRows();
  });
  $('rsFold').addEventListener('click', () => { collapsed = !collapsed; updateSummary(); window.dispatchEvent(new Event('resize')); });
  $('rsConfirm').addEventListener('click', () => {
    const missing = ids.filter(id => !draft[id].include && !draft[id].reason.trim());
    if (missing.length) {
      $('rsOnlyExcluded').checked = true;
      $('rsSearch').value = '';
      filterRows();
      missing.forEach(id => panel.querySelector(`[data-reason="${id}"]`).setAttribute('aria-invalid', 'true'));
      $('rsMessage').textContent = `还有 ${missing.length} 项未填写不核查原因`;
      $('rsMessage').classList.add('is-error');
      panel.querySelector(`[data-reason="${missing[0]}"]`).focus();
      return;
    }
    applied = copy(draft);
    collapsed = true;
    $('rsMessage').textContent = '不核查的程序需填写原因';
    $('rsMessage').classList.remove('is-error');
    persist();
    applyScope();
    updateSummary();
  });
  rows.forEach(updateRow);
  updateSummary();
  applyScope();
})();
