import { NextApiResponse, NextApiRequest } from "next";
import { soapRequest } from "../../src/utils/soap";

export interface DeleteCustomerResponse {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteCustomerResponse | string>
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const response = await soapRequest<DeleteCustomerResponse>(
    `<dimension status="deleted">
        <office>${process.env.TW_OFFICE}</office>
        <type>DEB</type>
        <code>${req.body.code}</code>
     </dimension>`,
    req.query.accessToken as string
  );

  return res.status(200).json(response);
}
