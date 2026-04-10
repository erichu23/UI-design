/* =============== 工具 =============== */

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
      '被审计单位A集团有限公司','被审计单位B科技股份有限公司','被审计单位C实业发展有限公司','被审计单位D信息技术有限公司'
    ];
    function initFilters(){
      const fCompany=document.getElementById('fCompany');
      const fBank=document.getElementById('fBank');
      const fFunc=document.getElementById('fFunc');
      fCompany.innerHTML = ['<option value="all">全部</option>',...auditedCompanies.map(x=>`<option>${x}</option>`)].join('');
      const bankOpts = ['全部',...new Set(companies.map(x=>x.bank))];
      fBank.innerHTML = bankOpts.map(x=>`<option>${x}</option>`).join('');
      fFunc.innerHTML = ['全部',...funcs].map(x=>`<option>${x}</option>`).join('');
    }
    initFilters();

    // 顶部 tab 切换
    const TAB_INTROS = {
      account:"本页为用户提供资金总览、账户交易按月分布、缺失同名账户三大功能模块，旨在帮助用户全面了解已上传并执行分析的银行流水的资金规模、各银行账号交易分布情况，同时识别出未获取流水的银行账号。",
      biz:"本页为用户提供已上传并执行分析的银行流水的多维度分析，包括：资金流水余额、流入流出趋势、流入流出构成，通过时间序列分析、交易性质和对手方性质等分析，旨在帮助用户识别到与被审计单位的资金规模与运营模式预期不符的情况。(本页的所有金额，已按照用户上传的汇率主档或系统默认PBOC汇率进行转换，均以人民币显示)",
      relation:"本页展示和分析：(1)关联方主档中的对手方，和(2)于“经营实质>流入流出构成”中手工标记为关联方的对手方的交易，旨在帮助用户全面了解被审计单位与关联方的资金往来，协助用户进行关联方披露。如用户暂未上传关联方主档或未手工打标，则本页展示内容为空。",
      transaction:"本页展示和分析：(1)员工主档中的对手方，和(2)其他个人(小于或等于四个字符)的对手方交易，旨在帮助用户全面了解被审计单位与个人的资金往来，协助用户进行关联个人和董监高的识别与披露、个人交易的合理性分析及风险识别。如用户暂未上传员工主档，则本页仅展示与其他个人对手方交易。",
      
      routine:"聚合工商信息并与交易规模联动校验企业真实性与风险。",
      statement:"用户可对本页的多维筛选器设置筛选条件，系统将在已上传并执行分析的银行流水中选出符合筛选条件的异常交易流水，并支持流水导出，旨在帮助用户根据项目需求，全面、快速、精准地筛选出异常银行流水，协助用户进一步执行审计程序。",
      verify:"本页汇总已上传并执行分析的电子银行流水的期初金额、借方发生额、贷方发生额及期末余额，并将其与上传的银行科目总账/分账号余额表进行比对，并展示两者差异，协助用户完成银行流水的完整性测试。"

    };
    
    function setTabIntro(key){
      const el = document.getElementById('tabIntro');
      if(!el) return;
      el.innerHTML = `
        <svg class="ti-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1-9h-2a1 1 0 0 0-1 1v1h2v6h2V8a2 2 0 0 0-2-2Z"/>
        </svg>
        <div><span class="ti-title">页面说明：</span>${TAB_INTROS[key]||''}</div>`;
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
    
    // 绑定
    function bindTabs(){
      document.querySelectorAll('#topTabs .tab').forEach(tab=>{
        tab.addEventListener('click', ()=>{
          document.querySelectorAll('#topTabs .tab').forEach(t=>t.classList.remove('active'));
          tab.classList.add('active');
    
          const key = tab.dataset.top;
          document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
          document.getElementById('pane-'+key)?.classList.add('active');
    
          setTabIntro(key);
          // 下一帧再计算，避免布局还未完成
          requestAnimationFrame(()=>moveInkbar(tab));
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
      bindTabs();
      const active = document.querySelector('#topTabs .tab.active') || document.querySelector('#topTabs .tab');
      if(active) {
        setTabIntro(active.dataset.top);
        // 字体/滚动条渲染后再定位
        requestAnimationFrame(()=>moveInkbar(active));
      }
    });
    window.addEventListener('resize', ()=>{
      const active = document.querySelector('#topTabs .tab.active');
      if(active) moveInkbar(active);
    });
    
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
      { id: 1, org: "abc有限公司", bankNo: "243300333", bank: "中国银行", total: 1.1, tx: 2, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 2, org: "abc有限公司", bankNo: "331141******4172", bank: "中国银行宁波分行", total: 555838.5, tx: 85, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 3, org: "abc有限公司", bankNo: "394020******1807", bank: "农业银行", total: 52909.6, tx: 455, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 4, org: "abc有限公司", bankNo: "574902******0555", bank: "招商银行", total: 116413.4, tx: 367, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 5, org: "abc有限公司", bankNo: "574902******0601", bank: "招商银行", total: 750668.4, tx: 1482, method: "", updatedBy: "", updatedAt: "", sample: null },
      { id: 6, org: "bcd有限公司", bankNo: "45079******2033", bank: "中国银行", total: 10, tx: 1, method: "", updatedBy: "", updatedAt: "", sample: null }
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
    $("#wpProj").textContent = WP.proj || "20220318/TEST";
    $("#wpBook").textContent = WP.book || "test for tech hour";
    $("#wpKind").textContent = WP.kindText || (WP.isIPO ? "IPO" : "Non-IPO_NON-PIE");
    $("#wpMarket").textContent = WP.market || "N/A";
    $("#wpMaterialityText").textContent = WP.materiality ? fmt(WP.materiality) : "-";
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

    $("#wpTable1Total").textContent = String((WP.accounts || []).length);

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
              <a href=" " class="act-link">进入</a >
              <a href="javascript:void(0)" class="act-link">重置</a >
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
    const complete = isMethodComplete();
    const block2 = $("#wpBlock2");
    const block3 = $("#wpBlock3");
    const block4 = $("#wpBlock4");

    if (block2) block2.style.display = complete ? "" : "none";
    if (block3) block3.style.display = "";
    if (block4) block4.style.display = "";

    const directTest = $("#directTestSwitch")?.checked;
    if ($("#directTestText")) {
      $("#directTestText").textContent = directTest ? "是" : "否";
    }
    if ($("#sampleConfigRow")) {
      $("#sampleConfigRow").style.display = directTest ? "" : "none";
    }

    renderTable1();
    if (complete) renderTable2();
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
    if (!isMethodComplete()) {
      alert("请先完成第1部分：为所有账户补充银行流水获取方式。");
      return;
    }
    alert("生成资金流水核查底稿");
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



