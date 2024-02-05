import { FastifyInstance } from 'fastify';
import { EventController } from '../controllers/eventController';

export default function eventRoutes(server: FastifyInstance) {
  server.post('/events', EventController.createEvent);
  server.get('/events/:id', EventController.findEventById);
  server.get('/events', EventController.findAllEvents);
  server.put('/events/:id', EventController.updateEvent);
  server.delete('/events/:id', EventController.deleteEvent);

}