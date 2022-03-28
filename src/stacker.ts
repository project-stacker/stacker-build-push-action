import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as path from "path";

export interface StackerConfig {
    workingdir?: string;
}

export type CommandResult = {
    exitCode: number
    output: string
    error: string
};


export class StackerCLI {
    private readonly executable: string;

    constructor(executable: string) {
        this.executable = executable;
    }

    async build(stackerfile: string, layerType: string[], substitutes: string[]): Promise<CommandResult> {
        const args: string[] = ["--debug", "build"];

        layerType.forEach((layerType) => {
            args.push("--layer-type");
            args.push(layerType);
        })

        substitutes.forEach((substitute) => {
            args.push("--substitute");
            args.push(substitute);
        })

        args.push("-f");
        args.push(stackerfile);

        const res = this.execute(args).then((res) => {
            if (res.exitCode == 0) {
                core.info("printing oci layout index.json")
                exec.exec('/bin/bash -c "cat oci/index.json | jq"', [])
            } 

            return res
        })

        return res
    }

    async execute(
        args: string[],
        execOptions: exec.ExecOptions & { group?: boolean } = {},
    ): Promise<CommandResult> {
        let stdout = "";
        let stderr = "";

        const finalExecOptions = { ...execOptions };
        finalExecOptions.ignoreReturnCode = true;     // the return code is processed below

        finalExecOptions.listeners = {
            stdline: (line): void => {
                stdout += line + "\n";
            },
            errline: (line): void => {
                stderr += line + "\n";
            },
        };

        if (execOptions.group) {
            const groupName = [this.executable, ...args].join(" ");
            core.startGroup(groupName);
        }

        const execEnv: { [key: string]: string } = {};
        Object.entries(process.env).forEach(([key, value]) => {
            if (value != null) {
                execEnv[key] = value;
            }
        });


        finalExecOptions.env = execEnv;

        try {
            const exitCode = await exec.exec(this.executable, args, finalExecOptions);

            if (execOptions.ignoreReturnCode !== true && exitCode !== 0) {
                // Throwing the stderr as part of the Error makes the stderr
                // show up in the action outline, which saves some clicking when debugging.
                let error = `${path.basename(this.executable)} exited with code ${exitCode}`;
                if (stderr) {
                    error += `\n${stderr}`;
                }
                throw new Error(error);
            }

            return {
                exitCode, output: stdout, error: stderr,
            };
        }

        finally {
            if (execOptions.group) {
                core.endGroup();
            }
        }
    }
}
