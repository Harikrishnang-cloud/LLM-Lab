import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log('==============================================');
  console.log(`🚀 LLM Lab API running in [${env.NODE_ENV}] mode`);
  console.log(`📍 Listening on: http://localhost:${env.PORT}`);
  console.log(`🔗 Allowed Frontend: ${env.FRONTEND_URL}`);
  console.log(`🦙 Configured Ollama Base URL: ${env.OLLAMA_BASE_URL}`);
  console.log('==============================================');
});

// Graceful shutdown handling
const handleShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('💤 HTTP server closed. Process terminating.');
    process.exit(0);
  });

  // Force close after 10s if hung
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
