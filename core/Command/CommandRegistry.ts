import { Collection } from "discord.js";
import Command from ".";
import CustomClient from "../CustomClient";
import Config from "../Config";
import Logger from "../Logger";

const log = new Logger("CommandRegistry");

export default class CommandRegistry {
  interaction: Collection<string, Command>;
  prefix: Collection<string, Command>;
  config: Config;
  length: number;

  constructor(client: CustomClient) {
    // Command registries
    this.interaction = client.interCmd;
    this.prefix = client.prefCmd;
    this.config = client.config;
    this.length = 0;
  }

  registerCommand(command: Command) {
    if (command.type.slash)
      this.interaction.set(command.slashCommandInfo.name, command);

    if (command.type.prefix) {
      const commandNames = command.prefixCommandInfo.names;
      this.prefix.set(commandNames[0], command);
    }

    this.length++;
  }

  registerCommands(commands: Command[]) {
    for (let command of commands) {
      this.registerCommand(command);
    }
  }

  clearRegistry() {
    this.prefix.clear();
    this.interaction.clear();
    this.length = 0;
  }
}
