import { User } from '@prisma/client';

export interface UserInput extends Partial<User> {
  password?: string;
}