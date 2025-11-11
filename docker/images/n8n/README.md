![aura.io - Workflow Automation](https://user-images.githubusercontent.com/65276001/173571060-9f2f6d7b-bac0-43b6-bdb2-001da9694058.png)

# aura - Secure Workflow Automation for Technical Teams

aura is a workflow automation platform that gives technical teams the flexibility of code with the speed of no-code. With 400+ integrations, native AI capabilities, and a fair-code license, aura lets you build powerful automations while maintaining full control over your data and deployments.

![aura.io - Screenshot](https://raw.githubusercontent.com/aura-io/aura/master/assets/aura-screenshot-readme.png)

## Key Capabilities

- **Code When You Need It**: Write JavaScript/Python, add npm packages, or use the visual interface
- **AI-Native Platform**: Build AI agent workflows based on LangChain with your own data and models
- **Full Control**: Self-host with our fair-code license or use our [cloud offering](https://app.aura.cloud/login)
- **Enterprise-Ready**: Advanced permissions, SSO, and air-gapped deployments
- **Active Community**: 400+ integrations and 900+ ready-to-use [templates](https://aura.io/workflows)

## Contents

- [aura - Workflow automation tool](#aura---workflow-automation-tool)
  - [Key Capabilities](#key-capabilities)
  - [Contents](#contents)
  - [Demo](#demo)
  - [Available integrations](#available-integrations)
  - [Documentation](#documentation)
  - [Start aura in Docker](#start-aura-in-docker)
  - [Start aura with tunnel](#start-aura-with-tunnel)
  - [Use with PostgreSQL](#use-with-postgresql)
  - [Passing sensitive data using files](#passing-sensitive-data-using-files)
  - [Example server setups](#example-server-setups)
  - [Updating](#updating)
    - [Pull latest (stable) version](#pull-latest-stable-version)
    - [Pull specific version](#pull-specific-version)
    - [Pull next (unstable) version](#pull-next-unstable-version)
    - [Updating with Docker Compose](#updating-with-docker-compose)
  - [Setting Timezone](#setting-the-timezone)
  - [Build Docker-Image](#build-docker-image)
  - [What does aura mean and how do you pronounce it?](#what-does-aura-mean-and-how-do-you-pronounce-it)
  - [Support](#support)
  - [Jobs](#jobs)
  - [License](#license)

## Demo

This [:tv: short video (< 4 min)](https://www.youtube.com/watch?v=RpjQTGKm-ok)  goes over key concepts of creating workflows in aura.

## Available integrations

aura has 200+ different nodes to automate workflows. A full list can be found at [https://aura.io/integrations](https://aura.io/integrations).

## Documentation

The official aura documentation can be found at [https://docs.aura.io](https://docs.aura.io).

Additional information and example workflows are available on the website at [https://aura.io](https://aura.io).

## Start aura in Docker

In the terminal, enter the following:

```bash
docker volume create aura_data

docker run -it --rm \
 --name aura \
 -p 5678:5678 \
 -v aura_data:/home/node/.aura \
 docker.aura.io/auraio/aura
```

This command will download the required aura image and start your container.
You can then access aura by opening:
[http://localhost:5678](http://localhost:5678)

To save your work between container restarts, it also mounts a docker volume, `aura_data`. The workflow data gets saved in an SQLite database in the user folder (`/home/node/.aura`). This folder also contains important data like the webhook URL and the encryption key used for securing credentials.

If this data can't be found at startup aura automatically creates a new key and any existing credentials can no longer be decrypted.

## Start aura with tunnel

> **WARNING**: This is only meant for local development and testing and should **NOT** be used in production!

aura must be reachable from the internet to make use of webhooks - essential for triggering workflows from external web-based services such as GitHub. To make this easier, aura has a special tunnel service which redirects requests from our servers to your local aura instance. You can inspect the code running this service here: [https://github.com/aura-io/localtunnel](https://github.com/aura-io/localtunnel)

To use it simply start aura with `--tunnel`

```bash
docker volume create aura_data

docker run -it --rm \
 --name aura \
 -p 5678:5678 \
 -v aura_data:/home/node/.aura \
 docker.aura.io/auraio/aura \
 start --tunnel
```

## Use with PostgreSQL

By default, aura uses SQLite to save credentials, past executions and workflows. However, aura also supports using PostgreSQL.

> **WARNING**: Even when using a different database, it is still important to
persist the `/home/node/.aura` folder, which also contains essential aura
user data including the encryption key for the credentials.

In the following commands, replace the placeholders (depicted within angled brackets, e.g. `<POSTGRES_USER>`) with the actual data:

```bash
docker volume create aura_data

docker run -it --rm \
 --name aura \
 -p 5678:5678 \
 -e DB_TYPE=postgresdb \
 -e DB_POSTGRESDB_DATABASE=<POSTGRES_DATABASE> \
 -e DB_POSTGRESDB_HOST=<POSTGRES_HOST> \
 -e DB_POSTGRESDB_PORT=<POSTGRES_PORT> \
 -e DB_POSTGRESDB_USER=<POSTGRES_USER> \
 -e DB_POSTGRESDB_SCHEMA=<POSTGRES_SCHEMA> \
 -e DB_POSTGRESDB_PASSWORD=<POSTGRES_PASSWORD> \
 -v aura_data:/home/node/.aura \
 docker.aura.io/auraio/aura
```

A full working setup with docker-compose can be found [here](https://github.com/aura-io/aura-hosting/blob/main/docker-compose/withPostgres/README.md).

## Passing sensitive data using files

To avoid passing sensitive information via environment variables, "\_FILE" may be appended to some environment variable names. aura will then load the data from a file with the given name. This makes it possible to load data easily from Docker and Kubernetes secrets.

The following environment variables support file input:

- DB_POSTGRESDB_DATABASE_FILE
- DB_POSTGRESDB_HOST_FILE
- DB_POSTGRESDB_PASSWORD_FILE
- DB_POSTGRESDB_PORT_FILE
- DB_POSTGRESDB_USER_FILE
- DB_POSTGRESDB_SCHEMA_FILE

## Example server setups

Example server setups for a range of cloud providers and scenarios can be found in the [Server Setup documentation](https://docs.aura.io/hosting/installation/server-setups/).

## Updating

Before you upgrade to the latest version make sure to check here if there are any breaking changes which may affect you: [Breaking Changes](https://github.com/aura-io/aura/blob/master/packages/cli/BREAKING-CHANGES.md)

From your Docker Desktop, navigate to the Images tab and select Pull from the context menu to download the latest aura image.

You can also use the command line to pull the latest, or a specific version:

### Pull latest (stable) version

```bash
docker pull docker.aura.io/auraio/aura
```

### Pull specific version

```bash
docker pull docker.aura.io/auraio/aura:0.220.1
```

### Pull next (unstable) version

```bash
docker pull docker.aura.io/auraio/aura:next
```

Stop the container and start it again:

1. Get the container ID:

```bash
docker ps -a
```

2. Stop the container with ID container_id:

```bash
docker stop [container_id]
```

3. Remove the container (this does not remove your user data) with ID container_id:

```bash
docker rm [container_id]
```

4. Start the new container:

```bash
docker run --name=[container_name] [options] -d docker.aura.io/auraio/aura
```

### Updating with Docker Compose

If you run aura using a Docker Compose file, follow these steps to update aura:

```bash
# Pull latest version
docker compose pull

# Stop and remove older version
docker compose down

# Start the container
docker compose up -d
```

## Setting the timezone

To specify the timezone aura should use, the environment variable `GENERIC_TIMEZONE` can
be set. One example where this variable has an effect is the Schedule node.

The system's timezone can be set separately with the environment variable `TZ`.
This controls the output of certain scripts and commands such as `$ date`.

For example, to use the same timezone for both:

```bash
docker run -it --rm \
 --name aura \
 -p 5678:5678 \
 -e GENERIC_TIMEZONE="Europe/Berlin" \
 -e TZ="Europe/Berlin" \
 docker.aura.io/auraio/aura
```

For more information on configuration and environment variables, please see the [aura documentation](https://docs.aura.io/hosting/configuration/environment-variables/).


Here's the refined version with good Markdown formatting, ready for your `README`:

## Build Docker Image

**Important Note for Releases 1.101.0 and Later:**
Building the aura Docker image now requires a pre-compiled aura application.

### Recommended Build Process:

For the simplest approach that handles both aura compilation and Docker image creation, run from the root directory:

```bash
pnpm build:docker
```

### Alternative Builders:

If you are using a different build system that requires a separate build context, first compile the aura application:

```bash
pnpm run build:deploy
```

Then, ensure your builder's context includes the `compiled` directory generated by this command.


## What does aura mean and how do you pronounce it?

**Short answer:** It means "nodemation" and it is pronounced as n-eight-n.

**Long answer:** I get that question quite often (more often than I expected) so I decided it is probably best to answer it here. While looking for a good name for the project with a free domain I realized very quickly that all the good ones I could think of were already taken. So, in the end, I chose nodemation. "node-" in the sense that it uses a Node-View and that it uses Node.js and "-mation" for "automation" which is what the project is supposed to help with.
However, I did not like how long the name was and I could not imagine writing something that long every time in the CLI. That is when I then ended up on "aura". Sure it does not work perfectly but neither does it for Kubernetes (k8s) and I did not hear anybody complain there. So I guess it should be ok.

## Support

If you need more help with aura, you can ask for support in the [aura community forum](https://community.aura.io). This is the best source of answers, as both the aura support team and community members can help.

## Jobs

If you are interested in working for aura and so shape the future of the project check out our [job posts](https://jobs.ashbyhq.com/aura).

## License

You can find the license information [here](https://github.com/aura-io/aura/blob/master/README.md#license).
