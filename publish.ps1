Remove-Item -Force -Recurse .\publish

$env:NODE_ENV="production"

Set-Location -Path .\backend

yarn --production=false
yarn build

Set-Location -Path ..\frontend

yarn --production=false
yarn webpack

Set-Location -Path ..\

New-Item -ItemType Directory -Path .\publish\backend\dist
New-Item -ItemType Directory -Path .\publish\frontend\dist
New-Item -ItemType Directory -Path .\publish\shared

Copy-Item -Path .\backend\dist\* -Destination .\publish\backend\dist -Recurse
Copy-Item -Path .\backend\fonts -Destination .\publish\backend -Recurse
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
