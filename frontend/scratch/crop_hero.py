import os
from PIL import Image

image_path = 'Screenshot 2026-07-16 005642.png'
if os.path.exists(image_path):
    im = Image.open(image_path)
    # The image is 1219 x 892. Let's crop the right portion containing the truck, people, and phone mockup.
    # We can crop from x = 380 to 1219, and y = 100 to 740.
    crop_box = (380, 100, 1219, 740)
    cropped = im.crop(crop_box)
    
    # Save the cropped image
    output_dir = 'public'
    os.makedirs(output_dir, exist_ok=True)
    cropped.save(os.path.join(output_dir, 'hero-illustration.png'))
    print("Cropped image saved successfully to public/hero-illustration.png")
else:
    print(f"Error: {image_path} does not exist")
