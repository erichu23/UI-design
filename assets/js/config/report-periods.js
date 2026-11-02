(function(){
  'use strict';
  const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
  const format=value=>{const [year,month,day]=value.split('-').map(Number);return `${year}年${month}月${day}日`;};
  function fiscalEnd(value){
    const digits=String(value||'12-31').replace(/\D/g,'').padStart(4,'0');
    const end=digits.slice(0,2)+'-'+digits.slice(2);
    return ['12-31','03-31','06-30','09-30'].includes(end)?end:'12-31';
  }
  function options({start,end,yearEnd,periods}={}){
    if(!validDate(start)||!validDate(end)||start>end)return [];
    const rows=Array.isArray(periods)?periods:Array.from({length:Number(end.slice(0,4))-Number(start.slice(0,4))+2},(_,index)=>{
      const year=Number(start.slice(0,4))+index,finish=year+'-'+fiscalEnd(yearEnd);
      const begin=new Date((year-1)+'-'+fiscalEnd(yearEnd)+'T00:00:00Z');begin.setUTCDate(begin.getUTCDate()+1);
      return {start:begin.toISOString().slice(0,10),end:finish};
    });
    const seen=new Set();
    return rows.filter(row=>validDate(row.start)&&validDate(row.end)&&row.start<=row.end&&row.start<=end&&row.end>=start).sort((a,b)=>a.end.localeCompare(b.end)||a.start.localeCompare(b.start)).flatMap(row=>{
      const value=row.start+'/'+row.end;
      if(seen.has(value))return [];seen.add(value);
      return [{value,start:row.start,end:row.end,label:format(row.start)+' - '+format(row.end),partial:row.start<start||row.end>end}];
    });
  }
  window.ReportPeriods=Object.freeze({validDate,format,fiscalEnd,options});
})();
