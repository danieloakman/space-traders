#!/bin/bash

git clone git@github.com:SpaceTradersAPI/api-docs.git

# Check if java is installed:
if ! command -v java &> /dev/null
then
  echo "Java could not be found. Please install Java 11 or higher."
  exit
fi

pnpm exec openapi-generator-cli generate -i api-docs/reference/SpaceTraders.json -o spacetraders-sdk -g typescript-axios --additional-properties=npmName="spacetraders-sdk" --additional-properties=npmVersion="2.0.0" --additional-properties=supportsES6=true --additional-properties=withSeparateModelsAndApi=true --additional-properties=modelPackage="models" --additional-properties=apiPackage="api"

cd spacetraders-sdk
pnpm update axios@latest
pnpm i
pnpm pack
mv spacetraders-sdk-2.0.0.tgz ../packages/spacetraders-sdk-2.0.0.tgz
cd ..
pnpm add ./packages/spacetraders-sdk-2.0.0.tgz

# # Clean up:
rm -rf api-docs
rm -rf spacetraders-sdk
