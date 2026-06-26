(function(){
  const rows=[
    {name:'廊坊中晟包装有限公司',type:'供应商',inflow:771.7,salesVat:0,outflow:30866.7,purchaseVat:29493.2,count:295,sameRatio:8.4,industry:'包装材料',duration:'6年8个月',people:'王某（法人）、陈某'},
    {name:'郑州华辰电气有限公司',type:'客户',inflow:29401.7,salesVat:28409.9,outflow:1058.8,purchaseVat:0,count:300,sameRatio:12.6,industry:'电气设备',duration:'8年1个月',people:'赵某（法人）、李某'},
    {name:'天津远泽汽车零部件有限公司',type:'客户',inflow:29079.3,salesVat:28307.5,outflow:814.4,purchaseVat:0,count:285,sameRatio:10.2,industry:'汽车零部件',duration:'7年4个月',people:'孙某（法人）、周某'},
    {name:'重庆云峰智能装备有限公司',type:'客户',inflow:27449.1,salesVat:26622.9,outflow:548.9,purchaseVat:0,count:307,sameRatio:8.9,industry:'智能装备',duration:'5年10个月',people:'吴某（法人）、高某'},
    {name:'绍兴恒越纺织材料有限公司',type:'供应商',inflow:1171.3,salesVat:0,outflow:26028.8,purchaseVat:25095.9,count:282,sameRatio:11.8,industry:'纺织材料',duration:'9年2个月',people:'钱某（法人）、许某'},
    {name:'昆明启明商贸有限公司',type:'客户',inflow:24934.0,salesVat:23978.3,outflow:897.4,purchaseVat:0,count:295,sameRatio:9.6,industry:'商贸批发',duration:'4年11个月',people:'冯某（法人）、王某'},
    {name:'贵阳恒通运输有限公司',type:'供应商',inflow:870.4,salesVat:0,outflow:24869.6,purchaseVat:24119.8,count:297,sameRatio:7.7,industry:'交通运输',duration:'6年5个月',people:'周某（法人）、吴某'},
    {name:'上海凌云工业控制有限公司',type:'客户',inflow:24802.9,salesVat:23843.3,outflow:694.4,purchaseVat:0,count:294,sameRatio:8.2,industry:'工业控制',duration:'10年3个月',people:'刘某（法人）、朱某'},
    {name:'昆山精达模具有限公司',type:'供应商',inflow:845.6,salesVat:0,outflow:24157.4,purchaseVat:23408.5,count:319,sameRatio:8.5,industry:'模具制造',duration:'8年9个月',people:'张某（法人）、陈某'},
    {name:'厦门瀚宇信息服务有限公司',type:'客户',inflow:24097.8,salesVat:23098.9,outflow:867.6,purchaseVat:0,count:343,sameRatio:9.1,industry:'信息服务',duration:'5年7个月',people:'郭某（法人）、唐某'},
    {name:'石家庄北辰机电有限公司',type:'客户',inflow:23501.6,salesVat:22683.6,outflow:469.9,purchaseVat:0,count:325,sameRatio:7.9,industry:'机电设备',duration:'7年6个月',people:'梁某（法人）、宋某'},
    {name:'北京恒瑞医疗设备有限公司',type:'客户',inflow:23305.5,salesVat:22424.3,outflow:466.3,purchaseVat:0,count:302,sameRatio:8.0,industry:'医疗设备',duration:'9年1个月',people:'郑某（法人）、罗某'}
  ];
  const sourceCustomerNames=[
    '上海启辰贸易有限公司','南京卓越电子有限公司','杭州科锐科技有限公司','深圳远景服务有限公司','广州锦程商贸有限公司','佛山凯鸿商贸有限公司','厦门瀚宇信息服务有限公司','无锡蓝海电子有限公司','重庆云峰智能装备有限公司','天津远泽汽车零部件有限公司',
    '郑州华辰电气有限公司','合肥星驰新能源有限公司','长沙明德精密仪器有限公司','西安博瑞信息技术有限公司','南通瑞诚家电有限公司','嘉兴远林包装有限公司','宁波东策供应链有限公司','青岛海拓工程设备有限公司','昆明启明商贸有限公司','沈阳北方自动化有限公司',
    '北京恒瑞医疗设备有限公司','上海凌云工业控制有限公司','深圳智联机器人有限公司','广州万成电子商务有限公司','苏州新程汽车系统有限公司','成都天府软件服务有限公司','武汉光谷通信技术有限公司','宁德远航新能源材料有限公司','常州铭诚电机有限公司','福州海峡贸易有限公司',
    '太原晋科自动化有限公司','南昌启程家居有限公司','石家庄北辰机电有限公司','哈尔滨森远装备有限公司','南宁桂海商贸有限公司','兰州西域工程技术有限公司','乌鲁木齐天山物流科技有限公司','长春华远汽车电子有限公司','徐州瑞联工程机械有限公司','湖州南太湖电子有限公司',
    '泉州海丝服饰有限公司','中山粤科照明有限公司','东莞星河智能制造有限公司','烟台蓝湾海工装备有限公司','绍兴越达纺织科技有限公司'
  ];
  const sourceSupplierNames=[
    '苏州华瑞工业有限公司','宁波宏达供应链有限公司','武汉迅达物流有限公司','青岛远通国际贸易有限公司','东莞信成科技有限公司','常熟力合金属材料有限公司','成都智联设备有限公司','昆山精达模具有限公司','绍兴恒越纺织材料有限公司','廊坊中晟包装有限公司',
    '济南朗科机电有限公司','泉州启航物流有限公司','大连锦丰化工材料有限公司','太仓联盛仓储有限公司','温州诚越五金有限公司','珠海立新电子元件有限公司','洛阳中科传动有限公司','惠州海川塑胶有限公司','扬州锐达自动化有限公司','贵阳恒通运输有限公司',
    '上海浦江精密材料有限公司','无锡恒泰轴承有限公司','佛山顺联塑胶有限公司','天津港达物流有限公司','深圳海纳电子元件有限公司','厦门嘉禾包装材料有限公司','常州新北钢材有限公司','合肥安达仓储服务有限公司','南京雨花机电设备有限公司','杭州临平化工材料有限公司',
    '苏州金桥模塑有限公司','宁波北仑港务服务有限公司','重庆渝江电气设备有限公司','成都锦城运输有限公司','武汉汉阳金属制品有限公司','广州白云劳务服务有限公司','东莞长安精工刀具有限公司','南通江海物流有限公司','嘉兴平湖胶粘制品有限公司','台州路桥汽配有限公司',
    '芜湖江城新能源材料有限公司','赣州南康包装有限公司','衡阳湘南五金有限公司','昆明滇池仓储有限公司','西安秦岭自动化有限公司'
  ];
  const sourceOtherNames=['北京云桥科技有限公司','上海同舟咨询有限公司','深圳前海保理服务有限公司','杭州星云广告有限公司','广州南方律师事务所','成都锦江审计咨询有限公司','南京秦淮物业管理有限公司','苏州工业园区人才服务有限公司','上海安信保险经纪有限公司','深圳鹏城云计算有限公司'];
  const industries=['批发零售业','制造业','信息技术服务业','交通运输业','设备制造业','新能源材料','电子元件','包装材料','仓储服务','商务服务'];
  const peopleNames=['王某（法人）、陈某','赵某（法人）、李某','孙某（法人）、周某','吴某（法人）、高某','钱某（法人）、许某','冯某（法人）、王某','刘某（法人）、朱某','郭某（法人）、唐某'];
  const addGeneratedRows=(names,type,offset)=>{
    names.forEach((name,i)=>{
      if(rows.length>=100 || rows.some(r=>r.name===name))return;
      const rank=i+offset, scale=Math.max(.36,(type==='客户'?1.18:type==='供应商'?1.08:.32)-rank*.006+(rank%5)*.026);
      const main=+(18000*scale+((rank*137)%2600)).toFixed(1), minor=+(520+((rank*73)%760)).toFixed(1);
      const inflow=type==='供应商'?minor:main, outflow=type==='客户'?minor:main;
      rows.push({
        name,type,
        inflow:+inflow.toFixed(1),
        salesVat:type==='客户'?+(inflow*(.94+(rank%4)*.012)).toFixed(1):0,
        outflow:+outflow.toFixed(1),
        purchaseVat:type==='供应商'?+(outflow*(.93+(rank%4)*.014)).toFixed(1):0,
        count:Math.max(18,Math.round(330-rank*2.1+(rank%7)*9)),
        sameRatio:+(6+(rank%11)*2.7).toFixed(1),
        industry:industries[rank%industries.length],
        duration:`${3+rank%9}年${1+rank%11}个月`,
        people:peopleNames[rank%peopleNames.length]
      });
    });
  };
  addGeneratedRows(sourceCustomerNames,'客户',0);
  addGeneratedRows(sourceSupplierNames,'供应商',45);
  addGeneratedRows(sourceOtherNames,'其他',90);
  const charts={}; let mode='inflow',sortKey='',sortDir=1,page=1,pageSize=20;
  const fmt=v=>v?Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
  const fmtK=v=>v?`${fmt(v)}K`:'—';
  const typeClass=t=>t==='客户'?'is-customer':t==='供应商'?'is-supplier':'';
  function mini(row,index){const max=Math.max(row.inflow,row.outflow,1);return `<div class="portrait-mini">${Array.from({length:12},(_,m)=>{const a=Math.max(2,(row.inflow/max)*(45+(m*13+index*9)%50)),b=Math.max(2,(row.outflow/max)*(42+(m*17+index*7)%54));return `<span title="${m+1}月"><i class="is-in" style="height:${a}%"></i><i class="is-out" style="height:${b}%"></i></span>`}).join('')}</div>`}
  function renderTable(){let list=[...rows];if(sortKey)list.sort((a,b)=>{const av=a[sortKey],bv=b[sortKey];return (typeof av==='number'?av-bv:String(av).localeCompare(String(bv),'zh-CN'))*sortDir});const total=list.length,pages=Math.max(1,Math.ceil(total/pageSize));if(page>pages)page=pages;const start=(page-1)*pageSize,view=list.slice(start,start+pageSize);const body=document.getElementById('portraitCounterpartyBody');if(!body)return;body.innerHTML=view.map((r,i)=>`<tr><td>${r.name}</td><td>${mini(r,start+i)}</td><td class="portrait-type-cell ${typeClass(r.type)}">${r.type}</td><td class="is-inflow">${fmtK(r.inflow)}</td><td class="is-sales-vat">${fmtK(r.salesVat)}</td><td class="is-outflow">${fmtK(r.outflow)}</td><td class="is-purchase-vat">${fmtK(r.purchaseVat)}</td><td>${r.count}</td><td>${r.sameRatio.toFixed(1)}</td><td>${r.industry}</td><td>${r.duration}</td><td>${r.people}</td></tr>`).join('');document.getElementById('portraitTableCount').textContent=`共 ${total} 家对手方，当前展示 ${start+1}-${Math.min(start+pageSize,total)} / ${total}`;const pager=document.getElementById('portraitPager');if(pager){pager.innerHTML=`<button class="btn" data-page="prev" ${page<=1?'disabled':''}>上一页</button><label class="ba-page-size">每页<select data-page-size>${[10,20,30,40,50].map(n=>`<option value="${n}" ${pageSize===n?'selected':''}>${n}</option>`).join('')}</select>条</label><span>${page} / ${pages}</span><button class="btn" data-page="next" ${page>=pages?'disabled':''}>下一页</button>`;pager.querySelector('[data-page="prev"]')?.addEventListener('click',()=>{page=Math.max(1,page-1);renderTable();});pager.querySelector('[data-page="next"]')?.addEventListener('click',()=>{page=Math.min(pages,page+1);renderTable();});pager.querySelector('[data-page-size]')?.addEventListener('change',e=>{pageSize=Number(e.target.value)||20;page=1;renderTable();});}}
  function monthlyOption(){const months=Array.from({length:12},(_,i)=>`${i+1}月`),base=[120,135,110,145,160,155,170,180,165,190,210,230];const series=[['客户流入','#2f6fed',1],['供应商流入','#74a0f5',.68],['其他流入','#bfdbfe',.28],['客户流出','#d9466f',-.75],['供应商流出','#ee839e',-.5],['其他流出','#fecdd3',-.2]].map(([name,color,factor],i)=>({name,type:'bar',stack:factor>0?'in':'out',barMaxWidth:20,itemStyle:{color},data:base.map((v,m)=>Math.round(v*factor*(.82+((m+i)%4)*.06)))}));return {tooltip:{trigger:'axis',valueFormatter:v=>`${Math.abs(v).toLocaleString()} 万元`},legend:{top:0,itemWidth:10,itemHeight:7,textStyle:{fontSize:10}},grid:{left:52,right:12,top:30,bottom:28},xAxis:{type:'category',data:months,axisLabel:{fontSize:10}},yAxis:{type:'value',name:'金额（万元）',nameTextStyle:{fontSize:10},axisLabel:{formatter:v=>Math.abs(v),fontSize:10},splitLine:{lineStyle:{color:'#edf2f7'}}},series};}
  function bubbleOption(){const xMin=+document.getElementById('portraitXMin')?.value||0,xMax=+document.getElementById('portraitXMax')?.value||40000,yMin=+document.getElementById('portraitYMin')?.value||0,yMax=+document.getElementById('portraitYMax')?.value||100;const key=mode==='inflow'?'inflow':mode==='outflow'?'outflow':null;const data=rows.map(r=>({name:r.name,value:[key?r[key]:r.inflow+r.outflow,r.count,Math.max(r.inflow,r.outflow),r.type]}));const dataMaxX=Math.max(...data.map(d=>d.value[0]||0),xMin+1000),dataMaxY=Math.max(...data.map(d=>d.value[1]||0),yMin+5);return {tooltip:{formatter:p=>`${p.name}<br/>${mode==='inflow'?'流入':mode==='outflow'?'流出':'交易总额'}：${fmt(p.value[0])} 万元<br/>交易次数：${p.value[1]}<br/>对手方类型：${p.value[3]}`},grid:{left:55,right:18,top:16,bottom:54},dataZoom:[{type:'inside',xAxisIndex:0,filterMode:'none'},{type:'slider',xAxisIndex:0,height:12,bottom:8,borderColor:'transparent',backgroundColor:'#eef2f7',fillerColor:'rgba(47,111,237,.18)',handleSize:0,showDetail:false}],xAxis:{type:'value',min:xMin,max:Math.max(xMin+1000,xMax,dataMaxX*1.08),name:mode==='inflow'?'流入金额（万元）':mode==='outflow'?'流出金额（万元）':'交易总额（万元）',nameLocation:'middle',nameGap:28,axisLabel:{fontSize:10},splitLine:{lineStyle:{color:'#edf2f7'}}},yAxis:{type:'value',min:yMin,max:Math.max(yMin+5,yMax,dataMaxY*1.08),name:'交易次数',axisLabel:{fontSize:10},splitLine:{lineStyle:{color:'#edf2f7'}}},series:[{type:'scatter',data,symbolSize:v=>Math.max(7,Math.min(26,Math.sqrt(v[2]||1)/7)),itemStyle:{color:p=>p.value[3]==='客户'?'#2f6fed':p.value[3]==='供应商'?'#d9466f':'#64748b',opacity:.72},label:{show:true,position:'top',fontSize:9,formatter:p=>p.name.length>8?p.name.slice(0,8)+'…':p.name}}]};}
  function renderCharts(){if(!window.echarts)return;[['monthly','portraitMonthlyChart'],['bubble','portraitBubbleChart']].forEach(([key,id])=>{const el=document.getElementById(id);if(!el)return;charts[key]=echarts.getInstanceByDom(el)||echarts.init(el);charts[key].setOption(key==='monthly'?monthlyOption():bubbleOption(),true);charts[key].resize();});}
  function updateConcentration(kind){
    const isCustomer=kind==='Customer';
    const select=document.getElementById(`portrait${kind}TopN`);
    const ratioEl=document.getElementById(`portrait${kind}Ratio`);
    const labelEl=document.getElementById(`portrait${kind}Label`);
    const barEl=document.getElementById(`portrait${kind}Bar`);
    if(!select||!ratioEl||!labelEl||!barEl)return;
    const n=Number(select.value)||10;
    const ratioMap={5:68,10:86,20:94};
    const ratio=ratioMap[n]||86;
    labelEl.textContent=`前${n}大${isCustomer?'客户':'供应商'}集中度`;
    ratioEl.textContent=`${ratio}%`;
    barEl.style.width=`${ratio}%`;
  }
  function bind(){document.querySelectorAll('#portraitBubbleTabs button').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;document.querySelectorAll('#portraitBubbleTabs button').forEach(x=>x.classList.toggle('is-active',x===btn));renderCharts();}));['portraitXMin','portraitXMax','portraitYMin','portraitYMax'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderCharts));document.getElementById('portraitColumnsBtn')?.addEventListener('click',()=>document.querySelector('.portrait-table-wrap')?.classList.toggle('is-compact-columns'));document.getElementById('portraitExportBtn')?.addEventListener('click',()=>{const head=['对手方名称','对手方类型','流入金额','销项税价合计','流出金额','进项税价合计','交易笔数','同进同出比例','行业','经营时长','董监高'];const csv=[head,...rows.map(r=>[r.name,r.type,r.inflow,r.salesVat,r.outflow,r.purchaseVat,r.count,r.sameRatio,r.industry,r.duration,r.people])].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='流水画像_对手方汇总清单.csv';a.click();URL.revokeObjectURL(a.href);});['Customer','Supplier'].forEach(kind=>{document.getElementById(`portrait${kind}TopN`)?.addEventListener('change',()=>updateConcentration(kind));updateConcentration(kind);});window.addEventListener('resize',()=>Object.values(charts).forEach(c=>c?.resize()));document.getElementById('btnQueryBiz')?.addEventListener('click',()=>{renderTable();renderCharts();});}
  document.addEventListener('DOMContentLoaded',()=>{renderTable();bind();setTimeout(renderCharts,80);});
})();
