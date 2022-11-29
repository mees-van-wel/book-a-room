import { Fragment } from "react";
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
    fontStyle: "bold",
  },
  name: {
    width: "20%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
  unitPrice: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
  quantity: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
  totalWithoutVat: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
  vat: {
    width: "20%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
  total: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
});

const InvoiceTableRow = ({ items }: { items: InvoiceLine[] }) => {
  const rows = items.map(
    (
      {
        name,
        unitPriceWithoutVat,
        quantity,
        totalWithoutVat,
        vat,
        vatPercentage,
        total,
      },
      index
    ) => (
      <View style={styles.row} key={index}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.unitPrice}>{currency(unitPriceWithoutVat)}</Text>
        <Text style={styles.quantity}>{quantity}x</Text>
        <Text style={styles.totalWithoutVat}>{currency(totalWithoutVat)}</Text>
        <Text style={styles.vat}>
          {currency(vat)} ({vatPercentage}%)
        </Text>
        <Text style={styles.total}>{currency(total)}</Text>
      </View>
    )
  );
  return <Fragment>{rows}</Fragment>;
};

export default InvoiceTableRow;
