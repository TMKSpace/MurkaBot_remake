import {
  CacheType,
  CommandInteraction,
  Message,
  PermissionFlagsBits
} from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import ChildProcess from "child_process";
import path from "path";

export default class RebootCommand extends Command {
  ownerIds: string[];

  constructor() {
    super(new CommandOptions("reboot").setType({ prefix: true }));

    this.ownerIds = ["536257878429007873", "429307451825717250"];
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    if (
      !this.ownerIds.includes(
        message instanceof Message ? message.author.id : message.user.id
      )
    )
      return message.reply("You are not owner of this bot.");
    ChildProcess.exec(`start cmd /C ${path.resolve("../startbot")}`).unref();
    await message.reply("Bot is rebooting...");
    process.emit("SIGINT");
  }
}
