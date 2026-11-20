/* Original vector charts use the published aggregate values in research-results.json.
   No clinical or patient-level data are processed by this website. */
(() => {
  "use strict";
  const NS="http://www.w3.org/2000/svg";
  const el=id=>document.getElementById(id);
  const number=n=>Number(n).toLocaleString("en-US");
  let studies=null;
  let metric="mape";
  function svgNode(tag,attrs={},value){
    const n=document.createElementNS(NS,tag);
    Object.keys(attrs).forEach(k=>n.setAttribute(k,String(attrs[k])));
    if(value!==undefined)n.textContent=String(value);
    return n;
  }
  function setValue(id,val){const n=el(id);if(n)n.textContent=String(val);}
  function renderSustainability(){
    const fold=studies.sustainable_ai.fold_lower_modeled_co2eq;
    setValue("emissions-fold",number(fold)+"×");
    const chart=el("emissions-figure");
    if(!chart)return;
    const s=svgNode("svg",{viewBox:"0 0 660 224",role:"img","aria-labelledby":"emissions-title emissions-desc",class:"emissions-svg"});
    s.appendChild(svgNode("title",{id:"emissions-title"},"Modeled emissions comparison"));
    s.appendChild(svgNode("desc",{id:"emissions-desc"},"Relative modeled carbon dioxide equivalent: multitask deep learning 147, pathomics 1. Normalized units in one published study-specific comparison, not absolute emissions."));
    const rows=[
      {label:"Multitask deep learning",units:fold,color:"#8dc4e8"},
      {label:"Pathomics",units:1,color:"#62e9bc"}
    ];
    rows.forEach((r,i)=>{
      const y=62+i*95;
      s.appendChild(svgNode("text",{x:9,y:y-18,fill:"#d7ecf7","font-size":16,"font-weight":650},r.label));
      s.appendChild(svgNode("rect",{x:9,y:y,width:555,height:18,rx:9,fill:"#29475f"}));
      const w=r.units/fold*555;
      s.appendChild(svgNode("rect",{x:9,y:y,width:Math.max(3,w),height:18,rx:Math.min(9,w/2),fill:r.color}));
      s.appendChild(svgNode("text",{x:638,y:y+14,"text-anchor":"end",fill:"#e9f9ff","font-size":17,"font-weight":750},r.units));
    });
    chart.replaceChildren(s);
  }
  function renderPympute(){
    if(!studies)return;
    const values=studies.pympute.metrics.slice().sort((a,b)=>a[metric]-b[metric]);
    const max=metric==="mape"?4:0.005;
    const sdkey=metric==="mape"?"mape_sd":"rmse_sd";
    const scale=v=>120+Math.max(0,Math.min(max,v))/max*345;
    const s=svgNode("svg",{viewBox:"0 0 580 446",role:"img","aria-labelledby":"pympute-title pympute-desc",class:"pympute-svg"});
    s.appendChild(svgNode("title",{id:"pympute-title"},metric==="mape"?"Holdout MAPE comparison, MIMIC data":"Holdout RMSE comparison, MIMIC data"));
    s.appendChild(svgNode("desc",{id:"pympute-desc"},"Reconstructed from Scientific Reports (2025), Table 1. Points are reported means, whiskers are one standard deviation. Lower is better."));
    const ticks=metric==="mape"?[0,1,2,3,4]:[0,.001,.002,.003,.004,.005];
    ticks.forEach(t=>{
      const x=scale(t);
      s.appendChild(svgNode("line",{x1:x,y1:40,x2:x,y2:404,stroke:"#dae9ed","stroke-width":1}));
      s.appendChild(svgNode("text",{x:x,y:27,"text-anchor":"middle",fill:"#577182","font-size":13},metric==="mape"?t+"%":t.toFixed(3)));
    });
    values.forEach((d,i)=>{
      const y=65+i*30.5;
      const best=d.name==="Flexible";
      if(best)s.appendChild(svgNode("rect",{x:3,y:y-17,width:572,height:27,rx:8,fill:"#e5f7f2"}));
      s.appendChild(svgNode("text",{x:103,y:y+5,"text-anchor":"end",fill:best?"#087f6a":"#436073","font-size":14,"font-weight":best?750:550},d.name));
      const xx=scale(d[metric]);
      s.appendChild(svgNode("line",{x1:scale(0),y1:y,x2:xx,y2:y,stroke:best?"#12a583":"#a6c1ce","stroke-width":best?6:4,"stroke-linecap":"round"}));
      const a=scale(Math.max(0,d[metric]-d[sdkey])),b=scale(d[metric]+d[sdkey]);
      s.appendChild(svgNode("line",{x1:a,y1:y,x2:b,y2:y,stroke:best?"#03745f":"#5e7c8c","stroke-width":2}));
      [a,b].forEach(x=>s.appendChild(svgNode("line",{x1:x,y1:y-4,x2:x,y2:y+4,stroke:best?"#03745f":"#5e7c8c","stroke-width":2})));
      s.appendChild(svgNode("circle",{cx:xx,cy:y,r:best?6:5,fill:best?"#098a73":"#53788b",stroke:"#fff","stroke-width":1.6}));
      s.appendChild(svgNode("text",{x:571,y:y+5,"text-anchor":"end",fill:best?"#06765e":"#3e5b70","font-size":14,"font-weight":best?750:550},metric==="mape"?d.mape.toFixed(2)+"%":d.rmse.toFixed(4)));
    });
    s.appendChild(svgNode("text",{x:292,y:437,"text-anchor":"middle",fill:"#647c88","font-size":13},metric==="mape"?"Holdout MAPE (lower is better)":"Holdout RMSE (lower is better)"));
    el("pympute-figure").replaceChildren(s);
    setValue("metric-description",metric==="mape"?"MIMIC holdout MAPE; Flexible 2.04% (SD 0.06), lowest among the methods shown.":"MIMIC holdout RMSE; Flexible 0.0025 (SD 0.00027), lowest among the methods shown.");
    document.querySelectorAll("[data-chart-metric]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.chartMetric===metric)));
    renderPymputeTable(values);
  }
  function renderPymputeTable(values){
    const t=el("pympute-table");if(!t)return;
    const table=document.createElement("table"),caption=document.createElement("caption");
    caption.textContent="Source values: Scientific Reports 2025, Table 1, MIMIC holdout performance";table.appendChild(caption);
    const head=document.createElement("thead"),hrow=document.createElement("tr");
    ["Algorithm","MAPE mean (SD), %","RMSE mean (SD)"].forEach(label=>{
      const th=document.createElement("th");th.scope="col";th.textContent=label;hrow.appendChild(th);
    });
    head.appendChild(hrow);table.appendChild(head);
    const body=document.createElement("tbody");
    values.forEach(d=>{
      const tr=document.createElement("tr");
      [d.name,d.mape.toFixed(2)+" ("+d.mape_sd.toFixed(2)+")",d.rmse.toFixed(4)+" ("+d.rmse_sd.toFixed(5)+")"].forEach(val=>{
        const td=document.createElement("td");td.textContent=val;tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    table.appendChild(body);t.replaceChildren(table);
  }

  function renderStrokeCarbon(){
    if(!studies||!studies.stroke_carbon_2026)return;
    const d=studies.stroke_carbon_2026;
    setValue("stroke-carbon-reduction",d.reported_relative_reduction_percent.toFixed(2)+"%");
    const chart=el("stroke-carbon-chart");if(!chart)return;
    const s=svgNode("svg",{viewBox:"0 0 650 180",role:"img","aria-labelledby":"stroke-carbon-title stroke-carbon-desc",class:"stroke-carbon-svg"});
    s.appendChild(svgNode("title",{id:"stroke-carbon-title"},"Modeled AI emissions in stroke care before and after carbon-aware processing"));
    s.appendChild(svgNode("desc",{id:"stroke-carbon-desc"},"Ideal AI scenario: 16,375.09 metric tonnes CO2 equivalent per year in the modeled baseline, versus 7,408.68 after hypothetical relocation to cleaner electricity grids. Reported 54.75 percent reduction. These are modeled outcomes."));
    const rows=[
      {name:"Baseline grid mix",value:d.ideal_scenario_co2eq_tonnes_per_year,color:"#367d9a"},
      {name:"Cleaner-grid routing",value:d.cleaner_grid_relocated_co2eq_tonnes_per_year,color:"#16a78c"}
    ];
    const max=d.ideal_scenario_co2eq_tonnes_per_year;
    rows.forEach((row,i)=>{
      const y=39+i*77;
      s.appendChild(svgNode("text",{x:4,y:y-13,fill:"#2a5665","font-size":16,"font-weight":750},row.name));
      s.appendChild(svgNode("rect",{x:4,y:y,width:520,height:20,rx:10,fill:"#d8eeea"}));
      s.appendChild(svgNode("rect",{x:4,y:y,width:520*row.value/max,height:20,rx:10,fill:row.color}));
      s.appendChild(svgNode("text",{x:632,y:y+16,"text-anchor":"end",fill:"#184f5d","font-size":17,"font-weight":800},Math.round(row.value).toLocaleString("en-US")+" t"));
    });
    chart.replaceChildren(s);
  }

  function renderMetadata(){
    const e=studies.ecg_ehr,p=studies.pathomics;
    [["ecg-patients",e.patients],["ecg-paf",e.paf_cases],["ecg-features",e.ehr_variables],["ecg-leads",e.ecg_leads],["ecg-auroc",e.reported_auroc.toFixed(2)],["ecg-auprc",e.reported_auprc.toFixed(2)],
    ["pathomics-cases",p.cases],["pathomics-slides",p.whole_slide_images],["pathomics-structures",p.instances],["pathomics-glomeruli",p.glomeruli],["pathomics-tubules",p.tubules],["pathomics-arteries",p.arteries]].forEach(pair=>{
      setValue(pair[0],typeof pair[1]==="number"?number(pair[1]):pair[1]);
    });
  }

  /* Fictional, predefined examples. This is NOT the clinical flagging engine. */
  const cases={
    routine:{title:"Routine check-in",quote:"I feel about the same as last week. My next visit is scheduled.",signal:"No new concern reported in this fictional scenario.",flag:"Routine",className:"flag-routine",next:"Record a structured check-in for routine human review.",safety:"Illustrative behavior only. Not actual VERA runtime output."},
    followup:{title:"Care coordination need",quote:"I missed my follow-up visit and I have a question about my medication.",signal:"A fictional follow-up issue and medication question.",flag:"Human review",className:"flag-review",next:"Flag this message for the human care team to review.",safety:"The prototype does not change medications or give treatment decisions."},
    warning:{title:"Possible stroke warning signs",quote:"I suddenly have trouble speaking and moving my left arm.",signal:"Fictional report of new stroke warning signs.",flag:"Potential red flag",className:"flag-warning",next:"In the proposed workflow, emergency guidance is displayed and a red-flag alert is routed to the human team.",safety:"This page cannot evaluate symptoms or summon help. For real sudden stroke symptoms, call emergency services immediately."}
  };
  function renderCase(key){
    const d=cases[key];if(!d)return;
    setValue("demo-case-title",d.title);
    setValue("demo-quote","“"+d.quote+"”");
    setValue("demo-signal",d.signal);
    setValue("demo-next",d.next);
    setValue("demo-safety",d.safety);
    const flag=el("demo-flag");if(flag){flag.textContent=d.flag;flag.className="demo-flag "+d.className;}
    document.querySelectorAll("[data-demo-case]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.demoCase===key)));
  }
  async function start(){
    document.querySelectorAll("[data-demo-case]").forEach(button=>button.addEventListener("click",()=>renderCase(button.dataset.demoCase)));
    document.querySelectorAll("[data-chart-metric]").forEach(button=>button.addEventListener("click",()=>{
      metric=button.dataset.chartMetric;renderPympute();
    }));
    renderCase("routine");
    try{
      const response=await fetch("assets/research-results.json",{cache:"no-cache"});
      if(!response.ok)throw Error("Published result data not available");
      const payload=await response.json();
      studies=payload.studies;
      renderSustainability();renderStrokeCarbon();renderPympute();renderMetadata();
      if(el("data-status"))el("data-status").hidden=true;
    }catch(err){
      setValue("data-status","The interactive research charts could not load. Published paper links remain available.");
      if(el("data-status"))el("data-status").hidden=false;
      console.error(err);
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
