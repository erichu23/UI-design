const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:960}});
    const errors=[];
    await context.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.hostname!=='routine-sync.test')return route.abort();
      const file=path.resolve(root,decodeURIComponent(url.pathname).slice(1));
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
      const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)]||'application/octet-stream';
      const body=path.extname(file)==='.html'?fs.readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,''):fs.readFileSync(file);
      return route.fulfill({contentType:type,body});
    });
    const special=await context.newPage();
    const paper=await context.newPage();
    [special,paper].forEach(page=>{page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message));});
    await special.goto('https://routine-sync.test/fragments/fund-flow-check.html',{waitUntil:'domcontentloaded'});
    await special.addScriptTag({content:read('assets/js/config/routine-standards.js')});
    await special.addScriptTag({content:read('assets/js/config/routine-demo-data.js')});
    const main=Array.from(read('fragments/fund-flow-check.html').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)).find(match=>match[1].includes('const checkMeta ='))[1];
    await special.addScriptTag({content:main});
    await special.evaluate(()=>new Promise(resolve=>{
      const script=document.createElement('script');script.dataset.enabled='true';script.src='/assets/js/pages/routine-scope-experiment.js';script.onload=resolve;document.body.appendChild(script);
    }));
    await special.waitForSelector('#routineScope');
    await paper.goto('https://routine-sync.test/fragments/workingpaper-export.html?embed=workingpaper',{waitUntil:'domcontentloaded'});
    const setupPaper=async()=>{
      for(const file of ['assets/css/base.css','assets/css/pages/workingpaper.css','assets/css/pages/workingpaper-export.css'])await paper.addStyleTag({content:read(file)});
      for(const file of ['assets/js/config/routine-standards.js','assets/js/config/routine-demo-data.js','assets/js/core/shared.js','assets/js/pages/workingpaper-export.js'])await paper.addScriptTag({content:read(file)});
    };
    await setupPaper();
    const wp='[data-wp-routine="1.1"][data-wp-criterion="minAmt"]';
    await paper.waitForSelector(wp,{state:'attached'});
    assert.equal(await paper.locator(wp).inputValue(),'50000');
    assert.equal(await paper.locator(wp).evaluate(input=>Math.round(input.getBoundingClientRect().width)),96);
    assert.equal(await paper.locator('[data-wp-criterion="daysRange"]').evaluate(input=>Math.round(input.getBoundingClientRect().width)),54);
    await paper.locator(wp).evaluate(input=>{input.value='999999999999';input.dispatchEvent(new Event('change',{bubbles:true}));});
    await special.waitForFunction(()=>document.querySelector('[data-criteria-routine="1.1"]').value==='999999999999');
    await special.waitForFunction(()=>document.querySelector('[data-routine="1.1"] [data-result="identifiedTransactions"]').textContent==='0');
    assert.equal(await paper.locator(wp).inputValue(),'999999999999');
    const paperCount=()=>paper.locator(wp).evaluate(input=>input.closest('tr').cells[6].textContent.trim());
    assert.equal(await paperCount(),'0');
    await special.locator('[data-criteria-routine="1.1"]').fill('50000');
    await special.locator('[data-criteria-routine="1.1"]').blur();
    await paper.waitForFunction(()=>document.querySelector('[data-wp-routine="1.1"]').value==='50000');
    const expected=await special.locator('[data-routine="1.1"] [data-result="identifiedTransactions"]').textContent();
    assert(Number(expected.replaceAll(',',''))>0);
    assert.equal(await paperCount(),expected);
    await special.locator('#rsConfirm').click();
    await special.evaluate(()=>selectCheck('1.1'));
    await special.locator('#minAmtVal').fill('120000');
    await special.locator('#btnRun').click();
    await paper.waitForFunction(()=>document.querySelector('[data-wp-routine="1.1"]').value==='120000');
    const result=await special.evaluate(()=>RoutineDemoData.readSummary().find(row=>row.id==='1.1'));
    assert.equal(Number((await paperCount()).replaceAll(',','')),result.transactions);
    await paper.reload({waitUntil:'domcontentloaded'});
    await setupPaper();
    await paper.waitForSelector(wp,{state:'attached'});
    assert.equal(await paper.locator(wp).inputValue(),'120000');
    await paper.screenshot({path:'/private/tmp/routine-workingpaper-sync.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: working-paper edits update viewing settings and results; settings/results edits update working-paper criteria and all three result totals; reload preserves shared values.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
