// scripts/seed.ts
import * as _ from 'lodash';
import { createConnection, ConnectionOptions } from 'typeorm';

import { configService } from '../../config/config.service';

import { OrderItem } from '../../model/order-item.entity';

async function run() {
  const opt = {
    ...configService.getTypeOrmConfig(),
    debug: true
  };

  const connection = await createConnection(opt as ConnectionOptions);
  const orderItemRepository = connection.getRepository(OrderItem);

  const orderItems = await orderItemRepository.find({
    relations: [
      'productItem',
      'productItem.product',
      'productItem.product.productTranslations'
    ]
  });

  await Promise.all(
    orderItems?.map(async (orderItem) => {
      if (
        orderItem.quantity !== null &&
        orderItem.quantity !== undefined &&
        orderItem.productItem !== null &&
        orderItem.productItem !== undefined &&
        orderItem.unit !== null &&
        orderItem.unit !== undefined &&
        (orderItem.smallUnitQuantity === null ||
          orderItem.smallUnitQuantity === undefined)
      ) {
        if (
          orderItem.unit ===
          orderItem.productItem?.product?.productTranslations[0]?.unit
        ) {
          const dto = {
            smallUnitQuantity: orderItem.quantity
          };

          console.log(`Update order item: ${orderItem.id}`);

          await orderItemRepository.save(Object.assign(orderItem, dto));
        } else if (
          orderItem.unit !==
            orderItem.productItem?.product?.productTranslations[0]?.unit &&
          orderItem.productItem?.product?.piecePerBigUnit
        ) {
          const dto = {
            smallUnitQuantity:
              orderItem.quantity * orderItem.productItem.product.piecePerBigUnit
          };

          console.log(`Update order item: ${orderItem.id}`);

          await orderItemRepository.save(Object.assign(orderItem, dto));
        }
      }
    })
  );
}

run()
  .then((_) => console.log('...wait for script to exit'))
  .catch((error) => console.error('migration error', error));
