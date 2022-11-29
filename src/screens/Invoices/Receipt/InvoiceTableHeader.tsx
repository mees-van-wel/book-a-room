import { Text, View, StyleSheet } from "@react-pdf/renderer";

const borderColor = "#90e5fc";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomColor: "#bff0fd",
    backgroundColor: "#bff0fd",
    borderBottomWidth: 1,
    alignItems: "center",
    height: 24,
    textAlign: "center",
    fontStyle: "bold",
    flexGrow: 1,
  },
  name: {
    width: "20%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  unitPrice: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  quantity: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  totalWithoutVat: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  vat: {
    width: "20%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  total: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
});

const InvoiceTableHeader = () => (
  <View style={styles.container}>
    <Text style={styles.name}>Description</Text>
    <Text style={styles.unitPrice}>Unit price</Text>
    <Text style={styles.quantity}>Quantity</Text>
    <Text style={styles.totalWithoutVat}>Total excl. VAT</Text>
    <Text style={styles.vat}>VAT</Text>
    <Text style={styles.total}>Total</Text>
  </View>
);

export default InvoiceTableHeader;
