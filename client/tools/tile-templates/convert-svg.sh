#!/bin/bash
# Path: convert.sh
mimetype=$(file -bN --mime-type "$1")

# for SVG files, we want to minify them to a temporary file first
if [ "$mimetype" == "image/svg+xml" ]; then
    # minify the SVG
    svgo -i "$1" -o "$1.min"
    
    file="$1.min"
else
    file="$1"
fi

content=$(base64 < "$file")
url="data:$mimetype;base64,$content"

cat square30x30.svg | sed "s|image.png|$url|g" > out/$2-square30x30.svg
cat square70x70.svg | sed "s|image.png|$url|g" > out/$2-square70x70.svg
cat square150x150.svg | sed "s|image.png|$url|g" > out/$2-square150x150.svg
cat square310x310.svg | sed "s|image.png|$url|g" > out/$2-square310x310.svg
cat wide310x150.svg | sed "s|image.png|$url|g" > out/$2-wide310x150.svg
