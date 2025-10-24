import logger from "../utils/logger";

type TaskFn = () => Promise<void>;

interface TaskItem {
  id: string;
  run: TaskFn;
  enqueuedAt: number;
}

export interface QueueOptions {
  concurrency: number;
  maxSize: number;
}

export class JobQueue {
  private readonly concurrency: number;
  private readonly maxSize: number;
  private running = 0;
  private queue: TaskItem[] = [];

  constructor(opts: QueueOptions) {
    this.concurrency = Math.max(1, opts.concurrency);
    this.maxSize = Math.max(1, opts.maxSize);
  }

  size(): number {
    return this.queue.length + this.running;
  }

  enqueue(id: string, task: TaskFn): boolean {
    // If already enqueued with same id, don't re-enqueue
    if (this.queue.find((t) => t.id === id)) {
      logger.debug("Queue: task already queued, skipping", { id });
      return true;
    }

    // If queue full, drop oldest
    if (this.queue.length >= this.maxSize) {
      const dropped = this.queue.shift();
      logger.warn("Queue full. Dropping oldest task", {
        droppedId: dropped?.id,
        newId: id,
        maxSize: this.maxSize,
      });
    }

    this.queue.push({ id, run: task, enqueuedAt: Date.now() });
    logger.info("Task enqueued", { id, queued: this.queue.length, running: this.running });
    this.pump();
    return true;
  }

  private pump() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.running++;
      logger.debug("Task starting", { id: item.id, running: this.running });
      item
        .run()
        .catch((err) => {
          logger.error("Task failed", { id: item.id, err: (err as Error)?.message });
        })
        .finally(() => {
          this.running--;
          logger.debug("Task finished", { id: item.id, running: this.running });
          // Continue pumping
          this.pump();
        });
    }
  }
}

// Singleton queue with configured defaults
export const globalJobQueue = new JobQueue({ concurrency: 5, maxSize: 15 });

