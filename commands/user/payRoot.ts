import {
  CommandInteraction,
  CacheType,
  User,
  messageLink,
  PermissionFlagsBits
} from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import UserInfoCommand from "./userInfo";
import CommandEmbed from "../../core/Command/CommandEmbed";
import RebootCommand from "../owner/reboot";

export default class RootPay extends Command {
  constructor() {
    super(new CommandOptions("pay_root"));

    this.slashCommandInfo
      .setDescription("Temporary command, give money/blocks.")
      .addUserOption((o) =>
        o.setName("user").setDescription("Target to give.").setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName("type")
          .setDescription("тип валюты")
          .addChoices(
            { name: "Блоки", value: "blocks" },
            { name: "Монеты", value: "coins" }
          )
          .setRequired(true)
      )
      .addIntegerOption((o) =>
        o.setName("amount").setDescription("Количество").setRequired(true)
      );
  }

  async runSlash(
    interaction: CommandInteraction<CacheType>,
    client: CustomClient
  ): Promise<any> {
    const UserInfo = Command.getCommandByClass<UserInfoCommand>(
      client,
      UserInfoCommand.prototype
    );
    const Reboot = Command.getCommandByClass<RebootCommand>(
      client,
      RebootCommand.prototype
    );

    if (!Reboot.ownerIds.includes(interaction.user.id))
      return interaction.reply({
        embeds: [CommandEmbed.error("Вы не можете использовать эту команду.")]
      });

    const user = interaction.options.getUser("user") as User;
    const type = interaction.options.get("type")?.value as "blocks" | "coins";
    const amount = interaction.options.get("amount")?.value as number;

    if (user.bot)
      return interaction.reply({ embeds: [CommandEmbed.error("Это бот.")] });

    const profile = UserInfo.getUserInfoFromUID(interaction, user.id);
    let oldAmount: number;
    if (type == "blocks") {
      oldAmount = profile.blockgame.blocks.valueOf();
      profile.blockgame.blocks += amount;
    } else {
      oldAmount = profile.coins.valueOf();
      profile.coins += amount;
    }
    interaction.reply({
      embeds: [
        CommandEmbed.success({
          title: "Успешно",
          content:
            `Выдано ${amount} ${
              type == "blocks" ? "блоков" : "монет"
            } пользователю ${profile.username}.\n` +
            `Изменения: ${oldAmount} => ${oldAmount + amount}`
        })
      ]
    });
  }
}
