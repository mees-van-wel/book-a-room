import { Button, Loader, Paper, PasswordInput, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useNotifications } from '@mantine/notifications';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useCallback, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';

import ROUTES from '../../enums/ROUTES';
import Page from '../../layouts/Page';
import { auth } from '../../lib/firebase';
import routes from '../../routes';

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
    if (!loading && !!user) navigate(routes[ROUTES.BOOKINGS].path);
  }, [loading, user]);

  const submitHandler = useCallback(async (values) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (e) {
      notifications.showNotification({
        color: 'red',
        title: 'Login error',
        message: 'Invalid email or password',
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
      <Title>Login</Title>
      <form
        onSubmit={form.onSubmit(submitHandler)}
        style={{
          minWidth: 250,
        }}
      >
        <TextInput
          required
          label="Email"
          type="email"
          name="username"
          id="username"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          required
          label="Password"
          name="password"
          id="password"
          placeholder="Password"
          {...form.getInputProps('password')}
        />
        <Button type="submit" mt={16}>
          Login
        </Button>
      </form>
    </Paper>
  );
};
export default Auth;
