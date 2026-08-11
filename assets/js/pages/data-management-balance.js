(()=>{
  const table=document.getElementById('tblAccountSummary');
  const body=document.getElementById('accountSummaryBody');
  const pager=document.getElementById('pagination-account');
  if(!table||!body||!pager)return;

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
  const totals={inflow:790259,outflow:725311,total:1515570,txCount:26301,cpCount:100,fileCount:8};
  const format=value=>Number(value).toLocaleString('zh-CN');
  const ratio=value=>`${(value/totals.total*100).toFixed(2)}%`;
  const statusClass=(row,year,month)=>{
    const seed=month+row*3+(year-2023)*2;
    if(seed%11===0)return 'chk-err';
    if(seed%7===0)return 'chk-warn';
    if(seed%13===0)return 'chk-none';
    return 'chk-ok';
  };
  const yearSeparator='<span class="col-sep"></span>';
  const yearLabels=table.querySelector('.y-labels');
  if(yearLabels)yearLabels.innerHTML=years.map(year=>`<span class="y y-${year}">${year}</span>`).join(yearSeparator);
  const monthNumbers=years.map(year=>months.map(month=>`<span class="month-num col-year-${year}">${month}</span>`).join('')).join(yearSeparator);
  const statusDots=rowIndex=>years.map(year=>months.map(month=>`<i class="chk-dot ${statusClass(rowIndex,year,month)} col-year-${year}" title="${year}-${String(month).padStart(2,'0')}"></i>`).join('')).join(yearSeparator);
  const miniBars=rowIndex=>{
    const inflow=[72,58,84,65,91,77,69,88,74,96,82,90];
    const outflow=[54,68,61,79,63,72,86,67,81,70,92,76];
    return `<div class="monthly-flow-bars" aria-label="月度流入流出分布">${inflow.map((value,month)=>`<span class="monthly-flow-pair" title="${month+1}月"><i class="flow-in-bar" style="height:${Math.min(98,value+rowIndex*2)}%"></i><i class="flow-out-bar" style="height:${Math.min(98,outflow[month]+rowIndex)}%"></i></span>`).join('')}</div>`;
  };
  const state={page:1,pageSize:20};
  const render=()=>{
    const pages=Math.max(1,Math.ceil(rows.length/state.pageSize));
    state.page=Math.max(1,Math.min(state.page,pages));
    const start=(state.page-1)*state.pageSize;
    const visible=rows.slice(start,start+state.pageSize);
    body.innerHTML=`<tr class="sum-row"><td><strong>合计</strong></td><td></td><td></td><td></td><td class="flow-in"><strong>${format(totals.inflow)}</strong></td><td class="flow-out"><strong>${format(totals.outflow)}</strong></td><td><strong>${format(totals.total)}</strong></td><td><strong>100.00%</strong></td><td><strong>${format(totals.txCount)}</strong></td><td><strong>${totals.cpCount}</strong></td><td><strong>${totals.fileCount}</strong></td><td></td><td class="check-col"><div class="check-window"><div class="months-grid">${monthNumbers}</div></div></td></tr>${visible.map((row,index)=>{const absoluteIndex=start+index;return `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td class="monthly-flow-cell">${miniBars(absoluteIndex)}</td><td class="flow-in">${format(row[3])}</td><td class="flow-out">${format(row[4])}</td><td><b>${format(row[5])}</b></td><td>${ratio(row[5])}</td><td>${format(row[6])}</td><td>${row[7]}</td><td>${row[8]}</td><td class="actions"><a href="javascript:void(0)" title="账号详情"><i class="fa-regular fa-eye"></i></a><a href="javascript:void(0)" title="文件详情"><i class="fa-regular fa-file-lines"></i></a></td><td class="check-col"><div class="check-window"><div class="months-grid check-row">${statusDots(absoluteIndex)}</div></div></td></tr>`;}).join('')}`;
    window.renderAuditPager?.(pager,{total:rows.length,page:state.page,pageSize:state.pageSize,onPage:page=>{state.page=page;render();},onPageSize:size=>{state.pageSize=size;state.page=1;render();}});
    window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));
  };
  render();
})();
