import { FastifyInstance } from 'fastify';
import { EventParticipationController } from '../controllers/eventParticipationController';

export default function eventParticipationRoutes(server: FastifyInstance) {
  server.post('/events/:eventId/participate', EventParticipationController.toggleParticipation);
}