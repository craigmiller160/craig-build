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

## A Note on Gradle

Gradle builds require the `craig-build-gradle-tool`, which is automatically downloaded upon install. It also requires `gradle-init` to have been setup on the machine `craig-build` is being run on.

NOTE: There may be an issue where the `craig-build-gradle-tool` only installs properly when installing from the repo, rather than installing the artifact directly. Since they both use the same tool version, any problems have been masked until now.

## Project Types

### NpmApplication
```
/
    deploy/
        Dockerfile
        chart/
            Chart.yaml
    package.json
```

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
        chart/
            Chart.yaml
    pom.xml
```

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
        chart/
            Chart.yaml
    docker.json
```

### Gradle Library

This is building a library using Gradle.

```
# Groovy
/
    build.gradle

# Kotlin
/
    build.gradle.kts
```

### Gradle Application

This is building and deploying an application using Gradle.

```
# Groovy
/
    deploy/
        Dockerfile
        chart/
            Chart.yaml
    build.gradle

# Kotlin
/
    deploy/
        Dockerfile
        chart/
            Chart.yaml
    build.gradle.kts
```

### Helm Library or Application

This is building and deploying a Helm Chart as a library or as an application in Kubernetes. The difference is determined in the `helm.json` file, see the documentation below.

```
/
    deploy/
        chart/
            Chart.yaml
    helm.json
```

## Custom Configuration Files

Some of the project types use custom configuration files I designed. Here is a summary of them.

## Docker Projects

Docker-only projects use a `docker.json` file with the following simple structure:

```json
{
  "name": "the-name",
  "version": "1.0.0"
}
```

Pre-release versions have a `-beta` suffix.

## Helm Projects

Helm-only projects contain a special `helm.json` file that provides special details on the Helm operations that must be performed. Here is its structure:

```json
{
  "name": "the-name",
  "version": "1.0.0",
  "type": "library",
  "namespace": "infra-prod",
  "setValues": {
    "hello": "world"
  }
}
```

| Property  | Description                                                |
|-----------|------------------------------------------------------------|
| type      | The type of Helm project. Either a library or application. |
| namespace | The k8s namespace to deploy to.                            |
| setValues | Helm values to set via CLI arguments.                      |
