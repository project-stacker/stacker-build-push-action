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

export type ConvertResult = {
    stackerfile: string
    subfile: string
}

export class StackerCLI {
    private readonly executable: string;

    constructor(executable: string) {
        this.executable = executable;
    }

    async convertDockerfile(dockerfile: string): Promise<[Promise<CommandResult>, ConvertResult]> {
        const args: string[] = ["--debug"];

        const stackerfile = "stacker.yaml"
        const subfile = "stacker-subs.yaml"

        args.push("convert");
        args.push("--docker-file");
        args.push(dockerfile);

        args.push("--output-file");
        args.push(stackerfile);

        args.push("--substitute-file");
        args.push(subfile);

        const res = this.execute(args).then((res) => {
            if (res.exitCode == 0) {
                core.info("printing resulting stacker.yaml after converting dockerfile");
                exec.exec('/bin/bash -c "cat stacker.yaml"', []);
                
                core.info("printing resulting substitutes file after converting dockerfile");
                exec.exec('/bin/bash -c "cat stacker-subs.yaml"', []);
            } 

            return res;
        })

        const cres : ConvertResult = {
            stackerfile: stackerfile,
            subfile: subfile,
        }

        return [res, cres];
    }

    async build(stackerfile: string, cachedir: string, stackerdir: string, stackerfilePattern: string,
        layerType: string[], substitutes: string[], subfile: string): Promise<CommandResult> {
        const args: string[] = ["--debug"];

        args.push("--stacker-dir");
        args.push(cachedir);

        if (stackerdir) {
            args.push("recursive-build");
            args.push("--search-dir");
            args.push(stackerdir);
            args.push("--stacker-file-pattern");
            args.push(stackerfilePattern);
        } else {
            args.push("build")
            args.push("-f");
            args.push(stackerfile);
        }

        layerType.forEach((layerType) => {
            args.push("--layer-type");
            args.push(layerType);
        })

        substitutes.forEach((substitute) => {
            args.push("--substitute");
            args.push(substitute);
        })

        if (subfile) {
            args.push("--substitute-file");
            args.push(subfile);
        }

        const res = this.execute(args).then((res) => {
            if (res.exitCode == 0) {
                core.info("printing oci layout index.json");
                exec.exec('/bin/bash -c "cat oci/index.json | jq"', []);
            } 

            return res;
        })

        return res;
    }

    async publish(stackerfile: string, cachedir: string, stackerdir: string, stackerfilePattern: string, layerType: string[], substitutes: string[],
        subfile: string, url: string, tags: string[], username: string, password: string, skipTLS: boolean): Promise<CommandResult> {
        const args: string[] = ["--debug"];

        args.push("--stacker-dir");
        args.push(cachedir);

        args.push("publish");

        layerType.forEach((layerType) => {
            args.push("--layer-type");
            args.push(layerType);
        })

        substitutes.forEach((substitute) => {
            args.push("--substitute");
            args.push(substitute);
        });

        if (subfile) {
            args.push("--substitute-file");
            args.push(subfile);
        }

        args.push("--url");
        args.push(url);

        tags.forEach((tag) => {
            args.push("--tag");
            args.push(tag);
        })

        if (username) {
            args.push("--username");
            args.push(username);
        }

        if (password) {
            args.push("--password");
            args.push(password);
        }

        if (skipTLS) {
            args.push("--skip-tls");
        }

        if (stackerdir) {
            args.push("--search-dir");
            args.push(stackerdir);
            args.push("--stacker-file-pattern");
            args.push(stackerfilePattern);
        } else {
            args.push("-f");
            args.push(stackerfile); 
        }

        return this.execute(args);
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
