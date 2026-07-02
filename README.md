<div align="center">
  <img src="banner.jpg" alt="AddSpotWhite Banner" width="100%">
  
  <h1>🖌️ AddSpotWhite</h1>
  <p><b>Adobe Illustrator script for automatic generation of Spot White channels for print.</b></p>
  
  <p>
    <a href="#description">Description</a> •
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="README_EN.md">Old English README</a>
  </p>
</div>

---

## 🎨 Description
**AddSpotWhite** is a powerful Adobe Photoshop script (`SPOT_WHITE.jsx`) that automates the process of creating a Spot White channel (`Spot_White`) to prepare images for professional printing.

The script converts the document into the CMYK color model, isolates the visible (opaque) pixels of the image, and generates a dedicated channel where 100% black represents the area to be covered with white ink. Finally, it saves the output as a TIFF file.

## ✨ Features
- 🔄 **Auto-Conversion**: Automatically converts the document to CMYK if needed.
- 🎯 **Precision**: Analyzes layer transparency to create highly accurate selections of opaque pixels.
- ⚪ **Spot Channel**: Creates a dedicated `Spot_White` spot channel.
- 🔍 **Trapping**: Automatically contracts the selection by 1 pixel (trapping) to prevent the white underbase from bleeding past the image edges during printing.
- 💾 **Export**: Saves the result as an LZW-compressed TIFF supporting spot channels.

## 🛠 Installation
1. Download the `SPOT_WHITE.jsx` file from this repository.
2. Place it into your Adobe Photoshop scripts folder:
   - **Windows:** `C:\Program Files\Adobe\Adobe Photoshop [Version]\Presets\Scripts\`
   - **macOS:** `/Applications/Adobe Photoshop [Version]/Presets/Scripts/`
3. Restart Photoshop. The script will now be available under `File` -> `Scripts`.
