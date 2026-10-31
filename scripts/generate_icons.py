import os
from PIL import Image, ImageDraw

def create_icon(size, is_maskable=False):
    # Create image with transparent background or solid for maskable
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0) if not is_maskable else (79, 70, 229, 255))
    draw = ImageDraw.Draw(img)
    
    scale = size / 512.0
    
    if not is_maskable:
        # Rounded squircle
        margin = int(24 * scale)
        radius = int(116 * scale)
        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=radius,
            fill=(79, 70, 229, 255) # Indigo
        )
    
    # Gradient overlay emulation
    for y in range(int(size * 0.4), size):
        alpha = int(((y - size * 0.4) / (size * 0.6)) * 80)
        # Draw subtle darkening
        draw.line([(0, y), (size, y)], fill=(124, 58, 237, alpha))
        
    # Draw arrow and base tray
    cx = size // 2
    cy = int(size * 0.44)
    
    # Stem
    stem_w = max(4, int(28 * scale))
    draw.line([(cx, cy - int(60 * scale)), (cx, cy + int(45 * scale))], fill=(255, 255, 255, 255), width=stem_w)
    
    # Arrow head
    head_size = int(55 * scale)
    points = [
        (cx - head_size, cy - int(5 * scale)),
        (cx, cy + int(55 * scale)),
        (cx + head_size, cy - int(5 * scale))
    ]
    draw.line([points[0], points[1]], fill=(255, 255, 255, 255), width=stem_w)
    draw.line([points[1], points[2]], fill=(255, 255, 255, 255), width=stem_w)
    
    # Tray
    tray_y = cy + int(85 * scale)
    tray_w = int(75 * scale)
    tray_stroke = max(3, int(22 * scale))
    draw.arc([cx - tray_w, tray_y - int(30 * scale), cx + tray_w, tray_y + int(20 * scale)], 
             start=0, end=180, fill=(255, 255, 255, 230), width=tray_stroke)
             
    # Dot accent
    dot_r = max(2, int(12 * scale))
    draw.ellipse([cx + int(65 * scale) - dot_r, cy - int(45 * scale) - dot_r, 
                  cx + int(65 * scale) + dot_r, cy - int(45 * scale) + dot_r], 
                 fill=(165, 180, 252, 255))
                 
    return img

os.makedirs("public", exist_ok=True)
create_icon(192).save("public/icon-192.png", "PNG")
create_icon(512).save("public/icon-512.png", "PNG")
create_icon(512, is_maskable=True).save("public/icon-maskable-512.png", "PNG")
create_icon(180).save("public/apple-touch-icon.png", "PNG")
create_icon(64).save("public/favicon.png", "PNG")
print("Icons generated successfully!")
