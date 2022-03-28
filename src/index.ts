import * as core from "@actions/core";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";

import { StackerCLI } from "./stacker";
import * as installer from "./installer";

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
    const stackerPath = await io.which("stacker", true);
    const cli: StackerCLI = new StackerCLI(stackerPath);

    // print stacker version
    await cli.execute(["--version"], { group: true });

    // get stacker file path from input
    const stackerfile = core.getInput("stackerfile");

    // get substitutes from input
    var substitutesList: string[] = [];
    const substitutes = core.getInput("substitutes");
    if (substitutes != "") {
        substitutesList = substitutes.trim().split(/\s+/);
    }

    var layerTypeList: string[] = [];
    const layerType = core.getInput("layer-type");
    if (layerType != "") {
        layerTypeList = layerType.trim().split(/\s+/);
    }

    await cli.build(stackerfile, layerTypeList, substitutesList);

    
}

run().catch(core.setFailed);
