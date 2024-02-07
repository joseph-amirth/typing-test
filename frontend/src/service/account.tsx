import React, { createContext, useContext, useEffect, useState } from "react";
import { Preferences, PreferencesContext } from "../context/preference";
import { ServerResponse, ServerService } from "./server";
import { NotificationsContext } from "../context/notifications";

export const AccountService = createContext<{
  accountState: AccountState;
  signUp: (params: SignUpParams) => Promise<ServerResponse<SignUpResponse>>;
  signIn: (params: SignInParams) => Promise<ServerResponse<SignInResponse>>;
  logOut: (params: LogOutParams) => Promise<ServerResponse<LogOutResponse>>;
}>({
  accountState: { state: "notsignedin" },
  signUp: () => {
    return Promise.resolve({ status: "fail" });
  },
  signIn: () => {
    return Promise.resolve({ status: "fail" });
  },
  logOut: () => {
    return Promise.resolve({ status: "fail" });
  },
});

export function AccountServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { addNotification } = useContext(NotificationsContext);
  const { receivePreferences } = useContext(PreferencesContext);
  const { get, post } = useContext(ServerService);

  const [accountState, setAccountState] = useState<AccountState>({
    state: "loading",
  });

  async function currentUser() {
    return get<CurrentUserResponse>("/current", {
      credentials: "include",
    });
  }

  useEffect(() => {
    currentUser().then((response) => {
      if (response.status === "ok") {
        const { username, email } = response.body;
        setAccountState({
          state: "signedin",
          account: { username, email },
        });
      } else {
        setAccountState({
          state: "notsignedin",
        });
      }
    });
  }, []);

  async function canSignUpOrSignIn() {
    if (accountState.state === "signedin") {
      addNotification({
        type: "Error",
        title: "Already signed in",
        body: `You are already signed in as ${accountState.account.username}. If this isn't you, please log out and try signing up/signing in again.`,
      });
      return false;
    } else if (accountState.state === "loading") {
      return false;
    }
    return true;
  }

  async function signUp(params: SignUpParams) {
    if (!canSignUpOrSignIn()) {
      return { status: "fail" } as ServerResponse<SignInResponse>;
    }

    const response = await post<SignUpResponse>("/signup", params, {
      credentials: "include",
    });

    if (response.status === "ok") {
      const { username, email } = response.body;
      setAccountState({ state: "signedin", account: { username, email } });
    }

    return response;
  }

  async function signIn(params: SignInParams) {
    if (!canSignUpOrSignIn()) {
      return { status: "fail" } as ServerResponse<SignInResponse>;
    }

    setAccountState({ state: "loading" });

    const response = await post<SignInResponse>("/signin", params, {
      credentials: "include",
    });

    if (response.status === "ok") {
      const { username, email, preferences } = response.body;
      setAccountState({ state: "signedin", account: { username, email } });
      receivePreferences(preferences);
    }

    return response;
  }

  async function logOut(params: LogOutParams) {
    if (accountState.state !== "signedin") {
      return { status: "fail" } as ServerResponse<LogOutResponse>;
    }

    setAccountState({ state: "loading" });

    const response = await post<LogOutResponse>("/logout", params, {
      credentials: "include",
    });

    if (response.status === "ok") {
      setAccountState({
        state: "notsignedin",
      });
    }

    return response;
  }

  const accountService = { accountState, signUp, signIn, logOut };

  return (
    <AccountService.Provider value={accountService}>
      {children}
    </AccountService.Provider>
  );
}

export type AccountState = NotSignedInState | LoadingState | SignedInState;

interface NotSignedInState {
  state: "notsignedin";
}

// Indicates that some request is in-flight.
interface LoadingState {
  state: "loading";
}

interface SignedInState {
  state: "signedin";
  account: Account;
}

export interface Account {
  username: string;
  email: string;
}

interface SignUpParams {
  username: string;
  email: string;
  password: string;
  preferences: Preferences;
}

interface SignUpResponse extends Account {
  username: string;
  email: string;
}

interface SignInParams {
  usernameOrEmail: UsernameOrEmail;
  password: string;
}

interface SignInResponse {
  username: string;
  email: string;
  preferences: Preferences;
}

interface CurrentUserResponse {
  username: string;
  email: string;
  preferences: Preferences;
}

interface LogOutParams {}

interface LogOutResponse {}

type UsernameOrEmail = { username: string } | { email: string };
