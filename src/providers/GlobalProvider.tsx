import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TokenResponse } from "../../pages/api/request-token";
import axios from "axios";
import { useRouter } from "next/router";
import { SettingsInterface } from "../interfaces/Settings";
import { Collection } from "../enums/collection.enum";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const GlobalContext = createContext<{
  session: undefined | false | TokenResponse;
  setSession: Dispatch<SetStateAction<undefined | false | TokenResponse>>;
  timeoutRef: MutableRefObject<NodeJS.Timeout | undefined>;
} | null>(null);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context || context.session === undefined)
    throw new Error("Using GlobalContext, must be insde App");

  return context;
};

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const [session, setSession] = useState<TokenResponse | false>();

  const refresh = async (body: { code?: string; refreshToken?: string }) => {
    const { data } = await axios.post<TokenResponse | string>(
      "/api/request-token",
      body
    );

    const response = await getDocs(collection(firestore, Collection.Settings));
    const snapshot = response.docs[0];
    const settings = {
      ...snapshot.data(),
      id: snapshot.id,
    } as SettingsInterface;

    if (!settings || typeof data === "string") return;

    await setDoc(doc(firestore, Collection.Settings, settings.id), {
      ...settings,
      session: data,
    });

    setSession(data);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      refresh({ refreshToken: data.refresh_token });
    }, data.expires_in * 1000 - 30000);
  };

  useEffect(() => {
    (async () => {
      const response = await getDocs(
        collection(firestore, Collection.Settings)
      );
      const snapshot = response.docs[0];
      const settings = {
        ...snapshot.data(),
        id: snapshot.id,
      } as SettingsInterface;

      if (settings.session) {
        refresh({ refreshToken: settings.session.refresh_token });
        return;
      }

      const code = new URL(
        `${window.location.origin}${router.asPath}`
      ).searchParams.get("code");

      if (typeof code === "string") refresh({ code });
      else setSession(false);
    })();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        session,
        setSession,
        timeoutRef,
      }}
    >
      {session === undefined ? null : children}
    </GlobalContext.Provider>
  );
};