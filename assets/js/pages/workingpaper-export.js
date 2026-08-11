(()=>{
  const toast=document.getElementById('wpExportToast');
  const materiality=document.getElementById('workingpaperMateriality');
  const materialityKey='auditCompass.workingpaperMateriality';
  let timer=0;
  const showToast=message=>{
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
  };
  document.getElementById('btnExportRiskReport')?.addEventListener('click',()=>{
    showToast('风险评估报告已进入导出队列');
  });
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
