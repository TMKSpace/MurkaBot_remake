import { ColorResolvable, EmbedBuilder } from "discord.js";

type EmbedOptions = {
  title?: string;
  content?: string;
  color?: ColorResolvable;
  image?: string;
};

export default class CommandEmbed {
  static embed(options: EmbedOptions) {
    if (typeof options == "string") options = { content: options };
    return new EmbedBuilder()
      .setColor(options.color ?? null)
      .setTitle(options.title ?? null)
      .setDescription(options.content ?? null)
      .setImage(options.image ?? null)
      .setTimestamp()
      .setFooter({ text: "Все права обмяуканы 2023-2024" });
  }
  static error(options: EmbedOptions) {
    return this.embed(options).setColor(options.color ?? 0xff0000);
  }
  static warn(options: EmbedOptions) {
    return this.embed(options).setColor(options.color ?? 0xffff00);
  }
  static success(options: EmbedOptions) {
    return this.embed(options).setColor(options.color ?? 0x00ff00);
  }
  static info(options: EmbedOptions) {
    return this.embed(options).setColor(options.color ?? 0x0000ff);
  }
}
