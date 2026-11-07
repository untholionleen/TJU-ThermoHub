# Changelog

## 13.2.0 — engineering chart fidelity and IF97 five-region release

- Refined engineering plot rendering with a gradient plot field, major/minor grid divisions, clearer tick labels, rounded anti-aliased strokes and optional highlighted curves.
- Increased IF97 saturation dome sampling to 56 points with denser sampling near the critical point.
- Increased log p–h and T–s isobar sampling to 90 points per isobar.
- Extended the log p–h chart sampling to the full IF97 Region 5 temperature ceiling where pressure is within 50 MPa.
- Updated release notes and scope statements: five-region PT forward calculations are integrated; PH/PS/HS backward coverage is not claimed complete.
- Retained a visible roadmap for VLE, PRG, Lee–Kesler, air/refrigerant charts and D2–D11 textbook review.
- Reaffirmed P. J. Barrie source attribution; no wholesale source/database mirror is made without a redistribution license.


## 13.1.1 — IF97 five-region integration and chart refinement

- Added a licensed browser IF97 engine and attribution notices.
- Added forward PT property calculations for Regions 1–5, saturation properties, quality mixing, supported PH/PS/HS inverse modes, and explicit rejection of unsupported backward states.
- Added IF97 p-h and T-s diagrams from the equations, including saturation dome, quality lines and isobars.
- Improved chart axes, ticks, legends, pointer inspection, isometric projections and rotatable shaded P–V–T mesh.
- Added reference-state regressions for Regions 1, 2, 3 and 5, Region 4 saturation and inverse saturation, Region 3 saturation density, HS mixture-quality recovery and unsupported-range rejection.
- Updated the service-worker cache and standalone builder to include the vendor engine.
- VLE, PRG, Lee–Kesler generalized charts, air/refrigerant engineering charts and unreviewed D2–D11 remain explicitly pending.

## 13.1.0 / Nv3.1.0

- Established the independent static GitHub Pages application and modular source tree.
- Implemented cubic EOS foundation, IF97 Region 4 saturation, interpolation and D1 derivation.
