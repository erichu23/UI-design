/* ===================== 增强版 ez：大数据量稳态渲染 ===================== */
    function ez(domId, option){
      const el = document.getElementById(domId);
      if (!el) return null;
    
      // 1) 初始化（canvas + useDirtyRect 提升刷新效率）
      const chart = echarts.getInstanceByDom(el) ||
                    echarts.init(el, null, { renderer: 'canvas', useDirtyRect: true });
    
      // 2) 性能与健壮性缺省项（不覆盖你已设置的同名项）
      //    - 采样 lttb：降低 700+ 点对 DOM 的压力且保持形状
      //    - progressive 大图优化；large 模式
      //    - 关闭动画；避免首帧卡/白屏
      //    - 轴标签自动避让；dataZoom 加 throttle 防抖
      const enriched = (() => {
        // xAxis / yAxis 统一成数组处理
        const toArr = v => Array.isArray(v) ? v : (v ? [v] : []);
        const xAxes = toArr(option.xAxis).map(ax => ({
          boundaryGap: ax?.boundaryGap ?? false,
          axisTick: { show: false, ...(ax?.axisTick||{}) },
          axisLabel: { hideOverlap: true, interval: 'auto', ...(ax?.axisLabel||{}) },
          ...ax
        }));
        const yAxes = toArr(option.yAxis).map(ay => ({
          min: ay?.min ?? 0, // 余额/收支一般从 0 起，更直观；你已自设则不改
          axisTick: { show: false, ...(ay?.axisTick||{}) },
          splitLine: { lineStyle:{ color:'#eef2f7' }, ...(ay?.splitLine||{}) },
          ...ay
        }));
    
        const series = (option.series || []).map(s => ({
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 3,
          smooth: false,                 // 不要过度平滑，保持“折线/脉冲感”
          sampling: 'lttb',              // 关键：大幅减轻渲染负担
          large: true,
          largeThreshold: 2000,
          progressive: 8000,
          progressiveThreshold: 3000,
          clip: true,
          ...(s || {})
        }));
    
        const dataZoom = (option.dataZoom || []).map(z => ({
          throttle: 50,
          // 不改变你的类型/位置，仅补上防抖
          ...z
        }));
    
        return {
          animation: false,
          grid: { containLabel: true, ...(option.grid||{}) },
          xAxis: xAxes.length ? (Array.isArray(option.xAxis) ? xAxes : xAxes[0]) : option.xAxis,
          yAxis: yAxes.length ? (Array.isArray(option.yAxis) ? yAxes : yAxes[0]) : option.yAxis,
          series,
          dataZoom,
          ...option
        };
      })();
    
      // 3) 渲染（notMerge + lazyUpdate 更稳）
      chart.setOption(enriched, { notMerge: true, lazyUpdate: true });
    
      // 4) 尺寸监听（避免缩放/切换后白屏）
      if (!ez._ro) {
        ez._ro = new ResizeObserver(() => {
          try { chart.resize(); } catch(e){}
        });
      }
      ez._ro.observe(el);
    
      return chart;
    }
