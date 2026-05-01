import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerCCompanionTools } from "./tools";
import { getCEnvironmentSummary, isCProject } from "./utils";

export default async function (pi: ExtensionAPI) {
  // Register the specialized C tools
  registerCCompanionTools(pi);

  // Register a command to check if the current project is a C project
  pi.registerCommand("c-check", {
    description: "Check if the current directory is a C programming project",
    handler: async (_args: any, ctx: any) => {
      if (await isCProject()) {
        ctx.ui.notify("C programming project detected! The C-Programming Companion is ready.", "success");
      } else {
        ctx.ui.notify("No C programming project detected in the current directory.", "warning");
      }
    },
  });

  // Register a command to manually refresh/show C environment info
  pi.registerCommand("c-env", {
    description: "Display the current C programming environment summary",
    handler: async (_args: any, ctx: any) => {
      const summary = await getCEnvironmentSummary();
      ctx.ui.notify("C Environment Summary:\n" + summary, "info");
    },
  });
}
