export default class Config {
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
      ignoredCommandDirs: [".lib", ".i", "libs"]
    };
  }
}
