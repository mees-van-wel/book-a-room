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
  invoicedTill?: Timestamp;
  roomRefrence: DocumentReference<Room>;
  notes: string;
  btw: string;
  cleaningFee: number;
  cleaningFeeVat: string;
  cleaningInterval?: CleaningInterval;
  cleaningStartDate?: Timestamp;
  cleaningNotes?: string;
  parkingFee: number;
  parkingFeeVat: string;
  touristTax: number;
  customer: Customer;
  customerRefrence: DocumentReference<Customer>;
  priceOverride: number;
  invoices: (BookingInvoice | DocumentReference<Invoice>)[];
  extraOne: string;
  extraTwo: string;
}
