#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
COMPOSE_FILE=$ROOT/docker/repl-lag-test-runner/docker-compose.yaml

echo "Bringing baby down"
docker-compose \
  -f $COMPOSE_FILE \
  down \
    $@
