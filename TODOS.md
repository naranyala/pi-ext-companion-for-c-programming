# C-Programming Companion - Project Status & Roadmap

## 🏗️ Current Architecture & Abstractions

The project is structured as a professional C/C++ systems engineering extension for the `pi` coding agent.

### 🧩 Core Abstractions
- **`Shell` (`src/shell.ts`)**: Secure execution wrapper using `spawnSync`. Minimizes shell injection risks.
- **`PlatformAdapter` (`src/platform.ts`)**: Handles OS-level differences (Linux `ldd` vs macOS `otool`, include path discovery).
- **`CompanionState` (`src/state.ts`)**: Centralized configuration management (search limits, cleaning levels).
- **`DependencyManager` (`src/dependencies.ts`)**: Automated auditing and installation advice for system tools.
- **`ToolHandlers` (`src/tool-handlers.ts`)**: Logic bridge between the AI tools and the underlying system commands.

### 🛠️ Feature Modules
- **Introspection**: `find_c_header`, `search_c_symbols`, `c-env` (command).
- **Binary Analysis**: `get_binary_symbols`, `disassemble_function`, `analyze_binary_deps`.
- **Debugging**: `debug_crash` (GDB automation), `analyze_memory_leaks` (Valgrind integration).
- **Quality Control**: `run_static_analysis` (cppcheck), `run_health_check` (project audit).
- **Build Systems**: `parse_makefile` (target discovery).

---

## 🚦 Feature Validation & Reliability

### 🟢 Stable (Production Ready)
- [x] **Symbol & Header Search**: High reliability; maps to `find` and `grep`.
- [x] **Binary Introspection**: Consistent results with `nm` and `objdump`.
- [x] **Static Analysis**: `cppcheck` integration is robust.
- [x] **Man Pages**: Reliable boilerplate removal for standard `man-db` outputs.

### 🟡 Experimental (Unstable/Context-Dependent)
- [ ] **GDB Batch Debugging**: Sensitive to debug symbols and environment state. Batch-only mode.
- [ ] **Memory Leaks**: `valgrind` is slow and resource-heavy; prone to timeouts on large binaries.
- [ ] **Makefile Parsing**: Primitive regex-based; will fail on complex/recursive Makefiles.

### 🔴 Known Limitations
- [ ] **Interactive Debugging**: Impossible to step through code or set breakpoints in real-time.
- [ ] **Persistent Build Monitoring**: No "watch" mode for long-running builds.

---

## 🐛 Potential Bugs & Technical Debt

### 🪲 Potential Bugs
- [ ] **`Shell.runPipeline`**: Uses `execSync` for pipes, which is slightly more risky than `spawnSync` and lacks fine-grained error control.
- [ ] **Disassembly Window**: `disassemble_function` uses a hardcoded 60-line window; may miss context for large functions.
- [ ] **Platform Detection**: `PlatformAdapter.getIncludePaths` depends on `gcc -v` output format, which might vary by compiler version.
- [ ] **Makefile Regex**: Current target detection (`/^[a-zA-Z0-9_-]+:/`) is too simple for professional Makefiles.

### 🏗️ Technical Debt
- [ ] **Architectural Split**: The project has a `src/core` and `src/features` folder with a class-based registry system, but `src/index.ts` currently uses a flat procedural registration.
- [ ] **Unused Code**: `HelloFeature` and `PingFeature` are currently present but not loaded in the main entry point.
- [ ] **Test Coverage**: While basic handlers are tested, integration tests for complex tools (GDB, Valgrind) are currently mocked or missing.

---

## 🚀 Future Roadmap

### 🟡 Native Toolchain Integration (Rust Alternatives)
*Proposed transition to high-performance, structured CLI tools.*
- [ ] **`pi-c-search`**: Rust-based engine for high-speed, JSON-structured symbol and header search.
- [ ] **`pi-c-inspect`**: Native ELF/Mach-O parser to replace `nm`/`objdump` and `ldd`/`otool`.
- [ ] **`pi-c-doc`**: Advanced document processor for man pages (Markdown/JSON output).
- [ ] **`pi-c-audit`**: Unified project scanner for build systems and health checks.

### 🟡 Maintenance & Enhancements
- [ ] **Refactor to Registry**: Migrate `src/index.ts` to use the `FeatureRegistry` in `src/core`.
- [ ] **C++ Explicit Support**: Enhance toolchain to better handle `g++`, `clang++`, and C++ name demangling.
- [ ] **Smart Fix Suggestions**: Pipe static analysis errors into a dedicated prompt for automated code fixes.
- [ ] **CMake/Meson Support**: Add first-class support for modern C/C++ build systems beyond just Makefiles.
