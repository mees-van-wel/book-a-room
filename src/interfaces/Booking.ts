import firebase from 'firebase/compat';
import Timestamp = firebase.firestore.Timestamp;
import { CustomerInterface } from './Customer';
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
  parkingFee: number;
  parkingFeeVat: number;
  customer: CustomerInterface;
  priceOverride: number;
  invoices: {
    number: string;
    start: Date;
    end: Date;
  }[];
}

export interface FirestoreBookingInterface {
  start: Timestamp;
  end: Timestamp;
  room: FireStoreRoomInterface;
  notes: string;
  btw: number;
  cleaningFee: number;
  cleaningFeeVat: number;
  parkingFee: number;
  parkingFeeVat: number;
  customer: CustomerInterface;
  priceOverride: number;
  invoices: {
    number: string;
    start: Timestamp;
    end: Timestamp;
  }[];
}
