import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { PrometheusService } from './prometheus.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [LoggingService, PrometheusService],
  exports: [LoggingService, PrometheusService],
})
export class LoggingModule {} 