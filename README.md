# Nanostring Utils

## Usage
1. Copy your input stacked-tiff files into thisDirectory/workingDirectory/input
2. Run `./extractAll.sh`, which will:
  - Search for all files in workingDirectory/input
  - Open each one in imageJ
  - Extract frames 2 & 3 from each, and save them as as 8-bit PNGs in the output directory
3. Double click on thisDirectory/public/index.html and do yo thang as we talked about.
  - Save your outputs to thisDirectory/workingDirectory/masked
4. Run `./saveAs8Bit.sh`, which will:
  - Search for all files in workingDirectory/masked
  - Save each one as an 8-bit PNG in workingDirectory/masked8Bit
