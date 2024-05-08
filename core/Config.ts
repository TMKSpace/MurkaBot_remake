export default interface Config {
  bot: {
    token: string;
    prefix: string;
    devGuildId: string;
    intents: number[];
  };
  settings: {
    autoDeploy: boolean;
    commandPath: string;
    ignoredCommandDirs: string[];
  };
}

export default class Config {
  constructor() {
    this.bot = {
      token: "PlaceYourTokenHere",
      prefix: "'",
      devGuildId: "",
      intents: [3276799]
    };
    this.settings = {
      autoDeploy: true,
      commandPath: "commands",
      ignoredCommandDirs: [".lib", ".i", ".libs"]
    };
  }
}
