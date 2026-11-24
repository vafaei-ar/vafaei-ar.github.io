# Research figure provenance

All empirical charts on the website are independently coded from published aggregate results. This site does not include private clinical data, and the illustrative graphics do not replace reading the original articles.

## Lancet Digital Health (2024)
Vafaei Sadr A, et al. "Operational greenhouse-gas emissions of deep learning in digital pathology: a modelling study."
DOI: https://doi.org/10.1016/S2589-7500(23)00219-4

The study described one specific tissue-analysis comparison in which pathomics had 147 times lower modeled CO2-equivalent emissions than multitask deep learning. The website normalizes that result to relative values 147 and 1. It does not report absolute emissions or imply the comparison generalizes to other tasks.

## Journal of the American Heart Association (2026): Stroke AI carbon-aware processing
Vafaei Sadr A, et al. "Evaluating and Mitigating Carbon Dioxide Equivalent Emissions in Stroke Management: A Modeling Study."
DOI: https://doi.org/10.1161/JAHA.125.047556

Published modeled outcomes for the Ideal AI scenario were 16,375.09 metric tonnes CO2e/year (95% CI 16,340.83–16,409.36) using the baseline grid allocation and 7,408.68 metric tonnes (95% CI 7,386.99–7,430.38) when computation was hypothetically redirected to cleaner electricity grids. The reported reduction is 54.75%. This is a modeled policy scenario, not an observed post-implementation reduction. The website chart is independently coded from the reported numbers and does not reproduce publisher artwork.

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

Aggregate counts from Figure 1: 1,043 cases, 1,743 whole-slide images, and 7,382,198 tissue structures. Components: 89,160 glomeruli, 6,742,314 tubules, 550,724 arteries. This is a co-authored study.

### Authentic published histopathology (added November 2026)
- **Source:** Hölscher DL et al., *Nature Communications*, 2023, [Figure 2a](https://www.nature.com/articles/s41467-023-36173-0/figures/2).
- **Licence:** [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Copyright © The Author(s) 2023. The original image is credited to the article's authors, not solely to the website owner.
- **What the figure shows:** PAS-stained glomeruli paired with segmentation overlays from the published FLASH study, covering several patterns of renal disease. Images are from the published research, not generated or inferred by AI.
- **Full original publisher figure:** `assets/media/flash-fig2-original.png`, obtained from Springer Nature's published figure image. Source dimensions: 1878×2488 pixels.
- **Pixel-preserving crop:** `assets/media/flash-fig2a-microscopy.png`, cropped from the upper microscopy/segmentation panel at pixel coordinates (0, 0, 1878, 761), preserving the original pixels. No interpolation, segmentation rerun, or content generation was used.
- **Reproduction code:** `.qa/download_microscopy.py`. The site links to the full original figure and gives an on-page attribution and licence link.

## AI-SoNar / VERA
Open research implementation: https://github.com/vafaei-ar/VERA-cloud

The website's interactive storyboard uses three manually written, fictional examples. It does not execute the VERA engine, access actual patient records, provide diagnosis or treatment, or represent approved clinical logic. The project's clinical escalation rules remain drafts pending review.

### Genuine frontend screenshots (added November 2026)
- Source is the **actual public VERA Cloud frontend**, commit [b8c1939e1b6ebd0e3aec0423d163a0d0e0720679](https://github.com/vafaei-ar/VERA-cloud/tree/b8c1939e1b6ebd0e3aec0423d163a0d0e0720679/frontend/static).
- The screenshots are rendered by `.qa/build_vera_screenshots.cjs` in Chrome from the source HTML, JavaScript, styles and official project logo. They are **not AI-generated design mockups**.
- `assets/media/vera-setup.png`: authentic setup screen, with a fictional scenario. There is no patient name or patient identifier.
- `assets/media/vera-conversation.png`: authentic transcript UI component populated with **fictional** example dialogue for the screenshot only. This dialogue was not produced by VERA or another language model.
- The screenshot capture uses local mocked responses only for scenario metadata and voice list. The actual application backend, speech-recognition service, LLM, and clinical flagging engine **were not run**. The offline capture disables the unrelated audio-worklet script; it does not modify the published VERA repository.
- No model quality, clinical benefit, live access, real patient use or speed/uptime claim can be inferred from these screenshots. A fabricated recognition-confidence display was removed from the synthetic transcript capture.

## Files
- assets/research-results.json: published aggregate data and references
- assets/research.js: original SVG plotting and fictional interface storyboard
- assets/showcase.css: presentation styles
- assets/media/flash-fig2-original.png and flash-fig2a-microscopy.png: unaltered published source figure and pixel-preserving crop (CC BY 4.0)
- assets/media/vera-setup.png and vera-conversation.png: actual frontend UI screenshots with fictional demonstration data
- .qa/download_microscopy.py and .qa/build_vera_screenshots.cjs: independent provenance and capture code
- index.html: complete website content, citations and caveats

Run a local preview with: python -m http.server 8000 (from the repository root). A local HTTP server is needed to fetch the JSON data. Do not open HTML directly as a file URL.
