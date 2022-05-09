import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { FC, useCallback } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import { CustomerInterface } from '../../interfaces/Customer';
import { firestore } from '../../lib/firebase';

interface CustomerProps {
  customer?: CustomerInterface;
  closeHandler: () => void;
}

const Customer: FC<CustomerProps> = ({ customer, closeHandler }) => {
  const form = useForm({
    initialValues: customer ?? {
      name: null,
      secondName: null,
      email: null,
      phoneNumber: null,
      street: null,
      houseNumber: null,
      postalCode: null,
      city: null,
      extra: null,
    },
  });

  const submitHandler = useCallback(
    async (values) => {
      if (!customer?.id)
        await addDoc(collection(firestore, COLLECTIONS.CUSTOMERS), values);
      else await setDoc(doc(firestore, COLLECTIONS.CUSTOMERS, customer.id), values);

      closeHandler();
    },
    [customer, closeHandler],
  );

  const deleteHandler = useCallback(async () => {
    if (customer?.id) await deleteDoc(doc(firestore, COLLECTIONS.CUSTOMERS, customer.id));

    closeHandler();
  }, [customer, closeHandler]);

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <TextInput
        required
        label="Naam"
        placeholder="Naam"
        {...form.getInputProps('name')}
      />
      <TextInput
        label="Tweede naam"
        placeholder="Tweede naam"
        {...form.getInputProps('secondName')}
      />
      <TextInput
        required
        type="email"
        label="E-mail"
        placeholder="E-mail"
        {...form.getInputProps('email')}
      />
      <TextInput
        required
        type="tel"
        label="Telefoonnummer"
        placeholder="Telefoonnummer"
        {...form.getInputProps('phoneNumber')}
      />
      <TextInput
        required
        label="Straat"
        placeholder="Straat"
        {...form.getInputProps('street')}
      />
      <TextInput
        required
        label="Huisnummer"
        placeholder="Huisnummer"
        {...form.getInputProps('houseNumber')}
      />
      <TextInput
        required
        label="Postcode"
        placeholder="Postcode"
        {...form.getInputProps('postalCode')}
      />
      <TextInput
        required
        label="Plaats"
        placeholder="Plaats"
        {...form.getInputProps('city')}
      />
      <TextInput label="Extra" placeholder="Extra" {...form.getInputProps('extra')} />
      <Group mt={16}>
        <Button type="submit">Opslaan</Button>
        {!!customer?.id && (
          <Button color="red" onClick={deleteHandler}>
            Verwijderen
          </Button>
        )}
      </Group>
    </form>
  );
};

export default Customer;
