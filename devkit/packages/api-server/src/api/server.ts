// Express server setup

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createInternalError } from '@conflux-devkit/core';
import { walletRoutes } from './routes/wallet';
import { transactionRoutes } from './routes/transaction';
import { contractRoutes } from './routes/contract';
import { nodeRoutes } from './routes/node';
import { healthRoutes } from './routes/health';

export class ApiServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || [
          'http://localhost:3000',
        ],
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.use('/api/health', healthRoutes);

    // API routes
    this.app.use('/api/wallet', walletRoutes);
    this.app.use('/api/transaction', transactionRoutes);
    this.app.use('/api/contract', contractRoutes);
    this.app.use('/api/node', nodeRoutes);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Conflux DevKit API Server',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`,
          timestamp: new Date(),
        },
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(
      (
        error: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error('API Error:', error);

        const internalError = createInternalError('Internal server error', {
          error: error.message,
          stack: error.stack,
          path: req.path,
          method: req.method,
        });

        res.status(500).json({
          success: false,
          error: {
            code: internalError.code,
            message: internalError.message,
            timestamp: internalError.timestamp,
          },
        });
      }
    );
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(this.port, () => {
          console.log(`🚀 API Server running on port ${this.port}`);
          console.log(
            `📊 Health check: http://localhost:${this.port}/api/health`
          );
          console.log(`📚 API docs: http://localhost:${this.port}/`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    // This would need proper server shutdown logic
    console.log('API Server stopped');
  }

  /**
   * Get Express app instance
   */
  getApp(): express.Application {
    return this.app;
  }
}
