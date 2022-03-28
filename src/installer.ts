import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import { Octokit } from "octokit";
import path from "path";
import { stackerBin, stackerRepo, stackerOrg } from "src";


export async function resolveReleaseData() {
    let version = core.getInput('version');
    let token = core.getInput('token');

    const octokit = new Octokit();

    let releaseData: any = {}

    if ((!version) || (version.toLowerCase() === 'latest')) {
        core.info("Get release info for latest version")
        releaseData = await octokit.rest.repos.getLatestRelease({
            "owner": stackerOrg,
            "repo": stackerRepo,
            "header": {
                authorization: `token ${token}`,
            }
        });
    } else {
        core.info(`Get release info for release ${version}`)
        releaseData = await octokit.rest.repos.getReleaseByTag({
            "owner": stackerOrg,
            "repo": stackerRepo,
            "tag": version,
        });
    }

    return releaseData.data
}

export async function downloadStacker(releaseData) {
    core.info(`Downloading ${stackerBin} from ${releaseData.html_url}`)
    let token = core.getInput('token');

    let asset = releaseData.assets.find(obj => {
        return obj.name == stackerBin
    })

    const toolDownload = await tc.downloadTool(
        asset.url,
        undefined,
        `token ${token}`,
        {
            accept: 'application/octet-stream'
        }
    );
    return toolDownload;
}

export async function makeAvailableInPath(download, version) {
    core.info(`Cache file ${download} and rename to generic name`);
    const cachedPath = await tc.cacheFile(download, stackerBin, stackerBin, version);
    const filePath = path.join(cachedPath, stackerBin)

    core.info(`Making ${stackerBin} binary executable`);
    await exec.exec("chmod", ["+x", filePath]);

    core.info(`Make ${cachedPath} available in path`);
    core.addPath(cachedPath);
}

