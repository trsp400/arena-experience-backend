import { FastifyReply, FastifyRequest } from 'fastify';
import { EventService } from '../services/eventService';
import Joi from 'joi';

interface EventQuery {
  participating?: string;
}

export const EventController = {
  async createEvent(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validação dos dados de entrada
      const eventSchema = Joi.object({
        eventName: Joi.string().required(),
        eventDate: Joi.date().required(),
        eventLocation: Joi.string().required(),
        eventStatus: Joi.string().required(),
        eventDuration: Joi.string().required(),
        eventType: Joi.string().required(),
        eventNotes: Joi.string().allow(null, ''),
        eventImage: Joi.string().uri().allow(null, ''),
      });

      const { error, value } = eventSchema.validate(request.body);
      console.error(error)
      if (error) {
        return reply.status(400).send(error.details);
      }

      const event = await EventService.createEvent(value);
      console.log(event)
      return reply.status(201).send(event);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async findEventById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const eventId = parseInt(request.params.id);
      if (isNaN(eventId)) {
        return reply.status(400).send({ message: 'Invalid event ID' });
      }

      const event = await EventService.findEventById(eventId);
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }

      return reply.status(200).send(event);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async findAllEvents(request: FastifyRequest<{ Querystring: EventQuery }>, reply: FastifyReply) {
    try {
      const userId = request?.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      // Obtenha o parâmetro 'participating' da querystring
      const { participating } = request.query;
      const isParticipating = participating === 'true' ? true : participating === 'false' ? false : undefined;

      const events = await EventService.findAllEventsWithParticipationStatus(userId, isParticipating);

      return reply.status(200).send(events);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async updateEvent(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
    try {
      const eventId = parseInt(request.params.id);
      if (isNaN(eventId)) {
        return reply.status(400).send({ message: 'Invalid event ID' });
      }

      const updateSchema = Joi.object({
        eventName: Joi.string(),
        eventDate: Joi.date(),
        eventLocation: Joi.string(),
        eventStatus: Joi.string(),
        eventType: Joi.string(),
        eventNotes: Joi.string().allow(null, ''),
        eventImage: Joi.string().uri().allow(null, ''),
        eventDuration: Joi.string().allow(null, '')
      });

      const { error, value } = updateSchema.validate(request.body);
      if (error) {
        return reply.status(400).send(error.details);
      }

      const updatedEvent = await EventService.updateEvent(eventId, value);
      return reply.status(200).send(updatedEvent);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  async deleteEvent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const eventId = parseInt(request.params.id);
      if (isNaN(eventId)) {
        return reply.status(400).send({ message: 'Invalid event ID' });
      }

      await EventService.deleteEvent(eventId);
      return reply.status(200).send({ message: 'Event deleted successfully' });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

};