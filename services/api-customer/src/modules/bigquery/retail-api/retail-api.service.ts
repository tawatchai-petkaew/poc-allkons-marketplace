import { Injectable } from '@nestjs/common';
import {
  CatalogServiceClient,
  PredictionServiceClient,
} from '@google-cloud/retail';
import {
  SearchServiceClient,
} from '@google-cloud/retail/build/src/v2alpha';

import { PredictDto } from './dto/predict-dto';
import { SearchDto } from './dto/search-dto';
// import { RetailPredictDto } from './dto/retail-predict.dto';

@Injectable()
export class RetailApiService {
  private readonly catalogClient = new CatalogServiceClient();
  private readonly predictClient = new PredictionServiceClient();
  private readonly searchClient = new SearchServiceClient();

  public async listCatalogs(): Promise<any> {
    const catalogs = await this.catalogClient.listCatalogs({
      parent: `projects/${process.env.GCP_PROJECT_ID}/locations/global`
    });

    return catalogs;
  }

  public async callPredict(predictDto: PredictDto): Promise<any> {
    // const { placement, userEvent } = request;
    const placement = `projects/${process.env.GCP_PROJECT_ID}/locations/global/catalogs/default_catalog/servingConfigs/${predictDto.servingConfigsId}`;
    const userEvent = {
      eventType: predictDto.userEvent.eventType,
      visitorId: predictDto.userEvent.visitorId,
      // "userInfo": {
      //     "userId": "USER_ID",
      //     "ipAddress": "IP_ADDRESS",
      //     "userAgent": "USER_AGENT"
      // },
      // "experimentIds": "EXPERIMENT_GROUP",
      productDetails: predictDto.userEvent.productDetails
    };

    const pageSize = predictDto.pageSize;
    const pageToken = predictDto.pageToken;
    const filter = predictDto.filter;
    const validateOnly = predictDto.validateOnly;
    const params = predictDto.params;
    const labels = predictDto.labels;

    //example

    // const userEvent = {
    //   eventType: "detail-page-view",
    //   visitorId: "bjbs_group1_visitor1",
    //   // "userInfo": {
    //   //     "userId": "USER_ID",
    //   //     "ipAddress": "IP_ADDRESS",
    //   //     "userAgent": "USER_AGENT"
    //   // },
    //   // "experimentIds": "EXPERIMENT_GROUP",
    //   productDetails: [{
    //       product: {
    //         id: 'GGCOGOAC101259'
    //       }
    //   }]
    // }
    // const pageSize = 1234
    // const pageToken = 'abc123'
    // const filter = 'abc123'
    // const validateOnly = true
    // const params = [1,2,3,4]
    // const labels = [1,2,3,4]

    const predictionRequest = {
      placement,
      userEvent,
      validateOnly,
      filter,
      params: {
        ...params,
        filterSyntaxV2: {
          boolValue: true
        },
        strictFiltering: {
          boolValue: true
        },
        returnProduct: {
          boolValue: true
        }
      },
      labels,
      pageToken,
      pageSize
    };

    const response = await this.predictClient.predict(predictionRequest);
    return response;
  }

  public async callSearch(searchDto: SearchDto): Promise<any> {
    const placement = `projects/${process.env.GCP_PROJECT_ID}/locations/global/catalogs/default_catalog/placements/default_search`;
    const visitorId = searchDto.visitorId || "1";
    const query = searchDto.query
    const pageSize = searchDto.pageSize;
    const pageToken = searchDto.pageToken;
    const filter = searchDto.filter;
    const offset = searchDto.offset;

    const searchRequest = {
      placement,
      visitorId,
      query,
      filter,
      pageToken,
      pageSize,
      offset
    };

    const response = await this.searchClient.search(searchRequest, {
      autoPaginate: false
    })
    return response;
  }
}
