import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { ImportProductBatchStatus } from '@/model/import-product-batch.entity';

export interface BatchStatusEvent {
  batchUuid: string;
  status: ImportProductBatchStatus;
  matchedCount?: number;
  similarCount?: number;
  notFoundCount?: number;
  progress?: number;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class BatchStatusEventService {
  private readonly eventSubject = new Subject<BatchStatusEvent>();

  /**
   * Get observable for batch status events
   */
  getEventStream() {
    return this.eventSubject.asObservable();
  }

  /**
   * Emit batch status update event
   */
  emitStatusUpdate(event: Omit<BatchStatusEvent, 'timestamp'>) {
    this.eventSubject.next({
      ...event,
      timestamp: new Date(),
    });
  }
}