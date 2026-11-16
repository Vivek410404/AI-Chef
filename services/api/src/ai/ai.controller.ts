import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { AIPlanGenerationPrompt, AIPlanGenerationResponse } from '@rasoi/shared-types';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-plan')
  async generatePlan(@Body() body: AIPlanGenerationPrompt): Promise<AIPlanGenerationResponse> {
    return this.aiService.generatePlan(body);
  }
}
