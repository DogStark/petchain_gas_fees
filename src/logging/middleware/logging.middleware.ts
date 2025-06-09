import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Add request ID to request object
    req['requestId'] = requestId;

    // Log request
    this.logger.log({
      message: 'Incoming Request',
      requestId,
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body,
      headers: this.sanitizeHeaders(req.headers),
      ip: req.ip,
    });

    // Capture response
    const originalSend = res.send;
    res.send = function (body: any) {
      const responseTime = Date.now() - startTime;
      
      // Log response
      Logger.log({
        message: 'Outgoing Response',
        requestId,
        statusCode: res.statusCode,
        responseTime,
        body: this.sanitizeResponse(body),
      });

      return originalSend.call(this, body);
    };

    next();
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    return sanitized;
  }

  private sanitizeResponse(body: any): any {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        return this.sanitizeSensitiveData(parsed);
      } catch {
        return '[BINARY]';
      }
    }
    return this.sanitizeSensitiveData(body);
  }

  private sanitizeSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
      }
    });

    return sanitized;
  }
} 