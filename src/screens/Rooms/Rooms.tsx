import { Button, Loader, Modal, Table } from '@mantine/core';
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
      <Modal opened={!!room} onClose={closeHandler} title="Room">
        <Room room={room === true ? undefined : room} closeHandler={closeHandler} />
      </Modal>

      <div>
        <Button onClick={newHandler}>New</Button>
        {rooms && !!rooms.length && (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price per night</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
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
