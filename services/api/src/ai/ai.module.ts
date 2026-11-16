import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiProvider } from './gemini.provider';
import { DeterministicProvider } from './deterministic.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, GeminiProvider, DeterministicProvider],
  exports: [AiService]
})
export class AiModule {}
