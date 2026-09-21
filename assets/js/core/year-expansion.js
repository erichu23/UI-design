(function(){
  let activeMenu=null;

  const normalized=(years,selected)=>{
    const values=selected&&typeof selected[Symbol.iterator]==='function'?[...selected]:[];
    return years.filter(year=>values.some(value=>String(value)===String(year)));
  };
  const label=(years,selected)=>{
    const current=normalized(years,selected);
    if(current.length===years.length)return '全部年份';
    if(current.length===1)return `${current[0]}年`;
    if(current.length)return current.join('、');
    return '选择年份';
  };
  const close=()=>{
    if(!activeMenu)return;
    activeMenu.cleanup?.();
    activeMenu.button?.setAttribute('aria-expanded','false');
    activeMenu.remove();
    activeMenu=null;
  };
  const place=(menu,button)=>{
    if(!menu.isConnected)return;
    const rect=button.getBoundingClientRect();
    const width=224;
    menu.style.left=`${Math.max(8,Math.min(innerWidth-width-8,rect.left+rect.width/2-width/2))}px`;
    menu.style.top=`${Math.min(innerHeight-menu.offsetHeight-8,rect.bottom+6)}px`;
  };
  const open=(button,options)=>{
    const wasOpen=activeMenu?.button===button;
    close();
    if(wasOpen)return;
    const years=options.years||[];
    const current=new Set(normalized(years,options.getSelected?.()));
    const menu=document.createElement('div');
    menu.className='audit-year-picker-menu';
    menu.setAttribute('role','dialog');
    menu.setAttribute('aria-label','选择展开年度');
    menu.innerHTML=`<div class="audit-year-picker-head"><div><b>选择展开年份</b><span>勾选需要查看的年度明细</span></div><em>已选${current.size}项</em></div><div class="audit-year-picker-options">${years.map(year=>`<label><input type="checkbox" value="${year}" ${current.has(year)?'checked':''}><span><i></i>${year}年</span></label>`).join('')}</div><div class="audit-year-picker-shortcuts"><button type="button" data-year-action="all">全部展开</button><button type="button" data-year-action="none">全部收起</button></div><div class="audit-year-picker-foot"><button type="button" data-year-action="cancel">取消</button><button type="button" class="is-primary" data-year-action="apply">应用</button></div>`;
    document.body.appendChild(menu);
    activeMenu=menu;
    menu.button=button;
    button.setAttribute('aria-expanded','true');
    const updateCount=()=>{menu.querySelector('em').textContent=`已选${menu.querySelectorAll('input:checked').length}项`;};
    menu.addEventListener('change',updateCount);
    menu.addEventListener('click',event=>{
      event.stopPropagation();
      const action=event.target.closest('[data-year-action]')?.dataset.yearAction;
      if(!action)return;
      if(action==='all'||action==='none'){
        menu.querySelectorAll('input').forEach(input=>{input.checked=action==='all';});
        updateCount();
        return;
      }
      if(action==='cancel'){close();return;}
      const next=new Set([...menu.querySelectorAll('input:checked')].map(input=>{
        const match=years.find(year=>String(year)===input.value);
        return match===undefined?input.value:match;
      }));
      close();
      options.onChange?.(next);
    });
    const onOutside=event=>{if(!menu.contains(event.target)&&event.target!==button)close();};
    const onKey=event=>{if(event.key==='Escape')close();};
    const reposition=()=>place(menu,button);
    menu.cleanup=()=>{document.removeEventListener('click',onOutside);document.removeEventListener('keydown',onKey);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',reposition,true);};
    requestAnimationFrame(()=>{place(menu,button);document.addEventListener('click',onOutside);document.addEventListener('keydown',onKey);window.addEventListener('resize',reposition);window.addEventListener('scroll',reposition,true);});
  };

  window.AuditYearExpansion={
    label,
    controls({years,selected,toggleId,pickerId,totalLabel='合计'}){
      const current=normalized(years,selected);
      const title=current.length?`已展开：${current.map(year=>`${year}年`).join('、')}`:'当前未展开年度明细';
      return `<div class="audit-year-controls"><button class="audit-year-toggle" id="${toggleId}" type="button" title="${current.length?'一键收起年度明细':'一键展开全部年度'}"><span>${totalLabel}</span><i>${current.length?'«':'»'}</i></button><button class="audit-year-picker" id="${pickerId}" type="button" aria-haspopup="dialog" aria-expanded="false" title="${title}"><span>${label(years,current)}</span><i aria-hidden="true"></i></button></div>`;
    },
    bind({years,getSelected,onChange,toggleId,pickerId}){
      document.getElementById(toggleId)?.addEventListener('click',event=>{
        event.stopPropagation();
        close();
        const current=normalized(years,getSelected?.());
        onChange?.(new Set(current.length?[]:years));
      });
      document.getElementById(pickerId)?.addEventListener('click',event=>{
        event.stopPropagation();
        open(event.currentTarget,{years,getSelected,onChange});
      });
    },
    close
  };
})();
