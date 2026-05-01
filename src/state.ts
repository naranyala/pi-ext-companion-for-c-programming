export interface CompanionConfig {
  manPageCleaningLevel: "aggressive" | "balanced" | "none";
  symbolSearchLimit: number;
  preferredCompiler: "gcc" | "clang";
  languageMode: "c" | "cpp";
}

export class CompanionState {
  private static config: CompanionConfig = {
    manPageCleaningLevel: "balanced",
    symbolSearchLimit: 15,
    preferredCompiler: "gcc",
    languageMode: "c",
  };

  static getConfig(): CompanionConfig {
    return { ...this.config };
  }

  static updateConfig(updates: Partial<CompanionConfig>) {
    this.config = { ...this.config, ...updates };
    return this.config;
  }

  static getStatus() {
    return {
      version: "1.0.0",
      status: "active",
      config: this.config,
      timestamp: new Date().toISOString(),
    };
  }
}
