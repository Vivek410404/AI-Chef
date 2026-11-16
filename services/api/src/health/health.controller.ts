import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { GeminiProvider } from '../ai/gemini.provider';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(private readonly store: StoreService) {}

  @Get()
  async getHealth() {
    const isDbRequired = process.env.REQUIRE_DATABASE === 'true';
    const isDbConnected = this.store.isPrismaConnected;
    const storageMode = process.env.STORAGE_MODE || 'memory';

    // If database is required but disconnected, fail with HTTP 503
    if (isDbRequired && !isDbConnected) {
      throw new HttpException({
        status: 'error',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'PostgreSQL database required under REQUIRE_DATABASE=true but currently disconnected',
        storageMode,
        databaseConnected: false,
        timestamp: new Date().toISOString()
      }, HttpStatus.SERVICE_UNAVAILABLE);
    }

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
    const isPrimaryLimited = GeminiProvider.isModelRateLimited('models/gemini-3.5-flash-lite').limited;
    const isSecondaryLimited = GeminiProvider.isModelRateLimited('models/gemini-3.1-flash-lite').limited;

    let activeAiProvider = 'deterministic-fallback';
    if (hasApiKey && (!isPrimaryLimited || !isSecondaryLimited)) {
      activeAiProvider = 'gemini';
    }

    return {
      status: 'ok',
      service: 'rasoi-api',
      version: '1.0.0',
      storageMode,
      databaseConnected: isDbConnected,
      requireDatabase: isDbRequired,
      ai: {
        geminiConfigured: hasApiKey,
        primaryModel: 'models/gemini-3.5-flash-lite',
        secondaryModel: 'models/gemini-3.1-flash-lite',
        activeProvider: activeAiProvider,
        deterministicFallbackReady: true,
        quotaLimited: {
          primary: isPrimaryLimited,
          secondary: isSecondaryLimited
        }
      },
      auth: {
        jwtConfigured: Boolean(process.env.JWT_SECRET),
        persistentRevocation: isDbConnected
      },
      counts: {
        households: this.store.households.size,
        recipes: this.store.recipes.length,
        pantryItems: this.store.pantryItems.size
      },
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString()
    };
  }
}
