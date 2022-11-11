import { DocumentReference } from "firebase/firestore";

export interface Room {
  _ref?: DocumentReference<Room>;
  id: string;
  name: string;
  price: number;
}
