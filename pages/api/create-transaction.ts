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

  const lines = req.body.lines as Line[];
  const invoiceDate = dayjs(req.body.invoiceDate);

  const response = await soapRequest<CreateTransactionResponse>(
    `<transaction destiny="temporary" raisewarning="false">
        <header>
            <code>VRK</code>
            <currency>EUR</currency>
            <date>${invoiceDate.format("YYYYMMDD")}</date>
            <period>${invoiceDate.format("YYYY/MM")}</period>
            <invoicenumber>${req.body.invoiceNumber}</invoicenumber>
            <office>${OFFICE}</office>
            <duedate>${invoiceDate.add(1, "month").format("YYYYMMDD")}</duedate>
        </header>
        <lines>
            <line type="total" id="1">
                <dim1>130000</dim1>
                <dim2>${req.body.customerId}</dim2>
                <value>${req.body.total.toFixed(2)}</value>
                <debitcredit>${
                  req.body.credit ? "credit" : "debit"
                }</debitcredit>
                <description />
            </line>${lines
              .map(
                ({ ledger, value, description, vatCode, vatValue }, index) => `
            <line type="detail" id="${index + 2}">
                <dim1>${ledger}</dim1>
                <value>${value.toFixed(2)}</value> 
                <debitcredit>${
                  req.body.credit ? "debit" : "credit"
                }</debitcredit>
                <description>${description}</description>
                <vatcode>${vatCode}</vatcode>
                <vatvalue>${vatValue.toFixed(2)}</vatvalue>
            </line>`
              )
              .join("")}
        </lines>
    </transaction>`,
    req.query.accessToken as string
  );

  return res.status(200).json(response);
}
