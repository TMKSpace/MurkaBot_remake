import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import UserInfoCommand from "./userInfo";
import CommandEmbed from "../../core/Command/CommandEmbed";
import PayHistoryCommand from "./paymentHistory";
import UserUtils from "../../core/UserUtils";

export default class PayCommand extends Command {
  constructor() {
    super(new CommandOptions("pay", { prefix: true }));

    this.slashCommandInfo
      .setDescription("Send money to another user.")
      .addUserOption((o) =>
        o
          .setName("user")
          .setDescription("User to send money to.")
          .setRequired(true)
      )
      .addIntegerOption((o) =>
        o
          .setName("amount")
          .setDescription("Amount of coins to send.")
          .setRequired(true)
      )
      .addStringOption((o) =>
        o.setName("comment").setDescription("Payment description.")
      );
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const UserInfo = Command.getCommandByClass(
      client,
      UserInfoCommand.prototype
    ) as UserInfoCommand;
    const PayHistory = Command.getCommandByClass<PayHistoryCommand>(
      client,
      PayHistoryCommand.prototype
    );

    if (!args[0] || !args[1])
      return message.reply({
        embeds: [
          CommandEmbed.error(
            "Цель или сумма перевода отсутствует.\n" +
              `Использование: \`${client.config.bot.prefix}pay <user> <amount> [comment]\``
          )
        ]
      });

    const user = await UserUtils.getTargetUser(message, args[0]);
    if (!user)
      return message.reply({
        embeds: [
          CommandEmbed.error(
            "Пользователь не найден.\n" +
              `Использование: \`${client.config.bot.prefix}pay <user> <amount> [comment]\``
          )
        ]
      });

    const aProfile = UserInfo.getUserInfo(message);
    const bProfile = UserInfo.getUserInfoFromUID(message, user.id);

    if (aProfile.username == bProfile.username)
      return message.reply({
        embeds: [
          CommandEmbed.error(
            "Вы не можете перевести монеты самому себе\n ¯\\_(ツ)_/¯"
          )
        ]
      });
    else if (aProfile.level < 10)
      return message.reply({
        embeds: [
          CommandEmbed.error(
            "Эта команда будет доступна с 10 уровня пользователя."
          )
        ]
      });
    else if (bProfile.level < 5)
      return message.reply({
        embeds: [
          CommandEmbed.error(
            "Целевой пользователь должен иметь минимум 5 уровень."
          )
        ]
      });

    const amount = Math.floor(parseInt(args[1]));

    if (
      aProfile.coins < amount ||
      amount < 1 ||
      !amount ||
      typeof amount != "number"
    )
      return message.reply({
        embeds: [
          CommandEmbed.error(
            "Некорректное значение перевода.\n" +
              "Вероятно, введённое значение не может быть вычтено из вашего баланса."
          )
        ]
      });

    message.reply({
      embeds: [
        CommandEmbed.success({
          title: "Перевод выполнен",
          content:
            `${aProfile.username} перевёл ${amount} монет ${bProfile.username}.\n` +
            `Комментарий платежа: ${
              args.slice(2).length ? args.slice(2).join(" ") : "отсутствует"
            }\n\n` +
            `Баланс ${aProfile.username}: ${
              aProfile.coins
            } => ${(aProfile.coins -= amount)}\n` +
            `Баланс ${bProfile.username}: ${
              bProfile.coins
            } => ${(bProfile.coins += amount)}`
        })
      ]
    });

    PayHistory.createPayment(message, user, amount);
  }
}
