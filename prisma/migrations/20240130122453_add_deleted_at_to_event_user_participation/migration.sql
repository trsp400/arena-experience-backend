/*
  Warnings:

  - Added the required column `deletedAt` to the `EventUserParticipation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventUserParticipation" ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL;
