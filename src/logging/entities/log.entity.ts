export class LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: string;
  trace?: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  environment: string;
  service: string;
}

export class HealthStatus {
  status: 'up' | 'down';
  timestamp: Date;
  service: string;
  details: Record<string, any>;
  dependencies: {
    name: string;
    status: 'up' | 'down';
    latency?: number;
  }[];
}

export class MetricData {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
  type: 'counter' | 'gauge' | 'histogram';
} 