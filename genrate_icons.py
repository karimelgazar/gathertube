from PIL import Image     
import os

# Get the absolute path of the current script
script_path = os.path.abspath(__file__)

# Get the directory of the current script
script_dir = os.path.dirname(script_path)

# Change the current working directory to the script's directory
os.chdir(script_dir)

# Load the original logo                                
logo = Image.open('icons/logo.png')                   
print(f'Original logo size: {logo.size}')               

# Create additional sizes for better display
sizes = [16, 19, 32, 38, 48, 64, 128, 256]

for size in sizes:                             
    # Resize with high quality resampling
    resized = logo.resize((size, size), Image.Resampling.LANCZOS)
    filename = f'icons/icon-{size}.png'                   
    resized.save(filename)                            
    print(f'Created {filename} ({size}x{size})')

print('All icon sizes created!')

