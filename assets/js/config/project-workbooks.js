(function(){
  'use strict';
  const defaults=Object.freeze([Object.freeze({
    name:'20251022',files:2,updated:'2026-04-08',
    period:'2026-04-01 - 2026-05-29',remark:'',
    analysisStart:'2026-04-01',analysisEnd:'2026-05-29',
    reportStart:'2026-04-01',reportEnd:'2026-05-29',
    ipo:false,pie:false,capitalMarket:'',fiscalYearEnd:'12-31',materiality:1000000
  })]);
  function read(){
    try{
      const rows=JSON.parse(localStorage.getItem('auditCompass.projectWorkbooks')||'null');
      if(Array.isArray(rows)&&rows.length)return rows.map(row=>{
        const original=defaults.find(item=>item.name===row.name)||{};
        const dates=String(row.period||'').match(/\d{4}-\d{2}-\d{2}/g)||[];
        return {...original,...row,analysisStart:row.analysisStart||dates[0]||original.analysisStart,
          analysisEnd:row.analysisEnd||dates[1]||original.analysisEnd};
      });
    }catch(error){}
    return defaults.map(row=>({...row}));
  }
  window.ProjectWorkbooks=Object.freeze({read});
})();
