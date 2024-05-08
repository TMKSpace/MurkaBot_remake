import Command from ".";
import Config from "../Config";
import { scanDirectory } from "../Utils/scannerUtils";

export default class CommandScanner {
  config: Config;
  commands: Command[];

  constructor(config: Config) {
    this.config = config;
    this.commands = [];
  }

  importCommands(extensionFilters = ["js"]) {
    const files = scanDirectory(this.config.settings.commandPath, {
      ignoreFilters: this.config.settings.ignoredCommandDirs,
      extensionFilters
    });
    this.commands = files
      .map((file) => {
        try {
          const command = new (require(file).default)() as Command;
          if (!command.id) return;
          return command;
        } catch {}
      })
      .filter((v) => v) as Command[];
    return this.commands;
  }

  clearCommands() {
    this.commands.length = 0;
  }
}
