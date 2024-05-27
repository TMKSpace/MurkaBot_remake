import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../../../core/Command";
import CommandOptions from "../../../core/Command/CommandOptions";
import CustomClient from "../../../core/CustomClient";
import UserInfoCommand from "../userInfo";
import CommandEmbed from "../../../core/Command/CommandEmbed";

export default class OpenBonusCommand extends Command {
  constructor() {
    super(new CommandOptions("openbonus").setType({ prefix: true }));

    this.slashCommandInfo.addStringOption((o) =>
      o
        .setName("bonustype")
        .setDescription("Type of bonus")
        .addChoices(
          { name: "Simple", value: "simple" },
          { name: "Extra", value: "extra" }
        )
        .setRequired(true)
    );
    this.prefixCommandInfo.addAlias("ob").addAlias("открытьбонус");

    this.slashCommandInfo.setDescription(
      "Open bonus crate from your inventory."
    );
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

    const argument = args[0] as "simple" | "extra";
    if (!argument)
      return message.reply({
        embeds: [
          CommandEmbed.info({
            title: "Открытие бонусов",
            content:
              "В данный момент у вас бонусов:" +
              "```json\n" +
              JSON.stringify(profile.blockgame.bonuses, null, 2) +
              "```" +
              `Использование команды: \`${client.config.bot.prefix}openbonus <simple или extra>\``
          })
        ]
      });

    if (argument == "extra" && profile.blockgame.bonuses.extra > 0) {
      const random = Math.floor(Math.random() * 3);
      if (random == 0) {
        const bonusBlocks = Math.floor(Math.random() * 3500) + 500;
        profile.blockgame.blocks += bonusBlocks;
        profile.blockgame.bonuses.extra--;
        return message.reply({
          embeds: [
            CommandEmbed.success({
              title: "Экстра бонус открыт!",
              content: `Получено ${bonusBlocks} блоков.`
            })
          ]
        });
      } else if (random == 1) {
        const bonusCoins = Math.floor(Math.random() * 250) + 50;
        profile.coins += bonusCoins;
        profile.blockgame.bonuses.extra--;
        return message.reply({
          embeds: [
            CommandEmbed.success({
              title: "Экстра бонус открыт!",
              content: `Получено ${bonusCoins} монет.`
            })
          ]
        });
      } else {
        profile.blockgame.bonuses.simple += 2;
        profile.blockgame.bonuses.extra--;
        return message.reply({
          embeds: [
            CommandEmbed.success({
              title: "Экстра бонус открыт!",
              content: `Получено 2 обычных бонуса. Возможно открыть через openbonus.`
            })
          ]
        });
      }
    } else if (argument == "simple" && profile.blockgame.bonuses.simple > 0) {
      if (Math.random() > 0.5) {
        const bonusBlocks = Math.floor(Math.random() * 600) + 150;
        profile.blockgame.blocks += bonusBlocks;
        profile.blockgame.bonuses.simple--;
        return message.reply({
          embeds: [
            CommandEmbed.success({
              title: "Обычный бонус открыт!",
              content: `Получено ${bonusBlocks} блоков.`
            })
          ]
        });
      } else {
        const bonusCoins = Math.floor(Math.random() * 40) + 10;
        profile.coins += bonusCoins;
        profile.blockgame.bonuses.simple--;
        return message.reply({
          embeds: [
            CommandEmbed.success({
              title: "Обычный бонус открыт!",
              content: `Получено ${bonusCoins} монет.`
            })
          ]
        });
      }
    } else {
      return message.reply({
        embeds: [
          CommandEmbed.error({
            title: "Ошибка",
            content:
              "Либо у вас нет бонусов, либо вы ошиблись с командой.\n" +
              `Использование команды: \`${client.config.bot.prefix}openbonus <simple или extra>\``
          })
        ]
      });
    }
  }
}
