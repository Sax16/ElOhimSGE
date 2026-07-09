import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // Archivos subidos (fotos de estudiantes). Nota R1: se sirven públicos, sin auth —
  // aceptable para la instalación de un solo colegio; endurecer si se expone a Internet.
  app.use('/api/files', express.static(join(process.cwd(), 'uploads')));
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Elohim SGE API escuchando en http://localhost:${port}/api`);
}

void bootstrap();
