import {
  Message,
  CommandInteraction,
  CacheType,
  Events,
  MessageType,
  ChannelType
} from "discord.js";
import Command from "../../../core/Command";
import CommandOptions from "../../../core/Command/CommandOptions";
import CustomClient from "../../../core/CustomClient";
import UserInfoCommand from "../../user/userInfo";

export default class GameEventHandler extends Command {
  constructor() {
    super(new CommandOptions("blockgameeventhandler", { slash: false }));
  }

  async onInit(client: CustomClient): Promise<void> {
    const ui = Command.getCommandByClass(
      client,
      UserInfoCommand.prototype
    ) as UserInfoCommand;

    client.on(Events.MessageCreate, async (message) => {
      if (
        message.author.bot ||
        message.webhookId ||
        message.content.startsWith(client.config.bot.prefix) ||
        message.channel.type == ChannelType.DM
      )
        return;
      this.handleBonusEvent(client, message, ui);
    });
  }

  private handleBonusEvent(
    client: CustomClient,
    message: Message,
    ui: UserInfoCommand
  ) {
    const profile = ui.getUserInfo(message);
    if (profile.blockgame.picklevel <= 0) return;

    const random = Math.random();
    if (random <= 0.013) {
      if (random <= 0.0034) profile.blockgame.bonuses.extra += 1;
      else profile.blockgame.bonuses.simple += 1;
      message.reply("Вы получили бонус!\nВозможно открыть через openbonus.");
    }
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    message.reply({
      content:
        "This command is used as game handler.\nIt does nothing if used as command.",
      ephemeral: true
    });
  }
}
