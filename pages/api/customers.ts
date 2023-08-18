import { NextApiResponse, NextApiRequest } from "next";
import { soapRequest } from "../../src/utils/soap";

export interface CustomersResponse {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CustomersResponse | string>
) {
  if (req.method !== "GET")
    return res.status(405).send("Only GET requests allowed");

  const customers = await soapRequest<CustomersResponse>(
    `<read><type>dimensions</type><dimtype>DEB</dimtype></read>`,
    req.query.accessToken as string
  );

  return res.status(200).json(customers);
}
