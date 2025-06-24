export interface IAppointmentConfig {
  configId: string;
  session_duration: number;
  bufferTime: number;
  reminders: string[]; //["Reminder: Your appointment is in 30 minutes", "Reminder: Bring your ID"]
  categoryAndType: {
    [category: string]: string[];
  };
}
