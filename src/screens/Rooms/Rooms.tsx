import { Button, Group, Loader, Modal, Table, Title } from '@mantine/core';
import { FC, useState } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import Room from '../../forms/Room';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { RoomInterface } from '../../interfaces/Room';
import currency from '../../utils/currency';

const Rooms: FC = () => {
  const [room, setRoom] = useState<RoomInterface | true>();
  const { documents: rooms, loading } = useFirestoreDocuments<RoomInterface>(
    COLLECTIONS.ROOMS,
    true,
  );

  if (loading) return <Loader />;

  const closeHandler = () => setRoom(undefined);
  const newHandler = () => setRoom(true);

  return (
    <>
      <Modal opened={!!room} onClose={closeHandler} title="Kamer">
        <Room room={room === true ? undefined : room} closeHandler={closeHandler} />
      </Modal>

      <div>
        <Group>
          <Title>Kamers</Title>
          <Button onClick={newHandler}>Nieuw</Button>
        </Group>
        {rooms && !!rooms.length && (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Naam</th>
                <th>Prijs per nacht</th>
              </tr>
            </thead>
            <tbody>
              {rooms
                .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
                .map((room) => (
                  <tr
                    onClick={() => setRoom(room)}
                    key={room.name}
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    <td>{room.name}</td>
                    <td>{currency(room.price)}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default Rooms;
