import { Type } from "@sinclair/typebox";
import { Feature } from "../../core/feature";

export class HelloFeature extends Feature {
  init() {
    // Register command
    this.ext.command("hello", "Say hello from the extension", async (args, ctx) => {
      const name = args.trim() || "World";
      this.ext.log(`👋 Hello, ${name}! (from structured-ext)`, ctx);
    });

    // Register tool
    this.ext.tool({
      name: "hello_world",
      label: "Hello World",
      description: "A simple hello world tool that returns a greeting message",
      promptSnippet: "Greet the user with a hello world message",
      
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Name to greet (optional)" })),
      }),

      async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
        const name = params.name || "World";
        const greeting = `Hello ${name}! 🌍`;
        
        return {
          content: [{ type: "text", text: greeting }],
          details: {
            message: greeting,
            timestamp: new Date().toISOString(),
          },
        };
      },
    });

    /*
    // Listen to session start
    this.ext.on("session_start", async (_event, ctx) => {
      ctx.ui.setWidget("hello-ext", [
        "📦 Structured Hello Loaded",
        "🎯 Status: Ready",
      ]);
    });
    */
  }
}
