import { Loader } from '@mantine/core';
import { useMemo } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import Setting from '../../forms/Setting';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { SettingsInterface } from '../../interfaces/Settings';

const Settings = () => {
  const { documents: settingsArray, loading } = useFirestoreDocuments<SettingsInterface>(
    COLLECTIONS.SETTINGS,
    true,
  );

  const settings = useMemo(() => settingsArray && settingsArray[0], [settingsArray]);

  if (loading) return <Loader />;

  return <Setting settings={settings} />;
};

export default Settings;
