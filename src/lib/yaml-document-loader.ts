// Content loader for a single YAML document stored as one entry (e.g. resume.yaml → entry "resume").
// Astro's built-in file() loader treats each top-level key as its own entry, which doesn't fit here.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Loader } from 'astro/loaders';
import { parse } from 'yaml';

export function yamlDocument(path: string, id: string): Loader {
  return {
    name: 'yaml-document',
    load: async ({ store, parseData, generateDigest, watcher, logger, config }) => {
      const absPath = resolve(new URL(config.root).pathname, path);

      const sync = async () => {
        const raw = await readFile(absPath, 'utf8');
        const data = await parseData({ id, data: parse(raw) ?? {}, filePath: path });
        store.clear();
        store.set({ id, data, digest: generateDigest(raw), filePath: path });
      };

      await sync();

      // Dev: reload on save.
      watcher?.add(absPath);
      watcher?.on('change', async (changed) => {
        if (resolve(changed) !== absPath) return;
        try {
          await sync();
          logger.info(`Reloaded ${path}`);
        } catch (err) {
          logger.error(`${path}: ${(err as Error).message}`);
        }
      });
    },
  };
}
