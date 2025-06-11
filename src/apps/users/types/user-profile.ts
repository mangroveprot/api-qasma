export type gender = 'male' | 'female' | 'other';

export interface UserProfile {
  first_name: string;
  last_name: string;
  middle_name?: string;
  suffix?: string;
  gender: gender;
  date_of_birth: Date;
  address?: string;
  contact_number: string;
  facebook?: string;
}
