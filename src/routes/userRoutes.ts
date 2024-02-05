import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/userController';

export default function userRoutes(server: FastifyInstance) {
  server.post('/users', UserController.createUser);
  server.get('/users/:id', UserController.findUserById);
  server.get('/users', UserController.findAllUsers);
  server.put('/users/:id', UserController.updateUser);
  server.delete('/users/:id', UserController.deleteUser);
  server.post('/register', UserController.register);
  server.post('/login', UserController.login);
}