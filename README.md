# stacker-build-action
# [![ci](https://github.com/project-stacker/stacker-build-action/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/project-stacker/stacker-build-action/actions)

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
| version | stacker version to use | latest


Example:

```
- name: Run stacker-build
  uses: project-stacker/stacker-build-action@main
  with:
    stackerfile: 'test/stacker.yaml'
    substitutes: 'SUB1=VAR1 SUB2=VAR2 SUB3=VAR3'
    layer-type: 'tar squashfs'
```
