# stacker-build-push-action
# [![ci](https://github.com/project-stacker/stacker-build-push-action/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/project-stacker/stacker-build-push-action/actions)

stacker build action builds OCI container images via a declarative yaml format.

stacker only works on Linux

For more information about stacker tool see: https://github.com/project-stacker/stacker


## Action Inputs

<a id="dockerfile-build-inputs"></a>

| Input Name | Description | Default |
| ---------- | ----------- | ------- |
| stackerfile | the yaml file to be built as an OCI image, example: [stacker.yaml](./test/stacker.yaml)  | stacker.yaml
| layer-type | output layer type (supported values: tar, squashfs), ca be both separated by whitespace | tar
| substitutes | variable substitution in stackerfile, see [stacker.yaml doc](https://github.com/project-stacker/stacker/blob/master/doc/stacker_yaml.md) | None
| url | remote OCI registry | None
| tags | one or more tags to give the new image, eparated by whitespace | None
| username | used to login to registry | None
| username | used to login to registry | None
| skip-tls | used with unsecure (http) registries | false


Build only example:

```
- name: Run stacker-build
  uses: project-stacker/stacker-build-push-action@main
  with:
    stackerfile: 'test/stacker.yaml'
    substitutes: 'SUB1=VAR1 SUB2=VAR2 SUB3=VAR3'
    layer-type: 'tar squashfs'
```

Build and push example to ghcr.io:

```
- name: Run stacker-build
  uses: project-stacker/stacker-build-push-action@main
  with:
    stackerfile: 'test/stacker.yaml'
    substitutes: 'SUB1=VAR1 SUB2=VAR2 SUB3=VAR3'
    layer-type: 'tar squashfs'
    url: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
    skip-tls: true
```

Build and push example to localhost:

```
- name: Run stacker-build
  uses: project-stacker/stacker-build-push-action@main
  with:
    stackerfile: 'test/stacker.yaml'
    substitutes: 'SUB1=VAR1 SUB2=VAR2 SUB3=VAR3'
    layer-type: 'tar squashfs'
    url: localhost:5000
    skip-tls: true
```
