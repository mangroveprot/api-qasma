import { ICategory } from './ICategory';

export interface IAppointmentConfig {
  configId: string;
  buffer_time: number;
  booking_lead_time: number; // ahead time when booking
  slot_days_range: number;
  reminders: string[]; //["Reminder: Your appointment is in 30 minutes", "Reminder: Bring your ID"]
  available_day_time?: {
    [day: string]: {
      start: string;
      end: string;
    }[];
  };
  category_and_type: Map<string, ICategory>;
}
