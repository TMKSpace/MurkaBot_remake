import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Message,
  SlashCommandBuilder
} from "discord.js";
import fs from "fs";
import path from "path";
import PrefixCommandBuilder from "./PrefixCommandBuilder";
import Logger from "../Logger";
import CommandOptions from "./CommandOptions";
import CustomClient from "../CustomClient";

export default abstract class Command {
  /** Identifier and trigger of command */
  id: string;
  /** Command name (console logger name) */
  name: string;
  /** Slash - Is slash command
   * Prefix - Is prefix command
   * Global - Can you use this command in other servers */
  type: { slash: boolean; prefix: boolean; global: boolean };

  slashCommandInfo: SlashCommandBuilder;
  prefixCommandInfo: PrefixCommandBuilder;

  // Configuration and data
  configFolder: string;
  configName: string;
  private dataFolder: string;

  // Logger
  logger: Logger;

  constructor(options: CommandOptions) {
    this.id = options.id;
    this.name = options.name;
    this.type = options.type;

    // Command Builders
    this.slashCommandInfo = new SlashCommandBuilder()
      .setName(this.id)
      .setDescription(this.name);

    this.prefixCommandInfo = new PrefixCommandBuilder().addAlias(this.id);

    // Config and data.
    this.configFolder = this.id;
    this.configName = "index.json";
    this.dataFolder = this.id;

    // Logger
    this.logger = new Logger(this.name);
  }

  setDescription(description: string) {
    this.slashCommandInfo.setDescription(description);
  }

  runSlash?(
    interaction: CommandInteraction,
    client: CustomClient
  ): Promise<any>;

  runPrefix?(
    message: Message,
    args: string[],
    client: CustomClient
  ): Promise<any>;

  /**
   * @param message WARNING! This parameter could be interaction or message.
   * Try to use only methods, which are in both classes.
   */
  run?(
    message: Message | CommandInteraction,
    args: string[],
    client: CustomClient
  ): Promise<any>;

  async onInit(client: CustomClient): Promise<void> {}

  async shutdown(): Promise<void> {}

  // Config

  setConfigName(configName: string): void {
    this.configName = configName;
  }

  setConfigFolder(configFolder: string): void {
    this.configFolder = configFolder;
  }

  readConfig<config = any>(): config | undefined {
    const cfg = this.getCfgPath();
    try {
      return JSON.parse(fs.readFileSync(cfg, { encoding: "utf-8" }));
    } catch {
      return;
    }
  }

  writeConfig<config = any>(data: config): config {
    const dir = this.getCfgDir();
    const cfg = this.getCfgPath();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cfg, JSON.stringify(data));
    return data;
  }

  deleteConfig() {
    const cfg = this.getCfgPath();
    if (!fs.existsSync(cfg)) return false;
    fs.rmSync(cfg, { force: true });
    return true;
  }

  private getCfgDir = () =>
    path.join(process.cwd(), "configs", this.configFolder);
  private getCfgPath = () => path.join(this.getCfgDir(), this.configName);

  // Data

  setDataFolder(name: string): void {
    this.dataFolder = name;
  }

  getDataDir() {
    const dataDir = this.getDataDirPath();
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    return dataDir;
  }

  private getDataDirPath = () => {
    return path.join(process.cwd(), "data", this.dataFolder);
  };

  static interactionToArgs(interaction: CommandInteraction) {
    const args = interaction.options.data
      .filter(
        (a) =>
          a.type ==
          (ApplicationCommandOptionType.String ||
            ApplicationCommandOptionType.Number ||
            ApplicationCommandOptionType.Boolean ||
            ApplicationCommandOptionType.Integer)
      )
      .map((v) => v.value?.toString()) as string[];

    args.push(
      ...interaction.options.data
        .filter((a) => a.type == ApplicationCommandOptionType.Channel)
        .map((v) => v.channel?.id as string)
    );

    args.push(
      ...interaction.options.data
        .filter((a) => a.type == ApplicationCommandOptionType.User)
        .map((v) => v.user?.id as string)
    );

    return args;
  }

  static getCommandByClass<CommandType>(
    client: CustomClient,
    Class: Command
  ): CommandType {
    const commands = client.prefCmd.concat(client.interCmd);
    return commands.find(
      (v) => v.constructor.name == Class.constructor.name
    ) as CommandType;
  }
}
