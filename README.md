# Transfer Service Lab

An interactive service-design and commercial modelling workbench for a fictional glass-processing cell. Built by Rongsen Zhang as an independent application project for a Servitization and Service Innovation Lead KTP role.

**[Open the live workbench](https://rongsenzhang.github.io/transfer-service-lab/)** · [Role coverage and technical route](docs/role-and-roadmap.md) · [Company research](docs/company.md) · [Market comparison](docs/market.md)

## A three-minute review

1. Open **Service design**. Select **Procurement**, inspect the buyer's approval question and change the service scope to include approval for chargeable exceptions. Follow the change into the blueprint and add a fictional review note.
2. Open **Economics**. Compare the customer’s three-year cost with supplier revenue, cost and contribution. Set managed downtime to the purchase baseline. The flat subscription now costs the customer more than buying the equipment. Restore the example to see the original case.
3. In **Pilot & handover**, choose the offer you want to take forward, record which evidence you would need and enter a decision. Expand the field guide to inspect the trial, launch, training and evaluation plans.
4. Select **Export brief**. The downloaded text captures your current service design, assumptions, financial results, selected offer, readiness checks, decision and training status. Changes are stored locally in the current browser. Sharing the site link opens the recipient’s own workspace.

## Commercial example

The illustrative buyer can purchase one installed cell or pay for supplier-owned equipment and service. The performance contract adds a bounded bonus or credit based on the difference between baseline and managed cell-attributable downtime. The asset owner receives a single residual at the end of year three.

| Three-year outcome, GBP | Purchase | Subscription | Performance |
| --- | ---: | ---: | ---: |
| Customer economic cost | 24,300 | 20,325 | 19,725 |
| Supplier revenue | 12,000 | 16,200 | 15,600 |
| Supplier contribution before overhead and tax | 4,500 | 6,300 | 4,950 |

The default scenario assumes 12 hours of attributable downtime per year under purchase and five under managed service, valued at £275 per hour. All costs and outcomes are synthetic. A field study would need an agreed denominator for operating exposure, confirmed cost of lost production, and sign-off on attribution. The three-year economic horizon is separate from the proposed 18-month KTP delivery plan.

## Research and handover materials

- [Role requirements, technical route and responsibility mapping](docs/role-and-roadmap.md)
- [Company site review and customer applications](docs/company.md)
- [Direct equipment alternatives and a neighbouring service model](docs/market.md)
- [Commercial launch pack, buyer offer and technical handover sheet](docs/launch-pack.md)
- [Field research, implementation, training and publication plan](docs/field-guide.md)

The public glass case describes a real materials-handling application. The demo’s UK cell, stakeholder hypotheses, costs, contract terms, decision gates and results are original illustrations. An actual service promise would need customer validation, engineering acceptance and commercial approval. This project has no affiliation with Aston University, Alwayse Engineering or Dip-Tech.

## Run locally

Serve the repository root on any static web server. With Python 3:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. The app runs in a modern browser without installation, third-party scripts, a backend or an API key. Each case is saved in the browser's own local storage when available. The export can still be used when storage is unavailable.

## Verify and publish

Run the dependency-free test suite with Node.js 20 or later:

```sh
node --test tests/*.test.cjs
```

The HTML entry point loads plain JavaScript and CSS from relative paths. The independent commercial model in `site/model.js` powers the full comparison, overview chart, offer review and exported brief. `site/design.js` and `site/fieldwork.js` hold the discovery and delivery workflows. GitHub Pages serves the root of the `main` branch, with `.nojekyll` for static publishing. Hash routes can be bookmarked directly.

Version **1.0.0** · 23 November 2026.
