import Room from "./room";

export default interface Booking {
  room: any;
  start: Date;
  end: Date;
  description: string;
}
