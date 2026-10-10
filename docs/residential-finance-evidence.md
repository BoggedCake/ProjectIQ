# Residential development finance and contributions — 10 October 2026

## Public evidence

Checked 10 October 2026:

- [CrowdProperty development construction finance](https://www.crowdproperty.com.au/developers/development-finance): advertised rates **from 8.50%**, establishment fees **from 1.65% including GST**, maximum advertised term **24 months**, staged draws aligned with milestones, and capitalised interest options. These are public minimum/product terms, not an offer to this project. The engine's **9.5% annual rate** is a dated illustrative development-finance assumption; it is not a published market average, mortgage rate or lender quote. Its **$20,000 establishment fee** is a separate illustrative equity-funded allowance, not a conversion of the advertised percentage.
- [Northern Beaches council contributions index](https://www.northernbeaches.nsw.gov.au/planning-and-development/building-and-renovations/development-contributions) identifies the 2024 section 7.12 plan, commencing 19 October 2024 and replacing 2022. The general plan excludes Warriewood Valley Release Area, Frenchs Forest Town Centre and Dee Why Town Centre, which have separate plans.
- [Northern Beaches Section 7.12 Contributions Plan 2024](https://www.northernbeaches.nsw.gov.au/media/65178), table 1 / sections 2.4–2.8 and 4.4: whole eligible development cost attracts nil through $100,000, 0.5% above $100,000 through $200,000, and 1% above $200,000. The statutory cost basis follows regulation section 208, rather than automatically using engine delivery cost. Exemptions and parcel applicability need evidence. Section 7.11 and section 7.12 cannot both be imposed on the same consent. Indexation must be checked at assessment/payment.

No licensed pricing, paid data, loan application, settings or production deployment is involved.

## Engine contract

`financeSchedule(input)` returns `status:'indicative'`, monthly `rows`, finance interest and cost, land debt/equity, construction borrowing/equity, settlement repayment, peak debt, assumptions and sensitivities. Negative land equity is permitted when existing debt exceeds current value; this is arithmetic, not a lender offer. Invalid input returns `status:'review'` with a reason and no numeric output.

Inputs:

| Input | Default / basis |
| --- | --- |
| `land`, `delivery` | Nonnegative project values; land is opportunity value |
| `landDebt` | Explicit outstanding debt; default zero, never inferred 70% of property value |
| `landDebtRatio` | Optional explicit alternative when `landDebt` is absent |
| `constructionBorrowingRatio` | 0.70 illustrative funding assumption |
| `preconstructionMonths`, `constructionMonths`, `settlementMonths`, `delayMonths` | 3, 12, 3, 0; whole months |
| `drawWeights` | Equal monthly construction milestones; custom nonnegative weights normalised to one |
| `interestRate` | 0.095 annual illustrative development finance assumption dated 2026-10-10 |
| `capitaliseInterest` | true; false pays monthly interest from equity |
| `financeEstablishment` | $20,000 equity-funded fee; separate from borrowed principal |

Opening land debt accrues through preconstruction, construction, any delay and settlement. Construction draws occur only in build months. Each month charges annual rate / 12 on opening balance plus half that month's draw (disclosed mid-month convention). Capitalised interest increases later balances; cash-paid interest does not. Debt is repaid at the end of the final month. Borrowed principal is funding of existing project costs, never a second expense. Establishment fees are a separate expense, not interest-bearing principal. Retained land equity is opening opportunity value and is shown separately from monthly equity contributions.

All delivery components use the disclosed build draw curve. Contributions, demolition and other ancillary cost extras are equity funded in feasibility. This is a scenario approximation; a lender/QS cash-flow schedule can supply milestone weights. This does not model lender leverage tests, covenants, refinance costs, a facility limit, presale conditions or actual draw inspection fees.

Sensitivity outputs use the same monthly method at annual rate ±2 percentage points (bounded to 0–100%) and settlement delay +3/+6 months. Durations exceeding the cited lender's 24-month advertised term produce a visible extension/refinance warning; sensitivities are scenarios, not available loan terms.

`assessContributions(input)` is reusable and returns an amount or **null**, never an implicit zero:

| Status | Required evidence / result |
| --- | --- |
| `unknown` / absent | null amount; readiness withheld |
| `verified-exemption` | source and parcel-specific reason; zero amount |
| `verified-plan` | `planApplicable:true`, source, method `s7.11` or `s7.12`, valid amount/calculation |
| `user-allowance` | explicit nonnegative amount; labelled unverified, not decision ready |
| `provisional` | explicit nonnegative amount; labelled provisional, not decision ready |

For the built-in Northern Beaches plan, use `planId:'northern-beaches-s7.12-2024'`, `method:'s7.12'`, explicit `planApplicable:true`, source and `approvedDevelopmentCost` (confirmed statutory basis). The engine applies table 1 thresholds. Other section 7.12 plans accept an explicit rate and approved cost, or assessed amount. Section 7.11 requires a project-specific amount; no generic per-dwelling amount is fabricated. Optional positive `indexationFactor` applies once. `section711Applies:true` with s7.12, or simultaneous s7.11/s7.12 methods, yields unknown.

`feasibility(input)` requires `eligibility.readyForFeasibility === true` or **explicit** `exploratory === true`; otherwise it returns review without GRV, profit, total or residual. Unknown contributions also withhold financial totals. Explicit user/provisional contributions permit labelled estimates with `decisionReady:false`. Explicit exploratory scenarios return `status:'exploratory'`, `decisionReady:false` even if contributions are verified. An existing own `extras.authorityContributions` field is accepted as a clearly labelled user allowance; absent extras do not become zero. Structured contributions take precedence over extras and are added exactly once.

Existing cost, duty and move-comparison modules are preserved. Feasibility retains the prior aliases, adds `financeSchedule`, `contributions`, `decisionReady`, and sensitivity total/profit outputs. Legacy `holdingMonths` is an explicit total translated to settlement months after preconstruction/build/delay; impossible phase totals are rejected. Residual value uses the same monthly finance function and target profit-on-cost: explicit debt stays fixed, while an explicit land debt ratio scales with residual land value.

## Verification

`node qa/residential-finance-regression.cjs` checks phase draws, mid-month interest, settlement principal reconciliation, cash/capitalised interest, zero borrowing, rate/delay sensitivities, invalid finance inputs, custom weight validation, contribution thresholds and alternative plans, unknown/exemption evidence, readiness gates, single contribution counting, full total reconciliation and residual target consistency. The test was first run before implementation and failed because the new finance API did not exist; it passes with the monthly implementation.
