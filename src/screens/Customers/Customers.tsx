import { Button, Group, Loader, Table, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { Collection } from "../../enums/collection.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { CustomerInterface } from "../../interfaces/Customer";
import Dashboard from "../../layouts/Dashboard";
import { generateRoute } from "../../utils/generateRoute.utility";
import { NEW } from "../../utils/new.utility";

export const Customers: NextPageWithLayout = () => {
  const router = useRouter();
  const { documents: customers, loading } =
    useFirestoreDocuments<CustomerInterface>(Collection.Customers, true);

  if (loading) return <Loader />;

  return (
    <div>
      <Group>
        <Title>Klanten</Title>
        <Link href={generateRoute(Route.Customer, { id: NEW })} passHref>
          <Button component="a">Nieuw</Button>
        </Link>
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
              .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
              .map((customer) => (
                <tr
                  onClick={() => {
                    router.push({
                      pathname: Route.Customer,
                      query: {
                        id: customer.id,
                      },
                    });
                  }}
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
  );
};

Customers.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
