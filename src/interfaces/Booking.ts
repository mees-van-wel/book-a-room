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
  btw: number;
  cleaningFee: number;
  cleaningFeeVat: number;
  name: string;
  secondName: string;
  email: string;
  phoneNumber: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  priceOverride: number;
  extra: string;
}

export interface FirestoreBookingInterface {
  start: Timestamp;
  end: Timestamp;
  room: FireStoreRoomInterface;
  notes: string;
  btw: number;
  cleaningFee: number;
  cleaningFeeVat: number;
  name: string;
  secondName: string;
  email: string;
  phoneNumber: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  priceOverride: number;
  extra: string;
}
