"""Download one published CC BY 4.0 figure and crop a REAL microscopy panel.

Source: Hölscher DL et al. Nature Communications 2023, Fig. 2a,
DOI https://doi.org/10.1038/s41467-023-36173-0.
This crop preserves microscopy pixels, with no generative processing.
"""
from io import BytesIO
from pathlib import Path
from PIL import Image
from urllib.request import Request, urlopen

figures = [
    "https://media.springernature.com/full/springer-static/image/art%3A10.1038%2Fs41467-023-36173-0/MediaObjects/41467_2023_36173_Fig2_HTML.png",
    "https://media.springernature.com/lw685/springer-static/image/art%3A10.1038%2Fs41467-023-36173-0/MediaObjects/41467_2023_36173_Fig2_HTML.png",
    "https://media.springernature.com/m685/springer-static/image/art%3A10.1038%2Fs41467-023-36173-0/MediaObjects/41467_2023_36173_Fig2_HTML.png",
]
image = None
for url in figures:
    try:
        request = Request(url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; academic site asset capture; CC-BY-4.0 research figure)",
            "Accept": "image/png,image/*;q=0.8",
        })
        with urlopen(request, timeout=30) as response:
            content = response.read()
            print("SOURCE", response.status, response.headers.get("Content-Type"), len(content), url)
        im = Image.open(BytesIO(content))
        im.verify()
        image = Image.open(BytesIO(content))
        image.load()
        break
    except Exception as exc:
        print("FETCH_FAILED", type(exc).__name__, str(exc)[:400], url)
if image is None:
    raise RuntimeError("Could not download the actual research figure from the publisher")

out = Path("assets/media")
out.mkdir(parents=True, exist_ok=True)
print("FIGURE_DIMENSIONS", image.size, image.mode)
original = out / "flash-fig2-original.png"
image.save(original)
# Fig 2a includes two rows of original histology and matching segmentation masks.
# Crop only the first labelled microscopy panel; do not retouch pixels.
w, h = image.size
crop_height = round(w * 0.405)
if crop_height > h * 0.60:
    raise RuntimeError("Unexpected figure dimensions. Check source before cropping.")
cropped = image.crop((0, 0, w, crop_height))
cropped_path = out / "flash-fig2a-microscopy.png"
cropped.save(cropped_path)
print("CROP", cropped_path, cropped.size, cropped_path.stat().st_size)
print("MICROSCOPY_CROP_OK")
