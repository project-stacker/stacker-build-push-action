<p align="center">
    <img src="https://github.com/project-stacker/assets/blob/main/images/logo/stacker-logo-text.png" alt="stacker" height="130"/>
</p>

# Stacker Build and Push Action
# [![ci](https://github.com/project-stacker/stacker-build-push-action/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/project-stacker/stacker-build-push-action/actions)

```stacker-build-push-action``` natively builds OCI container images via a declarative yaml format using [`stacker`](https://github.com/project-stacker/stacker) and publishes them to OCI conformant registries.


For more information about stacker tool see: https://github.com/project-stacker/stacker

## Action Inputs

<a id="build-inputs"></a>

| Input Name | Type |  Description | Default |
| ---------- | ---- |----------- | ------- |
| file | string | path to yaml file to be built as an OCI image, example: [stacker.yaml](./test/stacker.yaml)  | stacker.yaml
| dockerfile| string | path to dockerfile to be build as an OCI image(instead of stacker.yaml) | None 
| cache-dir | string | stacker's cache directory | ./.stacker
| dir  | string | directory under which to recursive search for stackerfiles to build, use either file or dir | None
| file-pattern| string | regex pattern to use when searching for stackerfile paths, used only with dir arg | \\/stacker.yaml$
| layer-type | list | output layer type (supported values: tar, squashfs), ca be both separated by whitespace | tar
| build-args | list | the list of build-time arguments (subtitutes) separated by newline FOO=bar format, see [stacker.yaml doc](https://github.com/project-stacker/stacker/blob/master/doc/stacker_yaml.md) | None
| build-args-file | string | path to yaml file where build-args are set 'FOO: bar' yaml format | None
| url | string | remote OCI registry + repo name eg: docker://ghcr.io/project-stacker/ | None
| tags | list | one or more tags to give the new image, separated by whitespace | None
| username | string | used to login to registry | None
| password | string | used to login to registry | None
| skip-tls | bool | used with unsecure (http) registries | false
| token    | string | github token used to authenticate against a repository for Git context | ${{ github.token }}
| version | string | stacker version, see [stacker releases](https://github.com/project-stacker/stacker/releases) | v1.0.0-rc8



Build only example:

```
- name: Run stacker-build
  uses: project-stacker/stacker-build-push-action@main
  with:
    file: 'test/stacker.yaml'
    build-args: |
      SUB1=VAR1
      SUB2=VAR2
      SUB3=VAR3
    layer-type: 'tar squashfs'
```


Publish url is built according to the next logic:
```
input.url + stacker.yaml container name + : + input.tag
```

Build and push example to ghcr.io:

```
- name: Run stacker-build
  uses: project-stacker/stacker-build-push-action@main
  with:
    file: 'test/stacker.yaml'
    build-args: |
      SUB1=VAR1
      SUB2=VAR2
      SUB3=VAR3
    layer-type: 'tar squashfs'
    tags: ${{ github.event.release.tag_name }} latest
    url: docker://ghcr.io/${{ github.repository }}
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

The above action will build test/stacker.yaml and push it to
1. docker://ghcr.io/project-stacker/stacker/test:latest
2. docker://ghcr.io/project-stacker/stacker/test:${{ github.event.release.tag_name }}

Build and push example to localhost:

```
- name: Run stacker-build
  uses: project-stacker/stacker-build-push-action@main
  with:
    file: 'test/stacker.yaml'
    build-args: |
      SUB1=VAR1
      SUB2=VAR2
      SUB3=VAR3
    layer-type: 'tar squashfs'
    url: docker://localhost:5000
    skip-tls: true
    tags: test
```

The above action will build test/stacker.yaml and push it to
1. docker://localhost:5000/test:test


Build and push a Dockerfile:

```
- name: Run stacker-build with a Dockerfile
  uses: ./
  with:
    dockerfile: 'test/Dockerfile.yaml'
    tags: v1 latest
    url: docker://localhost:5000/four/app
    layer-type: 'tar squashfs'
    skip-tls: true
```


Build recursively all stacker files under dir/ and push all:

```
- name: Run stacker recursive-build
  uses: ./
  with:
    dir: 'test/builds'
    tags: v2
    url: docker://localhost:5000/five/app
    layer-type: 'tar squashfs'
    skip-tls: true
```
