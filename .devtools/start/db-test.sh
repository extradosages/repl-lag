#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)

echo "Running dbtests"
cd $ROOT
npx jest --config jest.config.dbtest.json --runInBand