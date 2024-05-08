import { Message, CommandInteraction, CacheType } from "discord.js";
import Command from "../core/Command";
import CommandOptions from "../core/Command/CommandOptions";
import CustomClient from "../core/CustomClient";
import CommandEmbed from "../core/Command/CommandEmbed";

type commandHelp = {
  aliases: {
    prefix?: string[];
    slash?: string;
  };
  description: string;
};

export default class HelpCommand extends Command {
  help: Map<string, commandHelp>;

  constructor() {
    super(new CommandOptions("help").setType({ prefix: true }));

    this.slashCommandInfo.setDescription("Shows help.");
    this.prefixCommandInfo.addAlias("хелп");

    this.help = new Map();
  }

  async onInit(client: CustomClient): Promise<void> {
    client.prefCmd.concat(client.interCmd).forEach((command, key) => {
      const commandHelp: commandHelp = {
        aliases: {},
        description: command.slashCommandInfo.description
      };
      if (command.type.prefix) {
        const names = command.prefixCommandInfo.names;
        commandHelp.aliases.prefix = names;
      }
      if (command.type.slash) {
        commandHelp.aliases.slash = command.slashCommandInfo.name;
      }
      this.help.set(key, commandHelp);
    });
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    message.reply({
      embeds: [
        CommandEmbed.info({
          title: "Help"
        }).addFields(
          [...this.help.entries()].map(([key, cmd]) => ({
            name: key,
            value:
              cmd.description +
              "\n" +
              (cmd.aliases.prefix
                ? "Prefix: `" +
                  cmd.aliases.prefix
                    .map((v) => client.config.bot.prefix + v)
                    .join(", ") +
                  "`\n"
                : "") +
              (cmd.aliases.slash ? "Slash: `/" + cmd.aliases.slash + "`" : "")
          }))
        )
      ]
    });
  }
}
