import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { ToolHandlers } from "./tool-handlers";
import { CompanionState } from "./state";
import { DependencyManager } from "./dependencies";

export function registerCCompanionTools(pi: ExtensionAPI) {
  // --- Meta-Primitives (The Control Plane) ---

  pi.registerTool({
    name: "companion_check_deps",
    label: "Check Dependencies",
    description: "Audit the system for required C/C++ tools and suggest installation commands.",
    parameters: Type.Object({}),
    async execute() {
      const result = await DependencyManager.checkAll();
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "companion_inspect",
    label: "Inspect Companion State",
    description: "Get the current configuration and status of the C-Programming Companion.",
    parameters: Type.Object({}),
    async execute() {
      return { content: [{ type: "text", text: JSON.stringify(CompanionState.getStatus(), null, 2) }], details: [] };
    },
  });

  pi.registerTool({
    name: "companion_configure",
    label: "Configure Companion",
    description: "Adjust the behavior of the companion (e.g., man page cleaning level or symbol search limits).",
    parameters: Type.Object({
      cleaningLevel: Type.Optional(Type.Union([
        Type.Literal("aggressive"), 
        Type.Literal("balanced"), 
        Type.Literal("none")
      ])),
      searchLimit: Type.Optional(Type.Number()),
      preferredCompiler: Type.Optional(Type.Union([
        Type.Literal("gcc"), 
        Type.Literal("clang")
      ])),
    }),
    async execute(_toolCallId, params) {
      const newConfig = CompanionState.updateConfig(params);
      return { 
        content: [{ type: "text", text: `Configuration updated successfully:\n${JSON.stringify(newConfig, null, 2)}` }],
        details: []
      };
    },
  });

  // --- Standard C Tools ---
  pi.registerTool({
    name: "find_c_header",
    label: "Find C Header",
    description: "Locate the system path of a C header file (e.g., 'stdio.h').",
    parameters: Type.Object({
      headerName: Type.String({ description: "The name of the header file to find (e.g., 'stdio.h')" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.findHeader(params.headerName);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "read_c_man_page",
    label: "Read C Man Page",
    description: "Read the Unix man page for a C function. Use section 2 for system calls and section 3 for library functions.",
    parameters: Type.Object({
      functionName: Type.String({ description: "The name of the C function (e.g., 'malloc', 'read')" }),
      section: Type.Optional(Type.String({ description: "Man page section (default '3' for library, '2' for system calls)" })),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.readManPage(params.functionName, params.section);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "search_c_symbols",
    label: "Search C Symbols",
    description: "Search for a C symbol (function, macro, struct) definition in system headers.",
    parameters: Type.Object({
      symbol: Type.String({ description: "The C symbol to search for (e.g., 'FILE', 'size_t')" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.searchSymbols(params.symbol);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "project_search_symbols",
    label: "Project Symbol Search",
    description: "Search for a C symbol (function, macro, struct) definition within the current project.",
    parameters: Type.Object({
      symbol: Type.String({ description: "The C symbol to search for" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.searchProjectSymbols(params.symbol);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "project_find_usages",
    label: "Project Find Usages",
    description: "Find all occurrences of a symbol within the current project.",
    parameters: Type.Object({
      symbol: Type.String({ description: "The C symbol to find usages for" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.findProjectUsages(params.symbol);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "analyze_binary_deps",
    label: "Analyze Binary Dependencies",
    description: "List the shared library dependencies of a C binary.",
    parameters: Type.Object({
      binaryPath: Type.String({ description: "Path to the binary file" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.analyzeDeps(params.binaryPath);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "debug_crash",
    label: "Debug Crash",
    description: "Run a binary under GDB to capture a backtrace on crash.",
    parameters: Type.Object({
      binaryPath: Type.String({ description: "Path to the binary file" }),
      args: Type.Optional(Type.Array(Type.String({ description: "Arguments to pass to the binary" }))),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.debugCrash(params.binaryPath, params.args || []);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "run_health_check",
    label: "Project Health Check",
    description: "Perform a comprehensive audit of the C project (Build system, Toolchain, Static Analysis).",
    parameters: Type.Object({
      projectRoot: Type.String({ description: "Path to the project root directory" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.runHealthCheck(params.projectRoot);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "get_binary_symbols",
    label: "Get Binary Symbols",
    description: "List the symbols (functions, variables) in a C binary using nm.",
    parameters: Type.Object({
      binaryPath: Type.String({ description: "Path to the binary file" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.getBinarySymbols(params.binaryPath);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "disassemble_function",
    label: "Disassemble Function",
    description: "Disassemble a specific function in a binary to see the assembly code.",
    parameters: Type.Object({
      binaryPath: Type.String({ description: "Path to the binary file" }),
      functionName: Type.String({ description: "Name of the function to disassemble" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.disassembleFunction(params.binaryPath, params.functionName);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "analyze_memory_leaks",
    label: "Analyze Memory Leaks",
    description: "Run Valgrind on a binary to detect memory leaks. Returns only the leak summary.",
    parameters: Type.Object({
      binaryPath: Type.String({ description: "Path to the binary file" }),
      args: Type.Optional(Type.Array(Type.String({ description: "Arguments to pass to the binary" }))),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.analyzeMemoryLeaks(params.binaryPath, params.args || []);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "run_static_analysis",
    label: "Run Static Analysis",
    description: "Run cppcheck on a C file to find potential bugs and style issues.",
    parameters: Type.Object({
      filePath: Type.String({ description: "Path to the C source file" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.runStaticAnalysis(params.filePath);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });

  pi.registerTool({
    name: "parse_makefile",
    label: "Parse Makefile",
    description: "Extract targets and dependencies from a Makefile.",
    parameters: Type.Object({
      makefilePath: Type.String({ description: "Path to the Makefile" }),
    }),
    async execute(_toolCallId, params) {
      const result = await ToolHandlers.parseMakefile(params.makefilePath);
      return { content: [{ type: "text", text: result }], details: [] };
    },
  });
}
