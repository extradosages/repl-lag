#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
DOCKER_DIR=$ROOT/docker/repl-lag-test-runner
CONTEXT=$ROOT
DOCKERFILE_PATH=$DOCKER_DIR/Dockerfile

echo "Building xdsgs/repl-lag/test-runner image"
docker \
  build \
    --file $DOCKERFILE_PATH \
    --tag xdsgs/repl-lag/test-runner \
    $CONTEXT




