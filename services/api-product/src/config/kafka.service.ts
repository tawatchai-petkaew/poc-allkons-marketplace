import { INestApplication } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Type, awsIamAuthenticator } from '@jm18457/kafkajs-msk-iam-authentication-mechanism'
import * as dotenv from 'dotenv'

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const consumerGroup = process.env.KAFKA_CONSUMER;

const region = process.env.KAFKA_REGION || 'ap-southeast-1';
const provider = awsIamAuthenticator({
  region,
  credentials: {
    accessKeyId: process.env.KAFKA_ACCESS_KEY,
    secretAccessKey: process.env.KAFKA_SECRET_KEY,
  }
});

function getBrokers(): string[] {
  const env = process.env.ENV_TYPE;
  const brokers = [
    process.env.KAFKA_BROKER1,
    process.env.KAFKA_BROKER2,
  ];

  if (env === 'uat' || env === 'prod') {
    brokers.push(process.env.KAFKA_BROKER3);
  }

  return brokers.filter(Boolean);
}

async function connectKafkaMicroservice(app: INestApplication) {
      app.connectMicroservice({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'consumer-server',
            brokers: getBrokers(),
            ssl: true,
            sasl: {
              mechanism: Type,
              authenticationProvider: provider,
            },
            retry: {
              retries: 5,
              initialRetryTime: 3000,
              factor: 2,
            },
          },
          consumer: {
            groupId: consumerGroup.replace('-server', ''),
            heartbeatInterval: 3000,
            sessionTimeout: 30000,
            rebalanceTimeout: 60000,
            autoOffsetReset: 'earliest',
            allowAutoTopicCreation: true,
          },
        },
      });
}

export default connectKafkaMicroservice;
