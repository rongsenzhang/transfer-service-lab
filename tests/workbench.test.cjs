const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const project = path.resolve(__dirname, '..');
const site = path.join(project, 'site');
const browser = vm.createContext({});
browser.window = browser;
for (const name of ['design.js', 'model.js', 'fieldwork.js']) {
  const file = path.join(site, name);
  vm.runInContext(fs.readFileSync(file, 'utf8'), browser, { filename: file });
}
const { ServiceDesign: design, WorkbenchModel: economics, Fieldwork: pilot } = browser;

test('each stakeholder lens has its own discovery question and acceptance evidence', () => {
  const questions = new Set();
  const evidence = new Set();
  for (const [choice, name] of Object.entries({
    maintenance: 'Plant maintenance', procurement: 'Procurement', integrator: 'System integrator'
  })) {
    const state = { designLens: choice };
    const view = design.render(state);
    const output = design.brief(state);
    assert.ok(view.includes('value="' + choice + '" selected'));
    assert.ok(output.includes('Stakeholder: ' + name));
    for (const [field, values] of [['Discovery question', questions], ['Acceptance check', evidence]]) {
      const line = output.split('\n').find(line => line.startsWith(field + ': '));
      assert.ok(line && line.length > field.length + 2, 'Missing ' + field);
      assert.ok(view.includes(line.slice(field.length + 2)));
      values.add(line);
    }
  }
  assert.equal(questions.size, 3);
  assert.equal(evidence.size, 3);
});

test('each scope revision carries its delivery evidence into the handout', () => {
  const evidence = new Set();
  for (const choice of ['baseline', 'window', 'ceiling', 'interface']) {
    const state = { designRevision: choice };
    const output = design.brief(state);
    const proof = output.split('\n').find(line => line.startsWith('Delivery evidence: '));
    assert.ok(proof);
    assert.ok(design.render(state).includes(proof.slice('Delivery evidence: '.length)));
    evidence.add(proof);
  }
  assert.equal(evidence.size, 4);
  for (const [key, label] of Object.entries({
    open: 'Gather evidence', test: 'Test in a workshop', revise: 'Revise the offer', park: 'Park the proposal'
  })) {
    assert.ok(design.brief({ designDecision: key }).includes('Decision: ' + label));
  }
  assert.equal(design.brief({ designDecision: 'unsupported', designLens: 'constructor', designRevision: 'toString' }),
    design.brief({}));
});

test('free-text notes are escaped in both workspaces and preserved in the plain-text export', () => {
  const note = 'Compare the terms </textarea> & "exceptions" with the buyer.';
  for (const [view, field] of [[design, 'designFeedback'], [pilot, 'pilotNote']]) {
    const state = { [field]: note };
    const html = view.render(state);
    assert.ok(!html.includes(note));
    assert.ok(html.includes('&lt;/textarea&gt; &amp; &quot;exceptions&quot;'));
    assert.ok(view.brief(state).includes(note));
  }
});

test('the pilot decision and teach-back persist into the brief independently of the financial suggestion', () => {
  const state = {
    ...economics.defaults, ...design.defaults, designLens: 'procurement', designRevision: 'ceiling',
    designFeedback: 'Buyer needs a cost ceiling.', pilotNote: 'Agree a price review with the site buyer.',
    pilotDecision: 'Revise the service offer', trainingComplete: true
  };
  const html = pilot.render(state);
  assert.ok(html.includes('<option selected>Revise the service offer</option>'));
  assert.match(html, /data-field="trainingComplete" checked/);
  assert.ok(pilot.brief(state).includes('Revise the service offer'));
  assert.ok(pilot.brief(state).includes(state.pilotNote));
  assert.match(pilot.brief(state), /teach-back: Marked complete/i);
  assert.match(economics.brief(state), /Indicative decision: Test performance contract/);
  assert.match(design.brief(state), /approval for chargeable exceptions/);

  const unsupported = { pilotDecision: 'Unknown', trainingComplete: false };
  assert.match(pilot.brief(unsupported), /Decision: Hold for evidence/);
  assert.match(pilot.brief(unsupported), /teach-back: Pending/i);
  assert.doesNotMatch(pilot.render(unsupported), /data-field="trainingComplete" checked/);
});

test('a changed financial assumption affects only its own section of the combined scenario', () => {
  const before = { designLens: 'integrator', pilotDecision: 'Hold for evidence' };
  const after = { ...before, flatFee: '4800', serviceHours: '3' };
  assert.notEqual(economics.brief(after), economics.brief(before));
  assert.equal(design.brief(after), design.brief(before));
  assert.equal(pilot.brief(after), pilot.brief(before));
  const outputs = [design, economics, pilot].map(view => view.render(after));
  const writable = outputs.flatMap(html =>
    Array.from(html.matchAll(/data-field="([^"]+)"/g), match => match[1]));
  assert.equal(new Set(writable).size, writable.length, 'Two controls share a persisted field key');
  assert.ok(writable.includes('flatFee') && writable.includes('pilotDecision') && writable.includes('designLens'));
});

function assertPublishedFile(base, reference) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return;
  assert.ok(!reference.startsWith('/'), 'A root-relative asset breaks project Pages: ' + reference);
  const pathname = decodeURIComponent(reference.split(/[?#]/)[0]);
  const resolved = path.resolve(base, pathname);
  assert.ok(resolved.startsWith(project + path.sep), 'Asset points outside the published tree: ' + reference);
  assert.ok(fs.statSync(resolved, { throwIfNoEntry: false })?.isFile(), 'Missing published file: ' + reference);
}

test('the entry point loads every browser module in order and serves its assets under a GitHub project path', () => {
  const document = fs.readFileSync(path.join(project, 'index.html'), 'utf8');
  const scripts = Array.from(document.matchAll(/<script\b[^>]*?src=["']([^"']+)["']/gi), m => m[1]);
  const labels = scripts.map(src => path.posix.basename(src));
  const shellIndex = labels.indexOf('app.js');
  for (const dependency of ['design.js', 'model.js', 'fieldwork.js']) {
    const position = labels.indexOf(dependency);
    assert.ok(position >= 0 && position < shellIndex, dependency + ' should load before the workbench shell');
  }
  for (const match of document.matchAll(/<(?:link|img|source|script)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)) {
    assertPublishedFile(project, match[1]);
  }
  const css = fs.readFileSync(path.join(site, 'styles.css'), 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^)'"]+?)["']?\s*\)/gi)) {
    assertPublishedFile(site, match[1]);
  }
  const shell = fs.readFileSync(path.join(site, 'app.js'), 'utf8');
  for (const match of shell.matchAll(/(?:src|href)=["']([^"']+\.(?:svg|webp|png|jpe?g))["']/gi)) {
    assertPublishedFile(project, match[1]);
  }
});

// Exercise the shell's event wiring with only the browser operations it calls.
// Visual layout and native form interaction are covered by manual browser testing.
function launchShell(storage, initialHash) {
  const events = {};
  const view = {
    dataset: {},
    focus() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(name, handler) { events[name] = handler; }
  };
  let downloaded;
  let downloadName;
  const context = vm.createContext({
    document: {
      querySelector(selector) {
        if (selector === '#view') return view;
        if (selector === '#notice') return {};
        return { addEventListener(name, handler) { events[selector + ':' + name] = handler; } };
      },
      querySelectorAll() { return []; },
      createElement() { return { click() { downloadName = this.download; }, remove() {} }; },
      body: { append() {} }
    },
    location: { hash: initialHash },
    localStorage: {
      getItem(key) { return storage.get(key) ?? null; },
      setItem(key, value) { storage.set(key, value); }
    },
    Blob,
    URL: { createObjectURL(blob) { downloaded = blob; return 'blob:scenario'; }, revokeObjectURL() {} },
    setTimeout() {},
    clearTimeout() {},
    scrollTo() {},
    addEventListener(name, handler) { events[name] = handler; }
  });
  context.window = context;
  for (const name of ['model.js', 'design.js', 'fieldwork.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(site, name), 'utf8'), context, { filename: name });
  }
  return {
    view,
    change(route) { context.location.hash = route; events.hashchange(); },
    choose(field, value, type = 'select') {
      const target = {
        dataset: { field }, type, value, checked: value,
        matches(selector) { return selector === '[data-field]' || selector.includes(type); }
      };
      events.change({ target });
    },
    async download() {
      events['#export:click']();
      assert.match(downloadName, /\.txt$/);
      return downloaded.text();
    }
  };
}

test('a panel can edit a case, reload it on another tab and export its combined decision record', async () => {
  const storage = new Map();
  const first = launchShell(storage, '#design');
  first.choose('designLens', 'integrator');
  first.choose('designFeedback', 'Workshop should establish the equipment boundary.', 'textarea');
  first.change('#economics');
  first.choose('flatFee', '4800', 'number');
  first.change('#pilot');
  first.choose('proposal', 'performance');
  first.choose('baselineChecked', true, 'checkbox');
  first.choose('pilotNote', 'Agree the observation window with the site lead.', 'textarea');
  first.choose('pilotDecision', 'Hold for evidence');
  const restored = launchShell(storage, '#overview');
  assert.match(restored.view.innerHTML, /1 <span>\/ 3 gates reviewed/);
  restored.change('#pilot');
  assert.match(restored.view.innerHTML, /Agree the observation window/);
  const text = await restored.download();
  assert.match(text, /Stakeholder: System integrator/);
  assert.match(text, /Workshop should establish the equipment boundary/);
  assert.match(text, /Subscription fee 4800/);
  assert.match(text, /PROPOSAL FOR REVIEW\nPerformance contract/);
  assert.match(text, /Operating baseline[^\n]+reviewed in simulation/);
  assert.match(text, /Decision: Hold for evidence/);
  assert.match(text, /Agree the observation window/);
});
