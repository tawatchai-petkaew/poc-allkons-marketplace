import { ContinuationLocalStorage } from 'asyncctx';
import { Request, Response } from 'express';

export class RequestContext {
  static cls = new ContinuationLocalStorage<RequestContext>();

  static get currentContext() {
    return this.cls.getContext();
  }

  readonly requestId: number;

  constructor(public readonly req: Request, public readonly res: Response) {
    this.requestId = Date.now();
  }
}
