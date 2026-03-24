import { Transport } from '@nestjs/microservices';

describe('config/kafka.service (connectKafkaMicroservice)', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  function loadWithMocks() {
    jest.doMock('dotenv', () => ({ config: jest.fn() }));
    jest.doMock('@jm18457/kafkajs-msk-iam-authentication-mechanism', () => ({
      Type: 'aws',
      awsIamAuthenticator: jest.fn(() => 'AUTH_PROVIDER'),
    }));

    let connectKafka: any;
    jest.isolateModules(() => {
       
      connectKafka = require('./kafka.service').default;
    });
    return connectKafka as (app: any) => Promise<void>;
  }

  it('wires KAFKA client with two brokers (non-uat/prod), default region and groupId from env', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ENV_TYPE = 'dev';
    process.env.KAFKA_BROKER1 = 'b1:9092';
    process.env.KAFKA_BROKER2 = 'b2:9092';
    delete process.env.KAFKA_BROKER3; // ensure filtered out
    process.env.KAFKA_REGION = '';
    process.env.KAFKA_ACCESS_KEY = 'AK';
    process.env.KAFKA_SECRET_KEY = 'SK';
    process.env.KAFKA_CONSUMER = 'my-group-server';

    const connectKafka = loadWithMocks();
    const app = { connectMicroservice: jest.fn() } as any;

    await connectKafka(app);

    expect(app.connectMicroservice).toHaveBeenCalledTimes(1);
    const arg = app.connectMicroservice.mock.calls[0][0];

    expect(arg.transport).toBe(Transport.KAFKA);
    expect(arg.options.client.brokers).toEqual(['b1:9092', 'b2:9092']);
    // region default path used in provider (we just ensure sasl structure present)
    expect(arg.options.client.ssl).toBe(true);
    expect(arg.options.client.sasl).toEqual({
      mechanism: 'aws',
      authenticationProvider: 'AUTH_PROVIDER',
    });
    expect(arg.options.client.retry).toEqual({
      retries: 5,
      initialRetryTime: 3000,
      factor: 2,
    });
    expect(arg.options.consumer.groupId).toBe('my-group');
    expect(arg.options.consumer.autoOffsetReset).toBe('earliest');
  });

  it('adds third broker for uat/prod and preserves all consumer options', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ENV_TYPE = 'uat';
    process.env.KAFKA_BROKER1 = 'b1:9092';
    process.env.KAFKA_BROKER2 = 'b2:9092';
    process.env.KAFKA_BROKER3 = 'b3:9092';
    process.env.KAFKA_REGION = 'ap-southeast-1';
    process.env.KAFKA_ACCESS_KEY = 'AK';
    process.env.KAFKA_SECRET_KEY = 'SK';
    process.env.KAFKA_CONSUMER = 'orders-server';

    const connectKafka = loadWithMocks();
    const app = { connectMicroservice: jest.fn() } as any;

    await connectKafka(app);

    const arg = app.connectMicroservice.mock.calls[0][0];
    expect(arg.options.client.brokers).toEqual([
      'b1:9092',
      'b2:9092',
      'b3:9092',
    ]);
    expect(arg.options.consumer.groupId).toBe('orders');
    expect(arg.options.consumer).toEqual(
      expect.objectContaining({
        heartbeatInterval: 3000,
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        allowAutoTopicCreation: true,
      }),
    );
  });
});
