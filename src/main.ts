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

  // API prefix
  app.setGlobalPrefix('api/v1');

  // uploads
  app.use('/api/v1/uploads', express.static(join(process.cwd(), 'uploads')));

  // 🔹 FRONTEND static (TO‘G‘RI PATH)
  app.use(
    express.static(join(process.cwd(), '..', 'CLASSMATES-FRONTEND', 'dist')),
  );

  // 🔹 EXPRESS instance
  const server = app.getHttpAdapter().getInstance();

  // 🔹 React router fallback (Express v5 SAFE)
  server.get(/^(?!\/api).*/, (req: Request, res: Response) => {
    res.sendFile(
      join(process.cwd(), '..', 'CLASSMATES-FRONTEND', 'dist', 'index.html'),
    );
  });

  // Swagger
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
