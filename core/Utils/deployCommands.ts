import discord from "discord.js";
import Logger from "../Logger";
import Command from "../Command";
import CustomClient from "../CustomClient";
const log = new Logger("Deploy");

export default (client: CustomClient) => {
  const { devGuildId, token } = client.config.bot;
  const clientId = client.application.id;
  const interactionCommands: discord.Collection<string, Command> =
    client.interCmd;

  const globalCommands: discord.RESTPostAPIApplicationCommandsJSONBody[] = [];
  const devCommands: discord.RESTPostAPIApplicationCommandsJSONBody[] = [];

  interactionCommands.forEach((v: Command) => {
    if (v.type.slash) {
      const data = v.slashCommandInfo.toJSON();
      if (v.type.global) globalCommands.push(data);
      else devCommands.push(data);
    }
  });

  const len = globalCommands.length + devCommands.length;

  const rest = new discord.REST().setToken(token);

  (async () => {
    try {
      log.info(`Started refreshing ${len} application (/) commands.`.gray);

      const globalData: any | { length: number } = await rest.put(
        discord.Routes.applicationCommands(clientId),
        { body: globalCommands }
      );
      const devData: any | { length: number } = await rest
        .put(discord.Routes.applicationGuildCommands(clientId, devGuildId), {
          body: devCommands
        })
        .catch((e) =>
          log.warn("Dev guild id is not set, commands are not loaded.", e)
        );

      log.info(
        `Reloaded: ${globalData.length ?? 0} Global, ${
          devData.length ?? 0
        } Dev commands.`.gray
      );
    } catch (error) {
      log.error(error);
    }
  })();
};
