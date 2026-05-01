# C-Programming Companion for pi

The C-Programming Companion is a specialized extension for the pi coding agent designed to accelerate the development, debugging, and refactoring of C and C++ codebases. It provides a suite of professional-grade tools that integrate directly into the agent's workflow, enabling deep inspection of system headers, binary analysis, and automated project health checks.

## Core Capabilities

### Codebase Indexing and Searching
- **Project Symbol Search**: Locate function, macro, or struct definitions within the current project using optimized pattern matching.
- **Usage Analysis**: Identify all occurrences and usages of a specific symbol across all source and header files in the project.
- **System Header Discovery**: Quickly find the absolute path of standard C library headers on your system.

### Debugging and Binary Analysis
- **Memory Leak Detection**: Integrated Valgrind support to provide concise heap usage and leak summaries.
- **Crash Analysis**: Automated GDB integration that captures and presents meaningful backtraces upon program crashes.
- **Binary Symbol Inspection**: Utilize `nm` to list symbols within compiled binaries.
- **Disassembly**: View assembly code for specific functions within a binary using `objdump`.
- **Dependency Mapping**: Analyze shared library dependencies of compiled binaries using `ldd` or `otool`.

### Quality Assurance and Health
- **Static Analysis**: Support for `cppcheck` and `clang-tidy` to detect potential bugs and style violations.
- **Project Health Audits**: A comprehensive command to verify the build system (Makefile detection), toolchain sanity (compiler verification), and source file integrity.
- **Makefile Parsing**: Extract build targets and dependencies directly from Makefiles to assist in build automation.

## Automated Environment Support

The extension features an intelligent environment awareness system:
- **Multi-Platform Support**: Optimized for Linux (apt, pacman, dnf), macOS (Homebrew), and Windows (winget).
- **Automated Dependency Auditing**: Detects missing required tools and provides exact installation commands for your specific package manager.
- **Automatic Activation**: Detects C/C++ projects based on file presence and notifies the agent to activate specialized toolsets.

## Installation

To install the C-Programming Companion, follow these steps:

```bash
pi install git:github.com/naranyala/pi-ext-c-programming-companion
```

## Configuration

The extension is highly configurable to suit different development environments.

### Configuration Options
Users can adjust the companion's behavior via the `companion_configure` tool:
- **Cleaning Level**: Adjust the verbosity of man page output (aggressive, balanced, or none).
- **Search Limits**: Configure the number of results returned during symbol searches.
- **Preferred Compiler**: Specify the primary compiler for environment checks.

## Requirements

To utilize the full capability of this extension, the following tools are recommended:
- **Compilers**: gcc or clang
- **Build Systems**: make
- **Debuggers**: gdb
- **Analysis Tools**: valgrind, cppcheck, or clang-tidy
- **Binutils**: nm, objdump, ldd/otool
