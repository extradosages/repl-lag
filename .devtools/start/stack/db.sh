#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
COMPOSE_FILE=$ROOT/docker/repl-lag-db/docker-compose.yaml

$ROOT/dev stop/stack/db

echo "Bringing-up baby"
docker-compose \
  -f $COMPOSE_FILE \
  up \
    $@
