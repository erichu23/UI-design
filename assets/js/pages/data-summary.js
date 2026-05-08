(function(){
  "use strict";

  const $ = id => document.getElementById(id);
  const fmt = n => Number(n || 0).toLocaleString("zh-CN", { maximumFractionDigits: 1 });
  const months = Array.from({length:12}, (_,i)=>String(i+1).padStart(2,"0"));
  const periodOptions = [
    { code:"same", name:"同期", shift:0 },
    { code:"minus1", name:"税票前移1月", shift:-1 },
    { code:"plus1", name:"税票后移1月", shift:1 },
    { code:"custom", name:"自定义平移", shift:0 }
  ];
  const viewText = { all:"全部", in:"银行流入 vs 销项税价合计", out:"银行流出 vs 进项税价合计" };
  const basisText = { all:"全部", receipt:"收款", payment:"付款" };

  const state = {
    unit:"全部", account:"全部", type:"全部", keyword:"",
    year:"all", view:"all", period:"same", basis:"all", customShift:0,
    selectedMonths:[], selectedCounterparty:"",
    tableView:"summary", yearExpanded:true, page:1, pageSize:12, compositionRank:"inflow", chartType:"bar", periodPreview:"same",
    sort:{ key:"", order:"" }, filters:{}
  };
  const charts = {};
  const remarks = {};
  const counterpartyPeriodOverrides = {};
  const selectedRows = new Map();
  let echartsLoadPromise = null;
  const detailState = {
    txn:{ sort:{key:"",order:""}, filters:{} },
    vat:{ sort:{key:"",order:""}, filters:{}, type:"sales" }
  };
  const currentDetail = { cp:"", rows:[], vatRows:[] };

  function refreshVisibleCharts(){
    renderAll();
    if ($("ds3DetailModal")?.classList.contains("is-show")) {
      renderDetailCharts(currentDetail.rows);
    }
  }

  function ensureEcharts(){
    if(window.echarts)return Promise.resolve(window.echarts);
    if(echartsLoadPromise)return echartsLoadPromise;
    echartsLoadPromise = new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src="https://unpkg.com/echarts@5/dist/echarts.min.js";
      script.async=true;
      script.onload=()=>resolve(window.echarts);
      script.onerror=reject;
      document.head.appendChild(script);
    }).then(x=>{setTimeout(refreshVisibleCharts,0);return x;}).catch(()=>null);
    return echartsLoadPromise;
  }

  const units = ["华东智造科技有限公司","上海星源电子有限公司","深圳云启信息技术有限公司","广州远航贸易有限公司","苏州精工制造有限公司","华南供应链管理有限公司"];
  const accounts = {
    "华东智造科技有限公司":["工行上海分行 1001","建行上海分行 1002"],
    "上海星源电子有限公司":["招行上海分行 2001"],
    "深圳云启信息技术有限公司":["平安深圳分行 3001","中行深圳分行 3002"],
    "广州远航贸易有限公司":["广发广州分行 4001"],
    "苏州精工制造有限公司":["农行苏州分行 5001"],
    "华南供应链管理有限公司":["浦发广州分行 6001"]
  };
  const cpsSeed = [
    ["上海启辰贸易有限公司","客户"],["南京卓越电子有限公司","客户"],["杭州科锐科技有限公司","客户"],["深圳远景服务有限公司","客户"],
    ["广州锦程商贸有限公司","客户"],["苏州华瑞工业有限公司","供应商"],["宁波宏达供应链有限公司","供应商"],["武汉迅达物流有限公司","供应商"],
    ["青岛远通国际贸易有限公司","供应商"],["东莞信成科技有限公司","供应商"],["佛山凯鸿商贸有限公司","客户"],["常熟力合金属材料有限公司","供应商"],
    ["厦门瀚宇信息服务有限公司","客户"],["成都智联设备有限公司","供应商"],["无锡蓝海电子有限公司","客户"],["昆山精达模具有限公司","供应商"]
  ];
  const rawData = buildRows();

  function buildRows(){
    const rows = [];
    ["2023","2024","2025"].forEach((year, yi)=>{
      months.forEach((mm, mi)=>{
        for(let i=0;i<8;i++){
          const [counterparty,type] = cpsSeed[(mi + i + yi * 3) % cpsSeed.length];
          const unit = units[(i + mi + yi) % units.length];
          const account = (accounts[unit] || ["默认账户"])[i % (accounts[unit] || ["默认账户"]).length];
          const isCustomer = type === "客户";
          const base = 120 + (mi + 1) * 18 + i * 23 + yi * 35;
          const inflow = isCustomer ? +(base * (0.82 + (i % 4) * 0.08)).toFixed(1) : +(base * .08).toFixed(1);
          const outflow = isCustomer ? +(base * .06).toFixed(1) : +(base * (.72 + (i % 3) * .09)).toFixed(1);
          rows.push({
            id:`${year}-${mm}-${i}`, month:`${year}-${mm}`, unit, account, type, counterparty,
            inflow, outflow,
            salesVat:isCustomer ? +(inflow * (.88 + ((mi+i)%5)*.035)).toFixed(1) : 0,
            purchaseVat:isCustomer ? 0 : +(outflow * (.84 + ((mi+i)%4)*.04)).toFixed(1),
            txn:4 + ((mi+i)%12)
          });
        }
      });
    });
    return rows;
  }

  function years(){ return [...new Set(rawData.map(r=>r.month.slice(0,4)))].sort((a,b)=>b.localeCompare(a)); }
  function shiftMonth(month, shift){ const [y,m]=month.split("-").map(Number); const d=new Date(y,m-1+shift,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
  function yearMonths(year=state.year){ return year === "all" ? [...new Set(rawData.map(r=>r.month))].sort() : months.map(m=>`${year}-${m}`); }
  function periodShift(code=state.period){ return code==="custom" ? (+state.customShift || 0) : (periodOptions.find(x=>x.code===code)?.shift || 0); }
  function periodName(code=state.period){ return code==="custom" ? `自定义平移${state.customShift>0?"+":""}${state.customShift}月` : (periodOptions.find(x=>x.code===code)?.name || "同期"); }
  function cpOverride(cp){ return counterpartyPeriodOverrides[cp] || null; }
  function cpShift(cp){ const own=cpOverride(cp); return own ? +own.shift || 0 : null; }
  function cpBasis(cp){ return cpOverride(cp)?.basis || null; }
  function taxShiftFor(cp, chain, globalShift, ignoreOverrides=false){ const own=ignoreOverrides ? null : cpOverride(cp); if(!own)return globalShift; return own.basis==="all" || own.basis===chain ? (+own.shift || 0) : globalShift; }
  function effectiveShift(cp, period=state.period){ const own=cpShift(cp); return own === null ? periodShift(period) : own; }
  function shiftLabel(shift){ return shift === 0 ? "同期" : `税票${shift < 0 ? "前移" : "后移"}${Math.abs(shift)}月`; }
  function cpPeriodText(cp){ const own=cpShift(cp); return own === null ? periodName() : `${shiftLabel(own)}（${basisText[cpBasis(cp)] || "全部"}，单独设置）`; }
  function shiftedCounterpartyCount(){ return Object.keys(counterpartyPeriodOverrides).length; }

  function readFilters(){
    state.unit = $("ds3Unit")?.value || "全部";
    state.account = $("ds3Account")?.value || "全部";
    state.type = $("ds3Type")?.value || "全部";
    state.keyword = ($("ds3Keyword")?.value || "").trim().toLowerCase();
    state.year = $("ds3Year")?.value || "all";
    state.view = $("ds3CompareView")?.value || "all";
    state.period = $("ds3PeriodOffset")?.value || "same";
    state.customShift = Math.max(-12, Math.min(12, +($("ds3CustomPeriodShift")?.value || 0)));
    state.basis = $("ds3PeriodBasis")?.value || "all";
    state.selectedMonths = state.year === "all" ? [] : Array.from(document.querySelectorAll("#ds3MonthSelect input:checked")).map(x=>`${state.year}-${x.value}`);
  }

  function baseRows(){
    return rawData.filter(r =>
      (state.unit === "全部" || r.unit === state.unit) &&
      (state.account === "全部" || r.account === state.account) &&
      (state.type === "全部" || r.type === state.type) &&
      (!state.keyword || r.counterparty.toLowerCase().includes(state.keyword)) &&
      (!state.selectedCounterparty || r.counterparty === state.selectedCounterparty)
    );
  }

  function comparable(period=state.period, rows=baseRows(), year=state.year, selected=state.selectedMonths, options={}){
    const allowed = new Set(yearMonths(year));
    const globalShift = periodShift(period);
    const map = new Map();
    const ensure = (month, r) => {
      const key = `${month}||${r.counterparty}`;
      if (!map.has(key)) map.set(key, { month, unit:r.unit, account:r.account, type:r.type, counterparty:r.counterparty, inflow:0, outflow:0, salesVat:0, purchaseVat:0, txn:0 });
      return map.get(key);
    };
    rows.forEach(r=>{
      if (allowed.has(r.month)) {
        const x = ensure(r.month, r);
        if (state.basis !== "payment") x.inflow += +r.inflow || 0;
        if (state.basis !== "receipt") x.outflow += +r.outflow || 0;
        x.txn += +r.txn || 0;
      }
      const salesMonth = shiftMonth(r.month, taxShiftFor(r.counterparty, "receipt", globalShift, options.ignoreCounterpartyOverrides));
      if (allowed.has(salesMonth) && state.basis !== "payment") {
        const x = ensure(salesMonth, r);
        x.salesVat += +r.salesVat || 0;
      }
      const purchaseMonth = shiftMonth(r.month, taxShiftFor(r.counterparty, "payment", globalShift, options.ignoreCounterpartyOverrides));
      if (allowed.has(purchaseMonth) && state.basis !== "receipt") {
        const x = ensure(purchaseMonth, r);
        x.purchaseVat += +r.purchaseVat || 0;
      }
    });
    return [...map.values()].filter(r => (year === "all" || r.month.slice(0,4) === year) && (!selected.length || selected.includes(r.month)));
  }

  function sum(rows){
    return rows.reduce((a,r)=>{ a.inflow+=+r.inflow||0; a.outflow+=+r.outflow||0; a.salesVat+=+r.salesVat||0; a.purchaseVat+=+r.purchaseVat||0; a.txn+=+r.txn||0; if(r.inflow||r.outflow||r.salesVat||r.purchaseVat)a.months.add(r.month); if(r.counterparty)a.cps.add(r.counterparty); return a; }, {inflow:0,outflow:0,salesVat:0,purchaseVat:0,txn:0,months:new Set(),cps:new Set()});
  }

  function byMonth(rows){
    const map = new Map(yearMonths().map(m=>[m,{month:m,inflow:0,outflow:0,salesVat:0,purchaseVat:0}]));
    rows.forEach(r=>{ if(!map.has(r.month))return; const x=map.get(r.month); x.inflow+=r.inflow; x.outflow+=r.outflow; x.salesVat+=r.salesVat; x.purchaseVat+=r.purchaseVat; });
    return [...map.values()].filter(r=>!state.selectedMonths.length || state.selectedMonths.includes(r.month));
  }

  function byCp(rows){
    const map = new Map();
    rows.forEach(r=>{
      if(!map.has(r.counterparty)) map.set(r.counterparty,{counterparty:r.counterparty,type:r.type,rows:[],inflow:0,outflow:0,salesVat:0,purchaseVat:0});
      const x=map.get(r.counterparty); x.rows.push(r); x.inflow+=r.inflow; x.outflow+=r.outflow; x.salesVat+=r.salesVat; x.purchaseVat+=r.purchaseVat;
    });
    const list=[...map.values()];
    list.sort((a,b)=> state.view==="in" ? b.inflow-a.inflow : state.view==="out" ? b.outflow-a.outflow : (b.inflow-a.inflow)||(b.outflow-a.outflow));
    return list;
  }

  function initFilters(){
    $("ds3Year").innerHTML = [`<option value="all">全年</option>`, ...years().map(y=>`<option value="${y}">${y}年</option>`)].join("");
    $("ds3Unit").innerHTML = ["全部",...units].map(x=>`<option>${x}</option>`).join("");
    $("ds3Type").innerHTML = ["全部","客户","供应商","其他"].map(x=>`<option>${x}</option>`).join("");
    syncFilterControls();
    refreshAccounts();
    renderMonthSelect();
    renderMonthToolbar();
  }
  function syncFilterControls(){
    if($("ds3Unit"))$("ds3Unit").value=state.unit;
    if($("ds3Type"))$("ds3Type").value=state.type;
    if($("ds3Keyword"))$("ds3Keyword").value=state.keyword;
    if($("ds3Year"))$("ds3Year").value=state.year;
    if($("ds3CompareView"))$("ds3CompareView").value=state.view;
    if($("ds3PeriodOffset"))$("ds3PeriodOffset").value=state.period;
    if($("ds3PeriodBasis"))$("ds3PeriodBasis").value=state.basis;
    if($("ds3CustomPeriodShift"))$("ds3CustomPeriodShift").value=state.customShift;
  }
  function refreshAccounts(){ const opts = state.unit==="全部" ? Object.values(accounts).flat() : (accounts[state.unit]||[]); $("ds3Account").innerHTML = ["全部",...opts].map(x=>`<option>${x}</option>`).join(""); if(!["全部",...opts].includes(state.account)) state.account="全部"; $("ds3Account").value=state.account; }

  function renderMonthSelect(){
    const host=$("ds3MonthSelect"); if(!host)return;
    if(state.year==="all"){ state.selectedMonths=[]; host.innerHTML=`<button class="ds3-month-picker-btn is-disabled" disabled type="button"><span>全年</span><span>选择具体年份后可筛月份</span></button>`; return; }
    host.innerHTML=`<div class="ds3-month-picker" id="ds3MonthPicker"><button class="ds3-month-picker-btn" type="button"><span>${state.selectedMonths.length?`已选 ${state.selectedMonths.length} 个月`:"全部月份"}</span><span>▾</span></button><div class="ds3-month-menu"><div class="ds3-month-quick"><button data-range="all" type="button">全年</button><button data-range="q1" type="button">Q1</button><button data-range="q2" type="button">Q2</button><button data-range="q3" type="button">Q3</button><button data-range="q4" type="button">Q4</button></div><div class="ds3-month-menu-grid">${months.map(m=>`<label class="ds3-month-chip"><input type="checkbox" value="${m}" ${state.selectedMonths.includes(`${state.year}-${m}`)?"checked":""}/> ${m}月</label>`).join("")}</div><div class="ds3-month-menu-actions"><button class="ds3-btn" id="ds3MonthAllBtn" type="button">全部月份</button><button class="ds3-btn is-primary" id="ds3MonthDoneBtn" type="button">确定</button></div></div></div>`;
    const picker=$("ds3MonthPicker"); picker.querySelector(".ds3-month-picker-btn").onclick=e=>{e.stopPropagation();picker.classList.toggle("is-open");};
    picker.querySelectorAll("[data-range]").forEach(b=>b.onclick=e=>{e.stopPropagation();const ranges={all:months,q1:["01","02","03"],q2:["04","05","06"],q3:["07","08","09"],q4:["10","11","12"]};state.selectedMonths=b.dataset.range==="all"?[]:ranges[b.dataset.range].map(m=>`${state.year}-${m}`);renderAll();});
    $("ds3MonthAllBtn").onclick=e=>{e.stopPropagation(); state.selectedMonths=[]; renderAll();};
    $("ds3MonthDoneBtn").onclick=e=>{e.stopPropagation(); readFilters(); state.page=1; renderAll();};
  }

  function renderMonthToolbar(){
    const host=$("ds3MonthToolbar"); if(!host)return;
    if(state.year==="all"){ host.innerHTML=`<button class="ds3-month-btn is-active" type="button">全年</button>`; return; }
    host.innerHTML=`<button class="ds3-month-btn ${state.selectedMonths.length?"":"is-active"}" data-m="all" type="button">全部月份</button>${months.map(m=>`<button class="ds3-month-btn ${state.selectedMonths.length===1&&state.selectedMonths[0]===`${state.year}-${m}`?"is-active":""}" data-m="${m}" type="button">${m}月</button>`).join("")}`;
    host.querySelectorAll("button").forEach(b=>b.onclick=()=>{state.selectedMonths=b.dataset.m==="all"?[]:[`${state.year}-${b.dataset.m}`]; state.page=1; renderMonthSelect(); renderAll();});
  }
  function renderCustomPeriod(){
    const wrap=$("ds3CustomPeriodWrap");
    if(wrap)wrap.classList.toggle("is-show",state.period==="custom");
  }

  function renderKpis(rows){ const t=sum(rows); $("ds3KpiGrid").innerHTML=[
    ["银行流入合计",t.inflow,"inflow"],["销项税价合计",t.salesVat,"output"],["对比金额",t.inflow-t.salesVat,"compare"],["覆盖月份数",t.months.size,"count","个月"],
    ["银行流出合计",t.outflow,"outflow"],["进项税价合计",t.purchaseVat,"input"],["对比金额",t.outflow-t.purchaseVat,"compare"],["当前对手方数量",t.cps.size,"count","家"]
  ].map(([k,v,c,u])=>`<div class="ds3-vat-kpi is-${c}"><span>${k}</span><b>${fmt(v)}</b><em>${u||"千元"}</em></div>`).join(""); }

  function renderCharts(rows){ const m=byMonth(rows); renderChart("ds3InChart","in",m,["银行流入","销项税价合计"],["#2f6fed","#0f9f8a"],"inflow","salesVat"); renderChart("ds3OutChart","out",m,["银行流出","进项税价合计"],["#d9466f","#d97706"],"outflow","purchaseVat"); }
  function getChartInstance(id, el){
    if (!charts[id] || charts[id].isDisposed?.()) {
      el.innerHTML = "";
      charts[id] = echarts.init(el);
      return charts[id];
    }
    if (!el.querySelector("canvas")) {
      try { charts[id].dispose(); } catch(e) {}
      el.innerHTML = "";
      charts[id] = echarts.init(el);
    }
    return charts[id];
  }
  function renderChart(id,side,m,legend,colors,aKey,bKey){ const el=$(id); if(!el)return; if(!window.echarts){el.innerHTML='<div class="ds3-chart-loading">图表加载中</div>';ensureEcharts();return;} const chart=getChartInstance(id,el); const x=m.map(r=>state.year==="all"?r.month.replace("-","年")+"月":r.month.slice(5)+"月"); const a=m.map(r=>r[aKey]); const b=m.map(r=>r[bKey]); const diff=a.map((v,i)=>+(v-b[i]).toFixed(1)); const isLine=state.chartType==="line"; chart.setOption({color:colors,tooltip:{trigger:"axis",confine:true,formatter:params=>{const idx=params[0]?.dataIndex||0;return `<div class="ds3-tip-card"><b>${params[0]?.axisValue||""}</b><div>${legend[0]}：${fmt(a[idx])}</div><div>${legend[1]}：${fmt(b[idx])}</div><div>对比金额：${fmt(diff[idx])}</div><div>账期口径：${periodName()}</div></div>`;}},legend:{top:0,data:legend},grid:{left:56,right:18,top:44,bottom:58},dataZoom:[{type:"slider",height:18,bottom:12,start:0,end:x.length>12?42:100,brushSelect:false},{type:"inside"}],xAxis:{type:"category",data:x},yAxis:{type:"value",name:"千元"},series:isLine?[{name:legend[0],type:"line",smooth:true,showSymbol:true,symbolSize:5,lineStyle:{width:2.4,color:colors[0]},itemStyle:{color:colors[0]},data:a},{name:legend[1],type:"line",smooth:true,showSymbol:true,symbolSize:5,lineStyle:{width:2.4,color:colors[1]},itemStyle:{color:colors[1]},data:b}]:[{name:legend[0],type:"bar",barMaxWidth:24,data:a},{name:legend[1],type:"bar",barMaxWidth:24,data:b},{name:"对比金额",type:"line",smooth:true,itemStyle:{color:"#7c3aed"},lineStyle:{color:"#7c3aed"},data:diff}]}, true); chart.resize(); chart.off("click"); chart.on("click",p=>{ if(state.year==="all")return; const mm=String(p.name).slice(0,2); state.selectedMonths=[`${state.year}-${mm}`]; state.page=1; renderMonthSelect(); renderAll();}); }

  function renderSummary(rows){ const t=sum(rows); const y=state.year==="all"?"全年":`${state.year}年`; const m=state.year==="all"?"全年":(state.selectedMonths.length?state.selectedMonths.map(x=>x.slice(5)+"月").join("、"):"全部月份"); const shifted=shiftedCounterpartyCount(); $("ds3CurrentSummary").innerHTML=[["当前年份",y],["当前月份",m],["当前视角",viewText[state.view]],["当前账期口径",periodName()],["账期对象",basisText[state.basis]],["单独平移",`${shifted}家`],["当前对手方",`${t.cps.size}家`]].map(([k,v])=>`<div class="ds3-summary-row"><span>${k}</span><b>${v}</b></div>`).join(""); $("ds3Chips").innerHTML=`<span class="ds3-chip">年份：${y}</span><span class="ds3-chip">月份：${m}</span><span class="ds3-chip">账期口径：${periodName()}</span>${shifted?`<span class="ds3-chip">单独平移：${shifted}家</span>`:""}${state.selectedCounterparty?`<span class="ds3-chip">对手方：${state.selectedCounterparty}<button data-clear="cp">×</button></span>`:""}`; $("ds3Chips").querySelector("[data-clear='cp']")?.addEventListener("click",()=>{state.selectedCounterparty="";renderAll();}); }
  function previewRangeText(){ if(state.year==="all")return "全年"; if(!state.selectedMonths.length)return "全年"; if(state.selectedMonths.length===1)return `${state.selectedMonths[0].slice(5)}月`; return `${state.selectedMonths[0].slice(5)}月-${state.selectedMonths[state.selectedMonths.length-1].slice(5)}月`; }
  function periodExplain(code){ return code==="minus1" ? "税票月份前移1个月后参与月度对比" : code==="plus1" ? "税票月份后移1个月后参与月度对比" : "税票按原始月份参与月度对比"; }
  function compareMetric(row){ if(state.view==="out")return {bank:row.outflow,vat:row.purchaseVat}; if(state.view==="in")return {bank:row.inflow,vat:row.salesVat}; return {bank:row.inflow+row.outflow,vat:row.salesVat+row.purchaseVat}; }
  function periodPreviewRows(code=state.periodPreview){ const base=baseRows(); const same=byMonth(comparable("same",base,state.year,state.selectedMonths,{ignoreCounterpartyOverrides:true})); const cur=byMonth(comparable(code,base,state.year,state.selectedMonths,{ignoreCounterpartyOverrides:true})); const curMap=new Map(cur.map(r=>[r.month,r])); return same.map(s=>{const c=curMap.get(s.month)||{month:s.month,inflow:0,outflow:0,salesVat:0,purchaseVat:0}; const sm=compareMetric(s), cm=compareMetric(c); return {month:s.month,label:state.year==="all"?s.month.replace("-","年")+"月":s.month.slice(5)+"月",bank:cm.bank,sameVat:sm.vat,currentVat:cm.vat,vatChange:cm.vat-sm.vat,compareAmount:cm.bank-cm.vat};}); }
  function periodPreviewSummary(code=state.periodPreview){ const rows=periodPreviewRows(code); const changed=rows.filter(r=>Math.abs(r.vatChange)>0.0001); const top=changed.slice().sort((a,b)=>Math.abs(b.vatChange)-Math.abs(a.vatChange)).slice(0,3).map(r=>r.label); const total=rows.reduce((a,r)=>{a.bank+=r.bank;a.vat+=r.currentVat;return a;},{bank:0,vat:0}); return {rows,changedCount:changed.length,topMonths:top.length?top:["-"],compareAmount:total.bank-total.vat,range:previewRangeText()}; }
  function applyPreviewPeriod(){ state.period=state.periodPreview; if($("ds3PeriodOffset"))$("ds3PeriodOffset").value=state.period; renderCustomPeriod(); renderAll(); alert(`已切换为“${periodName()}”口径`); }
  function renderPeriodRows(){ const host=$("ds3PeriodSummary"); if(!host)return; if(!["same","minus1","plus1"].includes(state.periodPreview))state.periodPreview=["same","minus1","plus1"].includes(state.period)?state.period:"same"; const summary=periodPreviewSummary(); const tabs=periodOptions.filter(o=>["same","minus1","plus1"].includes(o.code)); host.innerHTML=`<div class="ds3-period-tabs">${tabs.map(o=>`<button class="${o.code===state.periodPreview?"is-active":""}" data-preview-period="${o.code}" type="button">${o.name}</button>`).join("")}</div><div class="ds3-period-preview-text"><div><span>当前预览口径</span><b>${periodName(state.periodPreview)}</b></div><p>${periodExplain(state.periodPreview)}</p></div><div class="ds3-period-impact-grid"><div><span>发生变化月份</span><b>${summary.changedCount}个月</b></div><div><span>变化最大月份</span><b>${summary.topMonths.join("、")}</b></div><div><span>当前对比金额</span><b>${fmt(summary.compareAmount)}</b></div><div><span>预览范围</span><b>${summary.range}</b></div></div>${state.periodPreview===state.period?"":`<div class="ds3-period-preview-note">当前仅为预览口径，尚未应用到整页</div>`}<div class="ds3-period-actions"><button class="ds3-btn is-primary" id="ds3ApplyPreviewPeriod" type="button">设为当前口径</button><button class="ds3-btn" id="ds3OpenPeriodDetail" type="button">查看详细月份变化</button></div>`; host.querySelectorAll("[data-preview-period]").forEach(b=>b.onclick=()=>{state.periodPreview=b.dataset.previewPeriod;renderPeriodRows();}); $("ds3ApplyPreviewPeriod").onclick=applyPreviewPeriod; $("ds3OpenPeriodDetail").onclick=openPeriodDetail; }
  function openPeriodDetail(){ const summary=periodPreviewSummary(); $("ds3PeriodDetailSubtitle").textContent=`当前预览口径：${periodName(state.periodPreview)}`; $("ds3PeriodDetailNote").textContent=`当前口径下，共有 ${summary.changedCount} 个月税票金额发生变化，其中变化最大的月份为 ${summary.topMonths.join("、")}。`; $("ds3PeriodDetailRows").innerHTML=summary.rows.length?summary.rows.map(r=>`<tr><td>${r.label}</td><td class="is-num">${fmt(r.bank)}</td><td class="is-num">${fmt(r.sameVat)}</td><td class="is-num">${fmt(r.currentVat)}</td><td class="is-num">${fmt(r.vatChange)}</td><td class="is-num">${fmt(r.compareAmount)}</td></tr>`).join(""):`<tr><td colspan="6" class="ds3-empty-cell">暂无月份变化数据</td></tr>`; openDrawer("ds3PeriodDetailModal");}
  function renderComposition(rows){ const rank=state.compositionRank||"inflow"; document.querySelectorAll("#ds3CompositionMetric [data-composition-rank]").forEach(b=>b.classList.toggle("is-active",b.dataset.compositionRank===rank)); const list=byCp(rows).map(c=>({...c,name:c.counterparty})).sort((a,b)=>(b[rank]||0)-(a[rank]||0)).slice(0,20); const max=Math.max(...list.flatMap(x=>[x.inflow,x.salesVat,x.outflow,x.purchaseVat]),1); const bar=(row,field,label,cls,side)=>`<div class="ds3-centipede-bar is-${side}"><span class="ds3-centipede-label">${label}</span><div class="ds3-centipede-track"><i class="is-${cls}" style="width:${Math.max(3,(row[field]||0)/max*100)}%"></i></div><b>${fmt(row[field])}</b></div>`; $("ds3Composition").innerHTML=`<div class="ds3-centipede-head"><span>流入 / 销项</span><span>对手方</span><span>流出 / 进项</span></div><div class="ds3-centipede-list">${list.map((row,i)=>`<div class="ds3-centipede-row" data-cp="${row.name}"><div class="ds3-centipede-side">${bar(row,"inflow","流入","inflow","left")}${bar(row,"salesVat","销项","output","left")}</div><div class="ds3-centipede-name"><em>${String(i+1).padStart(2,"0")}</em><strong>${row.name}</strong>${cpShift(row.name)!==null?`<span>${shiftLabel(cpShift(row.name))}</span>`:""}</div><div class="ds3-centipede-side">${bar(row,"outflow","流出","outflow","right")}${bar(row,"purchaseVat","进项","input","right")}</div></div>`).join("")}</div>`; $("ds3Composition").querySelectorAll(".ds3-centipede-row").forEach(el=>el.onclick=()=>{state.selectedCounterparty=el.dataset.cp; renderAll(); openDetail(el.dataset.cp);}); }

  function iconSort(mode="default"){return `<span class="ds3-sort-stack ${mode}"><span>▲</span><span>▼</span></span>`;}
  function iconFilter(){return "⌕";}
  function getSortIcon(key){return state.sort.key===key?iconSort(state.sort.order):iconSort();}
  function headerTools(label,key,align="center"){return `<div class="ds3-th-tools is-${align}"><span class="ds3-th-label">${label}</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-sort-btn ${state.sort.key===key?"is-active":""}" data-key="${key}" type="button">${getSortIcon(key)}</button><button class="ds3-th-action ds3-filter-btn ${state.filters[key]?"is-active":""}" data-key="${key}" type="button">${iconFilter()}</button></span></div>`;}
  function bindHeaderActions(){document.querySelectorAll(".ds3-sort-btn").forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.key;if(state.sort.key!==k)state.sort={key:k,order:"asc"};else if(state.sort.order==="asc")state.sort.order="desc";else state.sort={key:"",order:""};state.page=1;renderAll();});document.querySelectorAll(".ds3-filter-btn").forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.key;const v=prompt("请输入筛选条件",state.filters[k]||"");if(v===null)return;if(v.trim())state.filters[k]=v.trim();else delete state.filters[k];state.page=1;renderAll();});}
  function val(row,key){return row[key]??"";}
  function sortFilter(list){let out=list.filter(r=>Object.entries(state.filters).every(([k,v])=>String(val(r,k)).toLowerCase().includes(String(v).toLowerCase()))); if(state.sort.key){const k=state.sort.key,dir=state.sort.order==="asc"?1:-1;out=out.slice().sort((a,b)=>{const av=val(a,k),bv=val(b,k),an=+av,bn=+bv;const res=!isNaN(an)&&!isNaN(bn)?an-bn:String(av).localeCompare(String(bv),"zh-Hans-CN");return res*dir;});} return out;}
  function summaryKey(c){return `summary||${c.counterparty}`;}
  function monthlyKey(r){return `monthly||${r.month}||${r.counterparty}`;}
  function checkboxCell(key,row){const checked=!!selectedRows.get(key)?.checked;selectedRows.set(key,{...row,checked});return `<td class="ds3-check-cell"><input class="ds3-row-check" data-row-key="${key}" type="checkbox" ${checked?"checked":""}/></td>`;}
  function setSelected(key,checked){const row=selectedRows.get(key);if(!row)return;row.checked=checked;if(!checked)selectedRows.delete(key);}

  function groupCells(t,sep=""){return `<td class="is-num ds3-num-inflow ${sep}">${fmt(t.inflow)}</td><td class="is-num ds3-num-output">${fmt(t.salesVat)}</td><td class="is-num">${fmt(t.inflow-t.salesVat)}</td><td class="is-num ds3-num-outflow">${fmt(t.outflow)}</td><td class="is-num ds3-num-input">${fmt(t.purchaseVat)}</td><td class="is-num">${fmt(t.outflow-t.purchaseVat)}</td>`;}
  function renderTable(rows){ if(state.tableView==="monthly")renderMonthlyTable(rows); else renderSummaryTable(rows); renderContext(); }
  function renderSummaryTable(rows){
    const ys=years(), icon=state.yearExpanded?"«":"»";
    $("ds3FilterTableHead").innerHTML=`<tr class="ds3-year-group-head"><th rowspan="2" class="ds3-check-cell"><input id="ds3CheckAll" type="checkbox"/></th><th rowspan="2" style="min-width:180px;text-align:left;">${headerTools("对手方名称","counterparty","left")}</th><th rowspan="2">${headerTools("对手方类型","type")}</th><th colspan="6" class="ds3-group-toggle-cell"><button type="button" class="ds3-group-toggle-btn" id="ds3GroupToggleBtn"><span>合计</span><span class="ds3-group-toggle-icon">${icon}</span></button></th>${state.yearExpanded?ys.map(y=>`<th colspan="6" class="ds3-col-sep">${y}年</th>`).join(""):""}<th rowspan="2">操作</th><th rowspan="2" class="ds3-remark-cell">${headerTools("备注","remark")}</th></tr><tr class="ds3-year-sub-head"><th>${headerTools("流入金额","inflow")}</th><th>${headerTools("销项税价合计","salesVat")}</th><th>${headerTools("对比金额","inCompare")}</th><th>${headerTools("流出金额","outflow")}</th><th>${headerTools("进项税价合计","purchaseVat")}</th><th>${headerTools("对比金额","outCompare")}</th>${state.yearExpanded?ys.map(()=>`<th class="ds3-col-sep">流入金额</th><th>销项税价合计</th><th>对比金额</th><th>流出金额</th><th>进项税价合计</th><th>对比金额</th>`).join(""):""}</tr>`;
    $("ds3GroupToggleBtn").onclick=e=>{e.stopPropagation();state.yearExpanded=!state.yearExpanded;renderAll();};
    let list=sortFilter(byCp(rows).map(c=>({...c,inCompare:c.inflow-c.salesVat,outCompare:c.outflow-c.purchaseVat,remark:remarks[c.counterparty]?.text||""})));
    const total=list.length,pages=Math.max(1,Math.ceil(total/state.pageSize)); if(state.page>pages)state.page=pages; list=list.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
    $("ds3FilterTableBody").innerHTML=list.map(c=>{const yearCells=state.yearExpanded?ys.map(y=>groupCells(sum(comparable(state.period,baseRows(),y,[]).filter(r=>r.counterparty===c.counterparty)),"ds3-col-sep")).join(""):"";const key=summaryKey(c);return `<tr>${checkboxCell(key,{mode:"summary",...c})}<td><span class="ds3-row-main-name">${c.counterparty}</span></td><td>${c.type}</td>${groupCells(sum(c.rows))}${yearCells}<td><button class="ds3-eye-btn ds3-detail-btn" data-cp="${c.counterparty}" type="button">查看明细</button></td><td class="ds3-remark-cell"><input class="ds3-note-input" data-note="${c.counterparty}" value="${remarks[c.counterparty]?.text||""}" placeholder="填写备注"/></td></tr>`;}).join("");
    bindHeaderActions(); bindTableActions(); renderPager(total);
  }
  function renderMonthlyTable(rows){ $("ds3FilterTableHead").innerHTML=`<tr class="ds3-monthly-head"><th class="ds3-check-cell"><input id="ds3CheckAll" type="checkbox"/></th><th>${headerTools("月份","month")}</th><th>${headerTools("对手方名称","counterparty","left")}</th><th>${headerTools("对手方类型","type")}</th><th>${headerTools("流入金额","inflow")}</th><th>${headerTools("销项税价合计","salesVat")}</th><th>${headerTools("对比金额","inCompare")}</th><th>${headerTools("流出金额","outflow")}</th><th>${headerTools("进项税价合计","purchaseVat")}</th><th>${headerTools("对比金额","outCompare")}</th><th>操作</th><th class="ds3-remark-cell">${headerTools("备注","remark")}</th></tr>`; let list=sortFilter(rows.map(r=>({...r,inCompare:r.inflow-r.salesVat,outCompare:r.outflow-r.purchaseVat,remark:remarks[r.counterparty]?.text||""}))); if(!state.sort.key)list.sort((a,b)=>a.month.localeCompare(b.month)||b.inflow-a.inflow); const total=list.length,pages=Math.max(1,Math.ceil(total/state.pageSize)); if(state.page>pages)state.page=pages; list=list.slice((state.page-1)*state.pageSize,state.page*state.pageSize); $("ds3FilterTableBody").innerHTML=list.map(r=>{const key=monthlyKey(r);return `<tr>${checkboxCell(key,{mode:"monthly",...r})}<td>${r.month}</td><td>${r.counterparty}</td><td>${r.type}</td><td class="is-num ds3-num-inflow">${fmt(r.inflow)}</td><td class="is-num ds3-num-output">${fmt(r.salesVat)}</td><td class="is-num">${fmt(r.inCompare)}</td><td class="is-num ds3-num-outflow">${fmt(r.outflow)}</td><td class="is-num ds3-num-input">${fmt(r.purchaseVat)}</td><td class="is-num">${fmt(r.outCompare)}</td><td><button class="ds3-eye-btn ds3-detail-btn" data-cp="${r.counterparty}" type="button">查看明细</button></td><td class="ds3-remark-cell"><input class="ds3-note-input" data-note="${r.counterparty}" value="${remarks[r.counterparty]?.text||""}" placeholder="填写备注"/></td></tr>`;}).join(""); bindHeaderActions(); bindTableActions(); renderPager(total); }
  function bindTableActions(){document.querySelectorAll(".ds3-detail-btn").forEach(b=>b.onclick=()=>openDetail(b.dataset.cp));document.querySelectorAll("[data-note]").forEach(i=>i.oninput=()=>remarks[i.dataset.note]={text:i.value,time:new Date().toLocaleString("zh-CN"),user:"项目组"});document.querySelectorAll(".ds3-row-check").forEach(i=>i.onchange=()=>setSelected(i.dataset.rowKey,i.checked));const all=$("ds3CheckAll");if(all)all.onchange=()=>document.querySelectorAll(".ds3-row-check").forEach(i=>{i.checked=all.checked;setSelected(i.dataset.rowKey,i.checked);});}
  function renderContext(){const y=state.year==="all"?"全年":`${state.year}年`,m=state.year==="all"?"":(state.selectedMonths.length?state.selectedMonths.map(x=>x.slice(5)+"月").join("、"):"全部月份"),shifted=shiftedCounterpartyCount();$("ds3TableContext").textContent=`当前查看：${y}${m}｜账期口径：${periodName()}｜账期对象：${basisText[state.basis]}｜单独平移：${shifted}家｜对手方：${state.selectedCounterparty||"全部"}`;}
  function renderPager(total){const pages=Math.max(1,Math.ceil(total/state.pageSize));$("ds3Pagination").innerHTML=`<span class="ds3-page-info">第 ${state.page} / ${pages} 页，共 ${total} 条</span><button class="ds3-page-btn" data-p="prev" ${state.page===1?"disabled":""}>上一页</button>${Array.from({length:pages},(_,i)=>`<button class="ds3-page-btn ${state.page===i+1?"is-active":""}" data-p="${i+1}">${i+1}</button>`).join("")}<button class="ds3-page-btn" data-p="next" ${state.page===pages?"disabled":""}>下一页</button>`;$("ds3Pagination").querySelectorAll("button").forEach(b=>b.onclick=()=>{if(b.dataset.p==="prev")state.page--;else if(b.dataset.p==="next")state.page++;else state.page=+b.dataset.p;renderAll();});}
  function setParentDrawer(open){try{window.parent?.document?.body?.classList.toggle("ds3-parent-drawer-open",open);}catch(e){}}
  function openDrawer(id){setParentDrawer(true);$(id)?.classList.add("is-show");}
  function closeDrawer(id){$(id)?.classList.remove("is-show");if(!$("ds3DetailModal")?.classList.contains("is-show")&&!$("ds3SelectedModal")?.classList.contains("is-show")&&!$("ds3BatchShiftModal")?.classList.contains("is-show")&&!$("ds3PeriodDetailModal")?.classList.contains("is-show"))setParentDrawer(false);}
  function selectedCounterparties(){return [...new Set([...selectedRows.values()].filter(r=>r.checked).map(r=>r.counterparty).filter(Boolean))];}
  function openBatchShift(){const cps=selectedCounterparties();if(!cps.length){alert("请先勾选需要平移账期的对手方。");return;}$("ds3BatchShiftIntro").textContent=`已勾选 ${cps.length} 个对手方。本设置仅覆盖这些对手方的税票归属月份，未设置的对手方继续使用上方全局账期口径。`;$("ds3BatchShiftInput").value=0;if($("ds3BatchShiftBasis"))$("ds3BatchShiftBasis").value="all";$("ds3BatchShiftList").innerHTML=cps.map(cp=>`<div class="ds3-batch-shift-item"><span>${cp}</span><b>${cpPeriodText(cp)}</b></div>`).join("");openDrawer("ds3BatchShiftModal");}
  function applyBatchShift(clear=false){const cps=selectedCounterparties();if(!cps.length){closeDrawer("ds3BatchShiftModal");return;}const shift=Math.max(-12,Math.min(12,+($("ds3BatchShiftInput")?.value||0))),basis=$("ds3BatchShiftBasis")?.value||"all";cps.forEach(cp=>{if(clear)delete counterpartyPeriodOverrides[cp];else counterpartyPeriodOverrides[cp]={shift,basis};});closeDrawer("ds3BatchShiftModal");renderAll();if($("ds3DetailModal")?.classList.contains("is-show")&&currentDetail.cp){openDetail(currentDetail.cp);}}
  function openSelected(){const picked=[...selectedRows.values()].filter(r=>r.checked&&r.mode===state.tableView);$("ds3SelectedTitle").textContent=`勾选结果 - ${state.tableView==="summary"?"合计视图":"月度视图"}`;$("ds3SelectedHint").textContent=picked.length?`当前共勾选 ${picked.length} 条，可横向滚动查看完整表头。`:"当前视图还没有勾选记录。";if(state.tableView==="summary")renderSelectedSummary(picked);else renderSelectedMonthly(picked);openDrawer("ds3SelectedModal");}
  function renderSelectedSummary(list){const ys=years(),icon=state.yearExpanded?"«":"»";$("ds3SelectedHead").innerHTML=`<tr class="ds3-year-group-head"><th rowspan="2">对手方名称</th><th rowspan="2">对手方类型</th><th colspan="6" class="ds3-group-toggle-cell"><button type="button" class="ds3-group-toggle-btn" id="ds3SelectedGroupToggleBtn"><span>合计</span><span class="ds3-group-toggle-icon">${icon}</span></button></th>${state.yearExpanded?ys.map(y=>`<th colspan="6" class="ds3-col-sep">${y}年</th>`).join(""):""}<th rowspan="2">备注</th></tr><tr class="ds3-year-sub-head"><th>流入金额</th><th>销项税价合计</th><th>对比金额</th><th>流出金额</th><th>进项税价合计</th><th>对比金额</th>${state.yearExpanded?ys.map(()=>`<th class="ds3-col-sep">流入金额</th><th>销项税价合计</th><th>对比金额</th><th>流出金额</th><th>进项税价合计</th><th>对比金额</th>`).join(""):""}</tr>`;$("ds3SelectedGroupToggleBtn").onclick=e=>{e.stopPropagation();state.yearExpanded=!state.yearExpanded;renderSelectedSummary(list);};$("ds3SelectedBody").innerHTML=list.map(c=>{const yearCells=state.yearExpanded?ys.map(y=>groupCells(sum(comparable(state.period,baseRows(),y,[]).filter(r=>r.counterparty===c.counterparty)),"ds3-col-sep")).join(""):"";return `<tr><td><span class="ds3-row-main-name">${c.counterparty}</span></td><td>${c.type}</td>${groupCells(sum(c.rows||[]))}${yearCells}<td>${remarks[c.counterparty]?.text||""}</td></tr>`;}).join("");}
  function renderSelectedMonthly(list){$("ds3SelectedHead").innerHTML=`<tr class="ds3-monthly-head"><th>月份</th><th>对手方名称</th><th>对手方类型</th><th>流入金额</th><th>销项税价合计</th><th>对比金额</th><th>流出金额</th><th>进项税价合计</th><th>对比金额</th></tr>`;$("ds3SelectedBody").innerHTML=list.map(r=>`<tr><td>${r.month}</td><td>${r.counterparty}</td><td>${r.type}</td><td class="is-num ds3-num-inflow">${fmt(r.inflow)}</td><td class="is-num ds3-num-output">${fmt(r.salesVat)}</td><td class="is-num">${fmt(r.inCompare)}</td><td class="is-num ds3-num-outflow">${fmt(r.outflow)}</td><td class="is-num ds3-num-input">${fmt(r.purchaseVat)}</td><td class="is-num">${fmt(r.outCompare)}</td></tr>`).join("");}
  function detailHeader(label,key,table){const st=detailState[table];return `<div class="ds3-th-tools"><span class="ds3-th-label">${label}</span><span class="ds3-th-actions"><button class="ds3-th-action ds3-detail-sort ${st.sort.key===key?"is-active":""}" data-table="${table}" data-key="${key}" type="button">${st.sort.key===key?iconSort(st.sort.order):iconSort()}</button><button class="ds3-th-action ds3-detail-filter ${st.filters[key]?"is-active":""}" data-table="${table}" data-key="${key}" type="button">${iconFilter()}</button></span></div>`;}
  function detailSortFilter(list,table){const st=detailState[table];let out=list.filter(r=>Object.entries(st.filters).every(([k,v])=>String(r[k]??"").toLowerCase().includes(String(v).toLowerCase())));if(st.sort.key){const k=st.sort.key,dir=st.sort.order==="asc"?1:-1;out=out.slice().sort((a,b)=>{const av=a[k]??"",bv=b[k]??"",an=+av,bn=+bv;const res=!isNaN(an)&&!isNaN(bn)?an-bn:String(av).localeCompare(String(bv),"zh-Hans-CN");return res*dir;});}return out;}
  function bindDetailHeaderActions(){document.querySelectorAll(".ds3-detail-sort").forEach(b=>b.onclick=e=>{e.stopPropagation();const st=detailState[b.dataset.table],k=b.dataset.key;if(st.sort.key!==k)st.sort={key:k,order:"asc"};else if(st.sort.order==="asc")st.sort.order="desc";else st.sort={key:"",order:""};b.dataset.table==="txn"?renderTxnDetail(currentDetail.rows):renderVatDetail(currentDetail.vatRows);});document.querySelectorAll(".ds3-detail-filter").forEach(b=>b.onclick=e=>{e.stopPropagation();const st=detailState[b.dataset.table],k=b.dataset.key;const v=prompt("请输入筛选条件",st.filters[k]||"");if(v===null)return;if(v.trim())st.filters[k]=v.trim();else delete st.filters[k];b.dataset.table==="txn"?renderTxnDetail(currentDetail.rows):renderVatDetail(currentDetail.vatRows);});}
  function bindVatDetailTabs(){document.querySelectorAll("#ds3VatDetailTabs [data-vat-type]").forEach(b=>b.onclick=()=>{detailState.vat.type=b.dataset.vatType;document.querySelectorAll("#ds3VatDetailTabs [data-vat-type]").forEach(x=>x.classList.toggle("is-active",x===b));renderVatDetail(currentDetail.vatRows);});}

  function openDetail(cp){const source=baseRows().filter(r=>r.counterparty===cp);const rows=comparable(state.period,source);currentDetail.cp=cp;currentDetail.rows=rows;currentDetail.vatRows=source;const t=sum(rows);$("ds3DetailTitle").textContent=`${cp} - 交易对手方详情`;$("ds3DetailSummary").innerHTML=`<div class="ds3-detail-context">${[["对手方名称",cp],["对手方类型",source[0]?.type||"其他"],["全局账期口径",periodName()],["对手方账期",cpPeriodText(cp)],["账期对象",basisText[state.basis]]].map(([k,v])=>`<div class="ds3-detail-card"><div class="ds3-detail-card-label">${k}</div><div class="ds3-detail-card-value">${v}</div></div>`).join("")}</div><div class="ds3-kpi-strip">${[["流入金额",t.inflow,"inflow"],["销项税价合计",t.salesVat,"output"],["对比金额",t.inflow-t.salesVat,"neutral"],["流出金额",t.outflow,"outflow"],["进项税价合计",t.purchaseVat,"input"],["对比金额",t.outflow-t.purchaseVat,"neutral"]].map(([k,v,c])=>`<div class="ds3-detail-kpi is-${c}"><span>${k}</span><b>${fmt(v)}</b><em>千元</em></div>`).join("")}</div>`;renderTxnDetail(rows);renderVatDetail(source);$("ds3DetailRemark").value=remarks[cp]?.text||"";$("ds3SaveRemarkBtn").onclick=()=>{remarks[cp]={text:$("ds3DetailRemark").value,time:new Date().toLocaleString("zh-CN"),user:"项目组"};renderAll();};openDrawer("ds3DetailModal");setTimeout(()=>{renderDetailCharts(rows);resizeCharts();},80);}
  function renderDetailCharts(rows){const m=byMonth(rows);renderChart("ds3DetailInChart","in",m,["银行流入","销项税价合计"],["#2f6fed","#0f9f8a"],"inflow","salesVat");renderChart("ds3DetailOutChart","out",m,["银行流出","进项税价合计"],["#d9466f","#d97706"],"outflow","purchaseVat");}
  function renderTxnDetail(rows){const detail=rows.map((r,i)=>({unit:r.unit,account:r.account||`6222****${8800+i}`,counterparty:r.counterparty,date:`${r.month}-15`,time:"14:22:11",currency:"CNY",inflow:r.inflow,outflow:r.outflow,balance:1000+i*45,txnType:r.inflow>=r.outflow?"收款":"付款",summary:r.inflow>=r.outflow?"销售回款":"采购付款",type:r.type}));const list=detailSortFilter(detail,"txn");$("ds3TxnDetailHead").innerHTML=`<tr><th>${detailHeader("本方名称","unit","txn")}</th><th>${detailHeader("本方账号","account","txn")}</th><th>${detailHeader("对方名称","counterparty","txn")}</th><th>${detailHeader("交易日期","date","txn")}</th><th>${detailHeader("交易时间","time","txn")}</th><th>${detailHeader("币种","currency","txn")}</th><th class="is-num">${detailHeader("流入金额","inflow","txn")}</th><th class="is-num">${detailHeader("流出金额","outflow","txn")}</th><th class="is-num">${detailHeader("交易后余额","balance","txn")}</th><th>${detailHeader("交易类型","txnType","txn")}</th><th>${detailHeader("摘要","summary","txn")}</th><th>${detailHeader("对手方类型","type","txn")}</th></tr>`;$("ds3TxnDetailBody").innerHTML=list.map(r=>`<tr><td>${r.unit}</td><td>${r.account}</td><td>${r.counterparty}</td><td>${r.date}</td><td>${r.time}</td><td>${r.currency}</td><td class="is-num ds3-num-inflow">${fmt(r.inflow)}</td><td class="is-num ds3-num-outflow">${fmt(r.outflow)}</td><td class="is-num">${fmt(r.balance)}</td><td>${r.txnType}</td><td>${r.summary}</td><td>${r.type}</td></tr>`).join("");bindDetailHeaderActions();}
  function renderVatDetail(rows){const wantSales=detailState.vat.type==="sales";document.querySelectorAll("#ds3VatDetailTabs [data-vat-type]").forEach(b=>b.classList.toggle("is-active",b.dataset.vatType===detailState.vat.type));const detail=rows.map((r,i)=>{const salesTotal=+r.salesVat||0,purchaseTotal=+r.purchaseVat||0,isSales=wantSales,total=wantSales?salesTotal:purchaseTotal,amount=+(total/1.13).toFixed(1),tax=+(total-amount).toFixed(1),assignedMonth=shiftMonth(r.month,taxShiftFor(r.counterparty,wantSales?"receipt":"payment",periodShift(state.period)));return {date:`${r.month}-18`,assignedMonth,invoice:`FP${wantSales?"XS":"JX"}${100000+i}`,invoiceType:wantSales?"销项税票":"进项税票",counterparty:r.counterparty,amount,tax,total,isSales};}).filter(r=>r.total>0);const list=detailSortFilter(detail,"vat");$("ds3VatDetailHead").innerHTML=`<tr><th>${detailHeader(wantSales?"开票日期":"收票日期","date","vat")}</th><th>${detailHeader("归属月份","assignedMonth","vat")}</th><th>${detailHeader("发票号码","invoice","vat")}</th><th>${detailHeader("发票类型","invoiceType","vat")}</th><th>${detailHeader("对手方名称","counterparty","vat")}</th><th class="is-num">${detailHeader("金额","amount","vat")}</th><th class="is-num">${detailHeader("税额","tax","vat")}</th><th class="is-num">${detailHeader("价税合计","total","vat")}</th></tr>`;$("ds3VatDetailBody").innerHTML=list.length?list.map(r=>`<tr><td>${r.date}</td><td>${r.assignedMonth}</td><td>${r.invoice}</td><td>${r.invoiceType}</td><td>${r.counterparty}</td><td class="is-num">${fmt(r.amount)}</td><td class="is-num">${fmt(r.tax)}</td><td class="is-num ${r.isSales?"ds3-num-output":"ds3-num-input"}">${fmt(r.total)}</td></tr>`).join(""):`<tr><td colspan="8" class="ds3-empty-cell">当前无${wantSales?"销项税":"进项税"}明细</td></tr>`;bindDetailHeaderActions();bindVatDetailTabs();}
  function resizeCharts(){Object.values(charts).forEach(c=>{try{c&&c.resize();}catch(e){}});}
  function syncChartTypeSwitch(){document.querySelectorAll("#ds3ChartTypeSwitch [data-chart-type]").forEach(b=>b.classList.toggle("is-active",b.dataset.chartType===state.chartType));}
  function renderAll(){readFilters();renderCustomPeriod();renderMonthSelect();syncChartTypeSwitch();const rows=comparable();renderMonthToolbar();renderKpis(rows);renderCharts(rows);renderSummary(rows);renderPeriodRows();renderComposition(rows);renderTable(rows);document.querySelectorAll("[data-view-panel]").forEach(p=>p.classList.toggle("is-hidden",state.view!=="all"&&state.view!==p.dataset.viewPanel));setTimeout(resizeCharts,40);}
  function bind(){document.addEventListener("click",e=>{if(!e.target.closest(".ds3-month-picker"))$("ds3MonthPicker")?.classList.remove("is-open");});window.addEventListener("beforeunload",()=>setParentDrawer(false));$("ds3Unit").onchange=()=>{state.unit=$("ds3Unit").value;state.account="全部";refreshAccounts();};$("ds3Year").onchange=()=>{state.year=$("ds3Year").value;state.selectedMonths=[];state.page=1;renderAll();};$("ds3PeriodOffset").onchange=()=>{state.period=$("ds3PeriodOffset").value;state.periodPreview=["same","minus1","plus1"].includes(state.period)?state.period:"same";renderAll();};$("ds3CustomPeriodShift").oninput=()=>{state.customShift=Math.max(-12,Math.min(12,+$("ds3CustomPeriodShift").value||0));renderAll();};$("ds3ApplyBtn").onclick=()=>{state.page=1;renderAll();};$("ds3ResetBtn").onclick=()=>{Object.assign(state,{unit:"全部",account:"全部",type:"全部",keyword:"",year:"all",view:"all",period:"same",basis:"all",customShift:0,selectedMonths:[],selectedCounterparty:"",tableView:"summary",yearExpanded:true,page:1,compositionRank:"inflow",chartType:"bar",periodPreview:"same",sort:{key:"",order:""},filters:{}});selectedRows.clear();Object.keys(counterpartyPeriodOverrides).forEach(k=>delete counterpartyPeriodOverrides[k]);syncFilterControls();refreshAccounts();renderAll();};$("ds3ClearMonthBtn").onclick=()=>{state.selectedMonths=[];renderAll();};$("ds3ClearCounterpartyBtn").onclick=()=>{state.selectedCounterparty="";renderAll();};$("ds3ViewSelectedBtn")&&($("ds3ViewSelectedBtn").onclick=openSelected);$("ds3BatchShiftBtn")&&($("ds3BatchShiftBtn").onclick=openBatchShift);$("ds3ExportBtn").onclick=()=>alert("导出当前结果：已按当前筛选条件生成导出任务。");document.querySelectorAll("#ds3ChartTypeSwitch [data-chart-type]").forEach(b=>b.onclick=()=>{state.chartType=b.dataset.chartType;syncChartTypeSwitch();renderCharts(comparable());});document.querySelectorAll("#ds3CompositionMetric [data-composition-rank]").forEach(b=>b.onclick=()=>{state.compositionRank=b.dataset.compositionRank;renderAll();});$("ds3TableViewTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{state.tableView=b.dataset.view;state.page=1;$("ds3TableViewTabs").querySelectorAll("button").forEach(x=>x.classList.toggle("is-active",x===b));renderAll();});document.querySelectorAll(".ds3-fold").forEach(b=>b.onclick=()=>{const block=b.closest(".ds3-block");block.classList.toggle("is-collapsed");b.textContent=block.classList.contains("is-collapsed")?"展开":"收起";setTimeout(resizeCharts,80);});$("ds3DetailClose").onclick=()=>closeDrawer("ds3DetailModal");$("ds3DetailModal").onclick=e=>{if(e.target.id==="ds3DetailModal")closeDrawer("ds3DetailModal");};if($("ds3SelectedClose")&&$("ds3SelectedModal")){$("ds3SelectedClose").onclick=()=>closeDrawer("ds3SelectedModal");$("ds3SelectedModal").onclick=e=>{if(e.target.id==="ds3SelectedModal")closeDrawer("ds3SelectedModal");};}if($("ds3BatchShiftClose")&&$("ds3BatchShiftModal")){$("ds3BatchShiftClose").onclick=()=>closeDrawer("ds3BatchShiftModal");$("ds3BatchShiftModal").onclick=e=>{if(e.target.id==="ds3BatchShiftModal")closeDrawer("ds3BatchShiftModal");};$("ds3BatchShiftApply").onclick=()=>applyBatchShift(false);$("ds3BatchShiftClear").onclick=()=>applyBatchShift(true);}if($("ds3PeriodDetailModal")){$("ds3PeriodDetailClose").onclick=() => closeDrawer("ds3PeriodDetailModal");$("ds3PeriodDetailCancel").onclick=() => closeDrawer("ds3PeriodDetailModal");$("ds3PeriodDetailApply").onclick=()=>{closeDrawer("ds3PeriodDetailModal");applyPreviewPeriod();};$("ds3PeriodDetailModal").onclick=e=>{if(e.target.id==="ds3PeriodDetailModal")closeDrawer("ds3PeriodDetailModal");};}window.addEventListener("resize",resizeCharts);}
  function init(){initFilters();bind();renderAll();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
