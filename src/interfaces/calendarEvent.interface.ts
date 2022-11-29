import { Timestamp } from "firebase/firestore";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  roomName: string;
  invoicedTill?: Timestamp;
}
