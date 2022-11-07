import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

interface BookingCalculatorProps {
  isLastInvoice: boolean;
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
    Math.round((price / (100 + vat)) * vat * 100) / 100;

  const calcTotalWithoutVat = (price: number, vat: number) =>
    Math.round((price - vat) * 100) / 100;

  const calcNights = (end: Date, start: Date) => dayjs(end).diff(start, 'days');

  const nights = calcNights(toDate, fromDate);
  const touristTaxTotal = Math.round(touristTax * nights * 100) / 100;

  const roomTotal = Math.round(roomPrice * nights * 100) / 100;
  const roomVat = calcVat(roomTotal, roomvatPercentage);
  const roomTotalWithoutVat = calcTotalWithoutVat(roomTotal, roomVat);
  const roomPriceWithoutVat = Math.round((roomTotalWithoutVat / nights) * 100) / 100;

  const cleaningTotal = cleaningPrice;
  const cleaningVat = calcVat(cleaningPrice, cleaningVatPercentage);
  const cleaningTotalWithoutVat = calcTotalWithoutVat(cleaningPrice, cleaningVat);
  const cleaningPriceWithoutVat = cleaningTotalWithoutVat;

  const parkingTotal = Math.round(parkingPrice * nights * 100) / 100;
  const parkingVat = calcVat(parkingPrice, parkingVatPercentage);
  const parkingTotalWithoutVat = calcTotalWithoutVat(parkingPrice, parkingVat);
  const parkingPriceWithoutVat =
    Math.round((parkingTotalWithoutVat / nights) * 100) / 100;

  const total =
    roomTotal + (isLastInvoice ? cleaningTotal : 0) + parkingTotal + touristTaxTotal;
  const vat = roomVat + (isLastInvoice ? cleaningVat : 0) + parkingVat;
  const totalWithoutVat =
    roomTotalWithoutVat +
    (isLastInvoice ? cleaningTotalWithoutVat : 0) +
    parkingTotalWithoutVat;

  return {
    nights,
    touristTaxTotal: touristTax ? touristTaxTotal : undefined,
    totalWithoutVat,
    vat,
    total,
    room: {
      priceWithoutVat: roomPriceWithoutVat,
      totalWithoutVat: roomTotalWithoutVat,
      vat: roomVat,
      total: roomTotal,
    },
    cleaning: cleaningPrice
      ? {
          priceWithoutVat: cleaningPriceWithoutVat,
          totalWithoutVat: cleaningTotalWithoutVat,
          vat: cleaningVat,
          total: cleaningTotal,
        }
      : undefined,
    parking: parkingPrice
      ? {
          priceWithoutVat: parkingPriceWithoutVat,
          totalWithoutVat: parkingTotalWithoutVat,
          vat: parkingVat,
          total: parkingTotal,
        }
      : undefined,
  };
};
