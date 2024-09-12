#!/bin/bash
# Path: convert.sh
# take in an image, and convert it to the following: square30x30.webp square70x70.webp square150x150.webp square310x310.webp wide310x150.webp, cropping as necessary
# usage: ./convert.sh <image> <name> --with-padding

# if we're using padding, we'll need to run the svg script first, then convert the svg to a png

if [ "$3" == "--with-padding" ]; then
    ./convert-svg.sh "$1" "$2" --no-crush

    # export to png with inkscape
    inkscape --export-background-opacity=0 --export-type="png" out/$2-square30x30.svg -w 48 -h 48 -o out/$2-square30x30.png
    inkscape --export-background-opacity=0 --export-type="png" out/$2-square70x70.svg -w 112 -h 112 -o out/$2-square70x70.png
    inkscape --export-background-opacity=0 --export-type="png" out/$2-square150x150.svg -w 240 -h 240 -o out/$2-square150x150.png
    inkscape --export-background-opacity=0 --export-type="png" out/$2-square310x310.svg -w 496 -h 496 -o out/$2-square310x310.png
    inkscape --export-background-opacity=0 --export-type="png" out/$2-wide310x150.svg -w 496 -h 240 -o out/$2-wide310x150.png    

    # convert to webp with ffmpeg because imagemagick doesn't do transparency properly

    ffmpeg -y -hide_banner -loglevel error -i out/$2-square30x30.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square30x30.webp 
    ffmpeg -y -hide_banner -loglevel error -i out/$2-square70x70.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square70x70.webp
    ffmpeg -y -hide_banner -loglevel error -i out/$2-square150x150.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square150x150.webp
    ffmpeg -y -hide_banner -loglevel error -i out/$2-square310x310.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square310x310.webp
    ffmpeg -y -hide_banner -loglevel error -i out/$2-wide310x150.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-wide310x150.webp

    rm out/$2-square30x30.svg 
    rm out/$2-square70x70.svg 
    rm out/$2-square150x150.svg 
    rm out/$2-square310x310.svg
    rm out/$2-wide310x150.svg 
    exit 0
else
    magick convert "$1" -resize 48x48^ -gravity center -extent 48x48 -background none -flatten out/$2-square30x30.png
    magick convert "$1" -resize 112x112^ -gravity center -extent 112x112 -background none -flatten out/$2-square70x70.png
    magick convert "$1" -resize 240x240^ -gravity center -extent 240x240 -background none -flatten out/$2-square150x150.png
    magick convert "$1" -resize 496x496^ -gravity center -extent 496x496 -background none -flatten out/$2-square310x310.png
    magick convert "$1" -resize 496x240^ -gravity center -extent 496x240 -background none -flatten out/$2-wide310x150.png

    ffmpeg -y -hide_banner -loglevel error -i out/$2-square30x30.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square30x30.webp 
    ffmpeg -y -hide_banner -loglevel error -i out/$2-square70x70.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square70x70.webp
    ffmpeg -y -hide_banner -loglevel error -i out/$2-square150x150.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square150x150.webp
    ffmpeg -y -hide_banner -loglevel error -i out/$2-square310x310.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-square310x310.webp
    ffmpeg -y -hide_banner -loglevel error -i out/$2-wide310x150.png -vcodec libwebp -lossless 1 -q:v 90 out/$2-wide310x150.webp
fi

