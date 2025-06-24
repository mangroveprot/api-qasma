import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/engine';
import { IAppointmentConfigModel } from '../models/appointmentConfig.model';

export class AppointmentConfigRepository extends BaseRepository<IAppointmentConfigModel> {
  constructor(model: Model<IAppointmentConfigModel>) {
    super(model);
  }
}

export default AppointmentConfigRepository;
