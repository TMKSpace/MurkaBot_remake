import path from "path";
import fs from "fs";

type dirScannerOptions = {
  ignoreFilters?: string[];
  extensionFilters: string[];
};

export function scanDirectory(directory: string, options: dirScannerOptions) {
  const collected: string[] = [];

  const files = fs.readdirSync(directory, { recursive: true });
  files.forEach((buffer) => {
    const filepath = path.resolve(directory, buffer.toString());
    const stat = fs.lstatSync(filepath);

    if (stat.isDirectory()) return;

    if (options.ignoreFilters)
      for (let part of filepath.split(path.sep)) {
        for (let filter of options.ignoreFilters) {
          if (part.endsWith(filter)) return;
        }
      }

    for (let filter of options.extensionFilters) {
      if (filepath.endsWith(filter)) return collected.push(filepath);
    }
  });
  return collected;
}
