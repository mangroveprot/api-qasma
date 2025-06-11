import { IUser } from './user';
import { UserProfile } from './user-profile';

export interface IUserStudent extends IUser, UserProfile {
  course: string;
  block: string;
  year_level: number;
}
