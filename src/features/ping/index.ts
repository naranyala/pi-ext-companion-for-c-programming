import { Feature } from "../../core/feature";

export class PingFeature extends Feature {
  init() {
    this.ext.command("ping", "Check if extension is loaded", async (_args, ctx) => {
      this.ext.log("🏓 Pong! (Structured extension is working)", ctx);
    });
  }
}
