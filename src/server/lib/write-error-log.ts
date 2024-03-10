import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export function writeErrorLog(message: string) {
  if (!existsSync("./tmp")) mkdirSync("./tmp");

  const logPath = join("./tmp", "error.log");
  appendFileSync(logPath, `${message}\n`);
}
