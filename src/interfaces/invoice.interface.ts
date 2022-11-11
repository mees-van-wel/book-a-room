import { Timestamp, DocumentReference } from "firebase/firestore";
import { InvoiceType } from "../enums/invoiceType.enum";
import { Booking } from "./booking.interface";

export interface Invoice {
  _ref: DocumentReference<Invoice>;
  id: string;
  type: InvoiceType;
  number: string;
  date: Timestamp;
  from: Timestamp;
  to: Timestamp;
  booking: DocumentReference<Booking>;
  mailedOn: Timestamp | null;
  creditedOn: Timestamp | null;
}
