/* Three-year decision model for a single synthetic glass-transfer cell. */
(function (root) {
  "use strict";

  const years = 3;
  const residual = 1200;
  const feePerHour = 100;
  const annualAdjustmentCap = 1500;
  const verificationCost = 250;

  const fields = {
    baseHours: { label: "Purchase downtime", unit: "hours / year", value: 12, max: 8760 },
    serviceHours: { label: "Managed downtime", unit: "hours / year", value: 5, max: 8760 },
    hourValue: { label: "Customer downtime cost", unit: "£ / hour", value: 275, max: 100000 },
    flatFee: { label: "Subscription fee", unit: "£ / year", value: 5400, max: 1000000 },
    outcomeBase: { label: "Performance base fee", unit: "£ / year", value: 4500, max: 1000000 },
    purchasePrice: { label: "Installed purchase price", unit: "£ once", value: 12000, min: residual, max: 1000000 },
    buyerUpkeep: { label: "Buyer-managed upkeep", unit: "£ / year", value: 1200, max: 1000000 },
    supplyCost: { label: "Supplier build & installation", unit: "£ once", value: 7500, min: residual, max: 1000000 },
    fieldVisits: { label: "Managed service visits", unit: "visits / year", value: 2, max: 365, integer: true },
    visitCost: { label: "Visit labour & travel", unit: "£ / visit", value: 350, max: 100000 },
    partsAdmin: { label: "Managed parts & administration", unit: "£ / year", value: 500, max: 1000000 }
  };
  const defaults = Object.freeze(Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value])));
  const pounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  const precisePounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const money = value => pounds.format(value);
  const preciseMoney = value => precisePounds.format(value);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function read(state, key) {
    return state && Object.prototype.hasOwnProperty.call(state, key) ? state[key] : defaults[key];
  }

  function adjustment(avoidedHours, baseFee) {
    // Credit cannot exceed either the annual cap or the annual base fee.
    return Math.min(annualAdjustmentCap, Math.max(-Math.min(baseFee, annualAdjustmentCap), avoidedHours * feePerHour));
  }

  function compare(key, label, customer, cost, revenue) {
    return { key, label, customer, cost, revenue, margin: revenue - cost };
  }

  function outcome(row, purchaseCost) {
    const saving = purchaseCost - row.customer;
    return { ...row, saving, feasible: saving > 0.005 && row.margin > 0.005 };
  }

  // Service bills are settled in arrears. The year-three residual arrives after the final invoice.
  function peakCashNeed(install, annualCost, fee) {
    let balance = -install;
    let peak = install;
    for (let year = 1; year <= years; year++) {
      balance -= annualCost;
      peak = Math.max(peak, -balance);
      balance += fee;
    }
    return peak;
  }

  function calculate(state) {
    const values = {};
    const errors = [];
    for (const [key, field] of Object.entries(fields)) {
      const raw = read(state, key);
      const numeric = typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "");
      const value = numeric ? Number(raw) : NaN;
      if (!Number.isFinite(value) || value < (field.min || 0) || value > field.max || (field.integer && !Number.isInteger(value))) {
        errors.push({ key, label: field.label, range: (field.integer ? "a whole number from " : "a number from ") + (field.min || 0) + " to " + field.max });
      }
      values[key] = value;
    }
    if (errors.length) return { valid: false, errors, rows: [] };

    const v = values;
    const lostCostPurchase = years * v.baseHours * v.hourValue;
    const lostCostManaged = years * v.serviceHours * v.hourValue;
    const purchaseCost = v.purchasePrice + years * v.buyerUpkeep + lostCostPurchase - residual;
    const annualDelivery = v.fieldVisits * v.visitCost + v.partsAdmin;
    const managedCost = v.supplyCost + years * annualDelivery - residual;
    const performanceCost = managedCost + years * verificationCost;
    const savedHours = v.baseHours - v.serviceHours;
    const feeAdjustment = adjustment(savedHours, v.outcomeBase);
    const performanceFee = v.outcomeBase + feeAdjustment;
    const rows = [
      compare("purchase", "Equipment purchase", purchaseCost, v.supplyCost, v.purchasePrice),
      outcome(compare("subscription", "Managed subscription", years * v.flatFee + lostCostManaged, managedCost, years * v.flatFee), purchaseCost),
      outcome(compare("performance", "Performance contract", years * performanceFee + lostCostManaged, performanceCost, years * performanceFee), purchaseCost)
    ];
    const ceiling = (purchaseCost - lostCostManaged) / years;
    const feasible = rows.slice(1).filter(row => row.feasible).sort((a, b) => a.customer - b.customer);
    const supplierCash = {
      initial: v.supplyCost,
      subscription: peakCashNeed(v.supplyCost, annualDelivery, v.flatFee),
      performance: peakCashNeed(v.supplyCost, annualDelivery + verificationCost, performanceFee)
    };
    const vsSale = { subscription: rows[1].margin - rows[0].margin, performance: rows[2].margin - rows[0].margin };
    return {
      valid: true, errors, rows, values, savedHours, feeAdjustment, performanceFee, annualDelivery, supplierCash, vsSale,
      ceiling, floorSubscription: managedCost / years, floorPerformance: performanceCost / years,
      feasible: feasible.map(row => row.key),
      decision: feasible.length ? "Test " + feasible[0].label.toLowerCase() : "Hold both service offers",
      downside: [
        { key: "subscription", saving: purchaseCost - years * (v.flatFee + v.baseHours * v.hourValue) },
        { key: "performance", saving: purchaseCost - years * (v.outcomeBase + v.baseHours * v.hourValue) }
      ]
    };
  }

  function input(state, key) {
    const field = fields[key];
    return '<label class="field"><span>' + escape(field.label) + '</span><small>' + escape(field.unit) +
      '</small><input type="number" id="econ-' + key + '" data-field="' + key + '" min="' + (field.min || 0) +
      '" max="' + field.max + '" step="' + (field.integer ? "1" : "any") + '" value="' + escape(read(state, key)) + '"></label>';
  }

  function table(headers, body, label) {
    return '<div class="table-wrap"><table aria-label="' + label + '"><thead><tr>' +
      headers.map(h => "<th scope=\"col\">" + h + "</th>").join("") + "</tr></thead><tbody>" + body + "</tbody></table></div>";
  }

  function direction(saving) {
    if (Math.abs(saving) < 0.005) return "same cost as purchase";
    return preciseMoney(Math.abs(saving)) + (saving > 0 ? " below purchase" : " above purchase");
  }

  function marginDifference(delta) {
    if (Math.abs(delta) < 0.005) return "equal to the sale";
    return preciseMoney(Math.abs(delta)) + (delta > 0 ? " higher than the sale" : " lower than the sale");
  }

  function results(state) {
    const m = calculate(state);
    if (!m.valid) return '<section class="panel callout" role="status"><h3>Check the scenario inputs</h3><ul>' +
      m.errors.map(e => '<li>' + escape(e.label) + ' needs ' + escape(e.range) + '.</li>').join("") + '</ul></section>';

    const comparison = table(["Contract", "Customer 3-year cost", "Supplier revenue", "Supplier cost¹", "Supplier contribution"], m.rows.map(row =>
      '<tr><th scope="row">' + row.label + '</th><td>' + money(row.customer) + '</td><td>' + money(row.revenue) +
      '</td><td>' + money(row.cost) + '</td><td>' + money(row.margin) + '</td></tr>').join(""), "Three-year customer and supplier economics");
    const decisionCopy = m.feasible.length
      ? "At the entered prices, " + m.feasible.length + " of 2 service offers save the customer money and cover the supplier’s modelled costs. The lowest customer cost among those offers determines the pilot suggestion."
      : "At the entered prices, neither service offer delivers both a customer saving and a positive supplier contribution. Revisit the service cost, price or measured downtime before a pilot.";
    const windowText = (low, high) => high - low > 0.01
      ? "Above " + preciseMoney(low) + " and below " + preciseMoney(high)
      : "No positive two-sided price window";
    const ranges = table(["Managed model", "Break-even supplier fee / yr", "Break-even customer fee / yr", "Two-sided fee window / yr"], [
      ["Subscription", m.floorSubscription], ["Performance", m.floorPerformance]
    ].map(([label, floor]) => '<tr><th scope="row">' + label + '</th><td>' + preciseMoney(floor) + '</td><td>' +
      preciseMoney(m.ceiling) + '</td><td>' + windowText(floor, m.ceiling) + '</td></tr>').join(""), "Annual contract fee boundaries");

    const adjDescription = m.feeAdjustment < 0 ? "credit" : m.feeAdjustment > 0 ? "bonus" : "adjustment";
    return '<section class="panel stack"><div class="section-heading"><h3>Three-year comparison</h3></div>' + comparison +
      '<p class="muted">¹ Managed supplier cost includes delivery and deducts the retained asset value. Contribution is revenue less the modelled economic cost, before overheads and tax. Figures in this table are rounded to whole pounds.</p>' +
      '<div class="callout"><h3>' + m.decision + '</h3><p>' + decisionCopy + ' A pilot still requires customer agreement, cash cover, delivery capacity and a signed measurement plan.</p></div></section>' +
      '<section class="panel stack"><h3>Supplier trade-off</h3><p>Three-year supplier contribution on the subscription is <strong>' + marginDifference(m.vsSale.subscription) +
      '</strong>. On the performance contract it is <strong>' + marginDifference(m.vsSale.performance) + '</strong>. A positive contribution can still leave the supplier earning less than an outright sale.</p>' +
      '<p><strong>Funding the equipment.</strong> The supplier pays ' + preciseMoney(m.supplierCash.initial) + ' at installation and retains the asset on both service contracts. If the annual fees arrive in arrears, the peak cash requirement is ' +
      preciseMoney(m.supplierCash.subscription) + ' for subscription and ' + preciseMoney(m.supplierCash.performance) + ' for performance. This assumes zero customer deposit, service costs paid before each annual collection and residual proceeds after the final invoice.</p></section>' +
      '<section class="panel stack"><h3>Price boundaries and downside</h3><p>Both parties benefit when the total annual fee falls inside the range. The performance fee includes the verified outcome adjustment.</p>' +
      ranges + '<p>The modelled performance fee is <strong>' + preciseMoney(m.performanceFee) + ' per year</strong>, including a ' + preciseMoney(Math.abs(m.feeAdjustment)) +
      ' ' + adjDescription + ' for a ' + Math.abs(m.savedHours).toLocaleString("en-GB") + '-hour ' + (m.savedHours >= 0 ? "reduction" : "increase") + ' in annual downtime.</p>' +
      '<p><strong>If downtime stays at the purchase baseline</strong>, the subscription costs ' + direction(m.downside[0].saving) +
      ' and the performance contract costs ' + direction(m.downside[1].saving) + ' over three years. Its outcome adjustment then falls to zero.</p></section>';
  }

  function render(state) {
    return '<div class="stack"><section class="panel stack"><div class="section-heading"><h2>Contract economics</h2></div>' +
      '<p>Compare one UK glass-transfer cell over three years. Test the customer’s cost of downtime, the price they could pay and the cost of delivering each offer. All figures are illustrative, in GBP.</p>' +
      '<div class="input-grid">' + ["baseHours", "serviceHours", "hourValue", "flatFee", "outcomeBase"].map(k => input(state, k)).join("") + '</div>' +
      '<div class="economics-actions"><button type="button" data-scenario="no-improvement">Set managed downtime to baseline</button> <button type="button" data-scenario="defaults">Restore model assumptions</button></div>' +
      '<details id="delivery-assumptions"><summary>Purchase and delivery assumptions</summary><div class="input-grid">' +
      ["purchasePrice", "buyerUpkeep", "supplyCost", "fieldVisits", "visitCost", "partsAdmin"].map(k => input(state, k)).join("") +
      '</div></details></section><div class="stack" data-live-model>' + results(state) + '</div>' +
      '<section class="panel stack"><h3>How the calculation works</h3><dl>' +
      '<dt>Equipment purchase</dt><dd>The buyer pays the installed price, annual upkeep and downtime cost, then receives the fixed £1,200 end-of-year-three residual. Supplier revenue is the equipment invoice. Supplier cost is build and installation. The model allocates subsequent upkeep to the buyer.</dd>' +
      '<dt>Managed subscription</dt><dd>The supplier retains the asset and receives the same £1,200 residual once. The buyer pays the flat annual fee plus its own lost production. The supplier funds build and installation, plus visits × labour and travel cost, parts and administration each year.</dd>' +
      '<dt>Performance contract</dt><dd>Uses the same managed delivery and downtime assumption, plus £250 a year for measurement. Compare annual cell-attributed downtime to the purchase baseline. Each hour avoided adds £100 to the annual base fee. Each excess hour earns a £100 credit. The annual bonus or credit is capped at £1,500 and a credit cannot exceed the base fee. A real pilot needs agreed attribution and equivalent production exposure.</dd>' +
      '<dt>Scope</dt><dd>Three equal years, constant use and rates, undiscounted, ex VAT. Excludes corporate overhead, taxes, financing and failures outside this cell. Downtime cost is a customer assumption about lost production. No external price list or guaranteed service outcome is used.</dd></dl></section></div>';
  }

  function brief(state) {
    const m = calculate(state);
    if (!m.valid) return "Contract economics unavailable. Check " + m.errors.map(e => e.label.toLowerCase()).join(", ") + ".";
    return [
      "Three-year economics | one synthetic glass-transfer cell, GBP, undiscounted, ex VAT",
      ...m.rows.map(r => r.label + ": customer cost " + preciseMoney(r.customer) + ", supplier revenue " + preciseMoney(r.revenue) +
        ", supplier economic cost " + preciseMoney(r.cost) + ", contribution " + preciseMoney(r.margin) + "."),
      "Indicative decision: " + m.decision + ". The proposed service must cost less than purchase for the buyer and generate positive supplier contribution.",
      "Supplier trade-off: subscription contribution " + marginDifference(m.vsSale.subscription) + ", performance " + marginDifference(m.vsSale.performance) + ".",
      "Working capital: upfront build and install " + preciseMoney(m.supplierCash.initial) + ". Peak cash needed before annual collections: subscription " +
        preciseMoney(m.supplierCash.subscription) + ", performance " + preciseMoney(m.supplierCash.performance) + ". Assumes no deposit and annual invoices paid after service costs, before the year-three residual.",
      "Pilot sign-off requires customer agreement, cash cover, service capacity and a signed KPI measurement plan.",
      "Annual total-fee boundaries: buyer ceiling " + preciseMoney(m.ceiling) + ", supplier floor " + preciseMoney(m.floorSubscription) +
        " for subscription and " + preciseMoney(m.floorPerformance) + " for performance.",
      "If managed downtime equals baseline: subscription " + direction(m.downside[0].saving) + ", performance " + direction(m.downside[1].saving) + ".",
      "Inputs: " + Object.entries(fields).map(([k, f]) => f.label + " " + m.values[k] + " (" + f.unit + ")").join(", ") + ".",
      "Fixed assumptions: the asset owner receives £1,200 in year three. Performance verification costs £250/year. Bonus or credit £100/hour, capped at £1,500/year and at base fee for credits. VAT, financing, tax and corporate overhead excluded."
    ].join("\n");
  }

  const api = Object.freeze({ defaults, calculate, render, results, brief });
  root.WorkbenchModel = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
