import { INestApplication } from '@nestjs/common';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { QueueName } from '../model/enum/queue-name.enum';

export function setupBullBoard(app: INestApplication) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/api-order/queues');

  const queues = Object.values(QueueName)
    .map((name) => {
      try {
        const queue = app.get<Queue>(getQueueToken(name));
        return new BullAdapter(queue);
      } catch (e) {
        console.warn(`[BullBoard] Queue not found: ${name}`, e.message);
        return null;
      }
    })
    .filter(Boolean) as BullAdapter[];

  createBullBoard({
    queues,
    serverAdapter,
  });

  app.use('/queues', serverAdapter.getRouter());
}
