import firebase from 'firebase/compat';
import Timestamp = firebase.firestore.Timestamp;
import { FireStoreRoomInterface, RoomInterface } from './Room';

export interface NewBookingInterface {
  start: Date;
  end: Date;
}

export interface BookingInterface extends NewBookingInterface {
  id: string;
  room: RoomInterface;
  notes: string;
}

export interface FirestoreBookingInterface {
  start: Timestamp;
  end: Timestamp;
  room: FireStoreRoomInterface;
  notes: string;
}
