import fs from "fs";
import path from "path";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import { scanDirectory } from "../../core/Utils/scannerUtils";
import {
  CacheType,
  CommandInteraction,
  Message,
  PermissionFlagsBits
} from "discord.js";
import CommandEmbed from "../../core/Command/CommandEmbed";

export default class GuildCacheUtil extends Command {
  paths: Map<string, Map<string, Map<string, string>>>; // Регистр путей

  private dataExtension: string;

  constructor() {
    super(new CommandOptions("util_guildcache").setName("GuildCache"));

    this.paths = new Map();
    this.dataExtension = ".json";

    this.slashCommandInfo
      .setDescription("Shows server statistics.")
      .addStringOption((o) =>
        o.setName("provider").setDescription("Data provider")
      )
      .addStringOption((o) =>
        o.setName("filename").setDescription("Name of file")
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  // При запуске бота, подгрузка списка файлов в кеше.
  async onInit(client: CustomClient): Promise<void> {
    this.loadDataList();
  }

  // Зам запуск команды
  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    this.loadDataList();
    const providerData = this.getGuildDataProviders(message)?.get(args[0]);
    if (providerData && !args[1])
      return message.reply({
        embeds: [
          CommandEmbed.success({
            title: "Файлы провайдера " + args[0],
            content: [...providerData.keys()]
              .map((v) => "`" + v + "`")
              .join(", ")
          })
        ],
        ephemeral: true
      });

    const fileContent = this.getGuildData(message, args[0], args[1]);
    if (fileContent)
      return message.reply({
        embeds: [
          CommandEmbed.success({
            title: "Содержимое файла " + args[1],
            content: "```json\n" + JSON.stringify(fileContent, null, 2) + "```"
          })
        ],
        ephemeral: true
      });

    const providers = this.getGuildDataProviders(message);
    return message.reply({
      embeds: [
        CommandEmbed.success({
          title: `Провайдеры данных сервера ${message.guild?.name}`,
          content: providers?.size
            ? [...providers.keys()].map((v) => "`" + v + "`").join(", ")
            : "Нема"
        })
      ],
      ephemeral: true
    });
  }

  /** Получение провайдеров сервера из сообщения. */
  getGuildDataProviders(message: Message | CommandInteraction) {
    if (!this.paths.has(message.guildId as string))
      this.paths.set(message.guildId as string, new Map());
    return this.paths.get(message.guildId as string);
  }

  /** Получение данных по сообщению, провайдеру и самому идентификатору данных */
  getGuildData<ReturnType = any>(
    message: Message | CommandInteraction,
    provider: string,
    filename: string
  ) {
    const path = this.getGuildDataProviders(message)
      ?.get(provider)
      ?.get(filename);
    if (path && fs.existsSync(path))
      return JSON.parse(fs.readFileSync(path).toString()) as ReturnType;
    return;
  }

  /** Сохранение данных по сообщению, провайдеру и идентификатору данных */
  saveGuildData(
    message: Message | CommandInteraction,
    provider: string,
    filename: string,
    data: any
  ) {
    const dir = path.join(
      this.getDataDir(),
      message.guildId as string,
      provider
    );
    const filepath = path.join(dir, filename + this.dataExtension);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filepath)) this.generateDataPathFor(filepath);
    fs.writeFileSync(filepath, JSON.stringify(data));
  }

  /** Подгрузка списка путей */
  private async loadDataList() {
    const files = scanDirectory(this.getDataDir(), {
      extensionFilters: [this.dataExtension]
    });
    files.forEach((v) => this.generateDataPathFor(v));
  }

  /** Добавление пути в переменную путей для дальнейшего корректного использования getGuildData */
  private async generateDataPathFor(filepath: string) {
    const dataFolder = this.getDataDir();

    const fileData = filepath
      .slice(dataFolder.length + 1)
      .split(path.sep)
      .map((v) =>
        v.endsWith(this.dataExtension)
          ? v.substring(0, v.length - this.dataExtension.length)
          : v
      );

    const guildId = fileData[0];
    const providerId = fileData[1];
    const dataId = fileData[2];

    if (!this.paths.has(guildId)) this.paths.set(guildId, new Map());
    const guildData = this.paths.get(guildId) as Map<
      string,
      Map<string, string>
    >;
    if (!guildData.has(providerId)) guildData.set(providerId, new Map());
    const providerData = guildData.get(providerId) as Map<string, string>;
    providerData.set(dataId, filepath);
  }
}
