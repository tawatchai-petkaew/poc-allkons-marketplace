import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { CartPublicService } from './cart-public.service';

@Processor('cart-queue')
export class CartPublicConsumer {
  constructor(private readonly cartPublicService: CartPublicService) {}

  @Process({
    name: 'create-cart-item-job',
    concurrency: +process.env.CONCURRENCY_CART_CREATE || 1,
  })
  async createCartItemJob(job: Job<unknown>) {
    console.log('----> Start Create Cart Item Queue');

    if (job.data['mode'] === 'create') {
      return await this.cartPublicService.createCartItem(
        JSON.parse(job.data['dto']),
        job.data['userId'],
        undefined,
        job.data['merchant'],
        job.data['customer'],
        true,
      );
    }

    if (job.data['mode'] === 'update') {
      return await this.cartPublicService.updateCartItem(
        JSON.parse(job.data['id']),
        JSON.parse(job.data['dto']),
        job.data['userId'],
        undefined,
        job.data['merchant'],
        job.data['customer'],
        true,
      );
    }
  }

  // @Process({
  //   name: 'update-cart-item-job',
  //   concurrency: +process.env.CONCURRENCY_CART_CREATE || 1
  // })
  // async updateCartItemJob(job: Job<unknown>) {
  //   console.log('----> Start Create Cart Item Queue');
  //   return await this.cartPublicService.updateCartItem(
  //     JSON.parse(job.data['id']),
  //     JSON.parse(job.data['dto']),
  //     job.data['userId'],
  //     undefined,
  //     job.data['merchant'],
  //     job.data['customer'],
  //     true
  //   );
  // }
}
