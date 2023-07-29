#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)

echo "Building all repl-lag test images"
$ROOT/dev build/image/proxy
$ROOT/dev build/image/replset-init
$ROOT/dev build/image/test-runner
