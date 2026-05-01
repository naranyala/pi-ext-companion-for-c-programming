import type { ExtensionAPI, ExtensionContext, ExtensionHandler, ExtensionEvent, ToolDefinition } from "@mariozechner/pi-coding-agent";
import type { TSchema } from "@sinclair/typebox";

/**
 * A wrapper around the Pi Extension API to provide a more structured 
 * and discoverable way to interact with the agent.
 */
export class PiExtension {
  constructor(public readonly api: ExtensionAPI) {}

  /**
   * Register a command with automatic error handling and logging
   */
  command(name: string, description: string, handler: (args: string, ctx: any) => Promise<void>) {
    this.api.registerCommand(name, {
      description,
      handler: async (args, ctx) => {
        try {
          await handler(args, ctx);
        } catch (error) {
          ctx.ui.notify(`Command /${name} failed: ${error instanceof Error ? error.message : String(error)}`, "error");
          console.error(`Error in command /${name}:`, error);
        }
      }
    });
    return this;
  }

  /**
   * Register a tool with a simplified interface
   */
  tool<TParams extends TSchema, TDetails = unknown>(tool: ToolDefinition<TParams, TDetails>) {
    this.api.registerTool(tool);
    return this;
  }

  /**
   * Listen to Pi events
   */
  on<E extends ExtensionEvent["type"]>(event: E, handler: any) {
    this.api.on(event as any, handler);
    return this;
  }

  /**
   * Helper to set multiple status items at once
   */
  setStatuses(statuses: Record<string, string | undefined>, ctx: ExtensionContext) {
    for (const [key, value] of Object.entries(statuses)) {
      ctx.ui.setStatus(key, value);
    }
  }

  /**
   * Helper to notify user and log to console
   */
  log(message: string, ctx: ExtensionContext, type: "info" | "warning" | "error" = "info") {
    ctx.ui.notify(message, type);
    if (type === "error") {
      console.error(`[Extension] ${message}`);
    } else {
      console.log(`[Extension] ${message}`);
    }
  }

  getActiveTools(): string[] {
    return this.api.getActiveTools();
  }

  getAllTools(): any[] {
    return this.api.getAllTools();
  }

  setActiveTools(toolNames: string[]): void {
    this.api.setActiveTools(toolNames);
  }

  getCommands(): any[] {
    return this.api.getCommands();
  }

  setModel(model: any): Promise<boolean> {
    return this.api.setModel(model);
  }

  getThinkingLevel(): any {
    return this.api.getThinkingLevel();
  }

  setThinkingLevel(level: any): void {
    this.api.setThinkingLevel(level);
  }

  setSessionName(name: string): void {
    this.api.setSessionName(name);
  }

  getSessionName(): string | undefined {
    return this.api.getSessionName();
  }

  sendMessage(message: any, options?: any): void {
    this.api.sendMessage(message, options);
  }

  sendUserMessage(content: any, options?: any): void {
    this.api.sendUserMessage(content, options);
  }

  registerProvider(name: string, config: any): void {
    this.api.registerProvider(name, config);
  }

  unregisterProvider(name: string): void {
    this.api.unregisterProvider(name);
  }

  getFlag(name: string): boolean | string | undefined {
    return this.api.getFlag(name);
  }

  registerFlag(name: string, options: { description?: string; type: "boolean" | "string"; default?: boolean | string }): void {
    this.api.registerFlag(name, options);
  }

  registerShortcut(shortcut: any, options: { description?: string; handler: (ctx: any) => Promise<void> | void }): void {
    this.api.registerShortcut(shortcut, options);
  }
}
