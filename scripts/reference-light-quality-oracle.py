#!/usr/bin/env python3
"""Print pinned independent CRI and TM-30-18 reference values as JSON."""

from __future__ import annotations

import json

import colour
from colour.quality import colour_fidelity_index_ANSIIESTM3018


def main() -> None:
    results: list[dict[str, float | str]] = []
    for name in ("A", "D65", "FL2", "FL11"):
        spectrum = colour.SDS_ILLUMINANTS[name]
        tm30 = colour_fidelity_index_ANSIIESTM3018(spectrum, additional_data=True)
        results.append(
            {
                "illuminant": name,
                "cri_cie_1995_ra": float(colour.colour_rendering_index(spectrum)),
                "tm30_18_rf": float(tm30.R_f),
                "tm30_18_rg": float(tm30.R_g),
            }
        )
    print(json.dumps({"colour_science": colour.__version__, "results": results}, indent=2))


if __name__ == "__main__":
    main()
