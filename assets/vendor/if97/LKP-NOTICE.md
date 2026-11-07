# Lee–Kesler–Plöcker implementation

TJU-ThermoHub contains an independent JavaScript implementation of the Lee–Kesler–Plöcker two-reference-fluid Helmholtz residual EOS. The formulation and coefficients were cross-checked against the public teqp LKP model documentation hosted by NIST:

- Documentation: https://teqp.readthedocs.io/en/latest/models/LKP.html
- Source reference: https://teqp.readthedocs.io/en/latest/_static/doxygen/html/LKP_8hpp_source.html
- Original method: B. I. Lee and M. G. Kesler, AIChE Journal, 1975; Plöcker et al. corresponding-states extension.

The project does not include or redistribute teqp source code. The NIST-hosted documentation is used as a mathematical reference and test-vector source. A regression example checks the methane/nitrogen residual Helmholtz value. Numerical agreement with textbook printed charts remains to be separately assessed.
