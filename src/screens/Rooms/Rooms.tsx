import { Button, Group, Loader, Modal, Table, Title } from "@mantine/core";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "../../../pages/_app";

import { Collection } from "../../enums/collection.enum";
import Room from "../../forms/Room";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { RoomInterface } from "../../interfaces/Room";
import Dashboard from "../../layouts/Dashboard";
import currency from "../../utils/currency";

export const Rooms: NextPageWithLayout = () => {
  const [room, setRoom] = useState<RoomInterface | true>();
  const { documents: rooms, loading } = useFirestoreDocuments<RoomInterface>(
    Collection.Rooms,
    true
  );

  if (loading) return <Loader />;

  const closeHandler = () => setRoom(undefined);
  const newHandler = () => setRoom(true);

  return (
    <>
      <Modal opened={!!room} onClose={closeHandler} title="Kamer">
        <Room
          room={room === true ? undefined : room}
          closeHandler={closeHandler}
        />
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
                .sort((a, b) =>
                  a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                )
                .map((room) => (
                  <tr
                    onClick={() => setRoom(room)}
                    key={room.name}
                    style={{
                      cursor: "pointer",
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

Rooms.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
