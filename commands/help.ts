import {
  Message,
  CommandInteraction,
  CacheType,
  ApplicationCommand,
  Routes,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType
} from "discord.js";
import Command from "../core/Command";
import CommandOptions from "../core/Command/CommandOptions";
import CustomClient from "../core/CustomClient";
import CommandEmbed from "../core/Command/CommandEmbed";
import { sep, join } from "path";
import { lstatSync } from "fs";
import UserUtils from "../core/UserUtils";

// Options
const color = "#0000FF";

class CommandHelp {
  aliases: {
    prefix?: string[];
    slash?: string;
  };
  description: string;

  category: string;

  constructor(command: Command) {
    this.aliases = {};
    this.description = command.description();
    this.category = "main";

    this.registerAliases(command);
    this.registerCategory(command);
  }

  registerAliases(command: Command) {
    if (command.type.prefix) {
      this.aliases.prefix = command.prefixCommandInfo.names;
    }
    if (command.type.slash) {
      this.aliases.slash = command.slashCommandInfo.name;
    }
  }

  registerCategory(command: Command) {
    const relativePath = command.path?.slice(
      process.cwd().length + 1
    ) as string; // commands/<Category>/command.ts || commands/command.ts for main category.

    const pathParts = relativePath.split(sep); // ["commands", "<Category>?", "command.ts"]
    if (
      pathParts[1].endsWith(".js" || ".ts") &&
      lstatSync(join(pathParts[0], pathParts[1])).isFile()
    ) {
      return;
    } // Check if <Category> exists.

    this.category = pathParts[1];
  }
}

export default class HelpCommand extends Command {
  help: Map<string, CommandHelp>;
  categories: string[] = [];

  constructor() {
    super(new CommandOptions("help").setType({ prefix: true }));

    this.slashCommandInfo
      .setDescription("Shows help.")
      .addStringOption((o) =>
        o.setName("commandname").setDescription("Command name")
      );
    this.prefixCommandInfo.addAlias("хелп");

    this.help = new Map();
  }

  async onInit(client: CustomClient): Promise<void> {
    client.prefCmd.concat(client.interCmd).forEach((command, key) => {
      const commandHelp: CommandHelp = new CommandHelp(command);

      if (!this.categories.includes(commandHelp.category))
        this.categories.push(commandHelp.category);

      this.help.set(key, commandHelp);
    });
  }

  async run(
    message: CommandInteraction<CacheType> | Message<boolean>,
    args: string[],
    client: CustomClient
  ): Promise<any> {
    // Получение команды из аргументов
    const commandName = args[0];
    const command = commandName
      ? [...this.help.values()].find(
          (v) =>
            v.aliases.prefix?.includes(commandName) ||
            v.aliases.slash == commandName
        )
      : undefined;

    // Получение всех команд бота
    const commands = (await client.rest.get(
      Routes.applicationCommands(client.user.id)
    )) as ApplicationCommand[];

    // Если есть аргумент
    if (command) {
      return message.reply({
        embeds: [
          CommandEmbed.info({
            color,
            title: command.aliases.slash ?? command.aliases.prefix?.[0],
            content: this.generateCommandDescription(command, message, commands)
          })
        ]
      });
    } else if (commandName) {
      return message.reply({
        embeds: [CommandEmbed.error("Command not found.")]
      });
    }

    // Иначе показываем все команды
    // В перспективе добавить menus action и перелистывать категории. Но их ещё как то нужно добавить. UPD: добавил, теперь листинг. UPD: Я машина нахуй.
    const commandsInCategories = this.categories.map((category) =>
      [...this.help.entries()]
        .filter(([_key, cmd]) => cmd.category == category)
        .map(([_key, cmd]) => this.getSlashORPrefix(cmd, message, commands))
        .join(", ")
    );

    const allcommands = CommandEmbed.blankEmbed()
      .setTitle("Help - All commands")
      .addFields(
        this.categories.map((category, index) => ({
          name: category,
          value: commandsInCategories[index]
        }))
      )
      .setColor(color);

    const categoryselect = new StringSelectMenuBuilder()
      .setCustomId("category")
      .setPlaceholder("Выберите категорию")
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel("all").setValue("all"),
        ...this.categories.map((category) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(category)
            .setValue(category)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      categoryselect
    );

    const response = await message.reply({
      embeds: [allcommands],
      components: [row]
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) => i.user.id == UserUtils.getUserFromMessage(message).id,
      time: 180_000
    });

    collector.on("collect", (i) => {
      const selection = i.values[0] as string;

      const embed =
        selection == "all"
          ? allcommands
          : CommandEmbed.blankEmbed()
              .setTitle("Help - " + selection)
              .addFields(
                [...this.help.entries()]
                  .filter(([_k, cmd]) => cmd.category == selection)
                  .map(([key, cmd]) => ({
                    name: key,
                    value: this.generateCommandDescription(
                      cmd,
                      message,
                      commands
                    ),
                    inline: true
                  }))
              )
              .setColor(color);

      if (!embed.data.fields?.length)
        embed.addFields({
          name: "Не найдено",
          value: "Вероятно в этой категории нет команд!"
        });

      i.update({ embeds: [embed] });
    });
  }

  // Генерируем описание команды с использованиями
  private generateCommandDescription(
    cmd: CommandHelp,
    message: Message | CommandInteraction,
    commands: ApplicationCommand[]
  ) {
    const prefixAliases = cmd.aliases.prefix
      ?.map((v) => (message.client as CustomClient).config.bot.prefix + v)
      .join(", "); // Хуйня посложнее, выводит чё то типа "'help, 'хелп"

    const slashAlias =
      "</" +
      cmd.aliases.slash +
      ":" +
      commands.find((v) => v.name == cmd.aliases.slash)?.id +
      ">"; // Не очень сложная хуйня, выводит чё то типа "</help:0>".

    return (
      // Описание
      `${cmd.description}\n` +
      // Если есть, префиксы
      (cmd.aliases.prefix ? `Prefix: \`${prefixAliases}\`\n` : "") +
      // Если есть, слеш
      (cmd.aliases.slash ? `Slash: ${slashAlias}\n` : "")
    );
  }

  private getSlashORPrefix(
    cmd: CommandHelp,
    message: Message | CommandInteraction,
    commands: ApplicationCommand[]
  ) {
    if (cmd.aliases.slash)
      return (
        "</" +
        cmd.aliases.slash +
        ":" +
        commands.find((v) => v.name == cmd.aliases.slash)?.id +
        ">"
      );
    else if (cmd.aliases.prefix)
      return (
        (message.client as CustomClient).config.bot.prefix +
        cmd.aliases.prefix[0]
      );
    return "";
  }
}
