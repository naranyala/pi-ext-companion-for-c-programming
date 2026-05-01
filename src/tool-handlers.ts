import { Shell, SystemInfo } from "./shell";
import { PlatformAdapter } from "./platform";
import { CompanionState } from "./state";
import { DependencyManager } from "./dependencies";

export class ToolHandlers {
  private static async runToolWithCheck(cmd: string, args: string[] = [], fallbackMessage?: string): Promise<string> {
    const result = Shell.run(cmd, args);
    
    if (result.includes("Error executing") || result.includes("exited with code")) {
      const depInfo = DependencyManager.getDependencyInfo(cmd);
      if (depInfo) {
        const pkgManager = await SystemInfo.getPackageManager();
        let suggestion = "";
        if (pkgManager === "apt") suggestion = ` (try: sudo apt install -y ${depInfo.packages.apt})`;
        else if (pkgManager === "pacman") suggestion = ` (try: sudo pacman -S --noconfirm ${depInfo.packages.pacman})`;
        else if (pkgManager === "dnf") suggestion = ` (try: sudo dnf install -y ${depInfo.packages.dnf})`;
        else if (pkgManager === "brew") suggestion = ` (try: brew install ${depInfo.packages.brew})`;
        else if (pkgManager === "winget") suggestion = ` (try: winget install ${depInfo.packages.winget})`;
        
        return `❌ Tool '${cmd}' not found or failed to execute.${suggestion}\n${result}`;
      }
      return fallbackMessage ? `${fallbackMessage}\n${result}` : result;
    }
    
    return result;
  }

  static async findHeader(headerName: string): Promise<string> {
    const paths = PlatformAdapter.getIncludePaths();
    if (paths.length === 0) return "Could not determine system include paths.";

    for (const path of paths) {
      // Safe search using find
      const result = Shell.run("find", [path, "-name", headerName]);
      if (result && !result.includes("Error") && !result.includes("exited with code")) {
        return `Found ${headerName} at: ${result.split("\n")[0]}`;
      }
    }
    
    return `Could not find header ${headerName} in standard include paths.`;
  }

  static async readManPage(functionName: string, section: string = "3"): Promise<string> {
    const raw = await this.runToolWithCheck("man", [section, functionName], `No man page found for ${functionName} in section ${section}.`);
    
    if (raw.startsWith("❌") || raw.includes("No manual entry")) {
      return raw;
    }

    const { manPageCleaningLevel } = CompanionState.getConfig();
    if (manPageCleaningLevel === "none") return raw;

    const lines = raw.split("\n");
    const cleaned: string[] = [];
    let capture = true;

    for (const line of lines) {
      if (manPageCleaningLevel === "aggressive") {
        if (/^CONFORMING|^HISTORY|^AUTHOR|^SEE ALSO$/.test(line.toUpperCase())) {
          capture = false;
        }
      } else { // balanced
        if (/^CONFORMING|^AUTHOR$/.test(line.toUpperCase())) {
          capture = false;
        }
      }
      if (capture) cleaned.push(line);
    }

    return cleaned.join("\n");
  }

  static async searchSymbols(symbol: string): Promise<string> {
    const { symbolSearchLimit } = CompanionState.getConfig();
    const paths = PlatformAdapter.getIncludePaths();
    if (paths.length === 0) return "Could not determine system include paths.";

    const results: string[] = [];
    for (const path of paths) {
      const grepResult = Shell.runPipeline(`grep -rnE "\\b${symbol}\\b" ${path} 2>/dev/null | head -n ${symbolSearchLimit}`);
      if (grepResult) results.push(`Path ${path}:\n${grepResult}`);
    }

    return results.join("\n\n") || `No matches found for ${symbol} in standard headers.`;
  }

  static async searchProjectSymbols(symbol: string): Promise<string> {
    const result = Shell.runPipeline(`grep -rnE "\\b${symbol}\\b" . --include="*.c" --include="*.h" --include="*.cpp" --include="*.hpp" | head -n 50`);
    return result || `No occurrences of symbol '${symbol}' found in project files.`;
  }

  static async findProjectUsages(symbol: string): Promise<string> {
    const result = Shell.runPipeline(`grep -rnE "\\b${symbol}\\b" . --include="*.c" --include="*.h" --include="*.cpp" --include="*.hpp" | head -n 100`);
    return result || `No usages of symbol '${symbol}' found in project files.`;
  }

  static async analyzeDeps(binaryPath: string): Promise<string> {
    const { cmd, args } = PlatformAdapter.getBinaryDepsCmd();
    return await this.runToolWithCheck(cmd, args(binaryPath), "Failed to analyze binary dependencies.");
  }

  static async getBinarySymbols(binaryPath: string): Promise<string> {
    const result = await this.runToolWithCheck("nm", ["-C", binaryPath], "No symbols found or binary is stripped.");
    if (result.startsWith("❌")) return result;
    return result || "No symbols found or binary is stripped.";
  }

  static async disassembleFunction(binaryPath: string, functionName: string): Promise<string> {
    const symbols = await this.runToolWithCheck("nm", [binaryPath], `Could not list symbols for ${binaryPath}`);
    if (symbols.startsWith("❌")) return symbols;

    const match = symbols.split("\n").find(line => line.includes(functionName));
    if (!match) return `Function ${functionName} not found in binary.`;
    
    const address = match.split(/\s+/)[0];
    // Use objdump with -d (disassemble) and -C (demangle names)
    const result = await this.runToolWithCheck("objdump", ["-dC", binaryPath], `Could not disassemble ${binaryPath}`);
    if (result.startsWith("❌")) return result;

    const lines = result.split("\n");
    const startIdx = lines.findIndex(l => l.includes(address));
    if (startIdx === -1) return "Could not locate function address in disassembly.";
    
    // Take a wider window and filter out noise
    return lines.slice(Math.max(0, startIdx - 5), startIdx + 60).join("\n") + "\n... [end of window]";
  }

  static async debugCrash(binaryPath: string, args: string[] = []): Promise<string> {
    // Run GDB in batch mode: 
    // -batch: exit after commands
    // -ex "run": start the program
    // -ex "bt": if it crashes, print the backtrace
    const gdbArgs = ["-batch", "-ex", "run", "-ex", "bt", "--args", binaryPath, ...args];
    const result = await this.runToolWithCheck("gdb", gdbArgs, "Failed to run debugger.");
    
    if (result.startsWith("❌")) return result;

    if (result.includes("Program received signal")) {
      return `Crash detected! Backtrace:\n\n${result}`;
    }
    
    return result || "Program exited normally or GDB failed to capture a crash.";
  }

  static async runHealthCheck(projectRoot: string): Promise<string> {
    const results: string[] = [];
    
    // 1. Build system check
    const makefile = Shell.run("find", [projectRoot, "-maxdepth", "1", "-name", "Makefile"]);
    if (makefile) {
      results.push(`✅ Makefile found: ${makefile.split("\n")[0]}`);
    } else {
      results.push(`⚠️ No Makefile found in root.`);
    }

    // 2. Toolchain sanity
    const gcc = Shell.run("gcc", ["--version"]).split("\n")[0];
    results.push(`✅ Compiler: ${gcc}`);

    // 3. Quick static scan of the first .c/.cpp file found
    const sourceFile = Shell.run("find", [projectRoot, "-name", "*.c", "-o", "-name", "*.cpp", "|", "head", "-n", "1"]);
    if (sourceFile) {
      const analysis = await this.runStaticAnalysis(sourceFile.trim());
      results.push(`🔍 Static Analysis (${sourceFile.trim()}):\n${analysis}`);
    } else {
      results.push(`⚠️ No source files found to analyze.`);
    }

    return `C-Project Health Report:\n${"=".repeat(25)}\n${results.join("\n\n")}`;
  }

  static async analyzeMemoryLeaks(binaryPath: string, args: string[] = []): Promise<string> {
    const valgrindArgs = ["--leak-check=full", "--error-exitcode=1", binaryPath, ...args];
    const result = await this.runToolWithCheck("valgrind", valgrindArgs, "Failed to run Valgrind.");
    if (result.startsWith("❌")) return result;

    const summaryMatch = result.match(/LEAK SUMMARY:\s*[\s\S]*?total heap usage:.*?\n\n/);
    if (summaryMatch) return `Valgrind Leak Summary:\n${summaryMatch[0]}`;
    return `Valgrind finished. No standard leak summary found. Full output:\n${result.slice(-1000)}`;
  }

  static async runStaticAnalysis(filePath: string, tool: "cppcheck" | "clang-tidy" = "cppcheck"): Promise<string> {
    if (tool === "cppcheck") {
      const result = await this.runToolWithCheck("cppcheck", ["--enable=all", "--quiet", filePath], "Failed to run cppcheck.");
      if (result.startsWith("❌")) return result;
      return result || "No issues found by cppcheck!";
    } else {
      const result = await this.runToolWithCheck("clang-tidy", [filePath, "--", "-I/usr/include"], "Failed to run clang-tidy.");
      if (result.startsWith("❌")) return result;
      return result || "No issues found by clang-tidy!";
    }
  }

  static async parseMakefile(makefilePath: string): Promise<string> {
    const content = Shell.run("cat", [makefilePath]);
    if (!content) return "Makefile not found or empty.";
    const targets = content.split("\n").filter(line => /^[a-zA-Z0-9_-]+:/.test(line)).map(line => line.trim());
    return `Detected Makefile targets:\n${targets.join("\n")}`;
  }
}
