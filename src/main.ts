import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import { Request, Response } from 'express';

async function start() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.use('/api/v1/uploads', express.static(join(process.cwd(), 'uploads')));

  app.use(
    express.static(join(process.cwd(), '..', 'CLASSMATES-FRONTEND', 'dist')),
  );

  const server = app.getHttpAdapter().getInstance();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('NestJS API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.PORT);
  console.log(`Server running on port: ${config.PORT}`);
}

start();
