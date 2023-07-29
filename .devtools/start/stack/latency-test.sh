#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
COMPOSE_FILE=$ROOT/docker/repl-lag-latency-test/docker-compose.yaml

$ROOT/dev stop/stack/latency-test

echo "Bringing-up baby"
docker-compose \
  -f $COMPOSE_FILE \
  up \
    $@

