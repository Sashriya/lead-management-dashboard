import app from './app';
import connectDB from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => console.log('HTTP server closed'));
});