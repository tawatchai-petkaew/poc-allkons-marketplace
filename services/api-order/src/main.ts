import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { json } from 'body-parser';
import * as fs from 'fs';
import { createTunnel } from 'tunnel-ssh';
import { AppModule } from './app.module';
import { setupBullBoard } from './bull/bull-board.setup';
import { setupTracing } from 'allkons-api-helper';
import { swaggerBasicAuth } from './middlewares/swagger-auth.middleware';

export async function createSshTunnel(): Promise<void> {
  console.log('Creating SSH tunnel...');
  const sshConfig = {
    host: '10.12.67.169', // Jump host
    port: 22, // SSH port
    username: 'ubuntu', // SSH user
    privateKey: fs.readFileSync('./key-ec2-jump-apse1-allkons-dev.pem'), // Private key path
    readyTimeout: 60000, // Wait up to 60 seconds for connection
    keepaliveInterval: 10000, // Send keepalive every 10 seconds
    keepaliveCountMax: 3, // Close connection after 3 failed keepalives
  };

  const forwardConfig = {
    srcAddr: '127.0.0.1', // Local address
    srcPort: parseInt(process.env.SSH_TUNNEL_PORT || '15401', 10), // Local forwarded port
    dstAddr:
      'rds-psql-apse1-allkons-dev.cbciy6k28x4s.ap-southeast-1.rds.amazonaws.com', // RDS host
    dstPort: 5432, // RDS port
  };
  console.log(
    'Forwarding local port',
    forwardConfig.srcPort,
    'to',
    forwardConfig.dstAddr,
  );

  try {
    console.log('Creating SSH tunnel...');
    const [server, conn] = await createTunnel(
      { autoClose: false, reconnectOnError: true },
      { port: forwardConfig.srcPort },
      sshConfig,
      forwardConfig,
    );
    console.log('SSH tunnel created');

    server.on('connection', () => {
      console.log('New connection through SSH tunnel');
    });

    conn.on('error', (err) => {
      console.error('SSH Connection Error:', err);
    });

    console.log('SSH tunnel established');
  } catch (error) {
    console.error('Error creating SSH tunnel:', error);
    throw error;
  }
}

async function bootstrap() {
  // Use SSH tunnel in local environment for database connection
  if (process.env.IS_ENABLE_SSH_TUNNEL === 'true') {
    await createSshTunnel();
  }

  setupTracing({
    enabled: process.env.ENABLE_JAEGER === 'true',
    endpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    serviceName: process.env.OTEL_ORDER_SERVICE_NAME,
    enablePgInstrumentation: true,
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    // logger: process.env.NODE_ENV === 'production' ? false : undefined
  });

  setupBullBoard(app);

  // Enable Swagger only for dev and sit environments
  const envType = process.env.ENV_TYPE?.toLowerCase();
  if (envType === 'dev' || envType === 'sit') {

    // Setup basic auth for swagger
    app.use('/doc', swaggerBasicAuth);
    
    const config = new DocumentBuilder()
      .setTitle('Shopdit Document API')
      .setDescription('API Doc V1')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'X-API-KEY')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const documentApi = SwaggerModule.createDocument(app, config, {});
    SwaggerModule.setup('doc', app, documentApi, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
  app.enableCors();
  // TODO: error maximum call stack size exceeded
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use(json({ limit: '50mb' }));
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
