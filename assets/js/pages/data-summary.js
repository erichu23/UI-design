(function () {
  const charts = {};
  let detailInChart = null;
  let detailOutChart = null;

  let selectedMonth = null; // 点击柱状图后的月度视图
  let yearColumnsExpanded = false; // 表头“合计”右侧年份列组是否展开
  let vatDetailMode = "output"; // output=销项税, input=进项税
  const selectedCounterparties = new Set();
  currentPage = 1;
  const pageSize = 20;
  const remarkStore = {};

  const rawData = [
  /* =========================
     2024 年
     ========================= */

  // ===== 2024-01 =====
  { month:"2024-01", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"上海启辰贸易有限公司", inflow:320, outflow:0, outputVat:305, inputVat:0, txn:15 },
  { month:"2024-01", unit:"华东智造科技有限公司", func:"采购", type:"供应商", counterparty:"宁波宏达供应链有限公司", inflow:0, outflow:180, outputVat:0, inputVat:172, txn:8 },
  { month:"2024-01", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"杭州科锐科技有限公司", inflow:210, outflow:0, outputVat:208, inputVat:0, txn:11 },
  { month:"2024-01", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"深圳远景服务有限公司", inflow:260, outflow:0, outputVat:255, inputVat:0, txn:13 },
  { month:"2024-01", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"佛山凯鸿商贸有限公司", inflow:185, outflow:0, outputVat:180, inputVat:0, txn:8 },
  { month:"2024-01", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"苏州华瑞工业有限公司", inflow:0, outflow:145, outputVat:0, inputVat:140, txn:7 },

  // ===== 2024-02 =====
  { month:"2024-02", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"南京卓越电子有限公司", inflow:188, outflow:0, outputVat:182, inputVat:0, txn:8 },
  { month:"2024-02", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"武汉迅达物流有限公司", inflow:0, outflow:145, outputVat:0, inputVat:120, txn:6 }, // 风险
  { month:"2024-02", unit:"上海星源电子有限公司", func:"采购", type:"供应商", counterparty:"天津凯虎机械有限公司", inflow:0, outflow:176, outputVat:0, inputVat:171, txn:7 },
  { month:"2024-02", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"广州锦程商贸有限公司", inflow:220, outflow:0, outputVat:218, inputVat:0, txn:10 },
  { month:"2024-02", unit:"深圳云启信息技术有限公司", func:"采购", type:"供应商", counterparty:"东莞信成科技有限公司", inflow:0, outflow:118, outputVat:0, inputVat:115, txn:5 },
  { month:"2024-02", unit:"苏州精工制造有限公司", func:"销售", type:"客户", counterparty:"常州智航设备有限公司", inflow:205, outflow:0, outputVat:202, inputVat:0, txn:9 },

  // ===== 2024-03 =====
  { month:"2024-03", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"上海启辰贸易有限公司", inflow:420, outflow:0, outputVat:310, inputVat:0, txn:18 }, // 风险：回款高于销项
  { month:"2024-03", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"杭州科锐科技有限公司", inflow:275, outflow:0, outputVat:268, inputVat:0, txn:12 },
  { month:"2024-03", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"苏州华瑞工业有限公司", inflow:0, outflow:220, outputVat:0, inputVat:215, txn:10 },
  { month:"2024-03", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"广州锦程商贸有限公司", inflow:240, outflow:0, outputVat:238, inputVat:0, txn:9 },
  { month:"2024-03", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"青岛远通国际贸易有限公司", inflow:0, outflow:162, outputVat:0, inputVat:130, txn:6 }, // 风险
  { month:"2024-03", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"厦门瀚宇信息服务有限公司", inflow:198, outflow:0, outputVat:194, inputVat:0, txn:8 },

  // ===== 2024-04 =====
  { month:"2024-04", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"深圳远景服务有限公司", inflow:310, outflow:0, outputVat:295, inputVat:0, txn:14 },
  { month:"2024-04", unit:"深圳云启信息技术有限公司", func:"采购", type:"供应商", counterparty:"成都智联设备有限公司", inflow:0, outflow:155, outputVat:0, inputVat:148, txn:7 },
  { month:"2024-04", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"青岛远通国际贸易有限公司", inflow:0, outflow:265, outputVat:0, inputVat:180, txn:9 }, // 风险
  { month:"2024-04", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"无锡蓝海电子有限公司", inflow:190, outflow:0, outputVat:188, inputVat:0, txn:8 },
  { month:"2024-04", unit:"广州远航贸易有限公司", func:"采购", type:"供应商", counterparty:"佛山瑞诚包装材料有限公司", inflow:0, outflow:108, outputVat:0, inputVat:105, txn:5 },
  { month:"2024-04", unit:"苏州精工制造有限公司", func:"销售", type:"客户", counterparty:"昆山智拓自动化有限公司", inflow:228, outflow:0, outputVat:220, inputVat:0, txn:9 },

  // ===== 2024-05 =====
  { month:"2024-05", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"南京卓越电子有限公司", inflow:360, outflow:0, outputVat:358, inputVat:0, txn:15 },
  { month:"2024-05", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"苏州华瑞工业有限公司", inflow:0, outflow:245, outputVat:0, inputVat:238, txn:10 },
  { month:"2024-05", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"广州锦程商贸有限公司", inflow:285, outflow:0, outputVat:210, inputVat:0, txn:10 }, // 风险：销项偏低
  { month:"2024-05", unit:"深圳云启信息技术有限公司", func:"采购", type:"供应商", counterparty:"东莞信成科技有限公司", inflow:0, outflow:128, outputVat:0, inputVat:125, txn:6 },
  { month:"2024-05", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"杭州联创电子有限公司", inflow:175, outflow:0, outputVat:172, inputVat:0, txn:7 },
  { month:"2024-05", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"嘉兴华运仓储服务有限公司", inflow:0, outflow:142, outputVat:0, inputVat:96, txn:5 }, // 风险

  // ===== 2024-06 =====
  { month:"2024-06", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"上海启辰贸易有限公司", inflow:500, outflow:0, outputVat:590, inputVat:0, txn:15 }, // 风险：销项高于回款
  { month:"2024-06", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"杭州科锐科技有限公司", inflow:320, outflow:0, outputVat:318, inputVat:0, txn:13 },
  { month:"2024-06", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"武汉迅达物流有限公司", inflow:0, outflow:188, outputVat:0, inputVat:145, txn:8 }, // 风险
  { month:"2024-06", unit:"广州远航贸易有限公司", func:"采购", type:"供应商", counterparty:"广东恒信材料有限公司", inflow:0, outflow:175, outputVat:0, inputVat:170, txn:7 },
  { month:"2024-06", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"珠海创科软件有限公司", inflow:215, outflow:0, outputVat:210, inputVat:0, txn:8 },
  { month:"2024-06", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"常熟力合金属材料有限公司", inflow:0, outflow:132, outputVat:0, inputVat:125, txn:6 },

  // ===== 2024-07 =====
  { month:"2024-07", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"深圳远景服务有限公司", inflow:390, outflow:88, outputVat:365, inputVat:32, txn:13 }, // 同一主体既有流入也有流出
  { month:"2024-07", unit:"华东智造科技有限公司", func:"采购", type:"供应商", counterparty:"宁波宏达供应链有限公司", inflow:0, outflow:210, outputVat:0, inputVat:205, txn:9 },
  { month:"2024-07", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"无锡蓝海电子有限公司", inflow:260, outflow:0, outputVat:255, inputVat:0, txn:10 },
  { month:"2024-07", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"佛山凯鸿商贸有限公司", inflow:198, outflow:0, outputVat:194, inputVat:0, txn:8 },
  { month:"2024-07", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"厦门海拓物流有限公司", inflow:0, outflow:122, outputVat:0, inputVat:92, txn:5 }, // 风险
  { month:"2024-07", unit:"苏州精工制造有限公司", func:"销售", type:"客户", counterparty:"昆山智拓自动化有限公司", inflow:248, outflow:0, outputVat:242, inputVat:0, txn:10 },

  // ===== 2024-08 =====
  { month:"2024-08", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"青岛远通国际贸易有限公司", inflow:0, outflow:355, outputVat:0, inputVat:220, txn:11 }, // 风险：付款高于进项
  { month:"2024-08", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"广州锦程商贸有限公司", inflow:315, outflow:0, outputVat:305, inputVat:0, txn:11 },
  { month:"2024-08", unit:"深圳云启信息技术有限公司", func:"采购", type:"供应商", counterparty:"成都智联设备有限公司", inflow:0, outflow:166, outputVat:0, inputVat:162, txn:7 },
  { month:"2024-08", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"上海启辰贸易有限公司", inflow:338, outflow:0, outputVat:336, inputVat:0, txn:12 },
  { month:"2024-08", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"杭州联创电子有限公司", inflow:205, outflow:0, outputVat:198, inputVat:0, txn:8 },
  { month:"2024-08", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"昆山精达模具有限公司", inflow:0, outflow:158, outputVat:0, inputVat:154, txn:6 },

  // ===== 2024-09 =====
  { month:"2024-09", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"深圳远景服务有限公司", inflow:280, outflow:66, outputVat:270, inputVat:62, txn:7 },
  { month:"2024-09", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"南京卓越电子有限公司", inflow:342, outflow:0, outputVat:338, inputVat:0, txn:12 },
  { month:"2024-09", unit:"上海星源电子有限公司", func:"采购", type:"供应商", counterparty:"天津凯虎机械有限公司", inflow:0, outflow:185, outputVat:0, inputVat:182, txn:8 },
  { month:"2024-09", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"中山鼎盛商贸有限公司", inflow:176, outflow:0, outputVat:172, inputVat:0, txn:7 },
  { month:"2024-09", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"福州联运仓配有限公司", inflow:0, outflow:136, outputVat:0, inputVat:95, txn:5 }, // 风险
  { month:"2024-09", unit:"苏州精工制造有限公司", func:"销售", type:"客户", counterparty:"常州智航设备有限公司", inflow:232, outflow:0, outputVat:228, inputVat:0, txn:9 },

  // ===== 2024-10 =====
  { month:"2024-10", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"苏州华瑞工业有限公司", inflow:0, outflow:210, outputVat:0, inputVat:195, txn:6 },
  { month:"2024-10", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"广州锦程商贸有限公司", inflow:288, outflow:0, outputVat:285, inputVat:0, txn:9 },
  { month:"2024-10", unit:"华东智造科技有限公司", func:"采购", type:"供应商", counterparty:"广东恒信材料有限公司", inflow:0, outflow:198, outputVat:0, inputVat:188, txn:7 },
  { month:"2024-10", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"苏州博锐电子有限公司", inflow:218, outflow:0, outputVat:212, inputVat:0, txn:8 },
  { month:"2024-10", unit:"深圳云启信息技术有限公司", func:"采购", type:"供应商", counterparty:"珠海安联网络设备有限公司", inflow:0, outflow:122, outputVat:0, inputVat:118, txn:5 },
  { month:"2024-10", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"青岛远通国际贸易有限公司", inflow:0, outflow:208, outputVat:0, inputVat:150, txn:7 }, // 风险

  // ===== 2024-11 =====
  { month:"2024-11", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"杭州科锐科技有限公司", inflow:330, outflow:0, outputVat:320, inputVat:0, txn:9 },
  { month:"2024-11", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"深圳远景服务有限公司", inflow:298, outflow:0, outputVat:292, inputVat:0, txn:10 },
  { month:"2024-11", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"武汉迅达物流有限公司", inflow:0, outflow:178, outputVat:0, inputVat:138, txn:6 }, // 风险
  { month:"2024-11", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"佛山凯鸿商贸有限公司", inflow:205, outflow:0, outputVat:202, inputVat:0, txn:8 },
  { month:"2024-11", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"嘉兴恒远电器有限公司", inflow:248, outflow:0, outputVat:242, inputVat:0, txn:9 },
  { month:"2024-11", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"昆山精达模具有限公司", inflow:0, outflow:172, outputVat:0, inputVat:168, txn:7 },

  // ===== 2024-12 =====
  { month:"2024-12", unit:"华东智造科技有限公司", func:"销售", type:"客户", counterparty:"上海启辰贸易有限公司", inflow:620, outflow:0, outputVat:615, inputVat:0, txn:20 },
  { month:"2024-12", unit:"广州远航贸易有限公司", func:"销售", type:"客户", counterparty:"广州锦程商贸有限公司", inflow:410, outflow:0, outputVat:402, inputVat:0, txn:14 },
  { month:"2024-12", unit:"苏州精工制造有限公司", func:"采购", type:"供应商", counterparty:"苏州华瑞工业有限公司", inflow:0, outflow:285, outputVat:0, inputVat:280, txn:11 },
  { month:"2024-12", unit:"上海星源电子有限公司", func:"销售", type:"客户", counterparty:"无锡蓝海电子有限公司", inflow:365, outflow:0, outputVat:350, inputVat:0, txn:12 }, // 风险：年末回款/开票节奏差异
  { month:"2024-12", unit:"深圳云启信息技术有限公司", func:"销售", type:"客户", counterparty:"厦门瀚宇信息服务有限公司", inflow:255, outflow:0, outputVat:310, inputVat:0, txn:9 }, // 风险：销项高于回款
  { month:"2024-12", unit:"华南供应链管理有限公司", func:"采购", type:"供应商", counterparty:"青岛远通国际贸易有限公司", inflow:0, outflow:298, outputVat:0, inputVat:188, txn:10 } // 风险：进项不足
];

  const months = [
    "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
    "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function fmt(n) {
    return Number(n || 0).toLocaleString();
  }

  function safePct(diff, base) {
    if (!base) return 0;
    return +((diff / base) * 100).toFixed(1);
  }

  function getYear(month) {
    return String(month).slice(0, 4);
  }

  function getMonthLabel(month) {
    return String(month).replace(/^(\d{4})-(\d{2})$/, "$1年$2月");
  }

  function getShortMonthLabel(month) {
    return String(month).replace(/^(\d{4})-(\d{2})$/, "$2月");
  }

  function gapHtmlBlue(diff, base) {
      const pct = safePct(diff, base);
      return `<span class="ds3-gap-pos">${fmt(diff)} / ${pct}%</span>`;
    }

function gapHtmlRed(diff, base) {
  const pct = safePct(diff, base);
  return `<span class="ds3-gap-neg">${fmt(diff)} / ${pct}%</span>`;
}




  function sumRows(rows) {
    return rows.reduce((acc, r) => {
      acc.inflow += Number(r.inflow || 0);
      acc.outflow += Number(r.outflow || 0);
      acc.outputVat += Number(r.outputVat || 0);
      acc.inputVat += Number(r.inputVat || 0);
      acc.txn += Number(r.txn || 0);
      return acc;
    }, { inflow: 0, outflow: 0, outputVat: 0, inputVat: 0, txn: 0 });
  }

  function buildMonthlySeries(rows) {
    const result = months.map(m => ({
      month: m,
      inflow: 0,
      outflow: 0,
      outputVat: 0,
      inputVat: 0
    }));

    rows.forEach(r => {
      const idx = months.indexOf(r.month);
      if (idx >= 0) {
        result[idx].inflow += Number(r.inflow || 0);
        result[idx].outflow += Number(r.outflow || 0);
        result[idx].outputVat += Number(r.outputVat || 0);
        result[idx].inputVat += Number(r.inputVat || 0);
      }
    });

    return result;
  }

  function resizeAllCharts() {
    Object.values(charts).forEach(c => {
      try { c && c.resize(); } catch (e) {}
    });

    [detailInChart, detailOutChart].forEach(c => {
      try { c && c.resize(); } catch (e) {}
    });
  }

  function initFold() {
    document.querySelectorAll(".ds3-fold").forEach(btn => {
      btn.addEventListener("click", function () {
        const block = this.closest(".ds3-block");
        if (!block) return;
        block.classList.toggle("is-collapsed");
        this.textContent = block.classList.contains("is-collapsed") ? "展开" : "收起";
        setTimeout(resizeAllCharts, 80);
      });
    });
  }

  function initFilterOptions() {
    const units = ["全部", ...new Set(rawData.map(x => x.unit))];
    const funcs = ["全部", ...new Set(rawData.map(x => x.func))];
    const types = ["全部", ...new Set(rawData.map(x => x.type))];

    if ($("ds3Unit")) $("ds3Unit").innerHTML = units.map(x => `<option value="${x}">${x}</option>`).join("");
    if ($("ds3Func")) $("ds3Func").innerHTML = funcs.map(x => `<option value="${x}">${x}</option>`).join("");
    if ($("ds3Type")) $("ds3Type").innerHTML = types.map(x => `<option value="${x}">${x}</option>`).join("");
  }

  function getBaseFilteredRows() {
    const unit = $("ds3Unit")?.value || "全部";
    const func = $("ds3Func")?.value || "全部";
    const type = $("ds3Type")?.value || "全部";
    const keyword = ($("ds3Keyword")?.value || "").trim().toLowerCase();

    return rawData.filter(r => {
      return (unit === "全部" || r.unit === unit) &&
        (func === "全部" || r.func === func) &&
        (type === "全部" || r.type === type) &&
        (!keyword || r.counterparty.toLowerCase().includes(keyword));
    });
  }

  function getRowsForCurrentView() {
    const rows = getBaseFilteredRows();
    if (!selectedMonth) return rows;
    return rows.filter(r => r.month === selectedMonth);
  }

  function updateTopKpis(rows) {
    const total = sumRows(rows);
    const incomeGap = +(total.inflow - total.outputVat).toFixed(1);
    const costGap = +(total.outflow - total.inputVat).toFixed(1);

    if ($("ds3InflowTotal")) $("ds3InflowTotal").textContent = fmt(total.inflow);
    if ($("ds3OutputVatTotal")) $("ds3OutputVatTotal").textContent = fmt(total.outputVat);
    if ($("ds3IncomeGapTotal")) $("ds3IncomeGapTotal").textContent = `${fmt(incomeGap)} / ${safePct(incomeGap, total.inflow)}%`;

    if ($("ds3OutflowTotal")) $("ds3OutflowTotal").textContent = fmt(total.outflow);
    if ($("ds3InputVatTotal")) $("ds3InputVatTotal").textContent = fmt(total.inputVat);
    if ($("ds3CostGapTotal")) $("ds3CostGapTotal").textContent = `${fmt(costGap)} / ${safePct(costGap, total.outflow)}%`;
  }

  function renderCharts(rows) {
    const monthly = buildMonthlySeries(rows);
    const xAxisData = monthly.map(x => getShortMonthLabel(x.month));

    if (!charts.filterIn && $("ds3FilterInChart")) {
      charts.filterIn = echarts.init($("ds3FilterInChart"));
      charts.filterIn.on("click", params => {
        const idx = params?.dataIndex;
        if (idx == null) return;
        selectedMonth = monthly[idx].month;
        renderFilterSection();
      });
    }

    if (charts.filterIn) {
      charts.filterIn.setOption({
        color: ["#108dff", "#38bdf8", "#2468a2"],
        tooltip: { trigger: "axis" },
        legend: { top: 0, data: ["银行流入", "销项价税合计", "差额"] },
        grid: { left: 52, right: 20, top: 42, bottom: 40 },
        xAxis: { type: "category", data: xAxisData },
        yAxis: { type: "value", name: "K" },
        series: [
          { name: "银行流入", type: "bar", barMaxWidth: 28, data: monthly.map(x => x.inflow) },
          { name: "销项价税合计", type: "bar", barMaxWidth: 28, data: monthly.map(x => x.outputVat) },
          { name: "差额", type: "line", smooth: true, data: monthly.map(x => +(x.inflow - x.outputVat).toFixed(1)) }
        ]
      });
    }

    if (!charts.filterOut && $("ds3FilterOutChart")) {
      charts.filterOut = echarts.init($("ds3FilterOutChart"));
      charts.filterOut.on("click", params => {
        const idx = params?.dataIndex;
        if (idx == null) return;
        selectedMonth = monthly[idx].month;
        renderFilterSection();
      });
    }

    if (charts.filterOut) {
      charts.filterOut.setOption({
        color: ["#ff5733", "#fb7185", "#be185d"],
        tooltip: { trigger: "axis" },
        legend: { top: 0, data: ["银行流出", "进项价税合计", "差额"] },
        grid: { left: 52, right: 20, top: 42, bottom: 40 },
        xAxis: { type: "category", data: xAxisData },
        yAxis: { type: "value", name: "K" },
        series: [
          { name: "银行流出", type: "bar", barMaxWidth: 28, data: monthly.map(x => x.outflow) },
          { name: "进项价税合计", type: "bar", barMaxWidth: 28, data: monthly.map(x => x.inputVat) },
          { name: "差额", type: "line", smooth: true, data: monthly.map(x => +(x.outflow - x.inputVat).toFixed(1)) }
        ]
      });
    }
  }

  function renderMonthHint() {
    const hint = $("ds3MonthHint");
    if (!hint) return;

    if (!selectedMonth) {
      hint.textContent = "当前展示：全部月份汇总。点击上方柱子可切换为对应月份视图；表头“合计”支持展开年份列组。";
    } else {
      hint.textContent = `当前展示：${getMonthLabel(selectedMonth)} 视图。点击“重置月份”可恢复全部月份；表头“合计”仍可展开年份列组。`;
    }
  }

  function buildGroupCells(total, withSepClass = "") {
    const incomeGap = +(total.inflow - total.outputVat).toFixed(1);
    const costGap = +(total.outflow - total.inputVat).toFixed(1);

    return `
      <td class="is-num ds3-num-inflow ${withSepClass}"style="text-align:center;">${fmt(total.inflow)}</td>
      <td class="is-num ds3-num-output"style="text-align:center;">${fmt(total.outputVat)}</td>
      <td class="is-num"style="text-align:center;">${gapHtmlBlue(incomeGap, total.inflow)}</td>
      <td class="is-num ds3-num-outflow"style="text-align:center;">${fmt(total.outflow)}</td>
      <td class="is-num ds3-num-input"style="text-align:center;">${fmt(total.inputVat)}</td>
      <td class="is-num"style="text-align:center;">${gapHtmlRed(costGap, total.outflow)}</td>
    `;
  }



   function iconSort(type = "default") {
  if (type === "asc") {
    return `
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M8 3 L12 7 H4 Z" fill="currentColor"/>
      </svg>
    `;
  }

  if (type === "desc") {
    return `
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M4 9 H12 L8 13 Z" fill="currentColor"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M8 2 L11 6 H5 Z" fill="currentColor" opacity=".75"/>
      <path d="M5 10 H11 L8 14 Z" fill="currentColor" opacity=".35"/>
    </svg>
  `;
}

function iconFilter() {
  return `
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M2 3 H14 L10 8 V13 L6 11 V8 Z" fill="currentColor"/>
    </svg>
  `;
}

function getSortIcon(key) {
  if (!sortState || sortState.key !== key || !sortState.order) {
    return iconSort("default");
  }
  return sortState.order === "asc" ? iconSort("asc") : iconSort("desc");
}

function buildHeaderTools(label, sortKey, filterKey = "", filterType = "text", align = "center") {
  return `
    <div class="ds3-th-tools is-${align}">
      <span class="ds3-th-label">${label}</span>
      <span class="ds3-th-actions">
        <button
          class="ds3-th-action ds3-sort-btn ${sortState.key === sortKey && sortState.order ? "is-active" : ""}"
          type="button"
          data-sort-key="${sortKey}"
          title="排序"
          aria-label="排序"
        >
          ${getSortIcon(sortKey)}
        </button>

        ${filterKey ? `
          <button
            class="ds3-th-action ds3-filter-btn"
            type="button"
            data-filter-key="${filterKey}"
            data-filter-type="${filterType}"
            title="筛选"
            aria-label="筛选"
          >
            ${iconFilter()}
          </button>
        ` : ""}
      </span>
    </div>
  `;
}


  function renderFilterTableHead(rows) {
  const thead = $("ds3FilterTableHead");
  if (!thead) return;

  const allRows = getBaseFilteredRows();
  const years = [...new Set(allRows.map(r => getYear(r.month)))].sort((a, b) => b.localeCompare(a));
  const expandIcon = yearColumnsExpanded ? "«" : "»";

  const groupCols = `
    <th style="text-align:center;">${buildHeaderTools("流入金额", "inflow", "inflow", "range")}</th>
    <th style="text-align:center;">${buildHeaderTools("销项价税合计", "outputVat", "outputVat", "range")}</th>
    <th style="text-align:center;">${buildHeaderTools("差异金额 / 差异占比", "incomeGapText", "incomeGapText", "text")}</th>
    <th style="text-align:center;">${buildHeaderTools("流出金额", "outflow", "outflow", "range")}</th>
    <th style="text-align:center;">${buildHeaderTools("进项价税合计", "inputVat", "inputVat", "range")}</th>
    <th style="text-align:center;">${buildHeaderTools("差异金额 / 差异占比", "costGapText", "costGapText", "text")}</th>
  `;

  const topHead = `
    <tr class="ds3-year-group-head">
      <th rowspan="2" class="ds3-check-cell">
        <div class="ds3-check-wrap">
          <input class="ds3-check-input" id="ds3CheckAll" type="checkbox" />
        </div>
      </th>

      <th rowspan="2" style="min-width:180px;text-align:left;">
        ${buildHeaderTools("对手方名称", "counterparty", "counterparty", "text", "left")}
      </th>

      <th rowspan="2" class="ds3-type-col">
        ${buildHeaderTools("对手方类型", "cpType", "cpType", "select")}
      </th>

      <th colspan="6" class="ds3-group-toggle-cell" style="text-align:center;">
        <button type="button" class="ds3-group-toggle-btn" id="ds3GroupToggleBtn">
          <span>合计</span>
          <span class="ds3-group-toggle-icon">${expandIcon}</span>
        </button>
      </th>

      ${yearColumnsExpanded ? years.map(y => `
          <th colspan="6" class="ds3-col-sep">
            <span class="ds3-year-head">
              <span class="ds3-year-text">${y}</span>
              <span class="ds3-year-info" data-tip="${getYearRangeText(y)}">i</span>
            </span>
          </th>
        `).join("") : ""}

      <th rowspan="2" style="min-width:90px;">操作</th>

      <th rowspan="2" class="ds3-remark-cell">
        ${buildHeaderTools("备注", "remark", "remark", "text")}
      </th>
    </tr>
  `;

  const subHead = `
    <tr class="ds3-year-sub-head">
      ${groupCols}
      ${yearColumnsExpanded ? years.map(() => `
        <th class="ds3-col-sep" style="text-align:center;">流入金额</th>
        <th style="text-align:center;">销项价税合计</th>
        <th style="text-align:center;">差异金额 / 差异占比</th>
        <th style="text-align:center;">流出金额</th>
        <th style="text-align:center;">进项价税合计</th>
        <th style="text-align:center;">差异金额 / 差异占比</th>
      `).join("") : ""}
    </tr>
  `;

  thead.innerHTML = topHead + subHead;

  const toggleBtn = $("ds3GroupToggleBtn");
  if (toggleBtn) {
    toggleBtn.onclick = function () {
      yearColumnsExpanded = !yearColumnsExpanded;
      renderFilterSection();
    };
  }

  if (typeof bindBodyTooltip === "function") {
  bindBodyTooltip();
}




  // 排序按钮
  thead.querySelectorAll(".ds3-sort-btn").forEach(btn => {
    btn.onclick = function (e) {
      e.stopPropagation();
      const key = this.dataset.sortKey;
      if (!key) return;
      toggleSort(key);
      currentPage = 1;
      renderFilterSection();
    };
  });

  // 筛选按钮
  thead.querySelectorAll(".ds3-filter-btn").forEach(btn => {
    btn.onclick = function (e) {
      e.stopPropagation();
      const filterKey = this.dataset.filterKey;
      const filterType = this.dataset.filterType;
      openTableHeaderFilter({
        anchorEl: this,
        filterKey,
        filterType
      });
    };
  });
}


const sortState = {
  key: "",
  order: ""
};

function bindBodyTooltip() {
  let tip = document.getElementById("ds3BodyTooltip");

  if (!tip) {
    tip = document.createElement("div");
    tip.id = "ds3BodyTooltip";
    document.body.appendChild(tip);
  }

  document.querySelectorAll(".ds3-year-info[data-tip]").forEach(el => {
    el.onmouseenter = function () {
      const text = this.getAttribute("data-tip") || "";
      if (!text) return;

      tip.textContent = text;
      tip.style.display = "block";

      const rect = this.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();

      let left = rect.left + rect.width / 2 - tipRect.width / 2;
      let top = rect.top - tipRect.height - 10;

      if (left < 8) left = 8;

      if (left + tipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tipRect.width - 8;
      }

      if (top < 8) {
        top = rect.bottom + 10;
      }

      tip.style.left = left + "px";
      tip.style.top = top + "px";
    };

    el.onmouseleave = function () {
      tip.style.display = "none";
    };
  });
}

function toggleSort(key) {
  if (sortState.key !== key) {
    sortState.key = key;
    sortState.order = "asc";
    return;
  }

  if (sortState.order === "asc") {
    sortState.order = "desc";
  } else if (sortState.order === "desc") {
    sortState.key = "";
    sortState.order = "";
  } else {
    sortState.order = "asc";
  }
}

function openTableHeaderFilter({ anchorEl, filterKey, filterType }) {
  console.log("打开筛选器", filterKey, filterType, anchorEl);
}

  function getYearRangeText(year) {
  return `${year}-01-01 ～ ${year}-12-31`;
}


  function bindRemarkInputs() {
    document.querySelectorAll(".ds3-note-input").forEach(input => {
      input.addEventListener("input", function () {
        remarkStore[this.dataset.cp] = this.value;
      });
    });
  }

  function bindDetailButtons() {
    document.querySelectorAll(".ds3-detail-btn").forEach(btn => {
      btn.onclick = function () {
        const cp = this.dataset.cp;
        if (!cp) return;
        openDetailModal(cp);
      };
    });
  }

  function renderCounterpartyTable(rows) {
      renderFilterTableHead(rows);

      const tbody = $("ds3FilterTable")?.querySelector("tbody");
      if (!tbody) return;

      const allRows = getBaseFilteredRows();
      const years = [...new Set(allRows.map(r => getYear(r.month)))].sort((a, b) => b.localeCompare(a));

      const grouped = {};
      rows.forEach(r => {
        if (!grouped[r.counterparty]) grouped[r.counterparty] = [];
        grouped[r.counterparty].push(r);
      });

      const cps = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

      const totalPages = Math.max(1, Math.ceil(cps.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageCps = cps.slice(start, end);

      tbody.innerHTML = pageCps.map(cp => {
        const cpRows = grouped[cp];
        const total = sumRows(cpRows);
        const totalCols = buildGroupCells(total);

        const yearCols = yearColumnsExpanded
          ? years.map((year) => {
              const yRows = cpRows.filter(r => getYear(r.month) === year);
              const yTotal = sumRows(yRows);
              return buildGroupCells(yTotal, "ds3-col-sep");
            }).join("")
          : "";

        const checked = selectedCounterparties.has(cp) ? "checked" : "";

        return `
          <tr>
            <td class="ds3-check-cell">
              <div class="ds3-check-wrap">
                <input class="ds3-check-input ds3-row-check" type="checkbox" data-cp="${cp}" ${checked} />
              </div>
            </td>

            <td>
              <span class="ds3-row-main-name">${cp}</span>
            </td>

            <td class="ds3-type-col-cell">${getCounterpartyTypeLabel(cpRows)}</td>

            ${totalCols}
            ${yearCols}

            <td>
              <button class="ds3-eye-btn ds3-detail-btn" data-cp="${cp}" type="button" title="查看对手方详情" aria-label="查看对手方详情">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </td>

            <td class="ds3-remark-cell">
              <input
                class="ds3-note-input"
                type="text"
                placeholder="填写备注"
                value="${remarkStore[cp] || ""}"
                data-cp="${cp}"
              />
            </td>
          </tr>
        `;
      }).join("");

      bindRemarkInputs();
      bindDetailButtons();
      bindRowChecks(cps, pageCps);
      renderPagination(cps.length);
    }

    function getCounterpartyTypeLabel(rows){
  if (!rows || !rows.length) return "-";

  const rawType = rows[0].type || "";

  const map = {
    "客户":"客户",
    "供应商":"供应商",
    "物流":"物流商",
    "物流商":"物流商",
    "服务":"服务商",
    "服务商":"服务商",
    "关联方":"关联方",
    "个人":"个人"
  };

  return map[rawType] || rawType || "其他";
}

  function bindRowChecks(allCps, pageCps) {
  const checkAll = $("ds3CheckAll");
  const rowChecks = document.querySelectorAll(".ds3-row-check");

  // 当前页是否全选
  const allCurrentPageChecked = pageCps.length > 0 && pageCps.every(cp => selectedCounterparties.has(cp));
  if (checkAll) {
    checkAll.checked = allCurrentPageChecked;
    checkAll.onclick = function () {
      if (this.checked) {
        pageCps.forEach(cp => selectedCounterparties.add(cp));
      } else {
        pageCps.forEach(cp => selectedCounterparties.delete(cp));
      }
      renderFilterSection();
    };
  }

  rowChecks.forEach(input => {
    input.addEventListener("change", function () {
      const cp = this.dataset.cp;
      if (!cp) return;

      if (this.checked) {
        selectedCounterparties.add(cp);
      } else {
        selectedCounterparties.delete(cp);
      }

      // 更新全选状态
      const allChecked = pageCps.length > 0 && pageCps.every(name => selectedCounterparties.has(name));
      if (checkAll) checkAll.checked = allChecked;
    });
  });
}

function renderPagination(totalItems) {
  const container = $("ds3Pagination");
  if (!container) return;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  let html = `<span class="ds3-page-info">第 ${currentPage} / ${totalPages} 页，共 ${totalItems} 条</span>`;

  html += `
    <button class="ds3-page-btn" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>上一页</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="ds3-page-btn ${i === currentPage ? "is-active" : ""}" data-page="${i}">${i}</button>
    `;
  }

  html += `
    <button class="ds3-page-btn" data-page="next" ${currentPage === totalPages ? "disabled" : ""}>下一页</button>
  `;

  container.innerHTML = html;

  container.querySelectorAll(".ds3-page-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const page = this.dataset.page;
      if (page === "prev" && currentPage > 1) {
        currentPage--;
      } else if (page === "next" && currentPage < totalPages) {
        currentPage++;
      } else if (!isNaN(Number(page))) {
        currentPage = Number(page);
      }
      renderFilterSection();
    });
  });
}

function buildCounterpartyTableHeadHtml(rows, includeCheckColumn = true) {
  const allRows = getBaseFilteredRows();
  const years = [...new Set(allRows.map(r => getYear(r.month)))].sort((a, b) => b.localeCompare(a));
  const expandIcon = yearColumnsExpanded ? "❮" : "❯";

  const topHead = `
    <tr class="ds3-year-group-head">
      ${includeCheckColumn ? `
        <th rowspan="2" class="ds3-check-cell">
          <div class="ds3-check-wrap">
            <input class="ds3-check-input" id="ds3CheckAll" type="checkbox" />
          </div>
        </th>
      ` : ""}

      <th rowspan="2" style="min-width:180px;text-align:left;">对手方名称</th>
      <th rowspan="2" class="ds3-type-col">对手方类型</th>


      <th colspan="6" class="ds3-group-toggle-cell">
        <button type="button" class="ds3-group-toggle-btn" id="ds3GroupToggleBtn">
          <span>合计</span>
          <span class="ds3-group-toggle-icon">${expandIcon}</span>
        </button>
      </th>

      ${yearColumnsExpanded ? years.map(y => `
          <th colspan="6" class="ds3-col-sep">
            <span class="ds3-year-head">
              <span class="ds3-year-text">${y}</span>
              <span class="ds3-year-info" data-tip="${getYearRangeText(y)}">i</span>
            </span>
          </th>
        `).join("") : ""}

      <th rowspan="2" style="min-width:90px;">操作</th>
      <th rowspan="2" class="ds3-remark-cell">备注</th>
    </tr>
  `;

  const subHead = `
    <tr class="ds3-year-sub-head">
      <th>流入金额</th>
      <th>销项价税合计</th>
      <th>差异金额 / 差异占比</th>
      <th>流出金额</th>
      <th>进项价税合计</th>
      <th>差异金额 / 差异占比</th>

      ${yearColumnsExpanded ? years.map(() => `
        <th class="ds3-col-sep">流入金额</th>
        <th>销项价税合计</th>
        <th>差异金额 / 差异占比</th>
        <th>流出金额</th>
        <th>进项价税合计</th>
        <th>差异金额 / 差异占比</th>
      `).join("") : ""}
    </tr>
  `;

  return topHead + subHead;
}

function renderSelectedTableHead(rows) {
  const thead = $("ds3SelectedTableHead");
  if (!thead) return;

  const years = [...new Set(getBaseFilteredRows().map(r => getYear(r.month)))].sort((a, b) => b.localeCompare(a));
  const expandIcon = yearColumnsExpanded ? "❮" : "❯";

  const topHead = `
    <tr class="ds3-year-group-head">
      <th rowspan="2" style="min-width:180px;text-align:left;">对手方名称</th>
      <th rowspan="2" class="ds3-type-col">对手方类型</th>

      <th colspan="6" class="ds3-group-toggle-cell">
        <button type="button" class="ds3-group-toggle-btn" id="ds3SelectedGroupToggleBtn">
          <span>合计</span>
          <span class="ds3-group-toggle-icon">${expandIcon}</span>
        </button>
      </th>

     ${yearColumnsExpanded ? years.map(y => `
          <th colspan="6" class="ds3-col-sep">
            <span class="ds3-year-head">
              <span class="ds3-year-text">${y}</span>
              <span class="ds3-year-info" data-tip="${getYearRangeText(y)}">i</span>
            </span>
          </th>
        `).join("") : ""}

      <th rowspan="2" style="min-width:90px;">操作</th>
      <th rowspan="2" class="ds3-remark-cell">备注</th>
    </tr>
  `;

  const subHead = `
    <tr class="ds3-year-sub-head">
      <th>流入金额</th>
      <th>销项价税合计</th>
      <th>差异金额 / 差异占比</th>
      <th>流出金额</th>
      <th>进项价税合计</th>
      <th>差异金额 / 差异占比</th>

      ${yearColumnsExpanded ? years.map(() => `
        <th class="ds3-col-sep">流入金额</th>
        <th>销项价税合计</th>
        <th>差异金额 / 差异占比</th>
        <th>流出金额</th>
        <th>进项价税合计</th>
        <th>差异金额 / 差异占比</th>
      `).join("") : ""}
    </tr>
  `;

  thead.innerHTML = topHead + subHead;

  const toggleBtn = $("ds3SelectedGroupToggleBtn");
  if (toggleBtn) {
    toggleBtn.onclick = function () {
      yearColumnsExpanded = !yearColumnsExpanded;
      renderSelectedTable();
    };
  }
}

function renderSelectedTable() {
  const selectedRows = getBaseFilteredRows().filter(r => selectedCounterparties.has(r.counterparty));
  const tbody = $("ds3SelectedTable")?.querySelector("tbody");
  if (!tbody) return;

  renderSelectedTableHead(selectedRows);

  const years = [...new Set(getBaseFilteredRows().map(r => getYear(r.month)))].sort((a, b) => b.localeCompare(a));

  const grouped = {};
  selectedRows.forEach(r => {
    if (!grouped[r.counterparty]) grouped[r.counterparty] = [];
    grouped[r.counterparty].push(r);
  });

  const cps = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  tbody.innerHTML = cps.map(cp => {
    const cpRows = grouped[cp];
    const total = sumRows(cpRows);
    const totalCols = buildGroupCells(total);

    const yearCols = yearColumnsExpanded
      ? years.map((year) => {
          const yRows = cpRows.filter(r => getYear(r.month) === year);
          const yTotal = sumRows(yRows);
          return buildGroupCells(yTotal, "ds3-col-sep");
        }).join("")
      : "";

    return `
      <tr>
        <td>
          <span class="ds3-row-main-name">${cp}</span>
        </td>
        <td class="ds3-type-col-cell">${getCounterpartyTypeLabel(cpRows)}</td>

        ${totalCols}
        ${yearCols}

        <td>
          <button class="ds3-eye-btn ds3-detail-btn" data-cp="${cp}" type="button" title="查看对手方详情" aria-label="查看对手方详情">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </td>

        <td class="ds3-remark-cell">
          <input
            class="ds3-note-input"
            type="text"
            placeholder="填写备注"
            value="${remarkStore[cp] || ""}"
            data-cp="${cp}"
          />
        </td>
      </tr>
    `;
  }).join("");

  bindDetailButtons();
  bindRemarkInputs();
}


  function renderDetailKpis(rows) {
      const total = sumRows(rows);
      const incomeGap = +(total.inflow - total.outputVat).toFixed(1);
      const costGap = +(total.outflow - total.inputVat).toFixed(1);

      if ($("ds3DetailInflowTotal")) {
        $("ds3DetailInflowTotal").textContent = fmt(total.inflow);
      }
      if ($("ds3DetailOutputVatTotal")) {
        $("ds3DetailOutputVatTotal").textContent = fmt(total.outputVat);
      }
      if ($("ds3DetailIncomeGapTotal")) {
        $("ds3DetailIncomeGapTotal").textContent = `${fmt(incomeGap)} / ${safePct(incomeGap, total.inflow)}%`;
      }

      if ($("ds3DetailOutflowTotal")) {
        $("ds3DetailOutflowTotal").textContent = fmt(total.outflow);
      }
      if ($("ds3DetailInputVatTotal")) {
        $("ds3DetailInputVatTotal").textContent = fmt(total.inputVat);
      }
      if ($("ds3DetailCostGapTotal")) {
        $("ds3DetailCostGapTotal").textContent = `${fmt(costGap)} / ${safePct(costGap, total.outflow)}%`;
      }
}


  /* =========================
   详情弹窗表格状态
========================= */
const detailTableState = {
  txn: {
    raw: [],
    filtered: [],
    page: 1,
    pageSize: 20,
    sortKey: "",
    sortOrder: "",
    filters: {}
  },
  vat: {
    raw: [],
    filtered: [],
    page: 1,
    pageSize: 20,
    sortKey: "",
    sortOrder: "",
    filters: {}
  }
};

/* =========================
   工具函数
========================= */
function detailText(v) {
  return String(v ?? "").trim();
}

function detailLike(a, b) {
  return detailText(a).toLowerCase().includes(detailText(b).toLowerCase());
}

function detailCompare(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;
  return String(a ?? "").localeCompare(String(b ?? ""), "zh-Hans-CN");
}

function detailPage(arr, page, size) {
  const start = (page - 1) * size;
  return arr.slice(start, start + size);
}

/* =========================
   排序图标 SVG
========================= */
function iconSort(mode = "default") {

  if (mode === "asc") {
    return `
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M8 3 L4.5 7 H11.5 Z" fill="currentColor"></path>
        <path d="M8 13 L11.5 9 H4.5 Z" fill="#cbd5e1"></path>
      </svg>
    `;
  }

  if (mode === "desc") {
    return `
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M8 3 L4.5 7 H11.5 Z" fill="#cbd5e1"></path>
        <path d="M8 13 L11.5 9 H4.5 Z" fill="currentColor"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M8 3 L4.5 7 H11.5 Z" fill="currentColor" opacity=".45"></path>
      <path d="M8 13 L11.5 9 H4.5 Z" fill="currentColor" opacity=".45"></path>
    </svg>
  `;
}


/* =========================
   漏斗图标 SVG
========================= */
function iconFilter() {
  return `
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M2 3 H14 L10 8 V13 L6 11 V8 Z" fill="currentColor"></path>
    </svg>
  `;
}


/* =========================
   详情表排序图标
========================= */
function getDetailSortIcon(type, key) {

  const state = detailTableState[type];

  if (!state || state.sortKey !== key || !state.sortOrder) {
    return iconSort("default");
  }

  return state.sortOrder === "asc"
    ? iconSort("asc")
    : iconSort("desc");
}

/* =========================
   排序 / 筛选
========================= */
function toggleDetailSort(type, key) {
  const state = detailTableState[type];

  if (state.sortKey !== key) {
    state.sortKey = key;
    state.sortOrder = "asc";
  } else if (state.sortOrder === "asc") {
    state.sortOrder = "desc";
  } else if (state.sortOrder === "desc") {
    state.sortKey = "";
    state.sortOrder = "";
  } else {
    state.sortOrder = "asc";
  }

  state.page = 1;

  if (type === "txn") {
    renderTxnDetailTable();
  } else {
    renderVatDetailTable();
  }
}

function openDetailFilter(type, key) {
  const state = detailTableState[type];
  const oldVal = state.filters[key] || "";
  const val = prompt(`请输入筛选条件：${key}`, oldVal);

  if (val === null) return;

  state.filters[key] = val.trim();
  state.page = 1;

  if (type === "txn") {
    renderTxnDetailTable();
  } else {
    renderVatDetailTable();
  }
}

function resetDetailFilters(type) {
  detailTableState[type].filters = {};
  detailTableState[type].sortKey = "";
  detailTableState[type].sortOrder = "";
  detailTableState[type].page = 1;

  if (type === "txn") {
    renderTxnDetailTable();
  } else {
    renderVatDetailTable();
  }
}

/* =========================
   构建银行流水明细数据
========================= */
function buildTxnDetailRows(rows) {
  return rows.map((r, i) => ({
    unit: r.unit || "-",
    account: r.account || `6222****${String(8800 + i).padStart(4, "0")}`,
    counterparty: r.counterparty || "-",
    txnDate: r.txnDate || `${r.month}-15`,
    txnTime: r.txnTime || "14:22:11",
    currency: r.currency || "CNY",
    inflow: Number(r.inflow || 0),
    outflow: Number(r.outflow || 0),
    balance: Number(r.balance || (1000 + i * 35)),
    rmbBalance: Number(r.rmbBalance || (1000 + i * 35)),
    txnType: r.txnType || (r.inflow > 0 ? "收款" : "付款"),
    summary: r.summary || (r.inflow > 0 ? "销售回款" : "采购付款"),
    note: r.note || "",
    relation: r.relation || "-",
    group: r.group || "-",
    cpType: r.type || "-"
  }));
}


/* =========================
   构建增值税明细数据
========================= */
function buildVatDetailRows(rows) {
  return rows.map((r, i) => {
    const outputAmount = Number(r.outputVat || 0);
    const outputTax = +(outputAmount * 0.13).toFixed(1);
    const outputTotal = +(outputAmount + outputTax).toFixed(1);

    const inputAmount = Number(r.inputVat || 0);
    const inputTax = +(inputAmount * 0.13).toFixed(1);
    const deductibleTax = +(inputTax * 0.92).toFixed(1);
    const inputTotal = +(inputAmount + inputTax).toFixed(1);

    return {
      invoiceNo: `FP${100000 + i}`,
      invoiceCode: `04400${1000 + i}`,
      digitalNo: `SDP${200000 + i}`,

      seller: r.unit || "-",
      sellerTaxNo: `9131${1000 + i}`,
      buyer: r.counterparty || "-",
      buyerTaxNo: `9132${1000 + i}`,
      amount: outputAmount,
      tax: outputTax,
      total: outputTotal,
      summary: r.summary || "销项开票",
      note: r.note || "",

      inputBuyer: r.unit || "-",
      inputSeller: r.counterparty || "-",
      inputSellerTaxNo: `9132${1000 + i}`,
      inputAmount: inputAmount,
      inputTax: inputTax,
      inputTotal: inputTotal,
      deductibleTax: deductibleTax,
      inputNote: r.note || ""
    };
  });
}

/* =========================
   绑定表头按钮
========================= */
function bindDetailHeadActions(type, headId) {
  const head = $(headId);
  if (!head) return;

  head.querySelectorAll(".ds3-detail-sort-btn").forEach(btn => {
    btn.onclick = function () {
      const key = this.dataset.key;
      toggleDetailSort(type, key);
    };
  });

  head.querySelectorAll(".ds3-detail-filter-btn").forEach(btn => {
    btn.onclick = function () {
      const key = this.dataset.key;
      openDetailFilter(type, key);
    };
  });
}

/* =========================
   银行流水明细表
========================= */
function renderTxnDetailTable(initRows) {
  const state = detailTableState.txn;

  if (initRows) {
    state.raw = buildTxnDetailRows(initRows);
    state.page = 1;
    state.sortKey = "";
    state.sortOrder = "";
    state.filters = {};
  }

  let rows = [...state.raw];

  Object.keys(state.filters).forEach(key => {
    const val = state.filters[key];
    if (!val) return;
    rows = rows.filter(r => detailLike(r[key], val));
  });

  if (state.sortKey) {
    rows.sort((a, b) => {
      const res = detailCompare(a[state.sortKey], b[state.sortKey]);
      return state.sortOrder === "asc" ? res : -res;
    });
  }

  state.filtered = rows;

  const head = $("ds3TxnDetailHead");
  const body = $("ds3TxnDetailBody");
  if (!head || !body) return;

  head.innerHTML = `
    <tr>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">本方名称</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="unit" type="button">${getDetailSortIcon("txn","unit")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="unit" type="button">${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">本方账号</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="account" type="button">${getDetailSortIcon("txn","account")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="account" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">对方名称</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="counterparty" type="button">${getDetailSortIcon("txn","counterparty")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="counterparty" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">交易日期</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="txnDate" type="button">${getDetailSortIcon("txn","txnDate")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="txnDate" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">交易时间</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="txnTime" type="button">${getDetailSortIcon("txn","txnTime")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="txnTime" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">币种</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="currency" type="button">${getDetailSortIcon("txn","currency")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="currency" type="button"> ${iconFilter()}</button></span></div></th>
      <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">流入金额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inflow" type="button">${getDetailSortIcon("txn","inflow")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="inflow" type="button"> ${iconFilter()}</button></span></div></th>
      <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">流出金额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="outflow" type="button">${getDetailSortIcon("txn","outflow")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="outflow" type="button"> ${iconFilter()}</button></span></div></th>
      <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">交易后余额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="balance" type="button">${getDetailSortIcon("txn","balance")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="balance" type="button"> ${iconFilter()}</button></span></div></th>
      <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">等值人民币余额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="rmbBalance" type="button">${getDetailSortIcon("txn","rmbBalance")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="rmbBalance" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">交易类型</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="txnType" type="button">${getDetailSortIcon("txn","txnType")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="txnType" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">摘要</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="summary" type="button">${getDetailSortIcon("txn","summary")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="summary" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">流水明细尽调备注</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="note" type="button">${getDetailSortIcon("txn","note")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="note" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">关联关系</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="relation" type="button">${getDetailSortIcon("txn","relation")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="relation" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">所属集团</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="group" type="button">${getDetailSortIcon("txn","group")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="group" type="button"> ${iconFilter()}</button></span></div></th>
      <th><div class="ds3-th-tools"><span class="ds3-th-label">对手方类型</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="cpType" type="button">${getDetailSortIcon("txn","cpType")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="cpType" type="button"> ${iconFilter()}</button></span></div></th>
    </tr>
  `;

  bindDetailHeadActions("txn", "ds3TxnDetailHead");

  const pageRows = detailPage(rows, state.page, state.pageSize);

  body.innerHTML = pageRows.map(r => `
    <tr>
      <td>${r.unit}</td>
      <td>${r.account}</td>
      <td>${r.counterparty}</td>
      <td>${r.txnDate}</td>
      <td>${r.txnTime}</td>
      <td>${r.currency}</td>
      <td class="is-num ds3-num-inflow">${fmt(r.inflow)}</td>
      <td class="is-num ds3-num-outflow">${fmt(r.outflow)}</td>
      <td class="is-num">${fmt(r.balance)}</td>
      <td class="is-num">${fmt(r.rmbBalance)}</td>
      <td>${r.txnType}</td>
      <td>${r.summary}</td>
      <td>${r.note}</td>
      <td>${r.relation}</td>
      <td>${r.group}</td>
      <td>${r.cpType}</td>
    </tr>
  `).join("");

  renderDetailPager("txn");
}

/* =========================
   渲染增值税明细表
========================= */
function renderVatDetailTable(initRows) {
  const state = detailTableState.vat;

  if (initRows) {
    state.raw = buildVatDetailRows(initRows);
    state.page = 1;
    state.sortKey = "";
    state.sortOrder = "";
    state.filters = {};
  }

  let rows = [...state.raw];

  Object.keys(state.filters).forEach(key => {
    const val = state.filters[key];
    if (!val) return;
    rows = rows.filter(r => detailLike(r[key], val));
  });

  if (state.sortKey) {
    rows.sort((a, b) => {
      const res = detailCompare(a[state.sortKey], b[state.sortKey]);
      return state.sortOrder === "asc" ? res : -res;
    });
  }

  state.filtered = rows;

  const head = $("ds3VatDetailHead");
  const body = $("ds3VatDetailBody");
  if (!head || !body) return;

  if (vatDetailMode === "output") {
    head.innerHTML = `
      <tr>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">发票号码</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="invoiceNo" type="button">${getDetailSortIcon("vat","invoiceNo")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="invoiceNo" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">发票代码</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="invoiceCode" type="button">${getDetailSortIcon("vat","invoiceCode")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="invoiceCode" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">数电票号码</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="digitalNo" type="button">${getDetailSortIcon("vat","digitalNo")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="digitalNo" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">销方名称</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="seller" type="button">${getDetailSortIcon("vat","seller")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="seller" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">销方识别号</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="sellerTaxNo" type="button">${getDetailSortIcon("vat","sellerTaxNo")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="sellerTaxNo" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">购买方名称</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="buyer" type="button">${getDetailSortIcon("vat","buyer")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="buyer" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">购方识别号</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="buyerTaxNo" type="button">${getDetailSortIcon("vat","buyerTaxNo")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="buyerTaxNo" type="button">${iconFilter()}</button></span></div></th>
        <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">销项金额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="amount" type="button">${getDetailSortIcon("vat","amount")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="amount" type="button">${iconFilter()}</button></span></div></th>
        <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">销项税额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="tax" type="button">${getDetailSortIcon("vat","tax")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="tax" type="button">${iconFilter()}</button></span></div></th>
        <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">销项价税合计</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="total" type="button">${getDetailSortIcon("vat","total")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="total" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">备注 / 摘要</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="summary" type="button">${getDetailSortIcon("vat","summary")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="summary" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">发票明细尽调备注</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="note" type="button">${getDetailSortIcon("vat","note")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="note" type="button">${iconFilter()}</button></span></div></th>
      </tr>
    `;

    body.innerHTML = detailPage(rows, state.page, state.pageSize).map(r => `
      <tr>
        <td>${r.invoiceNo}</td>
        <td>${r.invoiceCode}</td>
        <td>${r.digitalNo}</td>
        <td>${r.seller}</td>
        <td>${r.sellerTaxNo}</td>
        <td>${r.buyer}</td>
        <td>${r.buyerTaxNo}</td>
        <td class="is-num">${fmt(r.amount)}</td>
        <td class="is-num">${fmt(r.tax)}</td>
        <td class="is-num ds3-num-output">${fmt(r.total)}</td>
        <td>${r.summary}</td>
        <td>${r.note}</td>
      </tr>
    `).join("");
  } else {
    head.innerHTML = `
      <tr>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">发票号码</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="invoiceNo" type="button">${getDetailSortIcon("vat","invoiceNo")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="invoiceNo" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">发票代码</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="invoiceCode" type="button">${getDetailSortIcon("vat","invoiceCode")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="invoiceCode" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">数电票号码</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="digitalNo" type="button">${getDetailSortIcon("vat","digitalNo")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="digitalNo" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">购买方名称</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inputBuyer" type="button">${getDetailSortIcon("vat","inputBuyer")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="inputBuyer" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">销方名称</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inputSeller" type="button">${getDetailSortIcon("vat","inputSeller")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="inputSeller" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">销方识别号</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inputSellerTaxNo" type="button">${getDetailSortIcon("vat","inputSellerTaxNo")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="inputSellerTaxNo" type="button">${iconFilter()}</button></span></div></th>
        <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">进项金额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inputAmount" type="button">${getDetailSortIcon("vat","inputAmount")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="inputAmount" type="button">${iconFilter()}</button></span></div></th>
        <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">进项税额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inputTax" type="button">${getDetailSortIcon("vat","inputTax")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="inputTax" type="button">${iconFilter()}</button></span></div></th>
        <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">进项价税合计</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inputTotal" type="button">${getDetailSortIcon("vat","inputTotal")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="total" type="button">${iconFilter()}</button></span></div></th>
        <th class="is-num"><div class="ds3-th-tools"><span class="ds3-th-label">有效抵扣税额</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="deductibleTax" type="button">${getDetailSortIcon("vat","deductibleTax")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="deductibleTax" type="button">${iconFilter()}</button></span></div></th>
        <th><div class="ds3-th-tools"><span class="ds3-th-label">发票明细尽调备注</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort-btn" data-key="inputNote" type="button">${getDetailSortIcon("vat","inputNote")}</button><button class="ds3-th-action ds3-detail-filter-btn" data-key="inputNote" type="button">${iconFilter()}</button></span></div></th>
      </tr>
    `;

    body.innerHTML = detailPage(rows, state.page, state.pageSize).map(r => `
      <tr>
        <td>${r.invoiceNo}</td>
        <td>${r.invoiceCode}</td>
        <td>${r.digitalNo}</td>
        <td>${r.inputBuyer}</td>
        <td>${r.inputSeller}</td>
        <td>${r.inputSellerTaxNo}</td>
        <td class="is-num">${fmt(r.inputAmount)}</td>
        <td class="is-num">${fmt(r.inputTax)}</td>
        <td class="is-num ds3-num-input">${fmt(r.inputTotal)}</td>
        <td class="is-num">${fmt(r.deductibleTax)}</td>
        <td>${r.inputNote}</td>
      </tr>
    `).join("");
  }

  bindDetailHeadActions("vat", "ds3VatDetailHead");
  renderDetailPager("vat");
}
function bindVatTabs() {

  const tabs = document.querySelectorAll(".ds3-vat-tab");

  tabs.forEach(tab => {

    tab.onclick = function () {

      const mode = this.getAttribute("data-mode");

      console.log("点击了TAB:", mode);   // 调试用

      vatDetailMode = mode;

      tabs.forEach(btn => btn.classList.remove("is-active"));
      this.classList.add("is-active");

      detailTableState.vat.page = 1;
      detailTableState.vat.sortKey = "";
      detailTableState.vat.sortOrder = "";
      detailTableState.vat.filters = {};

      // 强制刷新
      setTimeout(() => {
        renderVatDetailTable();
      }, 0);

    };

  });

}



function renderDetailPager(type) {

  const state = detailTableState[type];
  const totalPages = Math.max(
    1,
    Math.ceil(state.filtered.length / state.pageSize)
  );

  if (state.page > totalPages) {
    state.page = totalPages;
  }

  const pagerId =
    type === "txn"
      ? "ds3TxnPager"
      : "ds3VatPager";

  let pager = $(pagerId);

  if (!pager) {
    pager = document.createElement("div");
    pager.id = pagerId;
    pager.className = "ds3-pager";

    const wrap =
      type === "txn"
        ? $("ds3TxnDetailTable")?.closest(".ds3-panel")
        : $("ds3VatDetailTable")?.closest(".ds3-panel");

    if (wrap) wrap.appendChild(pager);
  }

  pager.innerHTML = `
    <button class="ds3-btn small" ${state.page === 1 ? "disabled" : ""}>上一页</button>
    <span>第 ${state.page} / ${totalPages} 页</span>
    <button class="ds3-btn small" ${state.page >= totalPages ? "disabled" : ""}>下一页</button>
  `;

  const btns = pager.querySelectorAll("button");

  if (btns[0]) {
    btns[0].onclick = function () {
      if (state.page > 1) {
        state.page--;
        type === "txn"
          ? renderTxnDetailTable()
          : renderVatDetailTable();
      }
    };
  }

  if (btns[1]) {
    btns[1].onclick = function () {
      if (state.page < totalPages) {
        state.page++;
        type === "txn"
          ? renderTxnDetailTable()
          : renderVatDetailTable();
      }
    };
  }
}

/* =========================
   渲染详情表格（替换你原来的 renderDetailTables）
========================= */
function renderDetailTables(rows) {
  renderTxnDetailTable(rows);
  renderVatDetailTable(rows);
}

/* =========================
   详情图表
========================= */
function renderDetailCharts(monthly) {
  const x = monthly.map(x => getShortMonthLabel(x.month));

  if (!detailInChart && $("ds3DetailInChart")) {
    detailInChart = echarts.init($("ds3DetailInChart"));
  }
  if (!detailOutChart && $("ds3DetailOutChart")) {
    detailOutChart = echarts.init($("ds3DetailOutChart"));
  }

  if (detailInChart) {
    detailInChart.setOption({
      color: ["#108dff", "#38bdf8", "#2468a2"],
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["银行流入", "销项价税合计", "差额"] },
      grid: { left: 52, right: 20, top: 42, bottom: 35 },
      xAxis: { type: "category", data: x },
      yAxis: { type: "value", name: "K" },
      series: [
        { name: "银行流入", type: "bar", barMaxWidth: 24, data: monthly.map(x => x.inflow) },
        { name: "销项价税合计", type: "bar", barMaxWidth: 24, data: monthly.map(x => x.outputVat) },
        { name: "差额", type: "line", smooth: true, data: monthly.map(x => +(x.inflow - x.outputVat).toFixed(1)) }
      ]
    });
  }

  if (detailOutChart) {
    detailOutChart.setOption({
      color: ["#ff5733", "#fb7185", "#be185d"],
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["银行流出", "进项价税合计", "差额"] },
      grid: { left: 52, right: 20, top: 42, bottom: 35 },
      xAxis: { type: "category", data: x },
      yAxis: { type: "value", name: "K" },
      series: [
        { name: "银行流出", type: "bar", barMaxWidth: 24, data: monthly.map(x => x.outflow) },
        { name: "进项价税合计", type: "bar", barMaxWidth: 24, data: monthly.map(x => x.inputVat) },
        { name: "差额", type: "line", smooth: true, data: monthly.map(x => +(x.outflow - x.inputVat).toFixed(1)) }
      ]
    });
  }
}

/* =========================
   按你原来的 openDetailModal 改
========================= */
function openDetailModal(counterparty) {
  const rows = getBaseFilteredRows().filter(r => r.counterparty === counterparty);
  const monthly = buildMonthlySeries(rows);

  if ($("ds3DetailTitle")) {
    $("ds3DetailTitle").textContent = `${counterparty} - 交易对手方详情`;
  }

  renderDetailKpis(rows);
  renderDetailTables(rows);
  bindVatTabs();

  if ($("ds3DetailModal")) {
    $("ds3DetailModal").classList.add("is-show");
  }

  renderDetailCharts(monthly);

  setTimeout(resizeAllCharts, 80);
}

/* =========================
   额外绑定
   在 init() 里调用一次
========================= */
function bindDetailModalExtra() {
  $("ds3TxnResetFilterBtn")?.addEventListener("click", function () {
    resetDetailFilters("txn");
  });

  $("ds3VatResetFilterBtn")?.addEventListener("click", function () {
    resetDetailFilters("vat");
  });
}


  function bindModal() {
    if ($("ds3DetailClose")) {
      $("ds3DetailClose").onclick = () => {
        $("ds3DetailModal")?.classList.remove("is-show");
      };
    }

    if ($("ds3DetailModal")) {
      $("ds3DetailModal").onclick = (e) => {
        if (e.target.id === "ds3DetailModal") {
          $("ds3DetailModal").classList.remove("is-show");
        }
      };
    }
  }
  if ($("ds3SelectedClose")) {
  $("ds3SelectedClose").onclick = () => {
    $("ds3SelectedModal")?.classList.remove("is-show");
  };
}



  function renderFilterSection() {
    const baseRows = getBaseFilteredRows();
    const currentRows = getRowsForCurrentView();

    updateTopKpis(baseRows);
    renderCharts(baseRows);
    renderCounterpartyTable(currentRows);
    renderMonthHint();

    setTimeout(resizeAllCharts, 80);
  }

  function init() {
    initFold();
    initFilterOptions();
    bindModal();


    if ($("ds3ApplyBtn")) {
      $("ds3ApplyBtn").onclick = function () {
        selectedMonth = null;
        renderFilterSection();
      };
    }

    if ($("ds3ViewSelectedBtn")) {
  $("ds3ViewSelectedBtn").onclick = function () {
    if (!selectedCounterparties.size) {
      alert("当前未勾选任何对手方。");
      return;
    }
    renderSelectedTable();
    $("ds3SelectedModal")?.classList.add("is-show");
  };
}

    if ($("ds3ResetBtn")) {
      $("ds3ResetBtn").onclick = function () {
        if ($("ds3Unit")) $("ds3Unit").value = "全部";
        if ($("ds3Func")) $("ds3Func").value = "全部";
        if ($("ds3Type")) $("ds3Type").value = "全部";
        if ($("ds3Keyword")) $("ds3Keyword").value = "";
        selectedMonth = null;
        yearColumnsExpanded = false;
        renderFilterSection();
      };
    }

    if ($("ds3ResetMonthBtn")) {
      $("ds3ResetMonthBtn").onclick = function () {
        selectedMonth = null;
        yearColumnsExpanded = false;
        renderFilterSection();
      };
    }

    renderFilterSection();

    window.addEventListener("resize", resizeAllCharts);
    setTimeout(resizeAllCharts, 120);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
