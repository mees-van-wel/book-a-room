import { DocumentReference, Timestamp } from "firebase/firestore";
import { CleaningInterval } from "../enums/cleaningInterval.enum";
import { Customer } from "./customer.interface";
import { Invoice } from "./invoice.interface";
import { Room } from "./room.interface";

export interface BookingInvoice {
  number: string;
  start: Timestamp;
  end: Timestamp;
  date: Timestamp;
}

export interface Booking {
  _ref: DocumentReference<Booking>;
  id: string;
  start: Timestamp;
  end: Timestamp;
  room: Room;
  notes: string;
  btw: number;
  cleaningFee: number;
  cleaningFeeVat: number;
  cleaningInterval?: CleaningInterval;
  cleaningStartDate?: Timestamp;
  cleaningNotes?: string;
  parkingFee: number;
  parkingFeeVat: number;
  touristTax: number;
  customer: Customer;
  priceOverride: number;
  invoices: (BookingInvoice | DocumentReference<Invoice>)[];
  extraOne: string;
  extraTwo: string;
}
