import { FastifyReply, FastifyRequest } from 'fastify';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_KEY: string = process.env.JWT_KEY as string;

export function authMiddleware(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) {
  const openRoutes = ['/healthcheck', '/register', '/login'];

  if (openRoutes.includes(request.routeOptions.url)) {
    return done();
  }

  const token = request.headers.authorization?.split(' ')[1];
  if (!token) {
    reply.status(401).send({ message: 'No token provided' });
    return done(new Error('No token provided'));
  }

  jwt.verify(token, JWT_KEY, (err, decoded) => {
    if (err) {
      reply.status(401).send({ message: 'Invalid token' });
      return done(new Error('Invalid token'));
    }

    const payload = decoded as JwtPayload;
    if (!payload || typeof payload === 'string' || !payload.id) {
      reply.status(401).send({ message: 'Invalid token' });
      return done(new Error('Invalid token'));
    }

    request.user = { id: payload.id, role: payload.role };

    const userRole = request.user.role;
    const path = request.routeOptions.url;
    const method = request.method;

    const userRoutes = [
      { path: '/events', methods: ['GET'] },
      { path: '/events/:id', methods: ['GET'] },
      { path: '/events/:eventId/participate', methods: ['POST'] },
      { path: '/users/:id', methods: ['PUT'] },
      { path: '/users/:id', methods: ['PUT', 'GET'] }
    ];

    // Verifica se a rota e o método são permitidos para o role do usuário
    const isRouteAllowed = userRoutes.some(route =>
      request.routeOptions.url === route.path && route.methods.includes(request.method)
    );

    if (userRole !== 'admin' && !isRouteAllowed) {
      reply.status(403).send({ message: 'Access denied' });
      return done(new Error('Access denied'));
    }

    done();
  });
}