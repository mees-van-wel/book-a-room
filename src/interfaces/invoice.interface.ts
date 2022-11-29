import { Timestamp, DocumentReference } from "firebase/firestore";
import { InvoiceType } from "../enums/invoiceType.enum";
import { Booking } from "./booking.interface";

export interface InvoiceLine {
  name: string;
  unitPriceWithoutVat: number;
  quantity: number;
  totalWithoutVat: number;
  vat: number;
  vatPercentage: number;
  total: number;
}

export interface Invoice {
  _ref: DocumentReference<Invoice>;
  id: string;
  type: InvoiceType;
  number: string;
  date: Timestamp;
  from: Timestamp;
  to: Timestamp;
  roomName: string;
  bookingRefrence: DocumentReference<Booking>;
  terms?: string;
  extra?: string;
  company: {
    name: string;
    adres: string;
    postalCode: string;
    city: string;
    email: string;
    phoneNumber: string;
    cocNumber: string;
    vatNumber: string;
    bicCode: string;
    iban: string;
  };
  customer: {
    name: string;
    adres: string;
    postalCode: string;
    city: string;
    email: string;
    phoneNumber: string;
  };
  mailedOn: Timestamp | null;
  creditedOn: Timestamp | null;
  lines: InvoiceLine[];
}
