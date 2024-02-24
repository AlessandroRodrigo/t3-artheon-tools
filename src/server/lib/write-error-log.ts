import { appendFileSync } from "fs";
import { join } from "path";

export function writeErrorLog(message: string) {
  const logPath = join("./tmp", "error.log");
  appendFileSync(logPath, `${message}\n`);
}
