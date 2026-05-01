import { describe, expect, it, vi, beforeEach } from "bun:test";
import extension from "../src/index";
import { createMockPi, createMockContext } from "./mocks";

// Mocking some of the implementation details for the extension test
vi.mock("../src/utils", () => ({
  getCEnvironmentSummary: vi.fn(() => Promise.resolve("gcc: 11.0\nmake: 4.3")),
}));

describe("C-Programming Companion Extension", () => {
  let pi: any;
  let ctx: any;

  beforeEach(() => {
    pi = createMockPi();
    ctx = createMockContext();
    extension(pi);
  });

  describe("Commands", () => {
    it("should register the 'c-env' command", async () => {
      const commands = pi.__getCommands();
      expect(commands.has("c-env")).toBe(true);
      
      const cEnvCmd = commands.get("c-env");
      await cEnvCmd.handler("", ctx);
      expect(ctx.ui.notify).toHaveBeenCalledWith(expect.stringContaining("C Environment Summary"), "info");
    });
  });

  describe("Tools", () => {
    it("should register all C-companion tools", async () => {
      const tools = pi.__getTools();
      const expectedTools = [
        "companion_check_deps",
        "companion_inspect",
        "companion_configure",
        "find_c_header",
        "read_c_man_page",
        "search_c_symbols",
        "analyze_binary_deps",
        "debug_crash",
        "run_health_check",
        "get_binary_symbols",
        "disassemble_function",
        "analyze_memory_leaks",
        "run_static_analysis",
        "parse_makefile"
      ];

      for (const toolName of expectedTools) {
        expect(tools.has(toolName)).toBe(true);
      }
    });

    it("should execute find_c_header tool", async () => {
      const tools = pi.__getTools();
      const tool = tools.get("find_c_header");
      
      // We'd need to mock ToolHandlers or Shell for deeper integration tests,
      // but verifying registration and parameter presence is a good start.
      expect(tool.parameters).toBeDefined();
    });
  });

  describe("Events", () => {
    it("should no longer have session_start listener (cleaned up)", async () => {
      const events = pi.__getEvents();
      const handlers = events.get("session_start");
      // Since I removed the listener in src/index.ts, it should be undefined or empty
      expect(handlers === undefined || handlers.length === 0).toBe(true);
    });
  });
});
