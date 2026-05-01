import { Shell, SystemInfo } from "./shell";

export type PackageManager = "apt" | "pacman" | "dnf" | "brew" | "winget" | "unknown";

export interface DependencyItem {
  name: string;
  essential: boolean;
  packages: Record<PackageManager, string>;
}

export class DependencyManager {
  private static dependencies: Record<string, DependencyItem> = {
    gcc: { name: "gcc/clang", essential: true, packages: { apt: "build-essential", pacman: "gcc", dnf: "gcc", brew: "gcc", winget: "msys2", unknown: "" } },
    man: { name: "man-db", essential: false, packages: { apt: "man-db", pacman: "man-db", dnf: "man-db", brew: "man-db", winget: "", unknown: "" } },
    make: { name: "make", essential: false, packages: { apt: "build-essential", pacman: "make", dnf: "make", brew: "make", winget: "make", unknown: "" } },
    nm: { name: "binutils (nm)", essential: false, packages: { apt: "binutils", pacman: "binutils", dnf: "binutils", brew: "binutils", winget: "", unknown: "" } },
    objdump: { name: "binutils (objdump)", essential: false, packages: { apt: "binutils", pacman: "binutils", dnf: "binutils", brew: "binutils", winget: "", unknown: "" } },
    gdb: { name: "gdb", essential: false, packages: { apt: "gdb", pacman: "gdb", dnf: "gdb", brew: "gdb", winget: "gdb", unknown: "" } },
    valgrind: { name: "valgrind", essential: false, packages: { apt: "valgrind", pacman: "valgrind", dnf: "valgrind", brew: "valgrind", winget: "", unknown: "" } },
    cppcheck: { name: "cppcheck", essential: false, packages: { apt: "cppcheck", pacman: "cppcheck", dnf: "cppcheck", brew: "cppcheck", winget: "cppcheck", unknown: "" } },
    clangTidy: { name: "clang-tidy", essential: false, packages: { apt: "clang-tidy", pacman: "clang", dnf: "clang", brew: "llvm", winget: "llvm", unknown: "" } },
  };

  static getDependencyInfo(cmd: string) {
    // Map command to its dependency entry
    if (cmd === "clang-tidy") return this.dependencies.clangTidy;
    return this.dependencies[cmd as keyof typeof this.dependencies];
  }

  static async checkAll(): Promise<string> {
    const platform = SystemInfo.getPlatform();
    const pkgManager = await SystemInfo.getPackageManager();
    const missing: string[] = [];
    const installed: string[] = [];
    const installCmds: string[] = [];

    for (const [key, dep] of Object.entries(this.dependencies)) {
      const cmd = key === "clangTidy" ? "clang-tidy" : key;
      const check = Shell.run(cmd, ["--version"]);
      
      if (check.includes("Error") || check.includes("exited with code")) {
        missing.push(dep.name);
        const pkg = dep.packages[pkgManager as keyof typeof dep.packages] || dep.packages.unknown;
        if (pkg) {
          installCmds.push(pkg);
        }
      } else {
        installed.push(dep.name);
      }
    }

    let output = `📦 Dependency Audit Report\n${"=".repeat(25)}\n`;
    output += `✅ Installed: ${installed.join(", ") || "None"}\n`;
    output += `❌ Missing: ${missing.join(", ") || "None"}\n`;

    if (missing.length > 0) {
      const uniqueCmds = [...new Set(installCmds)];
      if (pkgManager === "apt") {
        output += `\n💡 Suggestion: sudo apt update && sudo apt install -y ${uniqueCmds.join(" ")}`;
      } else if (pkgManager === "brew") {
        output += `\n💡 Suggestion: brew install ${uniqueCmds.join(" ")}`;
      } else if (pkgManager === "pacman") {
        output += `\n💡 Suggestion: sudo pacman -S --noconfirm ${uniqueCmds.join(" ")}`;
      } else if (pkgManager === "dnf") {
        output += `\n💡 Suggestion: sudo dnf install -y ${uniqueCmds.join(" ")}`;
      } else if (pkgManager === "winget") {
        output += `\n💡 Suggestion: winget install ${uniqueCmds.join(" ")}`;
      } else {
        output += `\n⚠️ No automatic installation command available for your package manager (${pkgManager}). Please install the missing tools manually.`;
      }
    }

    return output;
  }
}
