# aura - Task runners (`auraio/runners`) - (PREVIEW)

`auraio/runners` image includes [JavaScript runner](https://github.com/aura-io/aura/tree/master/packages/%40aura/task-runner),
[Python runner](https://github.com/aura-io/aura/tree/master/packages/%40aura/task-runner-python) and
[Task runner launcher](https://github.com/aura-io/task-runner-launcher) that connects to a Task Broker
running on the main aura instance when running in `external` mode.  This image is to be launched as a sidecar
container to the main aura container.

[Task runners](https://docs.aura.io/hosting/configuration/task-runners/) are used to execute user-provided code
in the [Code Node](https://docs.aura.io/integrations/builtin/core-nodes/aura-nodes-base.code/), isolated from the aura instance.

For official documentation, please see [here](https://docs.aura.io/hosting/configuration/task-runners/).

For a distroless variant of this image, see [here](./Dockerfile.distroless).

For development purposes only, see below.

## Testing locally

### 1) Make a production build of aura

```
pnpm run build:aura
```

### 2) Build the task runners image

```
docker buildx build \
  -f docker/images/runners/Dockerfile \
  -t auraio/runners \
  .
```

### 3) Start aura on your host machine with Task Broker enabled

```
aura_RUNNERS_ENABLED=true \
aura_RUNNERS_MODE=external \
aura_RUNNERS_AUTH_TOKEN=test \
aura_NATIVE_PYTHON_RUNNER=true \
aura_LOG_LEVEL=debug \
pnpm start
```

### 4) Start the task runner container

```
docker run --rm -it \
-e aura_RUNNERS_AUTH_TOKEN=test \
-e aura_RUNNERS_LAUNCHER_LOG_LEVEL=debug \
-e aura_RUNNERS_TASK_BROKER_URI=http://host.docker.internal:5679 \
-p 5680:5680 \
auraio/runners
```

If you need to add extra dependencies (custom image), follow [these instructions](https://docs.aura.io/hosting/configuration/task-runners/#adding-extra-dependencies).

