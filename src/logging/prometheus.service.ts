import { Injectable } from '@nestjs/common';
import { MetricData } from './entities/log.entity';
import { Counter, Gauge, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class PrometheusService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('error_count_total')
    private readonly errorCounter: Counter<string>,
    @InjectMetric('gas_price_gwei')
    private readonly gasPriceGauge: Gauge<string>,
  ) {}

  recordMetric(metric: MetricData) {
    switch (metric.name) {
      case 'http_requests_total':
        this.httpRequestsCounter.inc(metric.labels);
        break;
      case 'http_request_duration_seconds':
        this.httpRequestDuration.observe(metric.labels, metric.value);
        break;
      case 'error_count_total':
        this.errorCounter.inc(metric.labels);
        break;
      case 'gas_price_gwei':
        this.gasPriceGauge.set(metric.labels, metric.value);
        break;
    }
  }

  getMetrics(): string {
    return this.httpRequestsCounter.toString();
  }
} 