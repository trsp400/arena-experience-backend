import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserInput } from '../entrypoints/DTO/UserInput';
import { IUserRegister } from '../@types/user';

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
    return prisma.user.findMany({ where: { role: 'user' } });
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
    await prisma.eventUserParticipation.deleteMany({
      where: { userId: id },
    });
    return prisma.user.delete({ where: { id } });
  },

  async registerUser(userData: IUserRegister): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userCreateData = {
      fullName: userData.fullName,
      church: userData?.church,
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

