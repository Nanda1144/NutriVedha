import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Lightweight collection-based store.
 * Persists JSON to ./data/<collection>.json so data survives restarts.
 * This is a MongoDB stand-in; swap `adapter` to Mongoose when MONGODB_URI is set.
 */
class Collection<T extends { id: string }> {
  private items: T[] = [];
  private file: string;

  constructor(private name: string, private dir: string) {
    this.file = path.join(dir, `${name}.json`);
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.file)) {
        this.items = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      }
    } catch {
      this.items = [];
    }
  }

  private persist() {
    fs.mkdirSync(this.dir, { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.items, null, 2));
  }

  newId(): string {
    return crypto.randomUUID();
  }

  insert(doc: T): T {
    this.items.push(doc);
    this.persist();
    return doc;
  }

  findById(id: string): T | undefined {
    return this.items.find((i) => i.id === id);
  }

  find(filter?: Partial<T>): T[] {
    if (!filter) return [...this.items];
    return this.items.filter((i) =>
      Object.entries(filter).every(([k, v]) => (i as Record<string, unknown>)[k] === v)
    );
  }

  findOne(filter: Partial<T>): T | undefined {
    return this.find(filter)[0];
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.items[idx] = { ...this.items[idx], ...patch, id } as T;
    this.persist();
    return this.items[idx];
  }

  remove(id: string): boolean;
  remove(filter: Partial<T>): number;
  remove(idOrFilter: string | Partial<T>): boolean | number {
    if (typeof idOrFilter === 'string') {
      const before = this.items.length;
      this.items = this.items.filter((i) => i.id !== idOrFilter);
      const removed = this.items.length < before;
      if (removed) this.persist();
      return removed;
    }
    const before = this.items.length;
    this.items = this.items.filter(
      (i) => !Object.entries(idOrFilter).every(([k, v]) => (i as Record<string, unknown>)[k] === v)
    );
    const removed = before - this.items.length;
    if (removed > 0) this.persist();
    return removed;
  }
}

class MemDB {
  private dir: string;

  constructor() {
    this.dir = path.resolve(__dirname, '../../data');
  }

  collection<T extends { id: string }>(name: string): Collection<T> {
    return new Collection<T>(name, this.dir);
  }
}

const db = new MemDB();
export { MemDB };
export default db;
