/* =============== 工具 =============== */

  function auditPagerRange(page, pages){
    const current = Math.max(1, Math.min(Number(page) || 1, Math.max(1, pages)));
    const total = Math.max(1, Number(pages) || 1);
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const out = [1];
    let start = Math.max(2, current - 2);
    let end = Math.min(total - 1, current + 2);
    if (current <= 4) { start = 2; end = 6; }
    if (current >= total - 3) { start = total - 5; end = total - 1; }
    if (start > 2) out.push('ellipsis-start');
    for (let i = start; i <= end; i++) out.push(i);
    if (end < total - 1) out.push('ellipsis-end');
    out.push(total);
    return out;
  }

  function renderAuditPager(el, opts){
    if (!el) return;
    const total = Number(opts.total) || 0;
    const pageSize = Number(opts.pageSize) || 20;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.max(1, Math.min(Number(opts.page) || 1, pages));
    const sizes = opts.sizes || [10,20,30,40,50];
    const pageItems = auditPagerRange(page, pages).map(item => {
      if (typeof item === 'string') return '<span class="audit-pager-ellipsis">...</span>';
      return `<button class="audit-pager-btn ${item === page ? 'is-active' : ''}" type="button" data-page="${item}">${item}</button>`;
    }).join('');
    el.classList.add('audit-pager');
    el.innerHTML = `
      <span class="audit-pager-total">共 ${total.toLocaleString('zh-CN')} 条</span>
      <button class="audit-pager-btn audit-pager-arrow" type="button" data-page="prev" ${page <= 1 ? 'disabled' : ''}>‹</button>
      ${pageItems}
      <button class="audit-pager-btn audit-pager-arrow" type="button" data-page="next" ${page >= pages ? 'disabled' : ''}>›</button>
      <label class="audit-pager-size"><select data-page-size>${sizes.map(n => `<option value="${n}" ${n === pageSize ? 'selected' : ''}>${n} 条/页</option>`).join('')}</select></label>
      <span class="audit-pager-jump-label">跳至</span>
      <input class="audit-pager-jump" type="number" min="1" max="${pages}" inputmode="numeric" data-page-jump>
      <span class="audit-pager-jump-label">页</span>
    `;
    el.querySelectorAll('[data-page]').forEach(btn => btn.addEventListener('click', () => {
      let next = page;
      if (btn.dataset.page === 'prev') next = page - 1;
      else if (btn.dataset.page === 'next') next = page + 1;
      else next = Number(btn.dataset.page) || page;
      opts.onPage?.(Math.max(1, Math.min(next, pages)));
    }));
    el.querySelector('[data-page-size]')?.addEventListener('change', e => opts.onPageSize?.(Number(e.target.value) || 20));
    const jump = el.querySelector('[data-page-jump]');
    jump?.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const next = Math.max(1, Math.min(Number(jump.value) || page, pages));
      opts.onPage?.(next);
    });
    jump?.addEventListener('change', () => {
      if (!jump.value) return;
      const next = Math.max(1, Math.min(Number(jump.value) || page, pages));
      opts.onPage?.(next);
    });
  }

  window.renderAuditPager = window.renderAuditPager || renderAuditPager;

  function ez(id,opt){const c=echarts.init(document.getElementById(id));c.setOption(opt);window.addEventListener('resize',()=>c.resize());return c;}
  function fmtWan(v){return (Math.round(v*10)/10).toLocaleString()}
  function randPick(arr){return arr[Math.floor(Math.random()*arr.length)]}

  /* =============== 造更真实的数据（本地随机） =============== */
  const companyPrefixes = ['上海','北京','深圳','杭州','广州','南京','成都','武汉','苏州','天津','重庆','合肥','西安'];
  const companyMains = ['恒信','弘业','中科','联创','佳成','宏泰','远景','蓝海','星宇','新锐','鼎盛','博纳','启航','微联','科迈','瑞博','瑞声','正泰','中智','普华','德勤','志成','航天','华科','长江','凌云'];
  const companySuffixes = ['科技有限公司','信息技术有限公司','实业有限公司','供应链管理有限公司','电子商务有限公司','商业管理有限公司','贸易有限公司','生物科技有限公司','智能科技有限公司','数据科技有限公司','医药有限公司','网络科技有限公司'];
  const funcs = ['总部','研发','销售','采购','生产','财务','人力','市场','客服','法务'];
  const banks = ['工行','建行','农行','中行','招行','交行','浦发','兴业','民生','中信'];
  const legals = ['张伟','王磊','李静','刘洋','陈杰','杨敏','赵强','黄芳','周颖','吴磊','郑凯','孙婷','朱敏','胡涛','郭强','何军','高磊','罗敏','梁杰','宋伟'];
  const rels = ['客户','供应商','员工','其他'];

  const N = 220; // 更多数据
  const companies = Array.from({length:N},(_,i)=>{
    const foundedDays = Math.floor(Math.random()*3650)+60; // 2个月~10年
    const employees = Math.floor(Math.random()*150);
    const inflow = +(Math.random()*1500+30).toFixed(1);   // 万
    const outflow= +(Math.random()*1300+20).toFixed(1);   // 万
    const txCnt  = Math.floor(Math.random()*120)+2;
    const total  = +(inflow+outflow).toFixed(1);
    const recognized = Math.random()>0.3;
    const date = new Date(Date.now()-foundedDays*86400000);
    const dstr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const name = `${randPick(companyPrefixes)}${randPick(companyMains)}${randPick(companySuffixes)}`
    return {
      id:i+1,
      name,
      inflow, outflow, total, txCnt,
      rel: randPick(rels),
      bank: randPick(banks),
      recognized,
      foundedDays, foundedDate:dstr,
      capital: Math.floor(Math.random()*10000)+100, // 万
      legal: randPick(legals),
      status: Math.random()>0.08 ? '存续' : (Math.random()>0.5 ? '在业' : '注销'),
      lawsuits: Math.floor(Math.random()*8),
      dishonesty: Math.floor(Math.random()*4),
      employees,
      type: (Math.random()>0.72 ? (Math.random()>0.5?'个人':'个体工商户') : '公司'),

      // 新增字段
      blacklist: Math.random()>0.8 ? '是' : '否',
      ctype: ['客户','供应商','员工'][i%3],
      relation: ['母子公司','同股东','上下游'][i%3],
      sales: ['原料','成品','服务'][i%3],
      purchase: ['原料','成品','服务'][2-i%3],
      job: ['总经理','财务','员工'][i%3],
      note: '备注' + (i+1),
      startDate: '2019-01-01',
      endDate: '2029-12-31',
      term: '20年',
      industry: ['制造业','服务业','零售业'][i%3],
      scope: '主营业务范围描述',
      addr: '某市某区某路',
      contact: '010-88888888',
      directors: '张三/李四/王五'
    }
  });

    /* =============== 顶部筛选下拉：外置并填充选项 =============== */
    const auditedCompanies = [
      '华东制造集团有限公司','上海星河科技有限公司','深圳启明电子有限公司','广州远航贸易有限公司','苏州精密制造有限公司','华南物流服务有限公司'
    ];
    const bankAccountOptions = ['全部','工行上海分行 1001***0821','建行上海分行 1002***4186','招行上海分行 2001***7739','平安深圳分行 3001***6290','中行深圳分行 3002***9052','广发广州分行 4001***1578','农行苏州分行 5001***6426','浦发广州分行 6001***3385'];
    function initFilters(){
      const fCompany=document.getElementById('fCompany');
      const fBank=document.getElementById('fBank');
      if (fCompany) fCompany.innerHTML = ['<option value="all">全部</option>',...auditedCompanies.map(x=>`<option>${x}</option>`)].join('');
      if (fBank) fBank.innerHTML = bankAccountOptions.map(x=>`<option>${x}</option>`).join('');
    }
    initFilters();

    // 顶部 tab 切换
    const TAB_INTROS = {
      account:"本页展示资金余额变动趋势和原资金总览，帮助用户了解银行账户规模、月度流入流出及流水校验情况。",
      verify:"本页集中展示缺失同名账户、总账核对和分账号核对，帮助用户完成银行流水完整性测试。",
      biz:"本页从余额、流入流出趋势、交易结构及对手方结构等维度展示流水画像，页面金额统一折算为人民币。",
      relation:"本页展示和分析：(1)关联方主档中的对手方，和(2)于“经营实质>流入流出构成”中手工标记为关联方的对手方的交易，旨在帮助用户全面了解被审计单位与关联方的资金往来，协助用户进行关联方披露。如用户暂未上传关联方主档或未手工打标，则本页展示内容为空。",
      "personal—transaction":"本页展示员工及其他个人对手方交易，支持查看个人交易规模、频次和明细。",
      transaction:"本页汇总高风险资金流水核查程序及识别结果，支持进一步查看和形成核查底稿。",
      workingpaper:"本页保留资金流水核查底稿导出相关的准确性测试和核查标准清单，支持导出底稿。",
      routine:"聚合工商信息并与交易规模联动校验企业真实性与风险。",
      statement:"用户可对本页的多维筛选器设置筛选条件，系统将在已上传并执行分析的银行流水中选出符合筛选条件的异常交易流水，并支持流水导出，旨在帮助用户根据项目需求，全面、快速、精准地筛选出异常银行流水，协助用户进一步执行审计程序。",
    };

    function setTabIntro(key){
      const el = document.getElementById('tabIntro');
      if(!el) return;
      el.innerHTML = '';
    }

    function moveInkbar(activeEl){
      const bar  = document.getElementById('inkbar');
      const wrap = document.getElementById('topTabs'); // 滚动容器
      if(!bar || !wrap || !activeEl) return;
    
      const rWrap = wrap.getBoundingClientRect();
      const rTab  = activeEl.getBoundingClientRect();
    
      const left = (rTab.left - rWrap.left) + wrap.scrollLeft;
      bar.style.left  = left + 'px';
      bar.style.width = rTab.width + 'px';
    }
    
    const TAB_KEY = 'topTabs.active';

    function showTabPane(key){
      const pane = document.getElementById('pane-'+key);
      if (!pane) return false;

      document.querySelectorAll('.tab-pane').forEach(p=>{
        p.classList.add('hide');
        p.classList.remove('active');
      });

      pane.classList.remove('hide');
      pane.classList.add('active');
      return true;
    }

    function activateTopTab(tab){
      if (!tab) return;
      if (!document.getElementById('pane-'+tab.dataset.top)) {
        tab = document.querySelector('#topTabs .tab[data-top="account"]')
          || document.querySelector('#topTabs .tab');
      }

      document.querySelectorAll('#topTabs .tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');

      const key = tab.dataset.top;
      showTabPane(key);

      setTabIntro(key);
      localStorage.setItem(TAB_KEY, key);

      // 下一帧再计算，避免布局还未完成
      requestAnimationFrame(()=>moveInkbar(tab));
      setTimeout(()=>window.dispatchEvent(new Event('resize')),50);
      window.dispatchEvent(new Event('bank-analysis:tab-change'));
      if (key === 'account') setTimeout(()=>{
        window.bankAccountBalanceChart?.resize();
        window.bankAccountIoChart?.resize();
      }, 60);
    }

    // 绑定顶部 Tab：切页面、刷新后保持当前页、同步说明条与底线
    function bindTabs(){
      document.querySelectorAll('#topTabs .tab').forEach(tab=>{
        tab.addEventListener('click', ()=>{
          activateTopTab(tab);
        });
      });
    
      // 横向滚动时也要更新 inkbar
      const wrap = document.getElementById('topTabs');
      wrap?.addEventListener('scroll', ()=>{
        const active = document.querySelector('#topTabs .tab.active');
        if(active) moveInkbar(active);
      }, { passive:true });
    }
    
    document.addEventListener('DOMContentLoaded', ()=>{
      document.getElementById('pane-biz-legacy')?.remove();
      document.getElementById('pane-transaction-legacy')?.remove();
      document.querySelector('#pane-transaction .risk-page[hidden]')?.remove();
      const missingCard = document.getElementById('missingSameNameCard');
      const verifyScroll = document.querySelector('#pane-verify .tab-scroll');
      if (missingCard && verifyScroll) verifyScroll.prepend(missingCard);

      document.querySelectorAll('.monthly-flow-bars').forEach((wrap, rowIndex)=>{
        const inflow = [72,58,84,65,91,77,69,88,74,96,82,90];
        const outflow = [54,68,61,79,63,72,86,67,81,70,92,76];
        wrap.innerHTML = inflow.map((value, month)=>`
          <span class="monthly-flow-pair" title="${month + 1}月 流入 ${value + rowIndex * 3} / 流出 ${outflow[month]}">
            <i class="flow-in-bar" style="height:${value}%"></i>
            <i class="flow-out-bar" style="height:${outflow[month]}%"></i>
          </span>`).join('');
      });

      const statementBody = document.getElementById('statementFlowBody');
      if (statementBody) {
        const statementCounterparties = ['廊坊中晟包装有限公司','郑州华辰电气有限公司','天津远泽汽车零部件有限公司','重庆云峰智能装备有限公司','绍兴恒越纺织材料有限公司','昆明启明商贸有限公司','贵阳恒通运输有限公司','上海凌云工业控制有限公司','昆山精达模具有限公司','厦门瀚宇信息服务有限公司','石家庄北辰机电有限公司','北京恒瑞医疗设备有限公司','南京海纳精密科技有限公司','长沙万通食品有限公司','青岛立新橡塑有限公司','宁波嘉源能源有限公司','成都瑞科生物科技有限公司','合肥正元电子有限公司','武汉天成自动化有限公司','南昌锦程供应链有限公司'];
        const accounts = ['1001***0821','1002***4186','2001***7739','3001***6290','3002***9052','4001***1578','5001***6426','6001***3385'];
        statementBody.innerHTML = statementCounterparties.map((cp,index)=>{
          const isIn = index % 2 === 0;
          const amount = (4860000 + index * 173000).toLocaleString('zh-CN');
          const year = 2025 - (index % 3);
          const month = String(12 - (index % 12)).padStart(2,'0');
          const day = String(26 - (index % 20)).padStart(2,'0');
          return `<tr><td>${year}-${month}-${day}</td><td>${auditedCompanies[index % auditedCompanies.length]}</td><td>${accounts[index % accounts.length]}</td><td>${cp}</td><td>${isIn?'流入':'流出'}</td><td style="color:${isIn?'var(--flow-in)':'var(--flow-out)'}">${amount}</td><td>${isIn?'销售回款':'采购/服务付款'}</td><td>RMB</td><td><input class="ba-note-input" value="三年银行流水样例"/></td><td class="actions"><a href="javascript:void(0)">查看明细</a></td></tr>`;
        }).join('');
      }

      const checkWindows = [...document.querySelectorAll('#tblAccountSummary .check-window')];
      let syncingCheckWindows = false;
      checkWindows.forEach(windowEl=>windowEl.addEventListener('scroll', ()=>{
        if (syncingCheckWindows) return;
        syncingCheckWindows = true;
        checkWindows.forEach(other=>{ if (other !== windowEl) other.scrollLeft = windowEl.scrollLeft; });
        requestAnimationFrame(()=>{ syncingCheckWindows = false; });
      }, { passive:true }));
      let checkWheelTarget = 0;
      let checkWheelFrame = 0;
      const animateCheckScroll = ()=>{
        const source = checkWindows[0];
        if (!source) return;
        const max = Math.max(0,source.scrollWidth-source.clientWidth);
        checkWheelTarget = Math.max(0,Math.min(max,checkWheelTarget));
        const next = source.scrollLeft + (checkWheelTarget-source.scrollLeft)*.34;
        checkWindows.forEach(windowEl=>{ windowEl.scrollLeft = next; });
        if (Math.abs(checkWheelTarget-next) > .5) {
          checkWheelFrame = requestAnimationFrame(animateCheckScroll);
        } else {
          checkWindows.forEach(windowEl=>{ windowEl.scrollLeft = checkWheelTarget; });
          checkWheelFrame = 0;
        }
      };
      checkWindows.forEach(windowEl=>windowEl.addEventListener('wheel', event=>{
        event.preventDefault();
        const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
        let delta = horizontal ? event.deltaX : event.deltaY;
        if (event.deltaMode === 1) delta *= 16;
        if (event.deltaMode === 2) delta *= windowEl.clientWidth;
        const source = checkWindows[0];
        if (!checkWheelFrame) checkWheelTarget = source?.scrollLeft || 0;
        checkWheelTarget += delta * (horizontal ? 2.4 : 1.8);
        if (!checkWheelFrame) checkWheelFrame = requestAnimationFrame(animateCheckScroll);
      }, { passive:false }));

      checkWindows.forEach(windowEl=>{
        let dragging = false;
        let startX = 0;
        let startScroll = 0;
        windowEl.addEventListener('pointerdown', event=>{
          dragging = true;
          startX = event.clientX;
          startScroll = windowEl.scrollLeft;
          windowEl.classList.add('is-dragging');
          windowEl.setPointerCapture?.(event.pointerId);
        });
        windowEl.addEventListener('pointermove', event=>{
          if (!dragging) return;
          event.preventDefault();
          windowEl.scrollLeft = startScroll - (event.clientX - startX)*1.25;
        });
        const stopDragging = event=>{
          if (!dragging) return;
          dragging = false;
          windowEl.classList.remove('is-dragging');
          windowEl.releasePointerCapture?.(event.pointerId);
        };
        windowEl.addEventListener('pointerup', stopDragging);
        windowEl.addEventListener('pointercancel', stopDragging);
      });

      const scrollChecks = amount=>{
        const source = checkWindows[0];
        if (!source) return;
        checkWheelTarget = Math.max(0,Math.min(source.scrollWidth-source.clientWidth,source.scrollLeft+amount));
        if (!checkWheelFrame) checkWheelFrame = requestAnimationFrame(animateCheckScroll);
      };
      document.getElementById('checkScrollPrev')?.addEventListener('click',()=>scrollChecks(-220));
      document.getElementById('checkScrollNext')?.addEventListener('click',()=>scrollChecks(220));

      const trendDailyDates = [];
      for (let cursor = new Date(2023, 0, 1); cursor <= new Date(2025, 11, 31); cursor.setDate(cursor.getDate() + 1)) {
        const year = cursor.getFullYear();
        const month = String(cursor.getMonth() + 1).padStart(2, '0');
        const day = String(cursor.getDate()).padStart(2, '0');
        trendDailyDates.push(`${year}-${month}-${day}`);
      }
      const buildDailyCashModel = dates => {
        const rawInflow = [];
        const rawOutflow = [];
        dates.forEach((date, index) => {
          const current = new Date(`${date}T00:00:00`);
          const weekday = current.getDay();
          const day = current.getDate();
          const month = current.getMonth() + 1;
          const isBusinessDay = weekday >= 1 && weekday <= 5;
          const inflowSeed = (index * 37 + month * 17 + day * 11) % 100;
          const outflowSeed = (index * 29 + month * 23 + day * 7) % 100;
          const rareWeekendReceipt = !isBusinessDay && (index + month * 5) % 83 === 0;
          const rareWeekendPayment = !isBusinessDay && (index + day * 3) % 109 === 0;
          const hasInflow = (isBusinessDay && inflowSeed < 43) || rareWeekendReceipt;
          const hasOutflow = (isBusinessDay && outflowSeed < 48) || rareWeekendPayment;
          const monthEndFactor = day >= 25 ? 1.28 : 1;
          const quarterEndFactor = day >= 25 && month % 3 === 0 ? 1.34 : 1;
          rawInflow.push(hasInflow ? Math.round((720 + ((index * 53) % 2380)) * monthEndFactor) : 0);
          rawOutflow.push(hasOutflow ? Math.round((640 + ((index * 47 + 310) % 2140)) * quarterEndFactor) : 0);
        });

        const scaleToTotal = (values, target) => {
          const currentTotal = values.reduce((sum, value) => sum + value, 0) || 1;
          const scaled = values.map(value => value ? Math.round(value * target / currentTotal) : 0);
          const adjustmentIndex = scaled.findLastIndex(value => value > 0);
          const difference = target - scaled.reduce((sum, value) => sum + value, 0);
          if (adjustmentIndex >= 0) scaled[adjustmentIndex] += difference;
          return scaled;
        };

        const inflow = scaleToTotal(rawInflow, 790259);
        const outflow = scaleToTotal(rawOutflow, 725311);
        let cumulative = 0;
        let minimumCumulative = 0;
        inflow.forEach((value, index) => {
          cumulative += value - outflow[index];
          minimumCumulative = Math.min(minimumCumulative, cumulative);
        });
        const openingBalance = Math.max(24000, 28000 - minimumCumulative);
        cumulative = 0;
        const balance = inflow.map((value, index) => {
          cumulative += value - outflow[index];
          return openingBalance + cumulative;
        });
        return { inflow, outflow, balance, openingBalance };
      };
      const dailyCashModel = buildDailyCashModel(trendDailyDates);
      const getTrendRangeView = range => {
        const rangeYears = String(range).split('-').map(Number);
        const startYear = rangeYears[0];
        const endYear = rangeYears[1] || startYear;
        const indexes = [];
        trendDailyDates.forEach((date,index) => {
          const year = Number(date.slice(0,4));
          if (year >= startYear && year <= endYear) indexes.push(index);
        });
        const dates = indexes.map(index => trendDailyDates[index]);
        return {
          dates,
          balance:indexes.map(index => dailyCashModel.balance[index]),
          inflow:indexes.map(index => dailyCashModel.inflow[index]),
          outflow:indexes.map(index => dailyCashModel.outflow[index]),
          zoomStart:0
        };
      };
      let activeTrendView = getTrendRangeView('2023-2025');
      const trendUnitLabel = () => window.AuditUnit?.ready ? window.AuditUnit.label : '千元';
      const formatTrendNumber = value => {
        const decimals = window.AuditUnit?.ready ? window.AuditUnit.decimals : 0;
        return Number(value || 0).toLocaleString('zh-CN', {
          minimumFractionDigits:decimals,
          maximumFractionDigits:decimals
        });
      };
      const formatTrendTooltip = params => {
        const rows = Array.isArray(params) ? params : [params];
        const date = rows[0]?.axisValue || '';
        const values = rows.map(item => `${item.marker || ''}${item.seriesName}：<b>${formatTrendNumber(item.value)}</b>`).join('<br>');
        return `<div style="min-width:142px"><b>${date}</b><div style="height:5px"></div>${values}<div style="margin-top:4px;color:#64748b">单位：${trendUnitLabel()}</div></div>`;
      };
      const trendAxisPointer = {
        type:'line',
        snap:true,
        lineStyle:{color:'#94a3b8',width:1,type:'dashed'}
      };

      const balanceEl = document.getElementById('chart-account-balance');
      if (balanceEl && window.echarts) {
        const chart = echarts.init(balanceEl);
        const balanceLineColor = '#4f86ae';
        const balanceData = activeTrendView.balance;
        chart.setOption({
          animationDuration: 450,
          color: [balanceLineColor],
          tooltip: { trigger:'axis', axisPointer:trendAxisPointer, confine:true, formatter:formatTrendTooltip },
          title:{ text:`账户余额（${trendUnitLabel()}）`, left:10, top:0, textStyle:{color:'#334155',fontSize:11,fontWeight:700} },
          graphic: [{
            type:'group',
            right:16,
            top:6,
            z:20,
            children:[
              { type:'circle', shape:{cx:5,cy:8,r:4}, style:{fill:balanceLineColor} },
              { type:'text', left:15, top:0, style:{text:'账户余额', fill:'#64748b', fontSize:11, fontWeight:600} }
            ]
          }],
          grid: { left:62, right:18, top:30, bottom:46, containLabel:false },
          xAxis: { type:'category', boundaryGap:false, data:activeTrendView.dates, axisLine:{lineStyle:{color:'#cbd5e1'}}, axisLabel:{color:'#64748b',fontSize:9,hideOverlap:true,margin:8,formatter:value=>value.slice(5)} },
          yAxis: { type:'value', min:0, splitLine:{lineStyle:{color:'#eef2f7'}}, axisLabel:{color:'#64748b',fontSize:10,formatter:formatTrendNumber} },
          dataZoom: [{ type:'inside', start:activeTrendView.zoomStart, end:100 }, { type:'slider', start:activeTrendView.zoomStart, end:100, height:10, bottom:4, borderColor:'transparent', backgroundColor:'#eef2f7', fillerColor:'rgba(79,134,174,.18)', handleSize:0, showDetail:false }],
          series: [{
            name:'账户余额', type:'line', smooth:false, connectNulls:false,
            showSymbol:false, showAllSymbol:false, symbol:'circle', symbolSize:6,
            itemStyle:{color:balanceLineColor,borderColor:'#fff',borderWidth:1.5},
            lineStyle:{width:2.1,color:balanceLineColor,opacity:.94,cap:'round',join:'round',shadowColor:'rgba(79,134,174,.16)',shadowBlur:3},
            emphasis:{focus:'series',scale:1.25,itemStyle:{borderColor:'#fff',borderWidth:2}},
            data:balanceData
          }]
        });
        window.bankAccountBalanceChart = chart;
      }

      const accountIoEl = document.getElementById('chart-account-io');
      if (accountIoEl && window.echarts) {
        const chart = echarts.init(accountIoEl);
        const inflowData = activeTrendView.inflow;
        const outflowData = activeTrendView.outflow;
        chart.setOption({
          animationDuration: 450,
          color: ['#3b82f6', '#d95785'],
          title:{ text:`流入 / 流出（${trendUnitLabel()}）`, left:10, top:0, textStyle:{color:'#334155',fontSize:11,fontWeight:700} },
          tooltip: { trigger:'axis', axisPointer:trendAxisPointer, confine:true, formatter:formatTrendTooltip },
          legend: {
            right: 8,
            top: 0,
            itemWidth: 10,
            itemHeight: 6,
            textStyle: { color: '#475569', fontSize: 10 }
          },
          grid: { left: 62, right: 18, top: 30, bottom: 46, containLabel: false },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: activeTrendView.dates,
            axisLine: { lineStyle: { color: '#cbd5e1' } },
            axisLabel: { color:'#64748b', fontSize:9, hideOverlap:true, margin:8, formatter:value=>value.slice(5) }
          },
          yAxis: {
            type: 'value',
            min: 0,
            splitLine: { lineStyle: { color: '#eef2f7' } },
            axisLabel: { color: '#64748b', fontSize: 10, formatter: formatTrendNumber }
          },
          dataZoom: [
            { type:'inside', start:activeTrendView.zoomStart, end:100 },
            { type:'slider', start:activeTrendView.zoomStart, end:100, height:10, bottom:4, borderColor:'transparent', backgroundColor:'#eef2f7', fillerColor:'rgba(47,111,237,.16)', handleSize:0, showDetail:false }
          ],
          series: [
            {
              name:'流入金额',type:'line',smooth:false,connectNulls:false,
              showSymbol:false,showAllSymbol:false,symbol:'circle',symbolSize:6,
              itemStyle:{color:'#3b82f6',borderColor:'#fff',borderWidth:1.5},
              lineStyle:{width:2.05,color:'#3b82f6',opacity:.92,cap:'round',join:'round',shadowColor:'rgba(59,130,246,.14)',shadowBlur:3},
              emphasis:{focus:'series',scale:1.25,itemStyle:{borderColor:'#fff',borderWidth:2}},
              data:inflowData
            },
            {
              name:'流出金额',type:'line',smooth:false,connectNulls:false,
              showSymbol:false,showAllSymbol:false,symbol:'circle',symbolSize:6,
              itemStyle:{color:'#d95785',borderColor:'#fff',borderWidth:1.5},
              lineStyle:{width:2.05,color:'#d95785',opacity:.92,cap:'round',join:'round',shadowColor:'rgba(217,87,133,.14)',shadowBlur:3},
              emphasis:{focus:'series',scale:1.25,itemStyle:{borderColor:'#fff',borderWidth:2}},
              data:outflowData
            }
          ]
        });
        window.bankAccountIoChart = chart;
        if (window.bankAccountBalanceChart) {
          window.bankAccountBalanceChart.group = 'bank-account-daily-trend';
          chart.group = 'bank-account-daily-trend';
          echarts.connect('bank-account-daily-trend');
        }
      }

      document.getElementById('accountTrendYearSelect')?.addEventListener('change',event => {
        activeTrendView = getTrendRangeView(event.target.value);
        window.bankAccountBalanceChart?.setOption({
          xAxis:{data:activeTrendView.dates},
          dataZoom:[{start:0,end:100},{start:0,end:100}],
          series:[{data:activeTrendView.balance}]
        });
        window.bankAccountIoChart?.setOption({
          xAxis:{data:activeTrendView.dates},
          dataZoom:[{start:0,end:100},{start:0,end:100}],
          series:[{data:activeTrendView.inflow},{data:activeTrendView.outflow}]
        });
      });

      bindTabs();
      const savedKey = localStorage.getItem(TAB_KEY);
      const active = document.querySelector(`#topTabs .tab[data-top="${savedKey}"]`)
        || document.querySelector('#topTabs .tab.active')
        || document.querySelector('#topTabs .tab');
      activateTopTab(active);
    });
    window.addEventListener('resize', ()=>{
      const active = document.querySelector('#topTabs .tab.active');
      if(active) moveInkbar(active);
      window.bankAccountBalanceChart?.resize();
      window.bankAccountIoChart?.resize();
    });

    function initCardCollapse(){
      document.querySelectorAll('.tab-pane .card, .dm-tab-pane .card').forEach((card, idx)=>{
        const head = card.querySelector(':scope > .head');
        if(!head || head.querySelector('.card-fold-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'card-fold-btn';
        btn.type = 'button';
        btn.title = '展开/收起';
        btn.setAttribute('aria-label', '展开或收起卡片');
        btn.setAttribute('aria-expanded', 'true');
        btn.dataset.cardFold = String(idx);

        btn.addEventListener('click', (e)=>{
          e.stopPropagation();
          const collapsed = card.classList.toggle('is-collapsed');
          btn.setAttribute('aria-expanded', String(!collapsed));
          setTimeout(()=>window.dispatchEvent(new Event('resize')), 30);
        });

        head.appendChild(btn);
      });
    }

    document.addEventListener('DOMContentLoaded', initCardCollapse);

    document.addEventListener('DOMContentLoaded', ()=>{
      const issueCard = document.querySelector('.issue-card');
      const issueToggle = issueCard?.querySelector('.issue-toggle');
      if (!issueCard || !issueToggle) return;
      const modal = document.createElement('div');
      modal.className = 'issue-detail-modal';
      modal.innerHTML = `
        <div class="issue-detail-panel" role="dialog" aria-modal="true" aria-label="数据问题详情">
          <div class="issue-detail-head">
            <div class="issue-detail-title">数据问题详情</div>
            <button class="issue-detail-close" type="button" aria-label="关闭">×</button>
          </div>
          <div class="issue-detail-body"></div>
        </div>
      `;
      document.body.appendChild(modal);
      const body = modal.querySelector('.issue-detail-body');
      const close = ()=>modal.classList.remove('is-open');
      modal.querySelector('.issue-detail-close')?.addEventListener('click', close);
      modal.addEventListener('click', event=>{
        if (event.target === modal) close();
      });
      issueToggle.addEventListener('click', event=>{
        event.preventDefault();
        body.innerHTML = issueCard.querySelector('.issue-body-simple')?.innerHTML || '';
        modal.classList.add('is-open');
      });
    });

    document.addEventListener('DOMContentLoaded', ()=>{
      const guideBtn = document.getElementById('bankOperationGuideBtn');
      if (!guideBtn) return;
      const modal = document.createElement('div');
      modal.className = 'issue-detail-modal bank-guide-modal';
      modal.innerHTML = `
        <div class="issue-detail-panel" role="dialog" aria-modal="true" aria-label="操作指引">
          <div class="issue-detail-head">
            <div class="issue-detail-title">操作指引</div>
            <button class="issue-detail-close" type="button" aria-label="关闭">×</button>
          </div>
          <div class="issue-detail-body">
            <p class="issue-note">当前页面用于银行流水核查与底稿预览，建议先确认全局筛选条件，再按 Tab 查看账户、画像和高风险核查结果；完整性校验已迁移至“数据校验”。</p>
            <div class="issue-inline"><b>查看路径</b><span>数据校验 → 账号完整性；资金流水分析 → 账户总览 / 流水画像 / 高风险核查 / 流水查询</span></div>
            <div class="issue-inline"><b>操作建议</b><span>表格支持排序、筛选、分页和导出；高风险核查可使用“放大”查看更完整的表格内容。</span></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const close = ()=>modal.classList.remove('is-open');
      modal.querySelector('.issue-detail-close')?.addEventListener('click', close);
      modal.addEventListener('click', event=>{
        if (event.target === modal) close();
      });
      guideBtn.addEventListener('click', ()=>modal.classList.add('is-open'));
    });

    const getRiskZoomFrame = () => document.querySelector('.risk-reference-frame')?.contentWindow || null;
    let bankRiskZoomState = null;
    function riskZoomEscape(value) {
      return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[ch]);
    }
    function renderRiskZoomTitle(payload) {
      const context = payload?.context;
      if (!context) {
        return `<span id="bankRiskZoomTitle">${riskZoomEscape(payload?.title || '表格放大查看')}</span><small id="bankRiskZoomSub">${riskZoomEscape(payload?.sub || '当前筛查结果')}</small>`;
      }
      const filters = Array.isArray(context.filters) ? context.filters : [];
      return `
        <div class="bank-risk-zoom-context-line">
          <span class="bank-risk-zoom-group">${riskZoomEscape(context.group)}</span>
          <span class="bank-risk-zoom-sep">›</span>
          <span id="bankRiskZoomTitle" class="bank-risk-zoom-rule">${riskZoomEscape(context.title)}</span>
          <span class="bank-risk-zoom-badge">${riskZoomEscape(context.badge)}</span>
        </div>
        <div class="bank-risk-zoom-filter-line" id="bankRiskZoomSub">
          <span>筛选：</span>
          ${filters.length ? filters.map(item => `<b>${riskZoomEscape(item)}</b>`).join('') : '<em>当前无筛选条件</em>'}
        </div>
      `;
    }
    function refreshBankRiskZoom(payload) {
      const modal = document.getElementById('bankRiskTableZoomModal');
      if (!modal || !payload) return;
      bankRiskZoomState = { ...(bankRiskZoomState || {}), ...payload };
      const titleWrap = modal.querySelector('.bank-risk-zoom-title');
      if (titleWrap) titleWrap.innerHTML = renderRiskZoomTitle(payload);
      modal.querySelectorAll('[data-risk-zoom-table]').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.riskZoomTable === (payload.table || 'cp'));
      });
      modal.querySelector('.bank-risk-zoom-scroll').innerHTML = payload.html || '<div style="padding:16px;color:#64748b;">暂无可放大的表格内容</div>';
    }
    function runRiskZoomAction(action) {
      const frame = bankRiskZoomState?.frame || getRiskZoomFrame();
      if (!frame || typeof frame.handleRiskZoomAction !== 'function') return;
      const payload = frame.handleRiskZoomAction(action);
      refreshBankRiskZoom(payload);
    }
    function closeRiskZoomFilter() {
      document.querySelectorAll('.bank-risk-filter-popover').forEach(el => el.remove());
    }
    function openRiskZoomFilter(target, request) {
      const frame = bankRiskZoomState?.frame || getRiskZoomFrame();
      if (!frame || typeof frame.getRiskZoomFilterConfig !== 'function') return;
      const config = frame.getRiskZoomFilterConfig(request);
      if (!config) return;
      closeRiskZoomFilter();
      const pop = document.createElement('div');
      pop.className = 'bank-risk-filter-popover';
      const rect = target.getBoundingClientRect();
      pop.style.left = `${Math.min(rect.left, window.innerWidth - 260)}px`;
      pop.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 340)}px`;
      if (config.filterType === 'check') {
        pop.innerHTML = `
          <div class="bank-risk-filter-title">${config.title || '筛选'}</div>
          <div class="bank-risk-filter-options">
            ${config.options.map(opt => `<label><input type="radio" name="riskZoomFilter" value="${opt.value}" ${config.value === opt.value ? 'checked' : ''}/><span>${opt.label}</span></label>`).join('')}
          </div>
          <div class="bank-risk-filter-actions"><button type="button" data-action="clear">清除</button><button type="button" data-action="apply">应用</button></div>
        `;
      } else {
        const selected = new Set(config.selected || config.options || []);
        pop.innerHTML = `
          <div class="bank-risk-filter-title">${config.title || '筛选'}</div>
          <label class="bank-risk-filter-all"><input type="checkbox" data-all ${selected.size >= (config.options || []).length ? 'checked' : ''}/><span>全选</span></label>
          <div class="bank-risk-filter-options">
            ${(config.options || []).map(value => `<label><input type="checkbox" value="${String(value).replace(/"/g,'&quot;')}" ${selected.has(value) ? 'checked' : ''}/><span>${value}</span></label>`).join('')}
          </div>
          <div class="bank-risk-filter-actions"><button type="button" data-action="clear">清除</button><button type="button" data-action="apply">应用</button></div>
        `;
      }
      document.body.appendChild(pop);
      pop.querySelector('[data-all]')?.addEventListener('change', event => {
        pop.querySelectorAll('.bank-risk-filter-options input[type="checkbox"]').forEach(input => { input.checked = event.target.checked; });
      });
      pop.querySelector('[data-action="clear"]')?.addEventListener('click', event => {
        event.stopPropagation();
        closeRiskZoomFilter();
        runRiskZoomAction({ type: 'applyFilter', table: bankRiskZoomState?.table, filterType: config.filterType, key: config.key, value: 'all', values: [], allSelected: true });
      });
      pop.querySelector('[data-action="apply"]')?.addEventListener('click', event => {
        event.stopPropagation();
        if (config.filterType === 'check') {
          const value = pop.querySelector('input[name="riskZoomFilter"]:checked')?.value || 'all';
          runRiskZoomAction({ type: 'applyFilter', table: bankRiskZoomState?.table, filterType: 'check', key: config.key, value });
        } else {
          const values = Array.from(pop.querySelectorAll('.bank-risk-filter-options input[type="checkbox"]:checked')).map(input => input.value);
          const allSelected = values.length >= (config.options || []).length;
          runRiskZoomAction({ type: 'applyFilter', table: bankRiskZoomState?.table, filterType: config.filterType, key: config.key, values, allSelected });
        }
        closeRiskZoomFilter();
      });
      setTimeout(() => {
        document.addEventListener('click', function handler(event) {
          if (!pop.contains(event.target)) {
            closeRiskZoomFilter();
            document.removeEventListener('click', handler);
          }
        });
      }, 0);
    }

    window.openBankRiskTableZoom = function(tableHtml, title = '表格放大查看', sub = '当前筛查结果', meta = {}){
      let modal = document.getElementById('bankRiskTableZoomModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'bank-risk-zoom-modal';
        modal.id = 'bankRiskTableZoomModal';
        modal.innerHTML = `
          <div class="bank-risk-zoom-panel" role="dialog" aria-modal="true" aria-labelledby="bankRiskZoomTitle">
            <div class="bank-risk-zoom-head">
              <div class="bank-risk-zoom-title">
                <span id="bankRiskZoomTitle">表格放大查看</span>
                <small id="bankRiskZoomSub">当前筛查结果</small>
              </div>
              <div class="bank-risk-zoom-tabs">
                <button type="button" data-risk-zoom-table="cp">对手方汇总</button>
                <button type="button" data-risk-zoom-table="tx">流水明细</button>
              </div>
              <button class="bank-risk-zoom-close" type="button" aria-label="关闭">×</button>
            </div>
            <div class="bank-risk-zoom-body">
              <div class="bank-risk-zoom-scroll"></div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.bank-risk-zoom-close')?.addEventListener('click', ()=>{
          closeRiskZoomFilter();
          modal.classList.remove('is-open');
        });
        modal.addEventListener('click', event=>{
          const filterIcon = event.target.closest('.th-filter-icon');
          if (filterIcon && modal.contains(filterIcon)) {
            event.preventDefault();
            event.stopPropagation();
            const th = filterIcon.closest('th');
            if (th?.dataset.check) openRiskZoomFilter(filterIcon, { filterType: 'check', key: th.dataset.check });
            else if (th?.dataset.col) openRiskZoomFilter(filterIcon, { filterType: bankRiskZoomState?.table === 'tx' ? 'tx' : 'cp', key: th.dataset.col });
            return;
          }
          const sortArrow = event.target.closest('.th-sort-arrow');
          if (sortArrow && modal.contains(sortArrow)) {
            event.preventDefault();
            event.stopPropagation();
            const attr = sortArrow.getAttribute('onclick') || '';
            const match = attr.match(/sortTable\('([^']+)','([^']+)','([^']+)'\)/);
            const table = sortArrow.dataset.riskSortTable || match?.[1];
            const col = sortArrow.dataset.riskSortCol || match?.[2];
            const dir = sortArrow.dataset.riskSortDir || match?.[3];
            if (table && col && dir) runRiskZoomAction({ type: 'sort', table, col, dir });
            return;
          }
          const checkCell = event.target.closest('[data-risk-zoom-check-cp][data-risk-zoom-check-id]');
          if (checkCell && modal.contains(checkCell)) {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({
              type: 'toggleManualClear',
              table: bankRiskZoomState?.table,
              cpId: checkCell.dataset.riskZoomCheckCp,
              checkId: checkCell.dataset.riskZoomCheckId
            });
            return;
          }
          const pageBtn = event.target.closest('[data-risk-zoom-page]');
          if (pageBtn && modal.contains(pageBtn)) {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({ type: 'page', table: bankRiskZoomState?.table, page: pageBtn.dataset.riskZoomPage });
            return;
          }
          const groupHeader = event.target.closest('th.group-collapsible');
          if (groupHeader && modal.contains(groupHeader)) {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({ type: 'toggleGroup', table: bankRiskZoomState?.table, groupKey: groupHeader.dataset.groupKey });
            return;
          }
          if (event.target === modal) {
            closeRiskZoomFilter();
            modal.classList.remove('is-open');
          }
        });
        modal.addEventListener('click', event=>{
          const switchBtn = event.target.closest('[data-risk-zoom-table]');
          if (switchBtn && modal.contains(switchBtn)) {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({ type: 'switchZoomTable', table: switchBtn.dataset.riskZoomTable });
          }
        });
        modal.addEventListener('change', event=>{
          const pageSize = event.target.closest('[data-risk-zoom-page-size]');
          if (pageSize && modal.contains(pageSize)) {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({ type: 'pageSize', table: bankRiskZoomState?.table, pageSize: pageSize.value });
            return;
          }
          const pageJump = event.target.closest('[data-risk-zoom-jump]');
          if (pageJump && modal.contains(pageJump)) {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({ type: 'page', table: bankRiskZoomState?.table, page: pageJump.value });
            return;
          }
          const remarkInput = event.target.closest('[data-risk-cp-remark]');
          if (remarkInput && modal.contains(remarkInput)) {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({
              type: 'updateCpRemark',
              cpId: remarkInput.dataset.riskCpRemark,
              value: remarkInput.value
            });
          }
        });
        modal.addEventListener('keydown', event=>{
          const pageJump = event.target.closest('[data-risk-zoom-jump]');
          if (pageJump && modal.contains(pageJump) && event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            runRiskZoomAction({ type: 'page', table: bankRiskZoomState?.table, page: pageJump.value });
          }
        });
        document.addEventListener('keydown', event=>{
          if (event.key === 'Escape') {
            closeRiskZoomFilter();
            modal.classList.remove('is-open');
          }
        });
      }
      bankRiskZoomState = { frame: getRiskZoomFrame(), table: meta.table || 'cp', title, sub, context: meta.context, html: tableHtml };
      refreshBankRiskZoom(bankRiskZoomState);
      modal.classList.add('is-open');
    };
    
     //账户总览展开收起
    document.addEventListener("DOMContentLoaded",()=>{
      const scope=document.getElementById('checkScope');
      const btn=document.getElementById('btnToggleCheck');
      if(!scope||!btn)return;
      const setExpand=(expand)=>{
        scope.classList.toggle('expanded',expand);
        btn.classList.toggle('expanded',expand);
      };
      setExpand(false);
      btn.addEventListener('click',()=>{setExpand(!scope.classList.contains('expanded'));});
    });
     
    //缺失同名账户公司下拉
    document.addEventListener('DOMContentLoaded',()=>{
      const groups = document.querySelectorAll('#tblMissingSameName .group-row');
      groups.forEach(row=>{
        const btn = row.querySelector('.expand-btn');
        const groupId = row.dataset.group;
        // 默认展开：detail-row 已显示
        btn.addEventListener('click',()=>{
          const expanded = btn.classList.toggle('expanded');
          document.querySelectorAll(`.group-${groupId}`).forEach(d=>{
            d.style.display = expanded ? 'table-row' : 'none';
          });
          btn.textContent = expanded ? '▼' : '▶';
        });
      });
    });

    function initReconcilePagination(){
      const fmt = value => `${Number(value).toLocaleString('zh-CN')}K`;
      const companies = [
        ['华东制造集团有限公司','发行人'],
        ['上海星河科技有限公司','发行人'],
        ['深圳南山精密制造有限公司','发行人'],
        ['北京恒瑞医疗设备有限公司','发行人'],
        ['重庆云峰智能装备有限公司','发行人'],
        ['郑州华辰电气有限公司','发行人'],
        ['昆明启明商贸有限公司','发行人'],
        ['天津远泽汽车零部件有限公司','发行人']
      ];
      const banks = ['工行上海分行','建行上海分行','招商银行深圳分行','中国银行北京分行','浦发银行重庆分行','交通银行郑州分行','民生银行昆明分行','农业银行天津分行'];
      const accounts = ['1001***0821','1002***4186','6214****8890','3941****2193','2170****7797','5784****7907','4308****6621','8820****3519'];
      const currencies = ['RMB','RMB','RMB','USD'];
      const makeRow = (base, i, withAccount=false) => {
        const company = companies[i % companies.length];
        const year = 2025;
        const currency = currencies[i % currencies.length];
        const end = base + i * 37600;
        const inflow = Math.round(end * (.16 + (i % 5) * .018));
        const outflow = Math.round(end * (.145 + (i % 4) * .015));
        const final = end + inflow - outflow;
        const bookOpen = end;
        const bookOut = outflow + (i % 6 === 0 ? 860 : 0);
        const bookIn = inflow - (i % 7 === 0 ? 640 : 0);
        const bookFinal = bookOpen + bookIn - bookOut;
        const openDiff = end - bookOpen;
        const inDiff = inflow - bookOut;
        const outDiff = outflow - bookIn;
        const finalDiff = final - bookFinal;
        const cells = [
          company[0],
          ...(withAccount ? ['发行人', accounts[i % accounts.length], banks[i % banks.length], '银行流水'] : [company[1]]),
          year,
          currency,
          fmt(end),
          `<span class="amount-in">${fmt(inflow)}</span>`,
          `<span class="amount-out">${fmt(outflow)}</span>`,
          fmt(final),
          fmt(bookOpen),
          fmt(bookOut),
          fmt(bookIn),
          fmt(bookFinal),
          openDiff === 0 ? '0' : fmt(openDiff),
          inDiff === 0 ? '0' : fmt(inDiff),
          outDiff === 0 ? '0' : fmt(outDiff),
          finalDiff === 0 ? '0' : fmt(finalDiff),
          `<input class="ba-note-input" value="${Math.abs(finalDiff) > 1000 ? '差异待复核' : '核对一致'}"/>`,
          ''
        ];
        return `<tr>${cells.map(v=>`<td>${v}</td>`).join('')}</tr>`;
      };
      const generalRows = Array.from({length:24}, (_,i)=>makeRow(1086000, i, false));
      const accountRows = Array.from({length:36}, (_,i)=>makeRow(836000, i, true));
      const pagers = {
        general: { body: document.getElementById('generalLedgerReconcileBody'), pager: document.getElementById('generalLedgerReconcilePager'), rows: generalRows, page: 1, pageSize: 20 },
        account: { body: document.getElementById('accountReconcileBody'), pager: document.getElementById('accountReconcilePager'), rows: accountRows, page: 1, pageSize: 20 }
      };
      const render = key => {
        const state = pagers[key];
        if (!state.body || !state.pager) return;
        const pages = Math.max(1, Math.ceil(state.rows.length / state.pageSize));
        state.page = Math.min(Math.max(1, state.page), pages);
        const start = (state.page - 1) * state.pageSize;
        state.body.innerHTML = state.rows.slice(start, start + state.pageSize).join('');
        renderAuditPager(state.pager, {
          total: state.rows.length,
          page: state.page,
          pageSize: state.pageSize,
          onPage(next){ state.page = next; render(key); },
          onPageSize(size){ state.pageSize = size; state.page = 1; render(key); }
        });
      };
      render('general');
      render('account');
    }

    function initAccountSummaryPagination(){
      const table = document.getElementById('tblAccountSummary');
      const head = document.getElementById('accountSummaryHead');
      const body = document.getElementById('accountSummaryBody');
      const pager = document.getElementById('pagination-account');
      const wrap = table?.closest('.account-summary-table-wrap');
      if (!table || !head || !body || !pager || !wrap || table.dataset.accountPagerReady === '1') return;
      table.dataset.accountPagerReady = '1';
      const years = [2023, 2024, 2025];
      const yearWeights = [.30, .33, .37];
      const rows = [
        ['华东制造集团有限公司',140680,128640,269320,4280,57,3],
        ['华东制造集团有限公司',112430,103260,215690,3650,46,3],
        ['深圳启明电子有限公司',96540,88420,184960,3220,38,3],
        ['北京恒瑞医疗设备有限公司',126870,116340,243210,4050,52,3],
        ['重庆云峰智能装备有限公司',102960,94480,197440,3440,41,3],
        ['郑州华辰电气有限公司',82670,75960,158630,2870,35,3],
        ['昆明启明商贸有限公司',73420,67430,140850,2520,31,3],
        ['天津远泽汽车零部件有限公司',54689,50781,105470,2271,28,3]
      ].map((item,index)=>({
        company:item[0], inflow:item[1], outflow:item[2], total:item[3],
        txCount:item[4], cpCount:item[5], fileCount:item[6], index
      }));
      const totals = rows.reduce((sum,row)=>({
        inflow:sum.inflow+row.inflow,
        outflow:sum.outflow+row.outflow,
        total:sum.total+row.total,
        txCount:sum.txCount+row.txCount,
        cpCount:sum.cpCount+row.cpCount,
        fileCount:sum.fileCount+row.fileCount
      }),{inflow:0,outflow:0,total:0,txCount:0,cpCount:0,fileCount:0});
      totals.cpCount = 100;
      totals.fileCount = 8;
      const state = { page: 1, pageSize: 20, yearExpanded: false };
      const format = value => Number(value).toLocaleString('zh-CN');
      const splitYears = value => {
        const first = Math.round(value * yearWeights[0]);
        const second = Math.round(value * yearWeights[1]);
        return [first, second, value-first-second];
      };
      const yearCells = row => {
        if (!state.yearExpanded) return '';
        const inflow = splitYears(row.inflow);
        const outflow = splitYears(row.outflow);
        return years.map((year,index)=>`<td class="flow-in is-num">${format(inflow[index])}</td><td class="flow-out is-num">${format(outflow[index])}</td><td class="is-num"><b>${format(inflow[index]+outflow[index])}</b></td>`).join('');
      };
      const miniBars = index => {
        const inflow = [72,58,84,65,91,77,69,88,74,96,82,90];
        const outflow = [54,68,61,79,63,72,86,67,81,70,92,76];
        return `<div class="monthly-flow-bars" aria-label="月度流入流出分布">${inflow.map((value,month)=>`<span class="monthly-flow-pair" title="${month+1}月"><i class="flow-in-bar" style="height:${Math.min(98,value+index*2)}%"></i><i class="flow-out-bar" style="height:${Math.min(98,outflow[month]+index)}%"></i></span>`).join('')}</div>`;
      };
      const renderHead = () => {
        const icon = state.yearExpanded ? '«' : '»';
        const yearHeads = state.yearExpanded ? years.map(year=>`<th colspan="3" class="account-year-head no-sort">${year}年</th>`).join('') : '';
        const yearSubs = state.yearExpanded ? years.map(()=>'<th>流入金额</th><th>流出金额</th><th>交易总额</th>').join('') : '';
        head.innerHTML = `<tr class="account-year-group-head"><th rowspan="2">被审计单位公司</th><th rowspan="2" class="monthly-flow-head no-sort">月度流入/流出</th><th colspan="7" class="account-group-toggle-cell no-sort"><button class="account-group-toggle" id="accountYearToggle" type="button" title="展开或收起年度金额"><span>合计</span><i>${icon}</i></button></th>${yearHeads}<th rowspan="2" class="no-sort">操作</th></tr><tr class="account-year-sub-head"><th>流入金额</th><th>流出金额</th><th>交易总额</th><th>交易总额占比</th><th>交易笔数</th><th>对手方数量</th><th>流水文件</th>${yearSubs}</tr>`;
        document.getElementById('accountYearToggle')?.addEventListener('click',()=>{
          state.yearExpanded = !state.yearExpanded;
          render();
        });
      };
      const render = () => {
        const total = rows.length;
        const pages = Math.max(1, Math.ceil(total / state.pageSize));
        state.page = Math.max(1, Math.min(state.page, pages));
        const start = (state.page - 1) * state.pageSize;
        const end = start + state.pageSize;
        renderHead();
        wrap.classList.toggle('is-year-expanded',state.yearExpanded);
        const sumYearCells = yearCells(totals);
        const sumRow = `<tr class="sum-row"><td><strong>合计</strong></td><td></td><td class="flow-in is-num"><strong>${format(totals.inflow)}</strong></td><td class="flow-out is-num"><strong>${format(totals.outflow)}</strong></td><td class="is-num"><strong>${format(totals.total)}</strong></td><td class="is-num"><strong>100.00%</strong></td><td class="is-num"><strong>${format(totals.txCount)}</strong></td><td class="is-num"><strong>${totals.cpCount}</strong></td><td class="is-num"><strong>${totals.fileCount}</strong></td>${sumYearCells}<td></td></tr>`;
        const dataRows = rows.slice(start,end).map(row=>`<tr><td>${row.company}</td><td class="monthly-flow-cell">${miniBars(row.index)}</td><td class="flow-in is-num">${format(row.inflow)}</td><td class="flow-out is-num">${format(row.outflow)}</td><td class="is-num"><b>${format(row.total)}</b></td><td class="is-num">${((row.total/totals.total)*100).toFixed(2)}%</td><td class="is-num">${format(row.txCount)}</td><td class="is-num">${row.cpCount}</td><td class="is-num">${row.fileCount}</td>${yearCells(row)}<td class="actions"><a href="javascript:void(0)" title="查看明细"><i class="fa-regular fa-eye"></i></a><a href="javascript:void(0)" title="文件详情"><i class="fa-regular fa-file-lines"></i></a></td></tr>`).join('');
        body.innerHTML = sumRow + dataRows;
        renderAuditPager(pager, {
          total,
          page: state.page,
          pageSize: state.pageSize,
          onPage(next){ state.page = next; render(); },
          onPageSize(size){ state.pageSize = size; state.page = 1; render(); }
        });
        delete table.dataset.baEnhanced;
        table.querySelectorAll('.ba-th-tools').forEach(el=>el.remove());
        window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));
      };
      render();
    }

    function initMissingSameNamePagination(){
      const table = document.getElementById('tblMissingSameName');
      const body = table?.querySelector('tbody');
      if (!table || !body || table.dataset.missingPagerReady === '1') return;
      table.dataset.missingPagerReady = '1';
      const groupRow = body.querySelector('tr.group-row');
      const detailRowsSeed = Array.from(body.querySelectorAll('tr.detail-row'));
      if (detailRowsSeed.length > 0 && detailRowsSeed.length < 8) {
        const extra = [
          ['4308 **** 6621','0K','0.00%','0K','0.00%','0','0.00%'],
          ['8820 **** 3519','0K','0.00%','0K','0.00%','0','0.00%'],
          ['7741 **** 0926','0K','0.00%','0K','0.00%','0','0.00%'],
          ['9032 **** 5178','0K','0.00%','0K','0.00%','0','0.00%']
        ];
        const template = detailRowsSeed[detailRowsSeed.length - 1];
        extra.slice(0, 8 - detailRowsSeed.length).forEach(item => {
          const row = template.cloneNode(true);
          const cells = row.children;
          cells[1].textContent = item[0];
          cells[2].textContent = item[1];
          cells[3].textContent = item[2];
          cells[4].textContent = item[3];
          cells[5].textContent = item[4];
          cells[6].textContent = item[5];
          cells[7].textContent = item[6];
          body.appendChild(row);
        });
      }
      const detailRows = Array.from(body.querySelectorAll('tr.detail-row'));
      let pager = document.getElementById('missingSameNamePager');
      if (!pager) {
        pager = document.createElement('div');
        pager.id = 'missingSameNamePager';
        pager.className = 'pagination reconcile-pagination';
        table.closest('.content')?.appendChild(pager);
      }
      const state = { page: 1, pageSize: 20 };
      const render = () => {
        const total = detailRows.length;
        const pages = Math.max(1, Math.ceil(total / state.pageSize));
        state.page = Math.max(1, Math.min(state.page, pages));
        const start = (state.page - 1) * state.pageSize;
        const end = start + state.pageSize;
        if (groupRow) groupRow.style.display = '';
        detailRows.forEach((row, index) => { row.style.display = index >= start && index < end ? '' : 'none'; });
        renderAuditPager(pager, {
          total,
          page: state.page,
          pageSize: state.pageSize,
          onPage(next){ state.page = next; render(); },
          onPageSize(size){ state.pageSize = size; state.page = 1; render(); }
        });
      };
      render();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReconcilePagination);
    } else {
      initReconcilePagination();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAccountSummaryPagination);
    } else {
      initAccountSummaryPagination();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMissingSameNamePagination);
    } else {
      initMissingSameNamePagination();
    }
    // ===== 资金流水核查底稿导出：自检版 JS（作用域安全 + 延迟初始化） =====//
    (function () {
  const $ = (sel) => document.querySelector(sel);
  const $all = (sel) => Array.from(document.querySelectorAll(sel));
  const fmt = (n) => (Number(n) || 0).toLocaleString("zh-CN");

  const METHOD_TEXT = {
    "1": "1. 通过邮件/U盘等提供下载记录",
    "2": "2. 直接从银行获取",
    "3": "3. 由SDS平台下发或邮件推送",
    "4": "4. 远程观察获取"
  };

  const RISK_RATIO = {
    "重大+": 0.25,
    "重大": 0.15,
    "提高": 0.10,
    "基础": 0.05
  };

  window.WP = window.WP || {
    proj: "20220318/TEST",
    book: "test for tech hour",
    isIPO: false,
    kindText: "Non-IPO_NON-PIE",
    market: "N/A",
    materiality: "",
    fyEnd: "12-31",
    accounts: [
      { id: 1, org: "华东制造集团有限公司", bankNo: "1001***0821", bank: "工行上海分行", total: 269320, tx: 4280, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 2, org: "上海星河科技有限公司", bankNo: "1002***4186", bank: "建行上海分行", total: 215690, tx: 3650, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 3, org: "深圳启明电子有限公司", bankNo: "2001***7739", bank: "招行上海分行", total: 184960, tx: 3220, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 4, org: "广州远航贸易有限公司", bankNo: "3001***6290", bank: "平安深圳分行", total: 243210, tx: 4050, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 5, org: "苏州精密制造有限公司", bankNo: "3002***9052", bank: "中行深圳分行", total: 197440, tx: 3440, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 6, org: "华南物流服务有限公司", bankNo: "4001***1578", bank: "广发广州分行", total: 158630, tx: 2870, method: "", updatedBy: "", updatedAt: "", sample: null }
    ]
  };

  const CHECK_STANDARD_ROWS = [
    {
      procedure: "定量考虑因素（一般事项核查标准）： 法人账户单笔（X）万元以上的交易的银行流水",
      code: "i-1.1",
      criteria: "单笔[50,000]元以上",
      status: "",
      cp: "",
      amt: "",
      cnt: "",
      action: "",
      reason: ""
    },
    {
      procedure: "法人账户中满足交易总额达到[X]亿元的交易的银行流水",
      code: "i-1.2",
      criteria: "年度资金流入总额或流出总额 [1,000,000]万元及以上",
      status: "已完成",
      cp: 642,
      amt: 1475630.0,
      cnt: 2389,
      action: true,
      reason: ""
    },
    {
      procedure: "发行人的关联方及曾经的关联方及其相关方（如无业务往来的关联方）",
      code: "i-2.1.1",
      criteria: "包含在关联方主档信息中，但未包含在客户或供应商主档信息中的对手方",
      status: "已完成",
      cp: 1,
      amt: 445600.0,
      cnt: 30,
      action: false,
      reason: ""
    },
    {
      procedure: "实际控制人（包括亲属）、持股5%以上股东、董事、监事、高管等关联自然人",
      code: "i-2.1.2",
      criteria: "关联方主档信息中标注为特定类型的关联方",
      status: "已完成",
      cp: 0,
      amt: 0.0,
      cnt: 0,
      action: false,
      reason: ""
    },
    {
      procedure: "发行人关键岗位人员、员工（如财务经理、出纳、董事长司机、市场总监、核心技术人员等）",
      code: "i-2.2.1",
      criteria: "员工主档信息中标注为特定岗位的员工",
      status: "已完成",
      cp: 0,
      amt: 0.0,
      cnt: 0,
      action: false,
      reason: ""
    },
    {
      procedure: "大额或频繁存现、取现情形，且资金往来异常；",
      code: "i-3.1",
      criteria: "流水摘要包含特定关键字或交易类型体现为存取现和相关类型",
      status: "已完成",
      cp: 0,
      amt: 0.0,
      cnt: 0,
      action: false,
      reason: ""
    },
    {
      procedure: "资产负债表日前后多天时间发生的资金收支",
      code: "i-3.2",
      criteria: "特定日期 [12/31] 前后 [10] 天以内（含）且单笔交易金额 [元及以上]",
      status: "已完成",
      cp: 273,
      amt: 190702.3,
      cnt: 438,
      action: true,
      reason: ""
    },
    {
      procedure: "利用员工账户或其他个人账户进行支付；与个人账户的交易（当被审计单位的交易对手为主要为企业时）；",
      code: "i-2.2.2",
      criteria: "与对手方为个人发生的交易总额 [0]元及以上",
      status: "已完成",
      cp: 4,
      amt: 1485.8,
      cnt: 9,
      action: false,
      reason: ""
    },
    {
      procedure: "与员工主档或关联方主档中的对手方相关联的交易",
      code: "i-2.2.3",
      criteria: "与员工主档信息中识别为前员工的对手方发生的交易",
      status: "已完成",
      cp: 0,
      amt: 0.0,
      cnt: 0,
      action: false,
      reason: ""
    },
    {
      procedure: "与不存在供应商单或客户清单中的对方单位的往来",
      code: "i-3.6",
      criteria: "交易对手方未包含在客户主档信息或供应商主档信息，且交易总额 [0]元及以上",
      status: "已完成",
      cp: 644,
      amt: 1475641.0,
      cnt: 2392,
      action: true,
      reason: ""
    },
    {
      procedure: "与对手方交易总额 [0]元及以上，且流入总额与流出总额差合计[20%]及以上",
      code: "i-3.7",
      criteria: "与对手方交易总额 [0]元及以上，且流入总额与流出总额差合计[20%]及以上",
      status: "已完成",
      cp: 15,
      amt: 973176.9,
      cnt: 101,
      action: true,
      reason: ""
    },
    {
      procedure: "与对手方发生交易次数在 [1] 次以上 [1] 次以内，且交易总额 [0]元及以上",
      code: "i-3.8",
      criteria: "与对手方发生交易次数在 [1] 次以上 [1] 次以内，且交易总额 [0]元及以上",
      status: "已完成",
      cp: 222,
      amt: 22293.1,
      cnt: 222,
      action: true,
      reason: ""
    }
  ];

  const THIRD_PARTY_ROWS = [
    {
      procedure: "经常司法恢复",
      code: "i-4.1",
      criteria: "经营天数 <= [365] 天",
      status: "已完成",
      cp: 0,
      amt: 0.0,
      cnt: 0,
      reason: ""
    },
    {
      procedure: "缴纳社保人数较少",
      code: "i-4.2",
      criteria: "社保人数 <= [50] 人",
      status: "已完成",
      cp: 0,
      amt: 0.0,
      cnt: 0,
      reason: ""
    },
    {
      procedure: "为个人或个体工商户",
      code: "i-4.3",
      criteria: "个人",
      status: "已完成",
      cp: 4,
      amt: 1485.8,
      cnt: 9,
      reason: ""
    },
    {
      procedure: "为个人或个体工商户",
      code: "i-4.4",
      criteria: "个体工商户、个人独资企业",
      status: "已完成",
      cp: 0,
      amt: 0.0,
      cnt: 0,
      reason: ""
    }
  ];

  function nowText() {
    const d = new Date();
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function isMethodComplete() {
    return (WP.accounts || []).every(x => !!x.method);
  }

  function renderTopBar() {
    const setText = (id, value) => {
      const el = $("#" + id);
      if (el) el.textContent = value;
    };
    setText("wpProj", WP.proj || "20220318/TEST");
    setText("wpBook", WP.book || "test for tech hour");
    setText("wpKind", WP.kindText || (WP.isIPO ? "IPO" : "Non-IPO_NON-PIE"));
    setText("wpMarket", WP.market || "N/A");
    setText("wpMaterialityText", WP.materiality ? fmt(WP.materiality) : "-");
  }

  function renderTable1() {
    const tbody = $("#wpTable1 tbody");
    if (!tbody) return;

    tbody.innerHTML = (WP.accounts || []).map(row => {
      const hasError = !row.method;
      return `
        <tr>
          <td>${row.org || ""}</td>
          <td>${row.bankNo || ""}</td>
          <td>${row.bank || ""}</td>
          <td class="num">${fmt(row.total)}</td>
          <td class="num">${fmt(row.tx)}</td>
          <td>
            <div class="wp-method-cell">
              <select class="wp-method-select ${hasError ? "is-error" : ""}" data-id="${row.id}">
                <option value=""></option>
                <option value="1" ${row.method === "1" ? "selected" : ""}>${METHOD_TEXT["1"]}</option>
                <option value="2" ${row.method === "2" ? "selected" : ""}>${METHOD_TEXT["2"]}</option>
                <option value="3" ${row.method === "3" ? "selected" : ""}>${METHOD_TEXT["3"]}</option>
                <option value="4" ${row.method === "4" ? "selected" : ""}>${METHOD_TEXT["4"]}</option>
              </select>
              ${hasError ? `<span class="wp-required">必填</span>` : ""}
            </div>
          </td>
          <td>${row.updatedBy || ""}</td>
          <td>${row.updatedAt || ""}</td>
        </tr>
      `;
    }).join("");

    const table1Total = String((WP.accounts || []).length);
    if ($("#wpTable1Total")) $("#wpTable1Total").textContent = table1Total;
    if ($("#wpTable1TotalMirror")) $("#wpTable1TotalMirror").textContent = table1Total;

    $all(".wp-method-select").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const id = Number(e.target.getAttribute("data-id"));
        const row = WP.accounts.find(x => x.id === id);
        if (!row) return;

        row.method = e.target.value || "";
        row.updatedBy = row.method ? "当前用户" : "";
        row.updatedAt = row.method ? nowText() : "";

        updateWorkingPaperSections();
      });
    });
  }

  function computeSamples() {
    const directTest = $("#directTestSwitch")?.checked;
    const risk = $("#riskSel")?.value || "";
    const ratio = RISK_RATIO[risk];

    if (!directTest || !ratio) {
      WP.accounts.forEach(a => a.sample = null);
      return;
    }

    WP.accounts.forEach(a => {
      a.sample = Math.ceil((Number(a.tx) || 0) * ratio);
    });
  }

  function renderTable2() {
    const tbody = $("#wpTable2 tbody");
    if (!tbody) return;

    computeSamples();
    const directTest = $("#directTestSwitch")?.checked;

    tbody.innerHTML = (WP.accounts || []).map(row => `
      <tr>
        <td>${row.org || ""}</td>
        <td>${row.bankNo || ""}</td>
        <td>${row.bank || ""}</td>
        <td class="num">${fmt(row.total)}</td>
        <td class="num">${fmt(row.tx)}</td>
        <td>${directTest ? (row.sample != null ? fmt(row.sample) : "") : "N/A 不执行直接测试"}</td>
      </tr>
    `).join("");

    $("#wpTable2Total").textContent = String((WP.accounts || []).length);
  }

  function renderCheckStandardTable() {
    const tbody = $("#rngTbody");
    if (!tbody) return;

    tbody.innerHTML = CHECK_STANDARD_ROWS.map(row => `
      <tr>
        <td>${row.procedure}</td>
        <td>${row.code}</td>
        <td style="color:#4f83cc;">${row.criteria}</td>
        <td>${row.status ? `<span class="st-done">${row.status}</span>` : `<span class="st-empty">-</span>`}</td>
        <td class="num">${row.cp !== "" ? fmt(row.cp) : ""}</td>
        <td class="num">${row.amt !== "" ? fmt(row.amt) : ""}</td>
        <td class="num">${row.cnt !== "" ? fmt(row.cnt) : ""}</td>
        <td>
          ${row.action ? `
            <div class="wp-action-links">
              <a href="javascript:void(0)" class="act-link">进入</a>
              <a href="javascript:void(0)" class="act-link">重置</a>
            </div>
          ` : ""}
        </td>
        <td><input class="inp-reason" type="text" value="${row.reason || ""}"></td>
      </tr>
    `).join("");
  }

  function renderThirdPartyTable() {
    const tbody = $("#fraudTbody");
    if (!tbody) return;

    tbody.innerHTML = THIRD_PARTY_ROWS.map(row => `
      <tr>
        <td>${row.procedure}</td>
        <td>${row.code}</td>
        <td style="color:#4f83cc;">${row.criteria}</td>
        <td><span class="st-done">${row.status}</span></td>
        <td class="num">${fmt(row.cp)}</td>
        <td class="num">${fmt(row.amt)}</td>
        <td class="num">${fmt(row.cnt)}</td>
        <td><input class="inp-reason" type="text" value="${row.reason || ""}"></td>
      </tr>
    `).join("");
  }

  function updateWorkingPaperSections() {
    const isBankWorkingpaperTab = !!document.getElementById("pane-workingpaper");
    const complete = isMethodComplete();
    const block2 = $("#wpBlock2");
    const block3 = $("#wpBlock3");
    const block4 = $("#wpBlock4");

    if (block2) block2.style.display = (isBankWorkingpaperTab || complete) ? "" : "none";
    if (block3) block3.style.display = "";
    if (block4) block4.style.display = "";

    const directTest = $("#directTestSwitch")?.checked;
    if ($("#directTestText")) {
      $("#directTestText").textContent = directTest ? "是" : "否";
    }
    if ($("#sampleConfigRow")) {
      $("#sampleConfigRow").classList.toggle("wp-is-hidden", !directTest);
      if (directTest) $("#sampleConfigRow").style.removeProperty("display");
      else $("#sampleConfigRow").style.setProperty("display", "none", "important");
    }
    if ($("#wpTable2Wrap")) {
      $("#wpTable2Wrap").classList.toggle("wp-is-hidden", !directTest);
      if (directTest) $("#wpTable2Wrap").style.removeProperty("display");
      else $("#wpTable2Wrap").style.setProperty("display", "none", "important");
    }
    if ($("#wpTable2Pager")) {
      $("#wpTable2Pager").classList.toggle("wp-is-hidden", !directTest);
      if (directTest) $("#wpTable2Pager").style.removeProperty("display");
      else $("#wpTable2Pager").style.setProperty("display", "none", "important");
    }
    if ($("#wpDirectTestDesc")) {
      $("#wpDirectTestDesc").classList.toggle("wp-is-hidden", !directTest);
      if (directTest) $("#wpDirectTestDesc").style.removeProperty("display");
      else $("#wpDirectTestDesc").style.setProperty("display", "none", "important");
    }

    renderTable1();
    if (directTest && (isBankWorkingpaperTab || complete)) renderTable2();
    renderCheckStandardTable();
    renderThirdPartyTable();
  }

  function bindFold() {
    $all(".wp-fold-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-fold-target");
        const section = document.getElementById(id);
        if (!section) return;
        section.classList.toggle("is-collapsed");
      });
    });
  }

  $("#btnExportWp")?.addEventListener("click", () => {
    if (!isMethodComplete()) {
      alert("请先补充所有银行流水获取方式。");
      return;
    }
    alert("触发导出逻辑");
  });

  $("#btnImportWp")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert("已选择文件：" + file.name);
    e.target.value = "";
  });

  $("#directTestSwitch")?.addEventListener("change", () => {
    updateWorkingPaperSections();
  });

  $("#riskSel")?.addEventListener("change", () => {
    renderTable2();
  });

  $("#btnGenRisk")?.addEventListener("click", () => {
    const isBankWorkingpaperTab = !!document.getElementById("pane-workingpaper");
    if (!isBankWorkingpaperTab && !isMethodComplete()) {
      alert("请先完成第1部分：为所有账户补充银行流水获取方式。");
      return;
    }
    alert("导出资金流水核查底稿");
  });

  const modal = $("#wpModal");

  $("#wpEditMarket")?.addEventListener("click", () => {
    $all('input[name="wpIPO"]').forEach(r => {
      r.checked = (WP.isIPO ? r.value === "Y" : r.value === "N");
    });
    $("#wpMarketSel").value = WP.market || "N/A";
    $("#wpFyEnd").value = WP.fyEnd || "";
    $("#wpMateriality").value = WP.materiality || "";
    if (modal) modal.style.display = "flex";
  });

  $("#wpModalClose")?.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });

  $("#wpModalCancel")?.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });

  $("#wpModalOk")?.addEventListener("click", () => {
    WP.isIPO = (document.querySelector('input[name="wpIPO"]:checked')?.value || "Y") === "Y";
    WP.market = $("#wpMarketSel")?.value || "N/A";
    WP.fyEnd = $("#wpFyEnd")?.value?.trim() || "";
    WP.materiality = $("#wpMateriality")?.value?.trim() || "";
    WP.kindText = WP.isIPO ? "IPO" : "Non-IPO_NON-PIE";

    renderTopBar();
    if (modal) modal.style.display = "none";
  });

  renderTopBar();
  updateWorkingPaperSections();
  bindFold();
})();

// 资金流水分析通用表格表头增强：排序 + 列值筛选
(function(){
  const tableFilters = new WeakMap();
  const columnPrefs = new Map();
  let generatedTableId = 0;

  function getCellText(row, index) {
    return (row.children[index]?.innerText || '').trim();
  }

  function compareCell(a, b, dir) {
    const na = Number(a.replace(/[^\d.-]/g, ''));
    const nb = Number(b.replace(/[^\d.-]/g, ''));
    const bothNumber = a && b && !Number.isNaN(na) && !Number.isNaN(nb);
    if (bothNumber && na !== nb) return dir === 'asc' ? na - nb : nb - na;
    return dir === 'asc'
      ? a.localeCompare(b, 'zh-CN', { numeric: true })
      : b.localeCompare(a, 'zh-CN', { numeric: true });
  }

  function applyTableFilters(table) {
    const filters = tableFilters.get(table);
    const rows = Array.from(table.tBodies[0]?.rows || []);
    rows.forEach(row => {
      let visible = true;
      if (filters) {
        filters.forEach((selected, index) => {
          if (selected.size && !selected.has(getCellText(row, index))) visible = false;
        });
      }
      row.style.display = visible ? '' : 'none';
    });
  }

  function sortTableByColumn(table, index, dir, th) {
    const tbody = table.tBodies[0];
    if (!tbody) return;
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => compareCell(getCellText(a, index), getCellText(b, index), dir));
    rows.forEach(row => tbody.appendChild(row));
    table.querySelectorAll('th').forEach(item => item.classList.remove('ba-sort-asc', 'ba-sort-desc'));
    th.classList.add(dir === 'asc' ? 'ba-sort-asc' : 'ba-sort-desc');
    applyTableFilters(table);
  }

  function closeFilterPopovers() {
    document.querySelectorAll('.ba-table-filter-popover').forEach(el => el.remove());
  }

  function closeColumnPopovers() {
    document.querySelectorAll('.ba-column-popover').forEach(el => {
      if (typeof el._baCleanup === 'function') el._baCleanup();
      el.remove();
    });
  }

  function cssIdent(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function getTableKey(table) {
    if (!table.id) {
      generatedTableId += 1;
      table.id = `baCustomTable${generatedTableId}`;
    }
    return table.id;
  }

  function getHeaderLabel(th) {
    if (th.classList.contains('check-col')) return '校验情况';
    if (th.classList.contains('monthly-flow-head')) return '月度流入/流出';
    const clone = th.cloneNode(true);
    clone.querySelectorAll('.ba-th-tools,button,svg,.check-window,.check-nav').forEach(el => el.remove());
    const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    return text || '未命名字段';
  }

  function getHeaderLayout(table) {
    if (table._baHeaderLayout) return table._baHeaderLayout;
    const headerRows = Array.from(table.tHead?.rows || []);
    if (!headerRows.length) return [];
    const headerGrid = [];
    const layout = [];
    headerRows.forEach((row, rowIndex) => {
      headerGrid[rowIndex] ||= [];
      let colIndex = 0;
      Array.from(row.cells).forEach(th => {
        while (headerGrid[rowIndex][colIndex]) colIndex += 1;
        const rowSpan = Number(th.dataset.baOriginalRowspan || th.rowSpan || 1);
        const colSpan = Number(th.dataset.baOriginalColspan || th.colSpan || 1);
        th.dataset.baOriginalRowspan = String(rowSpan);
        th.dataset.baOriginalColspan = String(colSpan);
        for (let r = 0; r < rowSpan; r += 1) {
          headerGrid[rowIndex + r] ||= [];
          for (let c = 0; c < colSpan; c += 1) headerGrid[rowIndex + r][colIndex + c] = true;
        }
        layout.push({
          th,
          rowIndex,
          start: colIndex,
          end: colIndex + colSpan - 1,
          rowSpan,
          colSpan,
          isLeaf: colSpan === 1 && rowIndex + rowSpan >= headerRows.length
        });
        colIndex += colSpan;
      });
    });
    table._baHeaderLayout = layout;
    return layout;
  }

  function getLeafHeaderColumns(table) {
    const layout = getHeaderLayout(table);
    const columns = [];
    layout.forEach(meta => {
      if (!meta.isLeaf) return;
      if (meta.th.dataset.fixedColumn === 'true') return;
      const label = getHeaderLabel(meta.th);
      if (label) columns.push({ index: meta.start + 1, label });
    });
    return columns;
  }

  function syncCustomizedHeaderColumns(table, hidden) {
    const layout = getHeaderLayout(table);
    layout.forEach(meta => {
      const visibleSpan = Array.from({ length: meta.colSpan }, (_, offset) => meta.start + offset + 1)
        .filter(index => !hidden.has(index)).length;
      if (meta.colSpan > 1) {
        meta.th.style.display = visibleSpan ? '' : 'none';
        meta.th.colSpan = Math.max(1, visibleSpan);
        return;
      }
      meta.th.style.display = hidden.has(meta.start + 1) ? 'none' : '';
      meta.th.colSpan = 1;
    });
  }

  function applyCustomizedColumns(table) {
    if (!table) return;
    const key = getTableKey(table);
    const hidden = columnPrefs.get(key) || new Set();
    getHeaderLayout(table).forEach(meta => {
      if (meta.isLeaf && meta.th.dataset.fixedColumn === 'true') hidden.delete(meta.start + 1);
    });
    let style = document.getElementById(`ba-col-style-${key}`);
    if (!style) {
      style = document.createElement('style');
      style.id = `ba-col-style-${key}`;
      document.head.appendChild(style);
    }
    const selector = `#${cssIdent(key)}`;
    style.textContent = Array.from(hidden)
      .map(index => `${selector} tbody tr > :nth-child(${index}),${selector} tfoot tr > :nth-child(${index}){display:none!important;}`)
      .join('\n');
    syncCustomizedHeaderColumns(table, hidden);
    table.classList.toggle('ba-has-hidden-columns', hidden.size > 0);
  }

  function openColumnChooser(anchor, table) {
    if (!anchor || !table) return;
    closeFilterPopovers();
    closeColumnPopovers();
    const key = getTableKey(table);
    const columns = getLeafHeaderColumns(table);
    const hidden = new Set(columnPrefs.get(key) || []);
    const pop = document.createElement('div');
    pop.className = 'ba-column-popover';
    pop.innerHTML = `
      <div class="ba-column-popover-title">
        <b>自定义表头</b>
        <span>勾选后立即同步</span>
      </div>
      <div class="ba-column-options">
        ${columns.map(col => `
          <label>
            <input type="checkbox" value="${col.index}" ${hidden.has(col.index) ? '' : 'checked'}>
            <span>${escapeHtml(col.label)}</span>
          </label>
        `).join('')}
      </div>
      <div class="ba-column-popover-foot">
        <button type="button" data-action="show-all">显示全部字段</button>
      </div>
    `;
    document.body.appendChild(pop);
    const placePopover = () => {
      if (!pop.isConnected) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(520, Math.max(360, window.innerWidth - 24));
      pop.style.width = `${width}px`;
      pop.style.left = `${Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)) + window.scrollX}px`;
      pop.style.top = `${rect.bottom + 6 + window.scrollY}px`;
    };
    placePopover();

    pop.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        const nextHidden = new Set();
        pop.querySelectorAll('input[type="checkbox"]').forEach(item => {
          if (!item.checked) nextHidden.add(Number(item.value));
        });
        if (nextHidden.size >= columns.length) {
          input.checked = true;
          nextHidden.delete(Number(input.value));
        }
        columnPrefs.set(key, nextHidden);
        applyCustomizedColumns(table);
      });
    });
    pop.querySelector('[data-action="show-all"]')?.addEventListener('click', () => {
      columnPrefs.set(key, new Set());
      pop.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = true);
      applyCustomizedColumns(table);
    });

    setTimeout(() => {
      window.addEventListener('scroll', placePopover, true);
      window.addEventListener('resize', placePopover);
      pop._baCleanup = () => {
        window.removeEventListener('scroll', placePopover, true);
        window.removeEventListener('resize', placePopover);
      };
      document.addEventListener('click', function handler(ev) {
        if (!pop.contains(ev.target) && ev.target !== anchor) {
          if (typeof pop._baCleanup === 'function') pop._baCleanup();
          pop.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 0);
  }

  window.openBankColumnChooser = function(anchor, tableOrSelector) {
    const table = typeof tableOrSelector === 'string'
      ? document.querySelector(tableOrSelector)
      : tableOrSelector;
    openColumnChooser(anchor, table);
  };

  function bindColumnChooserButtons() {
    const bind = (id, tableGetter) => {
      const btn = document.getElementById(id);
      if (!btn || btn.dataset.baColumnChooserBound === '1') return;
      btn.dataset.baColumnChooserBound = '1';
      btn.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        openColumnChooser(btn, tableGetter());
      });
    };
    bind('btnCustomizeCols', () => document.getElementById('tblAccountSummary'));
    bind('statementCustomizeCols', () => document.getElementById('statementFlowTable'));
    bind('btnHead', () => {
      const view = document.querySelector('#tblSwitcher .opt.active')?.dataset.view || 'deal';
      return document.getElementById(view === 'corp' ? 'tblCorp' : 'tblDeal');
    });
  }

  function openFilterPopover(event, table, index, th) {
    event.stopPropagation();
    closeFilterPopovers();
    const values = Array.from(new Set(Array.from(table.tBodies[0]?.rows || [])
      .map(row => getCellText(row, index))
      .filter(Boolean))).slice(0, 80);
    const filters = tableFilters.get(table) || new Map();
    const selected = filters.get(index) || new Set(values);

    const pop = document.createElement('div');
    pop.className = 'ba-table-filter-popover';
    pop.innerHTML = `
      <div class="ba-filter-title">${(th.childNodes[0]?.textContent || th.innerText || '筛选').trim()}</div>
      <div class="ba-filter-options">
        ${values.map(v => `
          <label>
            <input type="checkbox" value="${v.replace(/"/g, '&quot;')}" ${selected.has(v) ? 'checked' : ''}>
            <span>${v}</span>
          </label>
        `).join('') || '<div class="ba-filter-empty">暂无可筛选内容</div>'}
      </div>
      <div class="ba-filter-actions">
        <button type="button" data-action="clear">清空</button>
        <button type="button" data-action="all">全选</button>
        <button type="button" data-action="apply">确定</button>
      </div>
    `;
    document.body.appendChild(pop);
    const rect = th.getBoundingClientRect();
    pop.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
    pop.style.top = (rect.bottom + 4) + 'px';

    pop.querySelector('[data-action="clear"]').addEventListener('click', () => {
      pop.querySelectorAll('input').forEach(input => input.checked = false);
    });
    pop.querySelector('[data-action="all"]').addEventListener('click', () => {
      pop.querySelectorAll('input').forEach(input => input.checked = true);
    });
    pop.querySelector('[data-action="apply"]').addEventListener('click', () => {
      const next = new Set(Array.from(pop.querySelectorAll('input:checked')).map(input => input.value));
      filters.set(index, next);
      tableFilters.set(table, filters);
      th.classList.toggle('ba-filtered', next.size !== values.length);
      applyTableFilters(table);
      pop.remove();
    });

    setTimeout(() => {
      document.addEventListener('click', function handler(ev) {
        if (!pop.contains(ev.target)) {
          pop.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 0);
  }

  function enhanceTable(table) {
    if (table.dataset.baEnhanced === '1') return;
    table.dataset.baEnhanced = '1';
    const skipHeaderLabels = new Set(['操作', '备注', '备注说明', '缺失原因', '支持性文件索引', '差异说明', '校验情况']);
    const headerRows = Array.from(table.tHead?.rows || []);
    const headerGrid = [];
    const leafHeaders = [];
    headerRows.forEach((row, rowIndex) => {
      headerGrid[rowIndex] ||= [];
      let colIndex = 0;
      Array.from(row.cells).forEach(th => {
        while (headerGrid[rowIndex][colIndex]) colIndex += 1;
        const rowSpan = th.rowSpan || 1;
        const colSpan = th.colSpan || 1;
        for (let r = 0; r < rowSpan; r += 1) {
          headerGrid[rowIndex + r] ||= [];
          for (let c = 0; c < colSpan; c += 1) {
            headerGrid[rowIndex + r][colIndex + c] = true;
          }
        }
        if (colSpan === 1 && rowIndex + rowSpan >= headerRows.length) {
          leafHeaders.push({ th, index: colIndex });
        }
        colIndex += colSpan;
      });
    });
    leafHeaders.forEach(({ th, index }) => {
        const labelSource = th.querySelector('span') || th;
        const label = (labelSource.textContent || '').trim();
        if (skipHeaderLabels.has(label)) th.classList.add('no-sort');
        if (th.classList.contains('no-sort') || th.querySelector('.ba-th-tools') || th.colSpan > 1) return;
        const tools = document.createElement('span');
        tools.className = 'ba-th-tools';
        tools.innerHTML = `
          <span class="ba-sort-icons" aria-label="排序">
            <button type="button" class="ba-sort-up" title="升序"></button>
            <button type="button" class="ba-sort-down" title="降序"></button>
          </span>
          <button type="button" class="ba-filter-btn" title="筛选"></button>
        `;
        if (table.classList.contains('bank-reconcile-table') && !th.querySelector('.ba-th-title')) {
          const titleNodes = Array.from(th.childNodes).filter(node => {
            if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim();
            if (node.nodeType === Node.ELEMENT_NODE) return !node.matches('em');
            return false;
          });
          if (titleNodes.length) {
            const titleWrap = document.createElement('span');
            titleWrap.className = 'ba-th-title';
            th.insertBefore(titleWrap, th.firstChild);
            titleNodes.forEach(node => titleWrap.appendChild(node));
          }
        }
        th.appendChild(tools);
        tools.querySelector('.ba-sort-up').addEventListener('click', ev => {
          ev.stopPropagation();
          sortTableByColumn(table, index, 'asc', th);
        });
        tools.querySelector('.ba-sort-down').addEventListener('click', ev => {
          ev.stopPropagation();
          sortTableByColumn(table, index, 'desc', th);
        });
        tools.querySelector('.ba-filter-btn').addEventListener('click', ev => {
          openFilterPopover(ev, table, index, th);
        });
    });
  }

  const statementFlowState = {
    initialized: false,
    page: 1,
    pageSize: 20,
    total: 26301,
    rows: []
  };

  function statementMoney(n) {
    return `${Number(n || 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}K`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }

  function buildStatementFlowRows() {
    const selfUnits = [
      ['华东制造集团有限公司', '1001***0821'],
      ['上海星河科技有限公司', '1002***4186'],
      ['苏州精密装备有限公司', '2001***7739'],
      ['宁波东海电子有限公司', '3001***2268'],
      ['杭州云岭材料有限公司', '4001***1578']
    ];
    const counterparties = [
      ['上海凌云工业控制有限公司', '客户', '华东智能制造集团', '战略客户', '', '2023-01-15', '', '', '', '', ''],
      ['深圳恒创电子科技有限公司', '客户', '华南电子集团', '经销客户', '', '2023-03-08', '', '', '', '', ''],
      ['廊坊中晟包装有限公司', '供应商', '北方包装集团', '', '原材料供应商', '', '', '2023-02-20', '', '', ''],
      ['郑州华辰电气有限公司', '客户', '中原装备集团', '项目客户', '', '2024-01-12', '', '', '', '', ''],
      ['贵阳恒通运输有限公司', '供应商', '西南物流集团', '', '运输服务商', '', '', '2023-06-05', '', '', ''],
      ['张明远（个人）', '个人', '', '', '', '', '', '', '', '2022-07-01', ''],
      ['成都明泰机械有限公司', '供应商', '西部机械集团', '', '设备供应商', '', '', '2024-04-18', '', '', ''],
      ['青岛瑞海国际贸易有限公司', '客户', '沿海贸易集团', '出口客户', '', '2023-09-22', '', '', '', '', ''],
      ['武汉科瑞自动化有限公司', '客户', '华中自动化集团', '长期客户', '', '2025-01-10', '', '', '', '', ''],
      ['厦门海盛供应链有限公司', '供应商', '海峡供应链集团', '', '贸易供应商', '', '', '2024-08-14', '', '', '']
    ];
    const summaries = ['销售回款', '设备采购款', '材料采购款', '运输服务结算', '项目预付款', '技术服务费', '押金保证金', '往来款', '员工报销', '租赁费用'];
    const txTypes = ['网银转账', '柜面转账', '银企直连', '承兑到期', '代发代扣'];
    const rows = [];
    for (let i = 0; i < statementFlowState.total; i += 1) {
      const year = 2023 + (i % 3);
      const month = String((i % 12) + 1).padStart(2, '0');
      const day = String((i * 7) % 28 + 1).padStart(2, '0');
      const hour = String(9 + (i % 9)).padStart(2, '0');
      const minute = String((i * 11) % 60).padStart(2, '0');
      const self = selfUnits[i % selfUnits.length];
      const cp = counterparties[i % counterparties.length];
      const isInflow = cp[1] === '客户' || (i % 5 === 0 && cp[1] !== '供应商');
      const amount = 180000 + ((i * 37931) % 5200000);
      const balance = 6800000 + ((i * 81427) % 48000000);
      const currency = i % 19 === 0 ? 'USD' : 'RMB';
      const rate = currency === 'USD' ? 7.12 : 1;
      rows.push({
        selfName: self[0],
        selfAccount: self[1],
        counterparty: cp[0],
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minute}:${String((i * 17) % 60).padStart(2, '0')}`,
        currency,
        inflow: isInflow ? amount : 0,
        outflow: isInflow ? 0 : amount,
        balance,
        rmbBalance: Math.round(balance * rate),
        txType: txTypes[i % txTypes.length],
        flowId: `BF${year}${month}${String(i + 1).padStart(7, '0')}`,
        summary: summaries[i % summaries.length],
        dueNote: i % 13 === 0 ? '需补充合同或发票匹配说明' : i % 17 === 0 ? '已与项目组说明用途' : '',
        relation: cp[1] === '个人' ? '员工/个人往来' : (i % 9 === 0 ? '疑似关联方' : '非关联方'),
        group: cp[2],
        cpType: cp[1],
        salesType: cp[3],
        purchaseType: cp[4],
        customerApprove: cp[5],
        customerInvalid: cp[6],
        supplierApprove: cp[7],
        supplierInvalid: cp[8],
        hireDate: cp[9],
        leaveDate: cp[10]
      });
    }
    return rows;
  }

  function renderStatementFlowTable() {
    const body = document.getElementById('statementFlowBody');
    const pager = document.getElementById('statementFlowPager');
    const count = document.getElementById('statementFlowCount');
    if (!body || !pager) return;
    if (!statementFlowState.rows.length) statementFlowState.rows = buildStatementFlowRows();
    const total = statementFlowState.rows.length;
    const totalPages = Math.max(1, Math.ceil(total / statementFlowState.pageSize));
    statementFlowState.page = Math.max(1, Math.min(statementFlowState.page, totalPages));
    const start = (statementFlowState.page - 1) * statementFlowState.pageSize;
    const list = statementFlowState.rows.slice(start, start + statementFlowState.pageSize);
    body.innerHTML = list.map(row => `
      <tr>
        <td>${escapeHtml(row.selfName)}</td>
        <td>${escapeHtml(row.selfAccount)}</td>
        <td>${escapeHtml(row.counterparty)}</td>
        <td>${row.date}</td>
        <td>${row.time}</td>
        <td>${row.currency}</td>
        <td class="amount-in">${row.inflow ? statementMoney(row.inflow) : '0K'}</td>
        <td class="amount-out">${row.outflow ? statementMoney(row.outflow) : '0K'}</td>
        <td>${statementMoney(row.balance)}</td>
        <td>${statementMoney(row.rmbBalance)}</td>
        <td>${escapeHtml(row.txType)}</td>
        <td>${row.flowId}</td>
        <td>${escapeHtml(row.summary)}</td>
        <td><input class="ba-note-input" value="${escapeHtml(row.dueNote)}" placeholder="填写尽调备注"/></td>
        <td>${escapeHtml(row.relation)}</td>
        <td>${escapeHtml(row.group || '—')}</td>
        <td>${escapeHtml(row.cpType)}</td>
        <td>${escapeHtml(row.salesType || '—')}</td>
        <td>${escapeHtml(row.purchaseType || '—')}</td>
        <td>${escapeHtml(row.customerApprove || '—')}</td>
        <td>${escapeHtml(row.customerInvalid || '—')}</td>
        <td>${escapeHtml(row.supplierApprove || '—')}</td>
        <td>${escapeHtml(row.supplierInvalid || '—')}</td>
        <td>${escapeHtml(row.hireDate || '—')}</td>
        <td>${escapeHtml(row.leaveDate || '—')}</td>
      </tr>
    `).join('');
    const table = document.getElementById('statementFlowTable');
    if (table?.dataset.baEnhanced === '1') applyTableFilters(table);
    if (table) applyCustomizedColumns(table);
    if (count) count.textContent = `共 ${total.toLocaleString('zh-CN')} 条，当前展示 ${start + 1}-${Math.min(start + statementFlowState.pageSize, total)} / ${total.toLocaleString('zh-CN')}`;
    renderAuditPager(pager, {
      total,
      page: statementFlowState.page,
      pageSize: statementFlowState.pageSize,
      onPage(next) {
        statementFlowState.page = next;
        renderStatementFlowTable();
      },
      onPageSize(size) {
        statementFlowState.pageSize = size;
        statementFlowState.page = 1;
        renderStatementFlowTable();
      }
    });
  }

  function initStatementFlowQuery() {
    const table = document.getElementById('statementFlowTable');
    if (!table) return;
    renderStatementFlowTable();
    if (statementFlowState.initialized) return;
    statementFlowState.initialized = true;
    document.getElementById('statementResetFilters')?.addEventListener('click', () => {
      tableFilters.delete(table);
      table.querySelectorAll('th').forEach(th => th.classList.remove('ba-filtered', 'ba-sort-asc', 'ba-sort-desc'));
      renderStatementFlowTable();
    });
    document.getElementById('statementGenerateFlow')?.addEventListener('click', () => {
      alert('已生成当前筛选范围流水');
    });
  }

  function stripTableKUnits(root = document) {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll('table td').forEach(cell => {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(node => {
        const next = node.nodeValue.replace(/(-?\d[\d,.]*)K\b/g, '$1');
        if (next !== node.nodeValue) node.nodeValue = next;
      });
    });
  }

  let stripTableKTimer = null;
  function scheduleStripTableKUnits() {
    clearTimeout(stripTableKTimer);
    stripTableKTimer = setTimeout(() => stripTableKUnits(document), 20);
  }

  function initBankTableTools() {
    initStatementFlowQuery();
    stripTableKUnits(document);
    document.querySelectorAll('.tab-pane table.table, .dm-tab-pane table.table').forEach(enhanceTable);
    bindColumnChooserButtons();
    document.querySelectorAll('.tab-pane table.table, .dm-tab-pane table.table').forEach(applyCustomizedColumns);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBankTableTools);
  } else {
    initBankTableTools();
  }
  window.addEventListener('bank-analysis:tab-change', initBankTableTools);
  if (!window.__auditTableKUnitObserver) {
    window.__auditTableKUnitObserver = new MutationObserver(scheduleStripTableKUnits);
    window.__auditTableKUnitObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
})();
