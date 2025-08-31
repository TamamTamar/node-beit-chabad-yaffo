
import fs from 'fs';
class Logger {
  private static isProd = () => process.env.NODE_ENV === "prod";

  static error(message: any) {
    if (this.isProd()) {
      fs.appendFile("logs.txt", message.toString() + "\n", () => { })
      return
    };
    console.error(message);
  }

  static log(message: any) {
    if (this.isProd()) {
      fs.appendFile("logs.txt", message.toString() + "\n", () => { });
      return;
    }
    Logger.log(message);
  }

  static verbose(message: any) {
  }
}

export { Logger };
