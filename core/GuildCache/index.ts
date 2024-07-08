import fs from "fs";
import path from "path";
import { CommandInteraction, Message } from "discord.js";

const paths = {
  data: path.join(process.cwd(), "data", "core_guildCache")
};

export default class GuildCacheUtil {
  private static dataExtension = ".json";

  /** Получение провайдеров и файлов провайдеров сервера из сообщения. */
  static getGuildDataProviders(
    message: Message | CommandInteraction
  ): Map<string, Map<string, string>> {
    const guildDir = path.join(paths.data, message.guildId as string);

    if (!fs.existsSync(guildDir)) fs.mkdirSync(guildDir, { recursive: true });

    const providers = fs
      .readdirSync(guildDir)
      .filter((fpath) =>
        fs.lstatSync(path.join(guildDir, fpath)).isDirectory()
      );
    return new Map(
      providers.map((dir) => [
        dir,
        new Map(
          fs
            .readdirSync(path.join(guildDir, dir))
            .map((file) => [
              file.substring(0, file.length - this.dataExtension.length),
              path.join(guildDir, dir, file)
            ])
        )
      ])
    );
  }

  /** Получение данных по сообщению, провайдеру и самому идентификатору данных */
  static getGuildData<ReturnType = any>(
    message: Message | CommandInteraction,
    provider: string,
    name: string
  ): ReturnType | undefined {
    const path = this.getGuildDataProviders(message)?.get(provider)?.get(name);

    if (path && fs.existsSync(path))
      return JSON.parse(fs.readFileSync(path).toString()) as ReturnType;
    return;
  }

  /** Сохранение данных по сообщению, провайдеру и идентификатору данных */
  static saveGuildData(
    message: Message | CommandInteraction,
    provider: string,
    filename: string,
    data: any
  ) {
    const dir = path.join(paths.data, message.guildId as string, provider);
    const filepath = path.join(dir, filename + this.dataExtension);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(data));
  }
}
