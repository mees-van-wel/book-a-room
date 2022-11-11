import { Button, Group, Loader, Modal, Table, Title } from "@mantine/core";
import { ReactElement, useState } from "react";

import { Collection } from "../../enums/collection.enum";
import Customer from "../../forms/Customer/Customer";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { CustomerInterface } from "../../interfaces/Customer";
import Dashboard from "../../layouts/Dashboard";

export const Customers = () => {
  const [customer, setCustomer] = useState<CustomerInterface | true>();
  const { documents: customers, loading } =
    useFirestoreDocuments<CustomerInterface>(Collection.Customers, true);

  if (loading) return <Loader />;

  const closeHandler = () => setCustomer(undefined);
  const newHandler = () => setCustomer(true);

  return (
    <>
      <Modal opened={!!customer} onClose={closeHandler} title="Klant">
        <Customer
          customer={customer === true ? undefined : customer}
          closeHandler={closeHandler}
        />
      </Modal>

      <div>
        <Group>
          <Title>Klanten</Title>
          <Button onClick={newHandler}>Nieuw</Button>
        </Group>
        {customers && !!customers.length && (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Naam</th>
                <th>E-mail</th>
                <th>Telefoonnummer</th>
                <th>Adres</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .sort((a, b) =>
                  a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                )
                .map((customer) => (
                  <tr
                    onClick={() => setCustomer(customer)}
                    key={customer.name}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phoneNumber}</td>
                    <td>{`${customer.street} ${customer.houseNumber}, ${customer.postalCode} ${customer.city}`}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

Customers.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
