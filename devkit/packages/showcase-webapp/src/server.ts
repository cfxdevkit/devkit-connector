// Showcase WebApp Server - Serves the demonstration webapp

import path from 'node:path';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app: express.Application = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API proxy to the orchestrated API server
app.use('/api', async (req, res) => {
  try {
    const apiUrl = `http://localhost:3001${req.path}`;
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(
          Object.entries(req.headers).filter(
            ([_key, value]) => typeof value === 'string' || Array.isArray(value)
          )
        ),
      } as HeadersInit,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to connect to API server',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Showcase WebApp is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  app.listen(port, () => {
    console.log(`🌐 Showcase WebApp running on port ${port}`);
    console.log(`📱 Open: http://localhost:${port}`);
    console.log(`🔗 API Proxy: http://localhost:${port}/api`);
    console.log(`💚 Health: http://localhost:${port}/health`);
  });
}

export default app;
