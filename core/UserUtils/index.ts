import { CommandInteraction, Message, User } from "discord.js";

export default class UserUtils {
  private constructor() {}

  /** @returns Указанного пользователя или пользователя из сообщения */
  static async getUser(
    message: Message | CommandInteraction,
    userid?: string
  ): Promise<User> {
    const users = await message.guild?.members.fetch();
    if (userid && /<@[0-9]+>/i.test(userid))
      userid = /[0-9]+/i.exec(userid)?.[0];
    return userid
      ? users?.get(userid)?.user ??
          users?.find((u) => u.user.username == userid)?.user ??
          this.getUserFromMessage(message)
      : this.getUserFromMessage(message);
  }

  /** @returns ТОЛЬКО указанного пользователя */
  static async getTargetUser(
    message: Message | CommandInteraction,
    userid: string
  ): Promise<User | undefined> {
    const users = await message.guild?.members.fetch();
    if (/<@[0-9]+>/i.test(userid))
      userid = /[0-9]+/i.exec(userid)?.[0] as string;
    return (
      users?.get(userid)?.user ??
      users?.find((u) => u.user.username == userid)?.user
    );
  }

  /** @returns Пользователя из сообщения или взаимодействия с командой */
  static getUserFromMessage(message: Message | CommandInteraction): User {
    return message instanceof Message ? message.author : message.user;
  }
}
