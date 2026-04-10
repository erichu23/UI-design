/* =============== 特定工商查询 Routine 区域 =============== */
    (function(){
      "use strict";

      /* ---------- 通用小工具 ---------- */

      // 金额：单位“万”的格式化
      window.fmtWan = window.fmtWan || (n => {
        const v = Number(n) || 0;
        return v.toLocaleString('zh-CN');
      });

      // 简单分页
      window.paginate = window.paginate || function(arr, page, size){
        const ps = Number(size) || 10;
        const p  = Math.max(1, Number(page) || 1);
        return (arr || []).slice((p-1)*ps, p*ps);
      };

      // 分页按钮
      window.renderPagination = window.renderPagination || function(eleId, total, current, handler){
        const ps    = 10;
        const pages = Math.max(1, Math.ceil((total||0)/ps));
        const host  = document.getElementById(eleId);
        if (!host) return;
        let html = '';
        for (let i = 1; i <= pages; i++){
          html += `<button class="btn ${i===current?'btn-primary':''}" onclick="${handler}(${i})">${i}</button>`;
        }
        host.innerHTML = html;
      };

      // echarts 快捷渲染
      window.ez = window.ez || function(domId,opt){
        if (typeof echarts === 'undefined') {
          console.error('[Routine] echarts 未加载');
          return null;
        }
        const el = document.getElementById(domId);
        if(!el) return null;
        const inst = echarts.getInstanceByDom(el) || echarts.init(el, null, {renderer:'canvas', useDirtyRect:true});
        inst.setOption(opt, {notMerge:true, lazyUpdate:true});
        return inst;
      };

      // 若外面没定义 Top20，给个空函数防报错
      window.renderTop20 = window.renderTop20 || function(){};
      
      
      /* ---------- Routine 默认配置（1 & 2） ---------- */
      const ROUTINE_DEFAULTS = {
        // 1. 经营时间较短
        '2.1': { years: [1, 3, 5], labels: ['1年内','1-3年','3-5年','5年以上'] },
        // 2. 社保缴纳人数较少
        '2.2': { breaks:[50,100,500], labels: ['<=50','51-99','100-499','≥500'] },
        '2.4': { breaks:[0.5,2,10], labels: ['<=0.5','0.5-2','2-10','≥10'] }

      };

      

      /* ---------- Routine3 类型定义：6 个卡片 ---------- */
      const ROUTINE3_TYPES = [
        { key:'个体工商户',  class:'kpi-red',    color:'#ef4444' }, // 红
        { key:'个人独资企业', class:'kpi-orange', color:'#f59e0b' }, // 黄
        { key:'合伙企业',    class:'kpi-blue',   color:'#2563eb' }, // 蓝
        { key:'有限责任公司', class:'kpi-blue',   color:'#2563eb' }, // 蓝
        { key:'股份有限公司', class:'kpi-blue',   color:'#2563eb' }, // 蓝
        { key:'其他',        class:'kpi-blue',   color:'#2563eb' }  // 蓝
      ];

      /* ---------- 全局状态 ---------- */
      const routineState = {
        code: '2.1',       // '2.1' | '2.2' | '2.3'
        labels: [],
        breaks: [],
        raw: [],
        list: []
      };

      /* ---------- demo 数据（没传 companies 就造一批） ---------- */
      function generateDemoCompanies(){
        const types = ['个体工商户','个人独资企业','合伙企业','有限责任公司','股份有限公司','其他'];
        const arr = [];
        for(let i=1;i<=80;i++){
          const ctype = types[Math.floor(Math.random()*types.length)];
          const txCnt  = Math.floor(Math.random()*200)+1;          // 1~200 笔
          const total  = Math.floor((Math.random()*40000)+2000);   // 2,000~42,000 万
          const inflow = total * (0.5 + Math.random()*0.4);
          const outflow= total - inflow;
          const employees = Math.floor(Math.random()*300);
          const days = Math.floor(Math.random()*365*8); // 8年内

          arr.push({
            id: i,
            name: '对手方'+i,
            ctype,
            relation: (Math.random()<0.2?'关联':'非关联'),
            sales: '销售类别'+((i%4)+1),
            purchase: '采购类别'+((i%4)+1),
            job: '岗位'+((i%5)+1),
            industry: '行业'+((i%6)+1),
            capital: (Math.random()*5000).toFixed(0),
            foundedDate: null,
            employees,
            type: '',
            txCnt,
            inflow,
            outflow,
            total,
            foundedDays: days
          });
        }
        return arr;
      }

      function daysSince(dateStr){
        if (!dateStr) return 0;
        const d = new Date(String(dateStr).replace(/-/g,'/'));
        if (isNaN(d)) return 0;
        return Math.max(0, Math.floor((Date.now()-d.getTime())/86400000));
      }

      function mapRecord(raw){
        return {
          id: raw.id,
          name: raw.name,
          ctype: raw.ctype,
          relation: raw.relation,
          sales: raw.sales,
          purchase: raw.purchase,
          job: raw.job,
          industry: raw.industry,
          capital: raw.capital,
          foundedDate: raw.foundedDate || raw.startDate || '',
          employees: Number(raw.employees)||0,
          type: raw.type,
          txCnt: Number(raw.txCnt)||0,
          inflow: Number(raw.inflow)||0,
          outflow: Number(raw.outflow)||0,
          total: Number(raw.total)||0,
          foundedDays: raw.foundedDays ?? daysSince(raw.startDate || raw.foundedDate)
        };
      }

      // 把当前 window.companies 刷到 routineState.list
      function refreshListFromCompanies(){
        if (!Array.isArray(window.companies) || !window.companies.length){
          window.companies = generateDemoCompanies();
        }
        routineState.raw  = window.companies;
        routineState.list = routineState.raw.map(mapRecord);
      }

      /* ---------- 箱线图统计 ---------- */
      function quartiles(arr){
        const a = arr.slice().sort((x,y)=>x-y);
        if (!a.length) return [0,0,0,0,0];
        const q = p => {
          const pos = (a.length - 1) * p;
          const lo  = Math.floor(pos);
          const hi  = Math.ceil(pos);
          return a[lo]*(hi-pos) + a[hi]*(pos-lo);
        };
        return [a[0], q(0.25), q(0.5), q(0.75), a[a.length-1]];
      }

      // 小箱线：白色 + tooltip 显示 min/max/median/Q1/Q3
      function renderSmallBoxplot(domId, stats, title){
        const el = document.getElementById(domId);
        if (!el) return;
        const inst = echarts.getInstanceByDom(el) || echarts.init(el);
        inst.setOption({
          grid:{left:0,right:0,top:0,bottom:0},
          xAxis:{ type:'category', data:[' '], show:false },
          yAxis:{ type:'value', show:false },
          tooltip:{
            confine:true,
            formatter: () => {
              const [min,q1,med,q3,max] = stats;
              return [
                `<b>${title||''}</b>`,
                `最小值：${fmtWan(min)} 万`,
                `最大值：${fmtWan(max)} 万`,
                `中位数：${fmtWan(med)} 万`,
                `四分之一位：${fmtWan(q1)} 万`,
                `四分之三位：${fmtWan(q3)} 万`
              ].join('<br/>');
            }
          },
          series:[{
            type:'boxplot',
            itemStyle:{
              color:'rgba(225,225,225,0)',
              borderColor:'#ffffff'
              
            },
            data:[stats]
          }]
        });
      }

      /* ---------- Routine1/2 分组：按 breaks 分 4 段 ---------- */
      function groupByBreaks(list){
        const b = routineState.breaks || [];
        const code = routineState.code;
        const groups = [[],[],[],[]];
        list.forEach(r=>{
          const x = (code==='2.1') ? r.foundedDays : r.employees;
          let idx = 3;
          if (b && b.length===3){
            idx = (x < b[0]) ? 0 : (x < b[1]) ? 1 : (x < b[2]) ? 2 : 3;
          }
          groups[idx].push(r);
        });
        return groups;
      }

      /* ---------- Routine3 分组：按企业类型 6 组 ---------- */
      function groupForRoutine3(list){
        const groups = [[],[],[],[],[],[]];
        list.forEach(r=>{
          const t = (r.ctype || '').trim();
          let idx = 5; // 默认“其他”
          if (t === '个体工商户') idx = 0;
          else if (t === '个人独资企业') idx = 1;
          else if (t === '合伙企业') idx = 2;
          else if (t === '有限责任公司') idx = 3;
          else if (t === '股份有限公司') idx = 4;
          groups[idx].push(r);
        });
        return groups;
      }

      /* ---------- 顶部 4/6 卡片 ---------- */
      function renderRoutineStrip(){
      const list = (routineState.list||[]).slice();
      const code = routineState.code;
      const host = document.getElementById('topStrip');
      if (!host) return;

      let html = '';

      if (code === '2.3'){
        // Routine3：6 个卡片
        const groups = groupForRoutine3(list);
        html = groups.map((g,i)=>{
          const tp = ROUTINE3_TYPES[i];
          const inSum  = g.reduce((s,x)=>s+x.inflow,0);
          const outSum = g.reduce((s,x)=>s+x.outflow,0);
          const vals   = g.map(x=>x.total);
          const stats  = vals.length ? quartiles(vals) : [0,0,0,0,0];
          const bpId   = `kpi-bp-3-${i}`;

          return `
            <div class="kpi-box-card ${tp.class}">
              <div class="kpi-left">
                <div class="kpi-title">${tp.key}</div>
                <div class="kpi-item"><span>对手方数量：</span><b>${g.length}</b> 家</div>
                <div class="kpi-item"><span>累计流入：</span><b>${fmtWan(inSum)}</b> 万</div>
                <div class="kpi-item"><span>累计流出：</span><b>${fmtWan(outSum)}</b> 万</div>
              </div>
              <div class="kpi-boxplot">
                <div class="boxplot-chart" id="${bpId}"></div>
              </div>
            </div>`;
        }).join('');

        host.innerHTML = html;

        // 用上面同一个 groups 画 6 个箱线图，不要再 const groups 了
        groups.forEach((g,i)=>{
          const vals  = g.map(x=>x.total);
          const stats = vals.length ? quartiles(vals) : [0,0,0,0,0];
          renderSmallBoxplot(`kpi-bp-3-${i}`, stats, ROUTINE3_TYPES[i].key);
        });

      } else {
        // Routine1 / Routine2 原来的分段逻辑保持不变
        const groups = groupByBreaks(list);
        const lab  = routineState.labels || [];
        const colorClass = ['kpi-red','kpi-orange','kpi-blue','kpi-blue'];

        html = groups.map((g,i)=>{
          const inSum  = g.reduce((s,x)=>s+x.inflow,0);
          const outSum = g.reduce((s,x)=>s+x.outflow,0);
          const vals   = g.map(x=>x.total);
          const stats  = vals.length ? quartiles(vals) : [0,0,0,0,0];
          const bpId   = `kpi-bp-${i}`;
          return `
            <div class="kpi-box-card ${colorClass[i]}">
              <div class="kpi-left">
                <div class="kpi-title">${lab[i] || ('区间'+(i+1))}</div>
                <div class="kpi-item"><span>对手方数量：</span><b>${g.length}</b> 家</div>
                <div class="kpi-item"><span>累计流入：</span><b>${fmtWan(inSum)}</b> 万</div>
                <div class="kpi-item"><span>累计流出：</span><b>${fmtWan(outSum)}</b> 万</div>
              </div>
              <div class="kpi-boxplot">
                <div class="boxplot-chart" id="${bpId}"></div>
              </div>
            </div>`;
        }).join('');

        host.innerHTML = html;

        const groups2 = groupByBreaks(list);
        groups2.forEach((g,i)=>{
          const vals  = g.map(x=>x.total);
          const stats = vals.length ? quartiles(vals) : [0,0,0,0,0];
          renderSmallBoxplot(`kpi-bp-${i}`, stats, routineState.labels[i]);
        });
      }
    }

      /* ---------- 气泡图 / 散点图 ---------- */
      function renderScatterAndBox(){
        const list  = (routineState.list || []).slice();
        const code  = routineState.code;

        let xName = 'X';
        if (code === '2.1') xName = '经营天数';
        else if (code === '2.2') xName = '缴纳人数';
        else if (code === '2.3') xName = '交易笔数';

        let groups, series;

        if (code === '2.3'){
          // Routine3：按 6 类型分组，X=txCnt, Y=total
          groups = groupForRoutine3(list);
          series = groups.map((g,i)=>({
            name: ROUTINE3_TYPES[i].key,
            type:'scatter',
            data: g.map(r=>({
              name: r.name,
              value: [r.txCnt, r.total],
              symbolSize: Math.max(10, Math.sqrt(Math.abs(r.total||0))/40 + 8),
              itemStyle:{ color: ROUTINE3_TYPES[i].color },
              extra: r
            })),
            emphasis:{ focus:'series', scale:1.15 }
          }));
        } else {
          // Routine1/2：按 breaks 分 4 组，X=days or employees, Y=total
          groups = groupByBreaks(list);
          const colors = ['#ef4444','#f59e0b','#2563eb','#2563eb'];
          series = groups.map((g,i)=>({
            name: routineState.labels[i] || ('区间'+(i+1)),
            type:'scatter',
            data: g.map(r=>{
              const xVal = (code==='2.1') ? r.foundedDays : r.employees;
              return {
                name: r.name,
                value: [xVal, r.total],
                symbolSize: Math.max(10, Math.sqrt(Math.abs(r.total||0))/40 + 8),
                itemStyle:{ color: colors[i] },
                extra: r
              };
            }),
            emphasis:{ focus:'series', scale:1.15 }
          }));
        }

        // === 专为“左下留足空间”定的常量 ===
        const SLIDER_H   = 20;   // 底部滑块高度
        const GAP        = 5;   // 轴标签与滑块的间距
        const X_LABEL_H  = 5;   // x轴刻度与名称所需高度
        const GRID_LEFT  = 15;   // 左侧给y轴刻度留的空间
        const GRID_right  = 56;
        const GRID_TOP   = 44;   // 仅把“绘图区”向下移，标题不动
        const GRID_BOTTOM= SLIDER_H + GAP + X_LABEL_H;

        ez('chart-scatter',{
          grid:{ left: GRID_LEFT, GRID_right, top: GRID_TOP, bottom: GRID_BOTTOM, containLabel: true },

          legend:{ top: 6, right: 10, icon:'circle', itemWidth:8, itemHeight:8, textStyle:{ fontSize:11 }},

          tooltip: {
            trigger: "item",
            formatter: p => {
              const d = p.data.extra;
              const seriesName = p.seriesName || "";
              const xVal =
                code === "2.1"
                  ? d.foundedDays + " 天"
                  : code === "2.2"
                  ? d.employees + " 人"
                  : "#" + (p.dataIndex + 1);

              return [
                `<b>${d.name}</b>`,
                seriesName ? `所属区间：${seriesName}` : "",
                `X：${xVal}`,
                `流入：${fmtWan(d.inflow)} 万`,
                `流出：${fmtWan(d.outflow)} 万`,
                `交易额：<b>${fmtWan(d.total)} 万</b>`,
                `交易笔数：${d.txCnt || 0}`
              ]
                .filter(Boolean)
                .join("<br/>");
            }
          },

          xAxis:{
            name: xName,
            type:'value',
            axisLine:{ onZero:false },
            axisLabel:{ fontSize:11, margin: 16 },  // 与滑块拉开
            nameTextStyle:{ fontSize:12 },
            nameGap: 20
          },
          yAxis:{
            name:'交易金额(万)',
            type:'value',
            axisLabel:{ fontSize:11, margin: 10 },
            nameTextStyle:{ fontSize:12 },
            nameGap: 18
          },

          dataZoom:[
            { type:'inside', xAxisIndex:0, filterMode:'none' },
            {
              type:'slider',
              xAxisIndex:0,
              height: SLIDER_H,
              bottom: 6,                           // 滑块再往下 6px 缓冲
              borderColor:'#e5e7eb',
              backgroundColor:'#f1f5f9',
              fillerColor:'rgba(37,99,235,0.18)',
              showDetail:false
            }
          ],

          series   // ← 保持你现有的 series
        });
        // 放在上面那段 ez(...) 调用的后面紧跟着
        setTimeout(()=>{
          const el = document.getElementById('chart-scatter');
          const inst = el && echarts.getInstanceByDom(el);
          inst && inst.resize();
        }, 0);

        // 全局监听窗口尺寸变化（若没有的话可以加上）
        window.addEventListener('resize', ()=>{
          const el = document.getElementById('chart-scatter');
          const inst = el && echarts.getInstanceByDom(el);
          inst && inst.resize();
        });
        const __pendingCharts = new Map();  // domId -> option

        window.ez = function(domId, opt){
          if (typeof echarts === 'undefined') {
            console.error('[Routine] echarts 未加载'); return null;
          }
          const el = document.getElementById(domId);
          if (!el) return null;

          // 若容器不可见或宽高为 0，先缓存，等显示后再渲染
          const invisible = (el.offsetParent === null) || (el.clientWidth === 0) || (el.clientHeight === 0);
          if (invisible) { __pendingCharts.set(domId, opt); return null; }

          let inst = echarts.getInstanceByDom(el);
          if (!inst) inst = echarts.init(el, null, {renderer:'canvas', useDirtyRect:true});
          inst.setOption(opt, {notMerge:true, lazyUpdate:true});
          return inst;
        };
      }

      // 刷新暂存的图 + 对 pane 内所有图 resize
      window.flushChartsInPane = function(paneSel){
        // 先补渲染 pending
        __pendingCharts.forEach((opt, id)=>{
          const el = document.getElementById(id);
          if (el && el.clientWidth > 0 && el.clientHeight > 0 && (!paneSel || el.closest(paneSel))){
            __pendingCharts.delete(id);
            window.ez(id, opt);
          }
        });
        // 再统一 resize 已有实例
        if (paneSel){
          document.querySelectorAll(`${paneSel} .boxplot-chart, ${paneSel} [id^="chart-"], ${paneSel} #chart-scatter`)
            .forEach(el=>{
              const inst = echarts.getInstanceByDom(el);
              if (inst) inst.resize();
            });
        }
      };

 
      /* ---------- 交易明细表（一个表，共用） ---------- */
      let currentRoutinePage = 1;
      window.gotoRoutine = function(p){ currentRoutinePage = p; renderRoutineTable(); };

      function renderRoutineTable(){
        const list = (routineState.list||[]).slice();
        const pageItems = paginate(list, currentRoutinePage, 10);
        const thead = document.querySelector('#tblRoutineDetail thead');
        const tbody = document.querySelector('#tblRoutineDetail tbody');
        if (!thead || !tbody) return;

        thead.innerHTML = `
          <tr>
            <th>对手方名称</th><th>流入总额</th><th>流出总额</th><th>交易总额</th>
            <th>异常交易总额</th><th>占比1</th><th>占比2</th>
            <th>异常交易笔数</th><th>交易次数</th><th>对手方类型</th>
            <th>关联关系</th><th>销售类别</th><th>采购类别</th>
            <th>职位</th><th>所属集团</th>
          </tr>`;

        tbody.innerHTML = pageItems.map(d=>`
          <tr>
            <td>${d.name||'-'}</td>
            <td style="color:#2563eb">${fmtWan(d.inflow)}</td>
            <td style="color:#ef4444">${fmtWan(d.outflow)}</td>
            <td><b>${fmtWan(d.total)}</b></td>
            <td>${fmtWan(d.outflow*0.15)}</td>
            <td>${(Math.random()*10).toFixed(2)}%</td>
            <td>${(Math.random()*5).toFixed(2)}%</td>
            <td>${Math.floor((d.txCnt||0)*0.1)}</td>
            <td>${d.txCnt||0}</td>
            <td>${d.ctype||'-'}</td>
            <td>${d.relation||'-'}</td>
            <td>${d.sales||'-'}</td>
            <td>${d.purchase||'-'}</td>
            <td>${d.job||'-'}</td>
            <td>集团${(d.id||0)%5+1}</td>
          </tr>`).join('');

        renderPagination('pagination-routine', list.length, currentRoutinePage, 'gotoRoutine');
      }

      /* ---------- 一键刷新 ---------- */
      function updateAllRoutineViews(){
        refreshListFromCompanies();       // 先保证 list 有数据
        renderRoutineStrip();
        renderScatterAndBox();
        renderTop20();
        renderRoutineTable();
      }

      /* ---------- 左侧菜单切换 ---------- */
      const routineMenu = document.getElementById('routineMenu');
      routineMenu && routineMenu.addEventListener('click', e=>{
        const it = e.target.closest('.item'); if (!it) return;
        [...routineMenu.children].forEach(m=>m.classList.remove('active'));
        it.classList.add('active');
        renderRoutine(it.dataset.code);
      });


      /* ---------- 切换 Routine 1 / 2 / 3 / 4 ---------- */
      /* ---------- 切换 Routine 1 / 2 / 3 / 4 / 7 ---------- */
      function renderRoutine(code){
        routineState.code = code;
        document.getElementById('pane-routine').setAttribute('data-routine', code);

        // ★★ 2.7：只显示地图页，隐藏通用块
        const r7xBlock = document.getElementById('r7x');
        const commonBlock = document.getElementById('routineCommon');

        if (code === '2.7') {
          if (commonBlock) commonBlock.style.display = 'none';
          if (r7xBlock) { r7xBlock.style.display = ''; }
          if (window.R7X && typeof window.R7X.show === 'function') {
            window.R7X.show();
          }
          return; // 不再往下跑其它 Routine 的更新逻辑
        } else {
          // 离开 2.7，隐藏地图块，恢复通用区
          if (r7xBlock) r7xBlock.style.display = 'none';
          if (window.R7X && typeof window.R7X.hide === 'function') window.R7X.hide();
          if (commonBlock) commonBlock.style.display = '';
        }

        // 下面仍是你原有的 2.1~2.4 分支
        if (code==='2.1'){
          routineState.breaks = ROUTINE_DEFAULTS['2.1'].years.map(x=>x*365);
          routineState.labels = ROUTINE_DEFAULTS['2.1'].labels.slice();
          const t1 = document.getElementById('rTitle'); if(t1) t1.textContent = '经营时间汇总指标';
          const st = document.getElementById('scatterTitle'); if(st) st.textContent = '经营时间分布表';
        } else if (code==='2.2'){
          routineState.breaks = ROUTINE_DEFAULTS['2.2'].breaks.slice();
          routineState.labels = ROUTINE_DEFAULTS['2.2'].labels.slice();
          const t1 = document.getElementById('rTitle'); if(t1) t1.textContent = '社保缴纳人数汇总指标';
          const st = document.getElementById('scatterTitle'); if(st) st.textContent = '社保缴纳人数分布表';
        } else if (code==='2.3'){
          routineState.breaks = [];
          routineState.labels = ROUTINE3_TYPES.map(x=>x.key);
          const t1 = document.getElementById('rTitle'); if(t1) t1.textContent = '主体类型汇总指标';
          const st = document.getElementById('scatterTitle'); if(st) st.textContent = '主体类型分布表';
        } else if (code==='2.4'){
          routineState.breaks = ROUTINE_DEFAULTS['2.4'].breaks.slice();
          routineState.labels = ROUTINE_DEFAULTS['2.4'].labels.slice();
          const t1 = document.getElementById('rTitle'); if(t1) t1.textContent = '交易总额/注册资本 汇总指标';
          const st = document.getElementById('scatterTitle'); if(st) st.textContent = '交易规模分布表';
        }

        currentRoutinePage = 1;
        if (typeof updateAllRoutineViews === 'function') updateAllRoutineViews();
      }

      // 初始进入：Routine1
      renderRoutine('2.1');
    })();


    /* ========== Routine7 模块：左指标｜右地图，含模拟数据 ========== */
    /* ========== Routine7 常量 ========== */
    const R7X_LEVELS = {
      city:     { label:'同市',     color:'#2563eb' },
      district: { label:'同区/县',  color:'#16a34a' },
      street:   { label:'同街道',   color:'#f59e0b' },
      near:     { label:'距离<1km', color:'#ef4444' },
      other:    { label:'其他',     color:'#334155' }
    };

    function toRad(d){ return d*Math.PI/180; }
    function haversine(a,b){
      const R=6371;
      const dLat=toRad((b.lat||0)-(a.lat||0));
      const dLng=toRad((b.lng||0)-(a.lng||0));
      const s1=Math.sin(dLat/2), s2=Math.sin(dLng/2);
      return 2*R*Math.asin(Math.sqrt(s1*s1 + Math.cos(toRad(a.lat||0))*Math.cos(toRad(b.lat||0))*s2*s2));
    }
    function fmtWan(n){ return (Number(n)||0).toLocaleString('zh-CN'); }

    /* ========== Demo 数据兜底（你有真实数据时，会被覆盖） ========== */
    if(!window.auditUnits){
      window.auditUnits = [
        { id:'A', name:'被审计单位A（北京）', city:'北京市', district:'朝阳区', street:'建国路', lng:116.4736, lat:39.9146 },
        { id:'B', name:'被审计单位B（上海）', city:'上海市', district:'浦东新区', street:'世纪大道', lng:121.5120, lat:31.2400 },
      ];
    }
    if(!Array.isArray(window.companies) || !window.companies.length){
      const genAround = (anchor, n=100) => {
        const arr=[];
        for(let i=0;i<n;i++){
          const km = (Math.random()<0.75 ? (Math.random()*4 + 0.2) : (Math.random()*20 + 5));
          const brg = Math.random()*360;
          const dLat = (km/111) * Math.cos(toRad(brg));
          const dLng = (km/(111*Math.cos(toRad(anchor.lat)))) * Math.sin(toRad(brg));
          const inflow  = Math.floor(Math.random()*8000+500);
          const outflow = Math.floor(Math.random()*6000+300);
          arr.push({
            id:`${anchor.id}-${i+1}`,
            name:`对手方_${anchor.id}_${i+1}`,
            city: anchor.city,
            district: i%2? anchor.district : '其他区',
            street: i%3? anchor.street : '其他街',
            lng: anchor.lng + dLng, lat: anchor.lat + dLat,
            inflow, outflow, total: inflow+outflow
          });
        }
        return arr;
      };
      window.companies = [...genAround(window.auditUnits[0]), ...genAround(window.auditUnits[1])];
    }

    /* ========== Routine7 模块 ========== */
    (function(){
      let map, groups, anchorMarker;

      function classify(cp, anchor){
        const d = haversine(cp, anchor); // km
        if (d < 1) return {level:'near', dist:d};
        if (cp.street   && anchor.street   && cp.street   === anchor.street)   return {level:'street',   dist:d};
        if (cp.district && anchor.district && cp.district === anchor.district) return {level:'district', dist:d};
        if (cp.city     && anchor.city     && cp.city     === anchor.city)     return {level:'city',     dist:d};
        return {level:'other', dist:d};
      }

      function ensureMap(anchor){
        if (map) return;
        map = L.map('r7xMap', { zoomControl:false, attributionControl:false });
        L.control.zoom({ position:'topleft' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);

        groups = {
          city: L.layerGroup().addTo(map),
          district: L.layerGroup().addTo(map),
          street: L.layerGroup().addTo(map),
          near: L.layerGroup().addTo(map),
          other: L.layerGroup().addTo(map),
        };

        const starSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
            <path fill="#111827" d="M12 2l3 6 6 .9-4.5 4.4 1 6.3L12 17l-5.5 2.6 1-6.3L3 8.9 9 8z" opacity=".9"/>
            <circle cx="12" cy="12" r="2" fill="#f59e0b"/>
          </svg>`;
        const starIcon = L.divIcon({ className:'', html:starSvg, iconSize:[28,28], iconAnchor:[14,14] });
        anchorMarker = L.marker([anchor.lat, anchor.lng], { icon: starIcon })
          .bindPopup(`<b>${anchor.name}</b><br>锚点（被审计单位）`)
          .addTo(map);
      }

      function setKpi(suffix, o){
        document.getElementById(`r7x${suffix}Cnt`).textContent = String(o.cnt||0);
        document.getElementById(`r7x${suffix}In`).textContent  = fmtWan(o.in||0)+' 万';
        document.getElementById(`r7x${suffix}Out`).textContent = fmtWan(o.out||0)+' 万';
      }

      function renderTable(rows){
        const tb = document.querySelector('#r7xTable tbody'); if(!tb) return;
        tb.innerHTML = rows.map(({cp,level,dist})=>`
          <tr>
            <td>${cp.name}</td>
            <td>${R7X_LEVELS[level].label}</td>
            <td>${dist.toFixed(2)}</td>
            <td>${cp.city||'-'}</td>
            <td>${cp.district||'-'}</td>
            <td>${cp.street||'-'}</td>
            <td>${(cp.lng||0).toFixed(5)}</td>
            <td>${(cp.lat||0).toFixed(5)}</td>
            <td>${fmtWan(cp.inflow)}</td>
            <td>${fmtWan(cp.outflow)}</td>
            <td><b>${fmtWan(cp.total)}</b></td>
          </tr>
        `).join('');
      }

      function levelOrder(l){ return ['near','street','district','city','other'].indexOf(l); }

      function refresh(anchor, visible){
        // 清空图层
        Object.values(groups).forEach(g=>g.clearLayers());
        if (anchorMarker){
          anchorMarker.setLatLng([anchor.lat, anchor.lng]);
          anchorMarker.setPopupContent(`<b>${anchor.name}</b><br>锚点（被审计单位）`);
        }
        map.setView([anchor.lat, anchor.lng], 12);

        // 统计
        const stat = {
          city:{cnt:0,in:0,out:0}, district:{cnt:0,in:0,out:0},
          street:{cnt:0,in:0,out:0}, near:{cnt:0,in:0,out:0}, other:{cnt:0,in:0,out:0}
        };

        const rows = [];
        (window.companies||[]).forEach(cp=>{
          const {level, dist} = classify(cp, anchor);
          stat[level].cnt++; stat[level].in+=cp.inflow; stat[level].out+=cp.outflow;
          if (visible[level]){
            const dot = L.circleMarker([cp.lat, cp.lng], {
              radius: Math.max(5, Math.sqrt(Math.abs(cp.total||0))/60 + 4),
              color: R7X_LEVELS[level].color, fillColor:R7X_LEVELS[level].color, fillOpacity:.85, weight:0.8
            }).bindPopup([
              `<b>${cp.name}</b>`,
              `级别：${R7X_LEVELS[level].label}`,
              `距离：${dist.toFixed(2)} km`,
              `流入：${fmtWan(cp.inflow)} 万`,
              `流出：${fmtWan(cp.outflow)} 万`,
              `交易额：<b>${fmtWan(cp.total)} 万</b>`
            ].join('<br/>'));
            dot.addTo(groups[level]);
            rows.push({cp, level, dist});
          }
        });

        // KPI
        setKpi('City', stat.city);
        setKpi('District', stat.district);
        setKpi('Street', stat.street);
        setKpi('Near', stat.near);
        document.getElementById('r7xAnchorXY').textContent =
          `(${anchor.lng.toFixed(5)}, ${anchor.lat.toFixed(5)})`;

        // 明细表
        rows.sort((a,b)=> a.level===b.level ? a.dist-b.dist : levelOrder(a.level)-levelOrder(b.level));
        renderTable(rows);
      }

      function currentChecks(){
        const ret={};
        const nodes = document.querySelectorAll('#r7x .r7x-filters input[type="checkbox"]');
        if (nodes.length){
          nodes.forEach(ch => ret[ch.value] = !!ch.checked);
        }else{
          ret.city = ret.district = ret.street = ret.near = true;
        }
        return ret;
      }

      function selectedAnchor(){
        const sel = document.getElementById('r7xAuditSel');
        const id  = (sel && sel.value) || window.auditUnits[0].id;
        return window.auditUnits.find(u=>u.id===id) || window.auditUnits[0];
      }

      // 对外 API：show / hide
      window.R7X = {
        show(){
          const block = document.getElementById('r7x'); if(!block) return;
          // 填充下拉（只填一次）
          const sel = document.getElementById('r7xAuditSel');
          if (sel && !sel.__filled){
            sel.innerHTML = window.auditUnits.map(u=>`<option value="${u.id}">${u.name}</option>`).join('');
            sel.__filled = true;
          }
          const anchor = selectedAnchor();

          // 地图初始化 + 首次刷新
          ensureMap(anchor);
          refresh(anchor, currentChecks());

          // 绑定事件（只绑一次）
          if (sel && !sel.__bound){
            sel.addEventListener('change', ()=> refresh(selectedAnchor(), currentChecks()));
            sel.__bound = true;
          }
          const boxes = document.querySelectorAll('#r7x .r7x-filters input[type="checkbox"]');
          if (boxes.length && !boxes[0].__bound){
            boxes.forEach(ch=>{
              ch.addEventListener('change', ()=> refresh(selectedAnchor(), currentChecks()));
              ch.__bound = true;
            });
          }

          // 尺寸校正
          requestAnimationFrame(()=> map && map.invalidateSize());
        },
        hide(){
          const block = document.getElementById('r7x');
          if (block) block.style.display = 'none';
        }
      };
    })();
    // 右侧 Routine 侧栏折叠按钮
    (function(){
      const split = document.querySelector('#pane-routine .split');
      const btn   = document.querySelector('#pane-routine .sbar-toggle-inset');
      if (!split || !btn) return;
      btn.addEventListener('click', () => {
        split.classList.toggle('is-collapsed');
      });
    })();

    // 初始进入
    renderRoutine("2.1");

    // 响应式：窗口变化时同步调整图表尺寸
    window.addEventListener("resize", () => {
      const sc = document.getElementById("chart-scatter");
      if (sc) {
        const inst = echarts.getInstanceByDom(sc);
        inst && inst.resize();
      }
      for (let i = 0; i < 4; i++) {
        const bp = document.getElementById("kpi-bp-" + i);
        if (!bp) continue;
        const inst = echarts.getInstanceByDom(bp);
        inst && inst.resize();
      }
    });

    








    
    
    /* ===== 顶部页面切换 + 刷新保持当前页 ===== */
