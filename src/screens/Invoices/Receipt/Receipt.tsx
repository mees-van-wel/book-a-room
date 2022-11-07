import pdf from '@react-pdf/renderer';
import { FC } from 'react';

import LocalResidenceFooter from '../../../footer-local-residence.jpg';
import { compareDates } from '../../../forms/Booking/Booking';
import LocalResidenceHeader from '../../../header-local-residence.jpg';
import { BookingInterface } from '../../../interfaces/Booking';
import { Invoice } from '../../../interfaces/invoice.interface';
import { SettingsInterface } from '../../../interfaces/Settings';
import LongStayBredaHeader from '../../../logo.jpg';
import { bookingCalculator } from '../../../utils/bookingCalculator';
import currency from '../../../utils/currency';

const { Document, Page, Text, View, StyleSheet, Image } = pdf;

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    flexDirection: 'column',
  },
  container: {
    padding: '16px 32px 32px 32px',
  },
  settingsContainer: {
    alignItems: 'flex-end',
  },
  line: {
    marginVertical: 8,
    height: 1,
    backgroundColor: 'black',
    width: 100,
  },
  spacer: {
    marginVertical: 4,
  },
  table: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    paddingBottom: 4,
    marginBottom: 4,
    borderBottom: '1px solid black',
  },
  image: {
    marginBottom: 10,
  },
});

interface ReceiptProps {
  invoice: Invoice;
  settings: SettingsInterface;
  booking: BookingInterface;
}

export const Receipt: FC<ReceiptProps> = ({ invoice, settings, booking }) => {
  const isLastInvoice = compareDates(booking.end.toDate(), invoice.to.toDate());

  const {
    nights,
    touristTaxTotal,
    totalWithoutVat,
    vat,
    total,
    room,
    cleaning,
    parking,
  } = bookingCalculator({
    isLastInvoice,
    fromDate: invoice.from.toDate(),
    toDate: invoice.to.toDate(),
    touristTax: booking.touristTax,
    roomPrice: booking.room.price,
    roomvatPercentage: booking.btw,
    cleaningPrice: booking.cleaningFee,
    cleaningVatPercentage: booking.cleaningFeeVat,
    parkingPrice: booking.parkingFee,
    parkingVatPercentage: booking.parkingFeeVat,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/*<Image src={LocalResidenceHeader} />*/}
        <Image src={LongStayBredaHeader} />
        <View style={styles.container}>
          <View style={styles.settingsContainer}>
            <Text>Invoice number: {invoice.id}</Text>
            <Text>Date: {invoice.date.toDate().toLocaleDateString('nl-NL')}</Text>
            <View style={styles.line} />
            <Text>{settings.companyName}</Text>
            <Text>
              {settings.street} {settings.houseNumber}
            </Text>
            <Text>
              {settings.postalCode} {settings.city}
            </Text>
            <View style={styles.spacer} />
            <Text>Email: {settings.email}</Text>
            <Text>Telephone number: {settings.phoneNumber}</Text>
            <View style={styles.spacer} />
            <Text>Chamber of Commerce number: {settings.kvkNumber}</Text>
            <Text>VAT number: {settings.btwNumber}</Text>
            <View style={styles.spacer} />
            <Text>Swift (BIC) code: {settings.bicCode}</Text>
            <Text>IBAN: {settings.iban}</Text>
          </View>
          <View>
            <Text>{booking.customer.name}</Text>
            <Text>{booking.customer.secondName}</Text>
            <Text>
              {booking.customer.street} {booking.customer.houseNumber}
            </Text>
            <Text>
              {booking.customer.postalCode} {booking.customer.city}
            </Text>
            <View style={styles.spacer} />
            <Text>Email: {booking.customer.email}</Text>
            <Text>Telephone number: {booking.customer.phoneNumber}</Text>
            <View style={styles.spacer} />
            <Text>{booking.customer.extra}</Text>
            <Text>{booking.extraOne}</Text>
            <Text>{booking.extraTwo}</Text>
            <View style={styles.spacer} />
          </View>
          <View style={styles.table}>
            <View>
              <Text style={styles.header}>Service</Text>
              <Text>
                {booking.room.name} ({invoice.from.toDate().toLocaleDateString('Nl-nl')}
                {' - '}
                {invoice.to.toDate().toLocaleDateString('Nl-nl')})
              </Text>
              {cleaning && isLastInvoice ? <Text>Cleaning fee</Text> : <Text />}
              {parking ? <Text>Parking costs</Text> : <Text />}
              {touristTaxTotal ? <Text>Tourist tax</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Unit price</Text>
              <Text>{currency(room.priceWithoutVat)}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{currency(cleaning.priceWithoutVat)}</Text>
              ) : (
                <Text />
              )}
              {parking ? <Text>{currency(parking.priceWithoutVat)}</Text> : <Text />}
              {touristTaxTotal ? <Text>{currency(booking.touristTax)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Amount</Text>
              <Text>{nights}</Text>
              {cleaning && isLastInvoice ? <Text>{nights}</Text> : <Text />}
              {parking ? <Text>{nights}</Text> : <Text />}
              {touristTaxTotal ? <Text>{nights}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Total excluding VAT</Text>
              <Text>{currency(room.totalWithoutVat)}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{currency(cleaning.totalWithoutVat)}</Text>
              ) : (
                <Text />
              )}
              {parking ? <Text>{currency(parking.totalWithoutVat)}</Text> : <Text />}
              {touristTaxTotal ? <Text>{currency(touristTaxTotal)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>VAT</Text>
              <Text>{`${currency(room.vat)} (${booking.btw}%${
                booking.btw == 0 ? ' / Verlegd' : ''
              })`}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{`${currency(cleaning.vat)} (${booking.cleaningFeeVat}%${
                  booking.cleaningFeeVat == 0 ? ' / Verlegd' : ''
                })`}</Text>
              ) : (
                <Text />
              )}
              {parking ? (
                <Text>{`${currency(parking.vat)} (${booking.parkingFeeVat}%${
                  booking.parkingFeeVat == 0 ? ' / Verlegd' : ''
                })`}</Text>
              ) : (
                <Text />
              )}
              {touristTaxTotal ? <Text>{`${currency(0)} (0%)`}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Total</Text>
              <Text>{currency(room.total)}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{currency(cleaning.total)}</Text>
              ) : (
                <Text />
              )}
              {parking ? <Text>{currency(parking.total)}</Text> : <Text />}
              {touristTaxTotal ? <Text>{currency(touristTaxTotal)}</Text> : <Text />}
            </View>
          </View>
          <View style={styles.spacer} />
          <Text>Total excluding VAT: {currency(totalWithoutVat)}</Text>
          <Text>Total VAT: {currency(vat)}</Text>
          <Text>Total: {currency(total)}</Text>
          <View style={styles.spacer} />
          <View style={styles.spacer} />
          <Text>We kindly request that you transfer the amount due within 14 days.</Text>
        </View>
        {/*<Image src={LocalResidenceFooter} />*/}
      </Page>
    </Document>
  );
};
