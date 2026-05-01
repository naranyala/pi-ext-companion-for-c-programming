import { execSync } from "child_process";
import { Shell } from "./shell";

export async function isCProject(projectRoot: string = "."): Promise<boolean> {
  const files = Shell.run("find", [projectRoot, "-maxdepth", "2", "-name", "*.[ch]"]);
  return files.trim().length > 0;
}

export async function getCEnvironmentSummary(): Promise<string> {
// ... (rest of the file)
  const results: string[] = [];
  const tools = ["gcc", "clang", "make", "gdb", "valgrind", "nm", "ldd", "objdump", "cpp"];

  for (const tool of tools) {
    try {
      const ver = Shell.run(tool, ["--version"]).split("\n")[0];
      results.push(`${tool}: ${ver}`);
    } catch {
      results.push(`${tool}: Not found`);
    }
  }

  return results.join("\n");
}
