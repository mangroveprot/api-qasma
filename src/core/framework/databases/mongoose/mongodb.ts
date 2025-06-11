import { logger } from '../../../../common/shared/services';
import { config } from '../../../config';
import mongoose, { Connection, MongooseError } from 'mongoose';

let mongoClient: Connection | null = null;

async function connect(uri: string, dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(uri, { dbName })
      .then(() => {
        mongoClient = mongoose.connection;
        logger.info('Mongodb has been connected sucessfully!');
        resolve();
      })
      .catch((err: mongoose.Error) => {
        // console.error("Mongoose connection error:", err);
        reject(err);
      });
  });
}

async function init(
  uri: string = config.db.mongoose.uri,
  dbName: string = config.db.mongoose.name,
) {
  try {
    logger.info('Mongodb Initialized...');
    await connect(uri, dbName);
  } catch (err: unknown) {
    if (err instanceof MongooseError) {
      logger.error('Connnection error: ', err);
    } else {
      logger.error('Failed to initialize services', err as any);
      // console.error("Unexpected error: ", err);
    }
  }
}

async function close(): Promise<void> {
  if (mongoClient) {
    await mongoose.disconnect();
    logger.warn('Mongoose connection is disconnected!');
  } else {
    logger.warn('No connection is found to close!');
  }
}

export { init, close };
