import { Queue, Worker, ConnectionOptions } from 'bullmq'

export type QueueName = 'discovery' | 'scan' | 'parse' | 'analyze' | 'security'

export interface QueueConfig {
  concurrency: number
  maxRetries: number
  backoff: 'exponential' | 'fixed'
  backoffDelay?: number
}

export const queueConfigs: Record<QueueName, QueueConfig> = {
  discovery: { concurrency: 1, maxRetries: 3, backoff: 'exponential' },
  scan: { concurrency: 5, maxRetries: 2, backoff: 'exponential' },
  parse: { concurrency: 10, maxRetries: 3, backoff: 'exponential' },
  analyze: { concurrency: 3, maxRetries: 2, backoff: 'exponential' },
  security: { concurrency: 5, maxRetries: 2, backoff: 'exponential' },
}

export function createQueue(
  name: QueueName,
  connection: ConnectionOptions
): Queue {
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: queueConfigs[name].maxRetries,
      backoff: {
        type: queueConfigs[name].backoff,
        delay: queueConfigs[name].backoffDelay ?? 5000,
      },
      removeOnComplete: { age: 3600 * 24 * 3 },   // keep 3 days
      removeOnFail: { age: 3600 * 24 * 7 },         // keep 7 days
    },
  })
}

export type QueueWorkerHandler<T = unknown> = (job: { id?: string; data: T }) => Promise<void>

export function createWorker<T>(
  name: QueueName,
  handler: (job: { id?: string; data: T }) => Promise<void>,
  connection: ConnectionOptions
): Worker {
  return new Worker(name, async (job) => {
    await handler({ id: job.id, data: job.data })
  }, {
    connection,
    concurrency: queueConfigs[name].concurrency,
  })
}
