(function () {
  const charts = {};
  let detailChart = null;

  const rawData = [
    { month: "2024-01", unit: "Test2", func: "销售", type: "客户", counterparty: "上海A贸易有限公司", inflow: 210, outflow: 0, outputVat: 195, inputVat: 0, txn: 12 },
    { month: "2024-02", unit: "Test2", func: "销售", type: "客户", counterparty: "杭州B科技有限公司", inflow: 280, outflow: 0, outputVat: 260, inputVat: 0, txn: 10 },
    { month: "2024-03", unit: "Test2", func: "销售", type: "客户", counterparty: "上海A贸易有限公司", inflow: 420, outflow: 0, outputVat: 260, inputVat: 0, txn: 18 },
    { month: "2024-04", unit: "Test2", func: "采购", type: "供应商", counterparty: "宁波C供应链有限公司", inflow: 0, outflow: 210, outputVat: 0, inputVat: 198, txn: 9 },
    { month: "2024-05", unit: "Test2", func: "采购", type: "供应商", counterparty: "苏州D工业有限公司", inflow: 0, outflow: 240, outputVat: 0, inputVat: 226, txn: 8 },
    { month: "2024-06", unit: "Test2", func: "销售", type: "客户", counterparty: "广州F商贸有限公司", inflow: 500, outflow: 0, outputVat: 590, inputVat: 0, txn: 15 },
    { month: "2024-07", unit: "Test2", func: "销售", type: "客户", counterparty: "深圳E服务有限公司", inflow: 390, outflow: 88, outputVat: 365, inputVat: 32, txn: 13 },
    { month: "2024-08", unit: "Test2", func: "采购", type: "供应商", counterparty: "宁波C供应链有限公司", inflow: 0, outflow: 355, outputVat: 0, inputVat: 220, txn: 11 },
    { month: "2024-09", unit: "Test2", func: "销售", type: "客户", counterparty: "深圳E服务有限公司", inflow: 280, outflow: 66, outputVat: 270, inputVat: 62, txn: 7 },
    { month: "2024-10", unit: "Test2", func: "采购", type: "供应商", counterparty: "苏州D工业有限公司", inflow: 0, outflow: 210, outputVat: 0, inputVat: 195, txn: 6 },
    { month: "2024-11", unit: "Test2", func: "销售", type: "客户", counterparty: "杭州B科技有限公司", inflow: 330, outflow: 0, outputVat: 320, inputVat: 0, txn: 9 },
    { month: "2024-12", unit: "Test2", func: "销售", type: "客户", counterparty: "上海A贸易有限公司", inflow: 420, outflow: 0, outputVat: 402, inputVat: 0, txn: 14 }
  ];

  const months = ["2024-01","2024-02","2024-03","2024-04","2024-05","2024-06","2024-07","2024-08","2024-09","2024-10","2024-11","2024-12"];

  function $(id) { return document.getElementById(id); }

  function pct(a, b) {
    if (!b) return 0;
    return +(a / b * 100).toFixed(1);
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
        result[idx].inflow += r.inflow;
        result[idx].outflow += r.outflow;
        result[idx].outputVat += r.outputVat;
        result[idx].inputVat += r.inputVat;
      }
    });
    return result;
  }

  function groupByCounterparty(rows) {
    const map = {};
    rows.forEach(r => {
      if (!map[r.counterparty]) {
        map[r.counterparty] = {
          counterparty: r.counterparty,
          inflow: 0, outflow: 0, outputVat: 0, inputVat: 0, txn: 0
        };
      }
      map[r.counterparty].inflow += r.inflow;
      map[r.counterparty].outflow += r.outflow;
      map[r.counterparty].outputVat += r.outputVat;
      map[r.counterparty].inputVat += r.inputVat;
      map[r.counterparty].txn += r.txn;
    });

    return Object.values(map).map(x => {
      const total = x.inflow + x.outflow + x.outputVat + x.inputVat;
      return {
        ...x,
        total,
        incomeRatio: x.inflow ? pct(x.outputVat, x.inflow) : 0,
        costRatio: x.outflow ? pct(x.inputVat, x.outflow) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }

  function createChart(id, option) {
    const dom = $(id);
    if (!dom || typeof echarts === "undefined") return null;
    const chart = echarts.init(dom);
    chart.setOption(option);
    return chart;
  }

  function resizeAllCharts() {
    Object.values(charts).forEach(c => {
      try { c.resize(); } catch (e) {}
    });
    if (detailChart) {
      try { detailChart.resize(); } catch (e) {}
    }
  }

  function initTabs() {
    const tabs = Array.from(document.querySelectorAll("#ds3Tabbar .ds3-tab"));
    const panes = Array.from(document.querySelectorAll(".ds3-pane"));
    const inkbar = $("ds3Inkbar");

    function moveInkbar(activeTab) {
      if (!activeTab || !inkbar) return;
      inkbar.style.width = `${activeTab.offsetWidth}px`;
      inkbar.style.left = `${activeTab.offsetLeft}px`;
    }

    function activate(tabKey) {
      tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === tabKey));
      panes.forEach(p => p.classList.toggle("is-active", p.id === `ds3-pane-${tabKey}`));
      moveInkbar(tabs.find(t => t.dataset.tab === tabKey));
      setTimeout(resizeAllCharts, 80);
    }

    tabs.forEach(tab => {
      tab.addEventListener("click", () => activate(tab.dataset.tab));
    });

    window.addEventListener("resize", () => {
      const active = tabs.find(t => t.classList.contains("is-active"));
      moveInkbar(active);
    });

    activate("overview");
  }

  function initFold() {
    document.querySelectorAll(".ds3-fold").forEach(btn => {
      btn.addEventListener("click", function () {
        const block = this.closest(".ds3-block");
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

    $("ds3Unit").innerHTML = units.map(x => `<option value="${x}">${x}</option>`).join("");
    $("ds3Func").innerHTML = funcs.map(x => `<option value="${x}">${x}</option>`).join("");
    $("ds3Type").innerHTML = types.map(x => `<option value="${x}">${x}</option>`).join("");
  }

  function getFilteredRows() {
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

  function initOverviewCharts() {
    charts.overviewCompare = createChart("ds3OverviewCompareChart", {
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["银行金额", "税票金额"] },
      grid: { left: 50, right: 20, top: 40, bottom: 35 },
      xAxis: { type: "category", data: ["收入侧", "成本侧"] },
      yAxis: { type: "value", name: "K" },
      series: [
        { name: "银行金额", type: "bar", barWidth: 34, data: [3596044, 2551804] },
        { name: "税票金额", type: "bar", barWidth: 34, data: [3182110, 2106540] }
      ]
    });

    charts.overviewGap = createChart("ds3OverviewGapChart", {
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [{
        type: "pie",
        radius: ["42%", "72%"],
        center: ["50%", "46%"],
        label: { formatter: "{b}\n{d}%" },
        data: [
          { value: 180000, name: "有流水无税票" },
          { value: 95000, name: "有税票无流水" },
          { value: 240000, name: "金额差异过大" },
          { value: 343198, name: "其他差异" }
        ]
      }]
    });

    charts.overviewRatio = createChart("ds3OverviewRatioChart", {
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["收入匹配率", "成本匹配率"] },
      grid: { left: 50, right: 20, top: 40, bottom: 35 },
      xAxis: { type: "category", data: ["1月","2月","3月","4月","5月","6月"] },
      yAxis: { type: "value", name: "%", max: 130 },
      series: [
        { name: "收入匹配率", type: "line", smooth: true, data: [93, 92, 62, 105, 94, 118] },
        { name: "成本匹配率", type: "line", smooth: true, data: [83, 93, 73, 94, 94, 85] }
      ]
    });

    charts.overviewStructure = createChart("ds3OverviewStructureChart", {
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [{
        type: "pie",
        radius: ["42%", "72%"],
        center: ["50%", "46%"],
        label: { formatter: "{b}\n{d}%" },
        data: [
          { value: 3596044, name: "银行流入" },
          { value: 3182110, name: "销项税" },
          { value: 2551804, name: "银行流出" },
          { value: 2106540, name: "进项税" }
        ]
      }]
    });
  }

  function renderFilterSection() {
    const rows = getFilteredRows();
    const monthly = buildMonthlySeries(rows);
    const cps = groupByCounterparty(rows);
    const searchKeyword = ($("ds3TableSearch")?.value || "").trim().toLowerCase();
    const x = monthly.map(x => x.month.replace("2024-", "").replace("-", "月"));

    if (!charts.filterIn) charts.filterIn = echarts.init($("ds3FilterInChart"));
    charts.filterIn.setOption({
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["银行流入", "销项税", "差额"] },
      grid: { left: 46, right: 20, top: 42, bottom: 35 },
      xAxis: { type: "category", data: x },
      yAxis: { type: "value", name: "K" },
      series: [
        { name: "银行流入", type: "bar", data: monthly.map(x => x.inflow) },
        { name: "销项税", type: "bar", data: monthly.map(x => x.outputVat) },
        { name: "差额", type: "line", smooth: true, data: monthly.map(x => +(x.inflow - x.outputVat).toFixed(1)) }
      ]
    });

    if (!charts.filterOut) charts.filterOut = echarts.init($("ds3FilterOutChart"));
    charts.filterOut.setOption({
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["银行流出", "进项税", "差额"] },
      grid: { left: 46, right: 20, top: 42, bottom: 35 },
      xAxis: { type: "category", data: x },
      yAxis: { type: "value", name: "K" },
      series: [
        { name: "银行流出", type: "bar", data: monthly.map(x => x.outflow) },
        { name: "进项税", type: "bar", data: monthly.map(x => x.inputVat) },
        { name: "差额", type: "line", smooth: true, data: monthly.map(x => +(x.outflow - x.inputVat).toFixed(1)) }
      ]
    });

    const filtered = cps.filter(r => !searchKeyword || r.counterparty.toLowerCase().includes(searchKeyword));
    const totalAmount = filtered.reduce((s, x) => s + x.total, 0);

    $("ds3FilterTable").querySelector("tbody").innerHTML = filtered.map(r => {
      const tagClass = (r.incomeRatio < 70 || r.costRatio < 60) ? "is-high"
        : ((r.incomeRatio < 90 || r.costRatio < 85) ? "is-mid" : "is-low");
      const tagText = tagClass === "is-high" ? "高" : (tagClass === "is-mid" ? "中" : "低");

      return `
        <tr>
          <td>${r.counterparty}</td>
          <td class="is-num">${r.inflow.toLocaleString()}</td>
          <td class="is-num">${r.outflow.toLocaleString()}</td>
          <td class="is-num">${r.outputVat.toLocaleString()}</td>
          <td class="is-num">${r.inputVat.toLocaleString()}</td>
          <td class="is-num">${r.total.toLocaleString()}</td>
          <td class="is-num">${r.txn}</td>
          <td class="is-num">${totalAmount ? ((r.total / totalAmount) * 100).toFixed(1) : 0}%</td>
          <td><span class="ds3-tag ${tagClass}">${tagText}</span></td>
          <td><button class="ds3-btn small is-primary ds3-detail-btn" data-cp="${r.counterparty}" type="button">查看详情</button></td>
        </tr>
      `;
    }).join("");

    bindDetailButtons(rows);
  }

  function initCounterpartyCharts() {
    charts.counterpartyAmount = createChart("ds3CounterpartyAmountChart", {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { top: 0, data: ["银行流入", "销项税", "银行流出", "进项税"] },
      grid: { left: 70, right: 20, top: 42, bottom: 20 },
      xAxis: { type: "value", name: "K" },
      yAxis: { type: "category", data: ["上海A贸易","杭州B科技","宁波C供应链","苏州D工业","深圳E服务"] },
      series: [
        { name: "银行流入", type: "bar", data: [820, 520, 0, 0, 210] },
        { name: "销项税", type: "bar", data: [601, 501, 0, 0, 120] },
        { name: "银行流出", type: "bar", data: [0, 0, 430, 385, 88] },
        { name: "进项税", type: "bar", data: [0, 0, 201, 342, 32] }
      ]
    });

    charts.counterpartyRatio = createChart("ds3CounterpartyRatioChart", {
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["收入匹配率", "成本匹配率"] },
      grid: { left: 52, right: 20, top: 42, bottom: 35 },
      xAxis: { type: "category", data: ["上海A贸易","杭州B科技","宁波C供应链","苏州D工业","深圳E服务"] },
      yAxis: { type: "value", name: "%", max: 120 },
      series: [
        { name: "收入匹配率", type: "bar", data: [73.3, 96.3, 0, 0, 57.1] },
        { name: "成本匹配率", type: "bar", data: [0, 0, 46.7, 88.8, 36.4] }
      ]
    });
  }

  function initExceptionCharts() {
    charts.exceptionType = createChart("ds3ExceptionTypeChart", {
      tooltip: { trigger: "item" },
      series: [{
        type: "pie",
        radius: ["46%", "72%"],
        center: ["50%", "52%"],
        label: { formatter: "{b}\n{d}%" },
        data: [
          { value: 12, name: "有流水无税票" },
          { value: 7, name: "有税票无流水" },
          { value: 9, name: "金额差异过大" },
          { value: 4, name: "名称不一致" }
        ]
      }]
    });

    charts.exceptionMonth = createChart("ds3ExceptionMonthChart", {
      tooltip: { trigger: "axis" },
      grid: { left: 42, right: 20, top: 30, bottom: 34 },
      xAxis: { type: "category", data: ["3月", "4月", "5月", "6月", "7月", "8月", "9月"] },
      yAxis: { type: "value", name: "条数" },
      series: [{ type: "bar", barWidth: 28, data: [6, 3, 2, 7, 4, 8, 5] }]
    });
  }

  function bindDetailButtons(rows) {
    document.querySelectorAll(".ds3-detail-btn").forEach(btn => {
      btn.onclick = function () {
        const cp = this.dataset.cp;
        $("ds3DetailTitle").textContent = `${cp} - 月度明细`;
        const monthly = buildMonthlySeries(rows.filter(r => r.counterparty === cp));
        const x = monthly.map(x => x.month.replace("2024-", "").replace("-", "月"));

        $("ds3DetailModal").classList.add("is-show");

        if (!detailChart) detailChart = echarts.init($("ds3DetailChart"));
        detailChart.setOption({
          tooltip: { trigger: "axis" },
          legend: { top: 0, data: ["流入", "流出", "销项税", "进项税"] },
          grid: { left: 46, right: 20, top: 42, bottom: 35 },
          xAxis: { type: "category", data: x },
          yAxis: { type: "value", name: "K" },
          series: [
            { name: "流入", type: "bar", data: monthly.map(x => x.inflow) },
            { name: "流出", type: "bar", data: monthly.map(x => x.outflow) },
            { name: "销项税", type: "line", smooth: true, data: monthly.map(x => x.outputVat) },
            { name: "进项税", type: "line", smooth: true, data: monthly.map(x => x.inputVat) }
          ]
        });
        setTimeout(() => detailChart.resize(), 80);
      };
    });
  }

  function bindModal() {
    $("ds3DetailClose").onclick = () => $("ds3DetailModal").classList.remove("is-show");
    $("ds3DetailModal").onclick = (e) => {
      if (e.target.id === "ds3DetailModal") $("ds3DetailModal").classList.remove("is-show");
    };
  }

  function init() {
    initTabs();
    initFold();
    initFilterOptions();
    initOverviewCharts();
    initCounterpartyCharts();
    initExceptionCharts();
    bindModal();

    $("ds3ApplyBtn").onclick = renderFilterSection;
    $("ds3ResetBtn").onclick = function () {
      $("ds3Unit").value = "全部";
      $("ds3Func").value = "全部";
      $("ds3Type").value = "全部";
      $("ds3Keyword").value = "";
      $("ds3TableSearch").value = "";
      renderFilterSection();
    };
    $("ds3TableSearch").addEventListener("input", renderFilterSection);

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
