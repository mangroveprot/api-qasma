import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/engine';
import { IUserStudentDocument } from '../models/mongoose';

export class UserStudentMongooseRepository extends BaseRepository<IUserStudentDocument> {
  constructor(model: Model<IUserStudentDocument>) {
    super(model);
  }
}

export default UserStudentMongooseRepository;
