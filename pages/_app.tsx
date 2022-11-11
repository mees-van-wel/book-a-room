import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode, useEffect } from "react";
import { NextPage } from "next";
import { NotificationsProvider } from "@mantine/notifications";
import { ColorScheme, MantineProvider } from "@mantine/core";
import Head from "next/head";
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "color-scheme",
  });

  useEffect(() => {
    if (!colorScheme) {
      setColorScheme(
        window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>Book a room</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme,
        }}
      >
        <ModalsProvider>
          <NotificationsProvider position="top-right">
            {getLayout(<Component {...pageProps} />)}
          </NotificationsProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}
