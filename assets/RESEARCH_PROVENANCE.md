# Research figure provenance

All empirical charts on the website are independently coded from published aggregate results. This site does not include private clinical data, and the illustrative graphics do not replace reading the original articles.

## Lancet Digital Health (2024)
Vafaei Sadr A, et al. "Operational greenhouse-gas emissions of deep learning in digital pathology: a modelling study."
DOI: https://doi.org/10.1016/S2589-7500(23)00219-4

The study described one specific tissue-analysis comparison in which pathomics had 147 times lower modeled CO2-equivalent emissions than multitask deep learning. The website normalizes that result to relative values 147 and 1. It does not report absolute emissions or imply the comparison generalizes to other tasks.

## Scientific Reports (2025): Pympute
Vafaei Sadr A, et al. "Flexible imputation toolkit for electronic health records."
DOI: https://doi.org/10.1038/s41598-025-02276-5

The MIMIC benchmark values are transcribed from Table 1: means and SDs for holdout MAPE and RMSE, covering all 11 evaluated methods. Chart code generates a new SVG from these values, not a reproduced or modified publisher figure. The article has a CC BY-NC-ND 4.0 license, so no article figures are copied or adapted.

## Bioengineering (2025): ECG + EHR
Vafaei Sadr A, et al. "Integration of EHR and ECG Data for Predicting Paroxysmal Atrial Fibrillation in Stroke Patients."
DOI: https://doi.org/10.3390/bioengineering12090961

Reported aggregate data: 189 stroke patients including 49 with PAF, 47 structured EHR predictors, 12-lead ECG input, AUROC about 0.65 and AUPRC about 0.43. The fusion diagram is conceptual. These are pilot results requiring independent evaluation and do not establish clinical utility.

## Nature Communications (2023): FLASH morphometry
Hölscher DL, et al. "Next-Generation Morphometry for pathomics-data mining in histopathology."
DOI: https://doi.org/10.1038/s41467-023-36173-0

Aggregate counts from Figure 1: 1,043 cases, 1,743 whole-slide images, and 7,382,198 tissue structures. Components: 89,160 glomeruli, 6,742,314 tubules, 550,724 arteries. The displayed counts are not microscopy images. This is a co-authored study.

## AI-SoNar / VERA
Open research implementation: https://github.com/vafaei-ar/VERA-cloud

The website's interactive storyboard uses three manually written, fictional examples. It does not execute the VERA engine, access actual patient records, provide diagnosis or treatment, or represent approved clinical logic. The project's clinical escalation rules remain drafts pending review.

## Files
- assets/research-results.json: published aggregate data and references
- assets/research.js: original SVG plotting and fictional interface storyboard
- assets/showcase.css: presentation styles
- index.html: complete website content, citations and caveats

Run a local preview with: python -m http.server 8000 (from the repository root). A local HTTP server is needed to fetch the JSON data. Do not open HTML directly as a file URL.
