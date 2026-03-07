"use client";

import { createContext, useContext } from "react";
import type { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

type AppUser = NonNullable<Session["user"]> | null;

interface AuthContextType {
  user: AppUser;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  return (
    <AuthContext.Provider
      value={{
        user: (data?.user as AppUser) ?? null,
        loading: status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  );
}
