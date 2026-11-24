"use strict";
/* Local website screenshot QA. It verifies source images and interactions.
   Uses only public site assets; no patient records, model calls, or external APIs.
 */
const http=require("node:http"),fs=require("node:fs"),path=require("node:path");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript",".json":"application/json",".jpg":"image/jpeg",".png":"image/png",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,"http://localhost").pathname;
 const relative=pathname==="/"?"/index.html":pathname;
 const absolute=path.resolve(root,"."+decodeURIComponent(relative));
 if(!absolute.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(absolute,(err,data)=>{
   if(err){res.writeHead(404);res.end();return;}
   res.writeHead(200,{"Content-Type":mime[path.extname(absolute)]||"application/octet-stream"});
   res.end(data);
 });
});
function screenshotInLog(name,buf){
 const encoded=buf.toString("base64");
 console.log("BEGIN_SITE_SCREENSHOT "+name);
 for(let i=0;i<encoded.length;i+=9000)console.log("SITEDATA "+encoded.slice(i,i+9000));
 console.log("END_SITE_SCREENSHOT "+name);
}
async function inspect(page,label){
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 const response=await page.goto("http://127.0.0.1:8899/",{waitUntil:"domcontentloaded",timeout:30000});
 assert.equal(response.status(),200,"Homepage HTTP 200 required");
 await page.locator("#pympute-figure svg").waitFor({timeout:15000});
 await page.locator("#stroke-carbon-chart svg").waitFor({timeout:15000});
 for(const selector of [".microscopy-evidence img",".vera-setup-frame img",".vera-chat-frame img",".portrait"]){
   await page.locator(selector).scrollIntoViewIfNeeded();
   await page.waitForFunction(css=>{
     const img=document.querySelector(css);
     return !!img?.complete && img.naturalWidth>0;
   },selector,{timeout:20000});
 }
 const files=await page.evaluate(()=>{
   const refs=[".microscopy-evidence img",".vera-setup-frame img",".vera-chat-frame img",".portrait"];
   return refs.map(css=>{
     const img=document.querySelector(css);
     return {css,complete:img?.complete,width:img?.naturalWidth,height:img?.naturalHeight,src:img?.getAttribute("src")};
   });
 });
 for(const f of files)assert.ok(f.complete&&f.width>250&&f.height>120,"Broken image "+JSON.stringify(f));
 const overflow=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth}));
 assert.ok(overflow.doc<=overflow.inner+3,"Page horizontal overflow "+JSON.stringify({label,overflow}));
 assert.equal(await page.locator(".microscopy-evidence figcaption a").getAttribute("href"),"https://creativecommons.org/licenses/by/4.0/");
 assert.match(await page.locator(".vera-gallery-intro").innerText(),/fictional inputs/);
 assert.ok(errors.length===0,"Script errors "+errors.join(";"));
 if(label==="desktop"){
   await page.locator('[data-chart-metric="rmse"]').click();
   assert.match(await page.locator("#metric-description").innerText(),/RMSE/);
   await page.locator('[data-demo-case="warning"]').click();
   assert.match(await page.locator("#demo-flag").innerText(),/Potential red flag/);
   await page.locator('[data-demo-case="routine"]').click();
 }
 const visual=await page.locator(".microscopy-evidence").screenshot({type:"jpeg",quality:55,animations:"disabled"});
 screenshotInLog(label+"-microscopy",visual);
 const gallery=await page.locator(".vera-gallery").screenshot({type:"jpeg",quality:51,animations:"disabled"});
 screenshotInLog(label+"-vera",gallery);
 console.log("QA_RESULT "+JSON.stringify({label,overflow,files,errors}));
}
async function main(){
 await new Promise(resolve=>server.listen(8899,"127.0.0.1",resolve));
 const browser=await chromium.launch({headless:true,channel:"chrome"});
 try{
   const desktop=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:1});
   await inspect(desktop,"desktop");
   const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
   await inspect(mobile,"mobile");
   console.log("VISUAL_SITE_QA_PASSED");
 } finally {
   await browser.close();
   await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(err=>{console.error("VISUAL_SITE_QA_FAILED",err.stack||err);process.exitCode=1;server.close();});
