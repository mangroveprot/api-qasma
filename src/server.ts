process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception:', err);
});

import { WebServer } from './core/framework';
import { logger } from './common/shared/services';
import { initServices } from './helpers';
import { config } from './core/config';

async function startServer() {
  try {
    await initServices();
    const server = WebServer.server;
    server.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}/`);
    });
  } catch (error) {
    logger.error('Failed to initialize services', error as any);
  }
}

startServer();
