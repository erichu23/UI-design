const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:960}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const html=read('fragments/workingpaper-export.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'');
    await page.route('https://report.test/**',route=>route.fulfill({contentType:'text/html',body:route.request().url().endsWith('data-management.html')?read('fragments/data-management.html'):html}));
    const setup=async()=>{
      for(const file of ['assets/css/base.css','assets/css/pages/bank-analysis.css','assets/css/pages/workingpaper.css','assets/css/pages/bank-analysis-compact.css','assets/css/pages/workingpaper-export.css'])await page.addStyleTag({content:read(file)});
      await page.evaluate(()=>{window.WP={book:'制造集团审计项目',proj:'2025/A001',kindText:'年度审计',fyEnd:'12-31',dataStart:'2023-01-01',dataEnd:'2026-12-31',accounts:[{org:'甲公司'},{org:'乙公司'}],dataSources:[{name:'客户主档',status:'已上传',updatedAt:'2026-10-30 12:00:00'}]};window.addEventListener('risk-report:export',event=>window.lastExport=event.detail);});
      await page.addScriptTag({content:read('assets/js/config/report-periods.js')});
      await page.addScriptTag({content:read('assets/js/config/project-workbooks.js')});
      await page.addScriptTag({content:read('assets/js/config/report-data-sources.js')});
      await page.addScriptTag({content:read('assets/js/pages/workingpaper-export.js')});
    };
    await page.goto('https://report.test/');await setup();
    const aligned=await page.evaluate(()=>{
      const tab=document.querySelector('.wp-export-tab-container').getBoundingClientRect(),card=document.querySelector('.wp-report-cover').getBoundingClientRect();
      return Math.abs(tab.left-card.left)<1&&Math.abs(tab.right-card.right)<1;
    });
    assert.equal(aligned,true,'report card edges align with the tab bar');
    assert.equal(await page.locator('#riskReportAuditedEntity').textContent(),'甲公司、乙公司');
    assert.equal(await page.locator('#riskReportProjectIdentity').count(),0);
    assert.equal(await page.locator('#riskReportDataPeriod').textContent(),'2023年1月1日 - 2026年12月31日');
    assert.equal(await page.locator('#riskReportDataSources tr').count(),8);
    assert.equal(await page.locator('#riskReportExportForm input[type=date]').count(),0);
    assert.equal(await page.locator('#riskReportPeriodSelect').inputValue(),'');
    await page.locator('#btnExportRiskReport').click();
    assert((await page.locator('#riskReportDateError').textContent()).includes('请先选择财务报表期间'));
    assert.equal(await page.locator('#riskReportPeriodSelect').evaluate(el=>document.activeElement===el),true);
    assert.equal(await page.evaluate(()=>window.lastExport||null),null);
    assert.equal(await page.locator('#riskReportControlBlock, #riskReportCounterpartyTable').count(),0);
    for(const [end,period] of [['03-31','2024-04-01/2025-03-31'],['06-30','2024-07-01/2025-06-30'],['09-30','2024-10-01/2025-09-30']]){
      await page.evaluate(end=>{WP.fyEnd=end;RiskReportExportSettings.refresh();},end);
      assert((await page.locator('#riskReportPeriodSelect option').evaluateAll(rows=>rows.map(row=>row.value))).includes(period));
    }
    await page.evaluate(()=>{WP.fyEnd='12-31';RiskReportExportSettings.refresh();});
    await page.locator('#riskReportPeriodSelect').selectOption('2025-01-01/2025-12-31');
    await page.locator('#btnExportRiskReport').click();
    assert.deepEqual(await page.evaluate(()=>lastExport.period),{start:'2025-01-01',end:'2025-12-31'});
    await page.screenshot({path:'/private/tmp/report-export-desktop.png'});
    await page.reload();await setup();
    assert.equal(await page.locator('#riskReportPeriodSelect').inputValue(),'2025-01-01/2025-12-31');
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.locator('.wp-report-export-page').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
    await page.screenshot({path:'/private/tmp/report-export-mobile.png'});
    await page.evaluate(()=>{
      WP.transactions=[{date:'2024-04-02'},{date:'2025-03-30'}];
      WP.dataSources=[{name:'员工主档',recordCount:3,missingCount:1,updatedAt:'2026-11-02 10:00:00'}];
      window.dispatchEvent(new Event('project-data-updated'));
    });
    assert.equal(await page.locator('#riskReportDataPeriod').textContent(),'2024年4月2日 - 2025年3月30日');
    assert((await page.locator('#riskReportDataSources').textContent()).includes('部分缺失'));
    assert((await page.locator('#riskReportDataSources').textContent()).includes('2026-11-02 10:00:00'));
    await page.evaluate(()=>{WP.transactions=[];WP.dataSources=[];window.dispatchEvent(new Event('project-data-updated'));});
    assert.equal(await page.locator('#riskReportPeriodSelect').inputValue(),'');
    await page.locator('#btnExportRiskReport').click();
    assert((await page.locator('#riskReportDateError').textContent()).includes('暂无可选财务报表期间'));
    assert((await page.locator('#riskReportDataPeriod').textContent()).includes('暂无'));
    assert((await page.locator('#riskReportDataSources').textContent()).includes('未提供状态'));
    await page.evaluate(()=>{
      localStorage.setItem('auditCompass.currentWorkbook','当前工作簿');
      localStorage.setItem('auditCompass.projectWorkbooks',JSON.stringify([{name:'当前工作簿',fiscalYearEnd:'03-31',dataPeriod:{start:'2024-04-01',end:'2025-03-31'},dataSources:[{name:'客户主档',status:'已上传',updatedAt:'2026-11-02'}]}]));
      window.dispatchEvent(new StorageEvent('storage',{key:'auditCompass.projectWorkbooks'}));
    });
    assert.equal(await page.locator('#riskReportDataPeriod').textContent(),'2024年4月1日 - 2025年3月31日');
    assert.equal(await page.locator('#riskReportPeriodSelect option[value="2024-04-01/2025-03-31"]').count(),1);
    await page.evaluate(()=>{
      localStorage.setItem('auditCompass.projectWorkbooks',JSON.stringify([{name:'当前工作簿',fiscalYearEnd:'06-30',analysisStart:'2024-07-01',analysisEnd:'2025-06-30'}]));
      window.dispatchEvent(new StorageEvent('storage',{key:'auditCompass.projectWorkbooks'}));
    });
    await page.waitForFunction(()=>document.getElementById('riskReportDataSources').textContent.includes('2026-04-08'));
    assert.equal(await page.locator('#riskReportPeriodSelect option[value="2024-07-01/2025-06-30"]').count(),1);
    assert((await page.locator('#riskReportDataSources').textContent()).includes('2026-04-10'));
    await page.evaluate(()=>{
      localStorage.removeItem('auditCompass.currentWorkbook');
      localStorage.removeItem('auditCompass.projectWorkbooks');
      window.WP={book:'test for tech hour',fyEnd:'12-31',accounts:[]};
      RiskReportExportSettings.refresh();
    });
    assert.equal(await page.locator('#riskReportDataPeriod').textContent(),'2026年4月1日 - 2026年5月29日');
    assert.equal(await page.locator('#riskReportPeriodSelect option[value="2026-01-01/2026-12-31"]').count(),1);
    await page.evaluate(()=>{
      localStorage.setItem('auditCompass.currentWorkbook','旧版工作簿');
      localStorage.setItem('auditCompass.projectWorkbooks',JSON.stringify([{name:'旧版工作簿',period:'2023-01-01 - 2025-12-31',fiscalYearEnd:'12-31'}]));
      RiskReportExportSettings.refresh();
    });
    assert.equal(await page.locator('#riskReportDataPeriod').textContent(),'2023年1月1日 - 2025年12月31日');
    assert.equal(await page.locator('#riskReportPeriodSelect option').count(),4);
    await page.locator('[data-export-tab="workingpaper"]').click();
    assert.equal(await page.locator('[data-export-pane="workingpaper"]').isVisible(),true);
    assert.deepEqual(errors,[]);
    console.log('PASS: report cover, master-file statuses, four fiscal calendars, selectable system periods, export payload, persistence, desktop/mobile layouts and independent working-paper tab.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
