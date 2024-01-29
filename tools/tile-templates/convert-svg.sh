#!/bin/bash
# Path: convert.sh
mimetype=$(file -bN --mime-type "$1")

if [ "$mimetype" == "image/svg" ]; then
    mimetype="image/svg+xml"
fi

# for SVG files, we want to minify them to a temporary file first if $3 is not --no-crush
if [ "$mimetype" == "image/svg+xml" ] && [ "$3" != "--no-crush" ]; then
    # minify the SVG
    svgo -i "$1" --config svgo.conf.js -o "$1.min"
    
    file="$1.min"
else
    file="$1"
fi

content=$(base64 -w 0 < "$file")
url="data:$mimetype;base64,$content"

cat square30x30.svg | sed "s|image.png|$url|g" > out/$2-square30x30.svg
cat square70x70.svg | sed "s|image.png|$url|g" > out/$2-square70x70.svg
cat square150x150.svg | sed "s|image.png|$url|g" > out/$2-square150x150.svg
cat square310x310.svg | sed "s|image.png|$url|g" > out/$2-square310x310.svg
cat wide310x150.svg | sed "s|image.png|$url|g" > out/$2-wide310x150.svg

if [ "$3" != "--no-crush" ]; then
    svgo -i out/$2-square30x30.svg --config svgo.conf.js -o out/$2-square30x30.svg
    svgo -i out/$2-square70x70.svg --config svgo.conf.js -o out/$2-square70x70.svg
    svgo -i out/$2-square150x150.svg --config svgo.conf.js -o out/$2-square150x150.svg
    svgo -i out/$2-square310x310.svg --config svgo.conf.js -o out/$2-square310x310.svg
    svgo -i out/$2-wide310x150.svg --config svgo.conf.js -o out/$2-wide310x150.svg
fi