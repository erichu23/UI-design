(function(){
  'use strict';
  const prefix='auditCompass.reportDataSources:';
  const memory=new Map();
  const sourceURL=document.currentScript?.src?new URL('../../../fragments/data-management.html',document.currentScript.src).href:new URL('data-management.html',location.href).href;
  const key=book=>prefix+encodeURIComponent(book||'');
  const peek=book=>{try{return JSON.parse(localStorage.getItem(key(book))||'null')||memory.get(book)||null;}catch(error){return memory.get(book)||null;}};
  function collect(doc){
    const rules=[[/^被审计单位主档/,'被审计单位主档'],[/被审计单位银行账号/,'银行账号主档'],[/^关联方主档/,'关联方主档'],[/^客户主档/,'客户主档'],[/^供应商主档/,'供应商主档'],[/^员工主档/,'员工主档'],[/^资金流水/,'资金交易明细'],[/^分账号科目余额表/,'银行余额主档']];
    const groups=new Map();
    doc.querySelectorAll('.du-table tbody tr').forEach(row=>{
      if(row.cells.length<7)return;
      const name=row.cells[1].textContent.trim(),match=rules.find(([pattern])=>pattern.test(name));
      if(!match)return;
      const status=row.cells[2].textContent.trim();
      const normalized=/部分缺失|部分采集/.test(status)?'部分缺失':/未采集|未上传/.test(status)?'未上传':/已采集|已上传/.test(status)?'已上传':'未提供状态';
      const items=groups.get(match[1])||[];
      items.push({status:normalized,updatedAt:row.cells[6].textContent.trim()});groups.set(match[1],items);
    });
    return Array.from(groups,([name,rows])=>({name,status:rows.every(row=>row.status===rows[0].status)?rows[0].status:'部分缺失',updatedAt:rows.map(row=>row.updatedAt).filter(value=>value&&value!=='—').sort().pop()||'—'}));
  }
  function save(book,rows){
    if(!rows.length)return;
    memory.set(book,rows);
    const value=JSON.stringify(rows);
    try{if(localStorage.getItem(key(book))!==value)localStorage.setItem(key(book),value);}catch(error){}
  }
  const pending=new Map();
  async function load(book){
    const cached=peek(book);if(cached)return cached;
    if(pending.has(book))return pending.get(book);
    const request=(async()=>{
      try{const response=await fetch(sourceURL,{cache:'no-cache'});if(!response.ok)return [];const rows=collect(new DOMParser().parseFromString(await response.text(),'text/html'));save(book,rows);return rows;}catch(error){return [];}
    })();
    pending.set(book,request);try{return await request;}finally{pending.delete(book);}
  }
  window.ReportDataSources=Object.freeze({prefix,peek,load,collect});
  if(document.querySelector('.du-table')){
    let timer;
    const publish=()=>{let book='';try{book=localStorage.getItem('auditCompass.currentWorkbook')||'';}catch(error){}save(book,collect(document));};
    publish();
    const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(publish,50);});
    document.querySelectorAll('.du-table').forEach(table=>observer.observe(table,{subtree:true,childList:true,characterData:true}));
    window.addEventListener('storage',event=>{if(event.key==='auditCompass.currentWorkbook')publish();});
  }
})();
