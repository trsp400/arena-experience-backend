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

  async updateUser(id: number, userData: UserInput): Promise<User | null> {

    // Verifica se o email já está sendo usado por outro usuário
    if (userData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser && existingUser.id !== id) {
        // Lança um erro ou retorna null/outra indicação de que o email já está em uso
        throw new Error('Email already in use by another user');
      }
    }

    // Continua com a atualização se o email é único ou não foi fornecido
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.passwordHash = hashedPassword;
      delete userData.password;
    }
    return prisma.user.update({ where: { id }, data: userData });
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

