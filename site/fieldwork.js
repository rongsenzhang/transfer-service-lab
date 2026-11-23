(function () {
  'use strict';

  const decisions = ['Hold for evidence', 'Proceed to a scoped pilot', 'Revise the service offer', 'Close this concept'];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function decisionFor(state) {
    return decisions.includes(state.pilotDecision) ? state.pilotDecision : decisions[0];
  }

  const stages = [
    ['01–03', 'Discover', 'Associate + site lead', 'Review one recent interruption with an operator and maintainer. Agree a baseline, permissions and a second site or shift to test transferability.'],
    ['04–06', 'Co-design', 'Service lead + buyer', 'Map the handover from fault report to restored transfer. Both parties mark responsibilities, exceptions and a metric they can actually measure.'],
    ['07–09', 'Cost and prepare', 'Finance + engineering', 'Cost travel, spares and visit time. Test downside exposure, service coverage and escalation capacity before inviting a pilot.'],
    ['10–12', 'Trial', 'Customer sponsor + service lead', 'Run a time-boxed pilot with agreed stop criteria. Compare logged stoppage, response and cost against baseline, recording changes in workload.'],
    ['13–15', 'Review and launch', 'Commercial lead + customer', 'Reconcile costs, review measured outcomes and ask the budget holder to accept, revise or decline a priced offer.'],
    ['16–18', 'Transfer', 'Internal process owner + academic lead', 'Hand over the templates. A colleague runs a fresh case unaided. Record changes, a review date and permissions for any external report.']
  ];

  function render(state = {}) {
    const currentDecision = decisionFor(state);
    const options = decisions.map(decision => '<option' + (decision === currentDecision ? ' selected' : '') + '>' + decision + '</option>').join('');
    const rows = stages.map(([month, phase, owner, gate]) => '<tr><th scope="row">' + month + '</th><td>' + phase + '</td><td>' + owner + '</td><td>' + gate + '</td></tr>').join('');
    return `
      <section class="panel stack" aria-labelledby="pilot-record">
        <div><p class="eyebrow">Decision record</p><h2 class="section-heading" id="pilot-record">Would you take this to a pilot?</h2></div>
        <p>For an illustrative glass-handling line, the first question is whether unplanned transfer interruptions cost enough to justify a service agreement. Use the scenario figures to frame the conversation.</p>
        <label class="field" for="pilot-decision">Pilot decision
          <select id="pilot-decision" data-field="pilotDecision">${options}</select>
        </label>
        <label class="field" for="pilot-note">Evidence, owner and next review
          <textarea id="pilot-note" data-field="pilotNote" rows="3" maxlength="1000" placeholder="For example, the site lead will review a month of interruption logs before the pricing workshop.">${escapeHtml(state.pilotNote)}</textarea>
        </label>
        <p class="callout">Use fictional or anonymous notes. A decision here records your judgement within this demonstration.</p>
      </section>
      <section class="panel stack" aria-labelledby="pilot-playbook">
        <div><p class="eyebrow">Field guide</p><h2 class="section-heading" id="pilot-playbook">Run the pilot and hand it over</h2></div>
        <details><summary>Customer interviews and site visit</summary>
          <div class="stack"><p>Ask an operator, a maintainer and a buyer about the same recent transfer interruption. Start with one shift and repeat on a different shift or site to check whether the pattern recurs.</p>
          <ul><li><strong>Operator.</strong> What happened just before the interruption? How did the team detect it and resume work?</li>
          <li><strong>Maintainer.</strong> Where was time lost between reporting, diagnosis, spare availability and restoration? Which timestamps can we verify?</li>
          <li><strong>Buyer.</strong> Who carries the cost and who could approve a recurring fee? What evidence would justify a trial?</li></ul>
          <p>With site permission, review the event log and indicator definitions. Use an approved observation point and the site's induction process. Offer a written or remote contribution for staff who cannot attend.</p></div>
        </details>
        <details><summary>Co-design workshop and feedback</summary>
          <div class="stack"><p>In 45 minutes, map the interruption with operations and service staff (10 min), mark delays and assumptions (10 min), agree the proposed response and exclusions (15 min), then choose an owner and test (10 min).</p>
          <p><strong>Worked example · fictional.</strong> Operations reports that replacement lead time varies. Add a named spare-stock owner and a replenishment trigger to the service blueprint. Verify against three service events before offering a response commitment. Record disagreement and who will resolve it.</p>
          <p>Review the workflow with sales, stores and engineering. Feed part identification and service access needs into the next product design review.</p></div>
        </details>
        <details><summary>18-month delivery plan and decision gates</summary>
          <p>Illustrative work plan. Sequencing and owners would be agreed with the company and academic team.</p>
          <div class="table-wrap"><table><thead><tr><th scope="col">Month</th><th scope="col">Phase</th><th scope="col">Owner</th><th scope="col">Decision evidence</th></tr></thead><tbody>${rows}</tbody></table></div>
        </details>
        <details><summary>Commercial launch and technical handover</summary>
          <div class="stack"><p><strong>Buyer invitation.</strong> We propose a scoped trial on one transfer station. Together we will agree the baseline, review interruption records and compare annual service cost with current spending. Your team can decide whether to extend the agreement after seeing the results.</p>
          <p><strong>Technical handover card.</strong> Identify the station and installed units, inspection owner, reporting channel, event clock, spare-stock owner and escalation contact. Engineering approves substitutions and any return to operation under the customer's site procedures.</p>
          <p><strong>Commercial release check.</strong> Sales owns the offer sheet. Finance signs off the price floor and credits, and service operations confirms coverage. Record contract scope, access limits and who can authorise extra work.</p></div>
        </details>
        <details><summary>Staff training and ownership</summary>
          <div class="stack"><p>Use a fresh fictional case. Ask a colleague to identify a need, locate the evidence, price an offer, explain one downside and record a decision without help. Log one improvement and a review date, then assign the workbook and service blueprint to an internal owner.</p>
          <label for="teach-back"><input type="checkbox" id="teach-back" data-field="trainingComplete"${state.trainingComplete === true ? ' checked' : ''}> Record the teach-back exercise as completed for this demonstration</label></div>
        </details>
        <details><summary>Evaluation, publication and development</summary>
          <div class="stack"><p>Research question: which service activities change interruption hours per 1,000 operating hours, and how do operators and buyers explain the change? Compare baseline and trial logs alongside interviews. Record throughput, product mix and concurrent maintenance. A before-and-after comparison alone cannot establish causation.</p>
          <p>Track replacement units and service-visit distance alongside cost. Record the applicable permissions for interviews, data retention and anonymous reporting. Agree release with the company and university before preparing an internal report, conference case or journal manuscript.</p>
          <p>Agree a personal development plan with the academic supervisor. Follow a service-design workshop by facilitating a customer session, then review the result and next learning need with the business mentor.</p></div>
        </details>
      </section>`;
  }

  function brief(state = {}) {
    const note = String(state.pilotNote ?? '').trim() || 'No evidence or action recorded.';
    const completion = state.trainingComplete === true ? 'Marked complete in this demonstration' : 'Pending';
    return [
      'PILOT AND HANDOVER',
      'Decision: ' + decisionFor(state),
      'Evidence, owner and next review: ' + note,
      'Staff teach-back: ' + completion,
      'Proposed first field test: review a recent interruption with an operator, maintainer and buyer. Agree an operating-hours baseline and who owns each timestamp.',
      'Pilot gate: confirm service scope, coverage, cost downside, site approval and customer permissions before trial.',
      'Handover: an internal process owner runs a fresh case independently and records the next review.'
    ].join('\n');
  }

  window.Fieldwork = { render, brief };
})();
