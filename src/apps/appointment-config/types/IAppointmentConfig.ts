export interface IAppointmentConfig {
  configId: string;
  session_duration: number;
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
  category_and_type: {
    [category: string]: {
      type: string;
      duration: number;
    }[];
  };
}
/*
const exampleConfig: IAppointmentConfig = {
  configId: "abc123",
  session_duration: 60,
  bufferTime: 15,
  reminders: [
    "Reminder: Your appointment is in 30 minutes",
    "Reminder: Bring your ID"
  ],
  categoryAndType: {
    "Medical": [
      { type: "General Checkup", duration: 30 },
      { type: "Dental Cleaning", duration: 45 }
    ],
    "Consultation": [
      { type: "Therapy Session", duration: 60 },
      { type: "Career Advice", duration: 40 }
    ]
  }
};
*/
