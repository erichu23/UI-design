/* =============== 工具 =============== */

  function auditFiscalYearLabel(year){
    const value=String(year??'').trim();
    const period=`财年期间：${value}-01-01～${value}-12-31`;
    return `<span class="audit-fiscal-year-label"><span>${value}</span><span class="audit-fiscal-info" data-audit-fiscal-period="${period}" tabindex="0" aria-label="${period}">i</span></span>`;
  }
  window.auditFiscalYearLabel=auditFiscalYearLabel;

  (function initAuditFiscalTooltip(){
    let tooltip=null;
    const ensureTooltip=()=>{
      if(tooltip)return tooltip;
      tooltip=document.createElement('div');
      tooltip.className='audit-fiscal-tooltip';
      tooltip.setAttribute('role','tooltip');
      document.body.appendChild(tooltip);
      return tooltip;
    };
    const place=target=>{
      const box=ensureTooltip();
      const rect=target.getBoundingClientRect();
      const pad=8;
      box.style.left=`${rect.left+rect.width/2}px`;
      box.style.top=`${rect.top-7}px`;
      box.style.transform='translate(-50%,-100%)';
      const tipRect=box.getBoundingClientRect();
      if(tipRect.left<pad)box.style.left=`${pad+tipRect.width/2}px`;
      if(tipRect.right>window.innerWidth-pad)box.style.left=`${window.innerWidth-pad-tipRect.width/2}px`;
      if(tipRect.top<pad){box.style.top=`${rect.bottom+7}px`;box.style.transform='translate(-50%,0)';}
    };
    const show=target=>{
      const text=target?.dataset?.auditFiscalPeriod;
      if(!text)return;
      const box=ensureTooltip();
      box.textContent=text;
      box.classList.add('is-show');
      place(target);
    };
    const hide=()=>tooltip?.classList.remove('is-show');
    document.addEventListener('mouseover',event=>{const target=event.target.closest?.('.audit-fiscal-info');if(target)show(target);});
    document.addEventListener('mousemove',event=>{const target=event.target.closest?.('.audit-fiscal-info');if(target)place(target);});
    document.addEventListener('mouseout',event=>{if(event.target.closest?.('.audit-fiscal-info'))hide();});
    document.addEventListener('focusin',event=>{const target=event.target.closest?.('.audit-fiscal-info');if(target)show(target);});
    document.addEventListener('focusout',event=>{if(event.target.closest?.('.audit-fiscal-info'))hide();});
    window.addEventListener('scroll',hide,true);
    window.addEventListener('resize',hide);
  })();

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
      verify:"本页集中展示数据问题、余额连续性和缺失账号校验，帮助用户完成银行流水完整性检查。",
      "scope-control":"本页统一维护分析范围，并提供总账核对和分账号核对，确认纳入分析的数据与账面记录一致。",
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
        // 账号总览/资金总览的月度柱条由各自表格状态管理，不能在这里覆盖其年份与金额属性。
        if (wrap.closest('#tblAccountSummary')) return;
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

      const accountSummaryTable = document.getElementById('tblAccountSummary');
      const ownsValidationChecks = Boolean(accountSummaryTable?.closest('.data-management-page'));
      const checkWindows = ownsValidationChecks ? [] : [...document.querySelectorAll('#tblAccountSummary .check-window')];
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
          // 保留按钮等控件自身点击，避免 Chromium 将 click 改派给拖拽容器。
          if (event.target.closest?.('button,a,input,select,textarea,[role="button"],[data-no-drag]')) return;
          if (event.button !== undefined && event.button !== 0) return;
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
          zoomStart:0,
          zoomEnd:100
        };
      };
      const getMonthlyFlowView = view => {
        const monthly = new Map();
        view.dates.forEach((date,index) => {
          const month = String(date).slice(0,7);
          if (!monthly.has(month)) monthly.set(month,{ month,inflow:0,outflow:0 });
          const row = monthly.get(month);
          row.inflow += Number(view.inflow[index] || 0);
          row.outflow += Number(view.outflow[index] || 0);
        });
        const rows = [...monthly.values()];
        return {
          dates:rows.map(row => row.month),
          inflow:rows.map(row => row.inflow),
          outflow:rows.map(row => row.outflow),
          zoomStart:view.zoomStart,
          zoomEnd:view.zoomEnd
        };
      };
      let activeTrendView = getTrendRangeView('2023-2025');
      let activeMonthlyFlowView = getMonthlyFlowView(activeTrendView);
      const trendUnitLabel = () => window.AuditUnit?.ready ? window.AuditUnit.label : '千元';
      const formatTrendNumber = value => {
        const decimals = window.AuditUnit?.ready ? window.AuditUnit.decimals : 2;
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
      const formatMonthlyFlowTooltip = params => {
        const rows = Array.isArray(params) ? params : [params];
        const month = String(rows[0]?.axisValue || '');
        const title = month.length >= 7 ? `${month.slice(0,4)}年${month.slice(5,7)}月` : month;
        const values = rows.map(item => `${item.marker || ''}${item.seriesName}：<b>${formatTrendNumber(item.value)}</b>`).join('<br>');
        return `<div style="min-width:142px"><b>${title}</b><div style="height:5px"></div>${values}<div style="margin-top:4px;color:#64748b">单位：${trendUnitLabel()}</div></div>`;
      };
      const trendAxisPointer = {
        type:'line',
        snap:true,
        lineStyle:{color:'#94a3b8',width:1,type:'dashed'}
      };
      const isTrendMonthTick = (index, value) => String(value || '').slice(8, 10) === '01';
      const formatTrendMonthTick = value => {
        const text = String(value || '');
        const year = text.slice(0, 4);
        const month = text.slice(5, 7);
        const firstYear = activeTrendView.dates[0]?.slice(0, 4);
        const lastYear = activeTrendView.dates[activeTrendView.dates.length - 1]?.slice(0, 4);
        return firstYear !== lastYear ? `${year.slice(2)}/${month}` : `${month}月`;
      };
      const trendMonthAxis = {
        name:'日期',
        nameLocation:'end',
        nameGap:5,
        nameTextStyle:{color:'#94a3b8',fontSize:9,padding:[18,0,0,0]},
        axisLine:{lineStyle:{color:'#cbd5e1'}},
        axisTick:{show:true,alignWithLabel:true,interval:isTrendMonthTick,lineStyle:{color:'#cbd5e1'}},
        axisLabel:{
          color:'#64748b',
          fontSize:9,
          hideOverlap:true,
          margin:8,
          interval:isTrendMonthTick,
          formatter:formatTrendMonthTick
        }
      };
      const trendFlowMonthAxis = {
        name:'月份',
        nameLocation:'end',
        nameGap:5,
        nameTextStyle:{color:'#94a3b8',fontSize:9,padding:[18,0,0,0]},
        axisLine:{lineStyle:{color:'#cbd5e1'}},
        axisTick:{show:true,alignWithLabel:true,lineStyle:{color:'#cbd5e1'}},
        axisLabel:{
          color:'#64748b',
          fontSize:9,
          hideOverlap:true,
          margin:8,
          interval:0,
          formatter:value => {
            const text = String(value || '');
            const year = text.slice(0,4);
            const month = text.slice(5,7);
            const firstYear = activeMonthlyFlowView.dates[0]?.slice(0,4);
            const lastYear = activeMonthlyFlowView.dates[activeMonthlyFlowView.dates.length - 1]?.slice(0,4);
            return firstYear !== lastYear ? `${year.slice(2)}/${month}` : `${month}月`;
          }
        }
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
          grid: { left:62, right:38, top:30, bottom:46, containLabel:false },
          xAxis: { type:'category', boundaryGap:false, data:activeTrendView.dates, ...trendMonthAxis },
          yAxis: { type:'value', min:0, splitLine:{lineStyle:{color:'#eef2f7'}}, axisLabel:{color:'#64748b',fontSize:10,formatter:formatTrendNumber} },
          dataZoom: [{ type:'inside', start:activeTrendView.zoomStart, end:activeTrendView.zoomEnd }, { type:'slider', start:activeTrendView.zoomStart, end:activeTrendView.zoomEnd, height:10, bottom:4, borderColor:'transparent', backgroundColor:'#eef2f7', fillerColor:'rgba(79,134,174,.18)', handleSize:0, showDetail:false }],
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
        const inflowData = activeMonthlyFlowView.inflow;
        const outflowData = activeMonthlyFlowView.outflow;
        chart.setOption({
          animationDuration: 450,
          color: ['#3b82f6', '#d95785'],
          title:{ text:`流入 / 流出（${trendUnitLabel()}）`, left:10, top:0, textStyle:{color:'#334155',fontSize:11,fontWeight:700} },
          tooltip: { trigger:'axis', axisPointer:trendAxisPointer, confine:true, formatter:formatMonthlyFlowTooltip },
          legend: {
            right: 8,
            top: 0,
            itemWidth: 10,
            itemHeight: 6,
            textStyle: { color: '#475569', fontSize: 10 }
          },
          grid: { left: 62, right: 38, top: 30, bottom: 46, containLabel: false },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            data: activeMonthlyFlowView.dates,
            ...trendFlowMonthAxis
          },
          yAxis: {
            type: 'value',
            min: 0,
            splitLine: { lineStyle: { color: '#eef2f7' } },
            axisLabel: { color: '#64748b', fontSize: 10, formatter: formatTrendNumber }
          },
          dataZoom: [
            { type:'inside', start:activeMonthlyFlowView.zoomStart, end:activeMonthlyFlowView.zoomEnd },
            { type:'slider', start:activeMonthlyFlowView.zoomStart, end:activeMonthlyFlowView.zoomEnd, height:10, bottom:4, borderColor:'transparent', backgroundColor:'#eef2f7', fillerColor:'rgba(47,111,237,.16)', handleSize:0, showDetail:false }
          ],
          series: [
            {
              name:'流入金额',type:'bar',barMaxWidth:18,barGap:'18%',barCategoryGap:'42%',
              itemStyle:{color:'#3b82f6',borderRadius:[3,3,0,0]},
              emphasis:{focus:'series',itemStyle:{color:'#2563eb',shadowColor:'rgba(37,99,235,.18)',shadowBlur:5}},
              data:inflowData
            },
            {
              name:'流出金额',type:'bar',barMaxWidth:18,barGap:'18%',barCategoryGap:'42%',
              itemStyle:{color:'#d95785',borderRadius:[3,3,0,0]},
              emphasis:{focus:'series',itemStyle:{color:'#cf466f',shadowColor:'rgba(207,70,111,.18)',shadowBlur:5}},
              data:outflowData
            }
          ]
        });
        window.bankAccountIoChart = chart;
      }

      document.getElementById('accountTrendYearSelect')?.addEventListener('change',event => {
        activeTrendView = getTrendRangeView(event.target.value);
        activeMonthlyFlowView = getMonthlyFlowView(activeTrendView);
        window.bankAccountBalanceChart?.setOption({
          xAxis:{data:activeTrendView.dates},
          dataZoom:[{start:activeTrendView.zoomStart,end:activeTrendView.zoomEnd},{start:activeTrendView.zoomStart,end:activeTrendView.zoomEnd}],
          series:[{data:activeTrendView.balance}]
        });
        window.bankAccountIoChart?.setOption({
          xAxis:{data:activeMonthlyFlowView.dates},
          dataZoom:[{start:activeMonthlyFlowView.zoomStart,end:activeMonthlyFlowView.zoomEnd},{start:activeMonthlyFlowView.zoomStart,end:activeMonthlyFlowView.zoomEnd}],
          series:[{data:activeMonthlyFlowView.inflow},{data:activeMonthlyFlowView.outflow}]
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
      if(btn.dataset.localBound==='1')return;
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
          btn.setAttribute('aria-expanded', String(expanded));
          document.querySelectorAll(`.group-${groupId}`).forEach(d=>{
            d.style.display = expanded ? 'table-row' : 'none';
          });
        });
      });
    });

    function initReconcilePagination(){
      const showReconcileSaveToast = message => {
        const toast = document.getElementById('dmMasterToast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible', 'is-success');
        window.clearTimeout(showReconcileSaveToast.timer);
        showReconcileSaveToast.timer = window.setTimeout(() => {
          toast.classList.remove('is-visible', 'is-success');
        }, 2200);
      };
      const compactHeaders = new Set(['账面期初金额','账面流出金额','账面流入金额','账面期末金额','期初差异','借方差异','贷方差异','期末差异']);
      document.querySelectorAll('.bank-reconcile-table thead th').forEach(th=>{
        const label=(th.querySelector('span')?.textContent||th.textContent||'').trim();
        if(!compactHeaders.has(label))return;
        th.classList.add('no-sort','reconcile-compact-head');
        th.querySelector('.ba-th-tools')?.remove();
      });
      const fmt = value => Number(value).toLocaleString('zh-CN');
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
        return {
          company:company[0], relation:'发行人', account:withAccount?accounts[i%accounts.length]:'',
          bank:withAccount?banks[i%banks.length]:'', source:withAccount?'银行流水':'', year, currency,
          bankValues:[end,inflow,outflow,final], bookValues:[bookOpen,bookOut,bookIn,bookFinal],
          note:Math.abs(finalDiff)>1000?'差异待复核':'核对一致', updater:'项目组成员', updateTime:'2026-08-25 14:30'
        };
      };
      const generalRows = Array.from({length:24}, (_,i)=>makeRow(1086000, i, false));
      const accountRows = Array.from({length:36}, (_,i)=>makeRow(836000, i, true));
      const pagers = {
        general: { body: document.getElementById('generalLedgerReconcileBody'), pager: document.getElementById('generalLedgerReconcilePager'), rows: generalRows, page: 1, pageSize: 20, editing:false },
        account: { body: document.getElementById('accountReconcileBody'), pager: document.getElementById('accountReconcilePager'), rows: accountRows, page: 1, pageSize: 20, editing:false }
      };
      const parseCsv = text => {
        const rows = [];
        let row = [], cell = '', quoted = false;
        for (let index = 0; index < text.length; index += 1) {
          const character = text[index];
          if (character === '"') {
            if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
            else quoted = !quoted;
          } else if (character === ',' && !quoted) {
            row.push(cell.trim()); cell = '';
          } else if ((character === '\n' || character === '\r') && !quoted) {
            if (character === '\r' && text[index + 1] === '\n') index += 1;
            row.push(cell.trim());
            if (row.some(value => value !== '')) rows.push(row);
            row = []; cell = '';
          } else cell += character;
        }
        row.push(cell.trim());
        if (row.some(value => value !== '')) rows.push(row);
        return rows;
      };
      const readImportMatrix = async file => {
        if (window.auditReconcileImportAdapter?.parseFile) return window.auditReconcileImportAdapter.parseFile(file);
        if (/\.csv$/i.test(file.name)) return parseCsv(await file.text());
        if (window.XLSX) {
          const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
          return window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: false, defval: '' });
        }
        throw new Error('EXCEL_PARSER_UNAVAILABLE');
      };
      const importHeaderAliases = {
        company:['公司名称','被审计单位公司'], account:['银行账号','本方账号'], bank:['开户银行','银行名称'],
        year:['期间','年度'], currency:['币种'], bookOpen:['账面期初金额'], bookOut:['账面流出金额'],
        bookIn:['账面流入金额'], bookFinal:['账面期末金额'], note:['差异说明','备注']
      };
      const normalizeNumber = value => Number(String(value ?? '').replace(/[,%\s]/g,'')) || 0;
      const importRows = (matrix, state, key) => {
        if (!Array.isArray(matrix) || matrix.length < 2) return 0;
        const headers = matrix[0].map(value => String(value ?? '').trim());
        const positions = Object.fromEntries(Object.entries(importHeaderAliases).map(([field,labels]) => [field,headers.findIndex(header => labels.includes(header))]));
        if (positions.company < 0) return 0;
        const imported = matrix.slice(1).filter(values => values.some(value => String(value ?? '').trim())).map((values,index) => {
          const existing = state.rows[index] || makeRow(836000, index, key === 'account');
          const read = field => positions[field] < 0 ? undefined : values[positions[field]];
          const now = new Date();
          const stamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
          return {
            ...existing, company:String(read('company') ?? existing.company).trim(),
            account:key === 'account' ? String(read('account') ?? existing.account).trim() : '',
            bank:key === 'account' ? String(read('bank') ?? existing.bank).trim() : '',
            year:Number(read('year')) || existing.year, currency:String(read('currency') ?? existing.currency).trim() || 'RMB',
            bookValues:[
              positions.bookOpen < 0 ? existing.bookValues[0] : normalizeNumber(read('bookOpen')),
              positions.bookOut < 0 ? existing.bookValues[1] : normalizeNumber(read('bookOut')),
              positions.bookIn < 0 ? existing.bookValues[2] : normalizeNumber(read('bookIn')),
              positions.bookFinal < 0 ? existing.bookValues[3] : normalizeNumber(read('bookFinal'))
            ],
            note:String(read('note') ?? existing.note).trim(), updater:'当前用户', updateTime:stamp
          };
        });
        if (!imported.length) return 0;
        state.rows.splice(0, state.rows.length, ...imported);
        state.page = 1;
        return imported.length;
      };
      const differences = row => [
        Math.abs(row.bankValues[0]-row.bookValues[0]),
        Math.abs(row.bankValues[1]-row.bookValues[1]),
        Math.abs(row.bankValues[2]-row.bookValues[2]),
        Math.abs(row.bankValues[3]-row.bookValues[3])
      ];
      const rowValues = (row,key) => [
        row.company,...(key==='account'?[row.account,row.bank]:[]),
        row.year,row.currency,...row.bankValues,...row.bookValues,...differences(row),row.note,row.updater,row.updateTime
      ];
      const renderRow = (row,key,editing) => {
        const prefix = key==='account'
          ? [row.company,row.account,row.bank,row.year,row.currency]
          : [row.company,row.year,row.currency];
        const bankCells = row.bankValues.map((value,index)=>`<td class="${index===1?'amount-in':index===2?'amount-out':''}">${fmt(value)}</td>`).join('');
        const bookCells = row.bookValues.map((value,index)=>`<td class="reconcile-book-cell">${editing?`<input class="reconcile-book-input" data-book-index="${index}" inputmode="decimal" value="${value}"/>`:fmt(value)}</td>`).join('');
        const diffCells = differences(row).map(value=>`<td class="reconcile-diff-cell ${value?'has-difference':''}">${value?fmt(value):'0'}</td>`).join('');
        return `<tr>${prefix.map(value=>`<td>${value}</td>`).join('')}${bankCells}${bookCells}${diffCells}<td><input class="ba-note-input reconcile-note-input" value="${row.note}"/></td><td>${row.updater}</td><td>${row.updateTime}</td></tr>`;
      };
      const render = key => {
        const state = pagers[key];
        if (!state.body || !state.pager) return;
        const pages = Math.max(1, Math.ceil(state.rows.length / state.pageSize));
        state.page = Math.min(Math.max(1, state.page), pages);
        const start = (state.page - 1) * state.pageSize;
        state.body.innerHTML = state.rows.slice(start, start + state.pageSize).map(row=>renderRow(row,key,state.editing)).join('');
        renderAuditPager(state.pager, {
          total: state.rows.length,
          page: state.page,
          pageSize: state.pageSize,
          onPage(next){ state.page = next; render(key); },
          onPageSize(size){ state.pageSize = size; state.page = 1; render(key); }
        });
      };
      Object.entries(pagers).forEach(([key,state])=>{
        state.body?.addEventListener('input',event=>{
          const rowElement=event.target.closest('tr');
          if(!rowElement)return;
          const index=(state.page-1)*state.pageSize+Array.from(state.body.rows).indexOf(rowElement);
          const row=state.rows[index];
          if(!row)return;
          const bookInput=event.target.closest('[data-book-index]');
          if(bookInput){
            row.bookValues[Number(bookInput.dataset.bookIndex)]=Number(String(bookInput.value).replace(/,/g,''))||0;
            const diffStart=key==='account'?13:11;
            differences(row).forEach((value,offset)=>{
              const cell=rowElement.cells[diffStart+offset];
              if(!cell)return;
              cell.textContent=value?fmt(value):'0';
              cell.classList.toggle('has-difference',Boolean(value));
            });
          }
          if(event.target.classList.contains('reconcile-note-input'))row.note=event.target.value;
        });
        document.querySelector(`[data-reconcile-edit="${key}"]`)?.addEventListener('click',event=>{
          const isSaving = state.editing;
          if(state.editing){
            const start=(state.page-1)*state.pageSize;
            const now=new Date();
            const stamp=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            state.rows.slice(start,start+state.pageSize).forEach(row=>{row.updater='当前用户';row.updateTime=stamp;});
          }
          state.editing=!state.editing;
          event.currentTarget.textContent=state.editing?'保存':'编辑';
          event.currentTarget.classList.toggle('primary',state.editing);
          render(key);
          if(isSaving)showReconcileSaveToast(`${key==='account'?'分账号核对':'总账核对'}数据保存成功`);
        });
        const importButton = document.querySelector(`[data-reconcile-import="${key}"]`);
        const importInput = document.querySelector(`[data-reconcile-import-file="${key}"]`);
        importButton?.addEventListener('click',()=>importInput?.click());
        importInput?.addEventListener('change',async event=>{
          const file=event.target.files?.[0];
          if(!file)return;
          importButton.disabled=true;
          importButton.setAttribute('aria-busy','true');
          try{
            const count=importRows(await readImportMatrix(file),state,key);
            if(!count)throw new Error('EMPTY_TEMPLATE');
            render(key);
            showReconcileSaveToast(`${key==='account'?'分账号核对':'总账核对'}模板导入成功，共 ${count} 条`);
          }catch(error){
            showReconcileSaveToast(error?.message==='EXCEL_PARSER_UNAVAILABLE'?'当前环境暂不支持解析 Excel，请使用 CSV 模板导入':'模板内容未识别，请检查表头和数据后重试');
          }finally{
            importButton.disabled=false;
            importButton.removeAttribute('aria-busy');
            event.target.value='';
          }
        });
        document.querySelector(`[data-reconcile-export="${key}"]`)?.addEventListener('click',()=>{
          const header=key==='account'
            ? ['公司名称','银行账号','开户银行','期间','币种','期初金额','流入金额','流出金额','期末金额','账面期初金额','账面流出金额','账面流入金额','账面期末金额','期初差异','借方差异','贷方差异','期末差异','差异说明','更新人','更新时间']
            : ['公司名称','期间','币种','期初金额','流入金额','流出金额','期末金额','账面期初金额','账面流出金额','账面流入金额','账面期末金额','期初差异','借方差异','贷方差异','期末差异','差异说明','更新人','更新时间'];
          const csv=[header,...state.rows.map(row=>rowValues(row,key))].map(line=>line.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\n');
          const link=document.createElement('a');
          link.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));
          link.download=`${key==='account'?'分账号核对':'总账核对'}结果.csv`;
          link.click();
          URL.revokeObjectURL(link.href);
        });
      });
      render('general');
      render('account');
    }

    const monthlyFlowExpandButton = () => `<span class="monthly-flow-head-label"><span>月度流入/流出</span><button class="monthly-flow-expand-btn" type="button" data-monthly-flow-expand aria-label="放大查看月度流入流出" title="放大查看月度流入流出"><span class="monthly-flow-expand-icon" aria-hidden="true"></span></button></span>`;
    window.auditMonthlyFlowExpandButton = monthlyFlowExpandButton;
    window.openAuditMonthlyFlowOverview = table => {
      if (!table) return;
      document.querySelector('.monthly-flow-overview-mask')?.remove();
      const escape = value => String(value ?? '').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
      const chartModels = [];
      const rows = [...table.querySelectorAll('tbody tr:not(.sum-row)')].map(row => {
        const company = row.cells[0]?.textContent?.trim() || '—';
        const pairs = [...row.querySelectorAll('.monthly-flow-cell .monthly-flow-pair')];
        if (!pairs.length) return '';
        const years = [...new Set(pairs.map(pair=>pair.dataset.flowYear).filter(Boolean))];
        const maxValue = Math.max(1,...pairs.flatMap(pair=>[Number(pair.dataset.flowIn)||0,Number(pair.dataset.flowOut)||0]));
        const bars = pairs.map((pair,index)=>{
          const year=pair.dataset.flowYear||'';
          const month=pair.dataset.flowMonth||String(index+1);
          const inflow=Number(pair.dataset.flowIn)||0;
          const outflow=Number(pair.dataset.flowOut)||0;
          const yearStart=index>0&&year&&year!==pairs[index-1]?.dataset.flowYear;
          const label=`${year?`${year}年`:''}${String(month).padStart(2,'0')}月，流入 ${inflow.toLocaleString('zh-CN')}，流出 ${outflow.toLocaleString('zh-CN')}`;
          return `<span class="monthly-flow-dialog-pair${yearStart?' is-year-start':''}" title="${escape(label)}"><i class="is-in" style="height:${Math.max(4,inflow/maxValue*100)}%"></i><i class="is-out" style="height:${Math.max(4,outflow/maxValue*100)}%"></i></span>`;
        }).join('');
        const modelIndex=chartModels.length;
        chartModels.push({
          labels:pairs.map((pair,index)=>{
            const year=pair.dataset.flowYear||'';
            const month=pair.dataset.flowMonth||String(index+1);
            return years.length>1?`${String(year).slice(-2)}/${String(month).padStart(2,'0')}`:`${String(month).padStart(2,'0')}月`;
          }),
          inflow:pairs.map(pair=>Number(pair.dataset.flowIn)||0),
          outflow:pairs.map(pair=>Number(pair.dataset.flowOut)||0),
          fallback:bars
        });
        return `<tr><td><b>${escape(company)}</b></td><td><div class="monthly-flow-dialog-echart" data-monthly-flow-chart="${modelIndex}"><div class="monthly-flow-dialog-bars is-fallback">${bars}</div></div></td></tr>`;
      }).filter(Boolean).join('');
      const mask = document.createElement('div');
      mask.className = 'monthly-flow-overview-mask';
      mask.innerHTML = `<section class="monthly-flow-overview-dialog" role="dialog" aria-modal="true" aria-labelledby="monthlyFlowOverviewTitle"><header><div><b id="monthlyFlowOverviewTitle">月度流入/流出</b><span>当前表格视图</span></div><button type="button" data-monthly-flow-close aria-label="关闭">×</button></header><div class="monthly-flow-overview-legend"><span><i class="is-in"></i>流入</span><span><i class="is-out"></i>流出</span></div><main><table><thead><tr><th>被审计单位</th><th>月度流入/流出</th></tr></thead><tbody>${rows||'<tr><td colspan="2" class="is-empty">暂无数据</td></tr>'}</tbody></table></main><footer><button class="btn primary" type="button" data-monthly-flow-close>关闭</button></footer></section>`;
      const charts=[];
      const resizeCharts=()=>charts.forEach(chart=>chart.resize());
      const close = () => { document.removeEventListener('keydown',onKeydown);window.removeEventListener('resize',resizeCharts);charts.forEach(chart=>chart.dispose());mask.remove(); };
      const onKeydown = event => { if (event.key === 'Escape') close(); };
      mask.addEventListener('click',event=>{ if(event.target===mask||event.target.closest('[data-monthly-flow-close]'))close(); });
      document.addEventListener('keydown',onKeydown);
      document.body.appendChild(mask);
      if (window.echarts) {
        mask.querySelectorAll('[data-monthly-flow-chart]').forEach(element=>{
          const model=chartModels[Number(element.dataset.monthlyFlowChart)];
          if(!model)return;
          element.innerHTML='';
          const chart=window.echarts.init(element);
          chart.setOption({
            animationDuration:350,
            color:['#3b82f6','#d95785'],
            grid:{left:48,right:14,top:12,bottom:28},
            tooltip:{trigger:'axis',appendToBody:true,axisPointer:{type:'shadow'},formatter:items=>{
              const first=items?.[0];
              const lines=(items||[]).map(item=>`${item.marker}${item.seriesName}：<b>${Number(item.value||0).toLocaleString('zh-CN')}</b>`).join('<br>');
              return `<div class="monthly-flow-chart-tip"><b>${first?.axisValue||''}</b><div>${lines}</div></div>`;
            }},
            xAxis:{type:'category',data:model.labels,axisTick:{show:false},axisLine:{lineStyle:{color:'#cfd9e5'}},axisLabel:{color:'#718096',fontSize:9,interval:model.labels.length>12?2:0,hideOverlap:true}},
            yAxis:{type:'value',min:0,axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#8090a3',fontSize:9,formatter:value=>Number(value).toLocaleString('zh-CN',{notation:'compact',maximumFractionDigits:1})},splitLine:{lineStyle:{color:'#edf2f7'}}},
            series:[
              {name:'流入金额',type:'bar',data:model.inflow,barMaxWidth:9,barGap:'18%',itemStyle:{color:'#3b82f6',borderRadius:[2,2,0,0]}},
              {name:'流出金额',type:'bar',data:model.outflow,barMaxWidth:9,itemStyle:{color:'#d95785',borderRadius:[2,2,0,0]}}
            ]
          });
          charts.push(chart);
        });
        window.addEventListener('resize',resizeCharts,{passive:true});
      }
    };

    function initAccountSummaryPagination(){
      const table = document.getElementById('tblAccountSummary');
      const head = document.getElementById('accountSummaryHead');
      const body = document.getElementById('accountSummaryBody');
      const pager = document.getElementById('pagination-account');
      const wrap = table?.closest('.account-summary-table-wrap');
      if (table?.dataset.accountSummaryOwner === 'data-management' || table?.closest('.data-management-page')) return;
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
      ].map((item,index)=>{
        const inflowTxCount = Math.round(item[4] * item[1] / item[3]);
        const excludedInflow = Math.round(item[1] * (.84 + (index % 4) * .018));
        const excludedOutflow = Math.round(item[2] * (.80 + (index % 4) * .022));
        const excludedTxCount = Math.round(item[4] * (.82 + (index % 3) * .025));
        const excludedInflowTxCount = Math.round(excludedTxCount * excludedInflow / (excludedInflow + excludedOutflow));
        return {
          company:item[0], inflow:item[1], outflow:item[2], total:item[3],
          txCount:item[4], inflowTxCount, outflowTxCount:item[4]-inflowTxCount,
          cpCount:item[5], fileCount:item[6], index,
          excludedInflow,
          excludedOutflow,
          excludedTxCount,
          excludedInflowTxCount,
          excludedOutflowTxCount:excludedTxCount-excludedInflowTxCount,
          excludedCpCount:Math.max(1, Math.round(item[5] * (.84 + (index % 3) * .02)) )
        };
      });
      const metricOptions = [
        { key:'inflow', label:'流入金额', group:'inflow', groupLabel:'流入', symbol:'¥', annual:true },
        { key:'inflowRatio', label:'流入金额占比', group:'inflow', groupLabel:'流入', symbol:'%', annual:true, defaultHidden:true },
        { key:'inflowTxCount', label:'流入笔数', group:'inflow', groupLabel:'流入', symbol:'#', annual:true, defaultHidden:true },
        { key:'outflow', label:'流出金额', group:'outflow', groupLabel:'流出', symbol:'¥', annual:true },
        { key:'outflowRatio', label:'流出金额占比', group:'outflow', groupLabel:'流出', symbol:'%', annual:true, defaultHidden:true },
        { key:'outflowTxCount', label:'流出笔数', group:'outflow', groupLabel:'流出', symbol:'#', annual:true, defaultHidden:true },
        { key:'total', label:'交易总额', group:'total', groupLabel:'交易总额', symbol:'¥', annual:true },
        { key:'ratio', label:'交易总额占比', group:'total', groupLabel:'交易总额', symbol:'%', annual:true, defaultHidden:true },
        { key:'txCount', label:'交易笔数', group:'total', groupLabel:'交易总额', symbol:'#', annual:true, defaultHidden:true },
        { key:'cpCount', label:'对手方数量', group:'counterparty', groupLabel:'对手方数量', symbol:'#', defaultHidden:true },
        { key:'fileCount', label:'文件数量', group:'file', groupLabel:'文件数量', symbol:'#', defaultHidden:true }
      ];
      const state = {
        page:1,
        pageSize:20,
        yearExpanded:true,
        scopeView:'included',
        visibleMetrics:new Set(metricOptions.filter(item=>!item.defaultHidden).map(item=>item.key))
      };
      const format = value => Number(value).toLocaleString('zh-CN');
      const scopedRow = row => {
        if (state.scopeView === 'included') return row;
        const inflow = row.excludedInflow;
        const outflow = row.excludedOutflow;
        return {
          ...row,
          inflow,
          outflow,
          total:inflow + outflow,
          txCount:row.excludedTxCount,
          inflowTxCount:row.excludedInflowTxCount,
          outflowTxCount:row.excludedOutflowTxCount,
          cpCount:row.excludedCpCount
        };
      };
      const scopedRows = () => rows.map(scopedRow);
      const scopedTotals = viewRows => {
        const result = viewRows.reduce((sum,row)=>({
          inflow:sum.inflow+row.inflow,
          outflow:sum.outflow+row.outflow,
          total:sum.total+row.total,
          txCount:sum.txCount+row.txCount,
          inflowTxCount:sum.inflowTxCount+row.inflowTxCount,
          outflowTxCount:sum.outflowTxCount+row.outflowTxCount,
          fileCount:sum.fileCount+row.fileCount
        }),{inflow:0,outflow:0,total:0,txCount:0,inflowTxCount:0,outflowTxCount:0,fileCount:0});
        result.cpCount = state.scopeView === 'included' ? 100 : 88;
        result.fileCount = 8;
        return result;
      };
      const splitYears = value => {
        const first = Math.round(value * yearWeights[0]);
        const second = Math.round(value * yearWeights[1]);
        return [first, second, value-first-second];
      };
      const formatRatio = (value,total,isTotal=false) => isTotal ? '100.00' : (total ? value / total * 100 : 0).toFixed(2);
      const yearCells = (row,isTotal,totals) => {
        if (!state.yearExpanded) return '';
        const inflow = splitYears(row.inflow);
        const outflow = splitYears(row.outflow);
        const txCount = splitYears(row.txCount);
        const inflowTxCount = splitYears(row.inflowTxCount);
        const outflowTxCount = splitYears(row.outflowTxCount);
        const totalInflow = splitYears(totals.inflow);
        const totalOutflow = splitYears(totals.outflow);
        const totalTxCount = splitYears(totals.txCount);
        const totalInflowTxCount = splitYears(totals.inflowTxCount);
        const totalOutflowTxCount = splitYears(totals.outflowTxCount);
        const annualOptions = metricOptions.filter(item=>item.annual && state.visibleMetrics.has(item.key));
        return years.map((year,index)=>annualOptions.map(item=>{
          const totalValue = inflow[index] + outflow[index];
          const allTotalValue = totalInflow[index] + totalOutflow[index];
          if (item.key === 'inflow') return `<td class="account-year-metric flow-in is-num">${format(inflow[index])}</td>`;
          if (item.key === 'inflowRatio') return `<td class="account-year-metric is-num" data-audit-unit-ignore>${formatRatio(inflow[index],totalInflow[index],isTotal)}</td>`;
          if (item.key === 'inflowTxCount') return `<td class="account-year-metric is-num" data-audit-unit-ignore>${isTotal?`<strong>${format(totalInflowTxCount[index])}</strong>`:format(inflowTxCount[index])}</td>`;
          if (item.key === 'outflow') return `<td class="account-year-metric flow-out is-num">${format(outflow[index])}</td>`;
          if (item.key === 'outflowRatio') return `<td class="account-year-metric is-num" data-audit-unit-ignore>${formatRatio(outflow[index],totalOutflow[index],isTotal)}</td>`;
          if (item.key === 'outflowTxCount') return `<td class="account-year-metric is-num" data-audit-unit-ignore>${isTotal?`<strong>${format(totalOutflowTxCount[index])}</strong>`:format(outflowTxCount[index])}</td>`;
          if (item.key === 'total') return `<td class="account-year-metric is-num"><b>${format(totalValue)}</b></td>`;
          if (item.key === 'ratio') return `<td class="account-year-metric is-num" data-audit-unit-ignore>${formatRatio(totalValue,allTotalValue,isTotal)}</td>`;
          return `<td class="account-year-metric is-num" data-audit-unit-ignore>${isTotal?`<strong>${format(totalTxCount[index])}</strong>`:format(txCount[index])}</td>`;
        }).join('')).join('');
      };
      const flowYear = 2025;
      const miniBars = row => {
        const inPattern = [.073,.061,.079,.068,.087,.075,.071,.083,.077,.091,.082,.096];
        const outPattern = [.066,.074,.063,.081,.067,.076,.085,.069,.083,.072,.087,.077];
        const points = years.flatMap((year,yearIndex)=>{
          const profileShift = (row.index%5-2)*.0015 + (yearIndex-1)*.0008;
          const inWeights = inPattern.map((weight,month)=>Math.max(.025,weight+(month%3-1)*profileShift));
          const outWeights = outPattern.map((weight,month)=>Math.max(.025,weight-(month%3-1)*profileShift));
          const inWeightTotal = inWeights.reduce((sum,value)=>sum+value,0);
          const outWeightTotal = outWeights.reduce((sum,value)=>sum+value,0);
          return inWeights.map((weight,month)=>({
            year,
            month:month+1,
            inflow:Math.round(row.inflow*yearWeights[yearIndex]*weight/inWeightTotal),
            outflow:Math.round(row.outflow*yearWeights[yearIndex]*outWeights[month]/outWeightTotal)
          }));
        });
        const maxValue = Math.max(1,...points.flatMap(point=>[point.inflow,point.outflow]));
        const scale = points.map((point,index)=>`<span class="${index===12||index===24?'is-year-start':''}"></span>`).join('');
        return `<div class="account-monthly-flow-mini"><div class="monthly-flow-bars" aria-label="2023年至2025年月度流入流出分布">${points.map((point,index)=>`<span class="monthly-flow-pair${index===12||index===24?' is-year-start':''}" data-flow-year="${point.year}" data-flow-month="${point.month}" data-flow-in="${point.inflow}" data-flow-out="${point.outflow}" data-flow-account="${row.company}" aria-label="${point.year}年${point.month}月，流入${format(point.inflow)}，流出${format(point.outflow)}"><i class="flow-in-bar" style="height:${Math.max(3,point.inflow/maxValue*100)}%"></i><i class="flow-out-bar" style="height:${Math.max(3,point.outflow/maxValue*100)}%"></i></span>`).join('')}</div><div class="account-monthly-flow-scale" aria-hidden="true">${scale}</div></div>`;
      };
      let flowTooltip = null;
      const ensureFlowTooltip = () => {
        if (flowTooltip) return flowTooltip;
        flowTooltip = document.createElement('div');
        flowTooltip.className = 'account-monthly-flow-tooltip';
        flowTooltip.hidden = true;
        document.body.appendChild(flowTooltip);
        return flowTooltip;
      };
      const placeFlowTooltip = event => {
        if (!flowTooltip || flowTooltip.hidden) return;
        const gap=12,width=flowTooltip.offsetWidth||184,height=flowTooltip.offsetHeight||82;
        flowTooltip.style.left = `${Math.min(window.innerWidth-width-gap,Math.max(gap,event.clientX+12))}px`;
        flowTooltip.style.top = `${event.clientY+14+height>window.innerHeight?Math.max(gap,event.clientY-height-12):event.clientY+14}px`;
      };
      wrap.addEventListener('pointerover',event=>{
        const pair = event.target.closest('.monthly-flow-pair');
        if (!pair) return;
        const pairs = [...(pair.parentElement?.querySelectorAll('.monthly-flow-pair') || [])];
        const year = Number(pair.dataset.flowYear) || flowYear;
        const month = Number(pair.dataset.flowMonth) || Math.max(1,pairs.indexOf(pair)+1);
        const inflow = Number(pair.dataset.flowIn);
        const outflow = Number(pair.dataset.flowOut);
        const account = pair.dataset.flowAccount || pair.closest('tr')?.querySelector('td:nth-child(2)')?.textContent?.trim() || '当前账户';
        const tooltip = ensureFlowTooltip();
        tooltip.innerHTML = `<b>${year}年${String(month).padStart(2,'0')}月</b><small>${account}</small><div><span><i class="is-in"></i>流入金额</span><strong class="is-in">${format(Number.isFinite(inflow)?inflow:0)}</strong></div><div><span><i class="is-out"></i>流出金额</span><strong class="is-out">${format(Number.isFinite(outflow)?outflow:0)}</strong></div>`;
        tooltip.hidden = false;
        placeFlowTooltip(event);
      });
      wrap.addEventListener('pointermove',event=>{ if (event.target.closest('.monthly-flow-pair')) placeFlowTooltip(event); });
      wrap.addEventListener('pointerout',event=>{
        const pair = event.target.closest('.monthly-flow-pair');
        if (!pair || pair.contains(event.relatedTarget)) return;
        if (flowTooltip) flowTooltip.hidden = true;
      });
      const syncAccountColumns = () => {
        let colgroup = table.querySelector('colgroup');
        if (!colgroup) {
          colgroup = document.createElement('colgroup');
          table.insertBefore(colgroup, table.firstChild);
        }
        const amountUnit = window.AuditUnit?.unit || localStorage.getItem('auditCompass.amountUnit') || 'm';
        const storedAmountDecimals = localStorage.getItem('auditCompass.amountDecimals');
        const amountDecimals = storedAmountDecimals === null ? 2 : Math.max(0,Math.min(4,Number(storedAmountDecimals) || 0));
        const unitWidths = { b:46, m:46, w:54, k:62, yuan:76 };
        const minimumMetricWidth = (unitWidths[amountUnit] || 46) + amountDecimals * 5;
        const companyWidth = 180;
        const monthlyWidth = 220;
        const actionWidth = 64;
        const visibleOptions = metricOptions.filter(item=>state.visibleMetrics.has(item.key));
        const annualOptions = visibleOptions.filter(item=>item.annual);
        const allMetricOptions = [...visibleOptions,...(state.yearExpanded ? years.flatMap(()=>annualOptions) : [])];
        const metricCount = Math.max(1,allMetricOptions.length);
        const availableWidth = Math.max(0,(wrap.clientWidth || 1120)-companyWidth-monthlyWidth-actionWidth);
        const sharedWidth = Math.floor(availableWidth/metricCount);
        const metricWidth = Math.max(minimumMetricWidth,sharedWidth);
        const countWidth = Math.max(68,metricWidth);
        const requiredWidth = companyWidth+monthlyWidth+actionWidth+allMetricOptions.reduce((sum,item)=>sum+(item.annual?metricWidth:countWidth),0);
        const tableWidth = Math.max(wrap.clientWidth || 1120,requiredWidth);
        table.style.setProperty('--account-company-width',`${companyWidth}px`);
        table.style.setProperty('--account-monthly-width',`${monthlyWidth}px`);
        table.style.setProperty('--account-metric-width',`${metricWidth}px`);
        table.style.setProperty('--account-count-width',`${countWidth}px`);
        table.style.setProperty('--account-table-width',`${tableWidth}px`);
        table.style.width = `${tableWidth}px`;
        table.style.minWidth = `${tableWidth}px`;
        const metricCols = options => options.map(item=>`<col class="account-metric-compact-col${item.annual?'':' account-count-label-col'}">`).join('');
        const annualCols = state.yearExpanded ? years.map(()=>metricCols(annualOptions)).join('') : '';
        colgroup.innerHTML = `<col class="account-company-flex-col"><col class="account-monthly-fixed-col">${metricCols(visibleOptions)}${annualCols}<col class="account-action-fixed-col">`;
      };
      if (window.ResizeObserver) {
        let resizeFrame = 0;
        const columnResizeObserver = new ResizeObserver(()=>{
          cancelAnimationFrame(resizeFrame);
          resizeFrame = requestAnimationFrame(syncAccountColumns);
        });
        columnResizeObserver.observe(wrap);
        table._accountColumnResizeObserver = columnResizeObserver;
      }
      const renderHead = () => {
        const icon = state.yearExpanded ? '«' : '»';
        const visibleOptions = metricOptions.filter(item=>state.visibleMetrics.has(item.key));
        const annualOptions = visibleOptions.filter(item=>item.annual);
        const groupHeads = options => {
          const groups = [];
          options.forEach(item=>{
            const current = groups[groups.length-1];
            if (current?.key === item.group) current.count += 1;
            else groups.push({key:item.group,label:item.groupLabel,count:1});
          });
          return groups.map(group=>`<th colspan="${group.count}" class="account-metric-direction no-sort no-filter">${group.label}</th>`).join('');
        };
        const metricSymbols = options => options.map(item=>`<th class="account-metric-symbol no-filter${item.annual?'':' account-count-metric'}" data-account-metric="${item.key}" title="${item.label}"><span>${item.symbol}</span></th>`).join('');
        const yearHeads = state.yearExpanded && annualOptions.length ? years.map(year=>`<th colspan="${annualOptions.length}" class="account-year-head no-sort">${auditFiscalYearLabel(year)}</th>`).join('') : '';
        const totalDirections = groupHeads(visibleOptions);
        const yearDirections = state.yearExpanded ? years.map(()=>groupHeads(annualOptions)).join('') : '';
        const totalSymbols = metricSymbols(visibleOptions);
        const yearSymbols = state.yearExpanded ? years.map(()=>metricSymbols(annualOptions)).join('') : '';
        head.innerHTML = `<tr class="account-year-group-head"><th rowspan="3" class="no-filter">被审计单位公司</th><th rowspan="3" class="monthly-flow-head no-sort no-filter">${monthlyFlowExpandButton()}</th><th colspan="${visibleOptions.length}" class="account-group-toggle-cell no-sort"><div class="account-group-head-controls"><button class="account-group-toggle" id="accountYearToggle" type="button" title="展开或收起年度金额"><span>合计</span><i>${icon}</i></button></div></th>${yearHeads}<th rowspan="3" class="no-sort account-action-sticky">操作</th></tr><tr class="account-direction-head">${totalDirections}${yearDirections}</tr><tr class="account-metric-symbol-head">${totalSymbols}${yearSymbols}</tr>`;
        document.querySelectorAll('#accountScopeTabs [data-account-scope]').forEach(button=>{
          const active = button.dataset.accountScope === state.scopeView;
          button.classList.toggle('is-active',active);
          button.setAttribute('aria-selected',String(active));
        });
        document.getElementById('accountYearToggle')?.addEventListener('click',()=>{
          state.yearExpanded = !state.yearExpanded;
          render();
        });
      };
      const render = () => {
        const viewRows = scopedRows();
        const totals = scopedTotals(viewRows);
        const total = viewRows.length;
        const pages = Math.max(1, Math.ceil(total / state.pageSize));
        state.page = Math.max(1, Math.min(state.page, pages));
        const start = (state.page - 1) * state.pageSize;
        const end = start + state.pageSize;
        syncAccountColumns();
        renderHead();
        wrap.classList.toggle('is-year-expanded',state.yearExpanded);
        const sumYearCells = yearCells(totals,true,totals);
        const metricCells = (row,isTotal=false) => metricOptions.filter(item=>state.visibleMetrics.has(item.key)).map(item=>{
          if (item.key === 'inflow') return `<td class="account-total-metric flow-in is-num">${isTotal?'<strong>':''}${format(row.inflow)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'inflowRatio') return `<td class="account-total-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${formatRatio(row.inflow,totals.inflow,isTotal)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'inflowTxCount') return `<td class="account-total-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${format(row.inflowTxCount)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'outflow') return `<td class="account-total-metric flow-out is-num">${isTotal?'<strong>':''}${format(row.outflow)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'outflowRatio') return `<td class="account-total-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${formatRatio(row.outflow,totals.outflow,isTotal)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'outflowTxCount') return `<td class="account-total-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${format(row.outflowTxCount)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'total') return `<td class="account-total-metric is-num"><strong>${format(row.total)}</strong></td>`;
          if (item.key === 'ratio') return `<td class="account-total-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${formatRatio(row.total,totals.total,isTotal)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'txCount') return `<td class="account-total-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${format(row.txCount)}${isTotal?'</strong>':''}</td>`;
          if (item.key === 'cpCount') return `<td class="account-total-metric account-count-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${row.cpCount}${isTotal?'</strong>':''}</td>`;
          return `<td class="account-total-metric account-count-metric is-num" data-audit-unit-ignore>${isTotal?'<strong>':''}${row.fileCount}${isTotal?'</strong>':''}</td>`;
        }).join('');
        const sumRow = `<tr class="sum-row"><td><strong>合计</strong></td><td class="monthly-flow-cell" data-audit-unit-ignore></td>${metricCells(totals,true)}${sumYearCells}<td class="account-action-sticky"></td></tr>`;
        const dataRows = viewRows.slice(start,end).map(row=>{
          const accountNumbers=['1001***0821','1002***4186','2001***7739','3001***6290','3002***9052','4001***1578','5001***6426','6001***3385'];
          const bankNames=['工行上海分行','建行上海分行','招行上海分行','平安深圳分行','中行深圳分行','广发广州分行','农行苏州分行','浦发广州分行'];
          const account=accountNumbers[row.index%accountNumbers.length];
          const bank=bankNames[row.index%bankNames.length];
          const actionData=`data-company="${row.company}" data-account="${account}" data-bank="${bank}" data-inflow="${row.inflow}" data-outflow="${row.outflow}" data-tx-count="${row.txCount}"`;
          return `<tr><td>${row.company}</td><td class="monthly-flow-cell" data-audit-unit-ignore>${miniBars(row)}</td>${metricCells(row)}${yearCells(row,false,totals)}<td class="actions account-action-sticky"><button class="dm-account-action-btn" type="button" data-ba-account-action="account-detail" data-action-tooltip="账号详情" ${actionData} aria-label="账号详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.6"></circle></svg></button><button class="dm-account-action-btn" type="button" data-ba-account-action="file-detail" data-action-tooltip="文件详情" ${actionData} aria-label="文件详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6Z"></path><path d="M14 3.5v4h4M9 12h6M9 16h6"></path></svg></button></td></tr>`;
        }).join('');
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
      table._baOpenColumnChooser = anchor => {
        document.querySelectorAll('.ba-table-filter-popover,.ba-column-popover').forEach(current=>{
          if (typeof current._baCleanup === 'function') current._baCleanup();
          current.remove();
        });
        const pop = document.createElement('div');
        pop.className = 'ba-column-popover account-column-popover';
        pop.innerHTML = `<div class="ba-column-popover-title"><b>自定义表头</b><span>合计与年度同步</span></div><div class="ba-column-options">${metricOptions.map(item=>`<label><input type="checkbox" value="${item.key}" ${state.visibleMetrics.has(item.key)?'checked':''}><span>${item.label}</span></label>`).join('')}</div><div class="ba-column-popover-foot"><button type="button" data-action="show-default">恢复默认字段</button><button type="button" data-action="show-all">显示全部字段</button></div>`;
        document.body.appendChild(pop);
        const placePopover = () => {
          if (!pop.isConnected) return;
          const rect = anchor.getBoundingClientRect();
          const width = Math.min(520, Math.max(360, window.innerWidth - 24));
          pop.style.width = `${width}px`;
          pop.style.left = `${Math.max(12, Math.min(rect.right-width,window.innerWidth-width-12))+window.scrollX}px`;
          pop.style.top = `${rect.bottom+6+window.scrollY}px`;
        };
        const syncFromInputs = changed => {
          const checked = [...pop.querySelectorAll('input:checked')].map(input=>input.value);
          if (!checked.length) { changed.checked = true; return; }
          state.visibleMetrics = new Set(checked);
          render();
        };
        placePopover();
        pop.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>syncFromInputs(input)));
        pop.querySelector('[data-action="show-default"]')?.addEventListener('click',()=>{
          state.visibleMetrics = new Set(metricOptions.filter(item=>!item.defaultHidden).map(item=>item.key));
          pop.querySelectorAll('input').forEach(input=>input.checked=state.visibleMetrics.has(input.value));
          render();
        });
        pop.querySelector('[data-action="show-all"]')?.addEventListener('click',()=>{
          state.visibleMetrics = new Set(metricOptions.map(item=>item.key));
          pop.querySelectorAll('input').forEach(input=>input.checked=true);
          render();
        });
        setTimeout(()=>{
          window.addEventListener('scroll',placePopover,true);
          window.addEventListener('resize',placePopover);
          pop._baCleanup=()=>{ window.removeEventListener('scroll',placePopover,true); window.removeEventListener('resize',placePopover); };
          document.addEventListener('click',function handler(ev){
            if(!pop.contains(ev.target)&&ev.target!==anchor){ pop._baCleanup?.(); pop.remove(); document.removeEventListener('click',handler); }
          });
        },0);
      };
      document.getElementById('accountScopeTabs')?.addEventListener('click',event=>{
        const button = event.target.closest('[data-account-scope]');
        if (!button || button.dataset.accountScope === state.scopeView) return;
        state.scopeView = button.dataset.accountScope === 'excluded' ? 'excluded' : 'included';
        state.page = 1;
        render();
      });
      table.addEventListener('click',event=>{
        const button=event.target.closest('[data-monthly-flow-expand]');
        if(!button)return;
        event.preventDefault();
        event.stopPropagation();
        window.openAuditMonthlyFlowOverview?.(table);
      });
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
    },
    { procedure: "关联方分红、薪酬及其他资金流向异常", code: "i-2.1.3", criteria: "结合关联方及员工主档信息识别异常资金流向", status: "未执行", cp: 0, amt: 0, cnt: 0, action: false, reason: "" },
    { procedure: "其他特定关联方发生的资金往来", code: "i-2.2.4", criteria: "结合关联方主档中的其他特定关系识别", status: "未执行", cp: 0, amt: 0, cnt: 0, action: false, reason: "" },
    { procedure: "银行流水摘要存在明显异常信息", code: "i-3.3", criteria: "流水摘要包含特定异常关键字", status: "已完成", cp: 1, amt: 486.2, cnt: 2, action: false, reason: "" },
    { procedure: "银行流水中无交易对手方名称", code: "i-3.4", criteria: "交易对手方名称为空", status: "已完成", cp: 1, amt: 128.6, cnt: 1, action: false, reason: "" },
    { procedure: "银行流水中无交易摘要", code: "i-3.5", criteria: "交易摘要为空", status: "已完成", cp: 0, amt: 0, cnt: 0, action: false, reason: "" },
    { procedure: "与客户或供应商的交易方向异常", code: "i-3.9", criteria: "客户流出或供应商流入达到设定条件", status: "已完成", cp: 2, amt: 976.4, cnt: 3, action: false, reason: "" },
    { procedure: "存在银行流水但未匹配到增值税发票", code: "i-5.1", criteria: "按当前资金与票流匹配口径识别", status: "计算中", cp: 0, amt: 0, cnt: 0, action: false, reason: "" },
    { procedure: "存在增值税发票但未匹配到银行流水", code: "i-5.2", criteria: "按当前资金与票流匹配口径识别", status: "计算中", cp: 0, amt: 0, cnt: 0, action: false, reason: "" }
  ];

  const THIRD_PARTY_ROWS = [
    {
      procedure: "经营时间较短",
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
    const hideAction = tbody.closest("table")?.classList.contains("wp-no-action-column");
    const groupLabels = {
      "1": "定量考虑因素（一般事项核查标准）：",
      "2": "定性考虑因素（特殊事项核查标准）：",
      "3": "重点关注异常情况,例如：",
      "5": "资金流和发票流不匹配情况："
    };
    const rowCode = row => String(row.code || "").replace(/^i-/, "");
    const compareCode = (left, right) => {
      const a = rowCode(left).split(".").map(Number);
      const b = rowCode(right).split(".").map(Number);
      for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
        const delta = (a[index] || 0) - (b[index] || 0);
        if (delta) return delta;
      }
      return 0;
    };
    const rows = [...CHECK_STANDARD_ROWS].sort(compareCode);
    let previousGroup = "";
    tbody.innerHTML = rows.map(row => {
      const group = rowCode(row).split(".")[0];
      const columnCount = hideAction ? 8 : 9;
      const groupCells = `<td><strong>${groupLabels[group] || "其他核查标准"}</strong></td>${Array.from({ length: columnCount - 1 }, () => '<td aria-hidden="true"></td>').join("")}`;
      const groupRow = group !== previousGroup
        ? `<tr class="wp-routine-group-row" data-routine-group="${group}">${groupCells}</tr>`
        : "";
      previousGroup = group;
      const procedure = group === "1" && rowCode(row) === "1.1"
        ? String(row.procedure).replace(/^定量考虑因素（一般事项核查标准）：\s*/, "")
        : row.procedure;
      return `${groupRow}
      <tr>
        <td>${procedure}</td>
        <td>${row.code}</td>
        <td style="color:#4f83cc;">${row.criteria}</td>
        <td>${row.status ? `<span class="st-done">${row.status}</span>` : `<span class="st-empty">-</span>`}</td>
        <td class="num">${row.cp !== "" ? fmt(row.cp) : ""}</td>
        <td class="num">${row.amt !== "" ? fmt(row.amt) : ""}</td>
        <td class="num">${row.cnt !== "" ? fmt(row.cnt) : ""}</td>
        ${hideAction ? "" : `<td>
          ${row.action ? `
            <div class="wp-action-links">
              <a href="javascript:void(0)" class="act-link">进入</a>
              <a href="javascript:void(0)" class="act-link">重置</a>
            </div>
          ` : ""}
        </td>`}
        <td><input class="inp-reason" type="text" value="${row.reason || ""}"></td>
      </tr>
    `;}).join("");
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

  function parseFilterNumber(value) {
    const normalized = String(value ?? '')
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .replace(/[万千百元个家条笔次人年月日%￥¥$]/g, '')
      .replace(/[^0-9.+-]/g, '');
    if (!normalized || !/[0-9]/.test(normalized)) return null;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  function isRangeFilterColumn(th, values) {
    const label = getHeaderLabel(th).replace(/\s+/g, '');
    const numericLabel = /(金额|余额|税额|价税合计|占比|比例|税率|数量|笔数|次数|个数|人数|天数|时长|差异|总额|净额|额度|规模|样本量)/;
    if (!numericLabel.test(label)) return false;
    const usable = values.filter(Boolean);
    return usable.length > 0 && usable.filter(value => parseFilterNumber(value) !== null).length / usable.length >= .7;
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
      if (row.classList.contains('wp-routine-group-row')) return;
      let visible = true;
      if (filters) {
        filters.forEach((rule, index) => {
          const value = getCellText(row, index);
          if (rule instanceof Set) {
            if (rule.size && !rule.has(value)) visible = false;
            return;
          }
          if (!rule || !rule.type) return;
          if (rule.type === 'range') {
            const number = parseFilterNumber(value);
            if (number === null) { visible = false; return; }
            if (rule.min !== null && number < rule.min) visible = false;
            if (rule.max !== null && number > rule.max) visible = false;
            return;
          }
          if (rule.type === 'values') {
            const matched = rule.selected.has(value);
            if (rule.exclude ? matched : !matched) visible = false;
          }
        });
      }
      row.style.display = visible ? '' : 'none';
    });
    if (table.classList.contains('wp-grouped-routine-table')) {
      rows.forEach((row, index) => {
        if (!row.classList.contains('wp-routine-group-row')) return;
        let hasVisibleRow = false;
        for (let cursor = index + 1; cursor < rows.length && !rows[cursor].classList.contains('wp-routine-group-row'); cursor += 1) {
          if (rows[cursor].style.display !== 'none') { hasVisibleRow = true; break; }
        }
        row.style.display = hasVisibleRow ? '' : 'none';
      });
    }
  }

  function sortTableByColumn(table, index, dir, th) {
    const tbody = table.tBodies[0];
    if (!tbody) return;
    const rows = Array.from(tbody.rows);
    if (table.classList.contains('wp-grouped-routine-table')) {
      const groups = [];
      rows.forEach(row => {
        if (row.classList.contains('wp-routine-group-row')) groups.push({ head: row, rows: [] });
        else if (groups.length) groups[groups.length - 1].rows.push(row);
      });
      groups.forEach(group => {
        group.rows.sort((a, b) => compareCell(getCellText(a, index), getCellText(b, index), dir));
        tbody.appendChild(group.head);
        group.rows.forEach(row => tbody.appendChild(row));
      });
    } else {
      rows.sort((a, b) => compareCell(getCellText(a, index), getCellText(b, index), dir));
      rows.forEach(row => tbody.appendChild(row));
    }
    table.querySelectorAll('th').forEach(item => item.classList.remove('ba-sort-asc', 'ba-sort-desc'));
    th.classList.add(dir === 'asc' ? 'ba-sort-asc' : 'ba-sort-desc');
    applyTableFilters(table);
  }

  function closeFilterPopovers() {
    document.querySelectorAll('.ba-table-filter-popover').forEach(el => {
      if (typeof el._baCleanup === 'function') el._baCleanup();
      el.remove();
    });
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
    const grouped = new Map();
    layout.forEach(meta => {
      if (!meta.isLeaf) return;
      if (meta.th.dataset.fixedColumn === 'true') return;
      const label = getHeaderLabel(meta.th);
      if (!label) return;
      const token = meta.th.dataset.baColumnGroup || `label:${label}`;
      const existing = grouped.get(token);
      if (existing) {
        existing.indexes.push(meta.start + 1);
        if (meta.th.dataset.defaultHidden === 'true') existing.defaultHidden = true;
        return;
      }
      const column = { index:meta.start + 1, indexes:[meta.start + 1], label, token, th:meta.th, defaultHidden:meta.th.dataset.defaultHidden === 'true' };
      grouped.set(token,column);
      columns.push(column);
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
    const columns = getLeafHeaderColumns(table);
    let hidden = columnPrefs.get(key);
    if (!hidden) hidden = new Set();
    if (columns.length && table.dataset.baColumnDefaultsInitialized !== 'true') {
      columns.filter(column=>column.defaultHidden).forEach(column=>hidden.add(column.token));
      columnPrefs.set(key, hidden);
      table.dataset.baColumnDefaultsInitialized = 'true';
    }
    getHeaderLayout(table).forEach(meta => {
      if (meta.isLeaf && meta.th.dataset.fixedColumn === 'true') hidden.delete(meta.th.dataset.baColumnGroup || `label:${getHeaderLabel(meta.th)}`);
    });
    const hiddenIndexes = new Set(columns.filter(column=>hidden.has(column.token)).flatMap(column=>column.indexes));
    table.querySelectorAll('colgroup col').forEach((col,index) => {
      const isHidden = hiddenIndexes.has(index + 1);
      col.style.display = isHidden ? 'none' : '';
      col.style.width = isHidden ? '0px' : '';
      col.style.minWidth = isHidden ? '0px' : '';
      col.style.maxWidth = isHidden ? '0px' : '';
    });
    let style = document.getElementById(`ba-col-style-${key}`);
    if (!style) {
      style = document.createElement('style');
      style.id = `ba-col-style-${key}`;
      document.head.appendChild(style);
    }
    const selector = `#${cssIdent(key)}`;
    style.textContent = Array.from(hiddenIndexes)
      .map(index => `${selector} tbody tr > :nth-child(${index}),${selector} tfoot tr > :nth-child(${index}){display:none!important;}`)
      .join('\n');
    syncCustomizedHeaderColumns(table, hiddenIndexes);
    table.classList.toggle('ba-has-hidden-columns', hidden.size > 0);
  }

  function openColumnChooser(anchor, table) {
    if (!anchor || !table) return;
    if (typeof table._baOpenColumnChooser === 'function') {
      table._baOpenColumnChooser(anchor);
      return;
    }
    closeFilterPopovers();
    closeColumnPopovers();
    const key = getTableKey(table);
    const columns = getLeafHeaderColumns(table);
    const storedHidden = new Set(columnPrefs.get(key) || []);
    if (columns.length && table.dataset.baColumnDefaultsInitialized !== 'true') {
      columns.filter(column=>column.defaultHidden).forEach(column=>storedHidden.add(column.token));
      columnPrefs.set(key,storedHidden);
      table.dataset.baColumnDefaultsInitialized = 'true';
      applyCustomizedColumns(table);
    }
    const hidden = new Set(storedHidden);
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
            <input type="checkbox" value="${escapeHtml(col.token)}" ${hidden.has(col.token) ? '' : 'checked'}>
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
          if (!item.checked) nextHidden.add(item.value);
        });
        if (!pop.querySelector('input[type="checkbox"]:checked')) {
          input.checked = true;
          nextHidden.delete(input.value);
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
      .filter(row => !row.classList.contains('wp-routine-group-row'))
      .map(row => getCellText(row, index))
      .filter(Boolean))).slice(0, 80);
    const filters = tableFilters.get(table) || new Map();
    const current = filters.get(index);
    const rangeMode = isRangeFilterColumn(th, values);
    const currentValues = current?.type === 'values'
      ? current.selected
      : current instanceof Set ? current : new Set(values);
    const selected = new Set(currentValues || values);
    const excluded = current?.type === 'values' ? Boolean(current.exclude) : false;
    const currentMin = current?.type === 'range' && current.min !== null ? current.min : '';
    const currentMax = current?.type === 'range' && current.max !== null ? current.max : '';
    const title = getHeaderLabel(th);

    const pop = document.createElement('div');
    pop.className = `ba-table-filter-popover ${rangeMode ? 'is-range-filter' : 'is-value-filter'}`;
    if (rangeMode) {
      pop.innerHTML = `
        <div class="ba-filter-title">${escapeHtml(title)}范围筛选</div>
        <div class="ba-filter-range">
          <input type="text" inputmode="decimal" data-range="min" value="${currentMin}" placeholder="最小值" aria-label="最小值">
          <span>～</span>
          <input type="text" inputmode="decimal" data-range="max" value="${currentMax}" placeholder="最大值" aria-label="最大值">
        </div>
        <div class="ba-filter-actions">
          <button type="button" data-action="reset">重置</button>
          <button type="button" data-action="apply">确定</button>
        </div>
      `;
    } else {
      pop.innerHTML = `
        <div class="ba-filter-title">${escapeHtml(title)}筛选</div>
        <div class="ba-filter-search-row">
          <label class="ba-filter-search"><input type="search" placeholder="搜索" aria-label="搜索筛选项"><i aria-hidden="true"></i></label>
          <label class="ba-filter-exclude"><input type="checkbox" ${excluded ? 'checked' : ''}><span>不包含</span></label>
        </div>
        <div class="ba-filter-select-all"><label><input type="checkbox" data-role="select-all"><span>全选</span></label></div>
        <div class="ba-filter-options">
          ${values.map(v => `
            <label data-filter-value="${escapeHtml(v.toLowerCase())}">
              <input type="checkbox" value="${escapeHtml(v)}" ${selected.has(v) ? 'checked' : ''}>
              <span title="${escapeHtml(v)}">${escapeHtml(v)}</span>
            </label>
          `).join('') || '<div class="ba-filter-empty">暂无可筛选内容</div>'}
        </div>
        <div class="ba-filter-actions">
          <button type="button" data-action="reset">重置</button>
          <button type="button" data-action="apply">确定</button>
        </div>
      `;
    }
    document.body.appendChild(pop);
    pop._baAnchor = event.target.closest('.ba-filter-btn') || th;
    const removePopover = () => {
      if (typeof pop._baCleanup === 'function') pop._baCleanup();
      pop.remove();
    };
    const placePopover = () => {
      const anchor = pop._baAnchor;
      if (!pop.isConnected || !anchor?.isConnected) return;
      const rect = anchor.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
        removePopover();
        return;
      }
      const left = Math.max(8, Math.min(rect.right - pop.offsetWidth, window.innerWidth - pop.offsetWidth - 8));
      const below = rect.bottom + 8;
      const placeAbove = below + pop.offsetHeight > window.innerHeight - 8 && rect.top > pop.offsetHeight + 8;
      const top = placeAbove ? rect.top - pop.offsetHeight - 8 : below;
      const arrowLeft = Math.max(12, Math.min(rect.left + rect.width / 2 - left, pop.offsetWidth - 12));
      pop.classList.toggle('is-above', placeAbove);
      pop.style.left = `${left}px`;
      pop.style.top = `${Math.max(8, top)}px`;
      pop.style.setProperty('--ba-filter-arrow-left', `${arrowLeft}px`);
    };
    pop._baPlace = placePopover;
    placePopover();
    window.addEventListener('scroll', placePopover, true);
    window.addEventListener('resize', placePopover);
    pop._baCleanup = () => {
      window.removeEventListener('scroll', placePopover, true);
      window.removeEventListener('resize', placePopover);
    };

    if (!rangeMode) {
      const optionInputs = Array.from(pop.querySelectorAll('.ba-filter-options input[type="checkbox"]'));
      const selectAll = pop.querySelector('[data-role="select-all"]');
      const syncSelectAll = () => {
        const visibleInputs = optionInputs.filter(input => !input.closest('label').hidden);
        const checked = visibleInputs.filter(input => input.checked).length;
        selectAll.checked = visibleInputs.length > 0 && checked === visibleInputs.length;
        selectAll.indeterminate = checked > 0 && checked < visibleInputs.length;
      };
      syncSelectAll();
      optionInputs.forEach(input => input.addEventListener('change', syncSelectAll));
      selectAll.addEventListener('change', () => {
        optionInputs.forEach(input => {
          if (!input.closest('label').hidden) input.checked = selectAll.checked;
        });
        syncSelectAll();
      });
      pop.querySelector('.ba-filter-search input').addEventListener('input', event => {
        const keyword = event.target.value.trim().toLowerCase();
        pop.querySelectorAll('.ba-filter-options label').forEach(label => {
          label.hidden = Boolean(keyword && !label.dataset.filterValue.includes(keyword));
        });
        syncSelectAll();
      });
    }

    pop.querySelector('[data-action="reset"]').addEventListener('click', () => {
      filters.delete(index);
      tableFilters.set(table, filters);
      th.classList.remove('ba-filtered');
      applyTableFilters(table);
      removePopover();
    });
    pop.querySelector('[data-action="apply"]').addEventListener('click', () => {
      if (rangeMode) {
        let min = parseFilterNumber(pop.querySelector('[data-range="min"]').value);
        let max = parseFilterNumber(pop.querySelector('[data-range="max"]').value);
        if (min !== null && max !== null && min > max) [min, max] = [max, min];
        if (min === null && max === null) filters.delete(index);
        else filters.set(index, { type:'range', min, max });
        th.classList.toggle('ba-filtered', min !== null || max !== null);
      } else {
        const next = new Set(Array.from(pop.querySelectorAll('.ba-filter-options input:checked')).map(input => input.value));
        const exclude = pop.querySelector('.ba-filter-exclude input').checked;
        if (!exclude && next.size === values.length) filters.delete(index);
        else filters.set(index, { type:'values', selected:next, exclude });
        th.classList.toggle('ba-filtered', exclude || next.size !== values.length);
      }
      tableFilters.set(table, filters);
      applyTableFilters(table);
      removePopover();
    });

    pop.querySelectorAll('input').forEach(input => input.addEventListener('keydown', keyEvent => {
      if (keyEvent.key === 'Enter') pop.querySelector('[data-action="apply"]')?.click();
      if (keyEvent.key === 'Escape') removePopover();
    }));
    requestAnimationFrame(() => pop.querySelector('input[type="search"], [data-range="min"]')?.focus());

    setTimeout(() => {
      document.addEventListener('click', function handler(ev) {
        if (!pop.contains(ev.target)) {
          removePopover();
          document.removeEventListener('click', handler);
        }
      });
    }, 0);
  }

  function enhanceTable(table) {
    if (table.dataset.baEnhanced === '1') return;
    table.dataset.baEnhanced = '1';
    const skipHeaderLabels = new Set(['操作', '备注', '备注说明', '解释理由', '缺失原因', '支持性文件索引', '差异说明', '校验情况']);
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
        const filterDisabled = th.classList.contains('no-filter');
        const tools = document.createElement('span');
        tools.className = 'ba-th-tools';
        tools.innerHTML = `
          <span class="ba-sort-icons" aria-label="排序">
            <button type="button" class="ba-sort-up" title="升序"></button>
            <button type="button" class="ba-sort-down" title="降序"></button>
          </span>
          ${filterDisabled?'':'<button type="button" class="ba-filter-btn" title="筛选"></button>'}
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
        tools.querySelector('.ba-filter-btn')?.addEventListener('click', ev => {
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

  function initStatementStickyHeader() {
    const table = document.getElementById('statementFlowTable');
    const wrap = table?.closest('.statement-table-wrap');
    const scrollPane = table?.closest('.tab-scroll');
    const card = table?.closest('.statement-query-card');
    const toolbar = card?.querySelector('.head');
    const thead = table?.tHead;
    if (!table || !wrap || !scrollPane || !card || !toolbar || !thead || table.dataset.statementStickyReady === '1') return;
    table.dataset.statementStickyReady = '1';

    const toolbarPlaceholder = document.createElement('div');
    toolbarPlaceholder.className = 'statement-sticky-toolbar-placeholder';
    toolbar.insertAdjacentElement('afterend', toolbarPlaceholder);

    const stickyLayer = document.createElement('div');
    stickyLayer.className = 'statement-sticky-header-layer';
    stickyLayer.innerHTML = '<table class="table statement-flow-table statement-sticky-clone-table"></table>';
    card.appendChild(stickyLayer);
    const cloneTable = stickyLayer.querySelector('table');
    let frame = 0;
    let cloneDirty = true;

    const rebuildClone = () => {
      const sourceHeaders = Array.from(thead.rows[0]?.cells || []);
      if (!sourceHeaders.length || !table.getBoundingClientRect().width) return;
      const cloneHead = thead.cloneNode(true);
      cloneHead.removeAttribute('id');
      cloneHead.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      const colgroup = document.createElement('colgroup');
      sourceHeaders.forEach(th => {
        const col = document.createElement('col');
        const hidden = getComputedStyle(th).display === 'none';
        const width = hidden ? 0 : th.getBoundingClientRect().width;
        col.style.width = `${width}px`;
        col.style.minWidth = `${width}px`;
        col.style.maxWidth = `${width}px`;
        if (hidden) col.style.display = 'none';
        colgroup.appendChild(col);
      });
      cloneTable.replaceChildren(colgroup, cloneHead);
      const tableWidth = table.getBoundingClientRect().width;
      cloneTable.style.width = `${tableWidth}px`;
      cloneTable.style.minWidth = `${tableWidth}px`;
      cloneDirty = false;
    };

    const clearSticky = () => {
      toolbar.classList.remove('is-viewport-sticky');
      toolbarPlaceholder.classList.remove('is-active');
      toolbarPlaceholder.style.removeProperty('height');
      ['position','top','left','width','z-index'].forEach(prop => toolbar.style.removeProperty(prop));
      stickyLayer.classList.remove('is-active');
      ['top','left','width','height'].forEach(prop => stickyLayer.style.removeProperty(prop));
    };

    const update = () => {
      frame = 0;
      if (table.closest('.tab-pane')?.classList.contains('hide')) {
        clearSticky();
        return;
      }
      if (cloneDirty) rebuildClone();
      const paneRect = scrollPane.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const toolbarHeight = Math.max(36, toolbar.getBoundingClientRect().height || 36);
      const headerHeight = Math.max(32, thead.getBoundingClientRect().height || 32);
      const stickyTop = Math.max(0, paneRect.top);
      const shouldFixToolbar = cardRect.top < stickyTop && cardRect.bottom > stickyTop + toolbarHeight;

      if (shouldFixToolbar) {
        toolbar.classList.add('is-viewport-sticky');
        toolbarPlaceholder.classList.add('is-active');
        toolbarPlaceholder.style.height = `${toolbarHeight}px`;
        Object.assign(toolbar.style, {
          position:'fixed',
          top:`${stickyTop}px`,
          left:`${cardRect.left}px`,
          width:`${cardRect.width}px`,
          zIndex:'130'
        });
      } else {
        toolbar.classList.remove('is-viewport-sticky');
        toolbarPlaceholder.classList.remove('is-active');
        toolbarPlaceholder.style.removeProperty('height');
        ['position','top','left','width','z-index'].forEach(prop => toolbar.style.removeProperty(prop));
      }

      const headerTop = stickyTop + (shouldFixToolbar ? toolbarHeight : 0);
      const shouldFixHeader = wrapRect.top < headerTop && wrapRect.bottom > headerTop + headerHeight;
      if (!shouldFixHeader) {
        stickyLayer.classList.remove('is-active');
        return;
      }
      stickyLayer.classList.add('is-active');
      Object.assign(stickyLayer.style, {
        top:`${headerTop}px`,
        left:`${wrapRect.left}px`,
        width:`${wrapRect.width}px`,
        height:`${headerHeight}px`
      });
      cloneTable.style.transform = `translateX(${tableRect.left - wrapRect.left}px)`;
    };

    const schedule = (markDirty = false) => {
      if (markDirty) cloneDirty = true;
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    stickyLayer.addEventListener('click', event => {
      const cloneTh = event.target.closest('th');
      const cloneButton = event.target.closest('.ba-sort-up, .ba-sort-down, .ba-filter-btn');
      if (!cloneTh || !cloneButton) return;
      event.preventDefault();
      event.stopPropagation();
      const index = Array.from(cloneTh.parentElement.cells).indexOf(cloneTh);
      const originalTh = thead.rows[0]?.cells[index];
      const selector = cloneButton.classList.contains('ba-sort-up')
        ? '.ba-sort-up'
        : cloneButton.classList.contains('ba-sort-down') ? '.ba-sort-down' : '.ba-filter-btn';
      originalTh?.querySelector(selector)?.click();
      if (selector === '.ba-filter-btn') {
        requestAnimationFrame(() => {
          const popover = document.querySelector('.ba-table-filter-popover');
          if (!popover) return;
          popover._baAnchor = cloneButton;
          popover._baPlace?.();
        });
      }
      schedule(true);
    });

    scrollPane.addEventListener('scroll', () => schedule(), { passive:true });
    wrap.addEventListener('scroll', () => schedule(), { passive:true });
    window.addEventListener('resize', () => schedule(true), { passive:true });
    new MutationObserver(() => schedule(true)).observe(thead, { childList:true, subtree:true, attributes:true });
    new MutationObserver(() => schedule(true)).observe(table.tBodies[0], { childList:true, subtree:true });
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => schedule(true));
      observer.observe(table);
      observer.observe(wrap);
    }
    schedule(true);
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
    const dataTables = document.querySelectorAll(
      '.tab-pane table.table:not(.statement-sticky-clone-table), .dm-tab-pane table.table:not(.statement-sticky-clone-table)'
    );
    dataTables.forEach(enhanceTable);
    bindColumnChooserButtons();
    dataTables.forEach(applyCustomizedColumns);
    // 排序、筛选及自定义列全部就绪后再生成流水查询吸顶表头。
    initStatementStickyHeader();
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
