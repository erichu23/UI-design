/* =============== 经营实质：图表 =============== */
    /* =============== 经营实质：通用（日粒度） =============== */
    /* 1) 生成 2023-01-01 ~ 2024-12-31 的每日日期 */
    function genDays(start, end){
      const out = [];
      const s = new Date(start), e = new Date(end);
      for(let d=new Date(s); d<=e; d.setDate(d.getDate()+1)){
        out.push(d.toISOString().slice(0,10)); // YYYY-MM-DD
      }
      return out;
    }
    const days = genDays('2023-01-01','2024-12-31'); // 共 731 天（含闰年 2024）
    
    /* 2) 生成“尖峰型”日级示例数据（接入真实数据时替换 dataInDaily / dataOutDaily） */
    function genSpikyDaily(len, baseMin, baseMax, spikeProb=0.06, spikeMin=6e6, spikeMax=8e7){
      return Array.from({length: len}, (_,i)=>{
        // 小额基线 + 轻微波动
        const base = baseMin + Math.random()*(baseMax-baseMin);
        const wave = Math.sin(i/13)*0.15*base + Math.cos(i/29)*0.1*base;
        let v = Math.max(0, base + wave);
    
        // 以小概率产生大额尖峰
        if (Math.random() < spikeProb){
          v += spikeMin + Math.random()*(spikeMax-spikeMin);
        }
        return Math.round(v);
      });
    }
    const dataInDaily  = genSpikyDaily(days.length, 1.2e5, 9e5, 0.05, 2e6, 6e7);  // 日流入
    const dataOutDaily = genSpikyDaily(days.length, 1.0e5, 8e5, 0.05, 2e6, 5e7);  // 日流出
    
    /* 3) 工具函数 */
    function sum(a){return a.reduce((s,x)=>s+x,0)}
    function avg(a){return a.length? (sum(a)/a.length):0}
    function fmt(n){return n.toLocaleString('zh-CN')}
    const fmtK = n => (n||0).toLocaleString('zh-CN');
    
    function pickByYearDays(year, arr){   // 从日级数组中截取年段
      if (year==='2023'){
        return arr.slice(0, 365);
      }
      if (year==='2024'){
        return arr.slice(365);
      }
      return arr; // 2023-2024
    }
    function pickDaysX(year){             // 取对应的 X 轴（日期）
      if (year==='2023') return days.slice(0,365);
      if (year==='2024') return days.slice(365);
      return days;
    }
    
    const palette = {
      blue:  '#2152ff',
      blueA: 'rgba(33,82,255,0.14)',
      red:   '#E64646',
      redA:  'rgba(230,70,70,0.10)',
      axis:  '#cbd5e1',
      text:  '#334155',
      grid:  '#e9eef7'
    };
    function baseGrid(){ return { left: 56, right: 16, top: 28, bottom: 56, containLabel: true }; }
    function baseDataZoom(){
      return [
        { type:'inside', zoomOnMouseWheel:false, moveOnMouseWheel:true, moveOnMouseMove:true },
        { type:'slider', height:14, bottom:12, handleSize:0, borderColor:'#dfe6f2',
          backgroundColor:'#f1f5f9', fillerColor:'rgba(30,73,226,.12)' }
      ];
    }
    function baseAxis(xCats){
      return {
        xAxis: { type:'category', data:xCats, boundaryGap:false,
          axisLine:{lineStyle:{color:palette.axis}}, axisLabel:{color:palette.text, margin:10},
          axisTick:{show:false}, splitLine:{show:false}
        },
        yAxis: { type:'value', axisLine:{show:false},
          axisLabel:{color:palette.text, formatter: v=>fmtK(v)},
          splitLine:{show:true, lineStyle:{color:palette.grid}}
        }
      };
    }
    function baseTooltip(formatter){
      return {
        trigger:'axis', confine:true, className:'echarts-tip', borderWidth:0,
        backgroundColor:'transparent', padding:0,
        axisPointer:{type:'line', lineStyle:{color:'#94a3b8', type:'dashed'}},
        formatter
      };
    }
    function makeLineChart(domId, opt){
      const chart = echarts.init(document.getElementById(domId));
      chart.setOption(opt, true);
      window.addEventListener('resize', ()=>chart.resize());
      return chart;
    }
    
    /* ========= 资金流水余额：单蓝线（阶梯）+ 角标 + 缩放 ========= */
    function renderBalance(){
      const y    = document.getElementById('yearBalance')?.value || '2023-2024';
      const xSel = pickDaysX(y);
    
      // 用“日流入-日流出”的累计近似余额（>0 约束）；如有真实余额，替换 balanceData/xSel 即可
      const inSel  = pickByYearDays(y, dataInDaily);
      const outSel = pickByYearDays(y, dataOutDaily);
      let acc = 0;
      const balanceData = inSel.map((v,i)=>{
        acc = Math.max(0, acc + v - (outSel[i] || 0));   // ← 不允许为负
        return acc;
      });
      const lastBal = balanceData.length ? balanceData[balanceData.length-1] : 0;
    
      makeLineChart('chart-balance', {
        color: [palette.blue],                                  // 固定调色
        grid:  baseGrid(),
        ...baseAxis(xSel),
        dataZoom: baseDataZoom(),
        tooltip: baseTooltip(p=>{
          const v = p[0]?.value ?? 0;
          return `
            <div class="tip-card">
              <div class="t">${p[0].axisValue}</div>
              <div class="tip-row"><span class="tip-k">余额</span><span class="tip-v">¥ ${fmtK(v)}</span></div>
            </div>`;
        }),
        // 右上角“余额角标”
        /* ✅ 这里新增 legend */
        legend: {
          top: 6,
          right: 10,
          icon: 'roundRect',
          itemWidth: 12,
          itemHeight: 12,
          textStyle:{ color:'#475569' }
        },
        xAxis: { ...baseAxis(xSel).xAxis, boundaryGap: false },
        yAxis: { ...baseAxis(xSel).yAxis, min: 0 },             // y 轴从 0 开始
        series: [{
          name:'余额',
          type:'line',
          step: 'middle',                                       // ← 阶梯线，更像余额变化
          smooth:false,
          sampling:'lttb',
          showSymbol:false,
          connectNulls:true,
          lineStyle:{ width: 2.4, color: palette.blue },
          areaStyle:{
            color: new echarts.graphic.LinearGradient(0,0,0,1,[
              {offset:0, color: palette.blueA},
              {offset:1, color:'rgba(33,82,255,0)'}
            ])
          },
          data: balanceData
        }]
      });
    }
    
    /* ========= 流入流出趋势：蓝/红双线 + 缩放（无面积） ========= */
    function renderIO(){
      const y    = document.getElementById('yearIO')?.value || '2023-2024';
      const xSel = pickDaysX(y);
      const inSel  = pickByYearDays(y, dataInDaily);
      const outSel = pickByYearDays(y, dataOutDaily);
    
      // KPI（沿用）
      const $ = id => document.getElementById(id);
      if ($('io_in_sum'))  $('io_in_sum').textContent  = '¥' + fmt(sum(inSel));
      if ($('io_in_avg'))  $('io_in_avg').textContent  = '¥' + fmt(Math.round(avg(inSel)));
      if ($('io_out_sum')) $('io_out_sum').textContent = '¥' + fmt(sum(outSel));
      if ($('io_out_avg')) $('io_out_avg').textContent = '¥' + fmt(Math.round(avg(outSel)));
    
      makeLineChart('chart-io', {
        color: [palette.blue, palette.red],                     // ← 强制“流入蓝 / 流出红”
        grid:  baseGrid(),
        ...baseAxis(xSel),
        legend:{ top:6, right:8, icon:'roundRect', itemWidth:10, itemHeight:10,
          textStyle:{ color: palette.text } },
        dataZoom: baseDataZoom(),
        tooltip: baseTooltip(params=>{
          const pin  = params.find(p=>p.seriesName==='流入');
          const pout = params.find(p=>p.seriesName==='流出');
          return `
            <div class="tip-card">
              <div class="t">${params[0].axisValue}</div>
              <div class="tip-row"><span class="tip-k">流入</span><span class="tip-v" style="color:${palette.blue}">¥ ${fmtK(pin?.value||0)}</span></div>
              <div class="tip-row"><span class="tip-k">流出</span><span class="tip-v" style="color:${palette.red}">¥ ${fmtK(pout?.value||0)}</span></div>
            </div>`;
        }),
        xAxis: { ...baseAxis(xSel).xAxis, boundaryGap: false },
        yAxis: { ...baseAxis(xSel).yAxis, min: 0 },             // 从 0 起，更直观
        series: [
          { name:'流入', type:'line', smooth:false, sampling:'lttb', showSymbol:false, connectNulls:true,
            lineStyle:{ width:2, color: palette.blue }, data: inSel },
          { name:'流出', type:'line', smooth:false, sampling:'lttb', showSymbol:false, connectNulls:true,
            lineStyle:{ width:2, color: palette.red  }, data: outSel }
        ]
      });
    }
    
    /* 首次渲染 & 联动（保持不变） */
    renderBalance();
    renderIO();
    document.getElementById('yearBalance')?.addEventListener('change', renderBalance);
    document.getElementById('yearIO')?.addEventListener('change', renderIO);


    /* ===== 依赖与占位（若你项目里已有 months / dataIn / dataOut / ez 就会自动复用） ===== */
    const C_BLUE='#2152ff', C_RED='#E64646';
    if(typeof window.months==='undefined'){
      window.months=[...Array.from({length:12},(_,i)=>`2023-${String(i+1).padStart(2,'0')}`),
                     ...Array.from({length:12},(_,i)=>`2024-${String(i+1).padStart(2,'0')}`)];
    }
    if(typeof window.dataIn==='undefined' || typeof window.dataOut==='undefined'){
      window.dataIn = months.map(()=>Math.round(2e6+Math.random()*8e6));
      window.dataOut= months.map(()=>Math.round(1.5e6+Math.random()*7e6));
    }
    if(typeof window.ez==='undefined'){
      window.ez=function(domId,opt){const el=document.getElementById(domId);
        const inst=echarts.getInstanceByDom(el)||echarts.init(el);inst.setOption(opt,true);return inst;}
    }
    const yFmt=v=>(v||0).toLocaleString('zh-CN');
    
    /* ===== 7 类占比（可接真实值） ===== */
    const categories=['全体对手方','已知关联方','供应商','客户','员工','其他','个人'];
    function renderCompCats(){
      const nums=[100,28,0,0,0,0,0]; // TODO: 替换成你的真实统计
      const total=nums.reduce((s,x)=>s+x,0)||1;
      const wrap=document.getElementById('compCats'); if(!wrap) return;
      wrap.innerHTML=categories.map((n,i)=>`
        <div class="cat">
          <div class="name">${n}</div>
          <div class="pct">${(nums[i]/total*100).toFixed(2)}%</div>
        </div>`).join('');
    }
    
    /* ===== 月度分布（交易总额 / 流入方 / 流出方）——图二样式蓝红柱状 ===== */
    function renderCompCharts(mode='total'){
      if(!document.getElementById('chart-comp-monthly')) return;
      let series=[];
      if(mode==='in'){
        series=[{name:'流入',type:'bar',barWidth:16,itemStyle:{color:C_BLUE},data:dataIn}];
      }else if(mode==='out'){
        series=[{name:'流出',type:'bar',barWidth:16,itemStyle:{color:C_RED},data:dataOut}];
      }else{
        series=[
          {name:'流入',type:'bar',barWidth:16,itemStyle:{color:C_BLUE},data:dataIn},
          {name:'流出',type:'bar',barWidth:16,itemStyle:{color:C_RED}, data:dataOut}
        ];
      }
      ez('chart-comp-monthly',{
        grid:{left:56,right:16,top:30,bottom:40,containLabel:true},
        color:[C_BLUE,C_RED],
        legend:{top:6,right:8,icon:'roundRect',itemWidth:10,itemHeight:10},
        tooltip:{trigger:'axis',axisPointer:{type:'shadow'},valueFormatter:yFmt},
        xAxis:{type:'category',data:months,axisTick:{show:false}},
        yAxis:{type:'value',axisTick:{show:false},splitLine:{lineStyle:{color:'#eef2f7'}},axisLabel:{formatter:yFmt}},
        series
      });
    
      // —— Top20（右侧列表，图一风格）。这里演示用占位，接你真实聚合即可。
      const list = Array.from({length:10},(_,i)=>({
        name:['abc有限公司','a****新能源汽车技术有限公司','w**股份有限公司','b****汽车部件有限公司',
              'k****汽车电子零部件有限公司','o3****金属塑料制品厂','p****集团股份有限公司募集合资专户',
              'h****motivesystemsholdingco.ltd','l****汽车零部件有限公司','x****材料科技有限公司'][i] || `对手方 ${i+1}`,
        amount:Math.round(2e7+Math.random()*5e8)
      })).sort((a,b)=>b.amount-a.amount);
      renderTop20Panel(list);
    }
    
    // 统一金额格式
    function fmtCNY(n){ return `¥${(Number(n)||0).toLocaleString('zh-CN')}`; }
    
    /* ===== Top20 列表渲染：标题 = “Top20 交易总额” ===== */
    function renderTop20Panel(list){
      const box = document.getElementById('chart-comp-top20');
      if(!box) return;
    
      // 如果这个容器之前被 ECharts 使用过，先释放，避免覆盖
      const old = echarts.getInstanceByDom(box);
      if(old) old.dispose();
    
      // 允许传空使用外部占位
      list = Array.isArray(list) ? list : (window.__top20List || []);
      const total = list.reduce((s,x)=>s + (Number(x.amount)||0), 0);
    
      box.innerHTML = `
        <div class="top20-card">
          <div class="top20-head">
            <div>
              <span class="top20-title">Top20 交易总额</span>
              <span class="top20-sub">占比可替换为真实值</span>
            </div>
            <div class="top20-total">${fmtCNY(total)}</div>
          </div>
    
          <div class="top20-list">
            ${list.map((row,idx)=>`
              <div class="top20-row">
                <div class="rank-badge ${idx===0?'top1':idx===1?'top2':idx===2?'top3':''}">${idx+1}</div>
                <div class="cp-name" title="${row.name}">${row.name}</div>
                <div class="cp-amt">${fmtCNY(row.amount)}</div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }
    
    /* ===== Tab 切换 ===== */
    document.getElementById('compTabs')?.addEventListener('click',e=>{
      const tab=e.target.closest('.tab'); if(!tab) return;
      document.querySelectorAll('#compTabs .tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      renderCompCharts(tab.dataset.mode); // total | in | out
    });
    
    /* ===== 初始化 ===== */
    renderCompCats();
    renderCompCharts('total');


    
    /* =============== 你原有的表格分页与填充（不改动结构） =============== */
    let currentPageDeal=1, currentPageCorp=1, currentRoutinePage=1;
    const pageSize=10;
    let bizFilteredList = companies.slice(); // 经营实质区域当前筛选结果
    
    function paginate(arr,page){return arr.slice((page-1)*pageSize,page*pageSize);}
    function renderPagination(eleId,total,current,handler){
      const pages=Math.max(1,Math.ceil(total/pageSize));
      let html='';
      for(let i=1;i<=pages;i++){
        html+=`<button class="btn ${i===current?'btn-primary':''}" onclick="${handler}(${i})">${i}</button>`;
      }
      document.getElementById(eleId).innerHTML=html;
    }
    
    function toggleSb(li){
      li.classList.toggle('open');
      const submenu = li.querySelector('.sb-submenu');
      if (submenu) submenu.classList.toggle('show');
    }
    
    /* 两张表 */
    function fillBizTables(list=bizFilteredList){
      const totalSum = list.reduce((s,x)=>s+x.total,0)||1;
    
      // 交易明细
      const dealPage=paginate(list,currentPageDeal);
      document.querySelector('#tblDeal tbody').innerHTML = dealPage.map(r=>`
        <tr>
          <td>${r.name}</td>
          <td>${r.ctype}</td><td>${r.relation}</td>
          <td>${r.blacklist}</td>
          <td style="color:#2563eb">${fmtWan(r.inflow)}</td>
          <td style="color:#ef4444">${fmtWan(r.outflow)}</td>
          <td><b>${fmtWan(r.total)}</b></td>
          <td>${(r.total/totalSum*100).toFixed(2)}%</td>
          <td>${r.txCnt}</td>
          <td>${r.sales}</td><td>${r.purchase}</td><td>${r.job}</td>
          <td>${r.note}</td>
          <td><button class="btn">查看详情</button></td>
        </tr>`).join('');
      renderPagination('pagination-deal',list.length,currentPageDeal,'gotoDeal');
    
      // 工商信息
      const corpPage=paginate(list,currentPageCorp);
      document.querySelector('#tblCorp tbody').innerHTML = corpPage.map(r=>`
        <tr>
          <td>${r.name}</td><td><b>${fmtWan(r.total)}</b></td>
          <td>${r.foundedDate}</td><td>${r.startDate}</td><td>${r.endDate}</td>
          <td>${r.term}</td><td>${r.status}</td><td>${r.capital}</td>
          <td>${r.industry}</td><td>${r.scope}</td><td>${r.addr}</td>
          <td>${r.contact}</td><td>${r.directors}</td>
        </tr>`).join('');
      renderPagination('pagination-corp',list.length,currentPageCorp,'gotoCorp');
    }
    function gotoDeal(p){currentPageDeal=p;fillBizTables()}
    function gotoCorp(p){currentPageCorp=p;fillBizTables()}
    
    // ================== 刷新后记忆：顶层 Tab & 子表 Tab ==================
    /* ================== 刷新记忆的 key ================== */
    const STORAGE_KEYS = {
      topTab:  'topTab.active',   // 顶部：account/biz/...
      listTab: 'biz.listTab'      // 子表：deal/corp
    };
    
    /* ================== 惰性渲染开关 ================== */
    let __dealInited = false;
    let __corpInited = false;
    
    /* 若外部已准备好 companies / bizFilteredList，则复用 */
    window.bizFilteredList = window.bizFilteredList || (window.companies ? companies.slice() : []);
    
    /* ================== 渲染函数（复用你自己的） ================== */
    function renderDealOnce(){
      if (__dealInited) return;
      __dealInited = true;
      if (typeof fillBizTables === 'function') fillBizTables();
    }
    function renderCorpOnce(){
      if (__corpInited) return;
      __corpInited = true;
      if (typeof fillBizTables === 'function') fillBizTables();
    }
    
    /* ================== inkbar 同步（可选） ================== */
    function updateInkbar(){
      const bar  = document.getElementById('inkbar');
      const tabs = document.getElementById('topTabs');
      if (!bar || !tabs) return;
      const act = tabs.querySelector('.tab.active');
      if (!act) return;
      const rb = tabs.getBoundingClientRect();
      const ra = act.getBoundingClientRect();
      bar.style.left  = (ra.left - rb.left + tabs.scrollLeft) + 'px';
      bar.style.width = ra.width + 'px';
    }
    
    /* ================== 子表切换（统一入口） ================== */
    function switchSubTable(view){ // 'deal' | 'corp'
      const showDeal = view === 'deal';
      const dealWrap = document.getElementById('tbl-deal-wrap');
      const corpWrap = document.getElementById('tbl-corp-wrap');
    
      dealWrap?.classList.toggle('hide', !showDeal);
      corpWrap?.classList.toggle('hide',  showDeal);
    
      // 记忆当前子表
      sessionStorage.setItem(STORAGE_KEYS.listTab, view);
    
      // 惰性渲染一次（不重置筛选）
      if (showDeal) renderDealOnce(); else renderCorpOnce();
    
      // 同步老 tabs（#listTabs）
      const listTabs = document.getElementById('listTabs');
      if (listTabs){
        listTabs.querySelectorAll('.table-tab').forEach(x=>{
          x.classList.toggle('active', x.dataset.view === view);
        });
      }
    
      // 同步新切换条（#tblSwitcher）
      const switcher = document.getElementById('tblSwitcher');
      if (switcher){
        switcher.querySelectorAll('.opt').forEach(x=>{
          const on = x.dataset.view === view;
          x.classList.toggle('active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
      }
    
      // 表格可能需要重算列宽
      setTimeout(()=>window.dispatchEvent(new Event('resize')), 0);
    }
    
    /* ================== 经营实质页显示：按记忆恢复子表并立即渲染 ================== */
    function onBizPageShown(){
      const saved = sessionStorage.getItem(STORAGE_KEYS.listTab);
      switchSubTable(saved === 'corp' ? 'corp' : 'deal');  // 默认 deal
    }
    
    /* ================== 旧的顶部子表 Tab（保留兼容） ================== */
    (function initListTabs(){
      const listTabs = document.getElementById('listTabs');
      if (!listTabs) return;
      listTabs.addEventListener('click', e=>{
        const tab = e.target.closest('.table-tab'); if(!tab) return;
        switchSubTable(tab.dataset.view === 'corp' ? 'corp' : 'deal');
      });
    })();
    
    /* ================== 新的右侧“左右切换条”（保留兼容） ================== */
    (function initSwitcher(){
      const wrap = document.getElementById('tblSwitcher');
      if (!wrap) return;
      wrap.addEventListener('click', e=>{
        const btn = e.target.closest('.opt'); if(!btn) return;
    
        // 如需切换时重置筛选，放开下面两行；否则保持当前筛选状态
        // const sel = document.getElementById('fType'); if (sel) sel.selectedIndex = 0;
        // window.bizFilteredList = (window.companies || []).slice();
    
        // 你若希望切换时强制刷新，也可保留这句（可删）
        if (typeof window.fillBizTables === 'function') window.fillBizTables();
    
        switchSubTable(btn.dataset.view === 'corp' ? 'corp' : 'deal');
      });
    })();
    
    /* ================== 顶部页面切换（带记忆 + 首次恢复） ================== */
    (function initTopTabs(){
      const topTabs = document.getElementById('topTabs');
      if (!topTabs) return;
    
      function showPane(key){
      // 约定：tab 页的 id 统一是 pane-xxx，和 data-top="xxx" 对应
      document.querySelectorAll('.tab-pane').forEach(pane => {
        const paneKey = pane.id.replace(/^pane-/, ''); // 例如 pane-account -> account
        pane.classList.toggle('hide', paneKey !== key);
      });
}
    
      function activateTopTab(key){
        const target = topTabs.querySelector(`.tab[data-top="${key}"]`);
        if (!target) return;
    
        // 外观激活
        topTabs.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
        target.classList.add('active');
    
        // 显隐 pane
        showPane(key);

        // ✅ 自定义显示筛选条
        const FILTER_PAGES = ['biz', 'relation','personal—transaction'];

        if (bizFilterBar) {
          bizFilterBar.classList.toggle('hide', !FILTER_PAGES.includes(key));
        }


    
        // 记忆顶层 tab & inkbar
        sessionStorage.setItem(STORAGE_KEYS.topTab, key);
        updateInkbar();
    
        // 进入经营实质时，立刻恢复子表并渲染
        if (key === 'biz') onBizPageShown();
      }
    
      // 点击切换
      topTabs.addEventListener('click', e=>{
        const t = e.target.closest('.tab'); if(!t) return;
        const key = t.dataset.top; if(!key) return;
        activateTopTab(key);
      });
    
      // ✅ 首次恢复（刷新后关键一步）
      const savedKey  = sessionStorage.getItem(STORAGE_KEYS.topTab);
      const domActive = topTabs.querySelector('.tab.active');
      const initialKey = savedKey || domActive?.dataset.top || 'biz';
      activateTopTab(initialKey);
    
      // 初次布局后同步一次 inkbar
      setTimeout(updateInkbar, 0);
    })();
    
    /* ================== 窗口尺寸变化时同步 inkbar ================== */
    window.addEventListener('resize', updateInkbar);
    
    /* ================== 六个操作按钮：占位监听（替换为真实逻辑即可） ================== */
    document.getElementById('btnQuick')  ?.addEventListener('click', ()=>console.log('快速查看勾选结果'));
    document.getElementById('btnReset')  ?.addEventListener('click', ()=>console.log('重置筛选'));
    document.getElementById('btnHead')   ?.addEventListener('click', ()=>console.log('自定义表头'));
    document.getElementById('btnDist')   ?.addEventListener('click', ()=>console.log('流入流出分布'));
    document.getElementById('btnAnalyze')?.addEventListener('click', ()=>console.log('生成分析结果'));
    document.getElementById('btnFlow')   ?.addEventListener('click', ()=>console.log('生成流水'));
    
    
    /* 年度/类型筛选联动 */
    document.getElementById('yearBalance')?.addEventListener('change',renderBalance);
    document.getElementById('yearIO')?.addEventListener('change',renderIO);
    document.getElementById('ctypeIO')?.addEventListener('change',renderIO);
    
    /* 首次渲染 */
    renderBalance();
    renderIO();
    renderCompCats();
    renderCompCharts();
    fillBizTables

    // —— 造假数量：如果你有真实统计，这里替换即可 —— //
    function updateFraudCount(n){
      var el = document.getElementById('fraudCount');
      if (el) el.textContent = Number(n||0);
    }
    // 首次给个默认值（0）；你实际渲染完列表后可再次调用更新
    updateFraudCount(0);
    
    // —— 点击“第三方配合造假名单.xlsx”：你可以改成实际下载/预览逻辑 —— //
    document.getElementById('fraudListFile')?.addEventListener('click', ()=>{
      // TODO: 换成真实行为（例如打开链接/调用下载接口）
      // window.open('/files/第三方配合造假名单.xlsx', '_blank');
      console.log('打开：第三方配合造假名单.xlsx');
    });
    
    // —— 如果切换“交易明细/工商信息”或筛选后需要更新数量，调用 updateFraudCount(x) 即可 —— //
    // 例如：在 fillBizTables() 末尾： updateFraudCount(calculatedCount);
