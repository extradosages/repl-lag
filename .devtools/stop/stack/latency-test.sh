#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
COMPOSE_FILE=$ROOT/docker/repl-lag-latency-test/docker-compose.yaml

echo "Bringing baby down"
docker-compose \
  -f $COMPOSE_FILE \
  down \
    $@


