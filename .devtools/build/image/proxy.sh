#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
DOCKER_DIR=$ROOT/docker/repl-lag-proxy
CONTEXT=$DOCKER_DIR
DOCKERFILE_PATH=$DOCKER_DIR/Dockerfile

echo "Building xdsgs/repl-lag/proxy image"
docker \
  build \
    --file $DOCKERFILE_PATH \
    --tag xdsgs/repl-lag/proxy \
    $CONTEXT


