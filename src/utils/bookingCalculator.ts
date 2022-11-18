import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { InvoiceType } from "../enums/invoiceType.enum";

dayjs.extend(isBetween);

interface BookingCalculatorProps {
  isLastInvoice: boolean;
  invoiceType: InvoiceType;
  fromDate: Date;
  toDate: Date;
  touristTax?: number;
  roomPrice: number;
  roomvatPercentage: number;
  cleaningPrice?: number;
  cleaningVatPercentage?: number;
  parkingPrice?: number;
  parkingVatPercentage?: number;
}

export const bookingCalculator = ({
  isLastInvoice,
  invoiceType,
  fromDate,
  toDate,
  touristTax = 0,
  roomPrice,
  roomvatPercentage,
  cleaningPrice = 0,
  cleaningVatPercentage = 0,
  parkingPrice = 0,
  parkingVatPercentage = 0,
}: BookingCalculatorProps) => {
  const calcVat = (price: number, vat: number) =>
    Math.round(
      (price - price / parseFloat(`1.${String(vat).padStart(2, "0")}`)) * 100
    ) / 100;

  const calcTotalWithoutVat = (price: number, vat: number) =>
    Math.round((price - vat) * 100) / 100;

  const calcNights = (end: Date, start: Date) => dayjs(end).diff(start, "days");

  const nights = calcNights(toDate, fromDate);
  const touristTaxTotal = Math.round(touristTax * nights * 100) / 100;

  const roomTotal = Math.round(roomPrice * nights * 100) / 100;
  const roomVat = calcVat(roomTotal, roomvatPercentage);
  const roomTotalWithoutVat = calcTotalWithoutVat(roomTotal, roomVat);
  const roomPriceWithoutVat =
    Math.round((roomTotalWithoutVat / nights) * 100) / 100;

  const cleaningTotal = cleaningPrice;
  const cleaningVat = calcVat(cleaningTotal, cleaningVatPercentage);
  const cleaningTotalWithoutVat = calcTotalWithoutVat(
    cleaningPrice,
    cleaningVat
  );
  const cleaningPriceWithoutVat = cleaningTotalWithoutVat;

  const parkingTotal = parkingPrice;
  const parkingVat = calcVat(parkingTotal, parkingVatPercentage);
  const parkingTotalWithoutVat = calcTotalWithoutVat(parkingPrice, parkingVat);
  const parkingPriceWithoutVat =
    Math.round((parkingTotalWithoutVat / nights) * 100) / 100;

  const total =
    roomTotal +
    (isLastInvoice ? cleaningTotal : 0) +
    parkingTotal +
    touristTaxTotal;
  const vat = roomVat + (isLastInvoice ? cleaningVat : 0) + parkingVat;
  const totalWithoutVat = Math.round((total - vat) * 100) / 100;

  return { 
    nights,
    tourist: touristTax
      ? {
          total:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(touristTaxTotal)
              : touristTaxTotal,
        }
      : undefined,

    totalWithoutVat:
      invoiceType === InvoiceType.Credit
        ? -Math.abs(totalWithoutVat)
        : totalWithoutVat,
    vat: invoiceType === InvoiceType.Credit ? -Math.abs(vat) : vat,
    total: invoiceType === InvoiceType.Credit ? -Math.abs(total) : total,
    room: {
      priceWithoutVat:
        invoiceType === InvoiceType.Credit
          ? -Math.abs(roomPriceWithoutVat)
          : roomPriceWithoutVat,
      totalWithoutVat:
        invoiceType === InvoiceType.Credit
          ? -Math.abs(roomTotalWithoutVat)
          : roomTotalWithoutVat,
      vat: invoiceType === InvoiceType.Credit ? -Math.abs(roomVat) : roomVat,
      total:
        invoiceType === InvoiceType.Credit ? -Math.abs(roomTotal) : roomTotal,
    },
    cleaning: cleaningPrice
      ? {
          priceWithoutVat:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(cleaningPriceWithoutVat)
              : cleaningPriceWithoutVat,
          totalWithoutVat:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(cleaningTotalWithoutVat)
              : cleaningTotalWithoutVat,
          vat:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(cleaningVat)
              : cleaningVat,
          total:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(cleaningTotal)
              : cleaningTotal,
        }
      : undefined,
    parking: parkingPrice
      ? {
          priceWithoutVat:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(parkingPriceWithoutVat)
              : parkingPriceWithoutVat,
          totalWithoutVat:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(parkingTotalWithoutVat)
              : parkingTotalWithoutVat,
          vat:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(parkingVat)
              : parkingVat,
          total:
            invoiceType === InvoiceType.Credit
              ? -Math.abs(parkingTotal)
              : parkingTotal,
        }
      : undefined,
  };
};
