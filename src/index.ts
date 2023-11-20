import * as core from "@actions/core";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";

import { StackerCLI } from "./stacker";
import * as installer from "./installer";
import * as utils from "./utils";

export const stackerBin = "stacker";
export const stackerOrg = "project-stacker";
export const stackerRepo = "stacker";

export async function run(): Promise<void> {
    if (process.env.RUNNER_OS !== "Linux") {
        throw new Error("stacker, and therefore this action, only works on Linux. Please use a Linux runner.");
    }

    let releaseData = await installer.resolveReleaseData();
    let version = releaseData.tag_name

    core.info(`Installing stacker version: ${version}`);

    // check cache (works just for the same run, not between)
    let path = tc.find(stackerBin, version);
    if (!path) {
        let download = await installer.downloadStacker(releaseData);
        await installer.makeAvailableInPath(download, version);
        core.info(`${stackerBin} version ${version} installed successfully`);
    } else {
        core.info(`${stackerBin} version ${version} already installed`)
    }

    // get stacker cli
    const stackerPath = await io.which(stackerBin, true);
    const cli: StackerCLI = new StackerCLI(stackerPath);

    // print stacker version
    await cli.execute(["--version"], { group: true });

    // get stacker cache dir
    const cachedir = core.getInput("cache-dir");

    // get stacker file path from input
    var stackerfile = core.getInput("file");

    // get dockerfile path from input if any
    const dockerfile = core.getInput('dockerfile');

    // get stacker dir to recursive search for stacker files
    const stackerdir = core.getInput("dir");

    // get stacker file pattern
    const stackerfilePattern = core.getInput("file-pattern");

    // get build-args from input
    const substitutes = utils.getInputList("build-args");

    // get build-args file from input
    var subfile = core.getInput("build-args-file");

    // get layer-type from input
    const layerTypes = utils.getSpaceSeparatedInput("layer-type");

    if (dockerfile) {
        let [cmdRes, convertRes] = await cli.convertDockerfile(dockerfile);

        if (convertRes && (await cmdRes).exitCode == 0) {
            // update stackerfile, subfile values
            stackerfile = convertRes.stackerfile;
            subfile = convertRes.subfile;
        }   
    }

    await cli.build(stackerfile, cachedir, stackerdir, stackerfilePattern, layerTypes, substitutes, subfile);

    const registryURL = core.getInput("url");
    if (registryURL) {
        // get tags from input
        const tags = utils.getSpaceSeparatedInput("tags");
        const username = core.getInput("username");
        const password = core.getInput("password");
        const skipTLS = core.getInput("skip-tls") === "true";
    
        await cli.publish(stackerfile, cachedir, stackerdir, stackerfilePattern, layerTypes, substitutes, subfile,
            registryURL, tags, username, password, skipTLS);
    }
}

run().catch(core.setFailed);
