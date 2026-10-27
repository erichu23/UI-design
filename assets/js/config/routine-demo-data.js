(function () {
  'use strict';
  const version = 'special-transactions-20261027-3';
  const resultKey = 'auditCompass.specialTransactionRoutineResults.v1';
  const labels = Object.freeze({
    '1.1':'大额交易', '1.2':'累计大额', '2.1.1':'关联方', '2.1.2':'关联自然人',
    '2.1.3':'关联方分红', '2.2.1':'关键岗位', '2.2.2':'个人账户收付',
    '2.2.3':'前员工', '2.2.4':'其他特定关联方', '3.1':'大额存取现',
    '3.2':'期末集中', '3.3':'摘要异常', '3.4':'无对手方名称', '3.5':'无摘要',
    '3.6':'非客供清单', '3.7':'同对手方收付并存', '3.8':'往来少数次',
    '3.9':'交易方向异常', '4.1':'经营时间短', '4.2':'社保人数少',
    '4.3':'个人主体', '4.4':'个体工商户/个人独资企业'
  });
  const ids = Object.freeze(Object.keys(labels));
  const amountDefaults = Object.freeze({
    '1.1':{minAmt:50000}, '1.2':{totalInflow:1000000,totalOutflow:1000000},
    '2.2.2':{personalAmt:50000}, '3.2':{amtThreshold:50000},
    '3.6':{nonListAmt:50000}, '3.7':{overlapAmt:100000},
    '3.8':{txTotalAmt:100000}, '3.9':{custOutflow:50000,suppInflow:50000}
  });
  const stateKey = 'auditCompass.specialTransactionRoutineState';
  const changeEvent = 'routine-parameters-changed';
  const field = (key,label,defaultVal,unit='',type='number') => ({key,label,defaultVal,unit,type,placeholder:'不筛选'});
  const filterDefinitions = {
    '1.1':[field('minAmt','单笔交易金额 ≥',50000,'元')],
    '1.2':[field('totalInflow','年度资金流入 ≥',1000000,'元'),field('totalOutflow','年度资金流出 ≥',1000000,'元')],
    '2.2.2':[field('personalAmt','与个人交易金额 ≥',50000,'元')],
    '3.1':[field('cashKeywords','摘要关键字','存现,取现,现金','','text')],
    '3.2':[field('bsDate','资产负债表日','12/31','','date'),field('daysRange','前后天数',10,'天'),field('amtThreshold','交易金额 ≥',50000,'元')],
    '3.3':[field('abnormalKeywords','摘要关键字','代发工资,处罚,抚恤金','','text')],
    '3.6':[field('nonListAmt','交易金额 ≥',50000,'元')],
    '3.7':[field('overlapAmt','与对手方交易总额 ≥',100000,'元'),field('overlapRatio','收支重合比例 ≥',20,'%')],
    '3.8':[field('txCountMin','交易次数范围（起）',1),field('txCountMax','交易次数范围（止）',3),field('txTotalAmt','交易总额 ≥',100000,'元')],
    '3.9':[field('custOutflow','对客户流出 ≥',50000,'元'),field('suppInflow','从供应商流入 ≥',50000,'元')],
    '4.1':[field('bizDays','经营天数 ≤',365,'天')],
    '4.2':[field('socialCount','社保人数 ≤',5,'人')]
  };
  function readParameters() {
    let saved={};
    try { saved=JSON.parse(localStorage.getItem(stateKey)||'null')||{}; } catch(error) {}
    const stored=new Map((saved.routines||[]).map(row=>[row.id,row]));
    return Object.fromEntries(ids.map(id=>[id,{id,filters:(filterDefinitions[id]||[]).map(definition=>{
      const prior=stored.get(id)?.filters?.find(filter=>filter.key===definition.key);
      const usePrior=prior&&(saved.amountDefaultsVersion===1||prior.value!=null&&prior.value!=='');
      return {...definition,defaultVal:usePrior?prior.value:definition.defaultVal};
    })}]));
  }
  function validValue(filter,value) {
    if(value===null||value==='')return true;
    if(filter.type==='number')return Number.isFinite(Number(value))&&Number(value)>=0&&(filter.unit!=='%'||Number(value)<=100);
    if(filter.type!=='date')return String(value).length<=500;
    const match=/^(?:(\d{4})-)?(\d{2})[-/](\d{2})$/.exec(String(value));
    const date=match&&new Date(Date.UTC(Number(match[1]||2000),Number(match[2])-1,Number(match[3])));
    return !!date&&date.getUTCFullYear()===Number(match[1]||2000)&&date.getUTCMonth()===Number(match[2])-1&&date.getUTCDate()===Number(match[3]);
  }
  function saveParameters(updates) {
    const parameters=readParameters();
    updates.forEach(row=>{
      row.filters?.forEach(filter=>{
        const target=parameters[row.id]?.filters.find(item=>item.key===filter.key);
        if(!target)return;
        const raw=Object.prototype.hasOwnProperty.call(filter,'value')?filter.value:filter.defaultVal;
        if(!validValue(target,raw))throw new Error('请输入有效的筛选条件');
        target.defaultVal=raw===null||raw===''?null:target.type==='number'?Number(raw):String(raw);
      });
    });
    Object.values(parameters).forEach(row=>{
      const p=Object.fromEntries(row.filters.map(filter=>[filter.key,filter.defaultVal]));
      if(p.txCountMin!=null&&p.txCountMax!=null&&p.txCountMin>p.txCountMax)throw new Error('交易次数起值不能大于止值');
    });
    const routines=Object.values(parameters).map(row=>({...row,filters:row.filters.map(filter=>({...filter,value:filter.defaultVal}))}));
    const payload=JSON.stringify({amountDefaultsVersion:1,routines});
    const old=localStorage.getItem(stateKey);
    let clears={};
    try { clears=JSON.parse(localStorage.getItem(resultKey)||'null')?.clears||{}; }catch(error){}
    localStorage.setItem(stateKey,payload);
    if(old!==payload){
      localStorage.setItem(resultKey,JSON.stringify({version,clears,rows:summarize(create({parameters}),clears)}));
      window.dispatchEvent?.(new CustomEvent(changeEvent));
    }
    return parameters;
  }
  const accounts = [
    ['华东制造集团有限公司','1001***0821'], ['上海星河科技有限公司','1002***4186'],
    ['深圳启明电子有限公司','2001***7739'], ['广州远航贸易有限公司','3001***6290'],
    ['苏州精密制造有限公司','3002***9052'], ['华南物流服务有限公司','4001***1578']
  ];
  const groups = [
    ['customer',['上海启辰贸易有限公司','南京卓越电子有限公司','杭州科锐科技有限公司','深圳远景服务有限公司','广州锦程商贸有限公司','佛山凯鸿商贸有限公司','苏州启明商贸有限公司','宁波和盛实业有限公司']],
    ['supplier',['苏州华瑞工业有限公司','宁波宏达供应链有限公司','武汉迅达物流有限公司','青岛远通国际贸易有限公司','东莞信成科技有限公司','常熟力合金属材料有限公司','成都智联设备有限公司','昆山精达模具有限公司']],
    ['relatedCompany',['华东制造供应链有限公司','华东科技发展有限公司','上海华东工业服务有限公司','天津华东设备有限公司']],
    ['relatedPerson',['王志成（实际控制人）','陈慧敏（董事）','赵文华（监事）','郑子涵（股东亲属）']],
    ['employee',['张明远（财务经理）','李佳琪（出纳）','郑晓雯（市场总监）','陈雨桐（董事长司机）']],
    ['formerEmployee',['许成（前销售经理）','周欣（前采购主管）','刘宇（前财务人员）','孙静（前项目经理）']],
    ['formerCompany',['杭州云帆经销有限公司','南京嘉盛设备有限公司','苏州致远商贸有限公司','广州晨辉供应链有限公司']],
    ['soleTrader',['上海浦东新区安诚五金经营部','苏州匠心设备维修中心','南京简禾咨询工作室','宁波顺达物流服务部']],
    ['other',['深圳创衡咨询有限公司','杭州瑞达商务服务有限公司','广州久安工程服务有限公司','成都启鸿信息科技有限公司']],
    ['unknown',['名称缺失（账户尾号9711）','名称缺失（账户尾号9722）']],
    ['oneoff',['济南远泽资产处置有限公司','武汉江辰设备回收有限公司']]
  ];
  const numeric = (value, fallback) => value === null || value === undefined || value === '' ? fallback : Number(value);
  const params = (metadata, id) => ({...amountDefaults[id], ...Object.fromEntries((metadata[id]?.filters || []).map(filter =>
    [filter.key, Object.prototype.hasOwnProperty.call(filter, 'value') ? filter.value : filter.defaultVal]))});
  const keywordsMatch = (value, text) => !value || String(value).split(/[,，;；\n]/).some(word => word.trim() && text.includes(word.trim()));
  function nearBalanceDate(date, target, days) {
    if (!target || days === null || days === undefined || days === '') return true;
    const match = /^(?:(\d{4})-)?(\d{2})[-/](\d{2})$/.exec(String(target));
    if (!match) return false;
    const time = Date.parse(`${date}T00:00:00Z`), year = Number(date.slice(0,4));
    const years = match[1] ? [Number(match[1])] : [year-1,year,year+1];
    return years.some(y => Math.abs(time-Date.UTC(y,Number(match[2])-1,Number(match[3]))) <= Number(days)*86400000);
  }
  function aggregate(data) {
    data.counterparties.forEach(cp => {
      cp.inflowCents=0; cp.outflowCents=0; cp.txCount=0; cp.maxSingle=0; cp.annualTotals={};
    });
    const byId = new Map(data.counterparties.map(cp => [cp.id,cp]));
    data.transactions.forEach(tx => {
      const cp=byId.get(tx.cpId), cents=Math.round(tx.amount*100), year=tx.date.slice(0,4);
      cp.annualTotals[year] ||= {inflow:0,outflow:0};
      const key=tx.dir==='流入'?'inflow':'outflow';
      cp[`${key}Cents`]+=cents; cp.annualTotals[year][key]+=cents/100;
      cp.txCount+=1; cp.maxSingle=Math.max(cp.maxSingle,tx.amount);
    });
    data.counterparties.forEach(cp => {
      cp.inflow=cp.inflowCents/1000000; cp.outflow=cp.outflowCents/1000000;
      cp.net=(cp.outflowCents-cp.inflowCents)/1000000;
      cp.salesTax=cp.cpType==='客户'?Math.round(cp.inflowCents*.96)/1000000:0;
      cp.inputTax=cp.cpType==='供应商'?Math.round(cp.outflowCents*.95)/1000000:0;
      cp.freq=Number((cp.txCount/24).toFixed(2));
    });
    return byId;
  }
  function matches(id, tx, cp, p) {
    const total=(cp.inflowCents+cp.outflowCents)/100;
    switch(id) {
      case '1.1':return tx.amount>=numeric(p.minAmt,50000);
      case '1.2':return Object.values(cp.annualTotals).some(year =>
        p.totalInflow==null&&p.totalOutflow==null ||
        p.totalInflow!=null&&year.inflow>=numeric(p.totalInflow,0) ||
        p.totalOutflow!=null&&year.outflow>=numeric(p.totalOutflow,0));
      case '2.2.2':return total>=numeric(p.personalAmt,0);
      case '3.1':return keywordsMatch(p.cashKeywords,tx.remark);
      case '3.2':return nearBalanceDate(tx.date,p.bsDate,p.daysRange)&&tx.amount>=numeric(p.amtThreshold,0);
      case '3.3':return keywordsMatch(p.abnormalKeywords,tx.remark);
      case '3.6':return total>=numeric(p.nonListAmt,0);
      case '3.7':return total>=numeric(p.overlapAmt,0)&&Math.min(cp.inflowCents,cp.outflowCents)/Math.max(1,cp.inflowCents,cp.outflowCents)*100>=numeric(p.overlapRatio,20);
      case '3.8':return cp.txCount>=numeric(p.txCountMin,1)&&cp.txCount<=numeric(p.txCountMax,3)&&total>=numeric(p.txTotalAmt,0);
      case '3.9':return cp.cpType==='客户'?cp.outflowCents/100>=numeric(p.custOutflow,0):cp.inflowCents/100>=numeric(p.suppInflow,0);
      case '4.1':return cp.operatingDays<=numeric(p.bizDays,365);
      case '4.2':return cp.insuredCount<=numeric(p.socialCount,5);
      default:return true;
    }
  }
  function evaluate(data, metadata={}) {
    const byId=aggregate(data), parameters=Object.fromEntries(ids.map(id=>[id,params(metadata,id)]));
    const counterparties=new Map(data.counterparties.map(cp=>[cp.id,new Set()]));
    data.transactions.forEach(tx => {
      const cp=byId.get(tx.cpId);
      tx.checkIds=tx.candidates.filter(id=>matches(id,tx,cp,parameters[id]));
      tx.flags=tx.checkIds.map(id=>labels[id]);
      tx.checkIds.forEach(id=>counterparties.get(cp.id).add(id));
    });
    data.counterparties.forEach(cp=>{
      cp.hits=Array.from(counterparties.get(cp.id),id=>labels[id]);
      cp.risk=cp.hits.length>=5?'high':cp.hits.length?'mid':'none';
      cp.markStatus=cp.hits.length?'flagged':'none';
    });
    return data;
  }
  function create({parameters={},unitAccounts=accounts}={}) {
    const profiles=groups.flatMap(([kind,names])=>names.map(name=>({name,kind})));
    const extraPeople=['周景明','吴思远','孙嘉宁','何文静','徐致远','沈佳怡','陆明轩','蒋若涵','杜文博','谢欣然','韩泽宇','方雅雯',
      '程嘉树','魏思齐','叶景行','苏婉清','潘明哲','许安宁','邵致诚','顾若溪','彭子墨','梁舒雅','汪启航','邓可欣'];
    const counterparties=Array.from({length:3},(_,batch)=>profiles.map((profile,index)=>{
      let name=profile.name;
      if(batch){
        const person=['relatedPerson','employee','formerEmployee'].includes(profile.kind);
        name=person?extraPeople[(batch-1)*12+index-20]+(profile.name.match(/（.*）$/)?.[0]||''):name+`（${batch===1?'南京':'杭州'}分支机构）`;
      }
      return {name,kind:profile.kind};
    })).flat();
    const transactions=[];
    counterparties.forEach((cp,recordIndex)=>{
      const index=recordIndex%profiles.length,batch=Math.floor(recordIndex/profiles.length);
      const person=['relatedPerson','employee','formerEmployee'].includes(cp.kind);
      Object.assign(cp,{
        id:`demo-cp-${String(recordIndex+1).padStart(2,'0')}`,abbr:cp.name.slice(0,2),
        cpType:cp.kind==='customer'?'客户':cp.kind==='supplier'?'供应商':person?'个人':'其他',
        type:person?'个人账户':'企业账户',typeTag:cp.kind.startsWith('related')?'关联方':'普通',
        relType:cp.kind==='relatedCompany'?'联营企业':cp.kind==='relatedPerson'?'关键管理人员':undefined,
        companyType:person?'个人':cp.kind==='soleTrader'?(index%2?'个人独资企业':'个体工商户'):cp.kind==='unknown'?'待核实':'有限责任公司',
        operatingDays:[8,9,40,41,42,43].includes(index)?120+index%160:1200+index*47,
        insuredCount:person?0:[8,9,40,41,42,43].includes(index)?index%4:35+index*3,
        currency:'CNY',account:`6228 **** **** ${String(cp.kind==='unknown'?(index===44?9711:9722)+batch*100:(8200+recordIndex*31)%10000).padStart(4,'0')}`,
        remark:cp.kind==='unknown'?'待补充交易对手方主档信息':'',
        normal:[6,7,14,15].includes(index)
      });
      if(cp.kind==='unknown')cp.name=`名称缺失（账户尾号${cp.account.slice(-4)}）`;
      cp.executives=cp.companyType;cp.industry=`${cp.operatingDays}天`;cp.bizAge=`${cp.insuredCount}人`;
      const count=cp.kind==='oneoff'?index-45:8+index%9;
      for(let j=0;j<count;j++) {
        const [selfName,selfAccount]=unitAccounts[index%unitAccounts.length];
        const wrong=!cp.normal&&j%5===4;
        const dir=cp.kind==='customer'?(wrong?'流出':'流入'):cp.kind==='supplier'?(wrong?'流入':'流出'):j%2?'流入':'流出';
        const amount=cp.normal?12000+j*325.5:cp.kind==='oneoff'?860000+j*175000:person?28000+(index*977+j*17333)%190000:320000+(index*17311+j*122847)%1900000;
        let date=`${2024+j%2}-${String(1+(j*3+index)%12).padStart(2,'0')}-${String(3+(j*7+index)%24).padStart(2,'0')}`;
        let remark=dir==='流入'?`${cp.name}项目回款`:`${cp.name}采购及服务结算`;
        let type=person?'个人转账':'对公转账';
        const candidates=new Set();
        if(!cp.normal) {
          candidates.add('1.1');
          if(index<6||index>=8&&index<12)candidates.add('1.2');
          if(cp.kind==='relatedCompany')candidates.add('2.1.1');
          if(cp.kind==='relatedPerson')candidates.add('2.1.2');
          if(cp.kind==='employee')candidates.add('2.2.1');
          if(person)candidates.add('2.2.2');
          if(cp.kind==='formerEmployee')candidates.add('2.2.3');
          if(cp.kind==='formerCompany')candidates.add('2.2.4');
          if(cp.kind==='relatedPerson'&&j%4===0){candidates.add('2.1.3');remark='现金分红及薪酬支付，后续资金流向待核实';}
          if(['relatedCompany','formerCompany','soleTrader','other','unknown','oneoff'].includes(cp.kind))candidates.add('3.6');
          if(index%3===0||cp.kind==='formerCompany')candidates.add('3.7');
          if(cp.kind==='oneoff')candidates.add('3.8');
          if(wrong&&['customer','supplier'].includes(cp.kind))candidates.add('3.9');
          if(cp.operatingDays<365&&!person)candidates.add('4.1');
          if(cp.insuredCount<5&&!person&&cp.kind!=='unknown')candidates.add('4.2');
          if(person)candidates.add('4.3');
          if(cp.kind==='soleTrader')candidates.add('4.4');
          if(index%4===0&&j%3===0){candidates.add('3.2');date=`${2024+j%2}-12-${24+j%6}`;}
          if(index>=40&&index<42&&j%2===0){candidates.add('3.1');remark=dir==='流入'?'现金缴存款项':'取现支付项目备用金';type=dir==='流入'?'现金缴存':'现金支取';}
          if(index>=42&&index<44&&j%3===0){candidates.add('3.3');remark=['代发工资至非员工账户','处罚款项结算','抚恤金支付'][Math.floor(j/3)%3];}
          if(cp.kind==='unknown'){candidates.add('3.4');if(j%3===1){candidates.add('3.5');remark='';}}
        }
        transactions.push({txId:`DEMO-${date.replaceAll('-','')}-${String(recordIndex+1).padStart(2,'0')}-${String(j+1).padStart(2,'0')}`,
          date,time:`${String(9+j%8).padStart(2,'0')}:${String(index*7%60).padStart(2,'0')}:00`,
          selfName,selfAccount,cp:cp.kind==='unknown'?'':cp.name,cpId:cp.id,account:cp.account.replaceAll(' ',''),
          currency:'CNY',type,dir,amount:Math.round((amount*(1+batch*.15)+(recordIndex*13+j*7)%100/100)*100)/100,
          remark,candidates:Array.from(candidates),flags:[],markStatus:'none'});
      }
    });
    transactions.sort((left,right)=>left.date.localeCompare(right.date)||left.txId.localeCompare(right.txId));
    const cashPositions=new Map(unitAccounts.map(([,account])=>[account,{net:0,minimum:0}]));
    transactions.forEach(tx=>{
      const position=cashPositions.get(tx.selfAccount);
      position.net+=(tx.dir==='流入'?1:-1)*Math.round(tx.amount*100);
      position.minimum=Math.min(position.minimum,position.net);
    });
    const balances=new Map(Array.from(cashPositions,([account,position])=>[account,Math.max(2000000000,500000000-position.minimum)]));
    transactions.forEach(tx=>{balances.set(tx.selfAccount,balances.get(tx.selfAccount)+(tx.dir==='流入'?1:-1)*Math.round(tx.amount*100));tx.balance=balances.get(tx.selfAccount)/100;});
    return evaluate({version,counterparties,transactions},parameters);
  }
  function summarize(data, clears={}) {
    const rows=new Map(ids.map(id=>[id,{id,counterparties:new Set(),amountCents:0,transactions:0}]));
    data.transactions.forEach(tx=>tx.checkIds.forEach(id=>{
      if(clears[`${tx.cpId}_${id}`])return;
      const row=rows.get(id);row.counterparties.add(tx.cpId);row.amountCents+=Math.round(tx.amount*100);row.transactions+=1;
    }));
    return Array.from(rows.values(),row=>({id:row.id,counterparties:row.counterparties.size,amount:row.amountCents/100,transactions:row.transactions}));
  }
  function readSummary() {
    let parameters=readParameters();
    try {
      const saved=JSON.parse(localStorage.getItem(resultKey)||'null');
      if(saved?.version===version&&saved.rows?.length===ids.length&&saved.rows.every(row=>ids.includes(row.id)&&['counterparties','amount','transactions'].every(key=>Number.isFinite(row[key])&&row[key]>=0)))return saved.rows;
    }catch(error){ /* Fall back to the deterministic demo, never random counts. */ }
    return summarize(create({parameters}));
  }
  window.RoutineDemoData=Object.freeze({version,resultKey,stateKey,changeEvent,ids,labels,amountDefaults,create,evaluate,summarize,readSummary,readParameters,saveParameters});
})();
