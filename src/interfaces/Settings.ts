import { TokenResponse } from "../../pages/api/request-token";

export interface SettingsInterface {
  id: string;
  invoices?: number;
  companyName: string;
  email: string;
  phoneNumber: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  kvkNumber: string;
  btwNumber: string;
  bicCode: string;
  iban: string;
  session?: TokenResponse | null;
}
