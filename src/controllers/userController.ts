import { FastifyReply, FastifyRequest } from 'fastify';
import { User as PrismaUser } from '@prisma/client';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { UserService } from '../services/userService';
import { UpdateUserParams } from '../entrypoints/interfaces/UpdateUserParams';

type UserResponse = Omit<PrismaUser, 'passwordHash'>;

const JWT_KEY: string = process.env.JWT_KEY as string;


export const UserController = {
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        fullName: Joi.string().required(),
        church: Joi.string().required(),
        profileImageUrl: Joi.string().uri().allow(null, ''),
        phoneNumber: Joi.string().required(),
        address: Joi.string().allow(null, ''),
        city: Joi.string().allow(null, ''),
        state: Joi.string().allow(null, ''),
        zipcode: Joi.string().allow(null, ''),
        birthdate: Joi.date().required()
      });

      const { error, value } = userSchema.validate(request.body);
      if (error) {
        return reply.status(400).send(error.details);
      }

      const hashedPassword = await bcrypt.hash(value.password, 10);
      value.role = 'user';
      delete value.password;
      const user: UserResponse = await UserService.createUser({ ...value, passwordHash: hashedPassword });

      const userResponse = {
        id: user.id,
        email: user.email,
        church: user.church,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber
      };

      return reply.status(201).send({
        data: userResponse,
        valid: true
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error', valid: false });
    }
  },

  async findUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = parseInt(request.params.id);
      if (isNaN(userId)) {
        return reply.status(400).send({ message: 'Invalid user ID' });
      }

      const user = await UserService.findUserById(userId);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.status(200).send(user);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async findAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await UserService.findAllUsers();
      return reply.status(200).send(users);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async updateUser(request: FastifyRequest<{ Params: UpdateUserParams }>, reply: FastifyReply) {
    try {
      const userId = parseInt(request.params.id);
      if (isNaN(userId)) {
        return reply.status(400).send({ message: 'Invalid user ID' });
      }

      const updateSchema = Joi.object({
        email: Joi.string().email(),
        password: Joi.string().optional(),
        fullName: Joi.string().optional(),
        profileImageUrl: Joi.string().uri().allow(null, ''),
        phoneNumber: Joi.string(),
        address: Joi.string().allow(null, ''),
        city: Joi.string().allow(null, ''),
        state: Joi.string().allow(null, ''),
        zipcode: Joi.string().allow(null, ''),
        birthdate: Joi.date().allow(null, ''),
        church: Joi.string().optional()
      });

      const { error, value } = updateSchema.validate(request.body);
      if (error) {
        return reply.status(400).send(error.details);
      }

      if (value.password) {
        const hashedPassword = await bcrypt.hash(value.password, 10);
        value.passwordHash = hashedPassword;
      }
      delete value.password; // Remova a senha não hashada antes de atualizar

      const updatedUser = await UserService.updateUser(userId, value);
      if (!updatedUser) {
        return reply.status(404).send({ message: 'User not found' });
      }

      const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        church: updatedUser.church,
        birthdate: updatedUser.birthdate,
        city: updatedUser.city,
        profileImageUrl: updatedUser.profileImageUrl,
        role: updatedUser.role,
        state: updatedUser.state,
        zipcode: updatedUser.zipcode,
        updatedAt: updatedUser.updatedAt,
      };

      return reply.status(200).send({
        data: userResponse,
        valid: true
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error', valid: false });
    }
  },

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = parseInt(request.params.id);
      if (isNaN(userId)) {
        return reply.status(400).send({ message: 'Invalid user ID' });
      }

      const user = await UserService.deleteUser(userId);
      return reply.status(200).send({ message: 'User deleted successfully', user });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const registerSchema = Joi.object({
        fullName: Joi.string().required(),
        church: Joi.string().required(),
        birthdate: Joi.date().required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().required(),
        password: Joi.string().required()
      });

      const { error, value } = registerSchema.validate(request.body);
      if (error) {
        return reply.status(400).send(error.details);
      }

      // Verificar se o usuário já existe
      const existingUser = await UserService.findUserByEmail(value.email);
      if (existingUser) {
        return reply.status(409).send({ message: 'User already exists with this email' });
      }

      // Continuar com o registro se o usuário não existir
      const hashedPassword = await bcrypt.hash(value.password, 10);

      const user = await UserService.registerUser({
        ...value,
        passwordHash: hashedPassword
      });

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        church: user?.church,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode,
        birthdate: user.birthdate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt
      };

      return reply.status(201).send(userResponse);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      });

      const { error, value } = loginSchema.validate(request.body);
      if (error) {
        return reply.status(400).send(error.details);
      }

      const user = await UserService.validateUser(value.email, value.password);
      if (!user) {
        return reply.status(401).send({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, role: user.role, email: user.email, fullname: user.fullName }, JWT_KEY, {
        expiresIn: '1d'
      });

      return reply.status(200).send({ token, user });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }
};