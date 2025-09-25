import { readFileSync } from "fs";
import { parse } from "yaml";
import { resolve } from "path";

export interface Provider {
  name: string;
  authToken: string;
  baseURL: string;
}

export interface Config {
  providers: Provider[];
}

export function loadConfig(configPath: string = "config.yml"): Config {
  const absolutePath = resolve(configPath);
  const content = readFileSync(absolutePath, "utf-8");
  return parse(content) as Config;
}