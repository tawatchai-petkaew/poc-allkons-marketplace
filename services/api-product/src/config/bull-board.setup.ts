import { INestApplication } from '@nestjs/common';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import expressBasicAuth from 'express-basic-auth';

// Queue names used in the application
export enum QueueName {
  FileUploadConsumer = 'file-upload-consumer',
  ImageUploadConsumer = 'image-upload-consumer',
  ProductMatchingQueue = 'product-matching-queue',
  ProductImportQueue = 'product-import-queue',
}

export function setupBullBoard(app: INestApplication) {
  const serverAdapter = new ExpressAdapter();

  // Set base path for reverse proxy support
  const basePath = process.env.BULL_BOARD_BASE_PATH || '';
  serverAdapter.setBasePath((basePath ? basePath : '') + '/queues');

  // Auto-discover and register all queues
  const queues = Object.values(QueueName)
    .map((name) => {
      try {
        const queue = app.get<Queue>(getQueueToken(name));
        return new BullAdapter(queue);
      } catch (e) {
        console.warn(`[BullBoard] Queue not found: ${name}`, e);
        return null;
      }
    })
    .filter(Boolean) as BullAdapter[];

  createBullBoard({
    queues,
    serverAdapter,
  });

  // Mount Bull Board with basic auth
  app.use(
    '/queues',
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.BULL_BOARD_USER || 'admin']:
          process.env.BULL_BOARD_PASS || 'pass',
      },
    }),
    serverAdapter.getRouter(),
  );

  console.log(`[BullBoard] Registered ${queues.length} queues at /queues`);
}
