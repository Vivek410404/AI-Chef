import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const logger = new Logger('RasoiIQ-API');
  const app = await NestFactory.create(AppModule);

  // Cookie parser middleware for HttpOnly auth cookies
  app.use(cookieParser());

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: true,
    credentials: true
  });

  // Global prefix for all REST endpoints
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`====================================================`);
  logger.log(`🍲 RasoiIQ Backend API running at: http://localhost:${port}/api`);
  logger.log(`🥗 Regional Indian Recipes & Smart Grocery Engine Active`);
  logger.log(`🤖 AI Engine: Gemini Free Tier + Deterministic Fallback`);
  logger.log(`🔐 Phase 5.0: Public Auth, Sessions & Identity Active`);
  logger.log(`====================================================`);
}

bootstrap();
