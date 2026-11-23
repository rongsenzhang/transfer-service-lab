/* All scenario edits stay in this browser. The brief is generated on the device. */
(() => {
  "use strict";
  const model = window.WorkbenchModel;
  const design = window.ServiceDesign;
  const field = window.Fieldwork;
  const storeKey = "transfer-service-lab:v1";
  const defaults = {
    ...model.defaults, ...design.defaults, pilotDecision: "Hold for evidence", pilotNote: "",
    trainingComplete: false, proposal: "subscription", baselineChecked: false,
    capacityChecked: false, buyerChecked: false
  };
  const eligibility = [
    ["baselineChecked", "Operating baseline", "Site operations", "Match operating windows and agree which stops belong to the transfer cell."],
    ["capacityChecked", "Delivery capacity", "Service manager", "Price travel and parts, check engineer cover and agree the route for exceptions."],
    ["buyerChecked", "Buying commitment", "Commercial lead", "Confirm the budget owner, acceptable fee and conditions for renewing the service."]
  ];
  const offers = {purchase: "Equipment purchase", subscription: "Managed subscription", performance: "Performance contract"};
  const titles = {overview:"Case overview", design:"Service design", economics:"Contract economics", pilot:"Pilot & handover", evidence:"Evidence & sources"};
  const currency = new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP",maximumFractionDigits:0});
  const main = document.querySelector("#view");
  const tabs = [...document.querySelectorAll(".tabs a")];
  const notice = document.querySelector("#notice");
  let noticeTimer;
  let state = {...defaults};
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || "{}");
    if (saved && typeof saved === "object") for (const key of Object.keys(defaults)) {
      if (typeof defaults[key] === "boolean" && typeof saved[key] === "boolean") state[key] = saved[key];
      if (typeof defaults[key] !== "boolean" && ["number","string"].includes(typeof saved[key])) state[key] = String(saved[key]).slice(0,4000);
    }
  } catch {}
  function tell(message) {
    clearTimeout(noticeTimer);
    notice.textContent = message;
    noticeTimer = setTimeout(() => {notice.textContent = "";}, 5500);
  }
  function save() {
    try {localStorage.setItem(storeKey, JSON.stringify(state));}
    catch {tell("This browser cannot save changes. Export your brief before leaving.");}
  }
  function proposalKey() {return Object.hasOwn(offers,state.proposal) ? state.proposal : "subscription";}
  function gateCount() {return eligibility.filter(([key]) => state[key] === true).length;}
  function chart() {
    const result = model.calculate(state);
    if (!result.valid) return '<p>Complete the inputs in Economics to see the comparison.</p>';
    const max = Math.max(1, ...result.rows.map(row=>row.customer));
    return '<div class="bars">' + result.rows.map(row => '<div class="bar-row"><div class="bar-label"><span>'+row.label+'</span><strong>'+currency.format(row.customer)+'</strong></div><div class="bar-track" aria-hidden="true"><span class="bar-fill bar-'+row.key+'" style="width:'+(row.customer*100/max)+'%"></span></div></div>').join("")+'</div>';
  }
  function overview() {
    return `<section class="hero">
      <div class="hero-copy"><p class="eyebrow">Case study · Glass handling</p><h1>From equipment sale to service agreement</h1>
        <p class="lead">Would a glass processor pay for less downtime at its transfer cell? Design the offer, test the price and decide whether it deserves a pilot.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#design">Design the service</a><a class="btn btn-outline" href="#economics">Test the economics</a></div>
      </div><figure class="hero-art"><img src="./site/assets/transfer-deck.svg" alt="Isometric illustration of a sheet of glass supported by an array of ball transfer units." width="600" height="340">
      <figcaption>Glass transfer cell <span>Concept illustration</span></figcaption></figure>
    </section>
    <div class="home-grid"><section class="panel chart-panel"><div class="panel-head"><div><p class="eyebrow">Commercial comparison</p><h2>Three-year customer cost</h2></div><a href="#economics">Edit assumptions</a></div>
    ${chart()}<p class="muted">One synthetic cell · GBP, undiscounted · Includes attributable downtime.</p></section>
    <section class="panel gate-card"><p class="eyebrow">Pilot readiness</p><h2>What needs evidence?</h2>
    <p>Check the operating baseline, field-service capacity and the buyer’s willingness to pay before committing to a trial.</p>
    <p class="gate-symbol">${gateCount()} <span>/ 3 gates reviewed in this demo</span></p><a class="gate-link" href="#pilot">Review pilot gates</a></section></div>
    <div class="section-heading home-heading"><p class="eyebrow">Explore the case</p><h2>Inside the workbench</h2></div>
    <div class="journey-grid">
       <a class="journey-card" href="#design"><span class="journey-kicker">Service design</span><h3>Whose problem matters?</h3><p>Compare three stakeholders and use their evidence to revise the delivery blueprint.</p></a>
       <a class="journey-card" href="#economics"><span class="journey-kicker">Commercial model</span><h3>Where does the price work?</h3><p>Compare purchase, subscription and performance fees for both buyer and supplier.</p></a>
       <a class="journey-card" href="#evidence"><span class="journey-kicker">Research</span><h3>What grounds the case?</h3><p>Read the manufacturer’s case, see alternatives a buyer has and inspect the assumptions.</p></a>
    </div><p class="case-credit">An independent application project by Rongsen Zhang. The glass cell, prices and outcomes are fictional. The evidence page links the published industry material.</p>`;
  }
  function pilotPanel() {
    const chosen = proposalKey();
    const result = model.calculate(state);
    const selected = result.rows.find(row=>row.key===chosen);
    const detail = !selected ? "Complete the model inputs to compare the offer." :
      "Three-year customer cost "+currency.format(selected.customer)+" · Supplier contribution "+currency.format(selected.margin)+".";
    return `<section class="panel stack"><div><p class="eyebrow">Proposed commercial scope</p><h2>Choose the offer for review</h2></div>
      <label class="field" for="proposal">Commercial model<select id="proposal" data-field="proposal">${Object.entries(offers).map(([key,name])=>'<option value="'+key+'"'+(key===chosen?' selected':'')+'>'+name+'</option>').join("")}</select></label>
      <p>${detail} <a href="#economics">Review assumptions</a></p>
      <h3>Capability and evidence gates</h3><p>Use these checks to rehearse a pilot review. Each check records a simulated review.</p>
      <div class="gate-checks">${eligibility.map(([key,name,owner,proof])=>'<label class="gate-check"><input type="checkbox" data-field="'+key+'"'+(state[key]?' checked':'')+'><span><strong>'+name+'</strong><small>'+owner+' · '+proof+'</small></span></label>').join("")}</div>
      <p class="callout"><strong>${gateCount()} of 3 gates reviewed.</strong> ${gateCount()===3?"Record a decision and its evidence below. Field verification is still required before a real trial.":"Carry open items into the decision record below."}</p></section>`;
  }
  const sources = [
    ["Aston University on Totaljobs","Target vacancy 1155-26 · advertised role and selection criteria","https://www.totaljobs.com/job/servitization-and-service-innovation-lead-ktp-associate/aston-university-job108197370"],
    ["Aston University","Related closed vacancy R260050","https://jobs.aston.ac.uk/Vacancy.aspx?ref=R260050"],
    ["Archived vacancy text","Responsibilities and person specification","https://unijobs.ac/jobs/servitization-and-service-innovation-lead-ktp-associate-2"],
    ["UK Research and Innovation","Aston University and Alwayse Engineering · project 10146336","https://gtr.ukri.org/projects?ref=10146336"],
    ["Alwayse Engineering","Dip-Tech glass-positioning application","https://www.alwayse.com/success-stories/high-tech-solution-for-handling-glass/"],
    ["Alwayse Engineering","Existing maintenance services","https://www.alwayse.com/ball-transfer-maintenance-services/"],
    ["Alwayse Engineering","Solution design and site surveys","https://www.alwayse.com/total-movement-solutions/"],
    ["Omnitrack","Special ball transfer units and bespoke applications","https://www.omnitrack.com/special-units-for-different-applications/"],
    ["Bridge Bearings","Ball transfer units and interchangeable options","https://www.bridge-bearings.co.uk/products/ball-transfer-units/"],
    ["Bosch Rexroth","Ball transfer units and service-life guidance","https://www.boschrexroth.com/en/gb/c/ball-transfer-units/"],
    ["Jungheinrich UK","Forklift service and usage pricing","https://www.jungheinrich.co.uk/products/forklift-hire/power-buy-the-hour-flexible-contracts-based-on-hourly-usage-144016"],
    ["Bitner, Ostrom & Morgan (2008)","Service Blueprinting: A Practical Technique for Service Innovation","https://doi.org/10.2307/41166446"],
    ["Baines and colleagues (2020)","Framing the servitization transformation process","https://doi.org/10.1016/j.ijpe.2019.07.036"]
  ];
  const repo = "https://github.com/rongsenzhang/transfer-service-lab/blob/main/docs/";
  function evidence() {
    return `<div class="stack"><section class="panel stack"><div><p class="eyebrow">Case selection</p><h2>Why a glass transfer cell?</h2></div>
    <p>Alwayse describes supplying Dip-Tech with ball transfer units mounted on glide strips to position glass and protect its surface. The company also advertises installation, repairs and scheduled maintenance. That makes one cell a credible place to explore a recurring service agreement.</p>
    <p>This workbench models an invented UK site. No customer interviews, contract quotations, operating records or pilot outcomes are presented as company evidence. The cell illustration is original.</p>
    <p><a href="${repo}company.md">Read the company review and sector cases</a></p></section>
    <section class="panel stack"><div><p class="eyebrow">Market alternatives</p><h2>What else could a buyer do?</h2></div>
    <p>Keep approved spares and repair the cell internally, source custom handling equipment from Omnitrack, or evaluate alternative components from Bridge Bearings and Bosch Rexroth. Each is a credible comparison for discovery. An actual shortlist would come from the buyer.</p>
    <p>Jungheinrich’s forklift offer illustrates a standing fee plus measured use. On a passive ball deck, usage-based terms would need a reliable event count. This prototype instead tests a base fee adjusted by attributable downtime.</p><p><a href="${repo}market.md">Read the competitor comparison</a> · <a href="${repo}launch-pack.md">Open the pilot offer and go-to-market pack</a></p></section>
    <section class="panel stack"><div><p class="eyebrow">Method and traceability</p><h2>From public evidence to a field test</h2></div>
    <p>The blueprint follows the customer, visible service team and back-office activities. The capability gates adapt servitization research to a manufacturing SME. The decision brief gathers your scenario, changes and evidence gaps in one downloadable file.</p>
    <p><a href="${repo}role-and-roadmap.md">Role coverage and technical route</a> · <a href="${repo}field-guide.md">Field research and handover guide</a></p>
    <details><summary>Primary sources and supporting references</summary><ul class="source-list">${sources.map(([org,title,url])=>'<li><strong>'+org+'</strong> · <a href="'+url+'">'+title+'</a></li>').join("")}</ul></details></section></div>`;
  }
  const intros = {
    design:["Customer discovery","Design the service","Choose a stakeholder, turn a need into a delivery requirement and test a change to the service scope."],
    economics:["Commercial modelling","Test the economics","Change the assumptions to see which offers work for both customer and supplier."],
    pilot:["Delivery and knowledge transfer","Prepare a pilot decision","Carry the offer into a field trial with an owner, evidence requirements and a route to internal handover."],
    evidence:["Source notes","Evidence behind the case","Trace the industry facts, commercial comparisons and research methods used in the prototype."]
  };
  function route() {
    const value = location.hash.slice(1);
    return Object.hasOwn(titles,value) ? value : "overview";
  }
  function render(focusHeading=false) {
    const key = route();
    const current = document.activeElement?.dataset?.field;
    const openDetails = [...main.querySelectorAll("details")].map((node,i)=>node.open?i:-1);
    const same = main.dataset.route === key;
    if (key==="overview") main.innerHTML=overview();
    else {
      const [section,title,description]=intros[key];
      const content = key==="design"?design.render(state):key==="economics"?model.render(state):key==="pilot"?'<div class="stack">'+pilotPanel()+field.render(state)+'</div>':evidence();
      main.innerHTML='<header class="page-intro"><p class="eyebrow">'+section+'</p><h1>'+title+'</h1><p class="lead">'+description+'</p></header>'+content;
    }
    main.dataset.route=key;
    tabs.forEach(link=>{if(link.hash==="#"+key) link.setAttribute("aria-current","page"); else link.removeAttribute("aria-current");});
    document.title="Transfer Service Lab · "+titles[key];
    if (same && !focusHeading) {
      [...main.querySelectorAll("details")].forEach((node,i)=>{if(openDetails.includes(i))node.open=true;});
      if(current) [...main.querySelectorAll("[data-field]")].find(el=>el.dataset.field===current)?.focus({preventScroll:true});
    }
    if(focusHeading){main.focus({preventScroll:true});window.scrollTo(0,0);}
  }
  function change(el) {
    const key=el.dataset.field;
    if(!Object.hasOwn(defaults,key))return;
    state[key]=el.type==="checkbox"?el.checked:el.value;
    save();
  }
  main.addEventListener("click",event=>{
    const button=event.target.closest("button[data-scenario]");
    if(!button)return;
    if(button.dataset.scenario==="no-improvement"){
      state.serviceHours=state.baseHours;
      tell("Managed downtime now matches the purchase baseline.");
    }else if(button.dataset.scenario==="defaults"){
      Object.assign(state,model.defaults);
      tell("The example’s commercial assumptions have been restored.");
    }else return;
    save();render();
    main.querySelector('button[data-scenario="'+button.dataset.scenario+'"]')?.focus({preventScroll:true});
  });
  main.addEventListener("input",event=>{
    const el=event.target;
    if(!el.matches("textarea[data-field],input[type=number][data-field]")) return;
    change(el);
    if(el.type==="number") {
      const live=main.querySelector("[data-live-model]");
      if(live) live.innerHTML=model.results(state);
    }
  });
  main.addEventListener("change",event=>{
    const el=event.target;
    if(!el.matches("[data-field]"))return;
    change(el);
    if(el.matches("select,input[type=checkbox]"))render();
  });
  document.querySelector(".skip-link").addEventListener("click",event=>{event.preventDefault();main.focus();});
  window.addEventListener("hashchange",()=>render(true));
  document.querySelector("#export").addEventListener("click",()=>{
    const content=[
      "TRANSFER SERVICE LAB | DECISION BRIEF | v1.0.0", "Independent portfolio project by Rongsen Zhang",
      "One fictional UK glass transfer cell. All prices, stoppages and judgements are scenario assumptions. No field validation is claimed.",
      design.brief(state), model.brief(state),
      "PROPOSAL FOR REVIEW\n"+offers[proposalKey()]+"\n"+eligibility.map(([key,name,owner])=>name+" — "+owner+" — "+(state[key]?"reviewed in simulation":"evidence outstanding")).join("\n"),
      field.brief(state), "Sources and methods: https://github.com/rongsenzhang/transfer-service-lab"
    ].join("\n\n");
    const url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="transfer-service-decision-brief.txt";document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);tell("Decision brief exported.");
  });
  render();
})();
