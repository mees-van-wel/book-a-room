import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { renderToStream } from "@react-pdf/renderer";
import { Receipt } from "../../src/screens/Invoices/Receipt";
import { Invoice } from "../../src/interfaces/invoice.interface";
import { SettingsInterface } from "../../src/interfaces/Settings";
import { Booking } from "../../src/interfaces/booking.interface";
import { InvoiceType } from "../../src/enums/invoiceType.enum";

let transporter = nodemailer.createTransport({
  // @ts-ignore
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const { to, invoice, settings, booking } = req.body as {
    to: string;
    invoice: Invoice;
    settings: SettingsInterface;
    booking: Booking;
  };

  const stream = await renderToStream(
    <Receipt
      images={{
        dir: `http://${req.headers.host}/assets/images`,
        header: process.env.NEXT_PUBLIC_INVOICE_HEADER,
        footer: process.env.NEXT_PUBLIC_INVOICE_FOOTER,
      }}
      invoice={invoice}
      settings={settings}
      booking={booking}
    />
  );

  await transporter
    .sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: "Factuur",
      html: "Test body",
      attachments: [
        {
          filename: `${
            invoice.type === InvoiceType.Credit ? "Creditfactuur" : "Factuur"
          } ${invoice.number}.pdf`,
          // @ts-ignore
          content: stream,
          contentType: "application/pdf",
        },
      ],
    })
    .catch((error) => {
      console.log(error);

      return res.status(401).send("Error");
    });

  res.status(200).send("Success");
}
