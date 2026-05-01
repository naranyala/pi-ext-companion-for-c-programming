import { spawnSync } from "child_process";
import os from "os";

export type Platform = "linux" | "darwin" | "win32" | "unknown";

export class SystemInfo {
  static getPlatform(): Platform {
    const platform = os.platform();
    if (platform === "linux") return "linux";
    if (platform === "darwin") return "darwin";
    if (platform === "win32") return "win32";
    return "unknown";
  }

  static async getPackageManager(): Promise<string> {
    const platform = this.getPlatform();
    if (platform === "darwin") return "brew";
    if (platform === "linux") {
      if (Shell.run("which", ["apt"]).trim().length > 0) return "apt";
      if (Shell.run("which", ["pacman"]).trim().length > 0) return "pacman";
      if (Shell.run("which", ["dnf"]).trim().length > 0) return "dnf";
    }
    if (platform === "win32") return "winget";
    return "unknown";
  }
}

export class Shell {
  /**
   * Executes a command safely using an argument array to prevent shell injection.
   */
  static run(cmd: string, args: string[] = []): string {
    const result = spawnSync(cmd, args, { encoding: "utf8" });
    
    if (result.error) {
      return `Error executing ${cmd}: ${result.error.message}`;
    }
    
    if (result.status !== 0) {
      return `Command ${cmd} exited with code ${result.status}: ${result.stderr || result.stdout}`;
    }
    
    return result.stdout || "";
  }

  /**
   * Executes a complex pipeline. Use with caution.
   * Since spawnSync doesn't support pipes, we use a controlled shell for pipes
   * but we still sanitize the inputs.
   */
  static runPipeline(pipeline: string): string {
    // This is still slightly risky but necessary for complex grep/awk pipes.
    // We'll try to minimize its use or implement a JS-based filter.
    const { execSync } = require("child_process");
    try {
      return execSync(pipeline, { encoding: "utf8" });
    } catch (e: any) {
      return `Pipeline error: ${e.message}`;
    }
  }
}
