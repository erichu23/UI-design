(()=>{
  const toast=document.getElementById('wpExportToast');
  const materiality=document.getElementById('workingpaperMateriality');
  const materialityKey='auditCompass.workingpaperMateriality';
  let timer=0;
  const tabs=Array.from(document.querySelectorAll('[data-export-tab]'));
  const panes=Array.from(document.querySelectorAll('[data-export-pane]'));
  const tabbar=document.getElementById('workingpaperExportTabs');
  const inkbar=document.getElementById('workingpaperExportInkbar');
  const embeddedExportTab=new URLSearchParams(location.search).get('embed');
  const positionInkbar=tab=>{
    if(!inkbar||!tabbar||!tab)return;
    const wrapRect=tabbar.getBoundingClientRect();
    const tabRect=tab.getBoundingClientRect();
    inkbar.style.left=`${tabRect.left-wrapRect.left+tabbar.scrollLeft}px`;
    inkbar.style.width=`${tabRect.width}px`;
    inkbar.style.transform='none';
  };
  const activateTab=name=>{
    const active=tabs.find(tab=>tab.dataset.exportTab===name)||tabs[0];
    tabs.forEach(tab=>{
      const selected=tab===active;
      tab.classList.toggle('active',selected);
      tab.setAttribute('aria-selected',String(selected));
    });
    panes.forEach(pane=>{
      const selected=pane.dataset.exportPane===active?.dataset.exportTab;
      pane.classList.toggle('is-active',selected);
      pane.hidden=!selected;
    });
    window.requestAnimationFrame(()=>positionInkbar(active));
  };
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>activateTab(tab.dataset.exportTab));
    tab.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      event.preventDefault();
      activateTab(tab.dataset.exportTab);
    });
  });
  tabbar?.addEventListener('scroll',()=>positionInkbar(tabs.find(tab=>tab.classList.contains('active'))),{passive:true});
  window.addEventListener('resize',()=>positionInkbar(tabs.find(tab=>tab.classList.contains('active'))));
  activateTab(panes.some(pane=>pane.dataset.exportPane===embeddedExportTab)?embeddedExportTab:'risk-report');

  const routineStateKey='auditCompass.specialTransactionRoutineState';
  const formatRoutineCriteria=(filters,id)=>{
    if(window.RoutineStandards)return window.RoutineStandards.formatCriteria(id,filters);
    if(!filters?.length)return '无需额外筛选';
    return filters.map(filter=>{
      const raw=filter.value;
      const value=raw===null||raw===undefined||raw===''?(filter.placeholder||'不筛选'):raw;
      return `${filter.label} ${value}${raw===null||raw===undefined||raw===''?'':filter.unit||''}`.trim();
    }).join('；');
  };
  const loadRoutineState=()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(routineStateKey)||'null');
      return new Map((saved?.routines||[]).map(routine=>[String(routine.id),routine]));
    }catch(error){return new Map();}
  };
  const syncRoutineParameters=()=>{
    const rows=Array.from(document.querySelectorAll('#rngTbody tr, #fraudTbody tr'));
    if(!rows.length)return;
    const routines=loadRoutineState();
    const results=new Map((window.RoutineDemoData?.readSummary()||[]).map(row=>[row.id,row]));
    rows.forEach(row=>{
      const id=String(row.cells[1]?.textContent||'').trim().replace(/^i-/,'');
      const routine=routines.get(id);
      const standard=window.RoutineStandards?.get(id);
      if(standard)row.cells[0].textContent=standard.procedure;
      if(standard||routine?.filters?.length){
        row.cells[2].classList.add('wp-synced-criteria');
        row.cells[2].title='参数与特殊交易识别同步，修改后自动更新识别结果';
      }
      if(window.RoutineDistribution?.supports(id)&&!row.cells[2].querySelector('[data-wp-distribution]')){
        const button=document.createElement('button');
        button.type='button';
        button.className='wp-distribution-trigger';
        button.dataset.wpDistribution=id;
        button.setAttribute('aria-label',`${id} 分布参考`);
        button.setAttribute('aria-haspopup','dialog');
        button.setAttribute('aria-controls','wpRoutineDistribution');
        button.setAttribute('aria-expanded','false');
        button.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v16h16M8 16v-4M12 16V7M16 16v-7"/></svg><span>分布参考</span>';
        row.cells[2].append(button);
      }
      const result=results.get(id);
      if(result){
        row.cells[3].innerHTML='<span class="wp-execution-badge">已完成</span>';
        row.cells[4].textContent=result.counterparties.toLocaleString('zh-CN');
        row.cells[5].setAttribute('data-audit-unit-ignore','');
        row.cells[5].innerHTML=`<span data-audit-amount-k="${result.amount/1000}">${window.AuditUnit?.formatFromYuan?.(result.amount)??(result.amount/1000).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>`;
        row.cells[6].textContent=result.transactions.toLocaleString('zh-CN');
      }
    });
    if(distributionAnchor&&!distributionAnchor.isConnected)closeDistribution();
    else if(distributionAnchor)renderDistribution();
  };
  const distribution=document.createElement('section');
  distribution.id='wpRoutineDistribution';
  distribution.hidden=true;
  distribution.setAttribute('role','dialog');
  distribution.setAttribute('aria-labelledby','wpDistributionTitle');
  distribution.setAttribute('data-audit-unit-ignore','');
  distribution.innerHTML='<div class="wp-distribution-head"><strong id="wpDistributionTitle"></strong><button type="button" aria-label="关闭分布参考">关闭</button></div><div class="wp-distribution-body"></div>';
  document.body.append(distribution);
  let distributionAnchor=null;
  function closeDistribution(restoreFocus=false){
    const anchor=distributionAnchor;
    anchor?.setAttribute('aria-expanded','false');
    distributionAnchor=null;
    distribution.hidden=true;
    if(restoreFocus)anchor?.focus();
  }
  function positionDistribution(){
    if(!distributionAnchor)return;
    const rect=distributionAnchor.getBoundingClientRect();
    if(rect.bottom<0||rect.top>innerHeight){closeDistribution();return;}
    const width=distribution.offsetWidth,height=distribution.offsetHeight;
    distribution.style.left=`${Math.max(8,Math.min(rect.left,innerWidth-width-8))}px`;
    distribution.style.top=`${Math.max(8,Math.min(rect.bottom+6,innerHeight-height-8))}px`;
  }
  function renderDistribution(){
    if(!distributionAnchor)return;
    const demo=window.RoutineDemoData;
    if(!demo)return;
    const id=distributionAnchor.dataset.wpDistribution;
    const data=demo.create({parameters:demo.readParameters()});
    let clears={};
    try{const saved=JSON.parse(localStorage.getItem(demo.resultKey)||'null');if(saved?.version===demo.version)clears=saved.clears||{};}catch(error){}
    const stats=window.RoutineDistribution.build(id,data.counterparties,data.transactions,clears);
    const unit=window.AuditUnit?.label||'千元';
    const format=amount=>window.AuditUnit?.formatFromYuan?.(amount)??(amount/1000).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
    distribution.querySelector('strong').textContent=`${stats.title}${stats.cumulative?'（累计门槛）':''}`;
    distribution.querySelector('.wp-distribution-body').innerHTML=`<table><thead><tr><th>范围${stats.cumulative?'（累计）':''}</th>${stats.counterparties?'<th>对手方数量</th>':''}<th>金额（${unit}）</th><th>笔数</th><th>金额占比</th></tr></thead><tbody>${stats.groups.map(group=>`<tr><td>${group.label}</td>${stats.counterparties?`<td>${group.count.toLocaleString('zh-CN')}个</td>`:''}<td>${format(group.amount)}</td><td>${group.transactions.toLocaleString('zh-CN')}笔</td><td>${(group.ratio*100).toLocaleString('zh-CN',{maximumFractionDigits:1})}%</td></tr>`).join('')}</tbody></table><p>按本项目阈值筛选前的基础范围统计，不含已手工排除的记录；占比为本档交易金额占基础范围交易金额。${stats.cumulative?'累计门槛可重叠，不可相加。':id==='1.1'||id==='3.6'?'M表示百万元。':''}</p>`;
    distribution.hidden=false;
    positionDistribution();
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-wp-distribution]');
    if(!button)return;
    if(distributionAnchor===button){closeDistribution();return;}
    closeDistribution();
    distributionAnchor=button;
    button.setAttribute('aria-expanded','true');
    renderDistribution();
  });
  distribution.querySelector('button').addEventListener('click',()=>closeDistribution(true));
  document.addEventListener('pointerdown',event=>{if(distributionAnchor&&!distribution.contains(event.target)&&!distributionAnchor.contains(event.target))closeDistribution();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&distributionAnchor){event.preventDefault();closeDistribution(true);}});
  document.addEventListener('scroll',positionDistribution,true);
  window.addEventListener('resize',positionDistribution);
  tabs.forEach(tab=>tab.addEventListener('click',()=>closeDistribution()));
  window.addEventListener('audit-unit-ready',()=>{syncRoutineParameters();});
  window.requestAnimationFrame(syncRoutineParameters);
  document.getElementById('directTestSwitch')?.addEventListener('change',()=>window.requestAnimationFrame(syncRoutineParameters));
  window.addEventListener('storage',event=>{if(event.key===routineStateKey||event.key===window.RoutineDemoData?.resultKey)syncRoutineParameters();});
  window.addEventListener('routine-parameters-changed',syncRoutineParameters);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncRoutineParameters();});

  const showToast=message=>{
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
  };
  const reportForm=document.getElementById('riskReportExportForm');
  const periodSelect=document.getElementById('riskReportPeriodSelect');
  const reportError=document.getElementById('riskReportDateError');
  const periodsAPI=window.ReportPeriods;
  let reportContext=null,periodOptions=[],periodStorageKey='';
  function readReportContext(){
    const wp=window.WP||{};let book={};
    try{
      const selected=localStorage.getItem('auditCompass.currentWorkbook');
      const workbooks=window.ProjectWorkbooks?.read()||JSON.parse(localStorage.getItem('auditCompass.projectWorkbooks')||'[]');
      const hasProjectData=Array.isArray(wp.transactions)||wp.dataPeriod||wp.dataStart||wp.analysisStart||wp.financialPeriods;
      book=(selected?workbooks.find(row=>row.name===selected):workbooks.find(row=>row.name===wp.book)||(!hasProjectData?workbooks[0]:null))||{};
    }catch(error){}
    const entities=[...new Set((wp.accounts||[]).map(account=>account.org).filter(Boolean))];
    const data=!book.name||book.name===wp.book?wp:{};
    const records=Array.isArray(book.transactions)?book.transactions:Array.isArray(data.transactions)?data.transactions:null;
    const dates=records?.map(row=>String(row.date||row.transactionDate||'').slice(0,10)).filter(periodsAPI.validDate).sort();
    const actualPeriod=book.dataPeriod||data.dataPeriod||{};
    const start=records!==null?(dates[0]||''):actualPeriod.start||book.dataStart||data.dataStart||book.analysisStart||data.analysisStart||'';
    const end=records!==null?(dates[dates.length-1]||''):actualPeriod.end||book.dataEnd||data.dataEnd||book.analysisEnd||data.analysisEnd||'';
    const yearEnd=book.fiscalYearEnd||data.fyEnd;
    const sourcesProvided=Array.isArray(book.dataSources)||Array.isArray(data.dataSources);
    const sourceBook=book.name||wp.book||'';
    const sources=Array.isArray(book.dataSources)?book.dataSources:Array.isArray(data.dataSources)?data.dataSources:window.ReportDataSources?.peek(sourceBook)||[];
    return {project:{name:book.name||wp.book||'—',code:wp.proj||'—',type:wp.kindText||'—',entities},
      auditedEntity:wp.auditedEntity||wp.companyName||entities.join('、')||'—',
      start,end,
      yearEnd:yearEnd?periodsAPI.fiscalEnd(yearEnd):'',
      periods:book.financialPeriods||data.financialPeriods,
      sources,sourcesProvided,sourceBook,
      version:wp.reportVersion||'V1.0'};
  }
  function updateCoverage(){
    reportError.textContent=periodOptions.length?'':'当前项目暂无可选财务报表期间';
    periodSelect.setAttribute('aria-invalid','false');
    const button=document.getElementById('btnExportRiskReport');
    button.disabled=button.hasAttribute('aria-busy');
  }
  function refreshProjectInfo(){
    if(!reportForm||!periodsAPI)return;
    const previousKey=periodStorageKey,previous=periodSelect.value;
    reportContext=readReportContext();
    const c=reportContext;
    document.getElementById('riskReportAuditedEntity').textContent=c.auditedEntity;
    document.getElementById('riskReportDataPeriod').textContent=periodsAPI.validDate(c.start)&&periodsAPI.validDate(c.end)?periodsAPI.format(c.start)+' - '+periodsAPI.format(c.end):'暂无已提供的数据期间';
    document.getElementById('riskReportVersion').textContent=c.version;
    periodStorageKey='auditCompass.riskReportFinancialPeriod.v2:'+JSON.stringify([c.project.code,c.project.name,c.start,c.end,c.yearEnd]);
    periodOptions=c.yearEnd||Array.isArray(c.periods)?periodsAPI.options({start:c.start,end:c.end,yearEnd:c.yearEnd,periods:c.periods}):[];
    periodSelect.replaceChildren(new Option(periodOptions.length?'请选择财务报表期间':'暂无可选财务报表期间',''),...periodOptions.map(row=>new Option(row.label,row.value)));
    periodSelect.disabled=false;
    let saved='';try{saved=localStorage.getItem(periodStorageKey)||'';}catch(error){}
    const desired=previousKey===periodStorageKey?previous:saved;
    periodSelect.value=periodOptions.some(row=>row.value===desired)?desired:'';
    updateCoverage();
    const names=['被审计单位主档','银行账号主档','资金交易明细','关联方主档','客户主档','供应商主档','员工主档','银行余额主档'];
    const body=document.getElementById('riskReportDataSources');body.replaceChildren();
    const colors={'已上传':'uploaded','部分缺失':'partial','未上传':'missing'};
    names.forEach(name=>{
      const source=c.sources.find(row=>row.name===name)||{};
      const tr=document.createElement('tr');
      const status=source.status||(Number(source.missingCount)>0?'部分缺失':Number(source.recordCount)>0?'已上传':'未提供状态');
      [name,status,source.updatedAt||'—'].forEach((value,index)=>{
        const td=document.createElement('td');td.textContent=value;
        if(index===1)td.className='wp-report-source-status '+(colors[value]||'unknown');
        tr.append(td);
      });body.append(tr);
    });
    if(!c.sourcesProvided&&!c.sources.length&&window.ReportDataSources){
      window.ReportDataSources.load(c.sourceBook).then(rows=>{
        if(rows.length&&reportContext.sourceBook===c.sourceBook)refreshProjectInfo();
      });
    }
  }
  if(reportForm&&periodsAPI){
    refreshProjectInfo();
    periodSelect.addEventListener('change',()=>{
      updateCoverage();
      try{localStorage.setItem(periodStorageKey,periodSelect.value);}catch(error){}
    });
    reportForm.addEventListener('submit',async event=>{
      event.preventDefault();
      const selected=periodOptions.find(row=>row.value===periodSelect.value);
      if(!selected){
        const message=periodOptions.length?'请先选择财务报表期间，再生成综合分析报告':'当前项目暂无可选财务报表期间，请先补充项目期间数据';
        reportError.textContent=message;periodSelect.setAttribute('aria-invalid','true');
        periodSelect.scrollIntoView({block:'center',behavior:'smooth'});
        periodSelect.focus({preventScroll:true});showToast(message);
        return;
      }
      if(!reportForm.reportValidity())return;
      const request={project:reportContext.project,period:{start:selected.start,end:selected.end},fiscalYearEnd:reportContext.yearEnd};
      const button=document.getElementById('btnExportRiskReport'),label=button.querySelector('span');
      if(button.disabled)return;
      button.disabled=true;button.setAttribute('aria-busy','true');label.textContent='正在生成综合分析报告…';
      try{
        if(typeof window.RiskReportExporter?.export==='function'){
          await window.RiskReportExporter.export(request);showToast('报告已生成');
        }else{
          window.dispatchEvent(new CustomEvent('risk-report:export',{detail:request}));
          showToast('演示导出：'+selected.label);
        }
      }catch(error){showToast('报告导出失败，请重试');}
      finally{button.removeAttribute('aria-busy');label.textContent='生成综合分析报告';updateCoverage();}
    });
    tabs.forEach(tab=>tab.addEventListener('click',refreshProjectInfo));
    window.addEventListener('focus',refreshProjectInfo);
    window.addEventListener('project-data-updated',refreshProjectInfo);
    window.addEventListener('storage',event=>{if(['auditCompass.currentWorkbook','auditCompass.projectWorkbooks'].includes(event.key)||event.key?.startsWith(window.ReportDataSources?.prefix||'auditCompass.reportDataSources:'))refreshProjectInfo();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshProjectInfo();});
    window.RiskReportExportSettings={get project(){return reportContext.project;},get period(){const row=periodOptions.find(item=>item.value===periodSelect.value);return row?{start:row.start,end:row.end}:null;},refresh:refreshProjectInfo};
  }
  if(materiality){
    const saved=localStorage.getItem(materialityKey)||'';
    materiality.value=saved?Number(saved).toLocaleString('zh-CN'):'';
    materiality.addEventListener('focus',()=>{materiality.value=materiality.value.replace(/,/g,'');});
    materiality.addEventListener('blur',()=>{
      const raw=materiality.value.replace(/,/g,'').trim();
      const value=Number(raw);
      if(!raw||!Number.isFinite(value)||value<0){
        if(!raw)localStorage.removeItem(materialityKey);
        materiality.value='';
        return;
      }
      localStorage.setItem(materialityKey,String(value));
      materiality.value=value.toLocaleString('zh-CN');
    });
    window.WorkingpaperExportSettings={get materiality(){return Number(localStorage.getItem(materialityKey)||0);}};
  }
})();
