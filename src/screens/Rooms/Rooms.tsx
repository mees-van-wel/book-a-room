import { Button, Group, Loader, Table, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { Collection } from "../../enums/collection.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { RoomInterface } from "../../interfaces/Room";
import Dashboard from "../../layouts/Dashboard";
import currency from "../../utils/currency";
import { generateRoute } from "../../utils/generateRoute.utility";
import { NEW } from "../../utils/new.utility";

export const Rooms: NextPageWithLayout = () => {
  const router = useRouter();
  const { documents: rooms, loading } = useFirestoreDocuments<RoomInterface>(
    Collection.Rooms,
    true
  );

  if (loading) return <Loader />;

  return (
    <div>
      <Group>
        <Title>Kamers</Title>
        <Link href={generateRoute(Route.Room, { id: NEW })} passHref>
          <Button component="a">Nieuw</Button>
        </Link>
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
                  onClick={() => {
                    router.push({
                      pathname: Route.Room,
                      query: {
                        id: room.id,
                      },
                    });
                  }}
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
  );
};

Rooms.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
