from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\Administrator\.cursor\projects\d-projects-indo-news-web\assets"
    r"\c__Users_Administrator_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"00cb59c95883275c4ef69549729a3b53_images_photo_2026-10-30_15-03-01-"
    r"4a2444cd-e5bf-4994-8d61-d3cd1b641595.jpg"
)
ROOT = Path(__file__).resolve().parents[1]
OUT_APP = ROOT / "src" / "app"
OUT_PUB = ROOT / "public"


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            if r <= 28 and g <= 28 and b <= 28:
                pixels[x, y] = (r, g, b, 0)

    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))

    icon512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    icon180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    icon32 = img.resize((32, 32), Image.Resampling.LANCZOS)

    OUT_APP.mkdir(parents=True, exist_ok=True)
    icon512.save(OUT_APP / "icon.png", optimize=True)
    icon180.save(OUT_APP / "apple-icon.png", optimize=True)
    icon512.save(OUT_PUB / "kabardesk-icon.png", optimize=True)
    icon32.save(OUT_PUB / "favicon.png", optimize=True)
    print("Wrote app icons")


if __name__ == "__main__":
    main()
