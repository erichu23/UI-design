(function () {
  'use strict';
  if (document.currentScript?.dataset.enabled !== 'true') return;
  const workspace = document.querySelector('.main-layout');
  const standards = window.RoutineStandards;
  const demoProvider = window.RoutineDemoData;
  if (!workspace || typeof checkMeta === 'undefined' || !standards || !demoProvider) return;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('../../css/pages/routine-scope-experiment.css?v=20261027-26', document.currentScript.src).href;
  document.head.appendChild(css);
  const removedRoutineIds = new Set(['5.1', '5.2']);
  const ids = standards.rows.map(row => row.id).filter(id => checkMeta[id] && !removedRoutineIds.has(id));
  const allowedIds = new Set(ids);
  const criteriaFor = id => standards.formatCriteria(id, checkMeta[id].filters);
  function loadSharedParameters() {
    const parameters=demoProvider.readParameters();
    ids.forEach(id=>{checkMeta[id].filters=parameters[id].filters;});
  }
  loadSharedParameters();
  try {
    const savedResults=JSON.parse(localStorage.getItem(demoProvider.resultKey)||'null');
    if(savedResults?.version===demoProvider.version)Object.assign(manualClears,savedResults.clears||{});
  }catch(error){}
  window.persistRiskRoutineState = function () {
    try { demoProvider.saveParameters(ids.map(id=>({id,filters:checkMeta[id].filters}))); }
    catch(error) { /* Keep the page usable if browser storage is unavailable. */ }
  };
  ids.forEach(id => { checkMeta[id].title = `${id} ${standards.get(id).procedure}`; });
  CHECK_COLUMNS.forEach(group => { group.checks = group.checks.filter(check => allowedIds.has(check.id)); });
  CHECK_COLUMNS.splice(0, CHECK_COLUMNS.length, ...CHECK_COLUMNS.filter(group => group.checks.length));
  ALL_CHECK_IDS.splice(0, ALL_CHECK_IDS.length, ...CHECK_COLUMNS.flatMap(group => group.checks.map(check => check.id)));
  riskExportSelectedChecks = new Set(Array.from(riskExportSelectedChecks).filter(id => allowedIds.has(id)));
  Object.keys(checkMeta).forEach(id => { if (!allowedIds.has(id)) delete checkMeta[id]; });
  const obsoleteHits = new Set(['个人/个体户', '注册资本不匹配', '经营范围不匹配', '地址接近', '工商信息相同', '曾配合舞弊', '合规性差']);
  [HIT_TO_CHECK_ID, TX_FLAG_TO_CHECK_ID].forEach(mapping => {
    Object.keys(mapping).forEach(hit => { if (obsoleteHits.has(hit) || !allowedIds.has(mapping[hit])) delete mapping[hit]; });
    ids.forEach(id => { mapping[demoProvider.labels[id]] = id; });
  });
  HIT_GROUP_DEFS.splice(0, HIT_GROUP_DEFS.length, ...CHECK_COLUMNS.map(group => ({
    key:group.groupKey, label:group.label, color:group.groupKey === 'bizinfo' ? 'hit-warn' : 'hit',
    items:group.checks.map(check => demoProvider.labels[check.id])
  })));
  const demoData = demoProvider.create({parameters:checkMeta, unitAccounts:auditUnitAccounts});
  cpData.splice(0, cpData.length, ...demoData.counterparties);
  txData.splice(0, txData.length, ...demoData.transactions);
  const demoParameterKey = () => JSON.stringify(ids.map(id => [id, checkMeta[id].filters]));
  let demoSignature = demoParameterKey(), demoRevision = 0;
  function updateDemoIdentification() {
    const signature = demoParameterKey();
    if (signature === demoSignature) return;
    demoProvider.evaluate(demoData, checkMeta);
    demoSignature = signature;
    demoRevision += 1;
  }
  const transactionHitCounts = new Map(ids.map(id => [id, 0]));
  txData.forEach(row => getTxCheckIds(row.flags).forEach(id => {
    if (transactionHitCounts.has(id)) transactionHitCounts.set(id, transactionHitCounts.get(id) + 1);
  }));
  document.querySelectorAll('#checkList .check-item[data-id]').forEach(item => {
    const id = item.dataset.id;
    if (!allowedIds.has(id)) { item.remove(); return; }
    item.classList.remove('has-filter');
    item.querySelectorAll('.filter-dot').forEach(dot=>dot.remove());
    const name = item.querySelector('.check-item-name');
    name.textContent = checkMeta[id].title;
    name.title = checkMeta[id].title;
    const description = item.querySelector('.check-item-desc');
    description.textContent = criteriaFor(id);
    description.title = criteriaFor(id);
    const badges = item.querySelector('.check-item-badges');
    badges.querySelectorAll('.badge-new').forEach(badge => badge.remove());
    let badge = badges.querySelector('.badge-hits');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'badge-hits';
      badges.prepend(badge);
    }
    const count = transactionHitCounts.get(id);
    badge.textContent = `${count} 条`;
    checkMeta[id].badge = `已命中 ${count} 条`;
  });
  document.querySelector('.sidebar-label').textContent = '核查程序';
  document.querySelectorAll('#checkList .check-group').forEach(group => {
    if (!group.querySelector('.check-item[data-id]')) group.remove();
  });
  persistRiskRoutineState();
  // Legacy decision keys now describe visibility only, never execution.
  const storageKey = 'auditCompass.routineViewSettings.v3:' + (document.querySelector('.header-title')?.textContent.trim() || location.pathname);
  const labels = {run:'查看', skip:'不查看'};
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const copy = value => JSON.parse(JSON.stringify(value));
  function criteriaControls(id) {
    const filters = checkMeta[id].filters || [];
    if (!filters.length) return `<span>${escape(criteriaFor(id))}</span>`;
    return `<div class="rs-criteria-controls">${filters.map(filter => {
      const number = filter.type === 'number';
      const fieldId = `rs-criteria-${id}-${filter.key}`;
      return `<label for="${escape(fieldId)}" class="${number ? '' : 'rs-criteria-wide'}"><span>${escape(filter.label)}</span><input id="${escape(fieldId)}" data-criteria-routine="${escape(id)}" data-criteria-key="${escape(filter.key)}" type="${number ? 'number' : 'text'}" ${number ? `step="any" min="0" ${filter.unit === '%' ? 'max="100"' : ''}` : 'maxlength="500"'} value="${escape(filter.defaultVal ?? '')}" placeholder="${escape(filter.type === 'date' ? 'MM/DD 或 YYYY-MM-DD' : filter.placeholder || '不筛选')}" ${filter.type === 'date' ? 'data-criteria-date="true"' : ''}>${filter.unit ? `<em>${escape(filter.unit)}</em>` : ''}</label>`;
    }).join('')}</div>`;
  }
  function syncCriteriaRow(row) {
    const id = row.dataset.routine, cell = row.querySelector('.rs-criteria');
    if (!cell.querySelector('[data-criteria-key]')) cell.innerHTML = criteriaControls(id);
    else cell.querySelectorAll('[data-criteria-key]').forEach(input => {
      const filter = checkMeta[id].filters.find(item => item.key === input.dataset.criteriaKey);
      if (input !== document.activeElement) input.value = filter.defaultVal ?? '';
    });
  }
  function updateCriteria(input) {
    const id = input.dataset.criteriaRoutine;
    const filter = checkMeta[id]?.filters.find(item => item.key === input.dataset.criteriaKey);
    if (!filter) return;
    input.setCustomValidity('');
    if (filter.type === 'date' && input.value) {
      const match = /^(?:(\d{4})-)?(\d{2})[-/](\d{2})$/.exec(input.value.trim());
      const date = match && new Date(Date.UTC(Number(match[1] || 2000), Number(match[2]) - 1, Number(match[3])));
      if (!date || date.getUTCFullYear() !== Number(match[1] || 2000) || date.getUTCMonth() !== Number(match[2]) - 1 || date.getUTCDate() !== Number(match[3])) input.setCustomValidity('请输入有效日期，例如 12/31 或 2025-12-31');
    }
    input.setAttribute('aria-invalid', String(!input.validity.valid));
    if (!input.validity.valid) return;
    filter.defaultVal = input.value === '' ? null : filter.type === 'number' ? Number(input.value) : input.value;
    updateDemoIdentification();
    syncSidebarStatistics();
    persistRiskRoutineState();
    const description = document.querySelector(`#checkList .check-item[data-id="${id}"] .check-item-desc`);
    description.textContent = criteriaFor(id);
    description.title = criteriaFor(id);
    if (id === activeCheck) renderFilterPanel(id, checkMeta[id]);
  }
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
  function isIncluded(id) { return allowedIds.has(id) && (applied[id].decision !== 'skip' || needsReason(applied[id])); }
  function changedIds() { return ids.filter(id => draft[id].decision !== applied[id].decision || draft[id].reason !== applied[id].reason); }
  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({draft, applied:hasSaved ? applied : null, savedAt})); return true; }
    catch (error) { return false; }
  }
  const routineResults = new Map(ids.map(id => [id, {counterparties:new Set(), amount:0, transactions:0}]));
  const resultKeys = {identifiedCounterparties:'counterparties', identifiedAmount:'amount', identifiedTransactions:'transactions'};
  const resultValue = (id, key) => key === 'identifiedCounterparties' ? routineResults.get(id).counterparties.size : routineResults.get(id)[resultKeys[key]];
  function routineResultCells(id) {
    const result = routineResults.get(id);
    return `<td class="rs-result" data-result="identifiedCounterparties">${result.counterparties.size.toLocaleString('zh-CN')}</td><td class="rs-result" data-result="identifiedAmount" data-audit-unit-ignore>${fmtAmtFromYuan(result.amount)}</td><td class="rs-result" data-result="identifiedTransactions">${result.transactions.toLocaleString('zh-CN')}</td>`;
  }
  const columns = [
    {key:'id', label:'编号', cls:'rs-number'},
    {key:'name', label:'核查程序', cls:'rs-procedure-col'},
    {key:'criteria', label:'筛选条件', cls:'rs-criteria-col'},
    {key:'identifiedCounterparties', label:'识别对手方数', cls:'rs-result-col', numeric:true},
    {key:'identifiedAmount', label:'识别交易总额', cls:'rs-result-col rs-result-amount-col', numeric:true},
    {key:'identifiedTransactions', label:'识别交易笔数', cls:'rs-result-col', numeric:true},
    {key:'decision', label:'是否查看', cls:'rs-choice'},
    {key:'reason', label:'不查看原因', cls:'rs-reason-col'}
  ];
  function columnValue(id, key) {
    if (key === 'id') return id;
    if (key === 'name') return checkMeta[id].title.replace(id, '').trim();
    if (key === 'criteria') return criteriaFor(id);
    if (resultKeys[key]) {
      const value = resultValue(id, key);
      if (key === 'identifiedAmount') {
        const unit = getCfoAuditUnit();
        return String(Number((unit ? unit.convert(value, 'yuan') : value / 10000).toFixed(unit?.decimals ?? 2)));
      }
      return String(value);
    }
    if (key === 'decision') return labels[draft[id].decision];
    if (key === 'reason') return draft[id].decision !== 'skip' ? '\u2014' : draft[id].reason.trim() || '待补充';
    return checkMeta[id].badge || '已命中 0 条';
  }
  function columnHeading(col) {
    return `<span>${col.numeric ? `识别<br>${col.label.slice(2)}` : col.label}</span>`;
  }

  document.body.classList.add('routine-scope-experiment');
  document.body.dataset.routineStep = '1';
  workspace.id = workspace.id || 'routineWorkspace';
  const steps = document.createElement('nav');
  steps.className = 'rs-steps';
  steps.setAttribute('aria-label', '特殊交易识别流程');
  steps.innerHTML = `<ol><li><button type="button" data-step="1" aria-current="step" aria-controls="routineScope"><span class="rs-step-number">1</span>查看设置</button></li><li class="rs-step-connector" aria-hidden="true"></li><li><button type="button" data-step="2" aria-controls="${workspace.id}"><span class="rs-step-number">2</span>识别结果</button></li></ol>`;
  const panel = document.createElement('section');
  panel.id = 'routineScope';
  panel.setAttribute('aria-label', '识别结果查看设置');
  panel.innerHTML = `
    <div id="rsBody">
      <div class="rs-scroll"><table class="rs-table"><thead><tr>${columns.map(col => `<th class="${col.cls}" data-column="${col.key}"><div class="rs-th-content">${columnHeading(col)}</div></th>`).join('')}</tr></thead><tbody>${ids.map(id => `<tr data-routine="${escape(id)}"><td>${escape(id)}</td><td class="rs-name" title="${escape(getGroupLabel(id))}">${escape(columnValue(id, 'name'))}</td><td class="rs-criteria">${escape(criteriaFor(id))}</td>${routineResultCells(id)}<td class="rs-choice"><input type="checkbox" checked data-decision="${escape(id)}" aria-label="查看${escape(checkMeta[id].title)}"></td><td><div class="rs-reason-field"><input type="text" data-reason="${escape(id)}" maxlength="500" aria-label="${escape(checkMeta[id].title)}不查看原因"><span data-reason-status>待补充</span></div></td></tr>`).join('')}</tbody></table><div class="rs-no-match" hidden>暂无匹配的核查程序</div></div>
      <div class="rs-footer"><div class="rs-footer-summary"><span id="rsCounts" role="status"></span><span id="rsMessage" role="status"></span></div><button type="button" id="rsConfirm">下一步：识别结果</button></div>
    </div>`;
  workspace.before(steps, panel);
  const empty = document.createElement('div');
  empty.className = 'rs-workspace-empty';
  empty.hidden = true;
  empty.innerHTML = '<p>当前未选择查看项目</p><p>可返回查看设置重新选择</p><button type="button">导出查看设置</button>';
  workspace.after(empty);
  const $ = id => panel.querySelector('#' + id);
  const rows = Array.from(panel.querySelectorAll('[data-routine]'));
  let currentStep = 1;
  let validationAttempted = false;
  let visibilityKey = '';
  let storageAvailable = true;

  function bindSidebarViewing() {
    document.querySelectorAll('#checkList .check-item[data-id]').forEach(item => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'rs-sidebar-check';
      checkbox.dataset.viewRoutine = item.dataset.id;
      checkbox.setAttribute('aria-label', `查看${checkMeta[item.dataset.id].title}`);
      checkbox.addEventListener('click', event => event.stopPropagation());
      checkbox.addEventListener('change', event => {
        event.stopPropagation();
        if (!checkbox.checked) requestHideRoutine(item.dataset.id);
      });
      item.prepend(checkbox);
    });
  }
  function requestHideRoutine(id) {
    if (document.getElementById('rsHideRoutineDialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'rsHideRoutineDialog';
    dialog.className = 'clear-modal rs-reason-dialog rs-hide-dialog';
    dialog.setAttribute('aria-labelledby', 'rsHideRoutineTitle');
    dialog.innerHTML = `<h4 id="rsHideRoutineTitle">填写不查看原因</h4><p>${escape(checkMeta[id].title)}</p><label for="rsHideRoutineReason">不查看原因</label><textarea id="rsHideRoutineReason" maxlength="500" placeholder="请填写具体原因" aria-describedby="rsHideRoutineError" required></textarea><span id="rsHideRoutineError" role="status"></span><div class="clear-btns"><button type="button" data-cancel>取消</button><button class="primary" type="button" data-confirm>确认不查看</button></div>`;
    const input = dialog.querySelector('textarea');
    input.value = draft[id].reason;
    dialog.querySelector('[data-cancel]').addEventListener('click', () => { applyScope(); dialog.close(); });
    dialog.querySelector('[data-confirm]').addEventListener('click', () => {
      if (!input.value.trim()) {
        input.setAttribute('aria-invalid', 'true');
        dialog.querySelector('#rsHideRoutineError').textContent = '请填写不查看原因';
        input.focus();
        return;
      }
      draft[id] = {decision:'skip', reason:input.value.trim()};
      applied = copy(draft);
      hasSaved = true;
      savedAt = new Date().toISOString();
      storageAvailable = persist();
      applyScope();
      updateSummary();
      dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialog.remove();
      applyScope();
      updateSummary();
      const focusTarget = document.querySelector(`#checkList .check-item[data-id="${activeCheck}"] [data-view-routine]:not(:disabled)`);
      (focusTarget || steps.querySelector('[data-step="1"]')).focus();
    });
    document.body.appendChild(dialog);
    dialog.showModal();
    input.focus();
  }

  function filterRows() {
    rows.forEach(row => { row.hidden = false; });
    const ordered = rows.slice().sort((a, b) => {
      const left = a.dataset.routine, right = b.dataset.routine;
      return left.localeCompare(right, 'zh-CN', {numeric:true});
    });
    const body = panel.querySelector('tbody');
    ordered.forEach(row => body.appendChild(row));
    panel.querySelector('.rs-no-match').hidden = rows.some(row => !row.hidden);
  }
  function updateSummary() {
    const pendingReasons = ids.filter(id => needsReason(draft[id])).length;
    const counts = Object.fromEntries(Object.keys(labels).map(key => [key, ids.filter(id => draft[id].decision === key).length]));
    $('rsCounts').textContent = `查看 ${counts.run} 项 · 不查看 ${counts.skip} 项`;
    $('rsMessage').textContent = [pendingReasons ? `请补充 ${pendingReasons} 项不查看原因后进入下一步` : '', storageAvailable ? '' : '当前浏览器无法保留会话记录'].filter(Boolean).join(' · ');
    $('rsMessage').hidden = !$('rsMessage').textContent;
    $('rsMessage').classList.toggle('is-error', validationAttempted && pendingReasons > 0);
  }
  function updateRow(row) {
    const id = row.dataset.routine;
    const value = draft[id];
    row.querySelector('.rs-name').title = columnValue(id, 'name');
    row.querySelector('[data-decision]').checked = value.decision === 'run';
    syncCriteriaRow(row);
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
      const included = selected.has(item.dataset.id);
      item.classList.toggle('rs-not-viewed', !included);
      item.classList.toggle('active', included && item.dataset.id === activeCheck);
      item.setAttribute('aria-disabled', String(!included));
      const checkbox = item.querySelector('[data-view-routine]');
      checkbox.checked = included;
      checkbox.disabled = !included;
      checkbox.title = included ? '取消查看时需填写原因' : '未选择查看，可返回查看设置重新勾选';
    });
    const count = document.querySelector('.sidebar-count');
    if (count) count.textContent = `查看 ${selected.size} / ${ids.length} 项`;
    const nextKey = `${Array.from(selected).join(',')}:${demoRevision}`;
    if (nextKey !== visibilityKey && currentStep === 2) {
      visibilityKey = nextKey;
      Object.keys(checkColumnFilters).forEach(id => { if (!selected.has(id)) delete checkColumnFilters[id]; });
      selectedCheckIds = new Set(selected);
      renderCheckGroupDisplayControls();
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
    dialog.innerHTML = `<h4 id="rsReasonDialogTitle">请补充不查看原因</h4><p id="rsReasonDialogMessage">还有 ${missing.length} 项不查看原因未填写，暂时无法查看识别结果。</p><div class="clear-sub">首个待补项：${escape(checkMeta[missing[0]].title)}</div><div class="clear-btns"><button class="primary" type="button" autofocus>返回填写</button></div>`;
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
      const invalidCondition = panel.querySelector('[data-criteria-key]:invalid');
      if (invalidCondition) {
        filterRows();
        invalidCondition.scrollIntoView({block:'nearest'});
        invalidCondition.focus();
        invalidCondition.reportValidity();
        return false;
      }
      const missing = missingReasonIds(draft);
      if (missing.length) {
        validationAttempted = true;
        if (currentStep !== 1) goToStep(1);
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
    updateDemoIdentification();
    document.body.dataset.routineStep = String(next);
    panel.hidden = next !== 1;
    steps.querySelectorAll('[data-step]').forEach(button => {
      const active = Number(button.dataset.step) === next;
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    applyScope();
    updateSummary();
    if (next === 1) refreshRoutineResults();
    steps.querySelector(`[data-step="${next}"]`).focus();
    window.dispatchEvent(new Event('resize'));
  }

  // Scope wraps navigation and column layout, leaving the existing calculations intact.
  function rowMarkSummary(row, kind, scope = ids.filter(isIncluded)) {
    const cpId = kind === 'tx' ? row.cpId : row.id;
    const hitIds = kind === 'tx' ? getTxCheckIds(row.flags) : getHitCheckIds(row.hits);
    const removed = scope.filter(id => hitIds.has(id) && manualClears[`${cpId}_${id}`]);
    const hits = scope.filter(id => hitIds.has(id) && !manualClears[`${cpId}_${id}`]);
    return {cpId, hits, removed};
  }
  function renderSettingResultCells() {
    const label = activeTab === 'tx' ? '流水明细当前筛选范围' : '对手方汇总当前筛选范围；交易数据按对应对手方的保留命中流水统计';
    rows.forEach(row => {
      const id = row.dataset.routine;
      row.querySelectorAll('[data-result]').forEach(cell => {
        const key = cell.dataset.result, value = resultValue(id, key);
        cell.textContent = key === 'identifiedAmount' ? fmtAmtFromYuan(value) : value.toLocaleString('zh-CN');
        cell.title = key === 'identifiedAmount' ? `${label}；原始金额：${value.toLocaleString('zh-CN')} 元` : `${label}；${value.toLocaleString('zh-CN')}`;
      });
    });
  }
  function refreshRoutineResults() {
    routineResults.forEach(result => { result.counterparties.clear(); result.amount = 0; result.transactions = 0; });
    const counterpartyMode = activeTab !== 'tx';
    if (counterpartyMode) getRiskFilteredRows('cp').forEach(row => {
      rowMarkSummary(row, 'cp', ids).hits.forEach(id => routineResults.get(id).counterparties.add(row.id));
    });
    const source = counterpartyMode ? txData : getRiskFilteredRows('tx');
    source.forEach(row => {
      rowMarkSummary(row, 'tx', ids).hits.forEach(id => {
        const result = routineResults.get(id);
        if (counterpartyMode && !result.counterparties.has(row.cpId)) return;
        if (!counterpartyMode) result.counterparties.add(row.cpId);
        result.amount += Math.round((Number(row.amount) || 0) * 100);
        result.transactions += 1;
      });
    });
    routineResults.forEach(result => { result.amount /= 100; });
    renderSettingResultCells();
    try {
      localStorage.setItem(demoProvider.resultKey, JSON.stringify({version:demoProvider.version,clears:manualClears,
        rows:ids.map(id => { const result=routineResults.get(id); return {id,counterparties:result.counterparties.size,amount:result.amount,transactions:result.transactions}; })}));
    } catch (error) { /* The demo still works without cross-page storage. */ }
  }
  function routineMarkResult(row, kind, scope) {
    const {cpId, hits, removed} = rowMarkSummary(row, kind, scope);
    const total=hits.length+removed.length;
    if (removed.length) return {label:`${hits.length ? '部分排除' : '已排除'} ${removed.length}/${total}`, className:'mark-cleared', rank:1, isRemoved:true,
      checkId:removed.includes(activeCheck) ? activeCheck : removed[0],
      title:`原始命中 ${total} 项，已排除 ${removed.length} 项，保留 ${hits.length} 项。\n${removed.map(id => `${checkMeta[id].title}；原因：${manualClears[`${cpId}_${id}`].reason || '未填写'}`).join('\n')}`};
    if (hits.length) return {label:`已命中 ${hits.length}`, className:'mark-flagged', rank:2, isRemoved:false,
      checkId:hits.includes(activeCheck) ? activeCheck : hits[0],
      title:`当前行命中 ${hits.length} 项核查程序，尚无手工去除标记`};
    return {label:'—', className:'mark-none', rank:0, title:'当前行无命中标记'};
  }
  function syncSidebarStatistics(kind = activeTab) {
    const source = getRiskFilteredRows(kind);
    const counts = new Map(ids.map(id => [id, {hits:0, removed:0}]));
    source.forEach(row => {
      const result = rowMarkSummary(row, kind, ids);
      result.hits.forEach(id => { counts.get(id).hits += 1; });
      result.removed.forEach(id => { counts.get(id).removed += 1; });
    });
    const label = kind === 'tx' ? '流水明细' : '对手方汇总';
    document.querySelectorAll('#checkList .check-item[data-id]').forEach(item => {
      const id = item.dataset.id, count = counts.get(id);
      const badge = item.querySelector('.badge-hits');
      badge.textContent = `${count.hits} 条`;
      badge.title = `${label}当前筛选范围（全部分页）：保留命中 ${count.hits} 条，已去除 ${count.removed} 条`;
      checkMeta[id].badge = `已命中 ${count.hits} 条`;
      checkMeta[id].count = `${label}当前筛选范围：保留命中 ${count.hits} 条，已去除 ${count.removed} 条`;
    });
    const active = counts.get(activeCheck);
    if (active) {
      const badge = document.getElementById('fpBadge');
      badge.textContent = checkMeta[activeCheck].badge;
      badge.title = checkMeta[activeCheck].count;
    }
    document.querySelector('.sidebar-count').title = `下方条数按${label}当前筛选结果统计，包含全部分页，不含已去除标记`;
    persistRiskRoutineState();
    refreshRoutineResults();
  }
  const originalCpColumnValue = window.getCpColumnValue;
  window.getCpColumnValue = (row, column) => column === 'markStatus' ? routineMarkResult(row, 'cp').label
    : column === 'hitCount' ? String(rowMarkSummary(row, 'cp').hits.length) : originalCpColumnValue(row, column);
  const originalTxColumnValue = window.getTxColumnValue;
  window.getTxColumnValue = (row, column) => column === 'flag' ? routineMarkResult(row, 'tx').label
    : column === 'hitCount' ? String(rowMarkSummary(row, 'tx').hits.length) : originalTxColumnValue(row, column);
  const originalSortValue = window.getSortValue;
  window.getSortValue = (row, column) => column === 'hitCount' ? rowMarkSummary(row, Array.isArray(row.flags) ? 'tx' : 'cp').hits.length
    : ['markStatus', 'flag'].includes(column) ? routineMarkResult(row, Array.isArray(row.flags) ? 'tx' : 'cp').rank : originalSortValue(row, column);
  window.riskExportMarkStatus = (row, kind) => routineMarkResult(row, kind).label;
  const originalShowClearModal = window.showClearModal;
  window.showClearModal = function (cpId, checkId, isUndo) {
    originalShowClearModal(cpId, checkId, isUndo);
    const overlay = Array.from(document.querySelectorAll('.clear-modal-overlay')).pop();
    const confirm = overlay.querySelector('.clear-btns .primary');
    confirm.removeAttribute('onclick');
    confirm.onclick = () => {
      if (isUndo) undoClear(cpId, checkId);
      else {
        const input = overlay.querySelector('#clearReasonInput');
        input.setCustomValidity(input.value.trim() ? '' : '请填写去除原因');
        if (!input.reportValidity()) return;
        input.value = input.value.trim();
        confirmClear(cpId, checkId);
      }
      overlay.remove();
    };
    const input = overlay.querySelector('#clearReasonInput');
    input?.addEventListener('input', () => input.setCustomValidity(''));
  };
  const transactionsById = new Map(txData.map(row => [row.txId, row]));
  window.onCheckClick = function (event, cpId, checkId) {
    event.stopPropagation();
    const row = event.target.closest('tr');
    const tx = row?.id.startsWith('tx-row-') ? transactionsById.get(row.id.slice('tx-row-'.length)) : null;
    const hitIds = tx ? getTxCheckIds(tx.flags) : getHitCheckIds(getCpById(cpId)?.hits);
    if (manualClears[`${cpId}_${checkId}`]) showClearModal(cpId, checkId, true);
    else if (hitIds.has(checkId)) showClearModal(cpId, checkId);
    else selectCheck(checkId);
  };
  function syncRoutineMarkCells(kind) {
    const source = kind === 'tx' ? txData : cpData;
    const byId = new Map(source.map(row => [kind === 'tx' ? row.txId : row.id, row]));
    document.querySelectorAll(`#${kind}Body tr`).forEach(element => {
      const row = byId.get(element.id.slice(`${kind}-row-`.length));
      const old = element.querySelector('.mark-status');
      if (!row || !old) return;
      const summary = rowMarkSummary(row, kind);
      const count = element.querySelector('.risk-hit-count-cell');
      count.textContent = summary.hits.length;
      count.title = `当前查看程序：保留 ${summary.hits.length} 个对勾，已去除 ${summary.removed.length} 个标记`;
      const result = routineMarkResult(row, kind);
      const actionable = result.label !== '—';
      const badge = document.createElement(actionable ? 'button' : 'span');
      badge.className = `mark-status rs-mark-result ${result.className}`;
      badge.textContent = result.label;
      badge.title = result.title;
      if (actionable) {
        badge.type = 'button';
        badge.setAttribute('aria-label', result.isRemoved ? '查看去除原因或恢复标记' : '填写原因并去除命中标记');
        badge.addEventListener('click', event => {
          event.stopPropagation();
          showClearModal(kind === 'tx' ? row.cpId : row.id, result.checkId, result.isRemoved);
        });
      }
      old.replaceWith(badge);
    });
    document.querySelectorAll('#cpTable th[data-col="markStatus"], #txTable th[data-col="flag"]').forEach(header => {
      header.title = '当前查看程序：已命中显示有效命中数；部分排除/已排除显示排除数/原始命中总数；不代表审计结论';
    });
    document.querySelectorAll('#cpTable th[data-col="hitCount"], #txTable th[data-col="hitCount"]').forEach(header => {
      header.title = '当前选择查看的核查程序中，保留的有效对勾数；不含已去除标记，包含折叠分类中的命中';
    });
    if (kind === activeTab) syncSidebarStatistics(kind);
  }
  const originalRenderCpTable = window.renderCpTable;
  window.renderCpTable = function (...args) {
    const result = originalRenderCpTable(...args);
    syncRoutineMarkCells('cp');
    return result;
  };
  const originalRenderTxTable = window.renderTxTable;
  window.renderTxTable = function (...args) {
    const result = originalRenderTxTable(...args);
    syncRoutineMarkCells('tx');
    return result;
  };
  const originalSwitchTab = window.switchTab;
  window.switchTab = function (tab) {
    const result = originalSwitchTab(tab);
    if (tab === 'cp') { syncRoutineMarkCells('cp'); }
    return result;
  };
  function alignExportMarks(sheet, kind, checks) {
    const source = getRiskExportRows(kind, checks);
    const statusIndex = sheet.headers.indexOf('标记状态');
    sheet.rows.forEach((record, index) => {
      record[checks.length] = [record.slice(0, checks.length).filter(value => value === 1).length, 'Number'];
      if (statusIndex >= 0) record[statusIndex] = routineMarkResult(source[index], kind, checks).label;
    });
    return sheet;
  }
  const originalCpSheet = window.getRiskExportCpSheet;
  window.getRiskExportCpSheet = checks => alignExportMarks(originalCpSheet(checks), 'cp', checks);
  const originalTxSheet = window.getRiskExportTxSheet;
  window.getRiskExportTxSheet = checks => alignExportMarks(originalTxSheet(checks), 'tx', checks);
  const originalSortData = window.sortData;
  window.sortData = function (data, column, direction) {
    const sorted = originalSortData(data, column, direction);
    if (!isIncluded(activeCheck)) return sorted;
    // Prioritize the active routine, then rank remaining rows by retained hits.
    const hits = [], others = [];
    sorted.forEach(row => {
      const kind = Array.isArray(row.flags) ? 'tx' : 'cp';
      (isCheckHitForRow(row, activeCheck, kind) ? hits : others).push(row);
    });
    const hitCounts=new Map(others.map(row=>[row,rowMarkSummary(row,Array.isArray(row.flags)?'tx':'cp').hits.length]));
    others.sort((left,right)=>hitCounts.get(right)-hitCounts.get(left));
    return hits.concat(others);
  };
  const originalFilterPanel = window.renderFilterPanel;
  window.renderFilterPanel = function (id, meta) {
    const safeMeta = {...meta, filters:(meta.filters || []).map(filter => ({...filter,
      defaultVal:typeof filter.defaultVal === 'string' ? escape(filter.defaultVal) : filter.defaultVal,
      placeholder:escape(filter.placeholder || '')
    }))};
    originalFilterPanel(id, safeMeta);
    const editable = Boolean(meta.filters?.length);
    document.getElementById('btnRun').hidden = !editable;
    const conditions = document.getElementById('filterConditions');
    conditions.classList.toggle('rs-fixed-conditions', !editable);
    if (!editable) {
      const rule = conditions.querySelector('.filter-empty');
      rule.textContent = criteriaFor(id);
      rule.title = criteriaFor(id);
    }
    (meta.filters || []).filter(filter => filter.type === 'date').forEach(filter => {
      const input = document.getElementById(`${filter.key}Val`);
      if (input && /^\d{2}\/\d{2}$/.test(String(filter.defaultVal))) {
        input.type = 'text';
        input.value = filter.defaultVal;
        input.placeholder = 'MM/DD 或 YYYY-MM-DD';
      }
    });
  };
  function refreshFilteredResults() {
    cpPage = 1;
    txPage = 1;
    renderCpTable();
    renderTxTable();
    rows.forEach(updateRow);
    const description = document.querySelector(`#checkList .check-item[data-id="${activeCheck}"] .check-item-desc`);
    if (description) {
      description.textContent = criteriaFor(activeCheck);
      description.title = criteriaFor(activeCheck);
    }
  }
  const filterButton = document.getElementById('btnRun');
  filterButton.textContent = '筛选';
  filterButton.title = '应用当前筛选条件';
  filterButton.setAttribute('aria-label', '应用当前筛选条件');
  document.querySelector('.check-context-header .btn-reset')?.remove();
  window.runCheck = function () {
    if (!checkMeta[activeCheck].filters?.length) return;
    const invalid = document.querySelector('#filterConditions input:invalid');
    if (invalid) { invalid.reportValidity(); return; }
    updateActiveRoutineFilterState();
    updateDemoIdentification();
    refreshFilteredResults();
    showToast('success', '已应用筛选条件');
  };
  const originalSelect = window.selectCheck;
  window.selectCheck = function (id) {
    if (!isIncluded(id)) return;
    const result = originalSelect(id);
    document.getElementById('fpTitle').title = checkMeta[id].title;
    document.getElementById('fpGroup').title = document.getElementById('fpGroup').textContent;
    const item = document.querySelector(`#checkList .check-item[data-id="${id}"]`);
    const group = item?.closest('.check-group');
    if (group) {
      group.classList.remove('collapsed');
      group.querySelector('.check-group-body').style.maxHeight = 'none';
    }
    rows.forEach(updateRow);
    return result;
  };
  window.getVisibleCheckGroups = function () {
    return CHECK_COLUMNS.map(group => ({...group, checks:group.checks.filter(check => isIncluded(check.id))})).filter(group => group.checks.length);
  };
  const originalGroupHeader = window.renderCheckGroupHeader;
  window.renderCheckGroupHeader = group => originalGroupHeader({...group, checks:group.checks.filter(check => isIncluded(check.id))});
  window.renderCheckGroupDisplayControls = function () {
    const box = document.getElementById('checkGroupDisplay');
    if (box) { box.replaceChildren(); box.hidden = true; }
  };
  renderCheckGroupDisplayControls();

  // Viewing preferences do not suppress automatic detection or export choices.
  window.getRiskScopeExportSheet = function () {
    refreshRoutineResults();
    const time = !hasSaved ? '尚未保存' : Number.isNaN(Date.parse(savedAt)) ? '未记录' : new Date(savedAt).toLocaleString('zh-CN', {timeZone:'Asia/Shanghai'});
    return riskExportSheet('查看设置', ['编号', '核查程序', '筛选条件', '识别对手方数', '识别交易总额（元）', '识别交易笔数', '是否查看', '不查看原因', '设置完整性', '结果展示', '保存时间'], ids.map(id => {
      const row = applied[id];
      const completeness = needsReason(row) ? '待补不查看原因' : '已填写';
      const result = routineResults.get(id);
      return [id, checkMeta[id].title, criteriaFor(id), result.counterparties.size, result.amount, result.transactions, labels[row.decision], row.decision === 'skip' ? row.reason : '', completeness, isIncluded(id) ? '展示' : '不展示（仍自动识别）', time];
    }));
  };

  function draftChanged() {
    filterRows();
    storageAvailable = persist();
    updateSummary();
  }
  panel.addEventListener('change', event => {
    if (event.target.dataset.criteriaKey) {
      updateCriteria(event.target);
      refreshRoutineResults();
      filterRows();
      return;
    }
    const id = event.target.dataset.decision;
    if (id) { draft[id].decision = event.target.checked ? 'run' : 'skip'; updateRow(event.target.closest('tr')); }
    draftChanged();
  });
  panel.addEventListener('input', event => {
    if (event.target.dataset.criteriaKey) { updateCriteria(event.target); return; }
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
  steps.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (button && Number(button.dataset.step) !== currentStep) goToStep(Number(button.dataset.step));
  });
  empty.querySelector('button').addEventListener('click', () => downloadRiskExportWorkbook([], []));
  $('rsConfirm').addEventListener('click', () => goToStep(2));
  bindSidebarViewing();
  rows.forEach(updateRow);
  filterRows();
  applyScope();
  syncSidebarStatistics();
  refreshRoutineResults();
  window.addEventListener('audit-unit-ready', () => {
    renderSettingResultCells();
    filterRows();
  });
  window.addEventListener('storage', event => {
    if(event.key!==demoProvider.stateKey)return;
    loadSharedParameters();
    updateDemoIdentification();
    rows.forEach(syncCriteriaRow);
    ids.forEach(id=>{
      const description=document.querySelector(`#checkList .check-item[data-id="${id}"] .check-item-desc`);
      if(description){description.textContent=criteriaFor(id);description.title=criteriaFor(id);}
    });
    renderFilterPanel(activeCheck,checkMeta[activeCheck]);
    refreshFilteredResults();
  });
  updateSummary();
})();
