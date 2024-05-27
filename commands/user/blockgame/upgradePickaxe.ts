import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../../../core/Command";
import CommandOptions from "../../../core/Command/CommandOptions";
import CustomClient from "../../../core/CustomClient";
import UserInfoCommand from "../userInfo";
import CommandEmbed from "../../../core/Command/CommandEmbed";

export default class UpgradePickaxeCommand extends Command {
  constructor() {
    super(
      new CommandOptions("upgradepick")
        .setName("UpgradePickaxe")
        .setType({ prefix: true })
    );

    this.prefixCommandInfo.addAlias("up").addAlias("апгрейд");

    this.slashCommandInfo.setDescription("Upgrade your pickaxe.");
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
    if (cost > profile.coins)
      return message.reply({
        embeds: [
          CommandEmbed.error({
            title: "Недостаточно средств сука!!!1",
            content:
              `Безобразие!!! =(\nВ наличии ${profile.coins} из ${cost} монеток.\n` +
              `Необходимо ещё ${cost - profile.coins} монеток.`
          })
        ]
      });
    profile.coins -= cost;
    profile.blockgame.picklevel++;
    profile.blockgame.bpm++;
    return message.reply({
      embeds: [
        CommandEmbed.success({
          title: "Кирка улучшена!",
          content:
            `Вы потратили ${cost} монеток для улучшения кирки.\n` +
            `Уровень кирки теперь равен ${profile.blockgame.picklevel}.\n` +
            `У вас осталось ${profile.coins} монеток.`
        })
      ]
    });
  }
}
