import './index.css';

import { ColorScheme, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';
import React, { useEffect } from 'react';

import Router from './Router';

export const App = () => {
  const [value, setValue] = useLocalStorage<ColorScheme>({
    key: 'color-scheme',
  });

  useEffect(() => {
    if (!value) {
      setValue(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      );
    }
  }, []);

  if (!value) return null;

  return (
    <MantineProvider theme={{ colorScheme: value }} withGlobalStyles withNormalizeCSS>
      <NotificationsProvider position="top-right">
        <Router />
      </NotificationsProvider>
    </MantineProvider>
  );
};
