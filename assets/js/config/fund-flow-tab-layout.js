/*
 * 资金流水分析页面编排配置。
 * 调整 Tab 归属或顺序时，仅修改本文件；业务页面和样式无需搬动。
 */
(() => {
  const layout = [
    {
      key: 'scope-control',
      label: '分析范围管控',
      before: 'account',
      source: './data-management.html?embed=scope-control&v=20260828-account-actions3',
      title: '分析范围管控'
    },
    {
      key: 'risk-report-export',
      label: '风险评估报告导出',
      after: 'statement',
      source: './workingpaper-export.html?embed=risk-report&v=20260825-tab-layout1',
      title: '风险评估报告导出'
    },
    {
      key: 'workingpaper-export',
      label: '资金流水核查底稿导出',
      after: 'risk-report-export',
      source: './workingpaper-export.html?embed=workingpaper&v=20260825-tab-layout1',
      title: '资金流水核查底稿导出'
    }
  ];

  window.AuditCompassFundFlowTabLayout = Object.freeze(layout.map(item => Object.freeze({ ...item })));

  const tabbar = document.getElementById('topTabs');
  if (!tabbar) return;

  const insertTab = item => {
    if (tabbar.querySelector(`[data-top="${item.key}"]`)) return;
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.top = item.key;
    tab.textContent = item.label;

    const before = item.before && tabbar.querySelector(`[data-top="${item.before}"]`);
    const after = item.after && tabbar.querySelector(`[data-top="${item.after}"]`);
    const guide = tabbar.querySelector('.tab-guide-btn');
    if (before) tabbar.insertBefore(tab, before);
    else if (after) after.insertAdjacentElement('afterend', tab);
    else tabbar.insertBefore(tab, guide || tabbar.querySelector('.inkbar'));
  };

  const insertPane = item => {
    if (document.getElementById(`pane-${item.key}`)) return;
    const pane = document.createElement('section');
    pane.className = 'tab-pane hide workspace-embedded-pane';
    pane.id = `pane-${item.key}`;
    pane.dataset.embeddedSource = item.source;
    pane.innerHTML = `<iframe class="workspace-embedded-frame" title="${item.title}" loading="lazy"></iframe>`;
    document.body.appendChild(pane);
  };

  layout.forEach(item => {
    insertTab(item);
    insertPane(item);
  });

  const loadActivePane = () => {
    const activeKey = tabbar.querySelector('.tab.active')?.dataset.top;
    const pane = activeKey && document.getElementById(`pane-${activeKey}`);
    const frame = pane?.querySelector('.workspace-embedded-frame');
    if (frame && !frame.getAttribute('src')) frame.src = pane.dataset.embeddedSource;
  };

  tabbar.addEventListener('click', event => {
    if (!event.target.closest('.tab')) return;
    window.requestAnimationFrame(loadActivePane);
  });
  window.addEventListener('bank-analysis:tab-change', loadActivePane);
  document.addEventListener('DOMContentLoaded', loadActivePane, { once: true });
})();
