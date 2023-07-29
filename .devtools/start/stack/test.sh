#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
COMPOSE_FILE=$ROOT/docker/repl-lag-test/docker-compose.yaml

$ROOT/dev stop/stack/test

echo "Bringing-up baby"
docker-compose \
  -f $COMPOSE_FILE \
  up \
    $@


