(function () {
  const charts = {};
  let detailInChart = null;
  let detailOutChart = null;

  let selectedMonth = null; // 点击柱状图后的月度视图
  let yearColumnsExpanded = false; // 表头“合计”右侧年份列组是否展开
  const remarkStore = {};

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
      <td class="is-num ds3-num-inflow ${withSepClass}">${fmt(total.inflow)}</td>
      <td class="is-num ds3-num-output">${fmt(total.outputVat)}</td>
      <td class="is-num">${gapHtmlBlue(incomeGap, total.inflow)}</td>
      <td class="is-num ds3-num-outflow">${fmt(total.outflow)}</td>
      <td class="is-num ds3-num-input">${fmt(total.inputVat)}</td>
      <td class="is-num">${gapHtmlRed(costGap, total.outflow)}</td>
    `;
  }

  function renderFilterTableHead(rows) {
    const thead = $("ds3FilterTableHead");
    if (!thead) return;

    // 年份列组来自当前全部筛选结果，而不是当前月度切片
    const allRows = getBaseFilteredRows();
    const years = [...new Set(allRows.map(r => getYear(r.month)))].sort((a, b) => b.localeCompare(a));
    const expandIcon = yearColumnsExpanded ? "▾" : "▸";


    const groupCols = `
      <th>流入金额</th>
      <th>销项价税合计</th>
      <th>差异金额 / 差异占比</th>
      <th>流出金额</th>
      <th>进项价税合计</th>
      <th>差异金额 / 差异占比</th>
    `;

    const topHead = `
      <tr class="ds3-year-group-head">
        <th rowspan="2" style="min-width:180px;text-align:left;">对手方名称</th>

        <th colspan="6" class="ds3-group-toggle-cell">
          <button type="button" class="ds3-group-toggle-btn" id="ds3GroupToggleBtn">
            <span>合计</span>
            <span class="ds3-group-toggle-icon">${expandIcon}</span>
          </button>
        </th>

        ${yearColumnsExpanded ? years.map(y => `
          <th colspan="6" class="ds3-col-sep">${y}</th>
        `).join("") : ""}
        <th rowspan="2" style="min-width:90px;">操作</th>
        <th rowspan="2" class="ds3-remark-cell">备注</th>

      </tr>
    `;

    const subHead = `
      <tr class="ds3-year-sub-head">
        ${groupCols}
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

    const toggleBtn = $("ds3GroupToggleBtn");
    if (toggleBtn) {
      toggleBtn.onclick = function () {
        yearColumnsExpanded = !yearColumnsExpanded;
        renderFilterSection();
      };
    }
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
          ${totalCols}
          ${yearCols}

          <td>
            <button class="ds3-btn small is-primary ds3-detail-btn" data-cp="${cp}" type="button">查看详情</button>
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

  function renderDetailTables(monthly) {
  const inTbody = $("ds3DetailInTable")?.querySelector("tbody");
  const outTbody = $("ds3DetailOutTable")?.querySelector("tbody");

  if (inTbody) {
    inTbody.innerHTML = monthly.map(m => {
      const gap = +(m.inflow - m.outputVat).toFixed(1);

      return `
        <tr>
          <td>${getMonthLabel(m.month)}</td>
          <td class="is-num ds3-num-inflow">${fmt(m.inflow)}</td>
          <td class="is-num ds3-num-output">${fmt(m.outputVat)}</td>
          <td class="is-num">
            <span class="ds3-gap-blue">
              ${fmt(gap)} / ${safePct(gap, m.inflow)}%
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  if (outTbody) {
    outTbody.innerHTML = monthly.map(m => {
      const gap = +(m.outflow - m.inputVat).toFixed(1);

      return `
        <tr>
          <td>${getMonthLabel(m.month)}</td>
          <td class="is-num ds3-num-outflow">${fmt(m.outflow)}</td>
          <td class="is-num ds3-num-input">${fmt(m.inputVat)}</td>
          <td class="is-num">
            <span class="ds3-gap-red">
              ${fmt(gap)} / ${safePct(gap, m.outflow)}%
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }
}

  function openDetailModal(counterparty) {
      const rows = getBaseFilteredRows().filter(r => r.counterparty === counterparty);
      const monthly = buildMonthlySeries(rows);

      if ($("ds3DetailTitle")) {
        $("ds3DetailTitle").textContent = `${counterparty} - 交易对手方详情`;
      }

      renderDetailKpis(rows);
      renderDetailTables(monthly);


    if ($("ds3DetailModal")) {
      $("ds3DetailModal").classList.add("is-show");
    }

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

    setTimeout(resizeAllCharts, 80);
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
