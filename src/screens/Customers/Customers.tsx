import { Button, Group, Loader, Modal, Table, Title } from '@mantine/core';
import { FC, useState } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import Customer from '../../forms/Customer/Customer';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { CustomerInterface } from '../../interfaces/Customer';

const Customers: FC = () => {
  const [customer, setCustomer] = useState<CustomerInterface | true>();
  const { documents: customers, loading } = useFirestoreDocuments<CustomerInterface>(
    COLLECTIONS.CUSTOMERS,
    true,
  );

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
              {customers.map((customer) => (
                <tr
                  onClick={() => setCustomer(customer)}
                  key={customer.name}
                  style={{
                    cursor: 'pointer',
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

export default Customers;
