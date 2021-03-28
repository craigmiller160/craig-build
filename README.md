# craig-build

A special, lightweight build utility designed to build and deploy any project of mine to my ecosystem.

## Setup

These environment variables must exist on the host system:

```
NEXUS_DOCKER_USER
NEXUS_DOCKER_PASSWORD
```

## How to Use

Make sure the repository is properly set to Nexus.

Install it with `npm i -g @craigmiller160/craig-build`.

Then use `craig-build -h` to see available commands.

## How to Update

Run `npm update -g @craigmiller160/craig-build`

## Project Types

### NpmApplication
```
/
    deploy/
        Dockerfile
        deployment.yml
    package.json
```
Optional `configmap.yml` can be included in `deploy` directory.

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
Optional `configmap.yml` can be included in `deploy` directory

### MavenLibrary
```
/
    pom.xml
```