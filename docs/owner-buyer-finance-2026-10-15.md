# Owner and buyer development finance — 15 October 2026

The existing `feasibility()` and monthly `financeSchedule()` now share an explicit ownership branch. No separate development engine, planning eligibility rule, construction tariff, lift or pool calculation was introduced.

## Input contract

All amounts are AUD, rates are annual decimals, durations are whole months. Existing feasibility inputs, contribution evidence and planning gates still apply.

```js
Commercial.feasibility({
  // Existing cost, products, eligibility, contributions, timing and finance inputs.
  ownershipRole: 'buyer', // 'owner' retains an already held site
  acquisition: {
    purchasePrice: 3500000,
    deposit: 350000,
    cashContribution: 1050000, // purchase equity INCLUDING deposit, excluding fees
    loanAmount: 2450000,      // user scenario; not lender approval
    stampDuty: 180000,        // explicit illustrative allowance, not a duty calculation
    legal: 4000,             // acquisition legal only
    dueDiligence: 3000,
    otherCosts: 2000,
    annualRate: 0.08,
    settlementMonths: 2      // contract to land settlement, before project phases
  }
});
```

Buyer acquisition requires every field, including explicit zero amounts. Missing, empty, nonnumeric, boolean or negative fields return `review` even in provisional mode. Deposit cannot exceed price or purchase cash. Purchase cash plus acquisition loan must equal price within one cent. `financeMode: 'cash'` means cash-funded construction works: it sets construction borrowing and its establishment allowance to zero while preserving separately specified acquisition borrowing and interest. Fully cash funding of land as well requires explicit zero acquisition debt. Acquisition lender fees, if applicable, belong in the acquisition `otherCosts` allowance. There is no inferred acquisition loan, free land equity, automatic duty calculation or assumed credit approval. Purchase price takes precedence over the separate retained-site `land` input for buyers; `landDebt`/`landDebtRatio` describe owners and do not override the buyer acquisition loan. Acquisition and sale/development `legal` allowances are distinct scopes.

No ownership role preserves legacy owner arithmetic and existing cash requirement and monthly equity fields. New output fields are additive. Explicit `ownershipRole: 'owner'` keeps land as opportunity cost, not a cash purchase. Its existing debt must still be supplied or explicitly handled by the pre-existing provisional debt rules.

## Accounting and timing

* Owner: site value enters economic development cost once. New project cash excludes the existing land opportunity value; existing debt is repaid from final proceeds.
* Buyer: site purchase price enters economic cost and gross cash expenditure once. Deposit is part of that price and part of purchase cash; it is not another cost. Acquisition fees are added once. Principal repayment is funding settlement, never another economic expense.
* The monthly model prepends acquisition months. Deposit cash is recorded in the first acquisition month. Remaining purchase cash and all acquisition fees are recorded at land settlement; the acquisition loan draws then. Interest begins in the following project month. Zero acquisition months puts the purchase at the opening of the first project month.
* Existing preconstruction, construction, delay and final project-sale settlement durations follow land settlement. Acquisition debt accrues for all these project months at its separate annual rate. Construction draws retain their normalized milestone weights and mid-month interest convention. Capitalized interest increases the applicable debt balance; cash-paid interest enters cash equity. Rate sensitivities shift both acquisition and construction rates equally, bounded to 0–100%.
* To show a conservative pre-sale peak, all nonconstruction project allowances (including sale costs and tax sensitivity) are funded from equity in the first project month. No presale receipts, fee financing, acquisition refinance, principal amortization or available credit approval are assumed. Refundable bond increases peak cash but is excluded from economic cost and return denominator.

## Output contract

| Field | Meaning |
| --- | --- |
| `ownershipRole`, `acquisition` | Selected branch and normalized auditable acquisition fields; owner acquisition is null |
| `total`, `economicTotal`, `profit` | Economic total including site once; `profit = grv - total` |
| `cashProjectCost`, `incrementalCashCost` | Gross project expenditure excluding owner opportunity land, including buyer purchase; expenditure before funding, not required equity |
| `cashRequirement` | Explicit owner/buyer: peak equity cash requirement; missing-role legacy definition is preserved |
| `landOpportunityCost` | Owner site value; buyer zero |
| `costReconciliation` | Sums exactly to economic total; buyer has `landPurchase` and `acquisitionCosts`, without separate deposit/principal costs |
| `financeSchedule.landEquity` | Owner site less outstanding debt; buyer purchase price less acquisition loan, never the entire price when financed |
| `financeSchedule.acquisitionBorrowing`, `acquisitionInterest` | Acquisition principal and its cumulative interest, included within aggregate finance |
| `financeSchedule.rows` | Acquisition/project draws, equity, interest, debt and final repayment; explicit roles include ancillary cash/bond in equity lines |
| `rows[].cumulativeCashRequired` | Cumulative pre-sale equity contributions; equals peak for explicit roles |
| `cashFunding.purchaseCash`, `depositCash`, `settlementCash` | Purchase equity including deposit; deposit subset; remaining purchase equity plus acquisition fees |
| `cashFunding.acquisitionCosts`, `constructionCash`, `ancillaryCash`, `cashInterest`, `establishmentCash` | Nonoverlapping equity funding components |
| `cashFunding.cashEquityRequired` | Sum of equity components, excluding refundable bond |
| `cashFunding.peakCashRequirement` | Equity required plus refundable bond; conservative pre-sale peak |
| `cashFunding.netSaleProceeds` | GRV less final outstanding debt; project sale costs already funded in ancillary cash |
| `cashFunding.returnOnCashEquity` | `(netSaleProceeds - cashEquityRequired) / cashEquityRequired`, null when denominator zero |
| `cashFunding.returnOnTotalEquity` | Economic profit / (owner existing site equity plus new cash equity); buyer economic profit / new cash equity |

Owner cash return includes realization of previously held land. It is not directly comparable with the buyer's development return without considering retained land equity; economic profit and return on total equity make that distinction explicit. Buyer residual land value is withheld (`null`), because a different price requires repricing acquisition charges and funding. Scenario contributions and tax sensitivity remain unverified as before; no output grants planning consent, credit approval, or independent valuation.

## Same $3.5m site comparison

Synthetic arithmetic fixture: $3.5m site, $2m delivery, two completed products at $4m each, 12 construction months, no other project durations/costs, 50% construction borrowing at 10%, cash-paid interest, zero establishment. Buyer additionally uses the acquisition object above and two acquisition lead-in months. Duty is an illustrative allowance. This is not a property recommendation or transaction estimate.

| Result | Already held, debt-free owner | Buyer |
| --- | ---: | ---: |
| Site economic cost | $3,500,000 | $3,500,000 |
| Purchase cash including deposit | $0 | $1,050,000 |
| Deposit subset | $0 | $350,000 |
| Acquisition fees | $0 | $189,000 |
| Acquisition loan | $0 | $2,450,000 |
| Construction loan | $1,000,000 | $1,000,000 |
| Acquisition interest | $0 | $196,000 |
| Construction interest | $50,000 | $50,000 |
| Economic total | $5,550,000 | $5,935,000 |
| Economic profit | $2,450,000 | $2,065,000 |
| Conservative peak new cash | $1,050,000 | $2,485,000 |
| Final debt repayment | $1,000,000 | $3,450,000 |
| Net sale proceeds after debt | $7,000,000 | $4,550,000 |
| Return on cash equity | 566.67% including land realization | 83.10% |
| Return on total equity | 53.85% | 83.10% |

The buyer has $1.05m acquisition equity, not $3.5m existing land equity. Changing deposit within the same total purchase cash changes timing only. Capitalizing interest increases final repayment and economic interest, while reducing the pre-sale equity cash requirement. All-cash buyer funding requires the full purchase plus fees and project cash. Cash-funded works with the same $2.45m acquisition loan retain $196,000 acquisition interest and $2.45m final principal repayment, with no construction debt or construction establishment fee; conservative peak cash is $3,435,000.

## Verification

`qa/ownership-finance.cjs` was written first and observed failing because the explicit buyer branch did not exist. It now covers the comparison above, missing/invalid acquisition, deposit/cash validation, planning gate preservation, cash-paid and capitalized debt, all-cash buyer, scenario ledger reconciliation, and missing-role compatibility. Focused existing commercial, premium, residential mortgage, conditional duplex and cost regressions passed.

Full `npm test` reached `ASYNC_SUITE_COMPLETED` after the unit suites, then failed in `qa/journey.cjs` at Playwright launch because the configured Chromium headless executable is absent. A subsequent full unit rerun during concurrent UI work stopped in `qa/p0-address-regression.cjs` with `undefined.resolveLiveIdentity`; this requires final integrated rerun after UI edits stabilize. No engine assertion failed in the focused verification.


Additional confirmed-debt owner regression: at $1.5m existing debt, the same $3.5m site/$2m construction scenario has $200,000 finance, $2.3m economic profit, $2m retained land equity and $1.2m new pre-sale cash required; no purchase cash or acquisition costs are added. The 10% owner/development and 8% buyer acquisition rates in this fixture are explicit test assumptions, not market-rate claims.
