import { NextApiResponse, NextApiRequest } from "next";
import { soapRequest } from "../../src/utils/soap";
import { OFFICE } from "../../src/constants/office";

export interface DeleteCustomerResponse {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteCustomerResponse | string>
) {
  if (req.method !== "DELETE")
    return res.status(405).send("Only DELETE requests allowed");

  const response = await soapRequest<DeleteCustomerResponse>(
    `<dimension status="deleted">
        <office>${OFFICE}</office>
        <type>DEB</type>
        <code>${req.body.id}</code>
     </dimension>`,
    req.query.accessToken as string
  );

  return res.status(200).json(response);
}
