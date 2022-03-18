import { Button, Group, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { FC, useCallback } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import { RoomInterface } from '../../interfaces/Room';
import { firestore } from '../../lib/firebase';

interface RoomProps {
  room?: RoomInterface;
  closeHandler: () => void;
}

const Room: FC<RoomProps> = ({ room, closeHandler }) => {
  const form = useForm({
    initialValues: room ?? {
      name: '',
      price: null,
    },
  });

  const submitHandler = useCallback(
    async (values) => {
      if (!room?.id) await addDoc(collection(firestore, COLLECTIONS.ROOMS), values);
      else await setDoc(doc(firestore, COLLECTIONS.ROOMS, room.id), values);

      closeHandler();
    },
    [room, closeHandler],
  );

  const deleteHandler = useCallback(async () => {
    if (room?.id) await deleteDoc(doc(firestore, COLLECTIONS.ROOMS, room.id));

    closeHandler();
  }, [room, closeHandler]);

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <TextInput
        required
        label="Naam"
        placeholder="Naam"
        {...form.getInputProps('name')}
      />
      <NumberInput
        required
        min={0}
        noClampOnBlur
        decimalSeparator=","
        icon="€"
        label="Prijs per nacht"
        placeholder="Prijs per nacht"
        {...form.getInputProps('price')}
      />
      <Group mt={16}>
        <Button type="submit">Opslaan</Button>
        {!!room?.id && (
          <Button color="red" onClick={deleteHandler}>
            Verwijderen
          </Button>
        )}
      </Group>
    </form>
  );
};

export default Room;
