# The Aston role and the route to a working demo

The associate leads an 18-month programme to help an engineering manufacturer earn revenue from services over the life of its equipment. That means finding an operating problem a customer will pay to solve, designing the service with the people who will deliver it, testing the offer and leaving a team able to run it. A model can show how a proposed deal works. Customer adoption and delivery performance need field evidence.

## Which vacancy?

The Totaljobs advert and the original detailed Aston job pack both carry reference **1155-26**. The advert was released on **16 October 2026**, closed on **6 November 2026** and scheduled interviews for **4 December 2026**. It describes a full-time, on-site Birmingham appointment for **18 months** at **£35,000–£37,000** per year. The role also offers up to **£4,000** for development and involves occasional UK customer visits. [Totaljobs vacancy 1155-26](https://www.totaljobs.com/job/servitization-and-service-innovation-lead-ktp-associate/aston-university-job108197370)

Aston has a separate public record under **R260050**, with a closing date of **12 November 2026**. The shared title and duties make it a useful public reference for the role. The 6 November deadline above belongs to the linked Totaljobs advert. [Aston vacancy status](https://jobs.aston.ac.uk/Vacancy.aspx?ref=R260050) · [R260050 role text](https://unijobs.ac/jobs/servitization-and-service-innovation-lead-ktp-associate-2)

The public Aston vacancy describes a Birmingham material-handling manufacturer. Historical listings indexed under Alwayse Engineering carry the same title and duties. Its published glass-handling work provides the application context. UKRI separately records the Aston–Alwayse KTP under grant **10146336**, funded from October 2025 to September 2027. The register does not tie a recruitment reference to that grant. [Historical employer listing on Indeed, now expired](https://uk.indeed.com/cmp/Alwayse-Engineering-Ltd?campaignid=mobvjcmp&fromjk=162def5c49f54a1b) · [UKRI project](https://gtr.ukri.org/projects?ref=10146336) · [Alwayse glass case](https://www.alwayse.com/success-stories/high-tech-solution-for-handling-glass/) · [Company research](company.md)

## Candidate criteria

| Area | What the recruiting team asks for |
| --- | --- |
| Qualification | At least a UK 2:1 BSc in engineering, management or a related discipline. Relevant postgraduate study or equivalent experience is desirable, including engineering management, service design, operations, innovation or marketing. |
| Essential capabilities | Analyse ambiguous problems, adapt theory and tools for commercial use, work across technical and commercial functions, and connect innovation to business value. Communicate with stakeholders at different levels, coordinate complex projects, work independently and in teams, and adapt to interdisciplinary work. |
| Desirable experience | Manufacturing or industrial practice, servitization, product–service systems or business-model innovation, and customer research, data analysis or commercially informed strategy. |

The prototype makes analytical choices and trade-offs inspectable. Evidence of qualifications, industrial experience and actual stakeholder leadership belongs in the candidate's application and interview examples. [Public candidate specification](https://unijobs.ac/jobs/servitization-and-service-innovation-lead-ktp-associate-2)

## Where the responsibilities appear

| Responsibility | Inspect in version 1.0 | What the real project would need to show |
| --- | --- | --- |
| Design a product–service system | Starting from existing maintenance and support, **Service design** translates a need into a service requirement, visit sequence, evidence of delivery and a feedback route into engineering. Change the access window, chargeable-work approval or fault hand-off to see which actions change. | Customer and service staff execute a representative case. Engineering verifies the installed-asset boundary and trials any proposed product or documentation change. |
| Develop the servitization strategy | **Economics** compares purchase, supplier-owned subscription and a performance-adjusted contract. **Pilot & handover** identifies required capabilities, service processes and decisions across an 18-month transition, including who gains value and who earns revenue. | Management selects a target segment and offer after examining customer value, coverage, resources, cash exposure and delivery risk. A named owner monitors the decision. |
| Develop the commercial offer and take it to market | **Economics** calculates customer cost, supplier contribution, viable fee bounds, credits and downside. The [launch pack](launch-pack.md) provides marketing and technical materials for packaging and communicating the offer. **Pilot & handover** supplies a buyer invitation and commercial release check. The [market review](market.md) identifies alternatives for buyer interviews. | A budget holder responds to a priced scope. Sales agrees a route via the manufacturer or integrator, service staff confirm capacity and finance approves terms. Track paid trials, delivery cost and renewal decisions. |
| Engage customers and stakeholders | **Service design** exposes maintenance, purchasing and integrator perspectives. Reviewers can record a workshop observation, revise the scope and choose a next action. The [field guide](field-guide.md) includes interviews and a facilitated workshop. | Operators, buyers and service partners review the same incident, reconcile disagreement and confirm whether the revised requirement addresses it. |
| Transfer knowledge and embed the process | **Pilot & handover** includes a station handover card, named responsibilities and a teach-back exercise. **Export brief** captures the working case for a colleague. | A colleague runs a second case independently, explains a downside and corrects an ambiguous record. Management assigns an internal process owner, training material and a review date. |
| Contribute to academic outputs | **Pilot & handover** and the field guide give a research question, baseline, denominator, comparison method, limits on interpretation and a route to a conference contribution or journal manuscript. | The university and company agree the evaluation and release arrangements. The team collects permissible evidence, addresses competing explanations, reports limits and prepares an output with its academic supervisors. |

Professional practice runs through the six activities. The field guide includes a personal development exercise, inclusive participation, site access and safety arrangements, fair handling of conflicting accounts, and measures for replacement materials and travel. Actual conduct, completed training, environmental effects and authorship require evidence outside the demo. [Field guide](field-guide.md)

## Design and implementation route

| Step | Technical choice and resulting artefact |
| --- | --- |
| 1. Ground the case | Review the advert, company capabilities, real applications, existing service plans and competing offers. Select one fictional UK glass-transfer cell and make its service boundary explicit. Label public evidence and invented inputs separately. [Company](company.md) · [Market](market.md) |
| 2. Turn discovery into a service specification | Represent perspective, evidence request, scope revision and decision as explicit choices. Separate customer action, visible service work and internal work in the blueprint. Changing a choice updates the specification and exported brief. This applies Bitner, Ostrom and Morgan's blueprinting method. [Service blueprinting](https://doi.org/10.2307/41166446) |
| 3. Build the commercial comparison | Use a deterministic JavaScript model to compare who owns the asset, who pays for maintenance and who carries downtime risk. Keep assumptions editable and expose the formulas and break-even conditions. Tukker's product–service typology informs the offer choices. Each contract and price in the demo is an original scenario. [Product–service systems](https://doi.org/10.1002/bse.414) · [Model](../site/model.js) |
| 4. Connect the numbers to a pilot | Capture the reviewer's judgement separately from the model suggestion. Pair the case with an evidence owner, next review, field protocol and teach-back. Export a brief containing scope and assumptions so another reviewer can challenge the proposal. [Field guide](field-guide.md) |
| 5. Verify the software | Test fee caps, credits, residual ownership, invalid inputs and outcomes where neither offer works. Check navigation, editing and export on narrow and wide screens. Check that the brief reproduces the same assumptions and decision as the interface. [Model tests](../tests/model.test.cjs) |
| 6. Publish and hand over | Serve the HTML, CSS and JavaScript from GitHub Pages. A reviewer can inspect the source or use the same model in a mobile browser. Keeping the calculation client-side removes the need for a server, API key or paid model call. The source and version tag let a reviewer reproduce the release. |

## What happens after version 1.0?

**The 18 months are a proposed delivery timetable.** Months 1–3 establish the baseline and permissions. Months 4–6 co-design one offer. Months 7–9 test delivery capacity and willingness to pay. Months 10–12 trial the service. Months 13–15 review outcomes and a priced continuation. Months 16–18 transfer ownership and prepare an evidence-based research output. The company and university would agree the actual schedule. [Stage owners and decision criteria](field-guide.md)

**The three years are a commercial comparison period.** The model applies constant, undiscounted assumptions to three years of ownership or service. The figures include an end-of-term residual and omit financing, corporate overheads and tax. A real offer would replace scenario inputs with authorised records, account for cash timing and verify attribution of downtime at the covered cell. A simulation cannot establish willingness to pay, causal effects, publishable findings or the viability of a guarantee.
