#!/bin/bash
# Path: convert.sh
# take in an image, and convert it to the following: square30x30.webp square70x70.webp square150x150.webp square310x310.webp wide310x150.webp, cropping as necessary
# usage: ./convert.sh <image> <name>

convert "$1" -resize 48x48^ -gravity center -extent 48x48 -background transparent -quality 50 out/$2-square30x30.webp
convert "$1" -resize 112x112^ -gravity center -extent 112x112 -background transparent -quality 50 out/$2-square70x70.webp
convert "$1" -resize 240x240^ -gravity center -extent 240x240 -background transparent -quality 50 out/$2-square150x150.webp
convert "$1" -resize 496x496^ -gravity center -extent 496x496 -background transparent -quality 50 out/$2-square310x310.webp
convert "$1" -resize 496x240^ -gravity center -extent 496x240 -background transparent -quality 50 out/$2-wide310x150.webp
