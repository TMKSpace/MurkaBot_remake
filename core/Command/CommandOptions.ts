export default class CommandOptions {
  id: string;
  name: string;
  type: { slash: boolean; prefix: boolean; global: boolean };

  constructor(
    id: string,
    type?: { slash?: boolean; prefix?: boolean; global?: boolean }
  ) {
    this.id = id;
    this.name = id;
    this.type = {
      slash: type?.slash ?? true,
      prefix: type?.prefix ?? false,
      global: type?.global ?? true
    };
  }
  setName(name: string) {
    this.name = name;
    return this;
  }
  setType(type: Partial<typeof this.type> = this.type) {
    this.type = {
      slash: type?.slash ?? true,
      prefix: type?.prefix ?? false,
      global: type?.global ?? true
    };
    return this;
  }
}
