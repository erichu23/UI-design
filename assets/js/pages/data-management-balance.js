(()=>{
  const table=document.getElementById('tblAccountSummary');
  const head=table?.tHead;
  const body=document.getElementById('accountSummaryBody');
  const pager=document.getElementById('pagination-account');
  const wrap=table?.closest('.account-summary-table-wrap');
  if(!table||!head||!body||!pager||!wrap)return;

  const years=[2023,2024,2025];
  const months=Array.from({length:12},(_,index)=>index+1);
  const rows=[
    ['华东制造集团有限公司','1001***0821','工行上海分行',140680,128640,269320,4280,57,3],
    ['上海星河科技有限公司','1002***4186','建行上海分行',112430,103260,215690,3650,46,3],
    ['深圳启明电子有限公司','2001***7739','招行上海分行',96540,88420,184960,3220,38,3],
    ['广州远航贸易有限公司','3001***6290','平安深圳分行',126870,116340,243210,4050,52,3],
    ['苏州精密制造有限公司','3002***9052','中行深圳分行',102960,94480,197440,3440,41,3],
    ['华南物流服务有限公司','4001***1578','广发广州分行',82670,75960,158630,2870,35,3],
    ['昆明启明商贸有限公司','5001***6426','农行苏州分行',73420,67430,140850,2520,31,3],
    ['天津远泽汽车零部件有限公司','6001***3385','浦发广州分行',54689,50781,105470,2271,28,3]
  ];
  const scopeFactor=index=>(.82+(index%4)*.025);
  const scopeExcluded=(value,index)=>Math.round(value*scopeFactor(index));
  const yearWeights=[.28,.33,.39];
  const format=value=>Number(value).toLocaleString('zh-CN');
  const ratio=(value,total)=>`${(total?value/total*100:0).toFixed(2)}%`;
  const statusClass=(row,year,month)=>{
    const seed=month+row*3+(year-2023)*2;
    if(seed%11===0)return 'chk-err';
    if(seed%7===0)return 'chk-warn';
    if(seed%13===0)return 'chk-none';
    return 'chk-ok';
  };
  const yearSeparator='<span class="col-sep"></span>';
  const monthNumbers=years.map(year=>months.map(month=>`<span class="month-num col-year-${year}">${month}</span>`).join('')).join(yearSeparator);
  const statusDots=rowIndex=>years.map(year=>months.map(month=>`<i class="chk-dot ${statusClass(rowIndex,year,month)} col-year-${year}" title="${year}-${String(month).padStart(2,'0')}"></i>`).join('')).join(yearSeparator);
  const miniBars=rowIndex=>{
    const inflow=[72,58,84,65,91,77,69,88,74,96,82,90];
    const outflow=[54,68,61,79,63,72,86,67,81,70,92,76];
    return `<div class="monthly-flow-bars" aria-label="月度流入流出分布">${inflow.map((value,month)=>`<span class="monthly-flow-pair" title="${month+1}月"><i class="flow-in-bar" style="height:${Math.min(98,value+rowIndex*2)}%"></i><i class="flow-out-bar" style="height:${Math.min(98,outflow[month]+rowIndex)}%"></i></span>`).join('')}</div>`;
  };
  const state={page:1,pageSize:20,yearExpanded:false,scopeView:'included'};
  const scopedRows=()=>rows.map((row,index)=>{
    const excluded=state.scopeView==='excluded';
    const inflow=excluded?scopeExcluded(row[3],index):row[3];
    const outflow=excluded?scopeExcluded(row[4],index):row[4];
    return {
      source:row,index,inflow,outflow,total:inflow+outflow,
      txCount:excluded?scopeExcluded(row[6],index):row[6],
      cpCount:excluded?Math.max(1,scopeExcluded(row[7],index)):row[7],
      fileCount:row[8]
    };
  });
  const summarize=viewRows=>{
    const result=viewRows.reduce((sum,row)=>({
      inflow:sum.inflow+row.inflow,
      outflow:sum.outflow+row.outflow,
      total:sum.total+row.total,
      txCount:sum.txCount+row.txCount
    }),{inflow:0,outflow:0,total:0,txCount:0});
    result.cpCount=state.scopeView==='excluded'?88:100;
    result.fileCount=8;
    return result;
  };
  const syncAccountColumns=()=>{
    let colgroup=table.querySelector('colgroup');
    if(!colgroup){
      colgroup=document.createElement('colgroup');
      table.insertBefore(colgroup,table.firstChild);
    }
    const totals='<col class="account-amount-col"><col class="account-amount-col"><col class="account-total-col"><col class="account-ratio-col"><col class="account-count-col"><col class="account-counterparty-col"><col class="account-file-col">';
    const annual='<col class="account-amount-col"><col class="account-amount-col"><col class="account-total-col">';
    colgroup.innerHTML='<col class="account-company-col"><col class="account-number-col"><col class="account-bank-col"><col class="account-monthly-col">'+
      totals+(state.yearExpanded?annual.repeat(years.length):'')+
      '<col class="account-action-col"><col class="account-flex-col">';
  };
  const splitYears=value=>{
    const first=Math.round(value*yearWeights[0]);
    const second=Math.round(value*yearWeights[1]);
    return [first,second,value-first-second];
  };
  const yearCells=row=>{
    if(!state.yearExpanded)return '';
    const inflow=splitYears(row.inflow);
    const outflow=splitYears(row.outflow);
    return years.map((year,index)=>`<td class="account-year-metric flow-in is-num">${format(inflow[index])}</td><td class="account-year-metric flow-out is-num">${format(outflow[index])}</td><td class="account-year-metric is-num"><b>${format(inflow[index]+outflow[index])}</b></td>`).join('');
  };
  const renderHead=()=>{
    const icon=state.yearExpanded?'«':'»';
    const scopeActive=state.scopeView==='excluded';
    const yearHeads=state.yearExpanded?years.map(year=>`<th colspan="3" class="account-year-head no-sort">${window.auditFiscalYearLabel?.(year)||year}</th>`).join(''):'';
    const yearSubs=state.yearExpanded?years.map(()=>'<th class="account-year-metric no-sort no-filter">流入金额</th><th class="account-year-metric no-sort no-filter">流出金额</th><th class="account-year-metric no-sort no-filter">交易总额</th>').join(''):'';
    head.innerHTML=`<tr class="account-year-group-head"><th rowspan="2" class="no-filter">被审计单位公司</th><th rowspan="2" class="no-filter">本方账号</th><th rowspan="2" class="no-filter">银行名称</th><th rowspan="2" class="monthly-flow-head no-sort">月度流入/流出</th><th colspan="7" class="account-group-toggle-cell no-sort"><div class="account-group-head-controls"><button class="account-scope-inline-toggle ${scopeActive?'is-active':''}" id="validationAccountScopeInlineToggle" type="button" title="${scopeActive?'恢复包含被审计单位之间往来':'剔除被审计单位之间往来'}" aria-pressed="${scopeActive}"><i aria-hidden="true"></i><span>剔除被审计单位间往来</span></button><span class="account-group-head-divider" aria-hidden="true"></span><button class="account-group-toggle" id="validationAccountYearToggle" type="button" title="展开或收起年度金额"><span>合计</span><i>${icon}</i></button></div></th>${yearHeads}<th rowspan="2" class="no-sort account-action-sticky">操作</th><th rowspan="2" class="check-col no-sort"><div class="check-head"><button class="arrow-btn" id="btnToggleCheck" data-local-bound="1" type="button" title="展开或收起三年校验月份"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M6.2 3.5l5 4.5-5 4.5V3.5z"></path></svg></button><span>校验情况</span><span class="check-nav" aria-label="切换校验月份"><button class="check-nav-btn" id="checkScrollPrev" type="button" title="向前查看月份">‹</button><button class="check-nav-btn" id="checkScrollNext" type="button" title="向后查看月份">›</button></span></div><div class="check-window check-window-head"><div class="y-labels">${years.map(year=>`<span class="y y-${year}">${year}</span>`).join(yearSeparator)}</div></div></th></tr><tr class="account-year-sub-head"><th class="no-filter">流入金额</th><th class="no-filter">流出金额</th><th class="no-filter">交易总额</th><th class="no-filter">交易总额占比</th><th class="no-filter">交易笔数</th><th class="no-filter">对手方数量</th><th class="no-filter">流水文件</th>${yearSubs}</tr>`;
    document.getElementById('validationAccountScopeInlineToggle')?.addEventListener('click',()=>{
      state.scopeView=state.scopeView==='excluded'?'included':'excluded';
      state.page=1;
      render();
    });
    document.getElementById('validationAccountYearToggle')?.addEventListener('click',()=>{
      state.yearExpanded=!state.yearExpanded;
      render();
    });
  };
  const bindCheckControls=()=>{
    const scope=document.getElementById('checkScope');
    const toggle=document.getElementById('btnToggleCheck');
    const windows=Array.from(table.querySelectorAll('.check-window'));
    if(!scope||!toggle)return;
    toggle.classList.toggle('expanded',scope.classList.contains('expanded'));
    toggle.addEventListener('click',()=>{
      const expanded=scope.classList.toggle('expanded');
      toggle.classList.toggle('expanded',expanded);
    });
    let syncing=false;
    windows.forEach(current=>{
      current.addEventListener('scroll',()=>{
        if(syncing)return;
        syncing=true;
        windows.forEach(other=>{if(other!==current)other.scrollLeft=current.scrollLeft;});
        requestAnimationFrame(()=>{syncing=false;});
      },{passive:true});
      current.addEventListener('wheel',event=>{
        if(!scope.classList.contains('expanded')||Math.abs(event.deltaX)<2)return;
        const max=Math.max(0,current.scrollWidth-current.clientWidth);
        if(!max)return;
        const next=Math.max(0,Math.min(max,current.scrollLeft+event.deltaX));
        if(next===current.scrollLeft)return;
        event.preventDefault();
        current.scrollLeft=next;
      },{passive:false});
    });
    const move=distance=>windows.forEach(current=>current.scrollBy({left:distance,behavior:'smooth'}));
    document.getElementById('checkScrollPrev')?.addEventListener('click',()=>move(-240));
    document.getElementById('checkScrollNext')?.addEventListener('click',()=>move(240));
  };
  const render=()=>{
    const viewRows=scopedRows();
    const totals=summarize(viewRows);
    const pages=Math.max(1,Math.ceil(viewRows.length/state.pageSize));
    state.page=Math.max(1,Math.min(state.page,pages));
    const start=(state.page-1)*state.pageSize;
    const visible=viewRows.slice(start,start+state.pageSize);
    syncAccountColumns();
    renderHead();
    wrap.classList.toggle('is-year-expanded',state.yearExpanded);
    const totalYearCells=yearCells(totals);
    body.innerHTML=`<tr class="sum-row"><td><strong>合计</strong></td><td></td><td></td><td></td><td class="flow-in is-num"><strong>${format(totals.inflow)}</strong></td><td class="flow-out is-num"><strong>${format(totals.outflow)}</strong></td><td class="is-num"><strong>${format(totals.total)}</strong></td><td class="is-num"><strong>100.00%</strong></td><td class="is-num"><strong>${format(totals.txCount)}</strong></td><td class="is-num"><strong>${totals.cpCount}</strong></td><td class="is-num"><strong>${totals.fileCount}</strong></td>${totalYearCells}<td class="account-action-sticky"></td><td class="check-col"><div class="check-window"><div class="months-grid">${monthNumbers}</div></div></td></tr>${visible.map(row=>{const source=row.source;return `<tr><td>${source[0]}</td><td>${source[1]}</td><td>${source[2]}</td><td class="monthly-flow-cell">${miniBars(row.index)}</td><td class="flow-in is-num">${format(row.inflow)}</td><td class="flow-out is-num">${format(row.outflow)}</td><td class="is-num"><b>${format(row.total)}</b></td><td class="is-num">${ratio(row.total,totals.total)}</td><td class="is-num">${format(row.txCount)}</td><td class="is-num">${row.cpCount}</td><td class="is-num">${row.fileCount}</td>${yearCells(row)}<td class="actions account-action-sticky"><button class="dm-account-action-btn" type="button" title="查看账号详情" aria-label="查看账号详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.6"></circle></svg></button><button class="dm-account-action-btn" type="button" title="查看文件详情" aria-label="查看文件详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6Z"></path><path d="M14 3.5v4h4M9 12h6M9 16h6"></path></svg></button></td><td class="check-col"><div class="check-window"><div class="months-grid check-row">${statusDots(row.index)}</div></div></td></tr>`;}).join('')}`;
    window.renderAuditPager?.(pager,{total:viewRows.length,page:state.page,pageSize:state.pageSize,onPage:page=>{state.page=page;render();},onPageSize:size=>{state.pageSize=size;state.page=1;render();}});
    delete table.dataset.baEnhanced;
    table.querySelectorAll('.ba-th-tools').forEach(tool=>tool.remove());
    bindCheckControls();
    window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));
  };
  render();
})();
