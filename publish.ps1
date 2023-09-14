#!/usr/bin/env pwsh

Remove-Item -Force -Recurse .\publish
Remove-Item -Force -Recurse .\frontend\dist
Remove-Item -Force -Recurse .\backend\dist

New-Item -ItemType Directory -Path .\publish\backend\dist
New-Item -ItemType Directory -Path .\publish\frontend\dist
New-Item -ItemType Directory -Path .\publish\frontend\dist\og-image
New-Item -ItemType Directory -Path .\publish\shared

$env:NODE_ENV = "production"

Set-Location -Path .\frontend

yarn --production=false
yarn webpack

Set-Location -Path ..\backend

yarn --production=false
yarn build
yarn run build-images

if ($IsWindows) {
    & 'C:\Program Files\Inkscape\bin\inkscape.exe' --export-png=images\og-image.png --export-width=1280 --export-height=800 images\og-image.svg
}
elseif ($IsMacOS) {
    qlmanage -t -s 1200 -o images/og-image.png images/og-image.svg
}
else {
    /usr/bin/inkscape --export-png=images/og-image.png --export-width=1280 --export-height=800 images/og-image.svg
}

Set-Location -Path ..\

Copy-Item -Path .\backend\dist\* -Destination .\publish\backend\dist -Recurse
Copy-Item -Path .\backend\fonts -Destination .\publish\backend -Recurse
Copy-Item -Path .\backend\images -Destination .\publish\backend -Recurse
Copy-Item -Path .\backend\package.json -Destination .\publish\backend
Copy-Item -Path .\backend\yarn.lock -Destination .\publish\backend
Copy-Item -Path .\backend\.env -Destination .\publish\backend

Copy-Item -Path .\frontend\dist\* -Destination .\publish\frontend\dist -Recurse

Copy-Item -Path .\shared\dist -Destination .\publish\shared -Recurse
Copy-Item -Path .\shared\src -Destination .\publish\shared -Recurse
Copy-Item -Path .\shared\types -Destination .\publish\shared -Recurse
Copy-Item -Path .\shared\package.json -Destination .\publish\shared
Copy-Item -Path .\shared\yarn.lock -Destination .\publish\shared
Copy-Item -Path .\shared\tsconfig.json -Destination .\publish\shared

Copy-Item -Path .\packages -Destination .\publish -Recurse
Copy-Item -Path .\readme.md -Destination .\publish

# create zip file
Compress-Archive -Path .\publish\* -DestinationPath .\publish.zip -Force
Remove-Item -Force -Recurse .\publish
