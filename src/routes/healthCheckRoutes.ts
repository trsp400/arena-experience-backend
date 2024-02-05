import { FastifyInstance } from 'fastify';

export default function healthCheckRoutes(server: FastifyInstance) {
  server.get('/healthcheck', async (request, reply) => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  });
}