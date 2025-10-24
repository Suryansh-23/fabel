import logger from "../utils/logger";

interface Entry { status: "queued" | "in_progress" | "done" | "failed"; ts: number }

export class IdempotencyStore {
  private store = new Map<string, Entry>();
  private ttlMs: number;

  constructor(ttlSeconds = 3600) {
    this.ttlMs = ttlSeconds * 1000;
    setInterval(() => this.sweep(), 60_000).unref();
  }

  get(id: string): Entry | undefined {
    const e = this.store.get(id);
    if (!e) return undefined;
    if (Date.now() - e.ts > this.ttlMs) {
      this.store.delete(id);
      return undefined;
    }
    return e;
  }

  set(id: string, status: Entry["status"]) {
    this.store.set(id, { status, ts: Date.now() });
    logger.debug("Idempotency updated", { id, status });
  }

  private sweep() {
    const now = Date.now();
    let removed = 0;
    for (const [k, v] of this.store.entries()) {
      if (now - v.ts > this.ttlMs) {
        this.store.delete(k);
        removed++;
      }
    }
    if (removed > 0) logger.debug("Idempotency sweep removed entries", { removed });
  }
}

export const globalIdempotency = new IdempotencyStore(3600);

