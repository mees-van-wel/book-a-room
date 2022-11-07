export const InvoiceType = {
  INVOICE: 'INVOICE',
  CREDIT: 'CREDIT',
} as const;

export type InvoiceType = typeof InvoiceType[keyof typeof InvoiceType];
