/* The scenario and all proposed acceptance checks are illustrative. */
(function () {
  'use strict';

  const lenses = {
    maintenance: {
      name: 'Plant maintenance',
      question: 'When the transfer cell stops, how do you decide whether the deck, the upstream line or the material caused the interruption?',
      need: 'Separate attributable deck interruptions from other line stops and arrange access around production.',
      requirement: 'Give each covered deck a site asset ID. Agree the fault categories, the access contact and who can sign the return-to-service record.',
      evidence: 'A maintenance lead can classify a sample event using the agreed definitions. Disputed causes remain unassigned until reviewed.',
      artefact: 'An annotated stop log and a signed asset register',
      owner: 'Site maintenance lead and service engineer'
    },
    procurement: {
      name: 'Procurement',
      question: 'Which costs can you authorise under a recurring fee, and what would trigger a separate purchase order?',
      need: 'Understand what the recurring charge covers and how exceptions affect the annual budget.',
      requirement: 'Separate scheduled labour, approved consumables and chargeable exceptions. Name the customer contact who can authorise a variation.',
      evidence: 'The buyer can reconcile a mock invoice to the scope and distinguish an included replacement from an additional charge.',
      artefact: 'A marked-up scope schedule and a sample invoice',
      owner: 'Site buyer and commercial lead'
    },
    integrator: {
      name: 'System integrator',
      question: 'Which party can release this cell for a service visit, and who takes the first call when a line fault crosses the equipment boundary?',
      need: 'Keep the service provider, the integrator and the site aligned when a fault affects more than the transfer deck.',
      requirement: 'Agree the physical asset boundary, the initial triage owner and a hand-off route for faults outside the covered deck.',
      evidence: 'The three parties can route a sample mixed-cause event to a named owner and record who will update the site.',
      artefact: 'An annotated interface drawing and an escalation record',
      owner: 'Integrator project lead and site operations lead'
    }
  };

  const revisions = {
    baseline: {
      name: 'Keep the base scope for discovery',
      change: 'Start with a register of covered units, a planned inspection and a condition report. Review exceptions with the site before including them in the offer.',
      trigger: 'The parties confirm a service window and its asset list.',
      client: 'Confirm access and identify the shift contact.',
      front: 'The service coordinator confirms the agreed scope and visit window.',
      back: 'The planner assigns a competent engineer against the asset register.',
      proof: 'A visit record links the asset, agreed window and named site contact.'
    },
    window: {
      name: 'Add a production-window agreement',
      change: 'Add a named shift contact, an agreed release window and a rebooking rule to the visit specification.',
      trigger: 'The shift lead confirms or withdraws the agreed access window.',
      client: 'Release the identified cell or record a request to rebook.',
      front: 'The coordinator confirms access with the shift lead and records any rescheduling.',
      back: 'The planner reserves capacity and checks the revised visit against the service plan.',
      proof: 'The booking log distinguishes a missed provider visit from a customer-requested change.'
    },
    ceiling: {
      name: 'Add approval for chargeable exceptions',
      change: 'Add a written variation process. Quote work outside the included scope and obtain approval before the extra work starts.',
      trigger: 'An inspection identifies an item outside the agreed service scope.',
      client: 'Review the separate quotation and record approval or deferral.',
      front: 'The coordinator explains the proposed work, charge and consequence of deferral.',
      back: 'The commercial lead checks the scope, costs the exception and links it to the asset.',
      proof: 'The mock invoice traces each variation to an approval or a recorded deferral.'
    },
    interface: {
      name: 'Add a joint fault hand-off',
      change: 'Add a joint triage contact and a boundary drawing. Log a mixed-cause event separately until the site and integrator agree attribution.',
      trigger: 'The reported interruption may involve both the deck and adjacent equipment.',
      client: 'Supply the affected asset ID, time and observable symptom.',
      front: 'The service coordinator opens a shared event record and agrees who will update the site.',
      back: 'An engineering lead reviews the interface drawing with the integrator and assigns follow-up.',
      proof: 'A trial event has a named owner, an attribution decision or an open query, and a next update.'
    }
  };

  const decisions = {
    open: { name: 'Gather evidence', next: 'Ask the discovery question and request the named artefact. Keep the scope provisional.' },
    test: { name: 'Test in a workshop', next: 'Run one example with the named owners. Record any disagreement and whether the acceptance check worked.' },
    revise: { name: 'Revise the offer', next: 'Update the service specification, identify the affected cost or assumption and ask the customer to review the change.' },
    park: { name: 'Park the proposal', next: 'Record the missing evidence or delivery constraint and agree when the decision will be reopened.' }
  };

  const defaults = {
    designLens: 'maintenance',
    designRevision: 'baseline',
    designDecision: 'open',
    designFeedback: ''
  };

  function safeText(input) {
    return String(input ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function keyIn(options, value, fallback) {
    return Object.prototype.hasOwnProperty.call(options, value) ? value : fallback;
  }

  function read(state = {}) {
    return {
      lens: keyIn(lenses, state.designLens, defaults.designLens),
      revision: keyIn(revisions, state.designRevision, defaults.designRevision),
      decision: keyIn(decisions, state.designDecision, defaults.designDecision),
      feedback: typeof state.designFeedback === 'string' ? state.designFeedback : ''
    };
  }

  function options(items, selected) {
    return Object.entries(items).map(([key, item]) =>
      `<option value="${key}"${selected === key ? ' selected' : ''}>${safeText(item.name)}</option>`
    ).join('');
  }

  function render(state) {
    const view = read(state);
    const lens = lenses[view.lens];
    const revision = revisions[view.revision];
    const decision = decisions[view.decision];
    return `<div class="stack">
      <section class="panel stack" aria-labelledby="design-discovery">
        <div><p class="eyebrow">Customer discovery</p>
          <h2 id="design-discovery" class="section-heading">Whose problem are we solving?</h2>
          <p>Explore one glass-processing cell from three perspectives. Each need is a hypothesis for a customer conversation.</p></div>
        <label class="field">Stakeholder perspective
          <select data-field="designLens">${options(lenses, view.lens)}</select></label>
        <div class="callout"><strong>Ask in the workshop</strong><p>${lens.question}</p></div>
        <dl>
          <dt><strong>Customer need to test</strong></dt><dd>${lens.need}</dd>
          <dt><strong>Proposed service requirement</strong></dt><dd>${lens.requirement}</dd>
          <dt><strong>Acceptance check</strong></dt><dd>${lens.evidence}</dd>
          <dt><strong>Evidence to request</strong></dt><dd>${lens.artefact}. Owners: ${lens.owner}.</dd>
        </dl>
      </section>
      <section class="panel stack" aria-labelledby="design-blueprint">
        <div><p class="eyebrow">Service blueprint</p>
          <h2 id="design-blueprint" class="section-heading">Turn a requirement into a visit</h2>
          <p>Change the scope to see who does the work and how the pilot would verify delivery.</p></div>
        <label class="field">Scope revision to explore
          <select data-field="designRevision">${options(revisions, view.revision)}</select></label>
        <p class="callout">${revision.change}</p>
        <div class="table-wrap"><table>
          <caption>Proposed delivery sequence</caption>
          <thead><tr><th scope="col">Service step</th><th scope="col">Action or evidence</th></tr></thead>
          <tbody>
            <tr><th scope="row">Trigger</th><td>${revision.trigger}</td></tr>
            <tr><th scope="row">Customer action</th><td>${revision.client}</td></tr>
            <tr><th scope="row">Customer-facing work</th><td>${revision.front}</td></tr>
            <tr><th scope="row">Behind the scenes</th><td>${revision.back}</td></tr>
            <tr><th scope="row">Delivery evidence</th><td>${revision.proof}</td></tr>
          </tbody>
        </table></div>
        <details><summary>Service boundary and engineering feedback</summary>
          <p>The illustrative offer covers the registered transfer deck. The site controls access and authorises a return to operation under its own procedures. Adjacent machinery, glass damage and production losses require separate scope and attribution.</p>
          <p>After a repeat issue, record the affected unit family and the engineer’s observations. The engineering owner reviews service access and part identification with the integrator, then trials a drawing or parts-list revision on a representative cell before wider adoption.</p></details>
      </section>
      <section class="panel stack" aria-labelledby="design-review">
        <div><p class="eyebrow">Co-design record</p>
          <h2 id="design-review" class="section-heading">Record the next decision</h2>
          <p>One working note follows the case across stakeholder views. Use a fictional observation for this demo.</p></div>
        <label class="field">Workshop observation and reason for the revision
          <textarea data-field="designFeedback" rows="3" maxlength="1800" placeholder="Example: The shift lead needs to confirm the access window before a visit can be booked.">${safeText(view.feedback)}</textarea></label>
        <label class="field">Decision
          <select data-field="designDecision">${options(decisions, view.decision)}</select></label>
        <p class="callout"><strong>Next action</strong> ${decision.next}</p>
      </section>
    </div>`;
  }

  function brief(state) {
    const view = read(state);
    const lens = lenses[view.lens];
    const revision = revisions[view.revision];
    const decision = decisions[view.decision];
    return [
      'Service design | illustrative case',
      `Stakeholder: ${lens.name}`,
      `Discovery question: ${lens.question}`,
      `Hypothesis: ${lens.need}`,
      `Service requirement: ${lens.requirement}`,
      `Acceptance check: ${lens.evidence}`,
      `Evidence to request: ${lens.artefact}. Owners: ${lens.owner}.`,
      `Scope revision: ${revision.name}. ${revision.change}`,
      `Trigger: ${revision.trigger}`,
      `Customer: ${revision.client}`,
      `Customer-facing work: ${revision.front}`,
      `Behind the scenes: ${revision.back}`,
      `Delivery evidence: ${revision.proof}`,
      `Working note: ${view.feedback.trim() || 'No observation recorded.'}`,
      `Decision: ${decision.name}. ${decision.next}`
    ].join('\n');
  }

  window.ServiceDesign = Object.freeze({ defaults, render, brief });
})();
