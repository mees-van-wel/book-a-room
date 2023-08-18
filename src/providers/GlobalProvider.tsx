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

export const GlobalProvier = ({ children }: { children: React.ReactNode }) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const [session, setSession] = useState<TokenResponse | false>();

  const refresh = async (body: { code?: string; refreshToken?: string }) => {
    const { data } = await axios.post<TokenResponse | string>(
      "/api/request-token",
      body
    );

    if (typeof data === "string") return;

    window.localStorage.setItem("twinfield", JSON.stringify(data));
    setSession(data);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      refresh({ refreshToken: data.refresh_token });
    }, data.expires_in * 1000 - 30000);
  };

  useEffect(() => {
    const storedSession = window.localStorage.getItem("twinfield");
    if (storedSession) {
      const session: TokenResponse = JSON.parse(storedSession);
      refresh({ refreshToken: session.refresh_token });
      return;
    }

    const code = new URL(
      `${window.location.origin}${router.asPath}`
    ).searchParams.get("code");

    if (typeof code === "string") refresh({ code });
    else setSession(false);
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
