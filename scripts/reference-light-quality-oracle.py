#!/usr/bin/env python3
"""Print pinned independent light-quality reference values as JSON."""

from __future__ import annotations

import argparse
import json

import colour
from colour.quality import colour_fidelity_index_ANSIIESTM3018

CRI_DOMAIN_ILLUMINANTS = (
    "A",
    "D50",
    "D55",
    "D65",
    "D75",
    "FL1",
    "FL2",
    "FL3",
    "FL4",
    "FL5",
    "FL6",
    "FL7",
    "FL8",
    "FL9",
    "FL10",
    "FL11",
    "FL12",
    "HP1",
    "HP2",
    "HP3",
    "HP4",
    "HP5",
    "LED-B1",
    "LED-B2",
    "LED-B3",
    "LED-B4",
    "LED-B5",
    "LED-BH1",
    "LED-RGB1",
    "LED-V1",
    "LED-V2",
)


def spectrum_points(name: str) -> list[dict[str, float]]:
    spectrum = colour.SDS_ILLUMINANTS[name].copy().align(
        colour.SpectralShape(380, 780, 5)
    )
    return [
        {"wavelength": float(wavelength), "intensity": float(value)}
        for wavelength, value in zip(spectrum.wavelengths, spectrum.values, strict=True)
    ]


def cri_result(name: str) -> dict[str, object]:
    spectrum = colour.SDS_ILLUMINANTS[name].copy().align(
        colour.SpectralShape(380, 780, 5)
    )
    specification = colour.colour_rendering_index(spectrum, additional_data=True)
    return {
        "name": name,
        "Ra": float(specification.Q_a),
        "Ri": [float(specification.Q_as[index].Q_a) for index in range(1, 15)],
        "spectrum": spectrum_points(name),
    }


def summary() -> dict[str, object]:
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
    return {"colour_science": colour.__version__, "results": results}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--cri-domain",
        action="store_true",
        help="emit the declared CRI domain holdout matrix with Ra, R1-R14, and SPDs",
    )
    args = parser.parse_args()

    payload = (
        {
            "colour_science": colour.__version__,
            "spectral_shape": {"start": 380, "end": 780, "interval": 5},
            "fixtures": [cri_result(name) for name in CRI_DOMAIN_ILLUMINANTS],
        }
        if args.cri_domain
        else summary()
    )
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
