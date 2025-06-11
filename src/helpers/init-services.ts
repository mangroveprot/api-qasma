import { databasesConnectionSelection } from './db-connection-selection';

async function initServices() {
  await databasesConnectionSelection();
}

export { initServices };
