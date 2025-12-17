import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';

async function start() {
  const app = await NestFactory.create(AppModule);

  // ⚠️ Agar frontend shu backend orqali servis qilinsa,
  // CORS umuman kerak bo‘lmaydi
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Static folder serve (uploads)
  app.use('/api/v1/uploads', express.static(join(process.cwd(), 'uploads')));

  // 🔹 FRONTEND STATIC SERVE (Vite dist)
  app.use(express.static(join(process.cwd(), 'CLASSMATES-FRONTEND', 'dist')));

  // 🔹 React/Vite routing uchun
  app.get('*', (req, res) => {
    res.sendFile(
      join(process.cwd(), 'CLASSMATES-FRONTEND', 'dist', 'index.html'),
    );
  });

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('NestJS API documentation with Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.PORT);
  console.log(`Server running on port: ${config.PORT}`);
  console.log(`Swagger Docs: http://localhost:${config.PORT}/api/docs`);
}

start();
