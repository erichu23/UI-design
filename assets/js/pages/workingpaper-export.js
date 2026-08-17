(()=>{
  const toast=document.getElementById('wpExportToast');
  const materiality=document.getElementById('workingpaperMateriality');
  const materialityKey='auditCompass.workingpaperMateriality';
  let timer=0;
  const tabs=Array.from(document.querySelectorAll('[data-export-tab]'));
  const panes=Array.from(document.querySelectorAll('[data-export-pane]'));
  const tabbar=document.getElementById('workingpaperExportTabs');
  const inkbar=document.getElementById('workingpaperExportInkbar');
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
  activateTab('risk-report');

  const routineStateKey='auditCompass.specialTransactionRoutineState';
  const formatRoutineCriteria=filters=>{
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
    rows.forEach(row=>{
      const id=String(row.cells[1]?.textContent||'').trim().replace(/^i-/,'');
      const routine=routines.get(id);
      if(!routine)return;
      if(routine.filters?.length){
        row.cells[2].textContent=formatRoutineCriteria(routine.filters);
        row.cells[2].classList.add('wp-synced-criteria');
        row.cells[2].title='参数与特殊交易识别保持一致，本页只读';
      }
    });
  };
  window.requestAnimationFrame(syncRoutineParameters);
  document.getElementById('directTestSwitch')?.addEventListener('change',()=>window.requestAnimationFrame(syncRoutineParameters));
  window.addEventListener('storage',event=>{if(event.key===routineStateKey)syncRoutineParameters();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncRoutineParameters();});

  const showToast=message=>{
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
  };
  const reportState={scope:'all',yearExpanded:false};
  const reportData={
    scopes:{
      all:{label:'全量交易口径',note:'当前包含被审计单位之间的集团内往来；集团内关系依据被审计单位主档识别。',counterparties:300,abnormal:63,abnormalShare:21,categories:[['客户',108,36],['供应商',102,34],['其他',36,12],['个人',54,18]],concentration:{top5:{customer:[54,58,62],supplier:[49,52,55]},top10:{customer:[66,70,74],supplier:[60,64,67]},top20:{customer:[78.4,81.2,86],supplier:[74.1,76.5,79]}}},
      external:{label:'外部交易口径',note:'当前已剔除被审计单位之间的全部资金及票据往来；百分比以外部交易金额或外部对手方数量为分母。',counterparties:264,abnormal:52,abnormalShare:19.7,categories:[['客户',102,38.6],['供应商',93,35.2],['其他',27,10.2],['个人',42,15.9]],concentration:{top5:{customer:[51,54,58],supplier:[46,49,51]},top10:{customer:[62,66,70],supplier:[57,60,63]},top20:{customer:[74,78,82],supplier:[69,72,75]}}}
    },
    matrix:{
      '2023':{amount:421600,count:2864,ratio:15.2,entities:24,values:[[0,48,31,22],[36,0,18,27],[25,14,0,33],[19,24,29,0]]},
      '2024':{amount:486900,count:3198,ratio:16.8,entities:26,values:[[0,55,38,29],[44,0,23,31],[32,19,0,41],[24,28,36,0]]},
      '2025':{amount:557600,count:3562,ratio:17.4,entities:28,values:[[0,68,45,34],[52,0,29,38],[41,24,0,51],[29,35,44,0]]},
      all:{amount:1466100,count:9624,ratio:16.5,entities:28,values:[[0,171,114,85],[132,0,70,96],[98,57,0,125],[72,87,109,0]]}
    },
    matrixEntities:['华东制造','上海星河','深圳启明','广州远航'],
    reasons:[['同期交易量偏离20%以上',61,100,27800],['大额低频交易',13,21,138600],['大额非关联方交易',20,33,84700],['资金票流不匹配',95,100,199400],['经营时间短于1年',58,86,27600],['社保人数少于50人',12,18,139800],['实收资本与注册资本不一致',19,29,85300]],
    counterparties:[
      ['华辰智能装备有限公司','客户','客户兼供应商',84200,106500,138800,'收支重合、金额快速上升','32.4%','连续三年'],
      ['锦汇贸易有限公司','供应商','关联方收支重合',73500,88200,96700,'资金票流不匹配','28.7%','连续三年'],
      ['上海沐景科技有限公司','客户','—',28600,49200,81500,'大额低频、期末集中','24.5%','风险上升'],
      ['张明远（个人）','个人','个人收支重合',19200,31800,59600,'个人经营性交易','21.8%','连续两年'],
      ['鸿达投资管理有限公司','其他','—',0,26400,52100,'主档信息不一致','19.6%','本期新增'],
      ['远洋国际贸易有限公司','供应商','客户兼供应商',44500,38600,48700,'沉寂后重新交易','17.9%','历史复发']
    ]
  };
  const amountMarkup=value=>`<span data-audit-amount-k="${value}">${Number(value).toLocaleString('zh-CN')}</span>`;
  const refreshAmountUnits=root=>window.AuditUnit?.scan?.(root||document);
  const metricUnit=()=>window.AuditUnit?.unit||localStorage.getItem('auditCompass.amountUnit')||'m';
  const metricUnitShort=()=>({yuan:'元',k:'K',w:'W',m:'M',b:'B'})[metricUnit()]||'M';
  const metricAmountValue=value=>{
    const converted=window.AuditUnit?.convert?window.AuditUnit.convert(value,'k'):Number(value)*1000/({yuan:1,k:1000,w:10000,m:1000000,b:100000000}[metricUnit()]||1000000);
    const decimals=Math.max(1,window.AuditUnit?.decimals??Number(localStorage.getItem('auditCompass.amountDecimals')||0));
    return Number(converted).toLocaleString('zh-CN',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
  };
  const syncMetricAmounts=()=>{
    document.querySelectorAll('.risk-report-metric-amount-value[data-report-amount-k]').forEach(element=>{element.textContent=metricAmountValue(element.dataset.reportAmountK);});
    document.querySelectorAll('.risk-report-metric-amount-unit').forEach(element=>{element.textContent=metricUnitShort();});
  };
  const decorateMetricAmounts=()=>{
    document.querySelectorAll('.risk-report-metric-row em[data-audit-amount-k]').forEach(element=>{
      const value=element.dataset.auditAmountK;
      const primary=element.previousElementSibling?.matches('strong')?element.previousElementSibling:null;
      if(!primary)return;
      primary.classList.add('has-inline-amount');
      primary.insertAdjacentHTML('beforeend',`<span class="risk-report-metric-divider">/</span><b class="risk-report-metric-amount-value" data-report-amount-k="${value}" data-audit-unit-ignore>${metricAmountValue(value)}</b><i class="risk-report-metric-amount-unit">${metricUnitShort()}</i>`);
      element.remove();
    });
    syncMetricAmounts();
  };
  const syncReportScope=scope=>{
    reportState.scope=scope;
    const current=reportData.scopes[scope];
    document.querySelectorAll('[data-report-scope]').forEach(button=>button.classList.toggle('is-active',button.dataset.reportScope===scope));
    document.querySelectorAll('[data-report-version]').forEach(button=>button.classList.toggle('is-active',button.dataset.reportVersion===scope));
    const note=document.getElementById('riskReportScopeNote');
    if(note)note.querySelector('span').textContent=current.note;
    const label=document.getElementById('riskReportScopeLabel');
    if(label)label.textContent=current.label;
    const exportVersion=document.getElementById('riskReportExportVersion');
    if(exportVersion)exportVersion.textContent=scope==='all'?'全量交易版':'外部交易版（剔除集团内往来）';
    renderConcentration();
    renderCategories();
    renderAbnormalOverview();
  };
  const renderMatrix=()=>{
    const host=document.getElementById('riskReportYearMatrices');
    if(!host)return;
    host.innerHTML=['2023','2024','2025'].map(year=>{
      const data=reportData.matrix[year];
      const head=reportData.matrixEntities.map((name,index)=>`<th title="${name}">${String.fromCharCode(65+index)}</th>`).join('');
      const body=reportData.matrixEntities.map((name,row)=>`<tr><th title="${name}">${String.fromCharCode(65+row)}</th>${data.values[row].map(value=>value?`<td style="background:rgba(67,115,178,${Math.min(.08+value/650,.28).toFixed(2)})" title="金额 ${value} 百万元；${Math.round(value*5.8)}笔"><span>${value}</span><em>${Math.round(value*5.8)}笔</em></td>`:'<td class="is-empty">—</td>').join('')}</tr>`).join('');
      return `<article class="risk-report-year-matrix-card"><div class="risk-report-year-matrix-head"><strong>${year}年</strong><span>${amountMarkup(data.amount)} · ${data.count.toLocaleString('zh-CN')}笔 · 占比${data.ratio}%</span></div><table class="risk-report-mini-matrix"><thead><tr><th>流出\流入</th>${head}</tr></thead><tbody>${body}</tbody></table><div class="risk-report-matrix-key">${reportData.matrixEntities.map((name,index)=>`<span><i>${String.fromCharCode(65+index)}</i><b>${name}</b></span>`).join('')}</div></article>`;
    }).join('');
    refreshAmountUnits(host);
  };
  const renderConcentration=()=>{
    const values=reportData.scopes[reportState.scope].concentration;
    const chart=document.getElementById('riskReportConcentrationChart');
    if(!chart)return;
    chart.innerHTML=`<table class="risk-report-concentration-years"><thead><tr><th rowspan="2">范围</th><th colspan="3">客户</th><th colspan="3">供应商</th></tr><tr><th>2023</th><th>2024</th><th>2025</th><th>2023</th><th>2024</th><th>2025</th></tr></thead><tbody>${[['前5大',values.top5],['前10大',values.top10],['前20大',values.top20]].map(([label,item])=>`<tr><th>${label}</th>${item.customer.map(value=>`<td>${value}%</td>`).join('')}${item.supplier.map(value=>`<td>${value}%</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  };
  const metricYearValueMarkup=value=>{
    const match=String(value).match(/^(.*?\/\s*)([\d,]+(?:\.\d+)?)$/);
    if(!match)return value;
    const amount=Number(match[2].replace(/,/g,''));
    return `${match[1]}<u class="risk-report-metric-amount-value" data-report-amount-k="${amount}" data-audit-unit-ignore>${metricAmountValue(amount)}</u><em class="risk-report-metric-amount-unit">${metricUnitShort()}</em>`;
  };
  const decorateMetricYears=()=>{
    document.querySelectorAll('.risk-report-metric-row small').forEach(element=>{
      if(element.classList.contains('risk-metric-years'))return;
      const parts=element.textContent.split('·').map(item=>item.trim()).filter(Boolean);
      if(parts.length!==3)return;
      const values=parts.map(part=>{const match=part.match(/^(2023|2024|2025)\s+(.+)$/);return match?{year:match[1],value:match[2]}:null;});
      if(values.some(value=>!value))return;
      const hasAmount=Boolean(element.parentElement?.querySelector('strong.has-inline-amount'));
      element.classList.add('risk-metric-years');
      if(hasAmount)element.classList.add('risk-metric-years-with-amount');
      element.innerHTML=values.map(value=>`<span class="${value.year==='2025'?'is-current':''}"><i>${value.year}</i><b>${hasAmount?metricYearValueMarkup(value.value):value.value}</b></span>`).join('');
    });
    syncMetricAmounts();
  };
  const renderCategories=()=>{
    const grid=document.getElementById('riskReportCategoryGrid');
    if(!grid)return;
    grid.innerHTML=reportData.scopes[reportState.scope].categories.map(([name,count,share])=>`<div class="risk-category-item"><i class="risk-category-ring" style="--value:${share}"></i><div><span>${name}</span><strong>${count}个 · ${share}%</strong></div></div>`).join('');
  };
  const renderCounterpartyTable=()=>{
    const head=document.getElementById('riskReportCounterpartyHead');
    const rows=document.getElementById('riskReportCounterpartyRows');
    const wrap=document.querySelector('#riskReportCounterpartyTable')?.closest('.risk-report-table-wrap');
    wrap?.classList.toggle('is-year-expanded',reportState.yearExpanded);
    if(head){
      const yearHeads=reportState.yearExpanded?['2023','2024','2025'].map(year=>`<th class="risk-report-year-head">${year}</th>`).join(''):'';
      const yearSubs=reportState.yearExpanded?'<th class="num">交易金额</th><th class="num">交易金额</th><th class="num">交易金额</th>':'';
      head.innerHTML=`<tr class="risk-report-year-group-head"><th rowspan="2">No.</th><th rowspan="2">对手方名称</th><th rowspan="2">对手方类型</th><th rowspan="2">收支重合关系</th><th class="risk-report-group-toggle-cell"><button type="button" class="risk-report-group-toggle" id="riskReportYearToggle" aria-expanded="${reportState.yearExpanded}"><span>合计</span><i aria-hidden="true">${reportState.yearExpanded?'«':'»'}</i></button></th>${yearHeads}<th rowspan="2">主要异常线索</th><th rowspan="2" class="num">异常交易占比</th><th rowspan="2">跨期状态</th><th rowspan="2">操作</th></tr><tr class="risk-report-year-sub-head"><th class="num">交易金额</th>${yearSubs}</tr>`;
    }
    if(rows){
      rows.innerHTML=reportData.counterparties.map((row,index)=>{
        const total=[row[3],row[4],row[5]].reduce((sum,value)=>sum+(Number(value)||0),0);
        const yearCells=reportState.yearExpanded?`<td class="is-num risk-report-year-cell">${amountMarkup(row[3])}</td><td class="is-num risk-report-year-cell">${amountMarkup(row[4])}</td><td class="is-num risk-report-year-cell">${amountMarkup(row[5])}</td>`:'';
        return `<tr><td>${index+1}</td><td>${row[0]}</td><td class="${row[1]==='客户'?'is-customer':row[1]==='供应商'?'is-supplier':''}">${row[1]}</td><td>${row[2]}</td><td class="is-num risk-report-total-cell">${amountMarkup(total)}</td>${yearCells}<td class="risk-status">${row[6]}</td><td class="is-num">${row[7]}</td><td>${row[8]}</td><td><button class="risk-report-detail-link" type="button">查看明细</button></td></tr>`;
      }).join('');
    }
    refreshAmountUnits(document.getElementById('riskReportCounterpartyTable'));
  };
  const renderAbnormalOverview=()=>{
    const scope=reportData.scopes[reportState.scope];
    const share=document.querySelector('.risk-report-abnormal-share');
    if(share){share.querySelector('.risk-report-ring').style.setProperty('--ring-value',scope.abnormalShare);share.querySelector('.risk-report-ring span').textContent=`${scope.abnormalShare}%`;share.querySelector('strong').textContent=`${scope.abnormal}个异常对手方`;share.querySelector('.risk-report-abnormal-share>div:last-child>span').textContent=`占三年累计分析范围${scope.counterparties}个`;}
    const bars=document.getElementById('riskReportReasonBars');
    if(bars)bars.innerHTML=reportData.reasons.map(([name,count,width,amount])=>`<div class="risk-reason-item"><strong>${count}个</strong><span>${name}</span><em>${amountMarkup(amount)}</em><div class="risk-reason-track"><i style="width:${width}%"></i></div></div>`).join('');
    renderCounterpartyTable();
    refreshAmountUnits(document.getElementById('riskReportCounterpartyBlock'));
  };
  document.getElementById('riskReportScopeSwitch')?.addEventListener('click',event=>{const button=event.target.closest('[data-report-scope]');if(button)syncReportScope(button.dataset.reportScope);});
  document.querySelector('.risk-report-version-grid')?.addEventListener('click',event=>{const button=event.target.closest('[data-report-version]');if(button)syncReportScope(button.dataset.reportVersion);});
  document.getElementById('riskReportCounterpartyTable')?.addEventListener('click',event=>{
    if(!event.target.closest('#riskReportYearToggle'))return;
    event.stopPropagation();
    reportState.yearExpanded=!reportState.yearExpanded;
    renderCounterpartyTable();
  });
  document.getElementById('riskReportCounterpartyRows')?.addEventListener('click',event=>{if(event.target.closest('.risk-report-detail-link'))showToast('已打开该对手方的三年交易明细');});
  ['btnPreviewRiskReport','btnPreviewRiskReportBottom'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>showToast(`正在生成${reportData.scopes[reportState.scope].label}报告预览`)));
  ['btnExportRiskReport','btnExportRiskReportBottom'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>showToast(`${reportData.scopes[reportState.scope].label}风险评估报告已进入导出队列`)));
  decorateMetricAmounts();
  window.addEventListener('audit-unit-ready',syncMetricAmounts);
  renderMatrix();
  decorateMetricYears();
  syncReportScope('all');
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
