# craig-build

A special, lightweight build utility designed to build and deploy any project of mine to my ecosystem.

## Setup

These environment variables must exist on the host system:

```
NEXUS_USER
NEXUS_PASSWORD
```

## How to Use

Make sure the repository is properly set to Nexus.

Install it with `npm i -g @craigmiller160/craig-build`.

Then use `craig-build -h` to see available commands.

## Commands

`-b (Full Build)` = Run a full build. This creates and (if necessary) deploys a brand new artifact.

`-d (Docker Only)` = Assumes that there is already an artifact in Nexus (if an artifact is needed). Runs only the docker build and kubernetes deploy steps.

`-k (Kubernetes Only)` = Assumes that there is already a Docker image in Nexus. Runs only the kubernetes deploy steps.

## How to Update

Run `npm i -g @craigmiller160/craig-build`. A full re-install tends to update it best.

## Project Types

### NpmApplication
```
/
    deploy/
        Dockerfile
        deployment.yml
    package.json
```
Optional configmaps can be included in `deploy` directory. All configmaps must match `{name}.configmap.yml`.

### NpmLibrary
```
/
    package.json
```

### MavenApplication
```
/
    deploy/
        Dockerfile
        deployment.yml
    pom.xml
```
Optional configmaps can be included in `deploy` directory. All configmaps must match `{name}.configmap.yml`.

### MavenLibrary
```
/
    pom.xml
```

### DockerImage

This is building a docker image directly, without an artifact involved. This requires a custom `docker.json` file with the project name/version in it. The format of these two properties matches the NPM `package.json`.

```
/
    deploy/
        Dockerfile
    docker.json
```

### DockerApplication

This is building a docker application directly, without an artifact involved. This requires a custom `docker.json` file with the project name/version in it. The format of these two properties matches the NPM `package.json`.

```
/
    deploy/
        Dockerfile
        deployment.yml
    docker.json
```

Optional configmaps can be included in `deploy` directory. All configmaps must match `{name}.configmap.yml`.
