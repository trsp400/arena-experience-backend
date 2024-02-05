import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserInput } from '../entrypoints/DTO/UserInput';

const prisma = new PrismaClient();


export const UserService = {
  async createUser(userData: Partial<User>): Promise<User> {
    return prisma.user.create({ data: userData as unknown as User });
  },

  async findUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email: email
      }
    });
  },

  async findAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  },

  async updateUser(id: number, userData: UserInput): Promise<User> {
    const updateData: UserInput = { ...userData };
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      updateData.passwordHash = hashedPassword;
    }
    delete updateData.password;
    return prisma.user.update({ where: { id }, data: updateData });
  },

  async deleteUser(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } });
  },

  async registerUser(userData: { fullName: string; birthdate: Date; email: string; phoneNumber: string; password: string; }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userCreateData = {
      fullName: userData.fullName,
      birthdate: userData.birthdate,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      passwordHash: hashedPassword,
      role: 'user'
    };
    return prisma.user.create({ data: userCreateData });
  },

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }
};