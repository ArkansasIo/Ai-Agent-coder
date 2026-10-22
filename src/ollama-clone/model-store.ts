import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelRecord } from "./types.js";

export class ModelStore {
  readonly root: string;
  readonly modelsDir: string;

  constructor(root = process.env.OLLAMA_CLONE_HOME ?? join(process.cwd(), ".ollama-clone")) {
    this.root = root;
    this.modelsDir = join(root, "models");
  }

  async init(): Promise<void> {
    await mkdir(this.modelsDir, { recursive: true });
  }

  private path(name: string): string {
    const safe = name.replace(/[^a-zA-Z0-9._:-]/g, "_");
    return join(this.modelsDir, `${safe}.json`);
  }

  async list(): Promise<ModelRecord[]> {
    await this.init();
    const entries = await readdir(this.modelsDir, { withFileTypes: true });
    const records: ModelRecord[] = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      try {
        records.push(JSON.parse(await readFile(join(this.modelsDir, entry.name), "utf8")) as ModelRecord);
      } catch {
        // Ignore corrupt metadata; diagnostics can report it later.
      }
    }
    return records.sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(name: string): Promise<ModelRecord | undefined> {
    try {
      return JSON.parse(await readFile(this.path(name), "utf8")) as ModelRecord;
    } catch {
      return undefined;
    }
  }

  async put(record: ModelRecord): Promise<void> {
    await this.init();
    await writeFile(this.path(record.name), `${JSON.stringify(record, null, 2)}\n`, "utf8");
  }

  async remove(name: string): Promise<boolean> {
    try {
      await rm(this.path(name));
      return true;
    } catch {
      return false;
    }
  }

  async importFile(file: string, name: string): Promise<ModelRecord> {
    const info = await stat(file);
    const bytes = await readFile(file);
    const digest = createHash("sha256").update(bytes).digest("hex");
    const record: ModelRecord = {
      name,
      digest: `sha256:${digest}`,
      size: info.size,
      modified_at: new Date().toISOString(),
      family: "gguf",
      modelfile: `FROM ${file}`
    };
    await this.put(record);
    return record;
  }
}
