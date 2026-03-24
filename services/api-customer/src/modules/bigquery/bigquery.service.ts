import { Injectable } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import config from './config/bq.config';

require('dotenv').config();

@Injectable()
export class BigqueryService {
  private readonly bigquery = new BigQuery();

  async query(sqlQuery: string) {
    const options = {
      query: sqlQuery
    };

    const [rows] = await this.bigquery.query(options);
    return rows;
  }

  async insertEvent(eventData: any, currentmerchantslug: string) {
    const datasetId = process.env.BIG_QUERY_INSERT_EVENT_DATASET_ID;
    const tableId = process.env.BIG_QUERY_INSERT_EVENT_TABLE_ID;
    const data = {
      ...eventData,
      eventTime: new Date(),
      attributes: [
        {
          key: 'merchantSlug',
          value: {
            text: [`${currentmerchantslug}`]
          }
        }
      ]
    };

    const [apiResponse] = await this.bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert(data);

    return apiResponse;
  }

  async insertProducts(products: any[]) {
    console.log('Start insert product');
    const datasetId = process.env.BIG_QUERY_INSERT_PRODUCT_DATASET_ID;
    const tableId = process.env.BIG_QUERY_INSERT_PRODUCT_TABLE_ID;

    if (datasetId && tableId) {
      const rows = products.map((product) => ({
        title: product?.name || '-',
        id: `${product.id || '-'}`,
        categories: [`${product.productCategory?.name}`],
        attributes: [
          {
            key: 'merchantSlug',
            value: {
              text: [`${product.merchant?.slug}`]
            }
          }
        ],
        description: product?.highlight,
        priceInfo: {
          price: product?.minFinalProductPrice
        }
      }));
  
      const [apiResponse] = await this.bigquery
        .dataset(datasetId)
        .table(tableId)
        .insert(rows);
  
      console.log(apiResponse);
  
      return apiResponse;
    }
  }
}
