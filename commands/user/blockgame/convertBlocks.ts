import { Message, CommandInteraction, CacheType, User } from "discord.js";
import Command from "../../../core/Command";
import CommandOptions from "../../../core/Command/CommandOptions";
import CustomClient from "../../../core/CustomClient";
import UserInfoCommand from "../userInfo";
import CommandEmbed from "../../../core/Command/CommandEmbed";

export default class ConvertBlocksCommand extends Command {
  constructor() {
    super(
      new CommandOptions("convertblocks")
        .setName("ConvertBlocks")
        .setType({ prefix: true })
    );

    this.prefixCommandInfo.addAlias("конвертировать").addAlias("cb");
    this.slashCommandInfo
      .addNumberOption((o) =>
        o.setName("amount").setDescription("Amount of coins")
      )
      .addStringOption((o) =>
        o
          .setName("part")
          .setDescription("Blocks to convert")
          .addChoices(
            { name: "All", value: "all" },
            { name: "Half", value: "half" }
          )
      );
    this.slashCommandInfo.setDescription("Convert blocks to coins.");
  }

  private isNumber(string: string) {
    return parseInt(string).toString() == string;
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    let user: User;
    if (message instanceof Message) user = message.author;
    else user = message.user;

    const ui = Command.getCommandByClass(
      client,
      UserInfoCommand.prototype
    ) as UserInfoCommand;

    const profile = ui.getUserInfo(message);

    let argument = args[0] ?? "all";
    let converted = 0;

    const errorEmbed = [
      CommandEmbed.error({
        title: "Недостаточно блоков!",
        content:
          "Безобразие!!!11\n" +
          `Вам необходимо минимум еще ${
            10 - profile.blockgame.blocks
          } блоков.\n` +
          "Курс обмена: 10 блоков на 1 монету."
      })
    ];

    if (this.isNumber(argument)) {
      // Converting blocks to input number of coins.
      const coins = parseInt(argument);
      if (profile.blockgame.blocks / 10 >= coins && coins >= 0) {
        profile.blockgame.blocks -= 10 * coins;
        profile.coins += coins;
        converted = coins;
      } else {
        return message.reply({ embeds: errorEmbed });
      }
    } else if (argument == "all") {
      // Converting all
      converted = (profile.blockgame.blocks / 10) | 0;
      if (converted == 0) return message.reply({ embeds: errorEmbed });
      profile.coins += converted;
      profile.blockgame.blocks = profile.blockgame.blocks % 10;
    } else if (argument == "half") {
      // Converting half
      converted = (profile.blockgame.blocks / 20) | 0;
      if (converted == 0) return message.reply({ embeds: errorEmbed });
      profile.coins += converted;
      profile.blockgame.blocks -= converted * 10;
    }

    return message.reply({
      embeds: [
        CommandEmbed.success({
          title: "Конвертировано",
          content: `${converted * 10} блоков в ${converted} монет.\nОсталось ${
            profile.blockgame.blocks
          } блоков.`
        })
      ]
    });
  }
}
