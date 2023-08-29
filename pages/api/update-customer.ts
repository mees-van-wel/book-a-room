import { NextApiResponse, NextApiRequest } from "next";
import { soapRequest } from "../../src/utils/soap";

export interface UpdateCustomerResponse {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateCustomerResponse | string>
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const response = await soapRequest<UpdateCustomerResponse>(
    `<dimension>
        <office>${process.env.TW_OFFICE}</office>
        <type>DEB</type>
        <name>${req.body.name}</name>
        <shortname></shortname>
        <code>${req.body.code}</code>
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
