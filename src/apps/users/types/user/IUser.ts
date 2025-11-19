import { Role, TOtherInfoCounselor, TOtherInfoStudent } from './index';

export type TUserRole = (typeof Role)[keyof typeof Role];
export type gender = 'male' | 'female' | 'other';

export interface IUser {
  idNumber: string;
  email: string;
  password: string;
  role: TUserRole;
  verified: boolean;
  active: boolean;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  gender: gender;
  date_of_birth: Date;
  contact_number: string;
  address?: string;
  facebook?: string;
  fcmToken?: string;
  other_info: TOtherInfoStudent | TOtherInfoCounselor;
}
