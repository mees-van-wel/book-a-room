import { ReactNode } from "react";

export const Page = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);
