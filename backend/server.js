/**
 * Main Express Application
 * Voice Farming Assistant - Backend Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Import routes
import chatRoutes from './routes/chat.api.js';
import whatsappRoutes from './webhooks/whatsapp-handler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== Middleware ====================

// Security
app.use(helmet());

// CORS - Allow frontend domain
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Logging
app.use(morgan('combined'));

// Request validation middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== Routes ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Chat API endpoints
app.use('/api', chatRoutes);

// WhatsApp webhook
app.post('/webhooks/whatsapp', (req, res) => {
  console.log('WhatsApp webhook received:', req.body);
  // Handle WhatsApp webhook
  res.json({ status: 'received' });
});

app.get('/webhooks/whatsapp', (req, res) => {
  // WhatsApp verification
  const token = process.env.WHATSAPP_VERIFY_TOKEN || 'test_token';
  const challenge = req.query['hub.challenge'];
  const verifyToken = req.query['hub.verify_token'];

  if (verifyToken === token) {
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ==================== Static Files & Documentation ====================

// Serve API documentation
app.get('/docs', (req, res) => {
  res.json({
    title: 'Voice Farming Assistant API',
    version: '1.0.0',
    description: 'REST API for agricultural voice assistance',
    baseUrl: `http://localhost:${PORT}/api`,
    endpoints: {
      chat: {
        method: 'POST',
        path: '/chat',
        description: 'Send text message and receive agricultural advice',
        body: {
          text: 'string (required)',
          farmerId: 'string (required)',
          language: 'string (default: hin)',
          cropType: 'string (optional)',
          intent: 'string (optional)'
        }
      },
      transcribe: {
        method: 'POST',
        path: '/transcribe',
        description: 'Convert voice message to text',
        body: {
          audioUrl: 'string or audioBase64',
          language: 'string (default: hin)',
          farmerId: 'string (required)'
        }
      },
      profile: {
        method: 'GET',
        path: '/profile/:farmerId',
        description: 'Get farmer profile'
      },
      updateProfile: {
        method: 'PUT',
        path: '/profile/:farmerId',
        description: 'Update farmer profile',
        body: {
          language: 'string',
          cropType: 'string',
          location: 'string',
          name: 'string'
        }
      },
      messages: {
        method: 'GET',
        path: '/messages/:farmerId',
        description: 'Get conversation history',
        query: {
          limit: 'number (default: 20)'
        }
      },
      weatherAdvice: {
        method: 'GET',
        path: '/weather/:location',
        description: 'Get weather-based agricultural advice',
        query: {
          farmerId: 'string (optional)'
        }
      },
      marketPrices: {
        method: 'GET',
        path: '/market-prices/:crop',
        description: 'Get market prices for crops',
        query: {
          state: 'string (optional)'
        }
      },
      diagnoseImage: {
        method: 'POST',
        path: '/diagnose-image',
        description: 'Analyze crop image for diseases'
      }
    }
  });
});

// ==================== Error Handling ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString()
    }
  });
});

// ==================== Server Startup ====================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Voice Farming Assistant Backend      ║
║   Server running on port ${PORT}          ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║
║   ${new Date().toLocaleTimeString().padEnd(34)}║
╚════════════════════════════════════════╝
  `);
  
  console.log(`
📚 API Documentation: http://localhost:${PORT}/docs
🏥 Health Check: http://localhost:${PORT}/health
🎙️ Chat API: http://localhost:${PORT}/api/chat
🌍 WhatsApp Webhook: http://localhost:${PORT}/webhooks/whatsapp
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
