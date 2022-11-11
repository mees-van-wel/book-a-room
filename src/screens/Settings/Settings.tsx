import { Loader } from "@mantine/core";
import { ReactElement, useMemo } from "react";
import { NextPageWithLayout } from "../../../pages/_app";

import { Collection } from "../../enums/collection.enum";
import Setting from "../../forms/Setting";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { SettingsInterface } from "../../interfaces/Settings";
import Dashboard from "../../layouts/Dashboard";

export const Settings: NextPageWithLayout = () => {
  const { documents: settingsArray, loading } =
    useFirestoreDocuments<SettingsInterface>(Collection.Settings, true);

  const settings = useMemo(
    () => settingsArray && settingsArray[0],
    [settingsArray]
  );

  if (loading) return <Loader />;

  return <Setting settings={settings} />;
};

Settings.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
