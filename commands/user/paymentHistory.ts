import { Message, CommandInteraction, CacheType, User } from "discord.js";
import Command from "../../core/Command";
import CommandOptions from "../../core/Command/CommandOptions";
import CustomClient from "../../core/CustomClient";
import CommandEmbed from "../../core/Command/CommandEmbed";
import UserUtils from "../../core/UserUtils";
import GuildCacheUtil from "../../core/GuildCache";

export const provider = "ui_payhist";

export class Payment {
  type: "incoming" | "outcoming";
  time: string;
  value: number;
  target: string;

  constructor(type: "incoming" | "outcoming", value: number, target: string) {
    this.type = type;
    this.time = new Date().toLocaleString().split(",").join(", в");
    this.value = value;
    this.target = target;
  }
}

type Payments = {
  payments: Payment[];
};

export default class PayHistoryCommand extends Command {
  constructor() {
    super(new CommandOptions("payhistory", { prefix: true }));

    this.slashCommandInfo
      .setDescription("Check your/another user payment history.")
      .addUserOption((o) =>
        o.setName("user").setDescription("User to check his payment history")
      );

    this.prefixCommandInfo
      .addAlias("payhist")
      .addAlias("историяпереводов")
      .addAlias("переводы");
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    const user = await UserUtils.getUser(message, args[0]);
    if (user.bot)
      return message.reply({
        embeds: [CommandEmbed.error("Пользователь - бот =/")]
      });

    const payments = this.getUserPayments(message, user.id).payments;

    const ReturnEmbed = CommandEmbed.info({
      title: "История переводов " + user.username
    }).addFields(
      ...payments.slice(-25).map((v) => ({
        name:
          v.type == "incoming"
            ? `${v.target} перевёл вам`
            : `Вы перевели ${v.target}`,
        value: `${v.value} монет\n` + v.time
      }))
    );

    if (!ReturnEmbed.data.fields?.length)
      ReturnEmbed.addFields({
        name: "Переводов не найдено",
        value:
          "Для перевода монет другим пользователям воспользуйтесь командой pay."
      });

    message.reply({ embeds: [ReturnEmbed] });
  }

  getUserPayments(message: Message | CommandInteraction, userid?: string) {
    const uid =
      userid ??
      (message instanceof Message ? message.author.id : message.user.id);
    let payments = GuildCacheUtil.getGuildData<Payments>(
      message,
      provider,
      uid
    );
    if (!payments) payments = { payments: [] };
    return payments;
  }

  saveUserPayments(
    message: Message | CommandInteraction,
    payments: Payments,
    userid?: string
  ) {
    const uid =
      userid ??
      (message instanceof Message ? message.author.id : message.user.id);
    GuildCacheUtil.saveGuildData(message, provider, uid, payments);
  }

  createPayment(
    message: Message | CommandInteraction,
    target: User,
    amount: number
  ) {
    const aPayments = this.getUserPayments(message);
    const bPayments = this.getUserPayments(message, target.id);

    const messageAuthor =
      message instanceof Message ? message.author : message.user;

    const aPayment = new Payment("outcoming", amount, target.username);
    const bPayment = new Payment("incoming", amount, messageAuthor.username);

    aPayments.payments.push(aPayment);
    bPayments.payments.push(bPayment);

    this.saveUserPayments(message, aPayments);
    this.saveUserPayments(message, bPayments, target.id);
  }
}
