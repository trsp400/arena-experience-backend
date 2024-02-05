export type EventInput = {
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  eventStatus: string;
  eventType: string;
  eventsParticipants?: number;
  eventNotes?: string | null;
  isDeleted?: boolean | null;
  eventImage?: string | null;
  eventDuration: string
};