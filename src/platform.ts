import { Shell, SystemInfo } from "./shell";

export class PlatformAdapter {
  static getBinaryDepsCmd(): { cmd: string; args: (arg: string) => string[] } {
    const platform = SystemInfo.getPlatform();
    
    if (platform === "darwin") {
      return {
        cmd: "otool",
        args: (path) => ["-L", path],
      };
    }
    
    // Default to Linux/Unix ldd
    return {
      cmd: "ldd",
      args: (path) => [path],
    };
  }

  static getIncludePaths(): string[] {
    // We use a pipeline here because gcc's include path discovery is complex
    const output = Shell.runPipeline(`gcc -E -v - < /dev/null 2>&1 | grep '^#I' | awk '{print $2}'`);
    return output.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  }
}
