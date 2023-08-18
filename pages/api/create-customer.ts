import { NextApiResponse, NextApiRequest } from "next";
import { soapRequest } from "../../src/utils/soap";
import dayjs from "dayjs";
import { OFFICE } from "../../src/constants/office";

interface Line {
  description: string;
  value: number;
  ledger: number;
  vatCode: "VL" | "VH";
  vatValue: number;
}

export interface CreateTransactionResponse {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateTransactionResponse | string>
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const response = await soapRequest<CreateTransactionResponse>(
    `<dimension>
        <office>${OFFICE}</office>
        <type>DEB</type>
        <name>${req.body.name}</name>
        <shortname></shortname>
	    <website></website>
        <financials>
            <matchtype>customersupplier</matchtype>
            <duedays>30</duedays>
            <payavailable>false</payavailable>
            <meansofpayment>none</meansofpayment>
        </financials>
        <addresses>
            <address id="1" type="invoice" default="true">
                <name>${req.body.name}</name>
                <country>NL</country>
                <city>${req.body.city}</city>
                <postcode>${req.body.postalCode}</postcode>
                <telephone>${req.body.phoneNumber}</telephone>
                <telefax></telefax>
                <email>${req.body.email}</email>
                <field1>${req.body.secondName}</field1>
                <field2>${req.body.extra}</field2>
            </address>
	    </addresses>
     </dimension>`,
    req.query.accessToken as string
  );

  return res.status(200).json(response);
}
