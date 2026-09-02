(function(){
  'use strict';

  if (window.AuditUnit?.ready) return;

  const UNIT_KEY = 'auditCompass.amountUnit';
  const DECIMAL_KEY = 'auditCompass.amountDecimals';
  const units = {
    yuan:{ factor:1, label:'元', short:'元' },
    k:{ factor:1000, label:'千元', short:'K' },
    w:{ factor:10000, label:'万元', short:'W' },
    m:{ factor:1000000, label:'百万元', short:'M' },
    b:{ factor:100000000, label:'亿元', short:'B' }
  };
  const unitAliases = {
    '元':'yuan', '千元':'k', 'K':'k', 'k':'k',
    '万元':'w', '万':'w', 'W':'w', 'w':'w',
    '百万元':'m', '百万':'m', 'M':'m', 'm':'m',
    '亿元':'b', '亿':'b', 'B':'b', 'b':'b'
  };
  const state = {
    unit: units[localStorage.getItem(UNIT_KEY)] ? localStorage.getItem(UNIT_KEY) : 'm',
    decimals: Math.max(0, Math.min(4, Number(localStorage.getItem(DECIMAL_KEY) ?? 0) || 0))
  };
  const originalText = new WeakMap();
  const originalNumeric = new WeakMap();

  const parseNumber = value => Number(String(value ?? '').replace(/,/g, '').trim());
  const convert = (value, sourceUnit='k') => {
    const source = units[unitAliases[sourceUnit] || sourceUnit] || units.k;
    return (Number(value) || 0) * source.factor / units[state.unit].factor;
  };
  const formatNumber = value => Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits:state.decimals,
    maximumFractionDigits:state.decimals
  });
  const format = (value, sourceUnit='k') => formatNumber(convert(value, sourceUnit));
  const currentLabel = () => units[state.unit].label;

  function replaceExplicitAmounts(text){
    return text.replace(/(-?[\d,]+(?:\.\d+)?)\s*(百万元|千元|万元|亿元|百万|万|亿|元|K|W|M|B)(?![A-Za-z])/g,
      (match, number, sourceUnit) => {
        const parsed = parseNumber(number);
        return Number.isFinite(parsed) ? format(parsed, sourceUnit) : match;
      });
  }

  function transformTextNode(node){
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|TEXTAREA|OPTION|SVG|CANVAS)$/i.test(parent.tagName)) return;
    if (parent.closest('[data-audit-unit-ignore]')) return;
    const source = originalText.has(node) ? originalText.get(node) : node.nodeValue;
    if (!source || !/(百万元|千元|万元|亿元|百万|K|W|M|B|\d[\d,.]*\s*(?:万|亿|元))/.test(source)) return;
    if (!originalText.has(node)) originalText.set(node, source);
    parent.dataset.auditUnitExplicit = 'true';
    let transformed = /\d/.test(source) ? replaceExplicitAmounts(source) : source;
    transformed = transformed
      .replace(/百万元|千元|万元|亿元/g, currentLabel())
      .replace(/（万）/g, `（${currentLabel()}）`)
      .replace(/单位[:：]\s*万(?!元)/g, `单位：${currentLabel()}`);
    if (node.nodeValue !== transformed) node.nodeValue = transformed;
  }

  function buildHeaderMap(table){
    const rows = Array.from(table.tHead?.rows || []);
    if (!rows.length) return [];
    const grid = [];
    rows.forEach((row, rowIndex) => {
      grid[rowIndex] ||= [];
      let column = 0;
      Array.from(row.cells).forEach(cell => {
        while (grid[rowIndex][column]) column += 1;
        const colSpan = Math.max(1, cell.colSpan || 1);
        const rowSpan = Math.max(1, cell.rowSpan || 1);
        for (let r=0; r<rowSpan; r+=1) {
          grid[rowIndex+r] ||= [];
          for (let c=0; c<colSpan; c+=1) grid[rowIndex+r][column+c] = cell;
        }
        column += colSpan;
      });
    });
    const width = Math.max(...grid.map(row => row.length), 0);
    return Array.from({length:width}, (_, column) => {
      const labels = [];
      grid.forEach(row => {
        const label = row[column]?.textContent?.replace(/\s+/g, ' ').trim();
        if (label && labels[labels.length-1] !== label) labels.push(label);
      });
      return labels.join(' / ');
    });
  }

  function isAmountHeader(header){
    if (!header) return false;
    if (/(占比|比例|税率|数量|笔数|次数|日期|时间|期间|年度|月份|账号|编号|序号|家数|人数)/.test(header)) return false;
    return /(金额|余额|价税合计|税额|总额|流入|流出|差异|资金|发票)/.test(header);
  }

  function formatNumericElement(element, sourceUnit='k'){
    if (!element || element.querySelector('input,select,button,svg,canvas')) return;
    if (element.matches('[data-audit-unit-explicit]') || element.querySelector('[data-audit-unit-explicit]')) return;
    const rawText = element.textContent?.trim();
    if (!rawText || !/^-?[\d,]+(?:\.\d+)?$/.test(rawText)) return;
    if (!originalNumeric.has(element)) originalNumeric.set(element, { value:parseNumber(rawText), sourceUnit });
    const original = originalNumeric.get(element);
    if (Number.isFinite(original.value)) {
      const formatted = format(original.value, original.sourceUnit);
      if (element.textContent !== formatted) element.textContent = formatted;
    }
  }

  function transformTable(table){
    if (table.closest('[data-audit-unit-ignore]')) return;
    const headers = buildHeaderMap(table);
    if (!headers.length) return;
    const sourceUnit = table.dataset.auditSourceUnit || 'k';
    Array.from(table.tBodies || []).forEach(body => {
      Array.from(body.rows).forEach(row => {
        Array.from(row.cells).forEach((cell, index) => {
          if (cell.matches('[data-audit-unit-ignore]') || cell.querySelector('[data-audit-unit-ignore]')) return;
          if (!isAmountHeader(headers[index])) return;
          const target = cell.children.length === 1 && /^(STRONG|B|SPAN)$/i.test(cell.firstElementChild?.tagName || '')
            ? cell.firstElementChild : cell;
          formatNumericElement(target, sourceUnit);
        });
      });
    });
  }

  function transformAmountSequence(startCell, length=6){
    let cell = startCell;
    for (let index=0; cell && index<length; index+=1, cell=cell.nextElementSibling) {
      if (!cell.matches('td,th')) break;
      const target = cell.children.length === 1 && /^(STRONG|B|SPAN)$/i.test(cell.firstElementChild?.tagName || '')
        ? cell.firstElementChild : cell;
      formatNumericElement(target, 'k');
    }
  }

  function transformSemanticAmounts(root){
    root.querySelectorAll?.('[data-audit-amount-k]').forEach(cell => {
      const value = parseNumber(cell.dataset.auditAmountK);
      if (!Number.isFinite(value)) return;
      const formatted = format(value, 'k');
      if (cell.textContent !== formatted) cell.textContent = formatted;
    });
    root.querySelectorAll?.('td.ds3-num-inflow').forEach(cell => transformAmountSequence(cell, 6));
    root.querySelectorAll?.('td.ds3-num-output,td.ds3-num-outflow,td.ds3-num-input').forEach(cell => {
      const target = cell.children.length === 1 && /^(STRONG|B|SPAN)$/i.test(cell.firstElementChild?.tagName || '')
        ? cell.firstElementChild : cell;
      formatNumericElement(target, 'k');
    });
  }

  function transformMetric(element){
    if (!element || element.closest('table')) return;
    const parentText = element.parentElement?.textContent || '';
    if (!/(金额|余额|总额|流入|流出|价税|税额|资金|发票)/.test(parentText)) return;
    formatNumericElement(element, 'k');
  }

  function scan(root=document){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(transformTextNode);
    root.querySelectorAll?.('table').forEach(transformTable);
    transformSemanticAmounts(root);
    root.querySelectorAll?.('.kpi-value,.num,.metric-value,.value,.ds3-kpi b,.ds3-vat-kpi strong').forEach(transformMetric);
    root.querySelectorAll?.('[data-audit-unit-label]').forEach(el => {
      if (el.textContent !== currentLabel()) el.textContent = currentLabel();
    });
  }

  function detectUnit(text){
    const match = String(text || '').match(/百万元|千元|万元|亿元|百万|万|亿/);
    return match ? unitAliases[match[0]] : null;
  }

  function replaceUnitLabels(value){
    if (typeof value === 'string') {
      return replaceExplicitAmounts(value).replace(/百万元|千元|万元|亿元/g, currentLabel());
    }
    if (Array.isArray(value)) return value.map(replaceUnitLabels);
    if (!value || typeof value !== 'object') return value;
    const copy = {};
    Object.keys(value).forEach(key => { copy[key] = replaceUnitLabels(value[key]); });
    return copy;
  }

  function scaleDatum(datum, ratio, axis='y'){
    if (typeof datum === 'number') return datum * ratio;
    if (Array.isArray(datum)) {
      const copy = datum.slice();
      if (axis === 'x' && typeof copy[0] === 'number') copy[0] *= ratio;
      else if (typeof copy[copy.length-1] === 'number') copy[copy.length-1] *= ratio;
      return copy;
    }
    if (datum && typeof datum === 'object') {
      const copy = {...datum};
      copy.value = scaleDatum(copy.value, ratio, axis);
      return copy;
    }
    return datum;
  }

  function scaleMarkLine(markLine, ratio, axis='y'){
    if (!markLine || !Array.isArray(markLine.data)) return markLine;
    return {
      ...markLine,
      data:markLine.data.map(item => {
        if (!item || typeof item !== 'object') return item;
        const copy = {...item};
        if (axis === 'x' && typeof copy.xAxis === 'number') copy.xAxis *= ratio;
        if (axis === 'y' && typeof copy.yAxis === 'number') copy.yAxis *= ratio;
        return copy;
      })
    };
  }

  function transformChartOption(baseOption){
    const option = replaceUnitLabels(baseOption);
    const originalY = Array.isArray(baseOption.yAxis) ? baseOption.yAxis : [baseOption.yAxis || {}];
    const originalX = Array.isArray(baseOption.xAxis) ? baseOption.xAxis : [baseOption.xAxis || {}];
    const titleUnit = detectUnit(Array.isArray(baseOption.title) ? baseOption.title[0]?.text : baseOption.title?.text);
    const yUnits = originalY.map((axis,index) => detectUnit(axis?.name) || (index === 0 ? titleUnit : null));
    const xUnits = originalX.map(axis => detectUnit(axis?.name));
    const series = Array.isArray(option.series) ? option.series : [];
    option.series = series.map(seriesItem => {
      const copy = {...seriesItem};
      const xUnit = xUnits[Number(copy.xAxisIndex) || 0];
      const yUnit = yUnits[Number(copy.yAxisIndex) || 0];
      const sourceUnit = yUnit || xUnit;
      if (!sourceUnit || !Array.isArray(copy.data)) return copy;
      const ratio = units[sourceUnit].factor / units[state.unit].factor;
      copy.data = copy.data.map(datum => scaleDatum(datum, ratio, xUnit && !yUnit ? 'x' : 'y'));
      copy.markLine = scaleMarkLine(copy.markLine, ratio, xUnit && !yUnit ? 'x' : 'y');
      return copy;
    });
    return option;
  }

  function patchChart(chart){
    if (!chart || chart.__auditUnitPatched) return;
    chart.__auditUnitPatched = true;
    const nativeSetOption = chart.setOption.bind(chart);
    chart.setOption = function(option, ...args){
      return nativeSetOption(transformChartOption(option), ...args);
    };
  }

  function patchECharts(){
    if (!window.echarts || window.echarts.__auditUnitPatched) return false;
    window.echarts.__auditUnitPatched = true;
    const nativeInit = window.echarts.init.bind(window.echarts);
    window.echarts.init = function(...args){
      const chart = nativeInit(...args);
      patchChart(chart);
      return chart;
    };
    document.querySelectorAll('[_echarts_instance_]').forEach(element => {
      const chart = window.echarts.getInstanceByDom(element);
      if (!chart || chart.__auditUnitPatched) return;
      const baseOption = chart.getOption();
      patchChart(chart);
      chart.setOption(baseOption, true);
    });
    return true;
  }

  let scanTimer = 0;
  const queueScan = () => {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(() => scan(document), 40);
  };
  const observer = new MutationObserver(queueScan);
  const notifyReady = () => {
    window.dispatchEvent(new CustomEvent('audit-unit-ready', {
      detail:{ unit:state.unit, decimals:state.decimals, label:currentLabel() }
    }));
  };
  const start = () => {
    scan(document);
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
    if (patchECharts()) {
      notifyReady();
    } else {
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (patchECharts()) {
          window.clearInterval(timer);
          notifyReady();
        } else if (attempts > 200) {
          window.clearInterval(timer);
          notifyReady();
        }
      }, 25);
    }
  };

  window.AuditUnit = {
    ready:true,
    get unit(){ return state.unit; },
    get decimals(){ return state.decimals; },
    get label(){ return currentLabel(); },
    convert,
    format,
    formatFromK:value => format(value, 'k'),
    formatFromWan:value => format(value, 'w'),
    formatFromYuan:value => format(value, 'yuan'),
    scan,
    transformChartOption
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
