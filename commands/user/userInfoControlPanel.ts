import { CommandInteraction, CacheType } from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import CommandEmbed from "../../core/Command/CommandEmbed";

export default class UserInfoControlPanelCommand extends Command {
  constructor() {
    super(new CommandOptions("userinfocontrolpanel"));

    this.slashCommandInfo.setDescription("Create user info control panel.");
  }

  async runSlash(
    interaction: CommandInteraction<CacheType>,
    client: CustomClient
  ): Promise<any> {
    interaction.reply({ embeds: [CommandEmbed.info("Не готово.")] });
  }
}
