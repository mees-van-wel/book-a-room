import firebase from 'firebase/compat';

import { BookingInterface } from './Booking';
import Timestamp = firebase.firestore.Timestamp;
import DocumentReference = firebase.firestore.DocumentReference;

export interface Invoice {
  _ref: DocumentReference<Invoice>;
  id: string;
  number: string;
  date: Timestamp;
  from: Timestamp;
  to: Timestamp;
  booking: DocumentReference<BookingInterface>;
  mailedOn: Timestamp | null;
}
