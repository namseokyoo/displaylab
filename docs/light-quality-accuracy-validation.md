# Light-quality accuracy validation

Date: 2026-07-12

## Verdict

The CRI, TM-30-style, and TLCI-style calculators are experimental. None may be
claimed as a standards-compliant score yet. The product keeps the exploratory
calculations visible, but removes procurement, broadcast, and qualitative
decision guidance until the corresponding validation gate passes.

## Structural conformance

| Metric | Reference | Current blocker | Verdict |
| --- | --- | --- | --- |
| CRI | CIE 13.3-1995 | Ra passes 31 domain holdouts; six individual Ri comparisons and direct CIE D008 comparison remain | PARTIAL |
| TM-30 | ANSI/IES TM-30-24 | Synthetic CES set and CIELAB instead of CAM02-UCS | FAIL |
| TLCI | EBU Tech 3355 | Approximate reflectances/camera response and non-EBU Qa pipeline | FAIL |

## Independent numerical oracle

Reference values were computed with `colour-science==0.4.7` using
`scripts/reference-light-quality-oracle.py`. This is validation tooling only
and is not a product dependency. The library's TM-30 oracle implements
TM-30-18, so its numbers are a useful discrepancy probe but cannot promote the
product against the current TM-30-24 standard. Promotion requires the official
TM-30-24 calculator or another independently verified TM-30-24 oracle.

Reproduce the oracle output with:

```sh
uv run --with colour-science==0.4.7 python scripts/reference-light-quality-oracle.py
```

| SPD | Metric | Oracle | Display Lab before gate | Absolute error |
| --- | --- | ---: | ---: | ---: |
| CIE FL2 | CRI Ra | 64.234 | 64.2 | 0.034 |
| CIE FL11 | CRI Ra | 82.859 | 82.8 | 0.059 |
| CIE FL2 | TM-30-18 Rf probe | 70.121 | 73.0 | 2.879 |
| CIE FL2 | TM-30-18 Rg probe | 86.416 | 81.0 | 5.416 |
| CIE FL11 | TM-30-18 Rf probe | 80.040 | 85.4 | 5.360 |
| CIE FL11 | TM-30-18 Rg probe | 101.057 | 102.5 | 1.443 |

Reference-source identity checks for Illuminant A and D65 return approximately
100 for all three local calculators. Those checks establish only internal
self-consistency; they do not establish standards conformance.

The prior embedded CRI sample table differed from the official CIE dataset by
as much as 0.505 reflectance units (R9 at 585 nm). It has been replaced by the
official `CIE_srf_cri.csv` dataset, DOI `10.25039/CIE.DS.wuiuu9cz`.
The upstream CRLF file SHA-256 is
`f461decedb5c18800c61a6923240c71f6cf91fd23ac94865133cbfdb7e05c0ad`;
the LF-normalized repository copy is
`83c4bbb7bf774b90fb671820fa22342a174e0abe5e26a281872b7c792d5179ec`,
licensed CC BY-SA 4.0. Golden SPD fixtures are committed in
`src/lib/cri/data/oracle-spds.json`.

## CRI domain holdout

The broader matrix contains 31 spectra: A; D50, D55, D65, and D75; FL1-FL12;
HP1-HP5; and LED-B1-B5, LED-BH1, LED-RGB1, LED-V1, and LED-V2. The exact input,
Ra, and R1-R14 values are pinned in `cri-domain-holdouts.json` with SHA-256
`811f68bf169f90698dd31be227824a775de5da9b171045208226d174ee843361`.

- Ra: 31 of 31 comparisons pass the predeclared +/- 1.0 tolerance.
- Individual indices: 428 of 434 comparisons pass +/- 1.0.
- Remaining misses: HP1 R3, R7, R8, R9, and R12 plus LED-RGB1 R9. The
  maximum absolute discrepancy is `2.265` points.
- Malformed, incomplete-range, duplicate-wavelength, negative-intensity,
  analysis-range-zero-energy, and overflowing spectra now fail closed instead
  of producing a CRI value.

The six individual-index misses prevent CRI promotion. A speculative
replacement of the CCT estimator was tested and rejected because it increased
the HP1 discrepancy; the production estimator was left unchanged. The next CRI remediation must
compare spectral interpolation/integration and CCT selection directly against
CIE D008 rather than tune constants to these fixtures.

## Promotion criteria

A metric can leave `experimental` only when all items below pass:

1. Authoritative sample and observer datasets replace generated approximations.
2. The complete reference method is implemented, including its required color
   space, adaptation, camera/display pipeline, and score formula.
3. Golden fixtures cover reference, fluorescent, and representative LED SPDs.
4. The result stays within +/- 1.0 score point of an independent oracle for all
   fixtures, with CCT and per-sample checks where the method exposes them.
5. A reviewer independent from the implementation approves the evidence.

## Sources

- CIE D008, computer program for CIE 13.3-1995 CRI calculations:
  <https://www.cie.co.at/publications/computer-program-calculate-cris-publ-133-1995>
- CIE open TCS dataset and metadata:
  <https://cie.co.at/datatable/spectral-radiance-factors-14-test-samples-cie-colour-rendering-index-calculation>
- Current ANSI/IES TM-30-24 publication and calculator package:
  <https://store.ies.org/product/technical-memorandum-ies-method-for-evaluating-light-source-color-rendition/>
- IES position describing the TM-30 calculation structure:
  <https://ies.org/advocacy/ps-11-18/>
- EBU Tech 3355, TLCI-2012 method:
  <https://tech.ebu.ch/docs/tech/tech3355.pdf>
- Colour, pinned independent numerical implementation:
  <https://github.com/colour-science/colour/tree/v0.4.7>
