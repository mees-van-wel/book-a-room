import { DocumentReference } from "firebase/firestore";

export interface Customer {
  _ref?: DocumentReference<Customer>;
  twId?: string;
  id: string;
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
