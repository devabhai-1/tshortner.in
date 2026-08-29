"""Generate TShortner PWA / favicon PNG assets from brand colors."""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "public"
BLUE = (0, 132, 255, 255)
WHITE = (255, 255, 255, 255)


def draw_link_icon(draw: ImageDraw.ImageDraw, size: int, pad_ratio: float = 0.22) -> None:
    """Approximate the favicon chain-link mark, centered."""
    cx = cy = size / 2
    # Scale stroke + geometry with canvas size
    stroke = max(3, int(size * 0.086))
    # Rotated link geometry in local coords (pre-rotate -45°)
    # Draw as two rounded capsules + center bar using rotated polyline approx
    import math

    angle = math.radians(-45)
    cos_a, sin_a = math.cos(angle), math.sin(angle)

    def rot(x, y):
        return cx + x * cos_a - y * sin_a, cy + x * sin_a + y * cos_a

    scale = size * (0.5 - pad_ratio)

    def S(v):
        return v * scale / 100

    stroke = max(3, int(S(18)))

    def draw_polyline(pts):
        if len(pts) < 2:
            return
        for i in range(len(pts) - 1):
            draw.line([pts[i], pts[i + 1]], fill=WHITE, width=stroke, joint="curve")

    def arc_poly(cx0, cy0, r, a0, a1, steps=24):
        pts = []
        for i in range(steps + 1):
            t = a0 + (a1 - a0) * i / steps
            pts.append(rot(cx0 + r * math.cos(t), cy0 + r * math.sin(t)))
        return pts

    # Top-right loop (like SVG path around +x)
    r = S(48)
    # Upper arm: left point to right arc
    p_top = []
    p_top.append(rot(S(-16), S(-48)))
    p_top.append(rot(S(64), S(-48)))
    p_top += arc_poly(S(64), 0, r, -math.pi / 2, math.pi / 2)
    p_top.append(rot(S(-16), S(48)))
    draw_polyline(p_top)

    # Bottom-left loop
    p_bot = []
    p_bot.append(rot(S(16), S(48)))
    p_bot.append(rot(S(-64), S(48)))
    p_bot += arc_poly(S(-64), 0, r, math.pi / 2, 3 * math.pi / 2)
    p_bot.append(rot(S(16), S(-48)))
    draw_polyline(p_bot)

    # Center bar
    draw.line([rot(S(-40), 0), rot(S(40), 0)], fill=WHITE, width=stroke)


def make_icon(size: int, *, rounded: bool = False, pad_ratio: float = 0.18) -> Image.Image:
    img = Image.new("RGBA", (size, size), BLUE)
    draw = ImageDraw.Draw(img)
    draw_link_icon(draw, size, pad_ratio=pad_ratio)

    if rounded:
        # Soft squircle mask for apple-ish assets (optional)
        mask = Image.new("L", (size, size), 0)
        mdraw = ImageDraw.Draw(mask)
        radius = int(size * 0.22)
        mdraw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img, (0, 0), mask)
        return out
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Install / manifest (full-bleed, maskable-safe padding)
    make_icon(192, pad_ratio=0.22).save(OUT / "icon-192x192.png", "PNG")
    make_icon(512, pad_ratio=0.22).save(OUT / "icon-512x512.png", "PNG")
    make_icon(192, pad_ratio=0.26).save(OUT / "icon-192x192-maskable.png", "PNG")
    make_icon(512, pad_ratio=0.26).save(OUT / "icon-512x512-maskable.png", "PNG")

    # Apple / Windows tiles
    make_icon(180, pad_ratio=0.2).save(OUT / "apple-touch-icon.png", "PNG")
    make_icon(144, pad_ratio=0.2).save(OUT / "icon-144x144.png", "PNG")
    make_icon(32, pad_ratio=0.16).save(OUT / "favicon-32x32.png", "PNG")
    make_icon(16, pad_ratio=0.14).save(OUT / "favicon-16x16.png", "PNG")

    # Open Graph square mark
    make_icon(512, pad_ratio=0.2).save(OUT / "og-image.png", "PNG")

    print("Generated icons in", OUT)


if __name__ == "__main__":
    main()
