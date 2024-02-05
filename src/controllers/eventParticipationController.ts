import { FastifyReply, FastifyRequest } from 'fastify';
import { EventParticipationService } from '../services/eventParticipationService';

export const EventParticipationController = {
  async toggleParticipation(request: FastifyRequest<{ Params: { eventId: string } }> | any, reply: FastifyReply) {
    try {
      if (!request.user || !request.user.id) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      const userId = request.user.id;
      const eventId = parseInt(request.params.eventId);

      if (isNaN(eventId)) {
        return reply.status(400).send({ message: 'Invalid event ID' });
      }

      await EventParticipationService.toggleParticipation(userId, eventId);
      return reply.status(200).send({ message: 'Participation toggled successfully' });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }
};
