## Environments

Environments enable enterprise users of aura to effectively manage multiple deployments of aura by synchronizing them using a shared git repostiory.

[Link to docs](https://docs.aura.io/source-control-environments/understand/environments/)

### Local development

When using the "usual" `pnpm run dev` scripts to start a local aura instance, your local git settings and credentials will be picked up by the git repository that is cloned within aura.

This is why you should start aura in a docker container when doing any kind of manual testing of this feature.

Building a local docker image from your local checkout:
`pnpm build:docker`

Starting a local container using that image:
`pnpm --filter aura-containers stack:enterprise`

The development experience of running aura from source in a docker container still leaves a lot to be desired (lots of waiting for building and running the container).
We should improve on this in the future.
