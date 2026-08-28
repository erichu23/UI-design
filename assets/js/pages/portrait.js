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
  const charts={}; let mode='inflow',featureView='customer',monthlyYear=2025,sortKey='',sortDir=1,page=1,pageSize=20,tableView='summary',yearExpanded=false,counterpartyFilter='all',portraitKpisHidden=false;
  let relationMode='total',relationFilter='related',relationPage=1,relationPageSize=20,relationTableView='summary',relationYearExpanded=false,relationSortKey='',relationSortDir=1,relationKpisHidden=false;
  let personalMode='total',personalFilter='all',personalPage=1,personalPageSize=20,personalTableView='summary',personalYearExpanded=false,personalSortKey='',personalSortDir=1,personalKpisHidden=false;
  const fmt=v=>v?Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
  const fmtK=v=>v?`${fmt(v)}K`:'—';
  const fmtAmount=v=>v?(window.AuditUnit?.formatFromK?.(v)??fmtK(v)):'—';
  const typeClass=t=>t==='客户'?'is-customer':t==='供应商'?'is-supplier':'';
  const syncCounterpartyTypeCells=scope=>{
    (scope||document).querySelectorAll('.portrait-type-cell').forEach(cell=>{
      const type=(cell.textContent||'').trim();
      cell.classList.toggle('is-customer',type==='客户');
      cell.classList.toggle('is-supplier',type==='供应商');
    });
  };
  const filterDefs=[
    {key:'all',label:'全体对手方'},
    {key:'related',label:'已知关联方'},
    {key:'supplier',label:'供应商'},
    {key:'customer',label:'客户'},
    {key:'employee',label:'员工'},
    {key:'other',label:'其他'},
    {key:'personal',label:'个人'}
  ];
  const rowIndex=row=>rows.findIndex(r=>r.name===row.name);
  const isRelated=row=>rowIndex(row)%4===0;
  const isEmployee=row=>rowIndex(row)%17===0;
  const isPersonal=row=>rowIndex(row)%19===0;
  const relationDisplayType=row=>{
    if(relationFilter==='employee'&&isEmployee(row))return '员工';
    if(relationFilter==='personal'&&isPersonal(row))return '个人';
    return row.type;
  };
  const displayType=row=>{
    if(counterpartyFilter==='related'&&isRelated(row))return '已知关联方';
    if(counterpartyFilter==='employee'&&isEmployee(row))return '员工';
    if(counterpartyFilter==='personal'&&isPersonal(row))return '个人';
    if(counterpartyFilter==='other')return '其他';
    return row.type;
  };
  const filterRows=list=>list.filter(row=>{
    if(counterpartyFilter==='all')return true;
    if(counterpartyFilter==='related')return isRelated(row);
    if(counterpartyFilter==='supplier')return row.type==='供应商';
    if(counterpartyFilter==='customer')return row.type==='客户';
    if(counterpartyFilter==='employee')return isEmployee(row);
    if(counterpartyFilter==='other')return row.type==='其他';
    if(counterpartyFilter==='personal')return isPersonal(row);
    return true;
  });
  const metricValue=(row,key)=>key==='inflow'?row.inflow:key==='outflow'?row.outflow:row.inflow+row.outflow;
  const monthWeights=[.068,.072,.078,.074,.081,.083,.087,.091,.086,.094,.101,.185];
  const monthlyMetricValue=(row,monthIndex,key)=>{
    const drift=1+(((row.name.length+monthIndex*3)%7)-3)*.018;
    return +(metricValue(row,key)*(monthWeights[monthIndex]||0)*drift).toFixed(1);
  };
  const relationDefs=[
    {key:'related',label:'已知关联方'},
    {key:'supplier',label:'供应商'},
    {key:'customer',label:'客户'},
    {key:'employee',label:'员工'},
    {key:'other',label:'其他'},
    {key:'personal',label:'个人'}
  ];
  const personalDefs=[
    {key:'all',label:'全部个人'},
    {key:'employee',label:'员工'},
    {key:'otherPersonal',label:'其他个人'}
  ];
  const relationBaseRows=()=>rows.filter(isRelated);
  const relationFilterRows=(list=relationBaseRows(),key=relationFilter)=>list.filter(row=>{
    if(key==='related')return true;
    if(key==='supplier')return row.type==='供应商';
    if(key==='customer')return row.type==='客户';
    if(key==='employee')return isEmployee(row);
    if(key==='other')return row.type==='其他';
    if(key==='personal')return isPersonal(row);
    return true;
  });
  const personalBaseRows=()=>rows.filter(row=>isEmployee(row)||isPersonal(row));
  const personalType=row=>isEmployee(row)?'员工':'其他个人';
  const personalFilterRows=(list=personalBaseRows(),key=personalFilter)=>list.filter(row=>{
    if(key==='all')return true;
    if(key==='employee')return isEmployee(row);
    if(key==='otherPersonal')return !isEmployee(row);
    return true;
  });
  const years=[2023,2024,2025];
  const yearRatios={2023:.27,2024:.33,2025:.40};
  const businessStatus=['存续','存续','存续','存续','迁出','存续','存续','存续','存续','存续'];
  const capitalCurrency=['RMB','RMB','RMB','RMB','RMB','RMB','RMB','RMB','USD','RMB'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const yearVal=(row,key,year)=>{
    const base=Number(row[key]||0);
    const drift=1+(((row.name.length+year)%5)-2)*.018;
    return +(base*(yearRatios[year]||.33)*drift).toFixed(1);
  };
  const monthlyYearMetricValue=(row,monthIndex,key,year)=>{
    const yearly = yearVal(row,key,year);
    const drift = 1+(((row.name.length+monthIndex*3+year)%7)-3)*.018;
    return +(yearly*(monthWeights[monthIndex]||0)*drift).toFixed(1);
  };
  const groupCells=(row,year)=>{
    const inflow=year?yearVal(row,'inflow',year):row.inflow;
    const salesVat=year?yearVal(row,'salesVat',year):row.salesVat;
    const outflow=year?yearVal(row,'outflow',year):row.outflow;
    const purchaseVat=year?yearVal(row,'purchaseVat',year):row.purchaseVat;
    const count=year?Math.max(1,Math.round(row.count*(yearRatios[year]||.33))):row.count;
    const periodClass=year?' portrait-year-detail-cell':'';
    return `<td class="is-num audit-period-metric is-inflow${periodClass}" data-audit-amount-k="${inflow}">${fmtAmount(inflow)}</td><td class="is-num audit-period-metric is-sales-vat${periodClass}" data-audit-amount-k="${salesVat}">${fmtAmount(salesVat)}</td><td class="is-num audit-period-metric is-outflow${periodClass}" data-audit-amount-k="${outflow}">${fmtAmount(outflow)}</td><td class="is-num audit-period-metric is-purchase-vat${periodClass}" data-audit-amount-k="${purchaseVat}">${fmtAmount(purchaseVat)}</td><td class="is-num audit-period-metric is-transaction-total${periodClass}" data-audit-amount-k="${inflow+outflow}">${fmtAmount(inflow+outflow)}</td><td class="is-num audit-period-metric${periodClass}">${count}</td>`;
  };
  const metricLabel=key=>key==='inflow'?'流入金额':key==='outflow'?'流出金额':'交易总额';
  const relationTypeName=key=>(relationDefs.find(x=>x.key===key)||relationDefs[0]).label;
  const headerCell=(label,key)=>`<th data-sort="${key||''}">${label}</th>`;
  const blacklistHit=row=>false;
  const blacklistLabel=row=>blacklistHit(row)?'命中':'未命中';
  const blacklistCell=(row,extraClass='')=>`<td class="counterparty-blacklist-cell ${extraClass} ${blacklistHit(row)?'is-hit':''}">${blacklistHit(row)?'✓':'-'}</td>`;
  const businessInfo=row=>{
    const idx=rows.findIndex(r=>r.name===row.name);
    const start=2014+(idx%8);
    const month=String((idx%12)+1).padStart(2,'0');
    const day=String((idx*3)%27+1).padStart(2,'0');
    return {
      status:businessStatus[idx%businessStatus.length],
      founded:`${start}-${month}-${day}`,
      start:`${start}-${month}-${day}`,
      end:idx%7===0?'2035-12-31':'长期',
      term:idx%7===0?`${21-idx%5}年`:'长期',
      capital:((idx%9)+1)*1000,
      currency:capitalCurrency[idx%capitalCurrency.length],
      scope:row.type==='客户'?'设备销售、技术服务、电子产品批发':'原材料采购、仓储物流、供应链服务',
      address:['上海市浦东新区','深圳市南山区','苏州市工业园区','杭州市余杭区','成都市高新区'][idx%5],
      contact:`021-${String(60000000+idx*1379).slice(0,8)}`,
      people:row.people
    };
  };
  const portraitRemarks={};
  const counterpartyMasterInfo=row=>{
    const idx=Math.max(0,rowIndex(row));
    const customer=row.type==='客户';
    const supplier=row.type==='供应商';
    const employee=isEmployee(row);
    const approval=`${2021+idx%4}-${String(idx%12+1).padStart(2,'0')}-${String(idx%24+1).padStart(2,'0')}`;
    return {
      salesCategory:customer?(idx%3===0?'战略客户':'一般客户'):'—',
      purchaseCategory:supplier?(idx%3===0?'核心供应商':'一般供应商'):'—',
      position:employee?['财务经理','采购主管','销售经理'][idx%3]:'—',
      customerApprovalDate:customer?approval:'—',
      customerInvalidDate:customer&&idx%11===0?'2025-12-31':'—',
      supplierApprovalDate:supplier?approval:'—',
      supplierInvalidDate:supplier&&idx%13===0?'2025-12-31':'—',
      employeeHireDate:employee?approval:'—',
      employeeLeaveDate:employee&&idx%9===0?'2025-09-30':'—',
      group:isRelated(row)?'华东制造集团':'—',
      remark:portraitRemarks[row.name]||''
    };
  };
  const portraitActionIcon=type=>{
    const paths={
      tianyancha:'<path d="M12 2.5 19 5v5.4c0 4.6-2.8 8.7-7 10.6-4.2-1.9-7-6-7-10.6V5Z"/><text x="12" y="14.9" text-anchor="middle">天</text>',
      remark:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
      detail:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
      flows:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'
    };
    return `<svg class="portrait-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[type]}</svg>`;
  };
  const portraitActionButtons=row=>`<div class="portrait-row-actions" data-row-name="${esc(row.name)}">
    <button class="portrait-row-action is-tianyancha" data-portrait-action="tianyancha" type="button" aria-label="天眼查工商信息">${portraitActionIcon('tianyancha')}</button>
    <button class="portrait-row-action" data-portrait-action="remark" data-portrait-tooltip="备注说明" type="button" aria-label="备注说明">${portraitActionIcon('remark')}</button>
    <button class="portrait-row-action" data-portrait-action="detail" data-portrait-tooltip="对手方详情" type="button" aria-label="对手方详情">${portraitActionIcon('detail')}</button>
    <button class="portrait-row-action" data-portrait-action="flows" data-portrait-tooltip="流水明细" type="button" aria-label="流水明细">${portraitActionIcon('flows')}</button>
  </div>`;
  let portraitHostShadeState=null;
  const showPortraitHostShade=()=>{
    const doc=portraitHostDocument();
    if(doc===document)return;
    let shade=doc.getElementById('portraitHostPageShade');
    if(!shade){shade=doc.createElement('div');shade.id='portraitHostPageShade';shade.style.cssText='position:fixed;z-index:12000;inset:0;background:rgba(18,34,55,.34);backdrop-filter:blur(1px) saturate(.9);';doc.body.appendChild(shade);}
    const frame=doc.getElementById('module-frame');
    portraitHostShadeState={shade,frame,position:frame?.style.position||'',zIndex:frame?.style.zIndex||''};
    shade.hidden=false;
    if(frame){frame.style.position='relative';frame.style.zIndex='12001';}
    doc.body.style.overflow='hidden';
  };
  const hidePortraitHostShade=()=>{
    if(!portraitHostShadeState)return;
    const {shade,frame,position,zIndex}=portraitHostShadeState;shade.hidden=true;
    if(frame){frame.style.position=position;frame.style.zIndex=zIndex;}
    shade.ownerDocument.body.style.overflow='';portraitHostShadeState=null;
  };
  const closePortraitDialog=mask=>{mask?.classList.remove('is-open');hidePortraitHostShade();};
  const ensurePortraitDialog=()=>{
    let mask=document.getElementById('portraitActionDialog');
    if(mask)return mask;
    mask=document.createElement('div');
    mask.id='portraitActionDialog';
    mask.className='portrait-action-dialog';
    mask.innerHTML='<div class="portrait-action-dialog-panel" role="dialog" aria-modal="true"><div class="portrait-action-dialog-head"><div><b id="portraitActionDialogTitle"></b><span id="portraitActionDialogSubtitle"></span></div><button type="button" data-dialog-close aria-label="关闭">×</button></div><div class="portrait-action-dialog-body" id="portraitActionDialogBody"></div><div class="portrait-action-dialog-foot" id="portraitActionDialogFoot"><button class="btn" type="button" data-dialog-close>关闭</button></div></div>';
    document.body.appendChild(mask);
    mask.addEventListener('click',event=>{if(event.target===mask||event.target.closest('[data-dialog-close]'))closePortraitDialog(mask);});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mask.classList.contains('is-open'))closePortraitDialog(mask);});
    return mask;
  };
  const openPortraitDialog=(title,subtitle,content,footer='')=>{
    const mask=ensurePortraitDialog();
    mask.classList.remove('is-flow-query');
    mask.querySelector('#portraitActionDialogTitle').textContent=title;
    mask.querySelector('#portraitActionDialogSubtitle').textContent=subtitle||'';
    mask.querySelector('#portraitActionDialogBody').innerHTML=content;
    mask.querySelector('#portraitActionDialogFoot').innerHTML=footer||'<button class="btn" type="button" data-dialog-close>关闭</button>';
    mask.classList.add('is-open');
    showPortraitHostShade();
    return mask;
  };
  const detailGrid=(row,source='主档信息')=>{
    const master=counterpartyMasterInfo(row),biz=businessInfo(row);
    return `<div class="portrait-detail-grid"><span>信息来源</span><b>${source}</b><span>对手方类型</span><b>${esc(displayType(row))}</b><span>统一社会信用代码</span><b>91${String(310000000000000+rowIndex(row)*1379).slice(0,16)}</b><span>经营状态</span><b>${biz.status}</b><span>成立日期</span><b>${biz.founded}</b><span>所属集团</span><b>${esc(master.group)}</b><span>注册地址</span><b>${esc(biz.address)}</b><span>经营范围</span><b>${esc(biz.scope)}</b></div>`;
  };
  const flowTable=row=>{
    const base=Math.max(row.inflow,row.outflow,100);
    return `<div class="portrait-flow-table-wrap"><table class="table portrait-flow-table"><thead><tr><th>交易日期</th><th>方向</th><th>金额</th><th>交易摘要</th><th>流水识别号</th></tr></thead><tbody>${Array.from({length:8},(_,i)=>{const incoming=i%3!==0;const amount=base*(.035+(i%5)*.012);return `<tr><td>2025-${String((i%12)+1).padStart(2,'0')}-${String(8+i*2).padStart(2,'0')}</td><td>${incoming?'流入':'流出'}</td><td class="${incoming?'is-flow-in':'is-flow-out'}">${fmtAmount(amount)}</td><td>${incoming?'货款及服务费回款':'采购及服务付款'}</td><td>TX2025${String(rowIndex(row)+1).padStart(3,'0')}${String(i+1).padStart(2,'0')}</td></tr>`;}).join('')}</tbody></table></div>`;
  };
  const portraitFlowHeaders=['本方名称','本方账号','对方名称','交易日期','交易时间','币种','流入金额','流出金额','交易后余额','等值人民币余额','交易类型','流水识别号','摘要','流水明细尽调备注','关联关系','所属集团','对手方类型','销售类别','采购类别','批准日期_客户','无效日期_客户','批准日期_供应商','无效日期_供应商','入职日期','离职日期'];
  const portraitFlowState={row:null,rows:[],page:1,pageSize:20};
  const buildPortraitFlowRows=row=>{
    const index=Math.max(0,rowIndex(row)),master=counterpartyMasterInfo(row),total=Math.max(36,Math.min(86,Math.round(row.count/5)));
    let balance=318000+index*2370;
    return Array.from({length:total},(_,i)=>{
      const year=2023+i%3,month=String(i%12+1).padStart(2,'0'),day=String((i*7+index)%27+1).padStart(2,'0'),incoming=(i+index)%3!==0;
      const amount=Math.round(Math.max(row.inflow,row.outflow,800)*(.006+(i%9)*.0017));
      balance=Math.max(0,balance+(incoming?amount:-amount));
      return {
        selfName:['华东制造集团有限公司','上海星河科技有限公司','深圳启明电子有限公司'][index%3],
        selfAccount:['1001***0821','1002***4186','2001***7739'][index%3],counterparty:row.name,date:`${year}-${month}-${day}`,time:`${String(8+i%10).padStart(2,'0')}:${String((i*13)%60).padStart(2,'0')}:${String((i*19)%60).padStart(2,'0')}`,currency:'RMB',
        inflow:incoming?amount:0,outflow:incoming?0:amount,balance,rmbBalance:balance,txType:['网银转账','银企直连','柜面转账','承兑到期'][i%4],flowId:`BF${year}${month}${String(index+1).padStart(3,'0')}${String(i+1).padStart(5,'0')}`,
        summary:incoming?'销售回款及服务费':'采购付款及服务费',dueNote:'',relation:isRelated(row)?'已知关联方':'非关联方',group:master.group,cpType:displayType(row),salesType:master.salesCategory,purchaseType:master.purchaseCategory,
        customerApprove:master.customerApprovalDate,customerInvalid:master.customerInvalidDate,supplierApprove:master.supplierApprovalDate,supplierInvalid:master.supplierInvalidDate,hireDate:master.employeeHireDate,leaveDate:master.employeeLeaveDate
      };
    });
  };
  const portraitFlowCell=(flow,key)=>{
    if(key==='inflow')return `<td class="amount-in">${flow.inflow?fmtAmount(flow.inflow):'0'}</td>`;
    if(key==='outflow')return `<td class="amount-out">${flow.outflow?fmtAmount(flow.outflow):'0'}</td>`;
    if(key==='balance'||key==='rmbBalance')return `<td>${fmtAmount(flow[key])}</td>`;
    if(key==='dueNote')return `<td><input class="ba-note-input" value="${esc(flow.dueNote)}" placeholder="填写尽调备注"></td>`;
    return `<td>${esc(flow[key]||'—')}</td>`;
  };
  const portraitFlowKeys=['selfName','selfAccount','counterparty','date','time','currency','inflow','outflow','balance','rmbBalance','txType','flowId','summary','dueNote','relation','group','cpType','salesType','purchaseType','customerApprove','customerInvalid','supplierApprove','supplierInvalid','hireDate','leaveDate'];
  const renderPortraitFlowPage=()=>{
    const table=document.getElementById('portraitFlowQueryTable'),body=table?.tBodies?.[0],pager=document.getElementById('portraitFlowQueryPager'),count=document.getElementById('portraitFlowQueryCount');
    if(!table||!body||!pager)return;
    const total=portraitFlowState.rows.length,pages=Math.max(1,Math.ceil(total/portraitFlowState.pageSize));
    portraitFlowState.page=Math.min(Math.max(1,portraitFlowState.page),pages);
    const start=(portraitFlowState.page-1)*portraitFlowState.pageSize,list=portraitFlowState.rows.slice(start,start+portraitFlowState.pageSize);
    body.innerHTML=list.map(flow=>`<tr>${portraitFlowKeys.map(key=>portraitFlowCell(flow,key)).join('')}</tr>`).join('');
    if(count)count.textContent=`共 ${total} 条，当前展示 ${start+1}-${Math.min(start+portraitFlowState.pageSize,total)} / ${total}`;
    window.renderAuditPager?.(pager,{total,page:portraitFlowState.page,pageSize:portraitFlowState.pageSize,onPage(next){portraitFlowState.page=next;renderPortraitFlowPage();},onPageSize(size){portraitFlowState.pageSize=size;portraitFlowState.page=1;renderPortraitFlowPage();}});
    if(table.dataset.baEnhanced!=='1')window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));
  };
  const openPortraitFlowDialog=row=>{
    portraitFlowState.row=row;portraitFlowState.rows=buildPortraitFlowRows(row);portraitFlowState.page=1;
    const content=`<div class="portrait-flow-query tab-pane"><div class="portrait-flow-query-toolbar"><div><b>当前对手方：${esc(row.name)}</b><span id="portraitFlowQueryCount"></span></div><div><button class="btn" id="portraitFlowReset" type="button">重置筛选</button><button class="btn" id="portraitFlowColumns" type="button">自定义表头</button><button class="btn primary" id="portraitFlowGenerate" type="button">生成流水</button></div></div><div class="portrait-flow-query-table-wrap"><table class="table statement-flow-table" id="portraitFlowQueryTable"><thead><tr>${portraitFlowHeaders.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody></tbody></table></div><div class="pagination portrait-flow-query-pager" id="portraitFlowQueryPager"></div></div>`;
    const mask=openPortraitDialog('流水明细',`仅展示与“${row.name}”相关的资金流水`,content);
    mask.classList.add('is-flow-query');
    renderPortraitFlowPage();
    mask.querySelector('#portraitFlowColumns').onclick=event=>window.openBankColumnChooser?.(event.currentTarget,mask.querySelector('#portraitFlowQueryTable'));
    mask.querySelector('#portraitFlowReset').onclick=()=>{
      const old=mask.querySelector('#portraitFlowQueryTable'),fresh=document.createElement('table');
      fresh.className='table statement-flow-table';fresh.id='portraitFlowQueryTable';fresh.innerHTML=`<thead><tr>${portraitFlowHeaders.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody></tbody>`;
      old.replaceWith(fresh);portraitFlowState.page=1;renderPortraitFlowPage();
    };
    mask.querySelector('#portraitFlowGenerate').onclick=()=>{
      const lines=[portraitFlowHeaders,...portraitFlowState.rows.map(flow=>portraitFlowKeys.map(key=>flow[key]??''))].map(line=>line.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\n');
      const link=document.createElement('a'),url=URL.createObjectURL(new Blob(['\ufeff'+lines],{type:'text/csv;charset=utf-8'}));link.href=url;link.download=`${row.name}_流水明细.csv`;link.click();URL.revokeObjectURL(url);
    };
  };
  const portraitHostDocument=()=>{try{if(parent&&parent!==window&&parent.document?.body)return parent.document;}catch(error){}return document;};
  const ensurePortraitHostStyle=doc=>{
    if(doc===document||doc.getElementById('portrait-account-detail-style'))return;
    const link=doc.createElement('link');link.id='portrait-account-detail-style';link.rel='stylesheet';link.href='./assets/css/pages/account-action-details.css?v=20260828-portrait-actions4';doc.head.appendChild(link);
  };
  const counterpartyChartData=(row,year)=>{
    const seed=Math.max(1,rowIndex(row)+11),factor=year===2023?.82:year===2024?.91:1;
    const inWeights=[.066,.073,.061,.081,.069,.078,.075,.086,.079,.091,.094,.147],outWeights=[.071,.064,.077,.068,.082,.073,.085,.075,.088,.079,.092,.126];
    const inflow=inWeights.map((weight,index)=>Math.round(row.inflow*factor*weight*(.92+((seed+index*5)%13)/100)));
    const outflow=outWeights.map((weight,index)=>Math.round(row.outflow*factor*weight*(.91+((seed+index*7)%15)/100)));
    const bubbles=[];
    for(let day=1;day<=31;day+=1){if((day+seed)%3===0)bubbles.push([day,(day+seed)%7,500+((day*seed*17)%7200),'in']);if((day+seed)%4===0)bubbles.push([day,(day+seed+2)%7,450+((day*(seed+19)*13)%8400),'out']);}
    return {inflow,outflow,bubbles,weekdays:['星期一','星期二','星期三','星期四','星期五','星期六','星期日']};
  };
  const counterpartyMonthlySvg=(data,year)=>{
    const width=760,height=244,left=50,right=18,top=28,bottom=36,plotWidth=width-left-right,plotHeight=height-top-bottom,max=Math.max(1,...data.inflow,...data.outflow)*1.12,groupWidth=plotWidth/12,barWidth=Math.min(13,groupWidth*.24);
    const grid=[0,.25,.5,.75,1].map(rate=>{const y=top+plotHeight*(1-rate);return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"/><text x="${left-8}" y="${y+3}" text-anchor="end">${Math.round(max*rate).toLocaleString()}</text>`;}).join('');
    const bars=Array.from({length:12},(_,index)=>{const center=left+groupWidth*(index+.5),a=data.inflow[index]/max*plotHeight,b=data.outflow[index]/max*plotHeight;return `<g><rect class="is-in" data-chart-tooltip="${year}年${String(index+1).padStart(2,'0')}月|流入金额|${data.inflow[index].toLocaleString()}" x="${center-barWidth-1}" y="${top+plotHeight-a}" width="${barWidth}" height="${Math.max(1,a)}" rx="2"/><rect class="is-out" data-chart-tooltip="${year}年${String(index+1).padStart(2,'0')}月|流出金额|${data.outflow[index].toLocaleString()}" x="${center+1}" y="${top+plotHeight-b}" width="${barWidth}" height="${Math.max(1,b)}" rx="2"/><text x="${center}" y="${height-15}" text-anchor="middle">${String(index+1).padStart(2,'0')}月</text></g>`;}).join('');
    return `<svg class="account-action-native-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"><g class="grid">${grid}</g>${bars}<g class="legend"><circle class="is-in" cx="622" cy="12" r="4"/><text x="631" y="15">流入</text><circle class="is-out" cx="682" cy="12" r="4"/><text x="691" y="15">流出</text></g></svg>`;
  };
  const counterpartyBubbleSvg=data=>{
    const width=760,height=238,left=58,right=18,top=26,bottom=28,plotWidth=width-left-right,plotHeight=height-top-bottom;
    const rows=data.weekdays.map((label,index)=>{const y=top+plotHeight*index/6;return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"/><text x="${left-8}" y="${y+3}" text-anchor="end">${label}</text>`;}).join('');
    const ticks=[1,5,10,15,20,25,30].map(day=>{const x=left+(day-1)/30*plotWidth;return `<line x1="${x}" y1="${top}" x2="${x}" y2="${top+plotHeight}"/><text x="${x}" y="${height-9}" text-anchor="middle">${day}</text>`;}).join('');
    const points=data.bubbles.map(item=>{const x=left+(item[0]-1)/30*plotWidth,y=top+item[1]/6*plotHeight,r=Math.max(3,Math.min(12,Math.sqrt(item[2])*.1)),direction=item[3]==='in'?'流入':'流出';return `<circle class="${item[3]==='in'?'is-in':'is-out'}" data-chart-tooltip="${item[0]}日|${direction}金额|${item[2].toLocaleString()}" cx="${x}" cy="${y}" r="${r}"/>`;}).join('');
    return `<svg class="account-action-native-chart is-bubble" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"><g class="grid">${rows}${ticks}</g>${points}<g class="legend"><circle class="is-in" cx="622" cy="12" r="4"/><text x="631" y="15">流入</text><circle class="is-out" cx="682" cy="12" r="4"/><text x="691" y="15">流出</text></g></svg>`;
  };
  const openCounterpartyDrawer=row=>{
    const doc=portraitHostDocument();ensurePortraitHostStyle(doc);
    let mask=doc.getElementById('portraitCounterpartyDetailMask');
    if(!mask){
      mask=doc.createElement('div');mask.id='portraitCounterpartyDetailMask';mask.className='account-action-detail-mask';mask.hidden=true;
      mask.innerHTML='<aside class="account-action-detail-drawer" role="dialog" aria-modal="true"><header><div><b id="portraitCounterpartyDetailTitle">对手方详情</b><span id="portraitCounterpartyDetailSubtitle"></span></div><button type="button" data-counterparty-drawer-close aria-label="关闭">×</button></header><div class="account-action-detail-body" id="portraitCounterpartyDetailBody"></div><footer><button type="button" class="btn" data-counterparty-drawer-close>关闭</button></footer></aside>';
      doc.body.appendChild(mask);
      mask.addEventListener('click',event=>{if(event.target===mask||event.target.closest('[data-counterparty-drawer-close]')){mask.hidden=true;mask.style.display='none';doc.body.classList.remove('account-action-drawer-open');}});
      doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mask.hidden){mask.hidden=true;mask.style.display='none';doc.body.classList.remove('account-action-drawer-open');}});
    }
    const master=counterpartyMasterInfo(row),body=mask.querySelector('#portraitCounterpartyDetailBody');
    mask.querySelector('#portraitCounterpartyDetailTitle').textContent=`对手方详情：${row.name}`;
    mask.querySelector('#portraitCounterpartyDetailSubtitle').textContent=`${displayType(row)} · ${master.group==='—'?'非集团内主体':master.group}`;
    body.innerHTML=`<div class="account-detail-content counterparty-detail-content"><section><h3>收支统计</h3><div class="account-detail-kpis"><div><span>流入金额</span><b class="flow-in">${fmtAmount(row.inflow)}</b></div><div><span>流出金额</span><b class="flow-out">${fmtAmount(row.outflow)}</b></div><div><span>交易总额</span><b>${fmtAmount(row.inflow+row.outflow)}</b></div><div><span>交易笔数</span><b>${row.count}</b></div><div><span>流入流出差额</span><b>${fmtAmount(row.inflow-row.outflow)}</b></div></div></section><section><div class="account-detail-section-head"><h3>月度汇总</h3><label>年度<select data-counterparty-detail-year><option>2023</option><option>2024</option><option selected>2025</option></select></label></div><div class="account-detail-chart" data-counterparty-month-chart></div></section><section><h3>交易日期分析</h3><div class="account-detail-chart is-bubble" data-counterparty-bubble-chart></div></section></div>`;
    mask.hidden=false;mask.style.display='block';doc.body.classList.add('account-action-drawer-open');
    const render=()=>{const year=Number(body.querySelector('[data-counterparty-detail-year]').value)||2025,data=counterpartyChartData(row,year);body.querySelector('[data-counterparty-month-chart]').innerHTML=counterpartyMonthlySvg(data,year);body.querySelector('[data-counterparty-bubble-chart]').innerHTML=counterpartyBubbleSvg(data);};
    const chartTooltip=ensureHostChartTooltip(doc);
    body.onpointerover=event=>{const target=event.target.closest?.('[data-chart-tooltip]');if(target)showHostChartTooltip(chartTooltip,target,event);};
    body.onpointermove=event=>{const target=event.target.closest?.('[data-chart-tooltip]');if(target)positionHostChartTooltip(chartTooltip,event);};
    body.onpointerout=event=>{if(event.target.closest?.('[data-chart-tooltip]'))chartTooltip.hidden=true;};
    body.querySelector('[data-counterparty-detail-year]').addEventListener('change',render);requestAnimationFrame(render);
  };
  const ensureHostChartTooltip=doc=>{
    let tooltip=doc.getElementById('auditChartValueTooltip');
    if(!tooltip){tooltip=doc.createElement('div');tooltip.id='auditChartValueTooltip';tooltip.className='account-chart-tooltip';tooltip.hidden=true;doc.body.appendChild(tooltip);}
    return tooltip;
  };
  const positionHostChartTooltip=(tooltip,event)=>{
    const width=tooltip.offsetWidth,height=tooltip.offsetHeight,view=tooltip.ownerDocument.defaultView;
    tooltip.style.left=`${Math.min(view.innerWidth-width-10,Math.max(10,event.clientX-width/2))}px`;
    tooltip.style.top=`${Math.max(10,event.clientY-height-14)}px`;
  };
  const showHostChartTooltip=(tooltip,target,event)=>{
    const [period,label,value]=String(target.dataset.chartTooltip||'').split('|');
    tooltip.classList.toggle('is-in',label.includes('流入'));tooltip.classList.toggle('is-out',label.includes('流出'));
    tooltip.innerHTML=`<b>${esc(period)}</b><span><i></i><em>${esc(label)}</em><strong>${esc(value)}</strong></span>`;tooltip.hidden=false;positionHostChartTooltip(tooltip,event);
  };
  let portraitTooltipTimer;
  const tianyanchaTooltip=()=>{
    let tooltip=document.getElementById('portraitTianyanchaTooltip');
    if(tooltip)return tooltip;
    tooltip=document.createElement('div');tooltip.id='portraitTianyanchaTooltip';tooltip.className='portrait-tianyancha-tooltip';
    tooltip.innerHTML='点击该图标查询工商信息。如果查询不生效，请点击 <a href="https://www.tianyancha.com/login" target="_blank" rel="noopener">这里</a> 登陆天眼查';document.body.appendChild(tooltip);
    tooltip.addEventListener('mouseenter',()=>window.clearTimeout(portraitTooltipTimer));
    tooltip.addEventListener('mouseleave',()=>{portraitTooltipTimer=window.setTimeout(()=>tooltip.classList.remove('is-visible'),120);});return tooltip;
  };
  const showTianyanchaTooltip=button=>{
    const tooltip=tianyanchaTooltip(),rect=button.getBoundingClientRect();window.clearTimeout(portraitTooltipTimer);tooltip.classList.add('is-visible','is-left');
    tooltip.style.left=`${Math.max(8,rect.left-tooltip.offsetWidth-10)}px`;
    tooltip.style.top=`${Math.min(innerHeight-tooltip.offsetHeight-8,Math.max(8,rect.top+(rect.height-tooltip.offsetHeight)/2))}px`;
  };
  const hideTianyanchaTooltip=()=>{portraitTooltipTimer=window.setTimeout(()=>tianyanchaTooltip().classList.remove('is-visible'),160);};
  const showPortraitActionToast=message=>{
    let toast=document.getElementById('portraitActionToast');if(!toast){toast=document.createElement('div');toast.id='portraitActionToast';toast.className='portrait-action-toast';document.body.appendChild(toast);}
    toast.textContent=message;toast.classList.add('is-visible');window.clearTimeout(showPortraitActionToast.timer);showPortraitActionToast.timer=window.setTimeout(()=>toast.classList.remove('is-visible'),1800);
  };
  const runTianyanchaLookup=(button,row)=>{
    if(button.classList.contains('is-loading'))return;
    hideTianyanchaTooltip();button.classList.add('is-loading');button.setAttribute('aria-busy','true');
    window.setTimeout(()=>{button.classList.remove('is-loading');button.removeAttribute('aria-busy');showPortraitActionToast(`已获取“${row.name}”最新工商信息`);},650);
  };
  let portraitActionTooltip;
  const ensurePortraitActionTooltip=()=>{
    if(portraitActionTooltip)return portraitActionTooltip;
    portraitActionTooltip=document.createElement('div');portraitActionTooltip.className='portrait-action-tooltip';portraitActionTooltip.hidden=true;document.body.appendChild(portraitActionTooltip);return portraitActionTooltip;
  };
  const showPortraitActionTooltip=button=>{
    const tooltip=ensurePortraitActionTooltip(),rect=button.getBoundingClientRect();
    tooltip.textContent=button.dataset.portraitTooltip||button.getAttribute('aria-label')||'';tooltip.hidden=false;
    const width=tooltip.offsetWidth,height=tooltip.offsetHeight;
    tooltip.style.left=`${Math.min(innerWidth-width-8,Math.max(8,rect.left+(rect.width-width)/2))}px`;
    tooltip.style.top=`${Math.max(8,rect.top-height-8)}px`;
  };
  const hidePortraitActionTooltip=()=>{if(portraitActionTooltip)portraitActionTooltip.hidden=true;};
  const bindPortraitRowActions=body=>{
    body.querySelectorAll('.portrait-row-action.is-tianyancha').forEach(button=>{
      button.addEventListener('mouseenter',()=>showTianyanchaTooltip(button));button.addEventListener('mouseleave',hideTianyanchaTooltip);
      button.addEventListener('focus',()=>showTianyanchaTooltip(button));button.addEventListener('blur',hideTianyanchaTooltip);
    });
    body.querySelectorAll('.portrait-row-action[data-portrait-tooltip]').forEach(button=>{
      button.addEventListener('mouseenter',()=>showPortraitActionTooltip(button));
      button.addEventListener('mouseleave',hidePortraitActionTooltip);
      button.addEventListener('focus',()=>showPortraitActionTooltip(button));
      button.addEventListener('blur',hidePortraitActionTooltip);
    });
    body.onclick=event=>{
      const button=event.target.closest('[data-portrait-action]');
      if(!button)return;
      hidePortraitActionTooltip();
      const name=button.closest('[data-row-name]')?.dataset.rowName;
      const row=rows.find(item=>item.name===name);
      if(!row)return;
      const action=button.dataset.portraitAction;
      if(action==='tianyancha')runTianyanchaLookup(button,row);
      if(action==='detail')openCounterpartyDrawer(row);
      if(action==='flows')openPortraitFlowDialog(row);
      if(action==='remark'){
        const mask=openPortraitDialog('备注说明',row.name,`<textarea class="portrait-remark-editor" id="portraitRemarkEditor" placeholder="填写对手方备注说明">${esc(portraitRemarks[row.name]||'')}</textarea>`,'<button class="btn" type="button" data-dialog-close>取消</button><button class="btn primary" id="portraitRemarkSave" type="button">保存备注</button>');
        mask.querySelector('#portraitRemarkSave').onclick=()=>{portraitRemarks[row.name]=mask.querySelector('#portraitRemarkEditor').value.trim();closePortraitDialog(mask);renderTable();};
      }
    };
  };
  function mini(row,index){const max=Math.max(row.inflow,row.outflow,1);return `<div class="portrait-mini">${Array.from({length:12},(_,m)=>{const a=Math.max(2,(row.inflow/max)*(45+(m*13+index*9)%50)),b=Math.max(2,(row.outflow/max)*(42+(m*17+index*7)%54));return `<span title="${m+1}月"><i class="is-in" style="height:${a}%"></i><i class="is-out" style="height:${b}%"></i></span>`}).join('')}</div>`}
  function renderTableHead(){
    const head=document.getElementById('portraitCounterpartyHead');
    if(!head)return;
    const icon=yearExpanded?'«':'»';
    const yearHeads=yearExpanded?years.map(y=>`<th colspan="6" class="portrait-year-head">${window.auditFiscalYearLabel?.(y)||y}</th>`).join(''):'';
    const yearSubs=yearExpanded?years.map(()=>`<th class="audit-period-metric portrait-year-detail-head no-sort">流入金额</th><th class="audit-period-metric portrait-year-detail-head no-sort">销项税价合计</th><th class="audit-period-metric portrait-year-detail-head no-sort">流出金额</th><th class="audit-period-metric portrait-year-detail-head no-sort">进项税价合计</th><th class="audit-period-metric portrait-year-detail-head no-sort">交易总额</th><th class="audit-period-metric portrait-year-detail-head no-sort">交易笔数</th>`).join(''):'';
    if(tableView==='business'){
      head.innerHTML=`<tr class="portrait-year-group-head"><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-1">对手方名称</th><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-2 no-filter" data-sort="blacklist">黑名单</th><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-3">对手方类型</th><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-4">行业</th><th colspan="6" class="portrait-group-toggle-cell"><button class="portrait-group-toggle" id="portraitYearToggle" type="button"><span>合计</span><i>${icon}</i></button></th>${yearHeads}<th rowspan="2">经营状态</th><th rowspan="2">成立日期</th><th rowspan="2">经营开始时间</th><th rowspan="2">经营结束时间</th><th rowspan="2">营业期限</th><th rowspan="2">注册资本</th><th rowspan="2">币种</th><th rowspan="2">经营范围</th><th rowspan="2">注册地址</th><th rowspan="2">企业联系方式</th><th rowspan="2">董监高</th></tr><tr class="portrait-year-sub-head"><th>流入金额</th><th class="portrait-vat-total-head">销项税价合计</th><th>流出金额</th><th class="portrait-vat-total-head">进项税价合计</th><th>交易总额</th><th>交易笔数</th>${yearSubs}</tr>`;
    }else{
      head.innerHTML=`<tr class="portrait-year-group-head"><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-1" data-sort="name">对手方名称</th><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-2 no-filter" data-sort="blacklist">黑名单</th><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-3">月度分布</th><th rowspan="2" class="portrait-fixed-col portrait-fixed-col-4" data-sort="type">对手方类型</th><th colspan="6" class="portrait-group-toggle-cell"><button class="portrait-group-toggle" id="portraitYearToggle" type="button"><span>合计</span><i>${icon}</i></button></th>${yearHeads}<th rowspan="2" class="no-filter" data-sort="salesCategory">销售类别</th><th rowspan="2" class="no-filter" data-sort="purchaseCategory">采购类别</th><th rowspan="2" class="no-filter" data-sort="position">职位</th><th rowspan="2" class="no-filter" data-sort="customerApprovalDate">客户批准日期</th><th rowspan="2" class="no-filter" data-sort="customerInvalidDate">客户无效日期</th><th rowspan="2" class="no-filter" data-sort="supplierApprovalDate">供应商批准日期</th><th rowspan="2" class="no-filter" data-sort="supplierInvalidDate">供应商无效日期</th><th rowspan="2" class="no-filter" data-sort="employeeHireDate">员工入职日期</th><th rowspan="2" class="no-filter" data-sort="employeeLeaveDate">员工离职日期</th><th rowspan="2" class="no-filter" data-sort="group">所属集团</th><th rowspan="2">备注说明</th><th rowspan="2" class="no-sort portrait-operation-head portrait-operation-sticky">操作</th></tr><tr class="portrait-year-sub-head"><th data-sort="inflow">流入金额</th><th class="portrait-vat-total-head" data-sort="salesVat">销项税价合计</th><th data-sort="outflow">流出金额</th><th class="portrait-vat-total-head" data-sort="purchaseVat">进项税价合计</th><th data-sort="total">交易总额</th><th data-sort="count">交易笔数</th>${yearSubs}</tr>`;
    }
    document.getElementById('portraitYearToggle')?.addEventListener('click',()=>{yearExpanded=!yearExpanded;renderTable();});
  }
  function rowSortValue(row,key){
    if(key==='total')return row.inflow+row.outflow;
    if(key==='type')return displayType(row);
    if(key==='blacklist')return blacklistHit(row)?1:0;
    if(['salesCategory','purchaseCategory','position','customerApprovalDate','customerInvalidDate','supplierApprovalDate','supplierInvalidDate','employeeHireDate','employeeLeaveDate','group'].includes(key))return counterpartyMasterInfo(row)[key];
    return row[key]??'';
  }
  function refreshTableTools(){
    const table=document.getElementById('portraitCounterpartyTable');
    if(!table)return;
    delete table.dataset.baEnhanced;
    table.querySelectorAll('.ba-th-tools').forEach(el=>el.remove());
    window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));
  }
  function renderFilterCards(){
    const wrap=document.getElementById('portraitCounterpartyFilters');
    if(!wrap)return;
    const total=Math.max(rows.length,1);
    wrap.innerHTML=filterDefs.map(def=>{
      const count=filterRowsFor(def.key).length;
      const pct=count/total*100;
      return `<button class="portrait-filter-card ${counterpartyFilter===def.key?'is-active':''}" data-filter="${def.key}" type="button">
        <span>${def.label}</span>
        <strong>${pct.toFixed(1)}%</strong>
        <i style="--pct:${pct.toFixed(1)}%"></i>
      </button>`;
    }).join('');
    syncKpiToggle('portrait');
  }
  function syncKpiToggle(scope){
    const isRelation=scope==='relation',isPersonal=scope==='personal';
    const hidden=isPersonal?personalKpisHidden:isRelation?relationKpisHidden:portraitKpisHidden;
    const strip=document.getElementById(isPersonal?'personalFilterStrip':isRelation?'relationFilterStrip':'portraitFilterStrip');
    const btn=document.getElementById(isPersonal?'personalKpiToggle':isRelation?'relationKpiToggle':'portraitKpiToggle');
    if(strip)strip.classList.toggle('is-kpi-hidden',hidden);
    if(btn){
      btn.classList.toggle('is-collapsed',hidden);
      btn.setAttribute('aria-label',hidden?'显示KPI行':'隐藏KPI行');
      btn.setAttribute('title',hidden?'显示KPI行':'隐藏KPI行');
    }
  }
  function filterRowsFor(key){
    const prev=counterpartyFilter;
    counterpartyFilter=key;
    const list=filterRows(rows);
    counterpartyFilter=prev;
    return list;
  }
  function syncPortraitColumns(){
    const table=document.getElementById('portraitCounterpartyTable');
    if(!table)return;
    let colgroup=table.querySelector('colgroup');
    if(!colgroup){colgroup=document.createElement('colgroup');table.insertBefore(colgroup,table.firstChild);}
    const leading=tableView==='business'
      ? '<col class="portrait-name-col"><col class="portrait-small-col"><col class="portrait-type-col"><col class="portrait-industry-col">'
      : '<col class="portrait-name-col"><col class="portrait-small-col"><col class="portrait-monthly-col"><col class="portrait-type-col">';
    const metric='<col class="portrait-metric-col"><col class="portrait-metric-col portrait-vat-total-col"><col class="portrait-metric-col"><col class="portrait-metric-col portrait-vat-total-col"><col class="portrait-metric-col"><col class="portrait-metric-col">';
    const yearMetric=yearExpanded?'<col class="portrait-year-metric-col">'.repeat(years.length*6):'';
    const trailing=tableView==='business'
      ? '<col class="portrait-flex-col">'.repeat(11)
      : '<col class="portrait-flex-col">'.repeat(11)+'<col class="portrait-operation-col">';
    colgroup.innerHTML=leading+metric+yearMetric+trailing;
  }
  function renderTable(){
    renderFilterCards();
    let list=filterRows([...rows]);
    if(sortKey)list.sort((a,b)=>{const av=rowSortValue(a,sortKey),bv=rowSortValue(b,sortKey);return (typeof av==='number'?av-bv:String(av).localeCompare(String(bv),'zh-CN'))*sortDir});
    const total=list.length,pages=Math.max(1,Math.ceil(total/pageSize));
    if(page>pages)page=pages;
    const start=(page-1)*pageSize,view=list.slice(start,start+pageSize);
    const body=document.getElementById('portraitCounterpartyBody');
    if(!body)return;
    const tableWrap=document.getElementById('portraitCounterpartyTable')?.closest('.portrait-table-wrap');
    tableWrap?.classList.toggle('is-year-expanded',yearExpanded);
    tableWrap?.classList.toggle('is-business-view',tableView==='business');
    syncPortraitColumns();
    renderTableHead();
    body.innerHTML=view.map((r,i)=>{
      const yearsCells=yearExpanded?years.map(y=>groupCells(r,y)).join(''):'';
      const shownType=displayType(r),shownTypeClass=typeClass(shownType);
      if(tableView==='business'){
        const bi=businessInfo(r);
        return `<tr><td class="portrait-fixed-col portrait-fixed-col-1">${esc(r.name)}</td>${blacklistCell(r,'portrait-fixed-col portrait-fixed-col-2')}<td class="portrait-type-cell portrait-fixed-col portrait-fixed-col-3 ${shownTypeClass}">${esc(shownType)}</td><td class="portrait-fixed-col portrait-fixed-col-4">${esc(r.industry)}</td>${groupCells(r)}${yearsCells}<td>${bi.status}</td><td>${bi.founded}</td><td>${bi.start}</td><td>${bi.end}</td><td>${bi.term}</td><td class="is-num">${bi.capital}</td><td>${bi.currency}</td><td>${esc(bi.scope)}</td><td>${esc(bi.address)}</td><td>${bi.contact}</td><td>${esc(bi.people)}</td></tr>`;
      }
      const master=counterpartyMasterInfo(r);
      return `<tr><td class="portrait-fixed-col portrait-fixed-col-1">${esc(r.name)}</td>${blacklistCell(r,'portrait-fixed-col portrait-fixed-col-2')}<td class="portrait-fixed-col portrait-fixed-col-3">${mini(r,start+i)}</td><td class="portrait-type-cell portrait-fixed-col portrait-fixed-col-4 ${shownTypeClass}">${esc(shownType)}</td>${groupCells(r)}${yearsCells}<td>${esc(master.salesCategory)}</td><td>${esc(master.purchaseCategory)}</td><td>${esc(master.position)}</td><td>${master.customerApprovalDate}</td><td>${master.customerInvalidDate}</td><td>${master.supplierApprovalDate}</td><td>${master.supplierInvalidDate}</td><td>${master.employeeHireDate}</td><td>${master.employeeLeaveDate}</td><td>${esc(master.group)}</td><td class="portrait-remark-cell">${master.remark?esc(master.remark):'<span>—</span>'}</td><td class="portrait-operation-cell portrait-operation-sticky">${portraitActionButtons(r)}</td></tr>`;
    }).join('');
    syncCounterpartyTypeCells(body);
    bindPortraitRowActions(body);
    document.getElementById('portraitTableCount').textContent=`共 ${total} 家对手方，当前展示 ${total?start+1:0}-${Math.min(start+pageSize,total)} / ${total}`;
    document.querySelectorAll('#portraitCounterpartyTable th[data-sort]').forEach(th=>{th.classList.toggle('is-asc',sortKey===th.dataset.sort&&sortDir===1);th.classList.toggle('is-desc',sortKey===th.dataset.sort&&sortDir===-1);th.onclick=()=>{if(sortKey===th.dataset.sort)sortDir*=-1;else{sortKey=th.dataset.sort;sortDir=1;}renderTable();};});
    refreshTableTools();
    const pager=document.getElementById('portraitPager');
    if(pager)window.renderAuditPager?.(pager,{total,page,pageSize,onPage:next=>{page=next;renderTable();},onPageSize:size=>{pageSize=size;page=1;renderTable();}});
  }
  function relationRowsForCurrent(){
    const list=relationFilterRows(relationBaseRows());
    const key=relationSortKey||relationMode;
    list.sort((a,b)=>{const av=rowSortValue(a,key),bv=rowSortValue(b,key);return (typeof av==='number'?av-bv:String(av).localeCompare(String(bv),'zh-CN'))*(relationSortKey?relationSortDir:-1);});
    return list;
  }
  function renderRelationCards(){
    const wrap=document.getElementById('relationTypeFilters');
    if(!wrap)return;
    const base=relationBaseRows();
    const total=Math.max(base.reduce((sum,row)=>sum+metricValue(row,relationMode),0),1);
    wrap.innerHTML=relationDefs.map(def=>{
      const list=relationFilterRows(base,def.key);
      const amount=list.reduce((sum,row)=>sum+metricValue(row,relationMode),0);
      const pct=def.key==='related'?100:amount/total*100;
      return `<button class="portrait-filter-card ${relationFilter===def.key?'is-active':''}" data-relation-filter="${def.key}" type="button">
        <span>${def.label}</span>
        <strong>${pct.toFixed(1)}%</strong>
        <i style="--pct:${Math.min(100,pct).toFixed(1)}%"></i>
      </button>`;
    }).join('');
    syncKpiToggle('relation');
  }
  function renderRelationChart(){
    const el=document.getElementById('relationMetricChart');
    if(!el||!window.echarts)return;
    const chartRows=relationFilterRows(relationBaseRows());
    const months=Array.from({length:12},(_,i)=>`${String(i+1).padStart(2,'0')}月`);
    const inflowColors={2023:'#b8d1f0',2024:'#7fa6d6',2025:'#3f7fbd'};
    const outflowColors={2023:'#f1bed0',2024:'#d98aa4',2025:'#c4577f'};
    const seriesFor=(key,label,colorMap)=>years.map(year=>({
      name:`${year}${label}`,
      type:'bar',
      barMaxWidth:10,
      barGap:key==='outflow'?'18%':'8%',
      barCategoryGap:'28%',
      itemStyle:{color:colorMap[year],borderRadius:[3,3,0,0]},
      data:months.map((_,monthIndex)=>+chartRows.reduce((sum,row)=>sum+monthlyYearMetricValue(row,monthIndex,key,year),0).toFixed(1))
    }));
    const series=relationMode==='total'
      ? [...seriesFor('inflow','流入',inflowColors),...seriesFor('outflow','流出',outflowColors)]
      : relationMode==='inflow'
        ? seriesFor('inflow','流入',inflowColors)
        : seriesFor('outflow','流出',outflowColors);
    const title=document.getElementById('relationChartTitle');
    if(title)title.textContent=`${relationTypeName(relationFilter)}月度分年${metricLabel(relationMode)}`;
    charts.relation=echarts.getInstanceByDom(el)||echarts.init(el);
    charts.relation.setOption({
      tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:items=>{
        if(!items?.length)return '';
        return `${items[0].axisValue}<br/>`+items.map(p=>`${p.marker}${p.seriesName}：${fmtK(p.value)}`).join('<br/>');
      }},
      legend:{top:0,right:6,itemWidth:9,itemHeight:6,textStyle:{fontSize:10,color:'#64748b'},selectedMode:false},
      grid:{left:52,right:12,top:28,bottom:34},
      xAxis:{type:'category',data:months,axisLabel:{fontSize:10,color:'#64748b'},axisLine:{lineStyle:{color:'#dbe5f0'}},axisTick:{alignWithLabel:true}},
      yAxis:{type:'value',axisLabel:{fontSize:10,color:'#64748b',formatter:v=>Number(v).toLocaleString()},splitLine:{lineStyle:{color:'#edf2f7'}}},
      series
    },true);
  }
  function renderRelationTop20(){
    const wrap=document.getElementById('relationTop20');
    if(!wrap)return;
    const list=relationFilterRows(relationBaseRows()).sort((a,b)=>metricValue(b,relationMode)-metricValue(a,relationMode)).slice(0,20);
    const max=Math.max(...list.map(r=>metricValue(r,relationMode)),1);
    document.getElementById('relationTopMetric').textContent=metricLabel(relationMode);
    document.getElementById('relationTopTitle').textContent=`${relationTypeName(relationFilter)} TOP20`;
    wrap.innerHTML=list.map((r,i)=>{
      const amount=metricValue(r,relationMode),pct=Math.max(3,amount/max*100);
      return `<div class="relation-top-row"><em>${String(i+1).padStart(2,'0')}</em><span>${esc(r.name)}</span><b>${fmtK(amount)}</b><i style="width:${pct}%"></i></div>`;
    }).join('')||'<div class="relation-empty">当前筛选下暂无关联方数据</div>';
  }
  function renderRelationHead(){
    const head=document.getElementById('relationCounterpartyHead');
    if(!head)return;
    const icon=relationYearExpanded?'«':'»';
    const yearHeads=relationYearExpanded?years.map(y=>`<th colspan="6" class="portrait-year-head">${window.auditFiscalYearLabel?.(y)||y}</th>`).join(''):'';
    const yearSubs=relationYearExpanded?years.map(()=>`<th class="audit-period-metric">流入金额</th><th class="audit-period-metric">销项税价合计</th><th class="audit-period-metric">流出金额</th><th class="audit-period-metric">进项税价合计</th><th class="audit-period-metric">交易总额</th><th class="audit-period-metric">交易笔数</th>`).join(''):'';
    if(relationTableView==='business'){
      head.innerHTML=`<tr class="portrait-year-group-head"><th rowspan="2" data-sort="name">对手方名称</th><th rowspan="2" data-sort="blacklist">黑名单</th><th rowspan="2" data-sort="type">对手方类型</th><th rowspan="2" data-sort="industry">行业</th><th colspan="6" class="portrait-group-toggle-cell"><button class="portrait-group-toggle" id="relationYearToggle" type="button"><span>合计</span><i>${icon}</i></button></th>${yearHeads}<th rowspan="2">经营状态</th><th rowspan="2">成立日期</th><th rowspan="2">经营开始时间</th><th rowspan="2">经营结束时间</th><th rowspan="2">营业期限</th><th rowspan="2">注册资本</th><th rowspan="2">币种</th><th rowspan="2">经营范围</th><th rowspan="2">注册地址</th><th rowspan="2">企业联系方式</th><th rowspan="2">董监高</th></tr><tr class="portrait-year-sub-head"><th data-sort="inflow">流入金额</th><th data-sort="salesVat">销项税价合计</th><th data-sort="outflow">流出金额</th><th data-sort="purchaseVat">进项税价合计</th><th data-sort="total">交易总额</th><th data-sort="count">交易笔数</th>${yearSubs}</tr>`;
    }else{
      head.innerHTML=`<tr class="portrait-year-group-head"><th rowspan="2" data-sort="name">对手方名称</th><th rowspan="2" data-sort="blacklist">黑名单</th><th rowspan="2" class="no-sort">月度分布</th><th rowspan="2" data-sort="type">对手方类型</th><th colspan="6" class="portrait-group-toggle-cell"><button class="portrait-group-toggle" id="relationYearToggle" type="button"><span>合计</span><i>${icon}</i></button></th>${yearHeads}<th rowspan="2" data-sort="sameRatio">同进同出比例（%）</th><th rowspan="2" data-sort="industry">行业</th><th rowspan="2" data-sort="duration">经营时长</th><th rowspan="2">董监高</th></tr><tr class="portrait-year-sub-head"><th data-sort="inflow">流入金额</th><th data-sort="salesVat">销项税价合计</th><th data-sort="outflow">流出金额</th><th data-sort="purchaseVat">进项税价合计</th><th data-sort="total">交易总额</th><th data-sort="count">交易笔数</th>${yearSubs}</tr>`;
    }
    document.getElementById('relationYearToggle')?.addEventListener('click',()=>{relationYearExpanded=!relationYearExpanded;renderRelationTable();});
  }
  function renderRelationTable(){
    renderRelationCards();
    const body=document.getElementById('relationCounterpartyBody');
    if(!body)return;
    const list=relationRowsForCurrent(),total=list.length,pages=Math.max(1,Math.ceil(total/relationPageSize));
    if(relationPage>pages)relationPage=pages;
    const start=(relationPage-1)*relationPageSize,view=list.slice(start,start+relationPageSize);
    document.querySelector('.relation-table-wrap')?.classList.toggle('is-year-expanded',relationYearExpanded);
    renderRelationHead();
    body.innerHTML=view.map((r,i)=>{
      const yearsCells=relationYearExpanded?years.map(y=>groupCells(r,y)).join(''):'';
      const shownType=relationDisplayType(r),shownTypeClass=typeClass(shownType);
      if(relationTableView==='business'){
        const bi=businessInfo(r);
        return `<tr><td>${esc(r.name)}</td>${blacklistCell(r)}<td class="portrait-type-cell ${shownTypeClass}">${esc(shownType)}</td><td>${esc(r.industry)}</td>${groupCells(r)}${yearsCells}<td>${bi.status}</td><td>${bi.founded}</td><td>${bi.start}</td><td>${bi.end}</td><td>${bi.term}</td><td class="is-num">${bi.capital}</td><td>${bi.currency}</td><td>${esc(bi.scope)}</td><td>${esc(bi.address)}</td><td>${bi.contact}</td><td>${esc(bi.people)}</td></tr>`;
      }
      return `<tr><td>${esc(r.name)}</td>${blacklistCell(r)}<td>${mini(r,start+i)}</td><td class="portrait-type-cell ${shownTypeClass}">${esc(shownType)}</td>${groupCells(r)}${yearsCells}<td>${r.sameRatio.toFixed(1)}</td><td>${esc(r.industry)}</td><td>${esc(r.duration)}</td><td>${esc(r.people)}</td></tr>`;
    }).join('');
    document.getElementById('relationTableCount').textContent=`共 ${total} 家关联方，当前展示 ${total?start+1:0}-${Math.min(start+relationPageSize,total)} / ${total}`;
    document.querySelectorAll('#relationCounterpartyTable th[data-sort]').forEach(th=>{
      th.classList.toggle('is-asc',relationSortKey===th.dataset.sort&&relationSortDir===1);
      th.classList.toggle('is-desc',relationSortKey===th.dataset.sort&&relationSortDir===-1);
      th.onclick=()=>{if(relationSortKey===th.dataset.sort)relationSortDir*=-1;else{relationSortKey=th.dataset.sort;relationSortDir=1;}renderRelationTable();};
    });
    const table=document.getElementById('relationCounterpartyTable');
    if(table){delete table.dataset.baEnhanced;table.querySelectorAll('.ba-th-tools').forEach(el=>el.remove());window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));}
    const pager=document.getElementById('relationPager');
    if(pager)window.renderAuditPager?.(pager,{total,page:relationPage,pageSize:relationPageSize,onPage:next=>{relationPage=next;renderRelationTable();},onPageSize:size=>{relationPageSize=size;relationPage=1;renderRelationTable();}});
    renderRelationTop20();
  }
  function renderRelationAll(){renderRelationCards();renderRelationChart();renderRelationTop20();renderRelationTable();}
  function personalRowsForCurrent(){
    const list=personalFilterRows(personalBaseRows());
    const key=personalSortKey||personalMode;
    list.sort((a,b)=>{const av=rowSortValue(a,key),bv=rowSortValue(b,key);return (typeof av==='number'?av-bv:String(av).localeCompare(String(bv),'zh-CN'))*(personalSortKey?personalSortDir:-1);});
    return list;
  }
  function renderPersonalCards(){
    const wrap=document.getElementById('personalTypeFilters');
    if(!wrap)return;
    const base=personalBaseRows();
    const total=Math.max(base.reduce((sum,row)=>sum+metricValue(row,personalMode),0),1);
    wrap.innerHTML=personalDefs.map(def=>{
      const list=personalFilterRows(base,def.key);
      const amount=list.reduce((sum,row)=>sum+metricValue(row,personalMode),0);
      const pct=def.key==='all'?100:amount/total*100;
      return `<button class="portrait-filter-card ${personalFilter===def.key?'is-active':''}" data-personal-filter="${def.key}" type="button">
        <span>${def.label}</span>
        <strong>${pct.toFixed(1)}%</strong>
        <i style="--pct:${Math.min(100,pct).toFixed(1)}%"></i>
      </button>`;
    }).join('');
    syncKpiToggle('personal');
  }
  function renderPersonalChart(){
    const el=document.getElementById('personalMetricChart');
    if(!el||!window.echarts)return;
    const chartRows=personalFilterRows(personalBaseRows());
    const months=Array.from({length:12},(_,i)=>`${String(i+1).padStart(2,'0')}月`);
    const inflowColors={2023:'#b8d1f0',2024:'#7fa6d6',2025:'#3f7fbd'};
    const outflowColors={2023:'#f1bed0',2024:'#d98aa4',2025:'#c4577f'};
    const seriesFor=(key,label,colorMap)=>years.map(year=>({
      name:`${year}${label}`,
      type:'bar',
      barMaxWidth:10,
      barGap:key==='outflow'?'18%':'8%',
      barCategoryGap:'28%',
      itemStyle:{color:colorMap[year],borderRadius:[3,3,0,0]},
      data:months.map((_,monthIndex)=>+chartRows.reduce((sum,row)=>sum+monthlyYearMetricValue(row,monthIndex,key,year),0).toFixed(1))
    }));
    const series=personalMode==='total'
      ? [...seriesFor('inflow','流入',inflowColors),...seriesFor('outflow','流出',outflowColors)]
      : personalMode==='inflow'
        ? seriesFor('inflow','流入',inflowColors)
        : seriesFor('outflow','流出',outflowColors);
    const title=document.getElementById('personalChartTitle');
    if(title)title.textContent=`${(personalDefs.find(x=>x.key===personalFilter)||personalDefs[0]).label}月度分年${metricLabel(personalMode)}`;
    charts.personal=echarts.getInstanceByDom(el)||echarts.init(el);
    charts.personal.setOption({
      tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:items=>{
        if(!items?.length)return '';
        return `${items[0].axisValue}<br/>`+items.map(p=>`${p.marker}${p.seriesName}：${fmtK(p.value)}`).join('<br/>');
      }},
      legend:{top:0,right:6,itemWidth:9,itemHeight:6,textStyle:{fontSize:10,color:'#64748b'},selectedMode:false},
      grid:{left:52,right:12,top:28,bottom:34},
      xAxis:{type:'category',data:months,axisLabel:{fontSize:10,color:'#64748b'},axisLine:{lineStyle:{color:'#dbe5f0'}},axisTick:{alignWithLabel:true}},
      yAxis:{type:'value',axisLabel:{fontSize:10,color:'#64748b',formatter:v=>Number(v).toLocaleString()},splitLine:{lineStyle:{color:'#edf2f7'}}},
      series
    },true);
  }
  function renderPersonalTop20(){
    const wrap=document.getElementById('personalTop20');
    if(!wrap)return;
    const list=personalFilterRows(personalBaseRows()).sort((a,b)=>metricValue(b,personalMode)-metricValue(a,personalMode)).slice(0,20);
    const max=Math.max(...list.map(r=>metricValue(r,personalMode)),1);
    document.getElementById('personalTopMetric').textContent=metricLabel(personalMode);
    document.getElementById('personalTopTitle').textContent=`${(personalDefs.find(x=>x.key===personalFilter)||personalDefs[0]).label} TOP20`;
    wrap.innerHTML=list.map((r,i)=>{
      const amount=metricValue(r,personalMode),pct=Math.max(3,amount/max*100);
      return `<div class="relation-top-row"><em>${String(i+1).padStart(2,'0')}</em><span>${esc(r.name)}</span><b>${fmtK(amount)}</b><i style="width:${pct}%"></i></div>`;
    }).join('')||'<div class="relation-empty">当前筛选下暂无个人交易数据</div>';
  }
  function renderPersonalHead(){
    const head=document.getElementById('personalCounterpartyHead');
    if(!head)return;
    const icon=personalYearExpanded?'«':'»';
    const yearHeads=personalYearExpanded?years.map(y=>`<th colspan="6" class="portrait-year-head">${window.auditFiscalYearLabel?.(y)||y}</th>`).join(''):'';
    const yearSubs=personalYearExpanded?years.map(()=>`<th class="audit-period-metric">流入金额</th><th class="audit-period-metric">销项税价合计</th><th class="audit-period-metric">流出金额</th><th class="audit-period-metric">进项税价合计</th><th class="audit-period-metric">交易总额</th><th class="audit-period-metric">交易笔数</th>`).join(''):'';
    if(personalTableView==='business'){
      head.innerHTML=`<tr class="portrait-year-group-head"><th rowspan="2" data-sort="name">个人名称</th><th rowspan="2" data-sort="type">人员类型</th><th rowspan="2" data-sort="industry">关系说明</th><th colspan="6" class="portrait-group-toggle-cell"><button class="portrait-group-toggle" id="personalYearToggle" type="button"><span>合计</span><i>${icon}</i></button></th>${yearHeads}<th rowspan="2">状态</th><th rowspan="2">首次交易日期</th><th rowspan="2">最近交易日期</th><th rowspan="2">交易期间</th><th rowspan="2">备注说明</th></tr><tr class="portrait-year-sub-head"><th data-sort="inflow">流入金额</th><th data-sort="salesVat">销项税价合计</th><th data-sort="outflow">流出金额</th><th data-sort="purchaseVat">进项税价合计</th><th data-sort="total">交易总额</th><th data-sort="count">交易笔数</th>${yearSubs}</tr>`;
    }else{
      head.innerHTML=`<tr class="portrait-year-group-head"><th rowspan="2" data-sort="name">个人名称</th><th rowspan="2" class="no-sort">月度分布</th><th rowspan="2" data-sort="type">人员类型</th><th colspan="6" class="portrait-group-toggle-cell"><button class="portrait-group-toggle" id="personalYearToggle" type="button"><span>合计</span><i>${icon}</i></button></th>${yearHeads}<th rowspan="2" data-sort="sameRatio">同进同出比例（%）</th><th rowspan="2" data-sort="industry">关系说明</th><th rowspan="2" data-sort="duration">交易期间</th><th rowspan="2">备注说明</th></tr><tr class="portrait-year-sub-head"><th data-sort="inflow">流入金额</th><th data-sort="salesVat">销项税价合计</th><th data-sort="outflow">流出金额</th><th data-sort="purchaseVat">进项税价合计</th><th data-sort="total">交易总额</th><th data-sort="count">交易笔数</th>${yearSubs}</tr>`;
    }
    document.getElementById('personalYearToggle')?.addEventListener('click',()=>{personalYearExpanded=!personalYearExpanded;renderPersonalTable();});
  }
  function renderPersonalTable(){
    renderPersonalCards();
    const body=document.getElementById('personalCounterpartyBody');
    if(!body)return;
    const list=personalRowsForCurrent(),total=list.length,pages=Math.max(1,Math.ceil(total/personalPageSize));
    if(personalPage>pages)personalPage=pages;
    const start=(personalPage-1)*personalPageSize,view=list.slice(start,start+personalPageSize);
    document.querySelector('.personal-table-wrap')?.classList.toggle('is-year-expanded',personalYearExpanded);
    renderPersonalHead();
    body.innerHTML=view.map((r,i)=>{
      const yearsCells=personalYearExpanded?years.map(y=>groupCells(r,y)).join(''):'';
      const shownType=personalType(r);
      if(personalTableView==='business'){
        const bi=businessInfo(r);
        return `<tr><td>${esc(r.name)}</td><td>${esc(shownType)}</td><td>${esc(shownType==='员工'?'员工往来':'其他个人往来')}</td>${groupCells(r)}${yearsCells}<td>${shownType==='员工'?'在职':'待确认'}</td><td>${bi.founded}</td><td>2025-12-${String(10+(i%18)).padStart(2,'0')}</td><td>${esc(r.duration)}</td><td><input class="ba-note-input" value="${shownType==='员工'?'备用金、报销及薪酬相关往来':'个人往来需补充说明'}"/></td></tr>`;
      }
      return `<tr><td>${esc(r.name)}</td><td>${mini(r,start+i)}</td><td>${esc(shownType)}</td>${groupCells(r)}${yearsCells}<td>${r.sameRatio.toFixed(1)}</td><td>${shownType==='员工'?'员工往来':'其他个人往来'}</td><td>${esc(r.duration)}</td><td><input class="ba-note-input" value="${shownType==='员工'?'备用金、报销及薪酬相关往来':'个人往来需补充说明'}"/></td></tr>`;
    }).join('');
    document.getElementById('personalTableCount').textContent=`共 ${total} 个个人对象，当前展示 ${total?start+1:0}-${Math.min(start+personalPageSize,total)} / ${total}`;
    document.querySelectorAll('#personalCounterpartyTable th[data-sort]').forEach(th=>{
      th.classList.toggle('is-asc',personalSortKey===th.dataset.sort&&personalSortDir===1);
      th.classList.toggle('is-desc',personalSortKey===th.dataset.sort&&personalSortDir===-1);
      th.onclick=()=>{if(personalSortKey===th.dataset.sort)personalSortDir*=-1;else{personalSortKey=th.dataset.sort;personalSortDir=1;}renderPersonalTable();};
    });
    const table=document.getElementById('personalCounterpartyTable');
    if(table){delete table.dataset.baEnhanced;table.querySelectorAll('.ba-th-tools').forEach(el=>el.remove());window.dispatchEvent(new CustomEvent('bank-analysis:tab-change'));}
    const pager=document.getElementById('personalPager');
    if(pager)window.renderAuditPager?.(pager,{total,page:personalPage,pageSize:personalPageSize,onPage:next=>{personalPage=next;renderPersonalTable();},onPageSize:size=>{personalPageSize=size;personalPage=1;renderPersonalTable();}});
    renderPersonalTop20();
  }
  function renderPersonalAll(){renderPersonalCards();renderPersonalChart();renderPersonalTop20();renderPersonalTable();}
  function featureAmount(row){return row.inflow+row.outflow;}
  function featureRows(){
    if(featureView==='customer')return rows.filter(row=>row.type==='客户');
    if(featureView==='supplier')return rows.filter(row=>row.type==='供应商');
    if(featureView==='nonbusiness')return rows.filter(row=>row.type==='其他'||isEmployee(row)||isPersonal(row));
    if(featureView==='related')return rows.filter(isRelated);
    return rows;
  }
  function updateFeatureScrollbar(){
    const wrap=document.getElementById('portraitFeatureScroll');
    const shell=wrap?.closest('.portrait-feature-scroll-shell');
    const rail=shell?.querySelector('.portrait-feature-scroll-rail');
    const thumb=document.getElementById('portraitFeatureScrollThumb');
    if(!wrap||!shell||!rail||!thumb)return;
    const scrollable=wrap.scrollHeight>wrap.clientHeight+1;
    shell.classList.toggle('is-scrollable',scrollable);
    if(!scrollable)return;
    const railHeight=rail.clientHeight;
    const thumbHeight=Math.max(22,Math.round(railHeight*wrap.clientHeight/wrap.scrollHeight));
    const maxTop=Math.max(0,railHeight-thumbHeight);
    const maxScroll=Math.max(1,wrap.scrollHeight-wrap.clientHeight);
    thumb.style.height=`${thumbHeight}px`;
    thumb.style.transform=`translateY(${Math.round(maxTop*wrap.scrollTop/maxScroll)}px)`;
  }
  function renderFeatureTable(){
    const body=document.getElementById('portraitFeatureBody');
    if(!body)return;
    const source=featureRows();
    const denominator=Math.max(source.reduce((sum,row)=>sum+featureAmount(row),0),1);
    const list=[...source].sort((a,b)=>featureAmount(b)-featureAmount(a)).slice(0,10);
    const rankBadge=index=>index<3
      ? `<span class="portrait-feature-rank is-podium rank-${index+1}" aria-label="第${index+1}名"><b>${index+1}</b></span>`
      : `<span class="portrait-feature-rank">${String(index+1).padStart(2,'0')}</span>`;
    const rankingTable=(items,offset)=>`<table class="portrait-feature-table"><thead><tr><th class="portrait-feature-rank-head">排名</th><th>对手方</th><th>金额</th><th>交易占比</th></tr></thead><tbody>${items.map((row,itemIndex)=>{
      const index=offset+itemIndex,amount=featureAmount(row),ratio=amount/denominator*100;
      return `<tr><td>${rankBadge(index)}</td><td><span class="portrait-feature-name" title="${esc(row.name)}">${esc(row.name)}</span></td><td class="portrait-feature-money" data-audit-amount-k="${amount}">${fmtAmount(amount)}</td><td class="portrait-feature-share">${ratio.toFixed(1)}%</td></tr>`;
    }).join('')}</tbody></table>`;
    body.innerHTML=`<div class="portrait-feature-ranking-column">${rankingTable(list.slice(0,5),0)}</div><div class="portrait-feature-ranking-column">${rankingTable(list.slice(5,10),5)}</div>`;
  }
  function monthlyOption(){const months=Array.from({length:12},(_,i)=>`${i+1}月`),base=[120,135,110,145,160,155,170,180,165,190,210,230],yearFactor={2023:.82,2024:.91,2025:1}[monthlyYear]||1;const series=[['客户流入','#2f6fed',1],['供应商流入','#74a0f5',.68],['其他流入','#bfdbfe',.28],['客户流出','#d9466f',-.75],['供应商流出','#ee839e',-.5],['其他流出','#fecdd3',-.2]].map(([name,color,factor],i)=>({name,type:'bar',stack:factor>0?'in':'out',barMaxWidth:20,itemStyle:{color},data:base.map((v,m)=>Math.round(v*factor*yearFactor*(.82+((m+i+monthlyYear)%4)*.06)))}));return {tooltip:{trigger:'axis',appendToBody:true,confine:false,extraCssText:'z-index:10050;box-shadow:0 6px 20px rgba(15,23,42,.14);',formatter:params=>{const list=Array.isArray(params)?params:[];return `<b>${monthlyYear}年${list[0]?.axisValue||''}</b><br/>${list.map(item=>`${item.marker}${item.seriesName}：${Math.abs(item.value||0).toLocaleString()}`).join('<br/>')}`;}},legend:{top:0,itemWidth:10,itemHeight:7,textStyle:{fontSize:10}},grid:{left:52,right:12,top:30,bottom:28},xAxis:{type:'category',data:months,axisLabel:{fontSize:10}},yAxis:{type:'value',name:'金额',nameTextStyle:{fontSize:10},axisLabel:{formatter:v=>Math.abs(v),fontSize:10},splitLine:{lineStyle:{color:'#edf2f7'}}},series};}
  function bubbleOption(){const xMin=+document.getElementById('portraitXMin')?.value||0,xMax=+document.getElementById('portraitXMax')?.value||40000,yMin=+document.getElementById('portraitYMin')?.value||0,yMax=+document.getElementById('portraitYMax')?.value||100;const key=mode==='inflow'?'inflow':mode==='outflow'?'outflow':null;const data=rows.map(r=>({name:r.name,value:[key?r[key]:r.inflow+r.outflow,r.count,Math.max(r.inflow,r.outflow),r.type]}));const dataMaxX=Math.max(...data.map(d=>d.value[0]||0),xMin+1000),dataMaxY=Math.max(...data.map(d=>d.value[1]||0),yMin+5);return {tooltip:{formatter:p=>`${p.name}<br/>${mode==='inflow'?'流入':mode==='outflow'?'流出':'交易总额'}：${fmt(p.value[0])} 万元<br/>交易次数：${p.value[1]}<br/>对手方类型：${p.value[3]}`},grid:{left:55,right:18,top:16,bottom:54},dataZoom:[{type:'inside',xAxisIndex:0,filterMode:'none'},{type:'slider',xAxisIndex:0,height:12,bottom:8,borderColor:'transparent',backgroundColor:'#eef2f7',fillerColor:'rgba(47,111,237,.18)',handleSize:0,showDetail:false}],xAxis:{type:'value',min:xMin,max:Math.max(xMin+1000,xMax,dataMaxX*1.08),name:mode==='inflow'?'流入金额（万元）':mode==='outflow'?'流出金额（万元）':'交易总额（万元）',nameLocation:'middle',nameGap:28,axisLabel:{fontSize:10},splitLine:{lineStyle:{color:'#edf2f7'}}},yAxis:{type:'value',min:yMin,max:Math.max(yMin+5,yMax,dataMaxY*1.08),name:'交易次数',axisLabel:{fontSize:10},splitLine:{lineStyle:{color:'#edf2f7'}}},series:[{type:'scatter',data,symbolSize:v=>Math.max(7,Math.min(26,Math.sqrt(v[2]||1)/7)),itemStyle:{color:p=>p.value[3]==='客户'?'#2f6fed':p.value[3]==='供应商'?'#d9466f':'#64748b',opacity:.72},label:{show:true,position:'top',fontSize:9,formatter:p=>p.name.length>8?p.name.slice(0,8)+'…':p.name}}]};}
  function renderCharts(){if(!window.echarts)return;[['monthly','portraitMonthlyChart']].forEach(([key,id])=>{const el=document.getElementById(id);if(!el)return;charts[key]=echarts.getInstanceByDom(el)||echarts.init(el);charts[key].setOption(monthlyOption(),true);charts[key].resize();});renderFeatureTable();}
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
  function exportPortraitCurrent(event){
    event?.stopImmediatePropagation();
    const isBiz=tableView==='business',exportRows=filterRows(rows);
    const head=isBiz
      ? ['对手方名称','对手方类型','行业','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','经营状态','成立日期','注册资本','经营范围','注册地址','企业联系方式','董监高']
      : ['对手方名称','黑名单','对手方类型','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','销售类别','采购类别','职位','客户批准日期','客户无效日期','供应商批准日期','供应商无效日期','员工入职日期','员工离职日期','所属集团','备注说明'];
    const data=exportRows.map(row=>{
      if(isBiz){const bi=businessInfo(row);return [row.name,row.type,row.industry,row.inflow,row.salesVat,row.outflow,row.purchaseVat,row.inflow+row.outflow,row.count,bi.status,bi.founded,bi.capital,bi.scope,bi.address,bi.contact,bi.people];}
      const master=counterpartyMasterInfo(row);
      return [row.name,blacklistLabel(row),displayType(row),row.inflow,row.salesVat,row.outflow,row.purchaseVat,row.inflow+row.outflow,row.count,master.salesCategory,master.purchaseCategory,master.position,master.customerApprovalDate,master.customerInvalidDate,master.supplierApprovalDate,master.supplierInvalidDate,master.employeeHireDate,master.employeeLeaveDate,master.group,master.remark];
    });
    const csv=[head,...data].map(record=>record.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\n');
    const link=document.createElement('a');
    link.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));
    link.download=`经营分析_对手方汇总清单_${isBiz?'工商信息':'合计数据'}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  function exportRelation(){const isBiz=relationTableView==='business';const exportRows=relationRowsForCurrent();const head=isBiz?['对手方名称','对手方类型','行业','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','经营状态','成立日期','注册资本','经营范围','注册地址','企业联系方式','董监高']:['对手方名称','对手方类型','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','同进同出比例','行业','经营时长','董监高'];const csv=[head,...exportRows.map(r=>{const bi=businessInfo(r);return isBiz?[r.name,relationDisplayType(r),r.industry,r.inflow,r.salesVat,r.outflow,r.purchaseVat,r.inflow+r.outflow,r.count,bi.status,bi.founded,bi.capital,bi.scope,bi.address,bi.contact,bi.people]:[r.name,relationDisplayType(r),r.inflow,r.salesVat,r.outflow,r.purchaseVat,r.inflow+r.outflow,r.count,r.sameRatio,r.industry,r.duration,r.people];})].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download=`已知关联方交易_${isBiz?'工商信息':'合计数据'}.csv`;a.click();URL.revokeObjectURL(a.href);}
  function exportPersonal(){const isBiz=personalTableView==='business';const exportRows=personalRowsForCurrent();const head=isBiz?['个人名称','人员类型','关系说明','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','状态','首次交易日期','最近交易日期','交易期间','备注说明']:['个人名称','人员类型','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','同进同出比例','关系说明','交易期间','备注说明'];const csv=[head,...exportRows.map((r,i)=>{const bi=businessInfo(r),t=personalType(r),note=t==='员工'?'备用金、报销及薪酬相关往来':'个人往来需补充说明';return isBiz?[r.name,t,t==='员工'?'员工往来':'其他个人往来',r.inflow,r.salesVat,r.outflow,r.purchaseVat,r.inflow+r.outflow,r.count,t==='员工'?'在职':'待确认',bi.founded,`2025-12-${String(10+(i%18)).padStart(2,'0')}`,r.duration,note]:[r.name,t,r.inflow,r.salesVat,r.outflow,r.purchaseVat,r.inflow+r.outflow,r.count,r.sameRatio,t==='员工'?'员工往来':'其他个人往来',r.duration,note];})].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download=`个人交易_${isBiz?'工商信息':'合计数据'}.csv`;a.click();URL.revokeObjectURL(a.href);}
  function bindBusinessRefresh(){
    const button=document.getElementById('portraitBusinessRefresh');
    const state=document.getElementById('portraitBusinessRefreshState');
    if(!button||!state||button.dataset.bound==='1')return;
    button.dataset.bound='1';
    const format=value=>{
      const pad=number=>String(number).padStart(2,'0');
      return `${value.getFullYear()}-${pad(value.getMonth()+1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
    };
    button.addEventListener('click',()=>{
      if(button.classList.contains('is-refreshing'))return;
      const surface=document.querySelector('.portrait-table-wrap.tyc-sync-surface');
      surface?.querySelector('.tyc-sync-feedback')?.remove();
      surface?.classList.remove('is-tyc-sync-success');
      surface?.classList.add('is-tyc-syncing');
      surface?.setAttribute('aria-busy','true');
      if(surface){
        const feedback=document.createElement('div');
        feedback.className='tyc-sync-feedback';
        feedback.setAttribute('role','status');
        feedback.innerHTML='<span class="tyc-sync-feedback-icon" aria-hidden="true"></span><span class="tyc-sync-feedback-copy"><strong>正在更新对手方工商信息</strong><span>同步天眼查数据并刷新当前表格</span></span>';
        surface.appendChild(feedback);
      }
      button.classList.add('is-refreshing');
      button.disabled=true;
      button.setAttribute('aria-busy','true');
      state.classList.remove('is-success');
      state.textContent='正在重新获取工商信息…';
      window.setTimeout(()=>{
        const updated=format(new Date());
        state.innerHTML=`工商信息最新更新时间：<time id="portraitBusinessUpdatedAt">${updated}</time>`;
        state.classList.add('is-success');
        button.classList.remove('is-refreshing');
        button.disabled=false;
        button.removeAttribute('aria-busy');
        if(surface){
          surface.classList.remove('is-tyc-syncing');
          surface.classList.add('is-tyc-sync-success');
          surface.removeAttribute('aria-busy');
          const copy=surface.querySelector('.tyc-sync-feedback-copy');
          if(copy)copy.innerHTML='<strong>工商信息更新完成</strong><span>当前表格数据已刷新</span>';
          window.setTimeout(()=>{
            surface.classList.remove('is-tyc-sync-success');
            surface.querySelector('.tyc-sync-feedback')?.remove();
          },1100);
        }
        window.setTimeout(()=>state.classList.remove('is-success'),1600);
      },850);
    });
  }
  function resetPortraitFilters(){
    counterpartyFilter='all';
    sortKey='';
    sortDir=1;
    page=1;
    document.querySelectorAll('.ba-table-filter-popover').forEach(element=>element.remove());
    renderTable();
  }
  function bindSynchronizedAnalysisCards(){
    const cards=[
      document.querySelector('.portrait-monthly-card'),
      document.querySelector('.portrait-feature-card')
    ].filter(Boolean);
    if(cards.length!==2)return;

    const buttons=cards.map(card=>card.querySelector(':scope > .head .card-fold-btn'));
    if(buttons.some(button=>!button))return;

    let syncing=false;
    buttons.forEach((button,index)=>{
      if(button.dataset.portraitFoldSync==='1')return;
      button.dataset.portraitFoldSync='1';
      button.addEventListener('click',()=>{
        if(syncing)return;
        window.requestAnimationFrame(()=>{
          const expanded=button.getAttribute('aria-expanded')!=='false';
          const peerButton=buttons[index===0?1:0];
          const peerExpanded=peerButton.getAttribute('aria-expanded')!=='false';
          if(peerExpanded!==expanded){
            syncing=true;
            peerButton.click();
            syncing=false;
          }
          if(expanded){
            window.setTimeout(()=>{
              charts.monthly?.resize();
              window.dispatchEvent(new Event('resize'));
            },40);
          }
        });
      });
    });
  }
  function generatePortraitResult(){
    const button=document.getElementById('portraitGenerateResult');
    if(!button||button.disabled)return;
    const original=button.textContent;
    button.disabled=true;
    button.textContent='正在生成…';
    window.setTimeout(()=>{
      renderTable();
      button.textContent='已生成';
      window.setTimeout(()=>{
        button.textContent=original;
        button.disabled=false;
      },1200);
    },450);
  }
  function bind(){document.querySelectorAll('#portraitBubbleTabs button').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;document.querySelectorAll('#portraitBubbleTabs button').forEach(x=>x.classList.toggle('is-active',x===btn));renderFeatureTable();}));document.getElementById('portraitFeatureScroll')?.addEventListener('scroll',updateFeatureScrollbar,{passive:true});document.getElementById('portraitKpiToggle')?.addEventListener('click',()=>{portraitKpisHidden=!portraitKpisHidden;syncKpiToggle('portrait');});document.getElementById('relationKpiToggle')?.addEventListener('click',()=>{relationKpisHidden=!relationKpisHidden;syncKpiToggle('relation');});document.getElementById('personalKpiToggle')?.addEventListener('click',()=>{personalKpisHidden=!personalKpisHidden;syncKpiToggle('personal');});document.getElementById('portraitCounterpartyFilters')?.addEventListener('click',ev=>{const btn=ev.target.closest('.portrait-filter-card');if(!btn)return;counterpartyFilter=btn.dataset.filter||'all';page=1;renderTable();});document.querySelectorAll('#portraitTableTabs button').forEach(btn=>btn.addEventListener('click',()=>{tableView=btn.dataset.view||'summary';page=1;sortKey='';sortDir=1;document.querySelectorAll('#portraitTableTabs button').forEach(x=>x.classList.toggle('is-active',x===btn));renderTable();}));document.getElementById('portraitFeatureTopN')?.addEventListener('input',renderFeatureTable);document.getElementById('portraitColumnsBtn')?.addEventListener('click',ev=>{ev.preventDefault();window.openBankColumnChooser?.(ev.currentTarget,document.getElementById('portraitCounterpartyTable'));});document.getElementById('portraitExportBtn')?.addEventListener('click',()=>{const isBiz=tableView==='business';const exportRows=filterRows(rows);const head=isBiz?['对手方名称','对手方类型','行业','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','经营状态','成立日期','注册资本','经营范围','注册地址','企业联系方式','董监高']:['对手方名称','对手方类型','流入金额','销项税价合计','流出金额','进项税价合计','交易总额','交易笔数','同进同出比例','行业','经营时长','董监高'];const csv=[head,...exportRows.map(r=>{const bi=businessInfo(r);return isBiz?[r.name,r.type,r.industry,r.inflow,r.salesVat,r.outflow,r.purchaseVat,r.inflow+r.outflow,r.count,bi.status,bi.founded,bi.capital,bi.scope,bi.address,bi.contact,bi.people]:[r.name,r.type,r.inflow,r.salesVat,r.outflow,r.purchaseVat,r.inflow+r.outflow,r.count,r.sameRatio,r.industry,r.duration,r.people];})].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download=`流水画像_对手方汇总清单_${isBiz?'工商信息':'合计数据'}.csv`;a.click();URL.revokeObjectURL(a.href);});document.getElementById('relationModeTabs')?.addEventListener('click',ev=>{const btn=ev.target.closest('button[data-mode]');if(!btn)return;relationMode=btn.dataset.mode;relationSortKey='';relationPage=1;document.querySelectorAll('#relationModeTabs button').forEach(x=>x.classList.toggle('is-active',x===btn));renderRelationAll();});document.getElementById('relationTypeFilters')?.addEventListener('click',ev=>{const btn=ev.target.closest('.portrait-filter-card');if(!btn)return;relationFilter=btn.dataset.relationFilter||'related';relationPage=1;renderRelationAll();});document.querySelectorAll('#relationTableTabs button').forEach(btn=>btn.addEventListener('click',()=>{relationTableView=btn.dataset.view||'summary';relationPage=1;relationSortKey='';relationSortDir=1;document.querySelectorAll('#relationTableTabs button').forEach(x=>x.classList.toggle('is-active',x===btn));renderRelationTable();}));document.getElementById('relationColumnsBtn')?.addEventListener('click',ev=>{ev.preventDefault();window.openBankColumnChooser?.(ev.currentTarget,document.getElementById('relationCounterpartyTable'));});document.getElementById('relationExportBtn')?.addEventListener('click',exportRelation);document.getElementById('personalModeTabs')?.addEventListener('click',ev=>{const btn=ev.target.closest('button[data-mode]');if(!btn)return;personalMode=btn.dataset.mode;personalSortKey='';personalPage=1;document.querySelectorAll('#personalModeTabs button').forEach(x=>x.classList.toggle('is-active',x===btn));renderPersonalAll();});document.getElementById('personalTypeFilters')?.addEventListener('click',ev=>{const btn=ev.target.closest('.portrait-filter-card');if(!btn)return;personalFilter=btn.dataset.personalFilter||'all';personalPage=1;renderPersonalAll();});document.querySelectorAll('#personalTableTabs button').forEach(btn=>btn.addEventListener('click',()=>{personalTableView=btn.dataset.view||'summary';personalPage=1;personalSortKey='';personalSortDir=1;document.querySelectorAll('#personalTableTabs button').forEach(x=>x.classList.toggle('is-active',x===btn));renderPersonalTable();}));document.getElementById('personalColumnsBtn')?.addEventListener('click',ev=>{ev.preventDefault();window.openBankColumnChooser?.(ev.currentTarget,document.getElementById('personalCounterpartyTable'));});document.getElementById('personalExportBtn')?.addEventListener('click',exportPersonal);['Customer','Supplier'].forEach(kind=>{document.getElementById(`portrait${kind}TopN`)?.addEventListener('change',()=>updateConcentration(kind));updateConcentration(kind);});window.addEventListener('resize',()=>{Object.values(charts).forEach(c=>c?.resize());updateFeatureScrollbar();});document.getElementById('btnQueryBiz')?.addEventListener('click',()=>{renderTable();renderCharts();renderFeatureTable();renderRelationAll();renderPersonalAll();});}
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('#portraitBubbleTabs button[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
      featureView=btn.dataset.view||'customer';
      document.querySelectorAll('#portraitBubbleTabs button').forEach(item=>item.classList.toggle('is-active',item===btn));
      renderFeatureTable();
    }));
  });
  window.addEventListener('audit-unit-ready',()=>{renderTable();renderFeatureTable();renderRelationAll();renderPersonalAll();});
  document.addEventListener('DOMContentLoaded',()=>{renderTable();bind();bindBusinessRefresh();bindSynchronizedAnalysisCards();document.getElementById('portraitResetFilters')?.addEventListener('click',resetPortraitFilters);document.getElementById('portraitGenerateResult')?.addEventListener('click',generatePortraitResult);document.getElementById('portraitMonthlyYearSelect')?.addEventListener('change',event=>{monthlyYear=Number(event.target.value)||2025;charts.monthly?.setOption(monthlyOption(),true);charts.monthly?.resize();});document.getElementById('portraitExportBtn')?.addEventListener('click',exportPortraitCurrent,true);renderFeatureTable();renderRelationAll();renderPersonalAll();setTimeout(renderCharts,80);});
})();
