import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/engine';
import { IUserModel } from '../models/mongoose';

export class UserMongooseRepository extends BaseRepository<IUserModel> {
  constructor(model: Model<IUserModel>) {
    super(model);
  }
}

export default UserMongooseRepository;
