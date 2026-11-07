# TJU-ThermoHub

天津大学化工热力学学生自主学习网站（独立重构开发基线）。

## Repository layout
- `source/runtime/part-*.b64`: transport shards of the XZ-compressed runtime source archive. The workflow restores them before testing/building.
- `.github/workflows/pages.yml`: CI gates and Pages deployment.
- `README.md`: project entry and current deployment notes.

The complete downloadable delivery bundle includes design/deployment documents and legacy reference files. This repository stores the deployable runtime source and CI transport bundle.

## Build and test
After restoring the source archive, run:
- `npm run check`
- `npm run build:standalone`

## Deployment
Pushes to `main` run syntax and numerical tests, build the standalone artifact, assemble a static Pages directory, and deploy it.

## Current scope
Static GitHub Pages; Supabase is intentionally disabled. No user accounts, email OTP, login, server runtime, or cloud database is active in this phase. This is a development baseline: features marked experimental/disabled in the project documentation must not be treated as validated engineering services.


## Deployment status
Runtime source transport is stored in eight ordered shards. Every push to `main` triggers source restoration, syntax/numerical verification, standalone build, and the GitHub Pages deployment workflow.
