(function () {
  'use strict';
  const interval=(label,min,max)=>({label,min,max});
  const definitions={
    '1.1':{title:'单笔金额分布',counterparties:false,ranges:[interval('0–1M',0,1e6),interval('1–5M',1e6,5e6),interval('5–10M',5e6,1e7),interval('10–20M',1e7,2e7),interval('20M以上',2e7,Infinity)]},
    '3.6':{title:'对手方交易总额分布',counterparties:true,ranges:[interval('0–5M',0,5e6),interval('5–10M',5e6,1e7),interval('10–20M',1e7,2e7),interval('20M以上',2e7,Infinity)]},
    '3.7':{title:'收付重合比例分布',counterparties:true,cumulative:true,ranges:[interval('20%以下',0,20),interval('20%以上',20,Infinity),interval('50%以上',50,Infinity),interval('80%以上',80,Infinity)]},
    '4.1':{title:'经营年限分布',counterparties:true,ranges:[interval('小于1年',0,365),interval('1–2年',365,730),interval('2–3年',730,1095),interval('3年以上',1095,Infinity)]},
    '4.2':{title:'社保人数分布',counterparties:true,ranges:[interval('小于10人',0,10),interval('10–50人',10,50),{label:'50–100人',min:50,max:100,inclusiveMax:true},{label:'大于100人',min:100,max:Infinity,exclusiveMin:true}]}
  };
  function build(id,counterparties,transactions,clears={},scope={}) {
    const definition=definitions[id];
    if(!definition)return null;
    const byId=new Map(counterparties.map(cp=>[cp.id,cp]));
    const totals=new Map(counterparties.map(cp=>[cp.id,{inflow:0,outflow:0}]));
    transactions.forEach(tx=>{
      const total=totals.get(tx.cpId);
      if(total)total[tx.dir==='流入'?'inflow':'outflow']+=Math.round(tx.amount*100);
    });
    const groups=definition.ranges.map((range,index)=>({...range,key:String(index),amountCents:0,transactions:0,cpIds:new Set(),txIds:new Set()}));
    let totalCents=0;
    transactions.forEach(tx=>{
      const cp=byId.get(tx.cpId),total=totals.get(tx.cpId);
      if(!cp||!total||clears[`${tx.cpId}_${id}`]||scope.cpIds&&!scope.cpIds.has(tx.cpId)||scope.txIds&&!scope.txIds.has(tx.txId))return;
      const company=cp.type==='企业账户';
      let value;
      if(id==='1.1') {if(!company)return;value=tx.amount;}
      if(id==='3.6') {if(!company||['客户','供应商'].includes(cp.cpType))return;value=(total.inflow+total.outflow)/100;}
      if(id==='3.7') {if(!total.inflow||!total.outflow)return;value=Math.min(total.inflow,total.outflow)/Math.max(total.inflow,total.outflow)*100;}
      if(id==='4.1'||id==='4.2') {
        if(!company||cp.kind==='unknown')return;
        value=id==='4.1'?cp.operatingDays:cp.insuredCount;
      }
      if(!Number.isFinite(value)||value<0)return;
      const cents=Math.round(tx.amount*100);
      totalCents+=cents;
      groups.forEach(group=>{
        if((group.exclusiveMin?value>group.min:value>=group.min)&&(group.inclusiveMax?value<=group.max:value<group.max)){
          group.amountCents+=cents;group.transactions+=1;group.cpIds.add(tx.cpId);group.txIds.add(tx.txId);
        }
      });
    });
    return {...definition,totalAmount:totalCents/100,groups:groups.map(group=>({...group,amount:group.amountCents/100,count:group.cpIds.size,ratio:totalCents?group.amountCents/totalCents:0}))};
  }
  window.RoutineDistribution=Object.freeze({build,supports:id=>Object.prototype.hasOwnProperty.call(definitions,id)});
})();
