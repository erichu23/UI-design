(function(){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const contents=[['basic','企业基本信息'],['people','董监高信息'],['shareholders','企业股东'],['investment','对外投资'],['dishonest','失信被执行人'],['lawsuit','法律诉讼']];
  function csvRows(text){
    const rows=[];let row=[],value='',quoted=false;
    text=String(text).replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){
      const char=text[i];
      if(char==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
      else if(!quoted&&(char===','||char==='\n'||char==='\r')){
        row.push(value);value='';
        if(char!==','){if(row.some(cell=>cell.trim()))rows.push(row);row=[];if(char==='\r'&&text[i+1]==='\n')i++;}
      }else value+=char;
    }
    if(quoted)throw new Error('CSV引号未闭合，请检查上传文件');
    row.push(value);if(row.some(cell=>cell.trim()))rows.push(row);
    return rows;
  }
  function normalizeList(matrix){
    if(!matrix.length)throw new Error('名单为空，请上传企业名单');
    const header=matrix[0].map(cell=>String(cell).trim());
    const nameIndex=header.findIndex(value=>['公司名称','企业名称','对手方名称'].includes(value));
    if(nameIndex<0)throw new Error('请使用包含“公司名称”列的模板');
    const tags=[1,2,3].map(index=>header.indexOf('标签'+index));
    const seen=new Set();let duplicates=0;
    const items=matrix.slice(1).flatMap(row=>{
      const name=String(row[nameIndex]||'').trim();
      if(!name)return [];
      if(seen.has(name)){duplicates++;return [];}
      seen.add(name);return [{name,tags:tags.map(index=>index<0?'':String(row[index]||'').trim())}];
    });
    if(!items.length)throw new Error('名单中没有有效的企业名称');
    return {items,duplicates};
  }
  function download(name,matrix){
    const text=matrix.map(row=>row.map(value=>'"'+String(value??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function init(api){
    const launch=document.getElementById('portraitBusinessRefresh'),customLaunch=document.getElementById('portraitCustomBusinessQuery');
    if(!launch||launch.dataset.queryBound)return;
    launch.dataset.queryBound='1';
    const states={current:{items:[],results:[],locked:false,conditions:[{metric:'inflow',top:100},{metric:'outflow',top:100}]},custom:{items:[],results:[],locked:false}};
    let mode='current',busy=false,returnFocus=null;
    const dialog=document.createElement('dialog');dialog.className='portrait-business-dialog';dialog.setAttribute('aria-labelledby','pbqTitle');
    dialog.innerHTML=`<form novalidate>
      <header><div class="pbq-heading"><h2 id="pbqTitle"></h2><button type="submit" class="btn primary">获取工商信息</button><button type="button" class="btn primary" data-query-download hidden>下载报告</button></div><button type="button" class="pbq-close" aria-label="关闭">×</button></header>
      <main><div class="pbq-editbar"><button type="button" class="btn" data-query-edit>编辑</button><span class="pbq-query-indicator" role="status"></span><span class="pbq-updated"></span></div>
      <fieldset class="pbq-fields">
        <section class="pbq-current"><h3>1. 定义需要查询工商信息的对手方的符合条件（取并集）</h3><label class="pbq-master">在被审计单位主档中的公司<select name="master"><option value="exclude">剔除</option><option value="include">包含</option><option value="all">不限</option></select></label><div class="pbq-conditions"></div><button type="button" class="pbq-text" data-query-add>＋ 添加筛选条件</button></section>
        <section class="pbq-custom" hidden><h3>1. 导入需要查询工商信息的企业清单</h3><div class="pbq-uploadbar"><label class="btn pbq-upload">上传待查清单<input type="file" accept=".csv,.xlsx,.xls" hidden></label><button type="button" class="pbq-text" data-query-template>下载模板</button><span class="pbq-file-state">尚未上传企业名单</span></div><div class="pbq-list-wrap"><table><thead><tr><th>公司名称</th><th>标签1</th><th>标签2</th><th>标签3</th></tr></thead><tbody></tbody></table></div><div class="pbq-pagination"></div></section>
        <section><h3>2. 定义所需查询的工商信息内容</h3><div class="pbq-options">${contents.map(([key,label])=>`<label><input type="checkbox" name="${key}" ${key==='basic'?'checked disabled':''}>${label}${key==='basic'?'<small>（默认）</small>':''}${['shareholders','investment'].includes(key)?`<small>（含企业基本信息）</small><span class="pbq-depth">- 穿透 <input type="number" name="${key}Depth" min="1" max="3" value="1" aria-label="${label}穿透层级"> 层</span>`:''}</label>`).join('')}<label class="pbq-coming"><input type="checkbox" disabled>天眼查风险 <small>（暂未开放）</small></label></div></section>
      </fieldset><p class="pbq-error" role="alert"></p></main><footer><span class="pbq-status" role="status"></span><p class="pbq-trial-note">当前该功能处于试运行阶段，暂时不会针对Engagement产生实际成本。</p></footer></form>`;
    document.body.append(dialog);
    const find=selector=>dialog.querySelector(selector),form=find('form');
    let listPage=1;
    function error(message=''){find('.pbq-error').textContent=message;}
    function options(){return contents.filter(([key])=>key==='basic'||form.elements[key].checked).map(([key])=>key);}
    function baseRows(){return api.getRows().filter(row=>api.isCompany(row));}
    function targets(){
      const candidates=baseRows(),selected=new Set();
      states.current.conditions.forEach(condition=>{
        [...candidates].filter(row=>Number(row[condition.metric])>0).sort((a,b)=>b[condition.metric]-a[condition.metric]).slice(0,Number(condition.top)).forEach(row=>selected.add(row.name));
      });
      return candidates.filter(row=>selected.has(row.name)).filter(row=>form.elements.master.value==='all'||(form.elements.master.value==='include'?api.isAudited(row):!api.isAudited(row)));
    }
    function updateCount(){
      const count=mode==='custom'?states.custom.items.length:targets().length;
      find('.pbq-status').textContent=busy?'正在获取工商信息…':states[mode].locked?`已匹配 ${states[mode].results.filter(row=>row.info).length} 家 · 待查询 ${states[mode].results.filter(row=>!row.info).length} 家`:`待查询 ${count} 家企业`;
    }
    function syncQueryStatus(){
      const ready=states[mode].locked,partial=ready&&states[mode].results.some(row=>!row.info);
      const submit=find('[type=submit]'),indicator=find('.pbq-query-indicator');
      dialog.setAttribute('aria-busy',String(busy));
      submit.setAttribute('aria-busy',String(busy));
      submit.innerHTML=busy?'<span class="pbq-spinner" aria-hidden="true"></span><span>正在查询…</span>':'获取工商信息';
      indicator.className='pbq-query-indicator'+(busy?' is-loading':ready?partial?' is-partial':' is-ready':'');
      indicator.textContent=busy?'查询中，请稍候':ready?partial?'查询结束，可导出已获取结果':'查询完成，可导出报告':'设置条件后开始查询';
      const label=mode==='current'?'导出报告':'下载报告';
      find('[data-query-download]').innerHTML=`<i class="fa-solid fa-download" aria-hidden="true"></i><span>${label}</span>`;
    }
    function renderConditions(){
      find('.pbq-conditions').innerHTML=states.current.conditions.map((condition,index)=>`<div class="pbq-condition"><select aria-label="筛选指标" data-condition-metric="${index}">${[['inflow','银行流水流入金额'],['outflow','银行流水流出金额'],['total','银行流水交易总额']].map(([value,label])=>`<option value="${value}" ${condition.metric===value?'selected':''}>${label}</option>`).join('')}</select><span>前</span><input type="number" min="1" max="10000" value="${condition.top}" data-condition-top="${index}" aria-label="排名数量"><span>名</span><button class="pbq-remove" type="button" data-condition-remove="${index}" aria-label="删除条件" ${states.current.conditions.length===1?'disabled':''}>×</button></div>`).join('');
    }
    function paginate(container,page,total,onChange){
      const pages=Math.max(1,Math.ceil(total/8));
      container.innerHTML=`<button type="button" class="btn" ${page<=1?'disabled':''} data-page="${page-1}" aria-label="上一页">‹</button><span>${page} / ${pages} · 共 ${total} 家</span><button type="button" class="btn" ${page>=pages?'disabled':''} data-page="${page+1}" aria-label="下一页">›</button>`;
      container.querySelectorAll('button').forEach(button=>button.onclick=()=>onChange(Number(button.dataset.page)));
    }
    function renderList(){
      const items=states.custom.items;
      find('.pbq-list-wrap tbody').innerHTML=items.length?items.slice((listPage-1)*8,listPage*8).map(item=>`<tr><td title="${esc(item.name)}">${esc(item.name)}</td>${item.tags.map(tag=>`<td title="${esc(tag)}">${esc(tag)}</td>`).join('')}</tr>`).join(''):'<tr><td colspan="4" class="pbq-empty">请上传企业名单</td></tr>';
      paginate(find('.pbq-pagination'),listPage,items.length,page=>{listPage=page;renderList();});
    }
    function lock(value){
      states[mode].locked=value;
      freezeFields();
      dialog.querySelectorAll('header button:not(.pbq-close),.pbq-editbar button').forEach(button=>button.disabled=busy);
      find('[data-query-download]').hidden=!value;
      find('[type=submit]').hidden=value;
      find('.pbq-updated').textContent=states[mode].updated?'查询时间：'+states[mode].updated:'';
      syncEntryLabels();
      updateCount();syncQueryStatus();
    }
    function syncEntryLabels(){
      const ready=states.current.results.length>0;
      launch.querySelector('[data-query-entry-label]').textContent=states.current.busy?'工商信息查询中':ready?'查看对手方工商信息':'获取对手方工商信息';
      launch.title=states.current.busy?'查询正在后台继续，点击查看进度':ready?'查看已有查询结果并导出报告':'设置查询条件并获取对手方工商信息';
      launch.setAttribute('aria-label',launch.title);
      let updated=launch.querySelector('[data-query-entry-updated]');
      if(!updated){updated=document.createElement('span');updated.dataset.queryEntryUpdated='';launch.append(updated);}
      updated.hidden=!ready||Boolean(states.current.busy);
      updated.textContent=ready?'最新更新：'+states.current.updated.slice(0,16):'';
      if(!updated.hidden)launch.setAttribute('aria-label',launch.title+'，'+updated.textContent);
      launch.querySelector('[data-query-entry-icon]').className='pbq-entry-icon '+(ready&&!states.current.busy?'pbq-icon-result':'pbq-icon-search');
      if(customLaunch){
        const customReady=states.custom.results.length>0;
        customLaunch.querySelector('[data-query-entry-label]').textContent=states.custom.busy?'自定义企业查询中':customReady?'查看自定义企业工商信息':'自定义企业工商信息查询';
        customLaunch.title=customReady?'查看已有自定义企业查询结果并下载报告':'上传指定企业名单查询工商信息';
      }
    }
    function freezeFields(){
      find('.pbq-fields').querySelectorAll('input,select,button:not([data-page])').forEach(control=>{
        const depth=control.name.endsWith('Depth')?control.name.replace(/Depth$/,''):null;
        control.disabled=busy||states[mode].locked||control.name==='basic'||Boolean(control.closest('.pbq-coming'))||Boolean(depth&&!form.elements[depth].checked)||control.hasAttribute('data-condition-remove')&&states.current.conditions.length===1;
      });
    }
    function open(kind,trigger){
      mode=kind;returnFocus=trigger;
      busy=Boolean(states[kind].busy);
      if(states[kind].results.length||busy){
        if(!busy)states[kind].locked=true;
        const snapshot=busy?states[kind].pendingSnapshot:states[kind].snapshot;
        if(snapshot){
          if(kind==='current'){states.current.conditions=snapshot.conditions.map(row=>({...row}));form.elements.master.value=snapshot.master;}
          else states.custom.items=snapshot.items.map(row=>({...row,tags:[...row.tags]}));
        }
      }
      find('#pbqTitle').textContent=kind==='current'?'导出包含交易信息和工商信息的对手方清单':'导出特定企业列表的工商信息清单';
      find('.pbq-current').hidden=kind!=='current';find('.pbq-custom').hidden=kind!=='custom';
      // Keep each workflow's content choices independent when reopening its dialog.
      const saved=states[kind].settings||{basic:true};
      contents.forEach(([key])=>{form.elements[key].checked=key==='basic'||Boolean(saved[key]);});
      ['shareholders','investment'].forEach(key=>{
        form.elements[key+'Depth'].value=saved[key+'Depth']||1;
      });
      renderConditions();renderList();lock(states[kind].locked);error();dialog.showModal();
    }
    function close(){dialog.close();returnFocus?.focus();}
    launch.addEventListener('click',()=>open('current',launch));
    customLaunch?.addEventListener('click',()=>open('custom',customLaunch));
    syncEntryLabels();
    find('.pbq-close').onclick=close;
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    find('[data-query-edit]').onclick=()=>{lock(false);error();find('.pbq-fields input:not(:disabled),.pbq-fields select')?.focus();};
    find('[data-query-add]').onclick=()=>{states.current.conditions.push({metric:'total',top:100});renderConditions();updateCount();};
    find('.pbq-conditions').addEventListener('click',event=>{
      const button=event.target.closest('[data-condition-remove]');if(!button)return;
      states.current.conditions.splice(Number(button.dataset.conditionRemove),1);renderConditions();updateCount();
    });
    form.addEventListener('input',event=>{
      if(event.target.matches('[data-condition-top]'))states.current.conditions[Number(event.target.dataset.conditionTop)].top=event.target.value;
      updateCount();
    });
    form.addEventListener('change',event=>{
      if(event.target.matches('[data-condition-metric]'))states.current.conditions[Number(event.target.dataset.conditionMetric)].metric=event.target.value;
      freezeFields();
      updateCount();
    });
    find('[data-query-template]').onclick=()=>download('企业工商信息查询模板.csv',[['公司名称','标签1','标签2','标签3']]);
    find('[type=file]').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file)return;
      try{
        let matrix;
        if(/\.csv$/i.test(file.name))matrix=csvRows(await file.text());
        else if(window.XLSX){const workbook=window.XLSX.read(await file.arrayBuffer(),{type:'array'});matrix=window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{header:1,raw:false,defval:''});}
        else throw new Error('当前环境支持CSV名单，请下载模板填写后上传CSV文件');
        const parsed=normalizeList(matrix);states.custom.items=parsed.items;states.custom.results=[];listPage=1;
        find('.pbq-file-state').textContent=`${file.name} · ${parsed.items.length} 家${parsed.duplicates?` · 已去重 ${parsed.duplicates} 家`:''}`;
        renderList();updateCount();error();
      }catch(reason){error(reason.message);}finally{event.target.value='';}
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(busy||states[mode].locked)return;
      if(!form.reportValidity())return;
      if(mode==='current'&&states.current.conditions.some(item=>!Number.isInteger(Number(item.top))||Number(item.top)<1)){error('排名数量请输入大于0的整数');return;}
      const selected=mode==='current'?targets():states.custom.items;
      if(!selected.length){error(mode==='current'?'当前条件下没有可查询的企业，请调整条件':'请先上传企业名单');return;}
      const settings=Object.fromEntries(contents.map(([key])=>[key,key==='basic'||form.elements[key].checked]));
      ['shareholders','investment'].forEach(key=>settings[key+'Depth']=Number(form.elements[key+'Depth'].value));
      const kind=mode,query=states[kind],fields=options();
      const snapshot={conditions:states.current.conditions.map(row=>({...row})),master:form.elements.master.value,items:states.custom.items.map(row=>({...row,tags:[...row.tags]}))};
      query.settings=settings;query.busy=true;query.pendingSnapshot=snapshot;busy=true;error();freezeFields();
      dialog.querySelectorAll('header button:not(.pbq-close),.pbq-editbar button').forEach(button=>button.disabled=true);updateCount();syncQueryStatus();syncEntryLabels();
      try{
        const known=new Map(api.getAllRows().map(row=>[row.name,row]));
        const matched=selected.map(row=>known.get(row.name)).filter(Boolean);
        if(kind==='current'&&matched.length)await api.onQuery(matched,fields);
        query.results=selected.map(row=>({...row,info:known.has(row.name)?api.getInfo(known.get(row.name)):null}));
        query.snapshot=snapshot;query.updated=new Date().toLocaleString('sv-SE');query.busy=false;query.locked=true;
        if(mode===kind){
          busy=false;lock(true);
          if(query.results.some(row=>!row.info))error('当前为演示环境，未匹配企业尚未接入工商查询接口，下载结果中将保留待查询状态。');
        }
      }catch(reason){query.busy=false;query.locked=false;if(mode===kind){busy=false;lock(false);error(reason.message||'获取失败，请重试');}}
      finally{syncEntryLabels();}
    });
    find('[data-query-download]').onclick=()=>{
      const keys=states[mode].settings||{},columns=[['经营状态','status'],['成立日期','founded'],['注册资本（万元）','capital'],['注册地址','address'],['经营范围','scope']];
      if(keys.people)columns.push(['董事','directors'],['监事','supervisors'],['高管','executives']);
      if(keys.shareholders)columns.push(['企业股东','shareholders']);
      if(keys.investment)columns.push(['对外投资','investment']);
      if(keys.dishonest)columns.push(['失信被执行人','dishonest']);
      if(keys.lawsuit)columns.push(['法律诉讼笔数','lawsuit']);
      download(mode==='current'?'对手方交易及工商信息.csv':'自定义企业工商信息.csv',[
        ['公司名称','标签1','标签2','标签3','查询状态',...(mode==='current'?['流入金额（千元）','流出金额（千元）']:[]),...columns.map(([label])=>label)],
        ...states[mode].results.map(row=>[row.name,...(row.tags||['','','']),row.info?'已获取（演示）':'待查询',...(mode==='current'?[row.inflow,row.outflow]:[]),...columns.map(([,key])=>row.info?.[key]??'未提供')])
      ]);
    };
  }
  window.PortraitBusinessQuery=Object.freeze({init,csvRows,normalizeList});
})();
