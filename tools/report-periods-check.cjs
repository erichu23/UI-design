const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/js/config/report-periods.js'),'utf8'),context);
const api=context.window.ReportPeriods;
for(const [yearEnd,start,end] of [['12-31','2025-01-01','2025-12-31'],['331','2024-04-01','2025-03-31'],['630','2024-07-01','2025-06-30'],['930','2024-10-01','2025-09-30']]){
  const rows=api.options({start:'2023-01-01',end:'2026-12-31',yearEnd});
  assert(rows.some(row=>row.start===start&&row.end===end&&!row.partial));
}
assert.equal(api.options({start:'2025-01-01',end:'2025-03-31',yearEnd:'331'})[0].partial,true);
assert.equal(api.options({start:'bad',end:'2025-12-31'}).length,0);
assert.equal(api.options({start:'2026-01-01',end:'2025-01-01'}).length,0);
assert.equal(api.validDate('2025-02-29'),false);assert.equal(api.validDate('2024-02-29'),true);
const explicit=api.options({start:'2024-01-01',end:'2025-12-31',periods:[{start:'2025-01-01',end:'2025-06-30'}]});
assert.equal(explicit.length,1);assert.equal(explicit[0].label,'2025年1月1日 - 2025年6月30日');
console.log('PASS: four fiscal year ends, cross-year periods, leap dates, partial coverage and explicit system options.');
