#!/bin/bash
# this script copies all required files to the publish directory

rm -rf publish

export NODE_ENV=production

yarn build
cd client && yarn build && cd ..

mkdir -p publish
mkdir -p publish/dist
mkdir -p publish/client/dist

cp -r dist/* publish/dist
cp -r fonts publish
cp -r packages publish

cp -r client/dist/* publish/client/dist
cp package.json publish
cp yarn.lock publish
cp readme.md publish
cp .env publish

zip -r publish.zip publish
rm -rf publish
