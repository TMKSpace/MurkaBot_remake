import fs from "fs";
import path from "path";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import { scanDirectory } from "../../core/Utils/scannerUtils";
import { CacheType, CommandInteraction, Message } from "discord.js";
import CommandEmbed from "../../core/Command/CommandEmbed";

export default class GuildCacheUtil extends Command {
  data: Map<string, Map<string, Map<string, string>>>; //

  constructor() {
    super(new CommandOptions("util_guildcache").setName("GuildCache"));
    this.data = new Map();

    this.slashCommandInfo
      .setDescription("Shows server statistics.")
      .addStringOption((o) =>
        o.setName("provider").setDescription("Data provider")
      )
      .addStringOption((o) =>
        o.setName("filename").setDescription("Name of file")
      );
  }

  async onInit(client: CustomClient): Promise<void> {
    this.loadDataList();

    //setInterval(async () => this.saveData, 60000);
  }

  getGuildData(message: Message | CommandInteraction) {
    if (!this.data.has(message.guildId as string))
      this.data.set(message.guildId as string, new Map());
    return this.data.get(message.guildId as string);
  }

  getGuildDataByProvider(
    message: Message | CommandInteraction,
    dataId: string
  ) {
    const guildMap = this.getGuildData(message);
    return guildMap?.get(dataId);
  }

  getDataByName(
    message: Message | CommandInteraction,
    provider: string,
    filename: string
  ) {
    const filepath = this.getGuildDataByProvider(message, provider)?.get(
      filename
    );
    if (filepath) return JSON.parse(fs.readFileSync(filepath).toString());
  }

  private async loadDataList() {
    const dataFolder = this.getDataDir();
    const dataExtension = ".json";
    const files = scanDirectory(dataFolder, {
      extensionFilters: [dataExtension]
    });
    files.forEach(async (file) => {
      const fileData = file
        .slice(dataFolder.length + 1)
        .split(path.sep)
        .map((v) =>
          v.endsWith(dataExtension)
            ? v.substring(0, v.length - dataExtension.length)
            : v
        );

      const guildId = fileData[0];
      const providerId = fileData[1];
      const dataId = fileData[2];

      if (!this.data.has(guildId)) this.data.set(guildId, new Map());
      const guildData = this.data.get(guildId) as Map<
        string,
        Map<string, string>
      >;
      if (!guildData.has(providerId)) guildData.set(providerId, new Map());
      const providerData = guildData.get(providerId) as Map<string, string>;
      providerData.set(dataId, file);
    });
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const providerData = this.getGuildDataByProvider(message, args[0]);
    if (providerData && !args[1])
      return message.reply({
        embeds: [
          CommandEmbed.success({
            title: "Файлы провайдера " + args[0],
            content: [...providerData.keys()]
              .map((v) => "`" + v + "`")
              .join(", ")
          })
        ]
      });

    const fileContent = this.getDataByName(message, args[0], args[1]);
    if (fileContent)
      return message.reply({
        embeds: [
          CommandEmbed.success({
            title: "Содержимое файла " + args[1],
            content: "```json\n" + JSON.stringify(fileContent, null, 2) + "```"
          })
        ]
      });

    return message.reply({
      embeds: [
        CommandEmbed.success({
          title: `Провайдеры данных сервера ${message.guild?.name}`,
          content: [...(this.getGuildData(message)?.keys() ?? "")]
            .map((v) => "`" + v + "`")
            .join(", ")
        })
      ]
    });
  }

  async shutdown(): Promise<void> {}
}
