Remove-Item -Force -Recurse .\publish

$env:NODE_ENV = "production"

Set-Location -Path .\backend

yarn
yarn build

Set-Location -Path ..\frontend

yarn
yarn build

Set-Location -Path ..\

New-Item -ItemType Directory -Path .\publish\backend\dist
New-Item -ItemType Directory -Path .\publish\frontend\dist

Copy-Item -Path .\backend\dist\* -Destination .\publish\backend\dist -Recurse
Copy-Item -Path .\backend\fonts -Destination .\publish\backend -Recurse
Copy-Item -Path .\backend\package.json -Destination .\publish\backend
Copy-Item -Path .\backend\yarn.lock -Destination .\publish\backend
Copy-Item -Path .\backend\.env -Destination .\publish\backend

Copy-Item -Path .\packages -Destination .\publish -Recurse
Copy-Item -Path .\readme.md -Destination .\publish
