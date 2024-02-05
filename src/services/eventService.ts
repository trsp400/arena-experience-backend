import { PrismaClient, Event } from '@prisma/client';
import { EventInput } from '../entrypoints/DTO/EventInput';

const prisma = new PrismaClient();

export const EventService = {
  async createEvent(eventData: EventInput): Promise<Event> {
    return prisma.event.create({ data: eventData });
  },

  async findEventById(id: number): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } });
  },

  async findAllEvents(): Promise<Event[]> {
    return prisma.event.findMany();
  },

  async updateEvent(id: number, eventData: Partial<EventInput>): Promise<Event> {
    return prisma.event.update({ where: { id }, data: eventData });
  },

  async deleteEvent(id: number): Promise<Event> {
    return prisma.event.delete({ where: { id } });
  },

  async findAllEventsWithParticipationStatus(userId: number, participating?: boolean): Promise<any[]> {
    const events = await prisma.event.findMany({
      where: {
        EventUserParticipation: participating === undefined ? undefined : {
          some: {
            userId: userId,
            deletedAt: participating ? null : { not: null }
          }
        }
      },
      include: {
        EventUserParticipation: {
          where: {
            userId: userId
          },
          select: {
            deletedAt: true
          }
        }
      }
    });

    return events.map(event => ({
      ...event,
      isParticipating: event.EventUserParticipation.some(eup => eup.deletedAt === null)
    }));
  }

};