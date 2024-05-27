import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../../../core/Command";
import CommandOptions from "../../../core/Command/CommandOptions";
import CustomClient from "../../../core/CustomClient";
import UserInfoCommand from "../userInfo";
import CommandEmbed from "../../../core/Command/CommandEmbed";

export default class UpgradePickaxeCostCommand extends Command {
  constructor() {
    super(
      new CommandOptions("upgradepickcost")
        .setName("UpgradePickaxeCost")
        .setType({ prefix: true })
    );

    this.prefixCommandInfo.addAlias("upc").addAlias("ценаапгрейда");

    this.slashCommandInfo.setDescription("Pickaxe upgrade cost.");
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

    const profile = ui.getUserInfo(message);
    if (profile.blockgame.picklevel < 1)
      return message.reply({
        embeds: [
          CommandEmbed.error({
            title: "Нет кирки!",
            content:
              "Для начала необходимо приобрести кирку, используя команду buypickaxe."
          })
        ]
      });

    const cost = Math.floor(25 * 1.5 ** (profile.blockgame.picklevel - 1));
    return message.reply({
      embeds: [
        CommandEmbed.info({
          title: "Цена апгрейда",
          content:
            `В наличии ${profile.coins} из ${cost} монеток.\n` +
            (cost > profile.coins
              ? `Необходимо ещё ${cost - profile.coins} монет `
              : "У вас уже достаточно монет ") +
            `для поднятия ${profile.blockgame.picklevel + 1} уровня кирки.`
        })
      ]
    });
  }
}
