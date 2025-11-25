import { generateLog } from "./logUtils.js";

export function createService(name: string, intervalMs: number, dependency?: string) {
  console.log(`Service ${name} started...`);

  setInterval(() => {
    const log = generateLog(name, dependency);
    console.log(JSON.stringify(log));
  }, intervalMs);
}
