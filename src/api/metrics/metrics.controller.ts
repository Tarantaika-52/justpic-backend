import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('/health')
  @HttpCode(HttpStatus.OK)
  public async checkHealth() {
    return { serverMessage: 'All right' };
  }
}
