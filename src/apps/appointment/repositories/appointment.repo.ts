import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/engine';
import { IAppointmentModel } from '../models/appointment.model';

export class AppointmentRepository extends BaseRepository<IAppointmentModel> {
  constructor(model: Model<IAppointmentModel>) {
    super(model);
  }
}

export default AppointmentRepository;
