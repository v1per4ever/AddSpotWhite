# AddSpotWhite

[Русская версия](README.md)

**AddSpotWhite** is an Adobe Photoshop script (`SPOT_WHITE.jsx`) that automates the process of creating a Spot White channel for prepress and printing workflows. The script converts the document to CMYK, selects the visible (opaque) pixels on the active layer, and creates a specific "Spot_White" channel where solid black (100%) indicates areas to be printed with white ink. Finally, it automatically saves the file as a TIFF.

## Features
- Automatic conversion to CMYK color mode.
- Precise selection of opaque pixels based on layer transparency.
- Automatic creation of a "Spot_White" channel.
- Trapping: contracts the selection by 1 pixel to prevent the white underbase from peeking out during printing.
- Saves the final output as a TIFF file (with LZW compression) including the spot channels.

## Installation
1. Download the `SPOT_WHITE.jsx` file from this repository.
2. Place it into your Adobe Photoshop scripts folder:
   - **Windows:** `C:\Program Files\Adobe\Adobe Photoshop [Version]\Presets\Scripts\`
   - **macOS:** `/Applications/Adobe Photoshop [Version]/Presets/Scripts/`
3. Restart Photoshop. The script will be available under `File` -> `Scripts`.

## Usage
1. Prepare a PDF file (or any image format), ensuring the background is transparent and your artwork is on a single layer.
2. In Photoshop, go to `File` -> `Scripts` -> `SPOT_WHITE`.
3. The script will prompt you to select the source PDF file.
4. Let the script run (it will automatically create the channel and prompt you to save).
5. Save the generated `.tif` file.

## Testing (`demo` folder)
The repository includes a `demo` folder containing sample files to test the script. You can use `test_image.png` or `test_document.pdf` to see the script in action. See [demo/README_EN.md](demo/README_EN.md) for more details.

## License
MIT License. Author: Pavel Miroshnik (t.me/script_design).
