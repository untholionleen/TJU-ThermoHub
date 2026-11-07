# IF97 third-party attribution

The browser IF97 engine in this directory incorporates the NeutriumJS.thermo.IAPWS97 implementation.

- Original project: https://github.com/NativeDynamics/NeutriumJS.thermo.IAPWS97
- Current successor: https://github.com/neutrium/thermo.eos.iapws97
- Author / copyright: Native Dynamics, 2015
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- License text: LICENSE-CC-BY-4.0.txt
- Modifications in this project: static browser integration, an input-pair adapter, IF97 region metadata, quality and saturation wrappers, and local regression tests.

The upstream README marks the original package deprecated and points to the successor. The IF97 release and supplementary equations are published by IAPWS; this adapter does not claim certification as a commercial property package. In particular, legacy backward modules PH/PS/HS do not uniformly cover every IF97 region. The UI reports unsupported inversions rather than silently falling back to another equation.
