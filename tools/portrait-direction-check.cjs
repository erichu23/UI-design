const fs=require('fs');
const vm=require('vm');
const assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..');
const nodes={};
let csvBlob,downloadName;
const document={
  addEventListener(){},
  querySelectorAll(){return [];},
  querySelector(){return null;},
  getElementById(id){return nodes[id]||null;},
  createElement(){return {click(){downloadName=this.download;}};}
};
const context={document,window:{addEventListener(){},dispatchEvent(){}},Blob,
  URL:{createObjectURL(blob){csvBlob=blob;return 'blob:test';},revokeObjectURL(){}},
  console,setTimeout(){},CustomEvent:function(){}};
vm.createContext(context);
const source=fs.readFileSync(`${root}/assets/js/pages/portrait.js`,'utf8');
const expose=`
window.test={rows,filterRows,filterRowsFor,metricValue,portraitDirectionMetrics,groupCells,mini,
sortedPortraitRows,renderFilterCards,renderTableHead,syncPortraitColumns,exportPortraitCurrent,bindPortraitFlowTabs,
setFlow(value){portraitFlow=value;sortKey='';},setCategory(value){counterpartyFilter=value;},
setSort(key,dir){sortKey=key;sortDir=dir;},getState(){return {portraitFlow,sortKey,sortDir,page,mode,relationMode,personalMode};},
mockRender(){renderTable=()=>{window.renderCount=(window.renderCount||0)+1;};},
setTableView(value){tableView=value;},businessScopeRows};
`;
vm.runInContext(source.replace(/\}\)\(\);\s*$/,expose+'})();'),context);
const api=context.window.test;
assert.equal(api.getState().portraitFlow,'total');
const sample=[{name:'in',inflow:100,outflow:0,count:4,type:'客户'},
  {name:'out',inflow:0,outflow:300,count:5,type:'供应商'},
  {name:'both',inflow:200,outflow:50,count:8,type:'客户'},
  {name:'none',inflow:0,outflow:0,count:0,type:'其他'}];
for(const flow of ['total','inflow','outflow']){
  api.setFlow(flow);
  const defs=api.portraitDirectionMetrics();
  assert.equal(defs.length,flow==='total'?8:3);
  const filtered=api.filterRows(sample);
  assert.deepEqual(Array.from(filtered,row=>row.name),flow==='total'?['in','out','both','none']:flow==='inflow'?['in','both']:['out','both']);
  const sorted=api.sortedPortraitRows(filtered);
  for(let i=1;i<sorted.length;i++)assert(api.metricValue(sorted[i-1],flow)>=api.metricValue(sorted[i],flow));
  const cells=api.groupCells(sample[2],null,{inflow:300,outflow:350},defs);
  assert.equal((cells.match(/<td /g)||[]).length,defs.length);
  assert.equal((api.groupCells(sample[2],2025,{inflow:300,outflow:350},defs).match(/<td /g)||[]).length,defs.length);
  assert.equal((api.groupCells(sample[2]).match(/<td /g)||[]).length,8,'shared tables retain both sides');
  const mini=api.mini(sample[2],0,flow);
  assert.equal(mini.includes('class="is-in"'),flow!=='outflow');
  assert.equal(mini.includes('class="is-out"'),flow!=='inflow');
  nodes.portraitCounterpartyHead={innerHTML:''};
  api.renderTableHead();
  const head=nodes.portraitCounterpartyHead.innerHTML;
  assert(head.includes(`colspan="${defs.length}" class="portrait-year-head"`));
  assert.equal(head.includes('data-sort="inflow"'),flow!=='outflow');
  assert.equal(head.includes('data-sort="outflow"'),flow!=='inflow');
  const colgroup={innerHTML:''};
  nodes.portraitCounterpartyTable={querySelector(){return colgroup;}};
  api.syncPortraitColumns();
  assert.equal((colgroup.innerHTML.match(/portrait-year-metric-col/g)||[]).length,defs.length*3);
}
api.setFlow('inflow');api.setCategory('supplier');
assert.equal(api.filterRows(sample).length,0);
api.setCategory('all');
context.window.BankCounterpartyScope={allows(row){return row.name!=='both';},filter(list){return list.filter(this.allows);}};
assert.deepEqual(Array.from(api.filterRows(sample),r=>r.name),['in']);
delete context.window.BankCounterpartyScope;
nodes.portraitCounterpartyFilters={innerHTML:''};
const percentages=[];
for(const flow of ['total','inflow','outflow']){
  api.setFlow(flow);api.renderFilterCards();
  const html=nodes.portraitCounterpartyFilters.innerHTML;
  assert(html.includes('100.0%'));
  percentages.push(html.match(/data-filter="customer"[\s\S]*?<strong>([^<]+)/)[1]);
}
assert.notEqual(percentages[1],percentages[2]);
const saved=api.rows.map(row=>({...row}));
api.rows.forEach(row=>{row.inflow=0;row.outflow=0;});
api.renderFilterCards();
assert(!/NaN|Infinity/.test(nodes.portraitCounterpartyFilters.innerHTML));
api.rows.forEach((row,index)=>Object.assign(row,saved[index]));
const buttons=['total','inflow','outflow'].map((flow,index)=>({
  dataset:{flow},id:`flow-${index}`,classList:{toggle(){}},setAttribute(){},focus(){document.activeElement=this;}
}));
const listeners={};
nodes.portraitFlowTabs={querySelectorAll(){return buttons;},addEventListener(name,fn){listeners[name]=fn;}};
nodes.portraitFlowPanel={setAttribute(){}};
api.mockRender();api.setFlow('total');api.bindPortraitFlowTabs();
listeners.click({target:{closest(){return buttons[1];}}});
assert.equal(api.getState().portraitFlow,'inflow');assert.equal(api.getState().sortDir,-1);
assert.equal(api.getState().page,1);assert.equal(buttons[1].tabIndex,0);
document.activeElement=buttons[1];
listeners.keydown({key:'ArrowRight',preventDefault(){}});
assert.equal(api.getState().portraitFlow,'outflow');
assert.equal(api.getState().mode,'inflow');
assert.equal(api.getState().relationMode,'total');assert.equal(api.getState().personalMode,'total');
(async()=>{
  for(const view of ['summary','business'])for(const flow of ['total','inflow','outflow']){
    api.setTableView(view);api.setFlow(flow);api.exportPortraitCurrent({stopImmediatePropagation(){}});
    const csv=await csvBlob.text();
    const lines=csv.trim().split('\n');
    assert.equal(lines.length,101);
    const header=lines[0].split(',');
    assert.equal(header.includes('"流入金额"'),flow!=='outflow');
    assert.equal(header.includes('"流出金额"'),flow!=='inflow');
    for(const line of lines.slice(1))assert.equal(line.split(',').length,header.length);
    const sorted=api.sortedPortraitRows(api.filterRows(api.rows));
    assert(lines[1].startsWith(`"${sorted[0].name}"`));
    if(flow!=='total')assert(downloadName.includes(flow==='inflow'?'流入方':'流出方'));
  }
  console.log('PASS: direction filters, amount shares, descending order, annual columns, shared-table isolation, keyboard tabs and six export views.');
})().catch(error=>{console.error(error);process.exitCode=1;});
