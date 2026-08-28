(()=>{
  if(window.__accountActionDetailsReady)return;
  window.__accountActionDetailsReady=true;
  const years=[2023,2024,2025];
  const months=Array.from({length:12},(_,index)=>index+1);
  const format=value=>Number(value||0).toLocaleString('zh-CN');
  const escapeText=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const hostDocument=()=>{try{if(parent&&parent!==window&&parent.document?.body)return parent.document;}catch(error){}return document;};
  const ensureHostStyle=doc=>{
    if(doc===document||doc.getElementById('account-action-detail-host-style'))return;
    const link=doc.createElement('link');link.id='account-action-detail-host-style';link.rel='stylesheet';link.href='./assets/css/pages/account-action-details.css?v=20260828-portrait-actions4';doc.head.appendChild(link);
  };
  const closeDrawer=mask=>{
    mask.hidden=true;mask.style.display='none';
    document.body.classList.remove('account-action-drawer-open');
    mask.ownerDocument.body.classList.remove('account-action-drawer-open');
  };
  const ensureDrawer=()=>{
    const doc=hostDocument();ensureHostStyle(doc);
    let mask=doc.getElementById('accountActionDetailMask');
    if(mask)return mask;
    mask=doc.createElement('div');mask.id='accountActionDetailMask';mask.className='account-action-detail-mask';mask.hidden=true;
    mask.innerHTML=`<aside class="account-action-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="accountActionDetailTitle"><header><div><b id="accountActionDetailTitle">账号详情</b><span id="accountActionDetailSubtitle"></span></div><button type="button" data-account-drawer-close aria-label="关闭">×</button></header><div class="account-action-detail-body" id="accountActionDetailBody"></div><footer><button type="button" class="btn" data-account-drawer-close>关闭</button></footer></aside>`;
    doc.body.appendChild(mask);
    mask.addEventListener('click',event=>{if(event.target===mask||event.target.closest('[data-account-drawer-close]'))closeDrawer(mask);});
    doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mask.hidden)closeDrawer(mask);});
    return mask;
  };
  const openDrawer=mask=>{
    mask.hidden=false;mask.style.display='block';
    document.body.classList.add('account-action-drawer-open');
    mask.ownerDocument.body.classList.add('account-action-drawer-open');
  };
  const sourceOf=trigger=>({company:trigger.dataset.company||'华东制造集团有限公司',account:trigger.dataset.account||'1001***0821',bank:trigger.dataset.bank||'工行上海分行',inflow:Number(trigger.dataset.inflow)||140680,outflow:Number(trigger.dataset.outflow)||128640,txCount:Number(trigger.dataset.txCount)||4280});
  const seedOf=value=>Array.from(String(value)).reduce((sum,char)=>sum+char.charCodeAt(0),0);
  const chartData=(source,year)=>{
    const seed=seedOf(source.account)+year,factor=year===2023?.82:year===2024?.91:1;
    const inWeights=[.073,.061,.079,.068,.087,.075,.071,.083,.077,.091,.082,.096];
    const outWeights=[.066,.074,.063,.081,.067,.076,.085,.069,.083,.072,.087,.077];
    const inflow=inWeights.map((weight,index)=>Math.round(source.inflow*factor*weight*(.92+((seed+index*7)%17)/100)));
    const outflow=outWeights.map((weight,index)=>Math.round(source.outflow*factor*weight*(.91+((seed+index*5)%19)/100)));
    const bubbles=[];
    for(let day=1;day<=31;day+=1){if((day+seed)%3===0)bubbles.push([day,(day+seed)%7,800+((day*seed)%9200),'in']);if((day+seed)%4===0)bubbles.push([day,(day+seed+2)%7,700+((day*(seed+13))%10800),'out']);}
    return {inflow,outflow,bubbles,weekdays:['星期一','星期二','星期三','星期四','星期五','星期六','星期日']};
  };
  const monthlySvg=(data,year)=>{
    const width=760,height=244,left=50,right=18,top=28,bottom=36,plotWidth=width-left-right,plotHeight=height-top-bottom,max=Math.max(1,...data.inflow,...data.outflow)*1.12,groupWidth=plotWidth/12,barWidth=Math.min(13,groupWidth*.24);
    const grid=[0,.25,.5,.75,1].map(rate=>{const y=top+plotHeight*(1-rate);return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"/><text x="${left-8}" y="${y+3}" text-anchor="end">${format(Math.round(max*rate))}</text>`;}).join('');
    const bars=months.map((month,index)=>{const center=left+groupWidth*(index+.5),inHeight=data.inflow[index]/max*plotHeight,outHeight=data.outflow[index]/max*plotHeight;return `<g><rect class="is-in" data-chart-tooltip="${year}年${String(month).padStart(2,'0')}月|流入金额|${format(data.inflow[index])}" x="${center-barWidth-1}" y="${top+plotHeight-inHeight}" width="${barWidth}" height="${Math.max(1,inHeight)}" rx="2"/><rect class="is-out" data-chart-tooltip="${year}年${String(month).padStart(2,'0')}月|流出金额|${format(data.outflow[index])}" x="${center+1}" y="${top+plotHeight-outHeight}" width="${barWidth}" height="${Math.max(1,outHeight)}" rx="2"/><text x="${center}" y="${height-15}" text-anchor="middle">${String(month).padStart(2,'0')}月</text></g>`;}).join('');
    return `<svg class="account-action-native-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"><g class="grid">${grid}</g>${bars}<g class="legend"><circle class="is-in" cx="622" cy="12" r="4"/><text x="631" y="15">流入</text><circle class="is-out" cx="682" cy="12" r="4"/><text x="691" y="15">流出</text></g></svg>`;
  };
  const bubbleSvg=(data,year)=>{
    const width=760,height=238,left=58,right=18,top=26,bottom=28,plotWidth=width-left-right,plotHeight=height-top-bottom;
    const rows=data.weekdays.map((label,index)=>{const y=top+plotHeight*index/6;return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"/><text x="${left-8}" y="${y+3}" text-anchor="end">${label}</text>`;}).join('');
    const ticks=[1,5,10,15,20,25,30].map(day=>{const x=left+(day-1)/30*plotWidth;return `<line x1="${x}" y1="${top}" x2="${x}" y2="${top+plotHeight}"/><text x="${x}" y="${height-9}" text-anchor="middle">${day}</text>`;}).join('');
    const points=data.bubbles.map(item=>{const x=left+(item[0]-1)/30*plotWidth,y=top+item[1]/6*plotHeight,r=Math.max(3,Math.min(12,Math.sqrt(item[2])*.1)),direction=item[3]==='in'?'流入':'流出';return `<circle class="${item[3]==='in'?'is-in':'is-out'}" data-chart-tooltip="${year}年${item[0]}日|${direction}金额|${format(item[2])}" cx="${x}" cy="${y}" r="${r}"/>`;}).join('');
    return `<svg class="account-action-native-chart is-bubble" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"><g class="grid">${rows}${ticks}</g>${points}<g class="legend"><circle class="is-in" cx="622" cy="12" r="4"/><text x="631" y="15">流入</text><circle class="is-out" cx="682" cy="12" r="4"/><text x="691" y="15">流出</text></g></svg>`;
  };
  const openAccountDetail=trigger=>{
    const source=sourceOf(trigger),mask=ensureDrawer(),doc=mask.ownerDocument,title=doc.getElementById('accountActionDetailTitle'),subtitle=doc.getElementById('accountActionDetailSubtitle'),body=doc.getElementById('accountActionDetailBody');
    title.textContent=`账号详情：${source.account}`;subtitle.textContent=`${source.company} · ${source.bank}`;
    body.innerHTML=`<div class="account-detail-content"><section><h3>收支统计</h3><div class="account-detail-kpis"><div><span>流入金额</span><b class="flow-in">${format(source.inflow)}</b></div><div><span>流出金额</span><b class="flow-out">${format(source.outflow)}</b></div><div><span>交易总额</span><b>${format(source.inflow+source.outflow)}</b></div><div><span>交易笔数</span><b>${format(source.txCount)}</b></div><div><span>流入流出差额</span><b>${format(source.inflow-source.outflow)}</b></div></div></section><section><div class="account-detail-section-head"><h3>月度汇总</h3><label>年度<select data-account-detail-year><option>2023</option><option>2024</option><option selected>2025</option></select></label></div><div class="account-detail-chart" data-account-month-chart></div></section><section><h3>交易日期分析</h3><div class="account-detail-chart is-bubble" data-account-bubble-chart></div></section></div>`;
    const render=()=>{const year=Number(body.querySelector('[data-account-detail-year]').value)||2025,data=chartData(source,year);body.querySelector('[data-account-month-chart]').innerHTML=monthlySvg(data,year);body.querySelector('[data-account-bubble-chart]').innerHTML=bubbleSvg(data,year);};
    const chartTooltip=ensureChartTooltip(doc);
    body.onpointerover=event=>{const target=event.target.closest?.('[data-chart-tooltip]');if(target)showChartTooltip(chartTooltip,target,event);};
    body.onpointermove=event=>{const target=event.target.closest?.('[data-chart-tooltip]');if(target)positionChartTooltip(chartTooltip,event);};
    body.onpointerout=event=>{if(event.target.closest?.('[data-chart-tooltip]'))chartTooltip.hidden=true;};
    body.querySelector('[data-account-detail-year]').addEventListener('change',render);openDrawer(mask);requestAnimationFrame(render);
  };
  const ensureChartTooltip=doc=>{let node=doc.getElementById('auditChartValueTooltip');if(!node){node=doc.createElement('div');node.id='auditChartValueTooltip';node.className='account-chart-tooltip';node.hidden=true;doc.body.appendChild(node);}return node;};
  const positionChartTooltip=(node,event)=>{const view=node.ownerDocument.defaultView,width=node.offsetWidth,height=node.offsetHeight;node.style.left=`${Math.min(view.innerWidth-width-10,Math.max(10,event.clientX-width/2))}px`;node.style.top=`${Math.max(10,event.clientY-height-14)}px`;};
  const showChartTooltip=(node,target,event)=>{const [period,label,value]=String(target.dataset.chartTooltip||'').split('|');node.classList.toggle('is-in',label.includes('流入'));node.classList.toggle('is-out',label.includes('流出'));node.innerHTML=`<b>${escapeText(period)}</b><span><i></i><em>${escapeText(label)}</em><strong>${escapeText(value)}</strong></span>`;node.hidden=false;positionChartTooltip(node,event);};
  let tooltip=null,filePopover=null;
  const ensureTooltip=()=>{if(tooltip)return tooltip;tooltip=document.createElement('div');tooltip.className='account-action-tooltip';tooltip.hidden=true;document.body.appendChild(tooltip);return tooltip;};
  const position=(node,trigger,side='top')=>{const rect=trigger.getBoundingClientRect(),width=node.offsetWidth,height=node.offsetHeight;if(side==='left'){node.style.left=`${Math.max(8,rect.left-width-10)}px`;node.style.top=`${Math.min(innerHeight-height-8,Math.max(8,rect.top+(rect.height-height)/2))}px`;}else{node.style.left=`${Math.min(innerWidth-width-8,Math.max(8,rect.left+(rect.width-width)/2))}px`;node.style.top=`${Math.max(8,rect.top-height-8)}px`;}};
  const showTooltip=trigger=>{const node=ensureTooltip();node.textContent=trigger.dataset.actionTooltip;node.hidden=false;position(node,trigger);};
  const hideTooltip=()=>{if(tooltip)tooltip.hidden=true;};
  const closeFile=()=>{if(filePopover)filePopover.hidden=true;};
  const openFile=trigger=>{hideTooltip();if(!filePopover){filePopover=document.createElement('div');filePopover.className='account-file-popover';filePopover.hidden=true;document.body.appendChild(filePopover);}const source=sourceOf(trigger),filename=`${source.company.replace(/有限公司|集团/g,'')}_${source.account.replace(/\*/g,'')}_资金流水.xlsx`;filePopover.innerHTML=`<div><span>文件名称</span><b>${escapeText(filename)}</b></div><div><span>上传人</span><b>Ken</b></div><button type="button" data-download-file aria-label="下载"><svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"/></svg></button>`;filePopover.hidden=false;position(filePopover,trigger,'left');filePopover.querySelector('[data-download-file]').onclick=()=>{const url=URL.createObjectURL(new Blob([`文件名称,上传人\n${filename},Ken\n`],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=filename.replace(/\.xlsx$/,'.csv');link.click();URL.revokeObjectURL(url);closeFile();};};
  document.addEventListener('pointerover',event=>{const trigger=event.target.closest('[data-ba-account-action][data-action-tooltip]');if(trigger&&!trigger.contains(event.relatedTarget))showTooltip(trigger);});
  document.addEventListener('pointerout',event=>{const trigger=event.target.closest('[data-ba-account-action][data-action-tooltip]');if(trigger&&!trigger.contains(event.relatedTarget))hideTooltip();});
  document.addEventListener('focusin',event=>{const trigger=event.target.closest('[data-ba-account-action][data-action-tooltip]');if(trigger)showTooltip(trigger);});
  document.addEventListener('focusout',event=>{if(event.target.closest('[data-ba-account-action]'))hideTooltip();});
  document.addEventListener('click',event=>{const trigger=event.target.closest('[data-ba-account-action]');if(trigger){event.preventDefault();event.stopPropagation();if(trigger.dataset.baAccountAction==='account-detail'){closeFile();openAccountDetail(trigger);}else openFile(trigger);return;}if(!event.target.closest('.account-file-popover'))closeFile();});
  addEventListener('scroll',()=>{hideTooltip();closeFile();},{capture:true,passive:true});
  addEventListener('resize',()=>{hideTooltip();closeFile();},{passive:true});
  let trendNote='';
  const openTrendNote=()=>{
    const doc=hostDocument();ensureHostStyle(doc);
    let mask=doc.getElementById('accountTrendNoteMask');
    if(!mask){
      mask=doc.createElement('div');mask.id='accountTrendNoteMask';mask.className='account-trend-note-mask';mask.hidden=true;
      mask.innerHTML=`<section class="account-trend-note-dialog" role="dialog" aria-modal="true" aria-labelledby="accountTrendNoteTitle"><header><div><b id="accountTrendNoteTitle">资金变动趋势备注</b><span>用于记录当前趋势分析的项目组说明</span></div><button type="button" data-trend-note-close aria-label="关闭">×</button></header><main><textarea id="accountTrendNoteInput" placeholder="请输入备注说明"></textarea></main><footer><button type="button" class="btn" data-trend-note-close>取消</button><button type="button" class="btn primary" data-trend-note-save>保存备注</button></footer></section>`;
      doc.body.appendChild(mask);
      const close=()=>{mask.hidden=true;mask.style.display='none';};
      mask.addEventListener('click',event=>{if(event.target===mask||event.target.closest('[data-trend-note-close]'))close();});
      mask.querySelector('[data-trend-note-save]').addEventListener('click',()=>{trendNote=mask.querySelector('#accountTrendNoteInput').value.trim();close();});
      doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mask.hidden)close();});
    }
    mask.querySelector('#accountTrendNoteInput').value=trendNote;
    mask.hidden=false;mask.style.display='flex';
    requestAnimationFrame(()=>mask.querySelector('#accountTrendNoteInput').focus());
  };
  document.getElementById('accountTrendNoteTrigger')?.addEventListener('click',openTrendNote);
})();
