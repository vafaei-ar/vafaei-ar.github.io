/* One-time reproduction: capture the REAL VERA Cloud frontend code (pinned public commit)
 * with explicitly fictional example state. No backend calls, patient data or model run.
 */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");

const repo=path.resolve(process.env.VERA_FRONTEND_DIR || ".qa/VERA-cloud/frontend/static");
const out=path.resolve("assets/media");
fs.mkdirSync(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript",".svg":"image/svg+xml",".png":"image/png"};

function send(res,obj){res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(obj));}
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,"http://localhost").pathname;
 if(pathname==="/api/scenarios")return send(res,{scenarios:[{name:"Short recovery check-in (fictional)",base:"guided"}]});
 if(pathname==="/api/voices")return send(res,{voices:{}});
 const relative=pathname.startsWith("/static/")?pathname.slice(8):"index.html";
 const clean=path.normalize(relative).replace(/^(\.\.[/\\])+/, "");
 const target=path.join(repo,clean);
 if(!target.startsWith(repo+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(target,(err,content)=>{
   if(err){res.writeHead(404);res.end();return;}
   res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream","Cache-Control":"no-store"});
   res.end(content);
 });
});

async function main(){
 await new Promise(resolve=>server.listen(8765,"127.0.0.1",resolve));
 const browser=await chromium.launch({headless:true,channel:"chrome"});
 try{
   const page=await browser.newPage({viewport:{width:1440,height:920},deviceScaleFactor:1});
   const bad=[];
   page.on("pageerror",error=>bad.push(error.message));
   const response=await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
   assert.equal(response.status(),200);
   await page.waitForFunction(()=>window.veraApp && document.querySelectorAll("#scenario option").length>1);
   await page.locator("#honorific").selectOption("Ms.");
   await page.locator("#scenario").selectOption("guided");
   await page.locator("#patientName").fill(""); // explicitly no real identity
   await page.locator("#patientId").fill("");  // no patient ID
   await page.locator("#autoListen").uncheck();
   assert.equal(await page.locator("#startButton").isEnabled(),true);
   await page.screenshot({path:path.join(out,"vera-setup.png"),animations:"disabled",clip:{x:250,y:0,width:1160,height:900}});
   // Scene 2: genuine frontend markup and JavaScript with fictional UI state.
   // These messages are explicitly injected for an offline SCREENSHOT, not from the app's backend.
   await page.evaluate(()=>{
     const app=window.veraApp;
     app.showSection("conversation");
     app.addAIQuestion("Hello. This is a fictional recovery check-in. How have you been since leaving the hospital?","demo");
     app.addTranscriptMessage("I feel okay, but I need help rescheduling my follow-up appointment.",0.99,true,"user");
     app.addAIQuestion("Thank you for sharing. This information would be available for human care-team review.","demo");
     const text=document.querySelector("#progressText");
     if(text)text.textContent="Offline UI demonstration · fictional conversation";
     const status=document.querySelector("#connectionStatus .status-text");
     if(status)status.textContent="Offline preview";
   });
   assert.equal(await page.locator("#conversation.section.active").count(),1);
   assert.equal(await page.locator("#transcript .transcript-message").count(),3);
   await page.screenshot({path:path.join(out,"vera-conversation.png"),animations:"disabled",clip:{x:250,y:0,width:1160,height:900}});
   assert.deepEqual(bad,[],"Frontend JavaScript errors during offline capture");
   const files=["vera-setup.png","vera-conversation.png"];
   for(const f of files){
     const s=fs.statSync(path.join(out,f));
     console.log("CAPTURED "+f+" bytes="+s.size);
     assert.ok(s.size>12000,"Screenshot unexpectedly small");
   }
   console.log("VERA_SCREENSHOTS_OK");
 }finally{
   await browser.close();
   await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(err=>{console.error(err.stack||String(err));process.exitCode=1;server.close();});
