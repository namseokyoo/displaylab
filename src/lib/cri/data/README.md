# CIE CRI test-sample dataset

`CIE_srf_cri.csv` is the CIE dataset "Spectral radiance factors of 14 test
samples for the CIE colour rendering index calculation."

- Creator: International Commission on Illumination (CIE)
- DOI: <https://doi.org/10.25039/CIE.DS.wuiuu9cz>
- Source: <https://cie.co.at/datatable/spectral-radiance-factors-14-test-samples-cie-colour-rendering-index-calculation>
- License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Upstream SHA-256: `f461decedb5c18800c61a6923240c71f6cf91fd23ac94865133cbfdb7e05c0ad`
- Repository SHA-256: `83c4bbb7bf774b90fb671820fa22342a174e0abe5e26a281872b7c792d5179ec`

Modification: line endings were normalized from CRLF to LF. Numerical values
and row order are unchanged.

`oracle-spds.json` is a test-only fixture generated from the pinned
`colour-science==0.4.7` illuminant datasets by the validation workflow.

## CRI domain holdouts

`cri-domain-holdouts.json` is a validation-only fixture generated with
`colour-science==0.4.7`; it is not imported by the runtime bundle. It contains
31 named reference, fluorescent, high-intensity-discharge, and LED spectral
distributions plus independent CIE 1995 Ra and R1-R14 results. Regenerate it
with:

```sh
uv run --with colour-science==0.4.7 \
  python scripts/reference-light-quality-oracle.py --cri-domain \
  > src/lib/cri/data/cri-domain-holdouts.json
```

SHA-256:
`811f68bf169f90698dd31be227824a775de5da9b171045208226d174ee843361`.
The oracle project is BSD-3-Clause licensed; source and dataset provenance are
pinned to Colour v0.4.7 at
<https://github.com/colour-science/colour/tree/v0.4.7> and its
<https://github.com/colour-science/colour/blob/v0.4.7/LICENSE>.

The current fixture is retained as historical validation evidence. Its source
objects carried Sprague interpolation metadata that is not represented in the
serialized JSON values. A future regeneration must score a reconstructed copy
of the committed values with an explicit `linear` interpolation contract and
record the integration grid, observer, and CCT method. Runtime individual Ri
values remain withheld until that reproducibility gap is closed.
