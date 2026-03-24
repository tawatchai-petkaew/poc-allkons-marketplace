import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';
import expressBasicAuth from 'express-basic-auth';
import { createTunnel } from 'tunnel-ssh';
import { AppModule } from './app.module';
import connectKafkaMicroservice from './config/kafka.service';
import { setupBullBoard } from './config/bull-board.setup';
import {
  AllExceptionsFilter,
  setupTracing,
  TypeORMExceptionFilter,
} from 'allkons-api-helper';

export async function createSshTunnel(): Promise<void> {
  console.log('Creating SSH tunnel...');
  const sshConfig = {
    host: '10.12.67.169', // Jump host
    port: 22, // SSH port
    username: 'ubuntu', // SSH user
    privateKey: fs.readFileSync('./key-ec2-jump-apse1-allkons-dev.pem'), // Private key path
    readyTimeout: 30000, // Wait up to 60 seconds for connection
    keepaliveInterval: 10000, // Send keepalive every 10 seconds
    keepaliveCountMax: 3, // Close connection after 3 failed keepalive
  };

  const forwardConfig = {
    srcAddr: '127.0.0.1', // Local address
    srcPort: parseInt(process.env.SSH_TUNNEL_PORT || '15402', 10), // Local forwarded port
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
    serviceName: process.env.OTEL_PRODUCT_SERVICE_NAME,
    enablePgInstrumentation: true,
  });

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    // logger: process.env.NODE_ENV === 'production' ? false : undefined
  });

  // Enable cookie parser to read cookies from requests
  app.use(cookieParser());

  // Add basic auth middleware for Swagger endpoints
  app.use(
    ['/doc', '/doc-json'],
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USERNAME || 'admin']:
          process.env.SWAGGER_PASSWORD || 'pass',
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Product Service Document API')
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

  // Setup Bull Board for queue monitoring
  setupBullBoard(app);

  // Enable CORS with credentials support for cookie-based authentication
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use(json({ limit: '50mb' }));

  app.useGlobalFilters(new AllExceptionsFilter(), new TypeORMExceptionFilter());

  // add kafka microservice
  if (process.env.ENV_TYPE !== 'dev') {
    await connectKafkaMicroservice(app);
    await app.startAllMicroservices();
    console.log('Kafka microservice connected');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
