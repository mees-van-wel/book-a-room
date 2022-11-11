// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "postmark";

const client = new Client("06b3c739-feda-4ed0-8c48-7d46e041f089");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const { to } = req.body as {
    to: string;
  };

  await client
    .sendEmail({
      From: "Hexa Center <noreply@hexa.center>",
      To: to,
      Subject: "Factuur",
      HtmlBody: "Test body",
      // Attachments: attachments,
    })
    .catch((error) => {
      console.log(error);

      return res.status(401).send("Error");
    });

  res.status(200).send("Success");
}
