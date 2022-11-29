import { Text, View, StyleSheet } from "@react-pdf/renderer";
import currency from "../../../utils/currency";
import { InvoiceLine } from "../../../interfaces/invoice.interface";

const borderColor = "#90e5fc";
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomColor: "#bff0fd",
    borderBottomWidth: 1,
    alignItems: "center",
    height: 24,
    fontSize: 12,
    fontStyle: "bold",
  },
  description: {
    width: "85%",
    textAlign: "right",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingRight: 8,
  },
  total: {
    width: "15%",
    textAlign: "left",
    paddingLeft: 8,
  },
});

const InvoiceTableFooter = ({ items }: { items: InvoiceLine[] }) => {
  const totalWithoutVat = items.reduce(
    (accumulator, { totalWithoutVat }) => accumulator + totalWithoutVat,
    0
  );

  const vat = items.reduce((accumulator, { vat }) => accumulator + vat, 0);

  const total = items.reduce(
    (accumulator, { total }) => accumulator + total,
    0
  );

  return (
    <>
      <View style={styles.row}>
        <Text style={styles.description}>Total excl. VAT</Text>
        <Text style={styles.total}>{currency(totalWithoutVat)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.description}>Total VAT</Text>
        <Text style={styles.total}>{currency(vat)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.description}>Total</Text>
        <Text style={styles.total}>{currency(total)}</Text>
      </View>
    </>
  );
};

export default InvoiceTableFooter;
