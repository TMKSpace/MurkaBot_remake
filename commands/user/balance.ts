import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import UserInfoCommand from "./userInfo";
import CommandEmbed from "../../core/Command/CommandEmbed";
import UserUtils from "../../core/UserUtils";

export default class BalanceCommand extends Command {
  constructor() {
    super(new CommandOptions("balance", { prefix: true }));

    this.slashCommandInfo
      .setDescription("Get your/another user balance")
      .addUserOption((o) =>
        o.setName("user").setDescription("User to show balance")
      );
    this.prefixCommandInfo.addAlias("bal").addAlias("баланс");
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const userInfo = Command.getCommandByClass(
      client,
      UserInfoCommand.prototype
    ) as UserInfoCommand;

    const user = await UserUtils.getUser(message, args[0]);
    const userid = user.id;

    if (!user)
      return message.reply({ embeds: [CommandEmbed.error("No user found.")] });

    if (user?.bot)
      return message.reply({
        embeds: [CommandEmbed.error("User is bot.")]
      });

    const profile = userid
      ? userInfo.getUserInfoFromUID(message, userid)
      : userInfo.getUserInfo(message);
    message.reply({
      embeds: [
        CommandEmbed.info({
          title: `Баланс ${user?.username ?? ""}`,
          content:
            `Монет: ${profile.coins}\n` +
            `Блоков: ${profile.blockgame.blocks}\n` +
            `Бонусов: \n` +
            `- Обычных: ${profile.blockgame.bonuses.simple}\n` +
            `- Экстра: ${profile.blockgame.bonuses.extra}`
        })
      ]
    });
  }
}
