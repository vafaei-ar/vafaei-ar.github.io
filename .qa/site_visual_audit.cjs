/* Temporary public-site visual QA for GitHub Pages. No patient data. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const URL = "https://vafaei-ar.github.io/";
const screenshots = [];
const results = {site:URL,desktop:{},mobile:{},errors:[],warnings:[]};

async function capture(label, buffer) {
  console.log("BEGIN_SCREENSHOT " + label);
  const text=buffer.toString("base64");
  for (let i=0; i<text.length; i+=9000) console.log("IMGDATA " + text.slice(i,i+9000));
  console.log("END_SCREENSHOT " + label);
}

async function inspect(page, name) {
  const dimensions = await page.evaluate(() => {
    const root=document.documentElement;
    const overflow=Array.from(document.querySelectorAll("main,section,article,.story,.demo-shell,.story-tile,.story-content"))
      .filter(el => (el.scrollWidth-el.clientWidth)>4)
      .map(el => ({className:el.className,id:el.id,extra:el.scrollWidth-el.clientWidth})).slice(0,20);
    return {
      viewport:window.innerWidth,
      documentWidth:root.scrollWidth,
      hasHorizontalOverflow:root.scrollWidth>window.innerWidth+3,
      overflow,
      bodyFont:getComputedStyle(document.body).fontFamily,
      heroCopyTop:Math.round(document.querySelector(".hero-copy").getBoundingClientRect().top+window.scrollY),
      portraitTop:Math.round(document.querySelector(".portrait-wrap").getBoundingClientRect().top+window.scrollY),
      mobileChartHintVisible:(()=>{
        const e=document.querySelector(".mobile-chart-hint");
        return e ? getComputedStyle(e).display!=="none" : false;
      })(),
      headerHeight:Math.round(document.querySelector(".site-header").getBoundingClientRect().height),
      heroHeight:Math.round(document.querySelector(".hero").getBoundingClientRect().height),
      portraitLoaded:(()=>{
        const i=document.querySelector(".portrait");
        return Boolean(i?.complete&&i.naturalWidth>0);
      })(),
      numFigures:document.querySelectorAll("#results svg").length,
      figTitles:Array.from(document.querySelectorAll("#results svg title")).map(x=>x.textContent),
      externalLinks:document.querySelectorAll('a[href^="https://"]').length,
      dataStatusVisible:!!document.querySelector("#data-status")?.offsetParent
    };
  });
  results[name]=dimensions;
  assert.equal(dimensions.portraitLoaded,true,"Missing portrait at "+name);
  assert.equal(dimensions.numFigures,3,"Missing generated figure(s) at "+name);
  assert.equal(dimensions.hasHorizontalOverflow,false,"Horizontal page overflow at "+name+": "+JSON.stringify(dimensions.overflow));
  if(name==="mobile"){
    assert.ok(dimensions.heroCopyTop < dimensions.portraitTop, "Mobile first-screen research introduction must precede portrait");
    assert.ok(dimensions.headerHeight < 125, "Mobile sticky header too tall");
    assert.equal(dimensions.mobileChartHintVisible,true,"Mobile chart swipe hint not visible");
  }
}

async function main(){
  const browser=await chromium.launch({headless:true,channel:"chrome"});
  try{
    const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
    desktop.on("pageerror",err=>results.errors.push("desktop "+err.message));
    desktop.on("response",resp=>{if(resp.status()>=400)results.warnings.push("desktop HTTP "+resp.status()+" "+resp.url());});
    desktop.on("console",msg=>{if(msg.type()==="error")results.warnings.push("desktop console: "+msg.text().slice(0,300));});
    const response=await desktop.goto(URL,{waitUntil:"domcontentloaded",timeout:60000});
    assert.ok(response&&response.status()===200,"Desktop homepage HTTP 200 expected");
    await desktop.locator("#pympute-figure svg").waitFor({timeout:25000});
    await desktop.locator("#stroke-carbon-chart svg").waitFor({timeout:15000});
    await desktop.locator("#emissions-figure svg").waitFor({timeout:15000});
    await desktop.evaluate(()=>document.fonts?.ready);
    await inspect(desktop,"desktop");
    const top=await desktop.screenshot({type:"jpeg",quality:55});
    await capture("desktop-top",top);
    const story=await desktop.locator(".story-main").screenshot({type:"jpeg",quality:52});
    await capture("desktop-story",story);
    await desktop.locator('[data-chart-metric="rmse"]').click();
    assert.match(await desktop.locator("#metric-description").textContent(),/RMSE/,"RMSE toggle failed");
    await desktop.locator('[data-chart-metric="mape"]').click();
    assert.match(await desktop.locator("#metric-description").textContent(),/MAPE/,"MAPE toggle failed");
    await desktop.locator('[data-demo-case="warning"]').click();
    assert.match(await desktop.locator("#demo-flag").textContent(),/Potential red flag/,"Scenario toggle failed");
    assert.match(await desktop.locator("#demo-safety").textContent(),/emergency services/,"Safety note missing");
    results.desktop.interactions="MAPE, RMSE, warning scenario passed";

    const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    mobile.on("pageerror",err=>results.errors.push("mobile "+err.message));
    mobile.on("response",resp=>{if(resp.status()>=400)results.warnings.push("mobile HTTP "+resp.status()+" "+resp.url());});
    mobile.on("console",msg=>{if(msg.type()==="error")results.warnings.push("mobile console: "+msg.text().slice(0,300));});
    const responseM=await mobile.goto(URL,{waitUntil:"domcontentloaded",timeout:60000});
    assert.ok(responseM&&responseM.status()===200,"Mobile homepage HTTP 200 expected");
    await mobile.locator("#pympute-figure svg").waitFor({timeout:25000});
    await mobile.evaluate(()=>document.fonts?.ready);
    await inspect(mobile,"mobile");
    await capture("mobile-top",await mobile.screenshot({type:"jpeg",quality:58}));
    await mobile.locator(".story-alternate").scrollIntoViewIfNeeded();
    await capture("mobile-pympute",await mobile.screenshot({type:"jpeg",quality:58}));
    await mobile.locator("#demo").scrollIntoViewIfNeeded();
    await capture("mobile-demo",await mobile.screenshot({type:"jpeg",quality:58}));
    await mobile.locator('[data-demo-case="followup"]').click();
    assert.match(await mobile.locator("#demo-flag").textContent(),/Human review/,"Mobile scenario toggle failed");
    results.mobile.interactions="Care coordination scenario passed";
    assert.equal(results.errors.length,0,"Page errors found");
    console.log("QA_JSON "+JSON.stringify(results));
    console.log("QA_SUCCESS");
  }finally{await browser.close();}
}
main().catch(err=>{
  console.error("QA_FAILURE",err.stack||err.message);
  console.log("QA_JSON "+JSON.stringify(results));
  process.exitCode=1;
});
