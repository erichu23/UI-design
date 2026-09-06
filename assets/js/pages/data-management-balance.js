(()=>{
  const table=document.getElementById('tblAccountSummary');
  const head=table?.tHead;
  const body=document.getElementById('accountSummaryBody');
  const pager=document.getElementById('pagination-account');
  const wrap=table?.closest('.account-summary-table-wrap');
  if(!table||!head||!body||!pager||!wrap)return;
  // 与资金流水分析存在同名表格 ID；提前声明所有权，避免 shared.js 再次重绘并覆盖校验交互。
  table.dataset.accountSummaryOwner='data-management';
  table.dataset.accountPagerReady='1';

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
  const statusClass=(row,year,month)=>{
    const seed=month+row*3+(year-2023)*2;
    if(seed%11===0)return 'chk-err';
    if(seed%7===0)return 'chk-warn';
    if(seed%13===0)return 'chk-none';
    return 'chk-ok';
  };
  const yearSeparator='<span class="col-sep"></span>';
  const monthNumbers=years.map(year=>months.map(month=>`<span class="month-num col-year-${year}">${month}</span>`).join('')).join(yearSeparator);
  const checkDecisions=new Map();
  const escapeText=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const statusDots=(rowIndex,source)=>years.map(year=>months.map(month=>{
    const status=statusClass(rowIndex,year,month);
    const actionable=status==='chk-warn'||status==='chk-err';
    const kind=status==='chk-warn'?'warning':'error';
    const key=`${source[1]}-${year}-${month}-${kind}`;
    const decision=checkDecisions.get(key);
    const label=status==='chk-warn'?'当日余额不连续':status==='chk-err'?'余额错误':status==='chk-none'?'无流水数据':'检验无误';
    if(!actionable)return `<i class="chk-dot ${status} col-year-${year}" title="${year}-${String(month).padStart(2,'0')} · ${label}"></i>`;
    return `<button type="button" class="chk-dot ${status} dm-check-status-trigger col-year-${year}${decision?' is-processed':''}" data-no-drag data-check-kind="${kind}" data-check-key="${key}" data-company="${escapeText(source[0])}" data-account="${escapeText(source[1])}" data-bank="${escapeText(source[2])}" data-year="${year}" data-month="${month}" title="${year}-${String(month).padStart(2,'0')} · ${label}${decision?' · 已处理':''}" aria-label="查看${label}详情" onpointerdown="event.stopPropagation()" onclick="return window.openDmBalanceCheckDrawer(this,event)"></button>`;
  }).join('')).join(yearSeparator);
  let selectedFlowYear=2025;
  const miniBars=row=>{
    const yearIndex=Math.max(0,years.indexOf(selectedFlowYear));
    const yearWeight=[.28,.33,.39][yearIndex];
    const inPattern=[.073,.061,.079,.068,.087,.075,.071,.083,.077,.091,.082,.096];
    const outPattern=[.066,.074,.063,.081,.067,.076,.085,.069,.083,.072,.087,.077];
    const profileShift=(row.index%5-2)*.0015;
    const inWeights=inPattern.map((weight,month)=>Math.max(.025,weight+(month%3-1)*profileShift));
    const outWeights=outPattern.map((weight,month)=>Math.max(.025,weight-(month%3-1)*profileShift));
    const inWeightTotal=inWeights.reduce((sum,value)=>sum+value,0);
    const outWeightTotal=outWeights.reduce((sum,value)=>sum+value,0);
    const inflow=inWeights.map(weight=>Math.round(row.inflow*yearWeight*weight/inWeightTotal));
    const outflow=outWeights.map(weight=>Math.round(row.outflow*yearWeight*weight/outWeightTotal));
    const maxValue=Math.max(1,...inflow,...outflow);
    return `<div class="monthly-flow-bars" aria-label="${selectedFlowYear}年月度流入流出分布">${inflow.map((value,month)=>`<span class="monthly-flow-pair" data-flow-year="${selectedFlowYear}" data-flow-month="${month+1}" data-flow-in="${value}" data-flow-out="${outflow[month]}" data-flow-account="${escapeText(row.source[1])}" aria-label="${selectedFlowYear}年${month+1}月，流入${format(value)}，流出${format(outflow[month])}"><i class="flow-in-bar" style="height:${Math.max(3,value/maxValue*100)}%"></i><i class="flow-out-bar" style="height:${Math.max(3,outflow[month]/maxValue*100)}%"></i></span>`).join('')}</div>`;
  };
  const metricOptions=[
    {key:'inflow',label:'流入金额',group:'inflow',groupLabel:'流入',symbol:'¥',annual:true},
    {key:'inflowRatio',label:'流入金额占比',group:'inflow',groupLabel:'流入',symbol:'%',annual:true,defaultHidden:true},
    {key:'inflowTxCount',label:'流入笔数',group:'inflow',groupLabel:'流入',symbol:'#',annual:true,defaultHidden:true},
    {key:'outflow',label:'流出金额',group:'outflow',groupLabel:'流出',symbol:'¥',annual:true},
    {key:'outflowRatio',label:'流出金额占比',group:'outflow',groupLabel:'流出',symbol:'%',annual:true,defaultHidden:true},
    {key:'outflowTxCount',label:'流出笔数',group:'outflow',groupLabel:'流出',symbol:'#',annual:true,defaultHidden:true},
    {key:'total',label:'交易总额',group:'total',groupLabel:'交易总额',symbol:'¥',annual:true},
    {key:'totalRatio',label:'交易总额占比',group:'total',groupLabel:'交易总额',symbol:'%',annual:true,defaultHidden:true},
    {key:'txCount',label:'交易笔数',group:'total',groupLabel:'交易总额',symbol:'#',annual:true,defaultHidden:true},
    {key:'cpCount',label:'对手方数量',group:'counterparty',groupLabel:'对手方数量',symbol:'#',defaultHidden:true},
    {key:'fileCount',label:'文件数量',group:'file',groupLabel:'文件数量',symbol:'#',defaultHidden:true}
  ];
  const state={
    page:1,
    pageSize:20,
    yearExpanded:true,
    scopeView:'included',
    visibleMetrics:new Set(metricOptions.filter(item=>!item.defaultHidden).map(item=>item.key))
  };
  const scopedRows=()=>rows.map((row,index)=>{
    const excluded=state.scopeView==='excluded';
    const inflow=excluded?scopeExcluded(row[3],index):row[3];
    const outflow=excluded?scopeExcluded(row[4],index):row[4];
    const txCount=excluded?scopeExcluded(row[6],index):row[6];
    const inflowTxCount=Math.round(txCount*inflow/(inflow+outflow));
    return {
      source:row,index,inflow,outflow,total:inflow+outflow,
      txCount,inflowTxCount,outflowTxCount:txCount-inflowTxCount,
      cpCount:excluded?Math.max(1,scopeExcluded(row[7],index)):row[7],
      fileCount:row[8]
    };
  });
  const summarize=viewRows=>{
    const result=viewRows.reduce((sum,row)=>({
      inflow:sum.inflow+row.inflow,
      outflow:sum.outflow+row.outflow,
      total:sum.total+row.total,
      txCount:sum.txCount+row.txCount,
      inflowTxCount:sum.inflowTxCount+row.inflowTxCount,
      outflowTxCount:sum.outflowTxCount+row.outflowTxCount
    }),{inflow:0,outflow:0,total:0,txCount:0,inflowTxCount:0,outflowTxCount:0});
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
    const visibleOptions=metricOptions.filter(item=>state.visibleMetrics.has(item.key));
    const annualOptions=visibleOptions.filter(item=>item.annual);
    table.style.setProperty('--account-metric-width','72px');
    table.style.setProperty('--account-count-width','78px');
    const metricCols=options=>options.map(item=>`<col class="account-metric-compact-col${item.annual?'':' account-count-label-col'}">`).join('');
    colgroup.innerHTML='<col class="account-company-col"><col class="account-number-col"><col class="account-bank-col"><col class="account-monthly-col">'+
      metricCols(visibleOptions)+(state.yearExpanded?years.map(()=>metricCols(annualOptions)).join(''):'')+
      '<col class="account-action-col"><col class="account-flex-col">';
  };
  const splitYears=value=>{
    const first=Math.round(value*yearWeights[0]);
    const second=Math.round(value*yearWeights[1]);
    return [first,second,value-first-second];
  };
  const formatRatio=(value,total,isTotal=false)=>isTotal?'100.00':(total?value/total*100:0).toFixed(2);
  const yearCells=(row,isTotal,totals)=>{
    if(!state.yearExpanded)return '';
    const inflow=splitYears(row.inflow);
    const outflow=splitYears(row.outflow);
    const inflowTxCount=splitYears(row.inflowTxCount);
    const outflowTxCount=splitYears(row.outflowTxCount);
    const txCount=splitYears(row.txCount);
    const totalInflow=splitYears(totals.inflow);
    const totalOutflow=splitYears(totals.outflow);
    const annualOptions=metricOptions.filter(item=>item.annual&&state.visibleMetrics.has(item.key));
    return years.map((year,index)=>annualOptions.map(item=>{
      const totalValue=inflow[index]+outflow[index];
      const allTotalValue=totalInflow[index]+totalOutflow[index];
      if(item.key==='inflow')return `<td class="account-year-metric flow-in is-num">${format(inflow[index])}</td>`;
      if(item.key==='inflowRatio')return `<td class="account-year-metric is-num" data-audit-unit-ignore>${formatRatio(inflow[index],totalInflow[index],isTotal)}</td>`;
      if(item.key==='inflowTxCount')return `<td class="account-year-metric is-num" data-audit-unit-ignore>${format(inflowTxCount[index])}</td>`;
      if(item.key==='outflow')return `<td class="account-year-metric flow-out is-num">${format(outflow[index])}</td>`;
      if(item.key==='outflowRatio')return `<td class="account-year-metric is-num" data-audit-unit-ignore>${formatRatio(outflow[index],totalOutflow[index],isTotal)}</td>`;
      if(item.key==='outflowTxCount')return `<td class="account-year-metric is-num" data-audit-unit-ignore>${format(outflowTxCount[index])}</td>`;
      if(item.key==='total')return `<td class="account-year-metric is-num"><b>${format(totalValue)}</b></td>`;
      if(item.key==='totalRatio')return `<td class="account-year-metric is-num" data-audit-unit-ignore>${formatRatio(totalValue,allTotalValue,isTotal)}</td>`;
      return `<td class="account-year-metric is-num" data-audit-unit-ignore>${format(txCount[index])}</td>`;
    }).join('')).join('');
  };
  const renderHead=()=>{
    const icon=state.yearExpanded?'«':'»';
    const visibleOptions=metricOptions.filter(item=>state.visibleMetrics.has(item.key));
    const annualOptions=visibleOptions.filter(item=>item.annual);
    const groupHeads=options=>{
      const groups=[];
      options.forEach(item=>{
        const current=groups[groups.length-1];
        if(current?.key===item.group)current.count+=1;
        else groups.push({key:item.group,label:item.groupLabel,count:1});
      });
      return groups.map(group=>`<th colspan="${group.count}" class="account-metric-direction no-sort no-filter">${group.label}</th>`).join('');
    };
    const metricSymbols=options=>options.map(item=>`<th class="account-metric-symbol no-filter${item.annual?'':' account-count-metric'}" data-account-metric="${item.key}" title="${item.label}"><span>${item.symbol}</span></th>`).join('');
    const yearHeads=state.yearExpanded&&annualOptions.length?years.map(year=>`<th colspan="${annualOptions.length}" class="account-year-head no-sort">${window.auditFiscalYearLabel?.(year)||year}</th>`).join(''):'';
    const totalDirections=groupHeads(visibleOptions);
    const yearDirections=state.yearExpanded?years.map(()=>groupHeads(annualOptions)).join(''):'';
    const totalSymbols=metricSymbols(visibleOptions);
    const yearSymbols=state.yearExpanded?years.map(()=>metricSymbols(annualOptions)).join(''):'';
    const monthlyFlowTitle=window.auditMonthlyFlowExpandButton?.()||'<span class="monthly-flow-head-label"><span>月度流入/流出</span><button class="monthly-flow-expand-btn" type="button" data-monthly-flow-expand aria-label="放大查看月度流入流出" title="放大查看月度流入流出"><span class="monthly-flow-expand-icon" aria-hidden="true"></span></button></span>';
    head.innerHTML=`<tr class="account-year-group-head"><th rowspan="3" class="no-filter dm-account-fixed-col dm-account-fixed-1">被审计单位公司</th><th rowspan="3" class="no-filter dm-account-fixed-col dm-account-fixed-2">本方账号</th><th rowspan="3" class="no-filter dm-account-fixed-col dm-account-fixed-3">银行名称</th><th rowspan="3" class="monthly-flow-head no-sort dm-account-fixed-col dm-account-fixed-4">${monthlyFlowTitle}</th><th colspan="${visibleOptions.length}" class="account-group-toggle-cell no-sort"><div class="account-group-head-controls"><button class="account-group-toggle" id="validationAccountYearToggle" type="button" title="展开或收起年度数据"><span>合计</span><i>${icon}</i></button></div></th>${yearHeads}<th rowspan="3" class="no-sort account-action-sticky">操作</th><th rowspan="3" class="check-col no-sort"><div class="check-head"><button class="arrow-btn" id="btnToggleCheck" data-local-bound="1" type="button" title="展开或收起三年校验月份"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M6.2 3.5l5 4.5-5 4.5V3.5z"></path></svg></button><span>校验情况</span><span class="check-nav" aria-label="切换校验月份"><button class="check-nav-btn" id="checkScrollPrev" type="button" title="向前查看月份">‹</button><button class="check-nav-btn" id="checkScrollNext" type="button" title="向后查看月份">›</button></span></div><div class="check-window check-window-head"><div class="y-labels">${years.map(year=>`<span class="y y-${year}">${year}</span>`).join(yearSeparator)}</div></div></th></tr><tr class="account-direction-head">${totalDirections}${yearDirections}</tr><tr class="account-metric-symbol-head">${totalSymbols}${yearSymbols}</tr>`;
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
  const getCheckDrawerHostDocument=()=>{
    try{
      if(window.parent&&window.parent!==window&&window.parent.document?.body)return window.parent.document;
    }catch(error){}
    return document;
  };
  const setCheckDrawerOpen=(mask,open)=>{
    const hostDocument=mask?.ownerDocument||document;
    if(!open&&typeof mask?._dmCleanup==='function'){
      mask._dmCleanup();
      mask._dmCleanup=null;
    }
    mask.hidden=!open;
    if(open){mask.removeAttribute('hidden');mask.style.display='block';}
    else{mask.setAttribute('hidden','');mask.style.display='none';}
    document.body.classList.toggle('dm-check-drawer-open',open);
    if(hostDocument.body!==document.body)hostDocument.body.classList.toggle('dm-check-drawer-open',open);
  };
  const ensureCheckDrawer=()=>{
    const hostDocument=getCheckDrawerHostDocument();
    let mask=hostDocument.getElementById('dmBalanceCheckDrawerMask');
    if(mask)return mask;
    if(hostDocument!==document&&!hostDocument.getElementById('dm-check-drawer-host-style')){
      const styleLink=hostDocument.createElement('link');
      styleLink.id='dm-check-drawer-host-style';
      styleLink.rel='stylesheet';
      styleLink.href='./assets/css/pages/data-management.css?v=20260828-account-actions3';
      hostDocument.head.appendChild(styleLink);
    }
    mask=document.createElement('div');
    mask.id='dmBalanceCheckDrawerMask';
    mask.className='dm-balance-check-mask';
    mask.hidden=true;
    mask.innerHTML=`<aside class="dm-balance-check-drawer" role="dialog" aria-modal="true" aria-labelledby="dmBalanceCheckTitle">
      <header class="dm-balance-check-head"><div><b id="dmBalanceCheckTitle">校验详情</b><span id="dmBalanceCheckSubtitle"></span></div><button type="button" data-check-close aria-label="关闭">×</button></header>
      <div class="dm-balance-check-body" id="dmBalanceCheckBody"></div>
      <footer class="dm-balance-check-actions" id="dmBalanceCheckActions"></footer>
    </aside>`;
    hostDocument.body.appendChild(mask);
    const close=()=>{
      setCheckDrawerOpen(mask,false);
    };
    mask.addEventListener('click',event=>{if(event.target===mask||event.target.closest('[data-check-close]'))close();});
    hostDocument.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mask.hidden)close();});
    return mask;
  };
  const drawerPager=total=>`<div class="dm-check-mini-pager"><span>共 ${total} 条</span><button type="button" disabled>‹</button><button type="button" class="is-current">1</button><button type="button" disabled>›</button><span>20 条/页</span></div>`;
  const setDrawerMode=(mask,mode='check')=>{
    const drawer=mask.querySelector('.dm-balance-check-drawer');
    drawer.classList.toggle('is-account-detail',mode==='account');
    drawer.classList.toggle('is-flow-detail',mode==='flow');
  };
  const drawerNodes=mask=>({
    body:mask.querySelector('#dmBalanceCheckBody'),
    actions:mask.querySelector('#dmBalanceCheckActions'),
    title:mask.querySelector('#dmBalanceCheckTitle'),
    subtitle:mask.querySelector('#dmBalanceCheckSubtitle')
  });
  const accountSeed=account=>Array.from(String(account||'')).reduce((sum,char)=>sum+char.charCodeAt(0),0);
  const getActionRowData=trigger=>{
    const row=trigger.closest('tr');
    const cells=row?.cells||[];
    return {
      company:trigger.dataset.company||cells[0]?.textContent?.replace(/[└　]/g,'').trim()||'华东制造集团有限公司',
      account:trigger.dataset.account||cells[1]?.textContent?.trim()||'1001***0821',
      bank:trigger.dataset.bank||cells[2]?.textContent?.trim()||'工行上海分行',
      inflow:Number(trigger.dataset.inflow)||Number(cells[4]?.textContent?.replace(/[^\d.-]/g,''))||140680,
      outflow:Number(trigger.dataset.outflow)||Number(cells[5]?.textContent?.replace(/[^\d.-]/g,''))||128640,
      txCount:Number(trigger.dataset.txCount)||Number(cells[8]?.textContent?.replace(/[^\d.-]/g,''))||4280
    };
  };
  const buildAccountDetailData=(source,year)=>{
    const seed=accountSeed(source.account)+year;
    const weights=[.07,.055,.08,.06,.09,.065,.075,.085,.07,.09,.08,.08];
    const outWeights=[.065,.078,.05,.082,.06,.073,.09,.055,.088,.064,.087,.058];
    const yearFactor=year===2023?.82:year===2024?.91:1;
    const inflow=weights.map((weight,index)=>Math.round(source.inflow*yearFactor*weight*(.92+((seed+index*7)%17)/100)));
    const outflow=outWeights.map((weight,index)=>Math.round(source.outflow*yearFactor*weight*(.91+((seed+index*5)%19)/100)));
    const weekday=['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
    const bubbles=[];
    for(let day=1;day<=31;day+=1){
      if((day+seed)%3===0)bubbles.push([day,(day+seed)%7,800+((day*seed)%9200),'in']);
      if((day+seed)%4===0)bubbles.push([day,(day+seed+2)%7,700+((day*(seed+13))%10800),'out']);
    }
    return {inflow,outflow,bubbles,weekday};
  };
  const openAccountDetailDrawer=trigger=>{
    const source=getActionRowData(trigger);
    const mask=ensureCheckDrawer();
    if(typeof mask._dmCleanup==='function')mask._dmCleanup();
    setDrawerMode(mask,'account');
    const {body,actions,title,subtitle}=drawerNodes(mask);
    let selectedYear=2025;
    title.textContent=`账号详情：${source.account}`;
    subtitle.textContent=`${source.company} · ${source.bank}`;
    const total=source.inflow+source.outflow;
    body.innerHTML=`<div class="dm-account-detail">
      <section class="dm-account-detail-section"><h3>收支统计</h3><div class="dm-account-detail-kpis">
        <div><span>流入金额</span><b class="flow-in">${format(source.inflow)}</b></div><div><span>流出金额</span><b class="flow-out">${format(source.outflow)}</b></div><div><span>交易总额</span><b>${format(total)}</b></div><div><span>交易笔数</span><b>${format(source.txCount)}</b></div><div><span>流入流出差额</span><b>${format(source.inflow-source.outflow)}</b></div>
      </div></section>
      <section class="dm-account-detail-section"><div class="dm-account-detail-section-head"><h3>月度汇总</h3><label>年度<select data-account-detail-year><option>2023</option><option>2024</option><option selected>2025</option></select></label></div><div class="dm-account-chart" data-account-month-chart style="width:100%;height:250px"></div></section>
      <section class="dm-account-detail-section"><h3>交易日期分析</h3><div class="dm-account-chart is-bubble" data-account-bubble-chart style="width:100%;height:245px"></div></section>
    </div>`;
    actions.innerHTML='<button type="button" class="btn" data-check-close>关闭</button>';
    actions.querySelector('[data-check-close]').onclick=()=>setCheckDrawerOpen(mask,false);
    const monthElement=body.querySelector('[data-account-month-chart]');
    const bubbleElement=body.querySelector('[data-account-bubble-chart]');
    const monthChartSvg=data=>{
      const width=760,height=244,left=50,right=18,top=28,bottom=36;
      const plotWidth=width-left-right,plotHeight=height-top-bottom;
      const max=Math.max(1,...data.inflow,...data.outflow)*1.12;
      const groupWidth=plotWidth/12,barWidth=Math.min(13,groupWidth*.24);
      const lines=[0,.25,.5,.75,1].map(rate=>{const y=top+plotHeight*(1-rate);return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"/><text x="${left-8}" y="${y+3}" text-anchor="end">${format(Math.round(max*rate))}</text>`;}).join('');
      const bars=months.map((month,index)=>{const center=left+groupWidth*(index+.5);const inHeight=data.inflow[index]/max*plotHeight;const outHeight=data.outflow[index]/max*plotHeight;return `<g><rect class="is-in" x="${center-barWidth-1}" y="${top+plotHeight-inHeight}" width="${barWidth}" height="${Math.max(1,inHeight)}" rx="2"><title>${selectedYear}年${String(month).padStart(2,'0')}月 流入 ${format(data.inflow[index])}</title></rect><rect class="is-out" x="${center+1}" y="${top+plotHeight-outHeight}" width="${barWidth}" height="${Math.max(1,outHeight)}" rx="2"><title>${selectedYear}年${String(month).padStart(2,'0')}月 流出 ${format(data.outflow[index])}</title></rect><text class="month" x="${center}" y="${height-15}" text-anchor="middle">${String(month).padStart(2,'0')}月</text></g>`;}).join('');
      return `<svg class="dm-account-native-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${selectedYear}年月度流入流出图"><g class="grid">${lines}</g>${bars}<g class="legend"><circle class="is-in" cx="${width-138}" cy="12" r="4"/><text x="${width-129}" y="15">流入</text><circle class="is-out" cx="${width-78}" cy="12" r="4"/><text x="${width-69}" y="15">流出</text></g></svg>`;
    };
    const bubbleChartSvg=data=>{
      const width=760,height=238,left=58,right=18,top=26,bottom=28;
      const plotWidth=width-left-right,plotHeight=height-top-bottom;
      const vertical=Array.from({length:7},(_,index)=>{const y=top+plotHeight*(index/6);return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"/><text x="${left-8}" y="${y+3}" text-anchor="end">${data.weekday[index]}</text>`;}).join('');
      const ticks=[1,5,10,15,20,25,30].map(day=>{const x=left+(day-1)/30*plotWidth;return `<line x1="${x}" y1="${top}" x2="${x}" y2="${top+plotHeight}"/><text x="${x}" y="${height-9}" text-anchor="middle">${day}</text>`;}).join('');
      const points=data.bubbles.map(item=>{const x=left+(item[0]-1)/30*plotWidth;const y=top+item[1]/6*plotHeight;const radius=Math.max(3,Math.min(12,Math.sqrt(item[2])*.1));return `<circle class="${item[3]==='in'?'is-in':'is-out'}" cx="${x}" cy="${y}" r="${radius}"><title>${selectedYear}年${item[0]}日 ${item[3]==='in'?'流入':'流出'} ${format(item[2])}</title></circle>`;}).join('');
      return `<svg class="dm-account-native-chart is-bubble" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${selectedYear}年交易日期分析"><g class="grid">${vertical}${ticks}</g>${points}<g class="legend"><circle class="is-in" cx="${width-138}" cy="12" r="4"/><text x="${width-129}" y="15">流入</text><circle class="is-out" cx="${width-78}" cy="12" r="4"/><text x="${width-69}" y="15">流出</text></g></svg>`;
    };
    const updateCharts=()=>{
      const data=buildAccountDetailData(source,selectedYear);
      monthElement.innerHTML=monthChartSvg(data);
      bubbleElement.innerHTML=bubbleChartSvg(data);
    };
    body.querySelector('[data-account-detail-year]').addEventListener('change',event=>{selectedYear=Number(event.target.value)||2025;updateCharts();});
    mask._dmCleanup=()=>{};
    setCheckDrawerOpen(mask,true);
    requestAnimationFrame(updateCharts);
  };
  const openMissingFlowDrawer=trigger=>{
    const source=getActionRowData(trigger);
    const mask=ensureCheckDrawer();
    if(typeof mask._dmCleanup==='function')mask._dmCleanup();
    setDrawerMode(mask,'flow');
    const {body,actions,title,subtitle}=drawerNodes(mask);
    title.textContent='流水明细';
    subtitle.textContent=`${source.company} · ${source.account}`;
    const seed=accountSeed(source.account);
    const detailRows=[
      [`2025-04-${String(10+seed%8).padStart(2,'0')} 09:18:26`,'锦汇贸易有限公司','货款结算','流出',5600],
      [`2025-07-${String(12+seed%6).padStart(2,'0')} 14:36:08`,'上海星河科技有限公司','项目回款','流入',8200],
      [`2025-11-${String(8+seed%9).padStart(2,'0')} 16:42:51`,'华南物流服务有限公司','运输服务费','流出',3400]
    ];
    body.innerHTML=`<div class="dm-flow-detail-toolbar"><button type="button" class="btn" data-open-flow-search>在流水查询中查看</button><button type="button" class="btn primary" data-generate-flow>生成流水</button></div><a class="dm-flow-detail-company" href="javascript:void(0)">${escapeText(source.company)}</a><div class="dm-check-table-wrap"><table class="table dm-check-detail-table dm-flow-detail-table"><thead><tr><th>交易日期时间</th><th>对方名称 / 摘要</th><th>交易类型</th><th>金额</th></tr></thead><tbody>${detailRows.map(row=>`<tr><td>${row[0]}</td><td><b>${row[1]}</b><small>${row[2]}</small></td><td>${row[3]}</td><td class="is-num ${row[3]==='流入'?'flow-in':'flow-out'}">${format(row[4])}</td></tr>`).join('')}</tbody></table></div>${drawerPager(detailRows.length)}`;
    actions.innerHTML='<button type="button" class="btn" data-check-close>关闭</button>';
    actions.querySelector('[data-check-close]').onclick=()=>setCheckDrawerOpen(mask,false);
    body.querySelector('[data-generate-flow]').onclick=event=>{event.currentTarget.textContent='已生成';event.currentTarget.disabled=true;};
    body.querySelector('[data-open-flow-search]').onclick=()=>{setCheckDrawerOpen(mask,false);window.parent?.postMessage?.({type:'audit:navigate',target:'bank-flow-query'},'*');};
    setCheckDrawerOpen(mask,true);
  };
  let actionTooltip=null;
  let filePopover=null;
  const closeActionTooltip=()=>{if(actionTooltip)actionTooltip.hidden=true;};
  const ensureActionTooltip=()=>{
    if(actionTooltip)return actionTooltip;
    actionTooltip=document.createElement('div');actionTooltip.className='dm-action-tooltip';actionTooltip.hidden=true;document.body.appendChild(actionTooltip);return actionTooltip;
  };
  const positionFloating=(floating,trigger,side='top')=>{
    const rect=trigger.getBoundingClientRect();
    const width=floating.offsetWidth;const height=floating.offsetHeight;
    if(side==='left'){
      floating.style.left=`${Math.max(8,rect.left-width-10)}px`;
      floating.style.top=`${Math.min(window.innerHeight-height-8,Math.max(8,rect.top+(rect.height-height)/2))}px`;
      return;
    }
    floating.style.left=`${Math.min(window.innerWidth-width-8,Math.max(8,rect.left+(rect.width-width)/2))}px`;
    floating.style.top=`${Math.max(8,rect.top-height-8)}px`;
  };
  const showActionTooltip=trigger=>{
    const tooltip=ensureActionTooltip();tooltip.textContent=trigger.dataset.actionTooltip||'';tooltip.hidden=false;positionFloating(tooltip,trigger);
  };
  const closeFilePopover=()=>{if(filePopover)filePopover.hidden=true;};
  const openFilePopover=trigger=>{
    closeActionTooltip();
    if(!filePopover){filePopover=document.createElement('div');filePopover.className='dm-file-popover';filePopover.hidden=true;document.body.appendChild(filePopover);}
    const source=getActionRowData(trigger);
    const filename=`${source.company.replace(/有限公司|集团/g,'')}_${source.account.replace(/\*/g,'')}_资金流水.xlsx`;
    filePopover.innerHTML=`<div><span>文件名称</span><b>${escapeText(filename)}</b></div><div><span>上传人</span><b>Ken</b></div><button type="button" data-download-file aria-label="下载 ${escapeText(filename)}" title="下载"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"></path></svg></button>`;
    filePopover.hidden=false;positionFloating(filePopover,trigger,'left');
    filePopover.querySelector('[data-download-file]').onclick=()=>{
      const url=URL.createObjectURL(new Blob([`文件名称,上传人\n${filename},Ken\n`],{type:'text/csv;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download=filename.replace(/\.xlsx$/,'.csv');link.click();URL.revokeObjectURL(url);closeFilePopover();
    };
  };
  const openCheckDrawer=trigger=>{
    const mask=ensureCheckDrawer();
    setDrawerMode(mask,'check');
    const kind=trigger.dataset.checkKind;
    const company=trigger.dataset.company;
    const account=trigger.dataset.account;
    const bank=trigger.dataset.bank;
    const year=Number(trigger.dataset.year);
    const month=Number(trigger.dataset.month);
    const key=trigger.dataset.checkKey;
    const body=mask.querySelector('#dmBalanceCheckBody');
    const actions=mask.querySelector('#dmBalanceCheckActions');
    const title=mask.querySelector('#dmBalanceCheckTitle');
    const subtitle=mask.querySelector('#dmBalanceCheckSubtitle');
    const date=`${year}-${String(month).padStart(2,'0')}-${String(6+(month*3)%22).padStart(2,'0')}`;
    const existing=checkDecisions.get(key)||{};
    if(kind==='warning'){
      title.textContent='资金流水打标';
      subtitle.textContent='按交易日期设置当日首笔与末笔，作为余额连续性复核依据';
      const baseDay=6+(month*3)%16;
      const dateGroups=[baseDay,baseDay+5,baseDay+10].map(day=>`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
      const savedGroups=Array.isArray(existing.groups)?existing.groups:[];
      const groupHtml=dateGroups.map((groupDate,groupIndex)=>{
        const saved=savedGroups[groupIndex]||{};
        const amounts=[25000+groupIndex*4200,10000+groupIndex*2800,10000+groupIndex*1600];
        const openingBalance=18000+groupIndex*12500;
        return `<section class="dm-check-date-group${groupIndex===0?' is-expanded':''}" data-date-group="${groupIndex}">
          <button type="button" class="dm-check-date-toggle" data-date-toggle aria-expanded="${groupIndex===0?'true':'false'}"><i aria-hidden="true">${groupIndex===0?'−':'+'}</i><span>交易日期：<b>${groupDate}</b></span><span>共 ${amounts.length} 笔</span><small>${account} · ${company}</small></button>
          <div class="dm-check-date-panel" ${groupIndex===0?'':'hidden'}>
            <div class="dm-check-table-wrap"><table class="table dm-check-detail-table"><thead><tr><th>交易时间</th><th>对方账号</th><th>对方名称</th><th>流出金额</th><th>流入金额</th><th>交易后余额</th><th>当日首笔</th><th>当日末笔</th></tr></thead><tbody>${amounts.map((amount,index)=>`<tr><td>${String(7+index*3).padStart(2,'0')}:${String(5+groupIndex*7).padStart(2,'0')}:${String(12+index*9).padStart(2,'0')}</td><td>3301********${5136+groupIndex*117}</td><td>${index===2?'华南物流服务有限公司':index===1?'上海星河科技有限公司':'锦汇贸易有限公司'}</td><td class="flow-out is-num">${index===1?format(3600+groupIndex*900):'0'}</td><td class="flow-in is-num">${index===1?'0':format(amount)}</td><td class="is-num">${format(openingBalance+amounts.slice(0,index+1).reduce((sum,value)=>sum+value,0)-(index>0?3600+groupIndex*900:0))}</td><td><input type="radio" name="dm-day-first-${groupIndex}" value="${index}" ${String(saved.first??0)===String(index)?'checked':''}></td><td><input type="radio" name="dm-day-last-${groupIndex}" value="${index}" ${String(saved.last??2)===String(index)?'checked':''}></td></tr>`).join('')}</tbody></table></div>
            ${drawerPager(amounts.length)}
          </div>
        </section>`;
      }).join('');
      body.innerHTML=`<div class="dm-check-context"><span>银行账号 <b>${account}</b></span><span>本方名称 <b>${company}</b></span><span>开户行 <b>${bank}</b></span><span>待打标日期 <b>${dateGroups.length} 个</b></span></div><div class="dm-check-date-list">${groupHtml}</div>`;
      actions.innerHTML='<button type="button" class="btn" data-check-reset>重置</button><button type="button" class="btn primary" data-check-save>保存打标</button>';
      body.querySelectorAll('[data-date-toggle]').forEach(button=>button.addEventListener('click',()=>{
        const group=button.closest('[data-date-group]');
        const panel=group.querySelector('.dm-check-date-panel');
        const expanded=group.classList.toggle('is-expanded');
        panel.hidden=!expanded;
        button.setAttribute('aria-expanded',String(expanded));
        button.querySelector('i').textContent=expanded?'−':'+';
      }));
      actions.querySelector('[data-check-reset]').onclick=()=>{
        body.querySelectorAll('[data-date-group]').forEach(group=>{
          const groupIndex=group.dataset.dateGroup;
          const first=group.querySelector(`input[name="dm-day-first-${groupIndex}"][value="0"]`);
          const last=group.querySelector(`input[name="dm-day-last-${groupIndex}"][value="2"]`);
          if(first)first.checked=true;
          if(last)last.checked=true;
        });
      };
      actions.querySelector('[data-check-save]').onclick=()=>{
        const groups=Array.from(body.querySelectorAll('[data-date-group]')).map(group=>{
          const groupIndex=group.dataset.dateGroup;
          return {
            date:dateGroups[Number(groupIndex)],
            first:group.querySelector(`input[name="dm-day-first-${groupIndex}"]:checked`)?.value,
            last:group.querySelector(`input[name="dm-day-last-${groupIndex}"]:checked`)?.value
          };
        });
        checkDecisions.set(key,{type:'marked',groups});
        trigger.classList.add('is-processed');trigger.title=trigger.title.replace(/ · 已处理$/,'')+' · 已处理';
        setCheckDrawerOpen(mask,false);
      };
    }else{
      title.textContent='余额不连续详情';
      subtitle.textContent=`${company} · ${account}`;
      const baseErrorDay=6+(month*3)%13;
      const errorRows=Array.from({length:5},(_,index)=>{
        const currentDay=baseErrorDay+index*3;
        const nextDay=currentDay+1;
        const previous=index===0?0:12500+index*6800;
        const following=previous+18000+index*3500;
        return {id:`error-${index+1}`,start:`${year}-${String(month).padStart(2,'0')}-${String(currentDay).padStart(2,'0')}`,end:`${year}-${String(month).padStart(2,'0')}-${String(nextDay).padStart(2,'0')}`,previous,following,diff:Math.abs(following-previous)};
      });
      const ignoredRows=new Set(Array.isArray(existing.ignoredRows)?existing.ignoredRows:[]);
      body.innerHTML=`<div class="dm-check-context"><span>错误期间 <b>${errorRows[0].start} 至 ${errorRows[errorRows.length-1].end}</b></span><span>校验类型 <b class="dm-check-error-text">余额错误</b></span><span>错误记录 <b>${errorRows.length} 条</b></span></div>
        <div class="dm-check-batch-bar"><span>已选择 <b data-error-selected-count>0</b> 条</span><input class="dm-check-reason" data-error-reason value="${escapeText(existing.reason||'')}" placeholder="填写批量忽略原因"><button type="button" class="btn primary" data-check-ignore disabled>忽略错误</button></div>
        <div class="dm-check-table-wrap"><table class="table dm-check-detail-table"><thead><tr><th class="dm-check-select-col"><input type="checkbox" data-error-select-all aria-label="全选错误记录"></th><th>错误日期</th><th>前一笔交易后余额</th><th>后一笔交易前余额</th><th>差额（绝对值）</th><th>原始文件</th><th>处理状态</th></tr></thead><tbody>${errorRows.map(row=>{const ignored=ignoredRows.has(row.id);return `<tr class="${ignored?'is-ignored':''}"><td class="dm-check-select-col"><input type="checkbox" data-error-select value="${row.id}" ${ignored?'disabled':''} aria-label="选择 ${row.start} 的错误记录"></td><td>${row.start}<br>${row.end}</td><td class="is-num">${format(row.previous)}<br><span class="small">${row.start} 日末</span></td><td class="is-num flow-in">${format(row.following)}<br><span class="small">${row.end} 首笔前</span></td><td class="is-num flow-out">${format(row.diff)}</td><td><a href="javascript:void(0)" class="dm-check-file-link">查看文件</a></td><td>${ignored?'<span class="dm-check-ignored-state"><i>✓</i>已忽略</span>':'<span class="dm-check-pending-state">待处理</span>'}</td></tr>`;}).join('')}</tbody></table></div>${drawerPager(errorRows.length)}`;
      actions.innerHTML='<button type="button" class="btn" data-check-close>关闭</button>';
      actions.querySelector('[data-check-close]').onclick=()=>setCheckDrawerOpen(mask,false);
      const selectAll=body.querySelector('[data-error-select-all]');
      const rowChecks=Array.from(body.querySelectorAll('[data-error-select]'));
      const ignoreButton=body.querySelector('[data-check-ignore]');
      const selectedCount=body.querySelector('[data-error-selected-count]');
      const syncBatchSelection=()=>{
        const available=rowChecks.filter(input=>!input.disabled);
        const selected=available.filter(input=>input.checked);
        selectedCount.textContent=String(selected.length);
        ignoreButton.disabled=selected.length===0;
        selectAll.checked=available.length>0&&selected.length===available.length;
        selectAll.indeterminate=selected.length>0&&selected.length<available.length;
        selectAll.disabled=available.length===0;
      };
      selectAll.addEventListener('change',()=>{rowChecks.forEach(input=>{if(!input.disabled)input.checked=selectAll.checked;});syncBatchSelection();});
      rowChecks.forEach(input=>input.addEventListener('change',syncBatchSelection));
      ignoreButton.onclick=()=>{
        const selected=rowChecks.filter(input=>input.checked&&!input.disabled).map(input=>input.value);
        const reason=body.querySelector('[data-error-reason]')?.value.trim();
        if(!selected.length)return;
        if(!reason){body.querySelector('[data-error-reason]')?.focus();return;}
        checkDecisions.set(key,{type:'ignored',reason,ignoredRows:Array.from(new Set([...ignoredRows,...selected]))});
        trigger.classList.add('is-processed');trigger.title=trigger.title.replace(/ · 已处理$/,'')+' · 已处理';
        openCheckDrawer(trigger);
      };
      syncBatchSelection();
    }
    setCheckDrawerOpen(mask,true);
  };
  window.openDmBalanceCheckDrawer=(trigger,event)=>{
    if(!trigger||!body.contains(trigger))return false;
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }
    openCheckDrawer(trigger);
    return false;
  };
  document.addEventListener('pointerover',event=>{
    const trigger=event.target.closest('[data-action-tooltip]');
    if(!trigger||trigger.contains(event.relatedTarget))return;
    showActionTooltip(trigger);
  });
  document.addEventListener('pointerout',event=>{
    const trigger=event.target.closest('[data-action-tooltip]');
    if(!trigger||trigger.contains(event.relatedTarget))return;
    closeActionTooltip();
  });
  document.addEventListener('focusin',event=>{const trigger=event.target.closest('[data-action-tooltip]');if(trigger)showActionTooltip(trigger);});
  document.addEventListener('focusout',event=>{if(event.target.closest('[data-action-tooltip]'))closeActionTooltip();});
  document.addEventListener('click',event=>{
    const accountDetail=event.target.closest('[data-dm-action="account-detail"]');
    const fileDetail=event.target.closest('[data-dm-action="file-detail"]');
    const missingFlow=event.target.closest('[data-dm-action="missing-flow"], .dm-missing-file-action');
    if(accountDetail){event.preventDefault();event.stopPropagation();closeFilePopover();openAccountDetailDrawer(accountDetail);return;}
    if(fileDetail){event.preventDefault();event.stopPropagation();openFilePopover(fileDetail);return;}
    if(missingFlow){event.preventDefault();event.stopPropagation();closeFilePopover();openMissingFlowDrawer(missingFlow);return;}
    if(!event.target.closest('.dm-file-popover'))closeFilePopover();
  });
  document.querySelectorAll('.dm-missing-file-action').forEach(button=>{
    button.removeAttribute('title');
    button.dataset.dmAction='missing-flow';
    button.dataset.actionTooltip='流水明细';
    button.setAttribute('aria-label','流水明细');
  });
  window.addEventListener('scroll',()=>{closeActionTooltip();closeFilePopover();},{passive:true,capture:true});
  window.addEventListener('resize',()=>{closeActionTooltip();closeFilePopover();},{passive:true});
  let flowTooltip=null;
  let flowYearMenu=null;
  const ensureFlowTooltip=()=>{
    if(flowTooltip)return flowTooltip;
    flowTooltip=document.createElement('div');
    flowTooltip.className='dm-monthly-flow-tooltip';
    flowTooltip.hidden=true;
    document.body.appendChild(flowTooltip);
    return flowTooltip;
  };
  const positionFlowTooltip=event=>{
    if(!flowTooltip||flowTooltip.hidden)return;
    const gap=12;
    const width=flowTooltip.offsetWidth||176;
    const height=flowTooltip.offsetHeight||82;
    const left=Math.min(window.innerWidth-width-gap,Math.max(gap,event.clientX+12));
    const top=event.clientY+14+height>window.innerHeight?Math.max(gap,event.clientY-height-12):event.clientY+14;
    flowTooltip.style.left=`${left}px`;
    flowTooltip.style.top=`${top}px`;
  };
  wrap.addEventListener('pointerover',event=>{
    const pair=event.target.closest('.monthly-flow-pair');
    if(!pair)return;
    const pairs=[...(pair.parentElement?.querySelectorAll('.monthly-flow-pair')||[])];
    const year=Number(pair.dataset.flowYear)||selectedFlowYear;
    const month=Number(pair.dataset.flowMonth)||Math.max(1,pairs.indexOf(pair)+1);
    const inflow=Number(pair.dataset.flowIn);
    const outflow=Number(pair.dataset.flowOut);
    const account=pair.dataset.flowAccount||pair.closest('tr')?.querySelector('td:nth-child(2)')?.textContent?.trim()||'当前账户';
    const tooltip=ensureFlowTooltip();
    tooltip.innerHTML=`<b>${year}年${String(month).padStart(2,'0')}月</b><small>${account}</small><div><span><i class="is-in"></i>流入金额</span><strong class="is-in">${format(Number.isFinite(inflow)?inflow:0)}</strong></div><div><span><i class="is-out"></i>流出金额</span><strong class="is-out">${format(Number.isFinite(outflow)?outflow:0)}</strong></div>`;
    tooltip.hidden=false;
    positionFlowTooltip(event);
  });
  wrap.addEventListener('pointermove',event=>{if(event.target.closest('.monthly-flow-pair'))positionFlowTooltip(event);});
  wrap.addEventListener('pointerout',event=>{
    const pair=event.target.closest('.monthly-flow-pair');
    if(!pair||pair.contains(event.relatedTarget))return;
    if(flowTooltip)flowTooltip.hidden=true;
  });
  const closeFlowYearMenu=()=>{
    if(!flowYearMenu)return;
    flowYearMenu.hidden=true;
    table.querySelector('[data-flow-year-trigger]')?.setAttribute('aria-expanded','false');
  };
  const updateMonthlyFlowYear=()=>{
    const trigger=table.querySelector('[data-flow-year-trigger]');
    const label=trigger?.querySelector('span');
    if(label)label.textContent=`${selectedFlowYear}年`;
    const viewRows=scopedRows();
    const start=(state.page-1)*state.pageSize;
    const visibleRows=viewRows.slice(start,start+state.pageSize);
    const rowByAccount=new Map(visibleRows.map(row=>[row.source[1],row]));
    const renderedRows=Array.from(body.querySelectorAll('tr:not(.sum-row)'));
    renderedRows.forEach(rowElement=>{
      const flowCell=rowElement.querySelector('.monthly-flow-cell');
      const account=rowElement.cells[1]?.textContent?.trim();
      const row=rowByAccount.get(account);
      if(flowCell&&row)flowCell.innerHTML=miniBars(row);
    });
  };
  const openFlowYearMenu=button=>{
    if(!flowYearMenu){
      flowYearMenu=document.createElement('div');
      flowYearMenu.className='dm-flow-year-menu';
      flowYearMenu.hidden=true;
      document.body.appendChild(flowYearMenu);
      flowYearMenu.addEventListener('click',event=>{
        const option=event.target.closest('[data-flow-year-option]');
        if(!option)return;
        selectedFlowYear=Number(option.dataset.flowYearOption)||2025;
        if(flowTooltip)flowTooltip.hidden=true;
        closeFlowYearMenu();
        updateMonthlyFlowYear();
      });
    }
    const willOpen=flowYearMenu.hidden;
    closeFlowYearMenu();
    if(!willOpen)return;
    flowYearMenu.innerHTML=years.map(year=>`<button type="button" data-flow-year-option="${year}" class="${year===selectedFlowYear?'is-active':''}"><span>${year}年</span>${year===selectedFlowYear?'<i>✓</i>':''}</button>`).join('');
    flowYearMenu.hidden=false;
    button.setAttribute('aria-expanded','true');
    const rect=button.getBoundingClientRect();
    const menuWidth=104;
    flowYearMenu.style.left=`${Math.min(window.innerWidth-menuWidth-8,Math.max(8,rect.left+(rect.width-menuWidth)/2))}px`;
    flowYearMenu.style.top=`${Math.min(window.innerHeight-flowYearMenu.offsetHeight-8,rect.bottom+5)}px`;
  };
  table.addEventListener('click',event=>{
    const expandButton=event.target.closest('[data-monthly-flow-expand]');
    if(expandButton){event.preventDefault();event.stopPropagation();window.openAuditMonthlyFlowOverview?.(table);return;}
    const button=event.target.closest('[data-flow-year-trigger]');
    if(!button)return;
    event.preventDefault();event.stopPropagation();openFlowYearMenu(button);
  });
  document.addEventListener('click',event=>{
    if(flowYearMenu&&!flowYearMenu.hidden&&!event.target.closest('.dm-flow-year-menu')&&!event.target.closest('[data-flow-year-trigger]'))closeFlowYearMenu();
  });
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
    const metricCells=(row,isTotal=false)=>metricOptions.filter(item=>state.visibleMetrics.has(item.key)).map(item=>{
      const strong=value=>isTotal?`<strong>${value}</strong>`:value;
      if(item.key==='inflow')return `<td class="account-total-metric flow-in is-num">${strong(format(row.inflow))}</td>`;
      if(item.key==='inflowRatio')return `<td class="account-total-metric is-num" data-audit-unit-ignore>${strong(formatRatio(row.inflow,totals.inflow,isTotal))}</td>`;
      if(item.key==='inflowTxCount')return `<td class="account-total-metric is-num" data-audit-unit-ignore>${strong(format(row.inflowTxCount))}</td>`;
      if(item.key==='outflow')return `<td class="account-total-metric flow-out is-num">${strong(format(row.outflow))}</td>`;
      if(item.key==='outflowRatio')return `<td class="account-total-metric is-num" data-audit-unit-ignore>${strong(formatRatio(row.outflow,totals.outflow,isTotal))}</td>`;
      if(item.key==='outflowTxCount')return `<td class="account-total-metric is-num" data-audit-unit-ignore>${strong(format(row.outflowTxCount))}</td>`;
      if(item.key==='total')return `<td class="account-total-metric is-num"><b>${format(row.total)}</b></td>`;
      if(item.key==='totalRatio')return `<td class="account-total-metric is-num" data-audit-unit-ignore>${strong(formatRatio(row.total,totals.total,isTotal))}</td>`;
      if(item.key==='txCount')return `<td class="account-total-metric is-num" data-audit-unit-ignore>${strong(format(row.txCount))}</td>`;
      if(item.key==='cpCount')return `<td class="account-total-metric account-count-metric is-num" data-audit-unit-ignore>${strong(row.cpCount)}</td>`;
      return `<td class="account-total-metric account-count-metric is-num" data-audit-unit-ignore>${strong(row.fileCount)}</td>`;
    }).join('');
    const totalYearCells=yearCells(totals,true,totals);
    body.innerHTML=`<tr class="sum-row"><td class="dm-account-fixed-col dm-account-fixed-1"><strong>合计</strong></td><td class="dm-account-fixed-col dm-account-fixed-2"></td><td class="dm-account-fixed-col dm-account-fixed-3"></td><td class="monthly-flow-cell dm-account-fixed-col dm-account-fixed-4"></td>${metricCells(totals,true)}${totalYearCells}<td class="account-action-sticky"></td><td class="check-col"><div class="check-window"><div class="months-grid">${monthNumbers}</div></div></td></tr>${visible.map(row=>{const source=row.source;const actionData=`data-company="${escapeText(source[0])}" data-account="${escapeText(source[1])}" data-bank="${escapeText(source[2])}" data-inflow="${row.inflow}" data-outflow="${row.outflow}" data-tx-count="${row.txCount}"`;return `<tr><td class="dm-account-fixed-col dm-account-fixed-1">${source[0]}</td><td class="dm-account-fixed-col dm-account-fixed-2">${source[1]}</td><td class="dm-account-fixed-col dm-account-fixed-3">${source[2]}</td><td class="monthly-flow-cell dm-account-fixed-col dm-account-fixed-4">${miniBars(row)}</td>${metricCells(row)}${yearCells(row,false,totals)}<td class="actions account-action-sticky"><button class="dm-account-action-btn" type="button" data-dm-action="account-detail" data-action-tooltip="账号详情" ${actionData} aria-label="账号详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.6"></circle></svg></button><button class="dm-account-action-btn" type="button" data-dm-action="file-detail" data-action-tooltip="文件详情" ${actionData} aria-label="文件详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6Z"></path><path d="M14 3.5v4h4M9 12h6M9 16h6"></path></svg></button></td><td class="check-col"><div class="check-window"><div class="months-grid check-row">${statusDots(row.index,source)}</div></div></td></tr>`;}).join('')}`;
    document.querySelectorAll('#validationAccountScopeTabs [data-validation-account-scope]').forEach(button=>{
      const active=button.dataset.validationAccountScope===state.scopeView;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
    });
    window.renderAuditPager?.(pager,{total:viewRows.length,page:state.page,pageSize:state.pageSize,onPage:page=>{state.page=page;render();},onPageSize:size=>{state.pageSize=size;state.page=1;render();}});
    delete table.dataset.baEnhanced;
    table.querySelectorAll('.ba-th-tools').forEach(tool=>tool.remove());
    bindCheckControls();
    window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));
  };
  table._baOpenColumnChooser=anchor=>{
    document.querySelectorAll('.ba-table-filter-popover,.ba-column-popover').forEach(current=>{
      current._baCleanup?.();
      current.remove();
    });
    const pop=document.createElement('div');
    pop.className='ba-column-popover account-column-popover';
    pop.innerHTML=`<div class="ba-column-popover-title"><b>自定义表头</b><span>合计与年度同步</span></div><div class="ba-column-options">${metricOptions.map(item=>`<label><input type="checkbox" value="${item.key}" ${state.visibleMetrics.has(item.key)?'checked':''}><span>${item.label}</span></label>`).join('')}</div><div class="ba-column-popover-foot"><button type="button" data-action="show-default">恢复默认字段</button><button type="button" data-action="show-all">显示全部字段</button></div>`;
    document.body.appendChild(pop);
    const place=()=>{
      if(!pop.isConnected)return;
      const rect=anchor.getBoundingClientRect();
      const width=Math.min(520,Math.max(360,window.innerWidth-24));
      pop.style.width=`${width}px`;
      pop.style.left=`${Math.max(12,Math.min(rect.right-width,window.innerWidth-width-12))+window.scrollX}px`;
      pop.style.top=`${rect.bottom+6+window.scrollY}px`;
    };
    const applySelection=changed=>{
      const checked=[...pop.querySelectorAll('input:checked')].map(input=>input.value);
      if(!checked.length){changed.checked=true;return;}
      state.visibleMetrics=new Set(checked);
      render();
    };
    place();
    pop.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>applySelection(input)));
    pop.querySelector('[data-action="show-default"]')?.addEventListener('click',()=>{
      state.visibleMetrics=new Set(metricOptions.filter(item=>!item.defaultHidden).map(item=>item.key));
      pop.querySelectorAll('input').forEach(input=>{input.checked=state.visibleMetrics.has(input.value);});
      render();
    });
    pop.querySelector('[data-action="show-all"]')?.addEventListener('click',()=>{
      state.visibleMetrics=new Set(metricOptions.map(item=>item.key));
      pop.querySelectorAll('input').forEach(input=>{input.checked=true;});
      render();
    });
    setTimeout(()=>{
      window.addEventListener('scroll',place,true);
      window.addEventListener('resize',place);
      pop._baCleanup=()=>{window.removeEventListener('scroll',place,true);window.removeEventListener('resize',place);};
      document.addEventListener('click',function close(event){
        if(pop.contains(event.target)||event.target===anchor)return;
        pop._baCleanup?.();pop.remove();document.removeEventListener('click',close);
      });
    },0);
  };
  document.getElementById('validationAccountScopeTabs')?.addEventListener('click',event=>{
    const button=event.target.closest('[data-validation-account-scope]');
    if(!button||button.dataset.validationAccountScope===state.scopeView)return;
    state.scopeView=button.dataset.validationAccountScope==='excluded'?'excluded':'included';
    state.page=1;
    render();
  });
  render();
})();
