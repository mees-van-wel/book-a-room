import { Button, Loader, Paper, PasswordInput, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useNotifications } from '@mantine/notifications';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useCallback, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';

import Page from '../../layouts/Page';
import { auth } from '../../lib/firebase';
import ROUTES from '../../ROUTES';

const Auth = () => {
  const [user, loading] = useAuthState(auth);
  const notifications = useNotifications();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!loading && !!user) navigate(ROUTES.BOOKINGS.path);
  }, [loading, user]);

  const submitHandler = useCallback(async (values) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (e) {
      notifications.showNotification({
        color: 'red',
        title: 'Inlog fout',
        message: 'Ongeldig e-mailadres of wachtwoord',
      });
    }
  }, []);

  if (loading || (!loading && !!user))
    return (
      <Page>
        <Loader />
      </Page>
    );

  return (
    <Paper padding="md" shadow="md" radius="md" withBorder>
      <Title>Inloggen</Title>
      <form
        onSubmit={form.onSubmit(submitHandler)}
        style={{
          minWidth: 250,
        }}
      >
        <TextInput
          required
          label="E-mail"
          type="email"
          name="username"
          id="username"
          placeholder="E-mail"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          required
          label="Wachtwoord"
          name="password"
          id="password"
          placeholder="Wachtwoord"
          {...form.getInputProps('password')}
        />
        <Button type="submit" mt={16}>
          Inloggen
        </Button>
      </form>
    </Paper>
  );
};
export default Auth;
