import "colors";

export default class Logger {
  name: string;
  private time: string;

  constructor(name = "") {
    this.name = name;
    this.time = "";
  }
  private resetTime = () => {
    const dat = new Date();
    const time = [dat.getHours(), dat.getMinutes(), dat.getSeconds()];
    this.time = time
      .map((i) => {
        if (i.toString().length === 1) return "0" + i;
        return i;
      })
      .join(":");
    return this;
  };
  info = (...data: any) => {
    this.resetTime();
    console.log(`[INFO ${this.time}]`, `[${this.name}]`, ...data);
    return data.join(" ").toString();
  };
  warn = (...data: any) => {
    this.resetTime();
    console.log(`[WARN ${this.time}]`.yellow, `[${this.name}]`, ...data);
    return data.join(" ").toString();
  };
  error = (...data: any) => {
    this.resetTime();
    console.log(`[ERROR ${this.time}]`.red, `[${this.name}]`, ...data);
    return data.join(" ").toString();
  };
}
