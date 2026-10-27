const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const catalog = read('assets/js/config/routine-standards.js');
const shared = read('assets/js/core/shared.js');
const context = {window:{addEventListener:()=>{}},document:{addEventListener:()=>{}}};
vm.createContext(context);
vm.runInContext(catalog, context);
const originalRows = vm.runInContext(shared.slice(shared.indexOf('  const CHECK_STANDARD_ROWS = ['), shared.indexOf('  function nowText()', shared.indexOf('  const CHECK_STANDARD_ROWS = ['))) + '\n[...CHECK_STANDARD_ROWS,...THIRD_PARTY_ROWS]', context);
assert.equal(context.window.RoutineStandards.rows.length, originalRows.length);
for (const row of originalRows) {
  const standard = context.window.RoutineStandards.get(row.code.replace('i-', ''));
  assert.equal(standard.procedure, row.procedure.replace(/^定量考虑因素（一般事项核查标准）：\s*/, ''));
  assert.equal(standard.criteria, row.criteria);
}
assert.equal(context.window.RoutineStandards.formatCriteria('1.1', [{label:'金额',value:0,unit:'元'}]), '金额 0元');
assert.equal(context.window.RoutineStandards.get('2.1.3').procedure, '控股股东、实际控制人、董事、监事、高管、关键岗位人员从发行人获得大额现金分红款、薪酬，上述事项发生前后主要资金流向或用途存在重大异常；');
assert.equal(context.window.RoutineStandards.get('3.7').procedure, '对同一交易对方的往来同时存在收款、付款');
assert.equal(context.window.RoutineStandards.get('3.4').procedure, context.window.RoutineStandards.get('3.5').procedure);
assert.equal(context.window.RoutineStandards.get('2.2.3').procedure, context.window.RoutineStandards.get('2.2.4').procedure);

(async () => {
  const browser = await chromium.launch({headless:true, channel:'chrome'});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:960}});
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const html = read('fragments/fund-flow-check.html');
    const scripts = Array.from(html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi));
    const main = scripts.find(match => match[1].includes('const checkMeta ='))[1];
    const staticHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, '');
    await page.route('https://routine-view.test/**', route => {
      const url = route.request().url();
      const script = url.endsWith('/routine-scope-experiment.js');
      const css = url.includes('/routine-scope-experiment.css');
      return route.fulfill({contentType:script?'application/javascript':css?'text/css':'text/html',body:script?read('assets/js/pages/routine-scope-experiment.js'):css?read('assets/css/pages/routine-scope-experiment.css'):staticHtml});
    });
    await page.goto('https://routine-view.test/fixture');
    await page.addStyleTag({content:read('assets/css/pages/risk-reference-override.css')});
    await page.addScriptTag({content:catalog});
    await page.addScriptTag({content:read('assets/js/config/routine-demo-data.js')});
    await page.addScriptTag({content:main});
    await page.evaluate(() => new Promise(resolve => {
      const script = document.createElement('script');
      script.dataset.enabled = 'true';
      script.src = 'https://routine-view.test/assets/js/pages/routine-scope-experiment.js';
      script.onload = resolve;
      document.body.appendChild(script);
    }));
    await page.waitForTimeout(250);
    assert.deepEqual(errors, []);
    const first = page.locator('[data-decision="1.1"]');
    const reason = page.locator('[data-reason="1.1"]');
    assert.equal(await page.locator('#routineScope [data-decision]').count(), 22);
    assert.equal(await page.locator('#checkList .has-filter, #checkList .filter-dot').count(),0);
    assert.equal(await page.locator('#checkList .check-item.active').evaluate(item=>getComputedStyle(item).borderLeftColor!=='rgba(0, 0, 0, 0)'),true);
    assert.equal(await page.locator('#checkList .check-item:not(.active)').first().evaluate(item=>getComputedStyle(item).borderLeftColor),'rgba(0, 0, 0, 0)');
    assert.deepEqual(await page.locator('#routineScope thead th').evaluateAll(cells=>cells.map(cell=>cell.dataset.column)),
      ['id','name','criteria','identifiedCounterparties','identifiedAmount','identifiedTransactions','decision','reason']);
    assert.equal(await page.locator('#routineScope thead button, #routineScope thead [data-sort], #routineScope thead [data-filter]').count(),0);
    assert.equal(await page.locator('#routineScope tbody tr').first().locator('td').count(),8);
    assert.equal(await page.locator('#routineScope tbody td').first().evaluate(cell=>getComputedStyle(cell).borderRightWidth),'1px');
    assert.equal(await page.locator('#routineScope thead th').first().evaluate(cell=>getComputedStyle(cell).borderRightWidth),'1px');
    const settingsResultCheck = await page.evaluate(() => {
      const id='3.2';
      const counterparties=new Set(getRiskFilteredRows('cp').filter(row=>isCheckHitForRow(row,id,'cp')).map(row=>row.id));
      const flows=txData.filter(row=>counterparties.has(row.cpId)&&isCheckHitForRow(row,id,'tx'));
      const row=document.querySelector(`#routineScope [data-routine="${id}"]`);
      return {
        counterparties:Number(row.querySelector('[data-result="identifiedCounterparties"]').textContent.replaceAll(',',''))===counterparties.size,
        transactions:Number(row.querySelector('[data-result="identifiedTransactions"]').textContent.replaceAll(',',''))===flows.length,
        amount:row.querySelector('[data-result="identifiedAmount"]').textContent===fmtAmtFromYuan(flows.reduce((sum,flow)=>sum+flow.amount,0)),
        rightAligned:getComputedStyle(row.querySelector('[data-result="identifiedTransactions"]')).textAlign==='right'
      };
    });
    assert(Object.values(settingsResultCheck).every(Boolean),'settings aggregates use matching records and right-aligned numeric cells');
    assert.equal(await page.locator('#routineScope .rs-result-unit').count(),0);
    assert.equal(await page.locator('[data-routine="2.1.3"] .rs-name').evaluate(cell=>getComputedStyle(cell).whiteSpace),'normal');
    for (const width of [1440,1280,1024,390]) {
      await page.setViewportSize({width,height:960});
      const sizing=await page.locator('#routineScope .rs-scroll').evaluate(element=>({scroll:element.scrollWidth,client:element.clientWidth}));
      assert(sizing.scroll<=sizing.client+1,`settings should fit at ${width}px: ${JSON.stringify(sizing)}`);
    }
    await page.setViewportSize({width:1440,height:960});
    const unitFollowsTop = await page.evaluate(()=>{
      const id='3.2';
      const counterparties=new Set(getRiskFilteredRows('cp').filter(row=>isCheckHitForRow(row,id,'cp')).map(row=>row.id));
      const amount=txData.filter(row=>counterparties.has(row.cpId)&&isCheckHitForRow(row,id,'tx')).reduce((sum,row)=>sum+row.amount,0);
      const format=value=>Number(value).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
      window.AuditUnit={ready:true,label:'百万元',unit:'m',decimals:2,convert:value=>Number(value)/1e6,
        formatFromYuan:value=>format(Number(value)/1e6),formatFromWan:value=>format(Number(value)/100)};
      window.dispatchEvent(new CustomEvent('audit-unit-ready'));
      const converted=document.querySelector('[data-routine="3.2"] [data-result="identifiedAmount"]').textContent===format(amount/1e6);
      const noExtraUnit=!document.querySelector('#routineScope .rs-result-unit');
      delete window.AuditUnit;
      window.dispatchEvent(new CustomEvent('audit-unit-ready'));
      return converted&&noExtraUnit;
    });
    assert(unitFollowsTop,'result amounts follow the global unit without a separate unit label');
    if(process.argv.includes('--layout-only')){
      await page.screenshot({path:'/private/tmp/routine-view-layout-desktop.png'});
      await page.setViewportSize({width:390,height:844});
      await page.screenshot({path:'/private/tmp/routine-view-layout-mobile.png'});
      assert.deepEqual(errors,[]);
      console.log('PASS: eight columns, result totals, vertical separators, wrapping and no horizontal overflow at 1440/1280/1024/390px, and global amount-unit formatting.');
      return;
    }
    assert.equal(await page.locator('#routineScope [data-decision]:checked').count(), 22);
    assert.equal(await page.locator('#checkList [data-view-routine]').count(), 22);
    assert.equal(await page.locator('#checkList .badge-new').count(), 0);
    const countBadges = await page.locator('#checkList .badge-hits').allTextContents();
    assert.equal(countBadges.length, 22);
    assert(countBadges.every(text => /^\d+ 条$/.test(text)));
    assert.equal(await page.locator('#checkList .badge-hits').first().evaluate(element => getComputedStyle(element, '::after').content), 'none');
    for (const id of ['3.6', '3.7']) {
      assert.equal(await page.locator(`#checkList [data-id="${id}"].has-filter, #checkList [data-id="${id}"] .filter-dot`).count(), 0);
    }
    assert.equal(await page.locator('#checkList #group-5').count(), 0);
    assert.equal(await page.locator('[data-decision="5.1"], [data-decision="5.2"]').count(), 0);
    assert.equal(await page.evaluate(() => CHECK_COLUMNS.some(group => group.groupKey === 'other')), false);
    assert.equal(await reason.isDisabled(), true);
    assert.equal(await page.locator('#checkList [data-id="4.5"]').count(), 0);
    assert.equal(await page.locator('#checkGroupDisplay').isVisible(), false);
    assert.equal(await page.locator('#routineScope [data-column="criteria"] .rs-th-content > span').first().innerText(), '筛选条件');
    assert.equal(await page.evaluate(() => Object.keys(checkMeta).length), 22);
    assert.equal(await page.evaluate(() => HIT_TO_CHECK_ID['注册资本不匹配']), undefined);
    assert.equal(await page.evaluate(() => getHitCheckIds(['个体工商户/个人独资企业']).has('4.4')), true);
    assert.equal(await page.evaluate(() => ALL_CHECK_IDS.length), 22);
    assert.equal(await page.evaluate(() => Array.from(document.querySelectorAll('#routineScope [data-routine]')).every(row => {
      const id = row.dataset.routine;
      const name = RoutineStandards.get(id).procedure;
      return row.querySelector('.rs-name').textContent === name && document.querySelector(`#checkList .check-item[data-id="${id}"] .check-item-name`).textContent === `${id} ${name}` && checkMeta[id].title === `${id} ${name}`;
    })), true);
    assert.equal(await page.locator('#rsAllExecute, #rsStatus').count(), 0);
    assert.equal(await page.locator('#rsStepSummary').count(), 0);
    assert.equal(await page.locator('#routineScope .rs-head, #routineScope h2').count(), 0);
    assert.equal(await page.locator('.rs-footer #rsCounts').innerText(), '查看 22 项 · 不查看 0 项');
    assert.equal(await page.locator('#rsMessage').isVisible(), false);
    const amountCondition = page.locator('[data-criteria-routine="1.1"][data-criteria-key="minAmt"]');
    await amountCondition.fill('90000');
    assert.equal(await page.locator('#minAmtVal').inputValue(), '90000');
    assert.equal(await page.evaluate(() => checkMeta['1.1'].filters[0].defaultVal), 90000);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem(RISK_ROUTINE_STATE_KEY)).routines.find(row => row.id === '1.1').filters[0].value), 90000);
    assert((await page.locator('#checkList [data-id="1.1"] .check-item-desc').innerText()).includes('90000'));
    const dateCondition = page.locator('[data-criteria-routine="3.2"][data-criteria-key="bsDate"]');
    await dateCondition.fill('13/40');
    await page.locator('#rsConfirm').click();
    assert.equal(await page.locator('body').getAttribute('data-routine-step'), '1');
    assert.equal(await dateCondition.getAttribute('aria-invalid'), 'true');
    await dateCondition.fill('12/30');
    assert.equal(await page.evaluate(() => checkMeta['3.2'].filters[0].defaultVal), '12/30');
    await amountCondition.fill('0');
    assert.equal(await page.evaluate(() => checkMeta['1.1'].filters[0].defaultVal), 0);
    await amountCondition.fill('90000');
    await first.uncheck();
    assert.equal(await page.locator('.rs-footer #rsCounts').innerText(), '查看 21 项 · 不查看 1 项');
    assert.equal(await reason.isEnabled(), true);
    await reason.fill('   ');
    await page.locator('#rsConfirm').click();
    assert.equal(await page.locator('#rsMissingReasonDialog').isVisible(), true);
    assert.equal(await page.locator('body').getAttribute('data-routine-step'), '1');
    await page.locator('#rsMissingReasonDialog button').click();
    await page.locator('.rs-steps [data-step="2"]').click();
    assert.equal(await page.locator('#rsMissingReasonDialog').isVisible(), true);
    await page.locator('#rsMissingReasonDialog button').click();
    await reason.fill('本次仅查看其他项目，已另行记录复核依据');
    await page.screenshot({path:'/private/tmp/routine-view-step1.png'});
    await page.locator('#rsConfirm').click();
    assert.equal(await page.locator('body').getAttribute('data-routine-step'), '2');
    assert.equal(await page.locator('#btnRun').innerText(), '筛选');
    assert.equal(await page.locator('.check-context-header .btn-reset').count(), 0);
    assert.equal(await page.evaluate(() => Object.values(checkMeta).every(meta=>/^已命中 \d+ 条$/.test(meta.badge))), true);
    await page.evaluate(() => selectCheck('2.2.3'));
    assert.match(await page.locator('#fpBadge').innerText(), /^已命中 \d+ 条$/);
    assert.equal(await page.locator('#btnRun').isVisible(), false);
    assert.equal(await page.locator('#filterConditions .filter-empty').innerText(), context.window.RoutineStandards.get('2.2.3').criteria);
    assert.equal(await page.locator('#filterConditions .filter-empty').getAttribute('title'), context.window.RoutineStandards.get('2.2.3').criteria);
    await page.evaluate(() => selectCheck('3.2'));
    assert.equal(await page.locator('#btnRun').isVisible(), true);
    await page.locator('#btnRun').click();
    assert.equal(await page.locator('#btnRun').isEnabled(), true);
    assert.equal(await page.locator('#btnRun').innerText(), '筛选');
    await page.evaluate(() => selectCheck('1.2'));
    assert.equal(await page.locator('.sidebar-label').innerText(), '核查程序');
    const headingBoxes = await page.locator('.sidebar-label, .sidebar-count').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return {top:box.top,bottom:box.bottom};
    }));
    assert(Math.max(...headingBoxes.map(box=>box.top)) < Math.min(...headingBoxes.map(box=>box.bottom)), 'sidebar heading and count share a row');
    const hiddenItem = page.locator('#checkList [data-id="1.1"]');
    assert.equal(await hiddenItem.isVisible(), true);
    assert.equal(await hiddenItem.locator('input').isChecked(), false);
    assert.equal(await hiddenItem.locator('input').isDisabled(), true);
    assert((await hiddenItem.getAttribute('class')).includes('rs-not-viewed'));
    assert.equal(await page.locator('#cpTable th[data-check="1.1"]').count(), 0);
    assert.equal(await page.locator('#txTable th[data-check="1.1"]').count(), 0);
    assert.equal(await page.evaluate(() => getVisibleCheckGroups().flatMap(group => group.checks).length), 21);
    assert.equal(await page.evaluate(() => riskExportSelectedChecks.has('1.1')), true, 'view choices do not disable export');
    const longTitle = await page.evaluate(() => {
      const header = document.querySelector('.check-context-header');
      const before = header.getBoundingClientRect();
      selectCheck('2.1.3');
      const title = document.getElementById('fpTitle');
      const after = header.getBoundingClientRect();
      const sidebar = document.querySelector('#checkList [data-id="2.1.3"] .check-item-name');
      const setting = document.querySelector('#routineScope [data-routine="2.1.3"] .rs-name');
      const result = {heightStable:Math.abs(before.height-after.height)<1, widthStable:Math.abs(before.width-after.width)<1,
        truncated:title.scrollWidth>title.clientWidth, ellipsis:getComputedStyle(title).textOverflow,
        fullTooltip:title.title===checkMeta['2.1.3'].title, sidebarTooltip:sidebar.title===checkMeta['2.1.3'].title,
        settingTooltip:setting.title===RoutineStandards.get('2.1.3').procedure};
      selectCheck('1.2');
      return result;
    });
    assert.deepEqual(longTitle, {heightStable:true,widthStable:true,truncated:true,ellipsis:'ellipsis',fullTooltip:true,sidebarTooltip:true,settingTooltip:true});
    const ordering = await page.evaluate(() => {
      const checks = [];
      for (const id of ['3.2', '4.3', '2.1.1']) {
        cpPage = 3;
        txPage = 3;
        selectCheck(id);
        checks.push(cpPage === 1 && txPage === 1);
        for (const kind of ['cp', 'tx']) {
          const data = getRiskFilteredRows(kind);
          let sawOther = false;
          checks.push(data.every(row => {
            const hit = isCheckHitForRow(row, id, kind);
            if (!hit) sawOther = true;
            return !hit || !sawOther;
          }));
          const otherRows=data.filter(row=>!isCheckHitForRow(row,id,kind));
          const count=row=>Number(kind==='tx'?getTxColumnValue(row,'hitCount'):getCpColumnValue(row,'hitCount'));
          checks.push(otherRows.every((row,index)=>!index||count(otherRows[index-1])>=count(row)));
          checks.push(data.length===(kind==='tx'?txData:cpData).length);
          const actual = Array.from(document.querySelectorAll(`#${kind}Body tr`), row => row.id.replace(`${kind}-row-`, ''));
          checks.push(JSON.stringify(actual) === JSON.stringify(data.slice(0, actual.length).map(row => kind === 'tx' ? row.txId : row.id)));
        }
      }
      selectCheck('3.2');
      const sample = [{id:'s1',hits:['期末集中'],outflow:10},{id:'s2',hits:['累计大额','摘要异常'],outflow:1000},{id:'s3',hits:['期末集中'],outflow:20},{id:'s4',hits:['期末集中'],outflow:2000}];
      manualClears['s4_3.2'] = {reason:'已核实'};
      checks.push(sortData(sample, 'outflow', 'desc').map(row=>row.id).join() === 's3,s1,s2,s4');
      checks.push(sortData(sample, 'outflow', 'asc').map(row=>row.id).join() === 's1,s3,s2,s4');
      const transactions = sample.map(row=>({cpId:row.id,flags:row.hits,amount:row.outflow,dir:'流出'}));
      checks.push(sortData(transactions, 'outflowAmt', 'desc').map(row=>row.cpId).join() === 's3,s1,s2,s4');
      checks.push(sample.map(row=>row.id).join() === 's1,s2,s3,s4');
      delete manualClears['s4_3.2'];
      selectCheck('1.2');
      return checks;
    });
    assert(ordering.every(Boolean), 'active routine hits lead before pagination, with stable secondary sorting and cleared hits excluded');
    const markResults = await page.evaluate(() => {
      selectCheck('3.2');
      const hit = cpData.find(row => isCheckHitForRow(row, activeCheck, 'cp'));
      const empty = cpData.find(row => !getHitCheckIds(row.hits).size);
      const tx = txData.find(row => row.cpId === hit.id && getTxCheckIds(row.flags).has(activeCheck));
      const cpTotal=Number(getCpColumnValue(hit,'hitCount')),txTotal=Number(getTxColumnValue(tx,'hitCount'));
      const cpMarked=`已命中 ${cpTotal}`,txMarked=`已命中 ${txTotal}`;
      const cpRemoved=`${cpTotal>1?'部分排除':'已排除'} 1/${cpTotal}`;
      const txRemoved=`${txTotal>1?'部分排除':'已排除'} 1/${txTotal}`;
      const checks = [getCpColumnValue(hit,'markStatus')===cpMarked, getCpColumnValue(empty,'markStatus')==='—',
        getTxColumnValue(tx,'flag')===txMarked,riskExportMarkStatus(hit,'cp')===cpMarked];
      const key = `${hit.id}_${activeCheck}`;
      const oldRemark = hit.remark;
      manualClears[key] = {reason:'已取得支持材料',time:'测试'};
      renderCpTable();renderTxTable();
      checks.push(getCpColumnValue(hit,'markStatus')===cpRemoved,getTxColumnValue(tx,'flag')===txRemoved,
        riskExportMarkStatus(hit,'cp')===cpRemoved,getSortValue(hit,'markStatus')===1);
      const cell = document.querySelector(`#cp-row-${hit.id} .rs-mark-result`);
      if(cell)checks.push(cell.textContent===cpRemoved && cell.title.includes('已取得支持材料'));
      selectCheck('2.1.1');
      checks.push(getCpColumnValue(hit,'markStatus')===cpRemoved,getTxColumnValue(tx,'flag')===txRemoved);
      selectCheck('3.2');
      delete manualClears[key];
      renderCpTable();renderTxTable();
      checks.push(getCpColumnValue(hit,'markStatus')===cpMarked,hit.remark===oldRemark);
      checks.push(Array.from(document.querySelectorAll('#cpBody .mark-status, #txBody .mark-status')).every(badge=>
        /^(已命中 \d+|(?:部分排除|已排除) \d+\/\d+|—)$/.test(badge.textContent) && !badge.hasAttribute('onclick')));
      const single={id:'mark-single',hits:['期末集中']};
      checks.push(getCpColumnValue(single,'markStatus')==='已命中 1');
      manualClears['mark-single_3.2']={reason:'已核实'};
      checks.push(getCpColumnValue(single,'markStatus')==='已排除 1/1',riskExportMarkStatus(single,'cp')==='已排除 1/1');
      checks.push(getTxColumnValue({cpId:'mark-single',flags:[]},'flag')==='—');
      delete manualClears['mark-single_3.2'];
      selectCheck('1.2');
      return checks;
    });
    assert(markResults.every(Boolean), 'status derives from current routine marks, and matches filters, export and manual clear/restore');
    const unifiedCounts = await page.evaluate(() => {
      const assertions = [];
      const checkCounts = kind => {
        const source = getRiskFilteredRows(kind);
        const visible = getVisibleCheckGroups().flatMap(group => group.checks.map(check=>check.id));
        const records = new Map((kind==='tx'?txData:cpData).map(row=>[kind==='tx'?row.txId:row.id,row]));
        const counts = new Map(ALL_CHECK_IDS.map(id=>[id,0]));
        source.forEach(row => ALL_CHECK_IDS.forEach(id=>{if(isCheckHitForRow(row,id,kind))counts.set(id,counts.get(id)+1);}));
        document.querySelectorAll('#checkList .check-item[data-id]').forEach(item=>{
          assertions.push(item.querySelector('.badge-hits').textContent===`${counts.get(item.dataset.id)} 条`);
        });
        assertions.push(document.getElementById('fpBadge').textContent===`已命中 ${counts.get(activeCheck)} 条`);
        let totalHits=0;
        source.forEach(row=>{totalHits+=visible.filter(id=>isCheckHitForRow(row,id,kind)).length;});
        assertions.push(totalHits===visible.reduce((sum,id)=>sum+counts.get(id),0));
        document.querySelectorAll(`#${kind}Body tr`).forEach(element=>{
          const row = records.get(element.id.replace(`${kind}-row-`,''));
          const expected = visible.filter(id=>isCheckHitForRow(row,id,kind)).length;
          const rendered = element.querySelectorAll('.hit-cell').length+
            Array.from(element.querySelectorAll('.group-summary-count')).reduce((sum,node)=>sum+Number(node.textContent),0);
          assertions.push(Number(element.querySelector('.risk-hit-count-cell').textContent)===expected,rendered===expected);
          assertions.push(Number(kind==='tx'?getTxColumnValue(row,'hitCount'):getCpColumnValue(row,'hitCount'))===expected);
        });
        const chosen=['3.2','4.3'];
        const sheet=kind==='tx'?getRiskExportTxSheet(chosen):getRiskExportCpSheet(chosen);
        sheet.rows.forEach(row=>assertions.push(row[chosen.length][0]===row.slice(0,chosen.length).filter(cell=>cell===1).length));
      };
      selectCheck('3.2');switchTab('cp');checkCounts('cp');
      const hit=cpData.find(row=>isCheckHitForRow(row,'3.2','cp'));
      const before=Number(document.querySelector('#checkList [data-id="3.2"] .badge-hits').textContent.replace(' 条',''));
      manualClears[`${hit.id}_3.2`]={reason:'口径一致性测试'};
      renderCpTable();renderTxTable();checkCounts('cp');
      assertions.push(Number(document.querySelector('#checkList [data-id="3.2"] .badge-hits').textContent.replace(' 条',''))===before-1);
      switchTab('tx');checkCounts('tx');
      txPage=2;renderTxTable();checkCounts('tx');
      delete manualClears[`${hit.id}_3.2`];renderCpTable();renderTxTable();checkCounts('tx');
      switchTab('cp');selectCheck('1.2');
      return assertions;
    });
    assert(unifiedCounts.every(Boolean), 'sidebar, all-page totals, rendered checkmarks, row counts, filters and export agree after clear/restore');
    await page.evaluate(() => selectCheck('3.2'));
    const hitCell = page.locator('#cpBody .hit-cell[data-check="3.2"]').first();
    const clearedCpId = await hitCell.getAttribute('data-cp');
    await hitCell.click();
    assert.equal(await page.locator('.clear-modal-overlay').isVisible(), true);
    await page.locator('.clear-modal-overlay .primary').click();
    assert.equal(await page.locator('.clear-modal-overlay').isVisible(), true, 'blank reason cannot close the dialog');
    await page.locator('#clearReasonInput').fill('已核实资金用途并取得支持材料');
    await page.locator('.clear-modal-overlay .primary').click();
    assert.equal(await page.locator('.clear-modal-overlay').count(), 0);
    assert.equal(await page.evaluate(id => manualClears[`${id}_3.2`].reason, clearedCpId), '已核实资金用途并取得支持材料');
    await page.evaluate(id => showClearModal(id, '3.2', true), clearedCpId);
    await page.locator('.clear-modal-overlay .primary').click();
    assert.equal(await page.evaluate(id => Boolean(manualClears[`${id}_3.2`]), clearedCpId), false);
    await page.locator('#cpBody button.rs-mark-result.mark-flagged').first().click();
    assert.equal(await page.locator('.clear-modal-overlay').isVisible(), true, 'status badge also opens the same clear dialog');
    await page.locator('.clear-modal-overlay .clear-btns button:not(.primary)').click();
    await page.evaluate(() => {selectCheck('3.3');switchTab('tx');});
    const txHitCell = page.locator('#txBody .hit-cell[data-check="3.3"]').first();
    const txCpId = await txHitCell.getAttribute('data-cp');
    await txHitCell.click();
    assert.equal(await page.locator('.clear-modal-overlay').isVisible(), true, 'transaction-only hits can be cleared');
    await page.locator('#clearReasonInput').fill('已核对流水摘要及原始凭证');
    await page.locator('.clear-modal-overlay .primary').click();
    assert.equal(await page.evaluate(id => manualClears[`${id}_3.3`].reason, txCpId), '已核对流水摘要及原始凭证');
    await page.evaluate(id => {undoClear(id,'3.3');switchTab('cp');selectCheck('1.2');}, txCpId);
    const second = page.locator('#checkList [data-id="1.2"] input');
    await second.uncheck();
    assert.equal(await page.locator('#rsHideRoutineDialog').isVisible(), true);
    await page.locator('#rsHideRoutineDialog [data-cancel]').click();
    assert.equal(await second.isChecked(), true);
    await second.uncheck();
    await page.locator('#rsHideRoutineDialog [data-confirm]').click();
    assert.equal(await page.locator('#rsHideRoutineReason').getAttribute('aria-invalid'), 'true');
    await page.locator('#rsHideRoutineReason').fill('已在其他底稿中单独查看');
    await page.locator('#rsHideRoutineDialog [data-confirm]').click();
    assert.equal(await second.isDisabled(), true);
    assert.equal(await page.locator('[data-decision="1.2"]').isChecked(), false);
    assert.equal(await page.locator('[data-reason="1.2"]').inputValue(), '已在其他底稿中单独查看');
    await page.screenshot({path:'/private/tmp/routine-view-step2.png'});
    await page.locator('.rs-steps [data-step="1"]').click();
    await page.evaluate(()=>switchTab('tx'));
    await page.locator('.rs-steps [data-step="2"]').click();
    await page.locator('.rs-steps [data-step="1"]').click();
    assert.equal(await page.locator('[data-routine="3.2"] [data-result="identifiedTransactions"]').innerText(),
      await page.evaluate(()=>getRiskFilteredRows('tx').filter(row=>isCheckHitForRow(row,'3.2','tx')).length.toLocaleString('zh-CN')));
    await page.evaluate(()=>switchTab('cp'));
    for (const input of await page.locator('[data-decision]').all()) await input.check();
    assert.equal(await page.locator('#routineScope [data-decision]:checked').count(), 22);
    await page.locator('#rsConfirm').click();
    assert.equal(await page.locator('#checkList [data-view-routine]:disabled').count(), 0);
    assert.equal(await page.evaluate(() => getVisibleCheckGroups().flatMap(group => group.checks).length), 22);
    await page.locator('.rs-steps [data-step="1"]').click();
    for (const input of await page.locator('[data-decision]').all()) await input.uncheck();
    for (const input of await page.locator('[data-reason]').all()) await input.fill('本次不查看，已记录复核依据');
    await page.locator('#rsConfirm').click();
    assert.equal(await page.locator('.rs-workspace-empty').isVisible(), true);
    assert.equal(await page.locator('.main-layout').isVisible(), false);
    assert.equal(await page.evaluate(() => riskExportSelectedChecks.size), 22);
    assert.equal(await page.evaluate(() => getVisibleCheckGroups().length), 0);
    await page.locator('.rs-steps [data-step="1"]').click();
    for (const input of await page.locator('[data-decision]').all()) await input.check();
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'/private/tmp/routine-view-mobile.png'});
    assert.deepEqual(errors, []);
    console.log('PASS: 22 routines; active-hit-first sorting across both tables before pagination, secondary order and manual clears; viewing preferences, condition editing, validation, sidebar sync and export isolation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
