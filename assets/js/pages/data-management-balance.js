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
  const ensureCheckDrawer=()=>{
    let mask=document.getElementById('dmBalanceCheckDrawerMask');
    if(mask)return mask;
    mask=document.createElement('div');
    mask.id='dmBalanceCheckDrawerMask';
    mask.className='dm-balance-check-mask';
    mask.hidden=true;
    mask.innerHTML=`<aside class="dm-balance-check-drawer" role="dialog" aria-modal="true" aria-labelledby="dmBalanceCheckTitle">
      <header class="dm-balance-check-head"><div><b id="dmBalanceCheckTitle">校验详情</b><span id="dmBalanceCheckSubtitle"></span></div><button type="button" data-check-close aria-label="关闭">×</button></header>
      <div class="dm-balance-check-body" id="dmBalanceCheckBody"></div>
      <footer class="dm-balance-check-actions" id="dmBalanceCheckActions"></footer>
    </aside>`;
    document.body.appendChild(mask);
    const close=()=>{
      mask.hidden=true;
      mask.setAttribute('hidden','');
      mask.style.display='none';
      document.body.classList.remove('dm-check-drawer-open');
    };
    mask.addEventListener('click',event=>{if(event.target===mask||event.target.closest('[data-check-close]'))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mask.hidden)close();});
    return mask;
  };
  const drawerPager=total=>`<div class="dm-check-mini-pager"><span>共 ${total} 条</span><button type="button" disabled>‹</button><button type="button" class="is-current">1</button><button type="button" disabled>›</button><span>20 条/页</span></div>`;
  const openCheckDrawer=trigger=>{
    const mask=ensureCheckDrawer();
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
        mask.hidden=true;mask.setAttribute('hidden','');mask.style.display='none';document.body.classList.remove('dm-check-drawer-open');
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
      actions.querySelector('[data-check-close]').onclick=()=>{mask.hidden=true;mask.setAttribute('hidden','');mask.style.display='none';document.body.classList.remove('dm-check-drawer-open');};
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
    mask.hidden=false;
    mask.removeAttribute('hidden');
    mask.style.display='block';
    document.body.classList.add('dm-check-drawer-open');
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
    const totalYearCells=yearCells(totals);
    body.innerHTML=`<tr class="sum-row"><td><strong>合计</strong></td><td></td><td></td><td class="monthly-flow-cell monthly-flow-year-cell"><button type="button" class="monthly-flow-year-trigger" data-flow-year-trigger aria-haspopup="listbox" aria-expanded="false" title="切换月度流入/流出年份"><span>${selectedFlowYear}年</span><i aria-hidden="true"></i></button></td><td class="flow-in is-num"><strong>${format(totals.inflow)}</strong></td><td class="flow-out is-num"><strong>${format(totals.outflow)}</strong></td><td class="is-num"><strong>${format(totals.total)}</strong></td><td class="is-num"><strong>100.00%</strong></td><td class="is-num"><strong>${format(totals.txCount)}</strong></td><td class="is-num"><strong>${totals.cpCount}</strong></td><td class="is-num"><strong>${totals.fileCount}</strong></td>${totalYearCells}<td class="account-action-sticky"></td><td class="check-col"><div class="check-window"><div class="months-grid">${monthNumbers}</div></div></td></tr>${visible.map(row=>{const source=row.source;return `<tr><td>${source[0]}</td><td>${source[1]}</td><td>${source[2]}</td><td class="monthly-flow-cell">${miniBars(row)}</td><td class="flow-in is-num">${format(row.inflow)}</td><td class="flow-out is-num">${format(row.outflow)}</td><td class="is-num"><b>${format(row.total)}</b></td><td class="is-num">${ratio(row.total,totals.total)}</td><td class="is-num">${format(row.txCount)}</td><td class="is-num">${row.cpCount}</td><td class="is-num">${row.fileCount}</td>${yearCells(row)}<td class="actions account-action-sticky"><button class="dm-account-action-btn" type="button" title="查看账号详情" aria-label="查看账号详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.6"></circle></svg></button><button class="dm-account-action-btn" type="button" title="查看文件详情" aria-label="查看文件详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6Z"></path><path d="M14 3.5v4h4M9 12h6M9 16h6"></path></svg></button></td><td class="check-col"><div class="check-window"><div class="months-grid check-row">${statusDots(row.index,source)}</div></div></td></tr>`;}).join('')}`;
    window.renderAuditPager?.(pager,{total:viewRows.length,page:state.page,pageSize:state.pageSize,onPage:page=>{state.page=page;render();},onPageSize:size=>{state.pageSize=size;state.page=1;render();}});
    delete table.dataset.baEnhanced;
    table.querySelectorAll('.ba-th-tools').forEach(tool=>tool.remove());
    bindCheckControls();
    window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));
  };
  render();
})();
