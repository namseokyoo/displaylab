# Light-quality accuracy closure

Date: 2026-07-12

## Product disposition

| Metric | Reference | Product disposition | Verdict |
| --- | --- | --- | --- |
| General CRI Ra | CIE 13.3-1995 | Ra-only experimental estimate | PARTIAL |
| TM-30 | ANSI/IES TM-30-24 | Numeric UI and public API removed | DISABLED |
| TLCI | EBU Tech 3355 | Numeric UI and public API removed | DISABLED |

Display Lab exposes only general CRI Ra. It does not expose individual R1-R14,
TM-30 Rf/Rg, or TLCI Qa values. No output is a standards-compliance result or
appropriate for procurement, compliance, broadcast, or safety decisions.

## CRI evidence and narrowing

The runtime uses the official CIE 14-test-sample dataset, although the exposed
Ra calculation uses only R1-R8. The source dataset DOI is
`10.25039/CIE.DS.wuiuu9cz`; its normalized repository SHA-256 is
`83c4bbb7bf774b90fb671820fa22342a174e0abe5e26a281872b7c792d5179ec`.

All 31 declared reference, fluorescent, HID, and LED holdouts pass the Ra
tolerance of +/- 1.0. The prior individual-index audit reported six misses.
Further review found that most were caused by hidden Sprague interpolation
metadata in the source objects: the committed JSON values alone do not
reproduce the expected values. The remaining HP1 difference is associated with
McCamy CCT versus a nearest-Planckian-locus result. Individual Ri values are
therefore withheld rather than tuned to an irreproducible fixture.

Before individual Ri can return, regenerate the fixture from its serialized
values with explicit interpolation, integration-grid, observer, and CCT-method
metadata; implement and validate a CRI-specific nearest-locus CCT method; and
pass independent review. Direct comparison with CIE D008 remains an external
acquisition and legacy-runtime risk.

## Disabled metrics

The removed TM-30 implementation used synthetic samples, the wrong color
model, and non-standard binning. Re-enabling it requires the exact TM-30-24
method and 99 CES data under documented reuse rights, official-oracle fixtures,
declared tolerances, and independent review.

The removed TLCI implementation did not implement the EBU camera/display
pipeline or Qa formula. Re-enabling it requires documented rights for the
method data, exact camera/sample assets, official-software fixtures, declared
tolerances, and independent review.

The closure audit covered the visible dashboard and results, public library
exports, translations and claims, tests, and persisted/share/API surfaces. No
light-quality values were found in persisted or shared state, and the spectrum
page SEO copy does not claim these metrics.

## Promotion gate

A disabled or narrowed metric may expand only after all of these pass:

1. Exact-edition authoritative sources and data are acquired with documented reuse rights.
2. The complete reference method is implemented without relabeling an approximation.
3. Golden fixtures cover reference, fluorescent, HID, LED, boundary, and invalid inputs.
4. Results pass predeclared tolerances against an independent authoritative oracle.
5. A reviewer independent from the implementation approves source, numeric, API, and UI evidence.

## Sources

- CIE D008: <https://www.cie.co.at/publications/computer-program-calculate-cris-publ-133-1995>
- CIE 13.3: <https://cie.co.at/publications/method-measuring-and-specifying-colour-rendering-properties-light-sources>
- CIE test-sample dataset: <https://cie.co.at/datatable/spectral-radiance-factors-14-test-samples-cie-colour-rendering-index-calculation>
- ANSI/IES TM-30-24: <https://store.ies.org/product/technical-memorandum-ies-method-for-evaluating-light-source-color-rendition/>
- IES spectral calculator: <https://elearning.ies.org/products/using-the-ies-spectral-calculator-for-tm-30-and-more>
- EBU TLCI software: <https://tech.ebu.ch/publications/software/TLCI-2012>
- EBU Tech 3355: <https://tech.ebu.ch/docs/tech/tech3355.pdf>
- Colour v0.4.7 validation implementation: <https://github.com/colour-science/colour/tree/v0.4.7>
