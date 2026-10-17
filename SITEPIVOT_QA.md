# SitePivot concept prototype QA

Branch: `sitepivot-concept`  
Date: 6 October 2026

## Scope completed

- SitePivot rebrand and consumer proposition
- Property identity confirmation and exact-address regression handling
- Property Passport with confidence states
- Five primary homeowner directions
- Four development intentions
- Guided “I’m not sure” path
- Scope-driven cost engine
- Independent current and completed market-evidence engines
- Comparable similarity scoring
- Current-listing context separated from sold evidence
- Stay / improve / move comparison
- Development feasibility with site opportunity cost, finance, selling, legal and tax/GST sensitivity
- Risk prioritisation and lowest-regret consultant sequencing
- Assessment summary, local test save, JSON export and print/PDF path
- Statewide planning source registry and local-control review states
- Regional/metro/rural/remote NSW fixture coverage

## Internal QA result

48 automated prototype assertions passed, 0 failed.

The browser flow was also exercised through property selection → passport → direction → scope → assessment → roadmap → report. All four development direction cards were exercised. Mobile rendering was checked at a 390 × 844 viewport.

### Important regression assertions

- 1 Waratah Street and 9 Waratah Street do not cross-match
- missing FSR remains unknown
- project cost never creates completed property value
- generic/unverified addresses do not receive invented planning or market facts
- weak completed-product evidence returns Needs Review
- split zoning, flood and bushfire triggers surface as risks
- positive and negative feasibility states are both supported
- site opportunity cost, finance, selling and tax/GST sensitivity remain visible in development feasibility
- sold evidence and current-listing context remain separate

## Deliberate prototype limitations

The static browser build does not yet make production calls to NSW planning services, cadastral/address services, council DCP documents, sold-property providers or the connected realestate.com.au plugin. Those inputs are represented through explicit adapters / fixtures and confidence states.

No fixture data is labelled as live verified property data.

## Founder test focus

1. Is the first 2–5 minutes understandable without explanation?
2. Does the Property Passport make uncertainty obvious without feeling unhelpful?
3. Are the five directions intuitive?
4. Does the assessment answer “what can I do, what might it cost, what could it create, what could stop me, what do I do next?”
5. Do negative feasibility and weak-evidence outcomes still feel useful?
6. Is the consultant handoff specific enough to act on?
