FROM node:16

WORKDIR /mnt/test-runner
COPY .devtools ./.devtools
COPY dev jest.config.dbtest.json package.json package-lock.json tsconfig.json ./
RUN npm clean-install
COPY src ./src

# Base folder needs to be a git repo for `dev` to work
RUN apt-get update && apt-get install -y git
RUN git init

ENTRYPOINT ["/mnt/test-runner/dev", "start/db-test"]
