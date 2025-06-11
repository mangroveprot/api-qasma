export type TUserRole = 'counsellor' | 'staff' | 'student' | 'facil';

export interface IUser {
  idNumber: string;
  email: string;
  password: string;
  role: TUserRole;
}
