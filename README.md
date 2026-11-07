# TJU-ThermoHub

天津大学化工热力学学生自主学习网站。

This repository contains the independently rebuilt Nv3.1.0 project baseline (application version 13.1.0). The previous `JsPSCES-TJU` repository is kept separate and unchanged.

## Status

This is a working development baseline, not a claim that every planned module is complete. Only implemented and validated calculations are exposed as working tools; unsupported data ranges and unverified correlations must remain clearly marked.

## Modules

1. Interactive thermodynamic models and visualizations.
2. Equation-of-state and calculation tools.
3. Engineering charts and digitized reference data.
4. Water and steam properties, with IF97 regions implemented incrementally and validation required for each region.
5. Appendices: symbols and Chinese-English terminology.

## Live deployment constraints

- Static GitHub Pages site; no backend runtime in this phase.
- Supabase is reserved for a future phase and is disabled in the live site.
- No accounts, email OTP, login, or cloud-data runtime.

## Development

```bash
npm run check
npm run build:standalone
```

See `docs/` for the design, deployment, data dictionary, test report, and known limitations.
