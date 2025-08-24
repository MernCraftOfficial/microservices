import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import env from '../config/env';

// Interface representing a Group subdocument
interface Group {
  group: Schema.Types.ObjectId;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | 'GUEST';
}

export type Username = { firstname: string; lastname?: string };

// Interface representing a User document
export interface IUser extends Document {
  username: Username;
  email: string;
  password: string;
  profilePictureUrl: string;
  role?: 'ADMIN' | 'USER';
  status: 'INACTIVE' | 'ACTIVE' | 'BUSY';
  groups: Group[];
  lastSeen?: Date;
  language?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        default: '',
      },
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, maxlength: 16 },
    profilePictureUrl: { type: String, required: false },
    role: { type: String, required: true, default: 'USER', uppercase: true },
    status: {
      type: String,
      enum: ['INACTIVE', 'ACTIVE', 'BUSY'],
      required: true,
      uppercase: true,
      default: 'INACTIVE',
    },
    groups: [
      {
        group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        role: {
          type: String,
          enum: ['ADMIN', 'MEMBER', 'GUEST'],
          required: true,
          uppercase: true,
          default: 'GUEST',
        },
      },
    ],
    lastSeen: { type: Date, default: Date.now },
    language: { type: String, default: 'en' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Pre-save hook to hash password if modified
UserSchema.pre<IUser>('save', async function (next: (err?: any) => void) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(env.PASSWORD_SALT_WORK_FACTOR);
    const hash = await bcrypt.hash(this.password + env.PASSWORD_PEPPER, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err as any);
  }
});

// Promise-based comparePassword method
UserSchema.methods.comparePassword = function (
  this: IUser,
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword + env.PASSWORD_PEPPER, this.password);
};

const User = model<IUser>('User', UserSchema);

export default User;
