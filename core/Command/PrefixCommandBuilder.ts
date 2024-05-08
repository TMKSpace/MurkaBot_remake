export default class PrefixCommandBuilder {
  names: string[];

  constructor() {
    this.names = [];
  }

  addAlias(alias: string) {
    this.names.push(alias);
    return this;
  }
  removeAlias(alias: string) {
    if (!this.names.find((v) => v == alias)) return;
    this.names.splice(this.names.indexOf(alias), 1);
  }
}
