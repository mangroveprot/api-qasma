import mongoose, { Schema, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Student } from '../../types/index';

interface UserMethods {
  isPasswordMatch: (enteredPassword: string) => Promise<boolean>;
  encryptPassword: (password: string) => Promise<string>;
}

//combine student entities with custom methods
export type StudentDocument = HydratedDocument<Student> & UserMethods;

const studentSchema: Schema<StudentDocument> = new Schema<StudentDocument>(
  {
    idNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    user_id: { type: String, required: true }, // usage when create: user_id: new mongoose.Types.ObjectId("your_user_id_as_string"),
    course: { type: String, required: true },
    block: { type: String, required: true },
    year_level: { type: Number, required: true },
  },
  { timestamps: true },
);

//manually call this method
studentSchema.methods.isPasswordMatch = async function (
  enteredPassword: string,
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//manually call this method
studentSchema.methods.encryptPassword = async function (password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

//auto run
studentSchema.pre('save', async function (next) {
  const user = this as StudentDocument;
  if (!user.isModified('password')) {
    return next();
  }
  user.password = await user.encryptPassword(user.password);
});

export default mongoose.model<StudentDocument>('Students', studentSchema);
