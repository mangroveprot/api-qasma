import { DB } from '../core/framework';
import { config } from '../core/config';

export async function databasesConnectionSelection() {
  const dbType = config.databaseType;
  switch (dbType) {
    case 'mongodb':
      await DB.mongo.init();
      break;
    case 'firebase':
      break;
    default:
      throw new Error('Unsupported database type');
  }
}
