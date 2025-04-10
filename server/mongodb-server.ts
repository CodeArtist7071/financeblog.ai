import dotenv from 'dotenv';
import { log } from './vite';

// Load environment variables before importing server
dotenv.config();

// Import server
import server from './server';

const PORT = process.env.PORT || 5000;

// Start server and log connection info
server.listen(PORT, () => {
  log(`MongoDB Server running on port ${PORT}`, 'server');
});