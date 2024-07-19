import "colors";

export default class Logger {
  name: string;

  private static get time() {
    const dat = new Date();
    return [dat.getHours(), dat.getMinutes(), dat.getSeconds()]
      .map((i) => (i < 10 ? "0" + i : i))
      .join(":");
  }

  constructor(name = "") {
    this.name = name;
  }
  info = (...data: any) => {
    console.log(`[INFO ${Logger.time}]`, `[${this.name}]`, ...data);
    return data.join(" ").toString();
  };
  warn = (...data: any) => {
    console.log(`[WARN ${Logger.time}]`.yellow, `[${this.name}]`, ...data);
    return data.join(" ").toString();
  };
  error = (...data: any) => {
    console.log(`[ERROR ${Logger.time}]`.red, `[${this.name}]`, ...data);
    return data.join(" ").toString();
  };
}
