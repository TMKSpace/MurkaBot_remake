import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import UserInfoCommand, { UserInfo } from "./userInfo";
import CommandEmbed from "../../core/Command/CommandEmbed";

export default class TopCommand extends Command {
  constructor() {
    super(new CommandOptions("top").setType({ prefix: true }));

    this.prefixCommandInfo.addAlias("топ");
    this.slashCommandInfo.setDescription("Top of users");
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const ui = Command.getCommandByClass(
      client,
      UserInfoCommand.prototype
    ) as UserInfoCommand;
    const guildid = args[0] ?? (message.guildId as string);
    const users = ui.userData.get(guildid) as Map<string, UserInfo>;

    users.forEach(async (v, k) => {
      v.username = (await client.users.fetch(k)).username;
      ui.saveUserData();
    });

    const sortedusers = [...users.entries()]
      .sort((a, b) => a[1].level - b[1].level)
      .reverse()
      .map(async (v) => ({
        name: (await client.users.fetch(v[0])).username,
        value: `${v[1].level} уровень (${v[1].experience} опыта)\n${v[1].coins} монет, ${v[1].blockgame.blocks} блоков`
      }))
      .slice(0, 25);

    let i = 0;
    message.reply({
      embeds: [
        CommandEmbed.info({
          title: "Топ пользователей по уровням"
        }).addFields(await Promise.all(sortedusers))
      ]
    });
  }
}
