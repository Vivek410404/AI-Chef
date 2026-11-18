import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const logger = new Logger('RasoiIQ-API');
  const app = await NestFactory.create(AppModule);

  // Cookie parser middleware for HttpOnly auth cookies and CSRF
  app.use(cookieParser());

  // Strict CORS for Next.js frontend (No wildcard origin with credentials)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'idempotency-key', 'x-internal-worker-key', 'x-csrf-token']
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
