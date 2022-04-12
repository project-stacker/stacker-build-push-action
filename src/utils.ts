import * as core from "@actions/core";

export function splitByNewline(s: string): string[] {
    return s.split(/\r?\n/);
}

export function getInputList(name: string): string[] {
    const items = core.getInput(name);
    if (!items) {
        return [];
    }
    const splitItems = splitByNewline(items);
    return splitItems
        .reduce<string[]>(
            (acc, line) => acc.concat(line).map((item) => item.trim()),
            [],
        );
}

export function getSpaceSeparatedInput(name: string): string[] {
    const items = core.getInput(name);
    if (items.length === 0) {
        core.debug("empty");
        return [];
    }
    const splitItems = items.trim().split(/\s+/);

    return splitItems
        .reduce<string[]>(
            (acc, line) => acc.concat(line).map((item) => item.trim()),
            [],
        );
}
