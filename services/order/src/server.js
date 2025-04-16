'use strict';

import Hapi from '@hapi/hapi';
import * as db from './database.js';
import routes from './routes.js';

const init = async () => {
  // Initialize the database
  await db.initialize();

  // Create the Hapi server
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: true
    }
  });

  // Register routes
  server.route(routes);

  // Start the server
  await server.start();
  console.log('Order service running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();