from fastapi import APIRouter, Response
from typing import Optional

try:
    from PIL import Image, ImageDraw, ImageFont
except Exception:
    Image = None  # type: ignore
    ImageDraw = None  # type: ignore
    ImageFont = None  # type: ignore

router = APIRouter()

@router.get("/placeholder/{width}/{height}")
def placeholder_image(width: int, height: int, text: Optional[str] = None, bg: Optional[str] = None, fg: Optional[str] = None):
    """
    Simple dynamic placeholder image generator used by seeded data.
    - width/height: image size
    - text: optional text to render (defaults to WIDTHxHEIGHT)
    - bg: optional background hex (e.g. 1e3a8a). Defaults to a blue tone
    - fg: optional foreground/text hex. Defaults to white
    """
    # Fallback: if Pillow is not available, return a 1x1 transparent PNG
    if Image is None:
        # 1x1 PNG transparent
        pixel = bytes([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,1,115,82,71,66,0,174,206,28,233,0,0,0,10,73,68,65,84,120,156,99,0,1,0,0,5,0,1,13,10,38,187,0,0,0,0,73,69,78,68,174,66,96,130])
        return Response(content=pixel, media_type="image/png")

    # Parse colors
    def parse_hex(h: Optional[str], default: str) -> tuple[int,int,int]:
        val = (h or default).lstrip('#')
        if len(val) == 3:
            val = ''.join(c*2 for c in val)
        try:
            return tuple(int(val[i:i+2], 16) for i in range(0, 6, 2))  # type: ignore
        except Exception:
            val = default.lstrip('#')
            return tuple(int(val[i:i+2], 16) for i in range(0, 6, 2))  # type: ignore

    bg_rgb = parse_hex(bg, '#1e3a8a')  # blue-800
    fg_rgb = parse_hex(fg, '#ffffff')  # white

    img = Image.new('RGB', (max(1, width), max(1, height)), color=bg_rgb)
    draw = ImageDraw.Draw(img)

    label = text or f"{width}x{height}"

    # Try to load a default font; fallback to simple text at top-left
    font = None
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    if font is not None:
        tw, th = draw.textbbox((0, 0), label, font=font)[2:]
        draw.text(((width - tw) / 2, (height - th) / 2), label, fill=fg_rgb, font=font)
    else:
        draw.text((4, 4), label, fill=fg_rgb)

    # Return as PNG
    from io import BytesIO
    buf = BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return Response(content=buf.read(), media_type="image/png")