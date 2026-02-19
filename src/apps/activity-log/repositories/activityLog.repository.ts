import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/engine';
import { IActivityLog } from '../models';

export class ActivityLogRepository extends BaseRepository<IActivityLog> {
  constructor(model: Model<IActivityLog>) {
    super(model);
  }

  async insertMany(logs: Partial<IActivityLog>[]): Promise<IActivityLog[]> {
    return (await this['model'].insertMany(logs)) as unknown as IActivityLog[];
  }
}

export default ActivityLogRepository;
