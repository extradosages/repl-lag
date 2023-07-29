#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
COMPOSE_FILE=$ROOT/docker/repl-lag-test-runner/docker-compose.yaml

$ROOT/dev stop/stack/test-runner

echo "Bringing-up baby"
docker-compose \
  -f $COMPOSE_FILE \
  up \
    $@

