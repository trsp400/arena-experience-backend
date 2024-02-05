/*
  Warnings:

  - You are about to drop the column `eventsParticipants` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "eventsParticipants",
ADD COLUMN     "eventParticipants" INTEGER NOT NULL DEFAULT 0;
