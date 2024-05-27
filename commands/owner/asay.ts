import { CacheType, CommandInteraction, Message } from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import RebootCommand from "./reboot";
import CommandEmbed from "../../core/Command/CommandEmbed";

export default class Asay extends Command {
  constructor() {
    super(new CommandOptions("asay").setName("Asay").setType({ prefix: true }));

    this.slashCommandInfo
      .setDescription("Sends your message from bot.")
      .addStringOption((o) =>
        o.setName("message").setDescription("Your message").setRequired(true)
      );
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const reboot = Command.getCommandByClass(
      client,
      RebootCommand.prototype
    ) as RebootCommand;
    if (
      !reboot.ownerIds.includes(
        message instanceof Message ? message.author.id : message.user.id
      )
    )
      return message.reply({
        embeds: [
          CommandEmbed.error("You haven't permissions to use that command!")
        ]
      });
    if (message instanceof Message) message.delete().catch();
    else
      message
        .reply({ content: "_ _", ephemeral: true })
        .then(() => message.deleteReply());
    if (args.length) message.channel?.send(args.join(" "));
    else message.channel?.send("\\* Треск сверчков *");
  }
}
