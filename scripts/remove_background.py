import sys
from PIL import Image, ImageDraw

def make_transparent(input_path, output_path):
    # Open the original image
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    
    # The background color is at (0, 0)
    bg_color = img.getpixel((0, 0))
    print(f"Detected background color at (0,0): {bg_color}")
    
    transparent_color = (0, 0, 0, 0)
    
    # We will flood-fill from border pixels that match bg_color within a threshold
    # Since background color is semi-transparent dark blue/gray, we match pixels close to it
    def color_distance(c1, c2):
        return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5

    # Get border coordinates
    border_pixels = []
    for x in range(width):
        border_pixels.append((x, 0))
        border_pixels.append((x, height - 1))
    for y in range(height):
        border_pixels.append((0, y))
        border_pixels.append((width - 1, y))
        
    for x, y in border_pixels:
        pixel = img.getpixel((x, y))
        # If the pixel is similar to the background color, floodfill it
        if color_distance(pixel, bg_color) < 40 and pixel[3] > 0:
            ImageDraw.floodfill(img, (x, y), transparent_color, thresh=50)
            
    img.save(output_path, 'PNG')
    print(f"Background removed. Saved to {output_path}")

if __name__ == '__main__':
    # Always read from the pristine logo folder to avoid multiple-generation loss
    original_logo = 'logo/mansao dos Influenciadores.png'
    make_transparent(original_logo, 'public/logo.png')
    make_transparent(original_logo, 'src/app/icon.png')
