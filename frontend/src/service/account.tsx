import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Preferences, PreferencesContext } from "../context/preference";
import { ServerResponse, ServerService } from "./server";
import { NotificationsContext } from "../context/notifications";

export const AccountService = createContext<{
  accountState: AccountState;
  signUp: (params: SignUpParams) => Promise<ServerResponse<SignUpResponse>>;
  signIn: (params: SignInParams) => Promise<ServerResponse<SignInResponse>>;
  logOut: () => Promise<ServerResponse<LogOutResponse>>;
}>({
  accountState: { state: "notsignedin" },
  signUp: async () => {
    return { status: "fail" };
  },
  signIn: async () => {
    return { status: "fail" };
  },
  logOut: async () => {
    return { status: "fail" };
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

  const initialized = useRef(false);
  const [accountState, setAccountState] = useState<AccountState>({
    state: "notsignedin",
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
      }
      initialized.current = true;
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

  async function logOut() {
    if (accountState.state !== "signedin") {
      return { status: "fail" } as ServerResponse<LogOutResponse>;
    }

    const response = await get<LogOutResponse>("/logout", {
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

export type AccountState = NotSignedInState | SignedInState;

interface NotSignedInState {
  state: "notsignedin";
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

type LogOutResponse = null;

type UsernameOrEmail = { username: string } | { email: string };
