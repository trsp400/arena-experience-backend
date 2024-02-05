import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const EventParticipationService = {
  async toggleParticipation(userId: number, eventId: number): Promise<void> {
    const participation = await prisma.eventUserParticipation.findFirst({
      where: {
        userId: userId,
        eventId: eventId
      }
    });

    if (participation) {
      if (participation.deletedAt) {
        // O usuário está marcando novamente a participação
        await prisma.event.update({
          where: { id: eventId },
          data: { eventParticipants: { increment: 1 } }
        });
        await prisma.eventUserParticipation.update({
          where: { id: participation.id },
          data: { deletedAt: null }
        });
      } else {
        // O usuário está desmarcando a participação
        await prisma.event.update({
          where: { id: eventId },
          data: { eventParticipants: { decrement: 1 } }
        });
        await prisma.eventUserParticipation.update({
          where: { id: participation.id },
          data: { deletedAt: new Date() }
        });
      }
    } else {
      // Primeira vez que o usuário está marcando a participação
      await prisma.event.update({
        where: { id: eventId },
        data: { eventParticipants: { increment: 1 } }
      });
      await prisma.eventUserParticipation.create({
        data: {
          userId: userId,
          eventId: eventId
        }
      });
    }
  }
};