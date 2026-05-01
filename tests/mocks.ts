import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { describe, expect, vi } from "bun:test";

export const createMockContext = () => ({
  ui: {
    notify: vi.fn(),
    setWidget: vi.fn(),
  },
});

export const createMockPi = () => {
  const events = new Map<string, Array<(event: any, ctx: any) => Promise<void>>>();
  const commands = new Map<string, { description: string; handler: (args: string, ctx: any) => Promise<void> }>();
  const tools = new Map<string, any>();

  return {
    on: vi.fn((event, handler) => {
      if (!events.has(event)) events.set(event, []);
      events.get(event)?.push(handler);
    }),
    registerCommand: vi.fn((name, config) => {
      commands.set(name, config);
    }),
    registerTool: vi.fn((config) => {
      tools.set(config.name, config);
    }),
    // Helper methods for tests
    __getEvents: () => events,
    __getCommands: () => commands,
    __getTools: () => tools,
  } as unknown as ExtensionAPI & {
    __getEvents: () => Map<string, any[]>;
    __getCommands: () => Map<string, any>;
    __getTools: () => Map<string, any>;
  };
};
