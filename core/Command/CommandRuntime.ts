import { ApplicationCommandOptionType, messageLink } from "discord.js";
import Config from "../Config";
import CustomClient from "../CustomClient";
import Logger from "../Logger";
import Command from ".";
import CommandEmbed from "./CommandEmbed";
const log = new Logger("CommandRuntime");

export default class CommandRuntime {
  client: CustomClient;
  config: Config;

  constructor(client: CustomClient, config: Config) {
    this.client = client;
    this.config = config;
  }

  async listenSlashCommands() {
    return this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      const command = this.client.interCmd.get(interaction.commandName);
      if (!command) {
        interaction.reply({
          content: `Command ${interaction.commandName} doesn't exist!`,
          ephemeral: true
        });
        log.error(
          `No command matching "${interaction.commandName}" was found.`.gray
        );
        return;
      }
      try {
        if (command.runSlash)
          command.runSlash(interaction, this.client).catch(log.error);
        if (command.run) {
          const args = Command.interactionToArgs(interaction);
          command.run(interaction, args, this.client).catch(log.error);
        }
      } catch (err) {
        log.error(interaction.commandName.red, "throwed exception".red, err);

        const errorMessage = {
          content: "This command is not working...",
          ephemeral: true
        };

        if (interaction.replied) interaction.followUp(errorMessage);
        else interaction.reply(errorMessage);
      }
    });
  }

  async listenPrefixCommands() {
    const prefix = this.config.bot.prefix;

    this.client.on("messageCreate", async (msg) => {
      if (msg.author.bot || !msg.content.startsWith(prefix) || msg.webhookId)
        return;

      const args = msg.content.slice(prefix.length).split(" ");
      const commandName = args[0].toLowerCase();
      const command = this.client.prefCmd.find((c) =>
        c.prefixCommandInfo.names.includes(commandName)
      );
      if (!command) return;

      if (
        command.prefixCommandInfo.permission &&
        !msg.member?.permissions.has(command.prefixCommandInfo.permission)
      ) {
        msg.reply({
          embeds: [
            CommandEmbed.error({
              content: "You haven't permissions to use that command!"
            })
          ]
        });
        return;
      }

      args.shift();
      try {
        if (command.runPrefix)
          command.runPrefix(msg, args, this.client).catch(log.error);
        if (command.run) command.run(msg, args, this.client).catch(log.error);
      } catch (err) {
        log.error(commandName.red, "throwed exception".red, err);
        msg.reply("This command is not working...");
      }
    });
  }
}
