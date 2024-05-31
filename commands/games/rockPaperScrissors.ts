import {
  Message,
  CommandInteraction,
  CacheType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import UserInfoCommand from "../user/userInfo";
import UserUtils from "../../core/UserUtils";

export default class RockPaperScrissorsCommand extends Command {
  constructor() {
    super(
      new CommandOptions("rockpaperscissors", { prefix: true }).setName(
        "RockPaperScissors"
      )
    );

    this.slashCommandInfo
      .setDescription("Creates rock paper scissors game.")
      .addUserOption((o) =>
        o.setName("user").setDescription("User you want to fight with.")
      )
      .addStringOption((o) =>
        o
          .setName("option")
          .setDescription("Additional options")
          .addChoices({ name: "Stats", value: "stats" })
      );
    this.prefixCommandInfo
      .addAlias("каменьножницыбумага")
      .addAlias("кнб")
      .addAlias("rps-селёдка-не-ругайся-блять");
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const elements = ["rocks", "paper", "scissors"];

    const user = UserUtils.getUser(message, args[0]);

    const row = this.createButtonRow(...elements);
  }

  private createButtonRow(...ids: string[]) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...ids.map((v) =>
        new ButtonBuilder()
          .setLabel(v.charAt(0).toUpperCase() + v.slice(1))
          .setCustomId(v)
          .setStyle(ButtonStyle.Primary)
      )
    );
  }
}
