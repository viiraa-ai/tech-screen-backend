import 'dotenv/config';
import { app } from './app.js';

const port = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(port, () => {
  console.log('🚀 Server starting on port', port);
});

process.on('SIGTERM', () => {
  console.log('👋 Shutting down');
  server.close(() => process.exit(0));
});
