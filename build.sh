#!/usr/bin/env bash

cd inventorus-frontend
npm run build
cp -r build/client/* ../backend/frontend

cd ../backend
go build -o inventorus

cd ..
mkdir -p output
cp backend/inventorus output/
