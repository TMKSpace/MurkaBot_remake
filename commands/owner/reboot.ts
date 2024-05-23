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
import owner from "./owner";

export default class RebootCommand extends Command {
  constructor() {
    super(new CommandOptions("reboot").setType({ prefix: true }));

    this.slashCommandInfo.setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );
    this.prefixCommandInfo.setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    if (
      !owner.ownerIds.includes(
        message instanceof Message ? message.author.id : message.user.id
      )
    )
      return message.reply("You are not owner of this bot.");
    ChildProcess.exec(`start cmd /C ${path.resolve("../startbot")}`).unref();
    await message.reply("Bot is rebooting...");
    process.emit("SIGINT");
  }
}
