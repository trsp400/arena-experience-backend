-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventLocation" TEXT NOT NULL,
    "eventStatus" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventsParticipants" INTEGER NOT NULL DEFAULT 0,
    "eventNotes" TEXT,
    "isDeleted" BOOLEAN,
    "eventImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);
