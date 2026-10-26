(function () {
  'use strict';
  const controlledCategory = '被审计单位及其控股子公司';
  // Match the existing prototype's master records, not the external-only suggestions.
  const demoMasters = {
    auditedCompanies: typeof auditedCompanies !== 'undefined' ? auditedCompanies : [],
    relatedParties: [
      {name:'华东制造集团供应链有限公司', category:controlledCategory},
      {name:'华东制造集团科技发展有限公司', category:controlledCategory},
      {name:'北京恒瑞医疗设备有限公司', category:'联营企业'},
      {name:'重庆云峰智能装备有限公司', category:'联营企业'},
      {name:'郑州华辰电气有限公司', category:'联营企业'},
      {name:'上海华东工业服务有限公司', category:'同一控制下企业'},
      {name:'天津华东设备有限公司', category:'联营企业'},
      {name:'华东制造集团西安分公司', category:'同一控制下分支机构'}
    ]
  };
  const nameOf = value => String(typeof value === 'string' ? value : value?.name || '').normalize('NFKC').trim();
  function buildIndex(data) {
    const audited = new Set((data.auditedCompanies || []).filter(row => row?.master !== false).map(nameOf).filter(Boolean));
    const related = new Set(), controlled = new Set();
    (data.relatedParties || []).forEach(row => {
      if (row?.master === false) return;
      const name = nameOf(row);
      if (!name) return;
      related.add(name);
      if (row.category === controlledCategory) controlled.add(name);
    });
    return {audited, related, controlled};
  }
  const index = buildIndex(window.BankCounterpartyMasterData || demoMasters);
  function allows(row, type = 'audited', source = index) {
    const name = nameOf(row);
    const excluded = type === 'related' ? source.related : type === 'controlled' ? source.controlled : source.audited;
    return !excluded.has(name);
  }
  window.BankCounterpartyScope = Object.freeze({
    buildIndex, allows,
    filter:(list, type) => list.filter(row => allows(row, type)),
    isAudited:row => index.audited.has(nameOf(row)),
    isRelated:row => index.related.has(nameOf(row))
  });
})();
