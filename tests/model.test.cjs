const test = require("node:test");
const assert = require("node:assert/strict");
const model = require("../site/model.js");

test("same three-year horizon, one residual to the asset owner and a checked default example", () => {
  const m = model.calculate({});
  assert.equal(m.valid, true);
  assert.deepEqual(m.rows.map(r => [r.key, r.customer, r.cost, r.revenue, r.margin]), [
    ["purchase", 24300, 7500, 12000, 4500],
    ["subscription", 20325, 9900, 16200, 6300],
    ["performance", 19725, 10650, 15600, 4950]
  ]);
  assert.equal(m.ceiling, 6725);
  assert.equal(m.floorSubscription, 3300);
  assert.equal(m.floorPerformance, 3550);
  assert.deepEqual(m.feasible, ["performance", "subscription"]);
  assert.equal(m.savedHours, 7);
  assert.equal(m.feeAdjustment, 700);
});

test("performance credits, bonuses and the zero-fee floor apply per year", () => {
  assert.equal(model.calculate({ baseHours: 50, serviceHours: 0 }).feeAdjustment, 1500);
  assert.equal(model.calculate({ baseHours: 10, serviceHours: 50 }).feeAdjustment, -1500);
  assert.equal(model.calculate({ baseHours: 12, serviceHours: 14 }).performanceFee, 4300);
  const belowBase = model.calculate({ baseHours: 0, serviceHours: 50, outcomeBase: 100 });
  assert.equal(belowBase.performanceFee, 0);
  assert.equal(belowBase.rows[2].revenue, 0);
  assert.equal(model.calculate({ baseHours: 12, serviceHours: 12 }).feeAdjustment, 0);
});

test("the downside scenario reruns the comparison at the purchase downtime baseline", () => {
  const m = model.calculate({});
  const atBaseline = model.calculate({ serviceHours: model.defaults.baseHours });
  assert.deepEqual(m.downside.map(r => r.saving), atBaseline.rows.slice(1).map(r => r.saving));
  assert.deepEqual(m.downside.map(r => r.saving), [-1800, 900]);
});

test("supplier cost responds to service costs, real customer savings and positive contribution are both required", () => {
  const original = model.calculate({});
  const raised = model.calculate({ fieldVisits: 3, visitCost: 450 });
  assert.equal(raised.rows[1].cost - original.rows[1].cost, 1950);
  assert.equal(raised.rows[0].cost, original.rows[0].cost);
  assert.equal(raised.rows[1].customer, original.rows[1].customer);
  const priceTooHigh = model.calculate({ flatFee: 10000, outcomeBase: 10000 });
  assert.deepEqual(priceTooHigh.feasible, []);
  assert.equal(priceTooHigh.decision, "Hold both service offers");
  const lossLeader = model.calculate({ flatFee: 0, outcomeBase: 0, baseHours: 0, serviceHours: 0 });
  assert.ok(lossLeader.rows[1].saving > 0 && lossLeader.rows[1].margin < 0);
  assert.deepEqual(lossLeader.feasible, []);
  assert.equal(model.calculate({ flatFee: original.ceiling }).rows[1].feasible, false);
  assert.equal(model.calculate({ flatFee: original.floorSubscription }).rows[1].feasible, false);
});

test("empty, unsupported, non-finite, fractional visit count and out-of-domain inputs suppress derived values", () => {
  for (const state of [{ hourValue: "" }, { hourValue: " " }, { hourValue: null }, { hourValue: NaN },
    { flatFee: Infinity }, { fieldVisits: 2.1 }, { serviceHours: -1 }, { baseHours: 8761 }, { purchasePrice: 100 }]) {
    const m = model.calculate(state);
    assert.equal(m.valid, false);
    assert.deepEqual(m.rows, []);
    assert.match(model.results(state), /Check the scenario inputs/);
    assert.match(model.brief(state), /unavailable/);
  }
  assert.equal(model.calculate({ hourValue: "0", flatFee: "0", unrelatedField: "hello" }).valid, true);
  assert.equal(model.calculate({ fieldVisits: "3", visitCost: "199.95" }).annualDelivery, 1099.85);
});

test("renders every control, escapes persisted values and exports scenario assumptions and both sides", () => {
  const html = model.render({ hourValue: '"><script>bad()</script>' });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /data-live-model/);
  assert.match(html, /data-scenario="no-improvement"/);
  assert.match(html, /data-scenario="defaults"/);
  for (const key of Object.keys(model.defaults)) assert.ok(html.includes('data-field="' + key + '"'));
  const output = model.brief({ hourValue: "300" });
  for (const text of ["customer cost", "supplier revenue", "contribution", "£1,200", "£1,500", "300 (£ / hour)"]) assert.ok(output.includes(text));
});

test("sale opportunity cost and delayed cash collection remain visible for a profitable service", () => {
  const modelled = model.calculate({});
  assert.deepEqual(modelled.vsSale, { subscription: 1800, performance: 450 });
  assert.deepEqual(modelled.supplierCash, { initial: 7500, subscription: 8700, performance: 8950 });
  const discount = model.calculate({ flatFee: 4000 });
  assert.equal(discount.rows[1].feasible, true);
  assert.equal(discount.vsSale.subscription, -2400);
  assert.match(model.results({ flatFee: 4000 }), /£2,400 lower than the sale/);
  assert.match(model.results({ flatFee: 4800 }), /equal to the sale/);
  const unfunded = model.calculate({ flatFee: 0, outcomeBase: 0, serviceHours: 12 });
  assert.deepEqual(unfunded.supplierCash, { initial: 7500, subscription: 11100, performance: 11850 });
  assert.match(model.brief({}), /Pilot sign-off requires/);
});
