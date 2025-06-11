import { User } from './user';

export type Student = User & {
  user_id: string; // Reference to users collection
  course: string;
  block: string;
  year_level: number;
  created_at: Date;
  updated_at: Date;
};
