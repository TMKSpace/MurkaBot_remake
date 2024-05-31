import fs from "fs";
import path from "path";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import { scanDirectory } from "../../core/Utils/scannerUtils";
import {
  CacheType,
  ChannelType,
  CommandInteraction,
  Events,
  Message,
  User
} from "discord.js";
import CommandEmbed from "../../core/Command/CommandEmbed";
import UserUtils from "../../core/UserUtils";

export class UserInfo {
  [index: string]: any;
  username: string;
  level: number;
  experience: number;
  coins: number;
  blockgame: {
    blocks: number;
    bpm: number;
    picklevel: number;
    bonuses: {
      [index: string]: number;
      simple: number;
      extra: number;
    };
  };
  messages: {
    created: number;
    deleted: number;
  };
  warns: number;

  constructor(username: string) {
    this.username = username;
    this.level = 1;
    this.experience = 0;
    this.coins = 0;
    this.blockgame = {
      blocks: 0,
      bpm: 0,
      picklevel: 0,
      bonuses: {
        simple: 0,
        extra: 0
      }
    };
    this.messages = {
      created: 0,
      deleted: 0
    };
    this.warns = 0;
  }

  static fromJSON(userDataJSON: string) {
    const data = JSON.parse(userDataJSON);

    const instance = new UserInfo("");
    Object.entries(data).forEach((v) => {
      instance[v[0]] = v[1];
    });

    return instance;
  }
}

export default class UserInfoCommand extends Command {
  userData: Map<string, Map<string, UserInfo>>; // Map of guild ids => Map of users in guild

  constructor() {
    super(
      new CommandOptions("userinfo")
        .setName("UserInfo")
        .setType({ prefix: true })
    );
    this.userData = new Map();

    this.prefixCommandInfo.addAlias("ui").addAlias("юзеринфо").addAlias("юи");
    this.slashCommandInfo
      .setDescription("Shows your server statistics.")
      .addUserOption((o) => o.setName("user").setDescription("User to check"));
  }

  async onInit(client: CustomClient): Promise<void> {
    this.loadUserData();

    this.listenMessages(client);

    setInterval(async () => this.saveUserData, 60000);
  }

  private listenMessages(client: CustomClient) {
    let timeoutList: string[] = [];
    client.on(Events.MessageCreate, async (message) => {
      if (
        message.author.bot ||
        message.webhookId ||
        message.content.startsWith(client.config.bot.prefix) ||
        message.channel.type == ChannelType.DM
      )
        return;

      const profile = this.getUserInfo(message);
      const uid = message.author.id;
      profile.experience++;
      profile.messages.created++;
      if (!timeoutList.includes(uid)) {
        profile.coins++;
        profile.blockgame.blocks += profile.blockgame.bpm;
        timeoutList.push(uid);
        setTimeout(() => {
          if (timeoutList.includes(uid)) {
            timeoutList.splice(timeoutList.indexOf(uid), 1);
          }
        }, 45000);
      }
      if (profile.experience >= this.getExpFromTo(1, profile.level + 1)) {
        profile.level++;
        let content = `Вы (${profile.username}) выхуели до ${profile.level} уровня!`;
        if (profile.level % 10 == 0) {
          profile.blockgame.bpm++;
          content += `\nТакже вы получили +1 в статистике \`Блок за сообщение\`: ${profile.blockgame.bpm}.`;
        }
        message.channel.send(content);
      }
    });

    client.on(Events.MessageDelete, (message) => {
      if (
        message.author?.bot ||
        message.webhookId ||
        message.content?.startsWith(client.config.bot.prefix) ||
        message.channel.type == ChannelType.DM
      )
        return;
      const profile = this.getUserInfo(message as Message);
      profile.messages.deleted++;
    });
  }

  getExpFromTo(from: number, to: number) {
    return (((from + to - 1) * (to - from)) / 2) * 5;
  }

  getUserInfoFromUID(message: Message | CommandInteraction, uid: string) {
    const user = message.guild?.members.cache.get(uid)?.user as User;

    if (!this.userData.has(message.guildId as string))
      this.userData.set(message.guildId as string, new Map());
    const guildMap = this.userData.get(message.guildId as string);

    if (!guildMap?.has(user.id))
      guildMap?.set(user.id, new UserInfo(user.username));
    return guildMap?.get(user.id) as UserInfo;
  }

  getUserInfo(message: Message | CommandInteraction): UserInfo {
    let userid: string;
    if (message instanceof Message) {
      userid = message.author.id;
    } else userid = message.user.id;

    return this.getUserInfoFromUID(message, userid);
  }

  private async loadUserData() {
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
      const uid = fileData[1];

      if (!this.userData.has(guildId)) this.userData.set(guildId, new Map());
      this.userData
        .get(guildId)
        ?.set(uid, UserInfo.fromJSON(fs.readFileSync(file).toString()));
    });
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const user = await UserUtils.getUser(message, args[0]);
    if (user?.bot)
      return message.reply({ embeds: [CommandEmbed.error("User is bot.")] });
    const profile = this.getUserInfoFromUID(message, user.id);
    message.reply({
      embeds: [
        CommandEmbed.success({
          title: `Данные пользователя ${profile.username}`,
          content:
            "```json\n" +
            JSON.stringify(profile, null, 2) +
            "```" +
            `\nДо следующего уровня: ${
              this.getExpFromTo(1, profile.level + 1) - profile.experience
            }`
        })
      ]
    });
  }

  async shutdown(): Promise<void> {
    this.saveUserData();
  }

  async saveUserData() {
    const dataFolder = this.getDataDir();
    this.userData.forEach((guild, guildid) => {
      const guildPath = path.join(dataFolder, guildid);
      if (!fs.existsSync(guildPath)) fs.mkdirSync(guildPath);
      guild.forEach(async (user, uid) => {
        const userPath = path.join(guildPath, uid) + ".json";
        fs.writeFile(userPath, JSON.stringify(user), () => {});
      });
    });
  }
}
