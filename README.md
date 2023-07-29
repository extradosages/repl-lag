# Repl-lag

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Concepts](#concepts)
  - [Replication lag](#replication-lag)
  - [Db-tests](#db-tests)
  - [Susceptible code units](#susceptible-code-units)
- [⚠ Security Warning](#security-warning)
- [An overview of the repository tests](#an-overview-of-the-repository-tests)
  - [Baseline tests](#baseline-tests)
  - [Contextual causality](#contextual-causality)
- [Tutorial: Get started developing](#tutorial-get-started-developing)
  - [Prepare the laggy replica-set](#prepare-the-laggy-replica-set)
    - [Build the pre-requisite images](#build-the-pre-requisite-images)
    - [Spin-up a laggy replica-set](#spin-up-a-laggy-replica-set)
  - [Prepare a development client](#prepare-a-development-client)
    - [Choose client locality](#choose-client-locality)
    - [Install the js dependencies](#install-the-js-dependencies)
    - [Configure the connection string](#configure-the-connection-string)
  - [Run some tests!](#run-some-tests)
    - [In the development client](#in-the-development-client)
    - [With a test-runner stack](#with-a-test-runner-stack)
- [How-to](#how-to)
  - [(Re-)build all the images at once](#re-build-all-the-images-at-once)
  - [Run a db-stack and a test-runner stack all at once](#run-a-db-stack-and-a-test-runner-stack-all-at-once)
  - [Navigate the `dev` tool](#navigate-the-dev-tool)

<!-- /code_chunk_output -->

## Concepts

This is a repository for testing out the behavior of applications operating against a mongodb replica-set backend experiencing [replication lag](https://www.mongodb.com/docs/manual/tutorial/troubleshoot-replica-sets/#check-the-replication-lag). It was created to rigorously replicate the problems experienced in a back-end at a previous company, and proved a solution in the form of the automatically-created causally consistent sessions described below.

### Replication lag

Replication lag is typically a transient phenomenon caused by instabilities in network architecture. In order to stably reproduce the phenomenon, this repository features a docker container stack of mongodb servers configured in a replica-set with a specifiable baseline network latency overhead between the primary and one of the secondaries.

### Db-tests

This repository asseses a client's behavior in the presence of replication lag by running db-tests, which are unit tests which maintain a connection against a db and which execute queries against it. The db state is managed between tests to keep it clean.

### Susceptible code units

The unit of code fundamentally susceptible to replication lag is the _write-sleep-read_ (WSR). This consists of a write to a document, on the primary; a sleep stage, in which something else happens; and then a read from the same document, from a secondary. A WSR is _causal_ if the read reflects the write. If replication lag is great enough and the proper mongodb safeguards are not in place, then a WSR can read from a secondary before the effects of the write have been replicated, and the WSR is non-causal.

## ⚠ Security Warning

The laggy replica-set stack contains a service container with the [added capability `NET_ADMIN`](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities), which is necessary for simulating latency in the stack using [linux traffic control](https://man7.org/linux/man-pages/man8/tc.8.html). Enabling this capability entails [certain risks](https://unix.stackexchange.com/questions/508809/docker-running-an-app-with-net-admin-capability-involved-risks).

## An overview of the repository tests

### Baseline tests

- Establish that WSRs with little sleep can be non-causal in the presence of replication lag.
- Establish that WSRs with sleep can be causal, even in the presence of replication lag.
- (TODO) Establish that WSRs with little sleep but causally consistent sessions are causal in the presence of replication lag.

### Contextual causality

- Establish that we can use `AsyncLocalStorage` to store [causally consistent sessions](https://www.mongodb.com/docs/manual/core/read-isolation-consistency-recency/#std-label-sessions) in the async context.

## Tutorial: Get started developing

### Prepare the laggy replica-set

Take a look at the [docker-compose.yaml file](https://github.com/extradosages/repl-lag/blob/main/docker/repl-lag-db/docker-compose.yaml) declaring the laggy replica-set.

#### Build the pre-requisite images

Looking through that file you'll note that some of the services run custom images prefixed with `xdsgs/repl-lag/`. These need to be built and present on the host machine before the stack can be deployed. Two images need to be built:

- `xdsgs/repl-lag/proxy`. This image describes a proxy service with built-in [traffic control](https://man7.org/linux/man-pages/man8/tc.8.html). To build this image run:

  ```bash
  $ <repo>/dev build/image/proxy
  ```

- `xdsgs/repl-lag/replset-init`. This image is used to initialize the replica-set once the mongo servers have spun up. To build this image run:

  ```bash
  $ <repo>/dev build/image/replset-init
  ```

#### Spin-up a laggy replica-set

Spinning-up a laggy replica-set is as simple as running:

```bash
$ LATENCY_MS=<latency-ms> <repo>/dev start/stack/db
```

The larger the latency the longer it will take the replica-set to initialize. It should be noted that certain large latencies (on the scale of ~2000ms) can totally ruin the process of initialization. Thus, unfortunately, testable replication lag is capped at around 2s. An improved version of this repository would initialize the replica-set before adding network latency, but this is eaasier said than done.

With an upper bound of 5 minutes, the replica-set should be running (relatively) healthy. To verify this, one can run `<repo>/dev status`, and may expect an output like:

```bash
$ ./dev status
{ "name": "xdsgs.repl-lag.db.proxy", "created": "About a minute ago",  "state": "running", "status": "Up About a minute (healthy)" }
{ "name": "xdsgs.repl-lag.db.primary", "created": "About a minute ago",  "state": "running", "status": "Up About a minute (healthy)" }
{ "name": "xdsgs.repl-lag.db.secondary-1", "created": "About a minute ago",  "state": "running", "status": "Up About a minute (healthy)" }
{ "name": "xdsgs.repl-lag.db.secondary-0", "created": "About a minute ago",  "state": "running", "status": "Up About a minute (healthy)" }
```

As a secondary means of verification, the terminal running the stack should be outputting logs, and will have (early in the initialization process) output a log line like:

```
xdsgs.repl-lag.db.replset-init  | Replica set initialization complete
xdsgs.repl-lag.db.replset-init exited with code 0
```

### Prepare a development client

#### Choose client locality

The recommended way to develop is to use the [vscode development container](https://code.visualstudio.com/docs/remote/containers) provided with this repository. It comes with several vscode extensions pre-configured in the container and attaches to the laggy replica-set proxy's network.

It is feasible to develop on the host machine, however ports on some of the services in the laggy replica-set stack would need to be published to the host.

#### Install the js dependencies

In the repository root, run:

```bash
$ npm install
```

#### Configure the connection string

The testing runtime that the client runs will need to be able to connect to the laggy replica-set proxy in order to run (the replica-set members are all listed). This connection info should be accessible by the runtime in the environment variable `MONGO_URI`, which takes the form of a [mongo connection string](https://www.mongodb.com/docs/manual/reference/connection-string/).

Because the vscode development container is on the same docker bridge network as the laggy replica-set proxy, the docker DNS allows us to access it by its container name. Therefore, in that environment, the connection variable should be set as:

```bash
$ export MONGO_URI=mongodb://xdsgs.repl-lag.db.proxy:27017/?replicaSet=rs0
```

### Run some tests!

#### In the development client

Once the client has been prepared, the the tests can be run against the laggy replica-set with the command:

```bash
$ <repo>/dev start/db-tests
```

This will locate all the files in the `src` file tree with the suffix `dbtest.ts` and run them with `ts-jest`.

#### With a test-runner stack

Tests can alternatively be run with a test-runner stack. This stack relies on the presence of a test-runner docker image, so the first time you run this and every time the tests change you need to rebuild this stack with:

```bash
$ <repo>/dev build/image/test-runner
```

Running the test-runner stack can be accomplished with the command:

```bash
$ <repo>/dev start/stack/test-runner
```

## How-to

### (Re-)build all the images at once

All the images can be built all at once with the command:

```bash
$ <repo>/dev build/stack/test
```

### Run a db-stack and a test-runner stack all at once

The db stack and the test-runner stack do not need to be managed independently of each other. Assuming that all the constituent images are built, a full stack can be spun-up with the command:

```bash
$ LATENCY_MS=<latency-ms> <repo>/dev start/stack/test
```

### Navigate the `dev` tool

The `dev` tool in the repository root is a convenience script for executing other development scripts in the `<repo>/.devtools` folder. The command:sub-command relationships for the `dev` tools directly mirrors the file structure in the `.devtools` folder, so to execute a script `<repo>/.devtools/my/script.sh` one can run `<repo>/dev my/script`. It's a mild convenience.

There is also a `help` command, which takes as an argument the path to any other command in the `.devtools` folder (eliding the `.sh` suffix). So to obtain help with `<repo>/.devtools/my/script.sh` one would execute `<repo>/dev help my/script`.
