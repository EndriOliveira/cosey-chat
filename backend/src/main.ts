import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/wiston.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import envConfig from './config/env.config';
import prisma from './database/client';

// TODO: Implementar slugify
// TODO: Criar rota para apagar & desativar conta

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  const app = await NestFactory.create(AppModule, { logger, cors: true });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cosey Chat')
    .setDescription(
      'Cosey API, a real time chat where you can talk with everybody',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);
  prisma
    .$connect()
    .then(async () => {
      logger.log('Connected to Database');
      await app.listen(envConfig.port);
    })
    .catch(() => {
      logger.error('Could not connect to Database');
    });
}
bootstrap();
