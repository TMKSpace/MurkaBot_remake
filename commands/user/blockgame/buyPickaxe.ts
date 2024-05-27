import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../../../core/Command";
import CommandOptions from "../../../core/Command/CommandOptions";
import CustomClient from "../../../core/CustomClient";
import UserInfoCommand from "../userInfo";
import CommandEmbed from "../../../core/Command/CommandEmbed";

export default class BuyPickaxeCommand extends Command {
  constructor() {
    super(new CommandOptions("buypick").setType({ prefix: true }));

    this.prefixCommandInfo.addAlias("bp").addAlias("купитькирку");
    this.slashCommandInfo.setDescription("Buy pickaxe to start the game!");
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
    if (profile.blockgame.picklevel > 0)
      return message.reply({
        embeds: [CommandEmbed.error({ content: "У вас уже есть кирка!" })]
      });
    if (profile.coins < 10)
      return message.reply({
        embeds: [
          CommandEmbed.error({
            content: `У вас не достаточно монет для приобретения кирки!\nНеобходимо: ${
              10 - profile.coins
            }/10.`
          })
        ]
      });
    profile.coins -= 10;
    profile.blockgame.picklevel++;
    profile.blockgame.bpm++;
    message.reply({
      embeds: [CommandEmbed.success({ content: "Вы успешно купили кирку!" })]
    });
    ui.saveUserData();
  }
}
