/* ===== 顶部页面切换 + 刷新保持当前页 ===== */
    const TAB_KEY   = 'topTabs.active';
    const PANE_SEL  = '.tab-pane';
    const ID_PREFIX = 'pane-';
    
    function setPageVisible(key){
      document.querySelectorAll(PANE_SEL).forEach(el=>{
        el.classList.add('hide');
        el.classList.remove('active');
      });
      const tgt = document.getElementById(ID_PREFIX + key);
      if (tgt){
        tgt.classList.remove('hide');
        tgt.classList.add('active');
      }
    }
    
    function setTabActive(key){
      document.querySelectorAll('#topTabs .tab')
        .forEach(el=>el.classList.toggle('active', el.dataset.top === key));
    }
    
    function updateInkbar(key){
      const bar = document.getElementById('inkbar');
      const act = document.querySelector(`#topTabs .tab[data-top="${key}"]`);
      if (!bar || !act) return;
      requestAnimationFrame(()=>{
        bar.style.width = act.offsetWidth + 'px';
        bar.style.left  = act.offsetLeft + 'px';
      });
    }
    
    function activate(key){
      setTabActive(key);
      setPageVisible(key);
      updateInkbar(key);
      localStorage.setItem(TAB_KEY, key);
      setTimeout(()=>window.dispatchEvent(new Event('resize')),50);
    }
    
    document.getElementById('topTabs')?.addEventListener('click', e=>{
      const t = e.target.closest('.tab'); if(!t) return;
      activate(t.dataset.top);
    });
    
    document.addEventListener('DOMContentLoaded', ()=>{
      document.querySelectorAll(PANE_SEL).forEach(el=>el.classList.add('hide'));
      const saved = localStorage.getItem(TAB_KEY) || 'account';
      activate(saved);
    });
    
    window.addEventListener('load', ()=>{
      updateInkbar(localStorage.getItem(TAB_KEY) || 'account');
    });
