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
        label="Name"
        placeholder="Name"
        {...form.getInputProps('name')}
      />
      <NumberInput
        min={0}
        noClampOnBlur
        decimalSeparator=","
        required
        icon="€"
        label="Price per night"
        placeholder="Price per night"
        {...form.getInputProps('price')}
      />
      <Group mt={16}>
        <Button type="submit">Save</Button>
        {!!room?.id && (
          <Button color="red" onClick={deleteHandler}>
            Delete
          </Button>
        )}
      </Group>
    </form>
  );
};

export default Room;
