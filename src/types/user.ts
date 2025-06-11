export type User = {
  idNumber: string;
  email: string;
  password: string;
  role: 'student' | 'facilitator' | 'staff' | 'counsellor';
};

export interface UserMethods {
  isPasswordMatch: (enteredPassword: string) => Promise<boolean>;
  encryptPassword: (password: string) => Promise<string>;
}
