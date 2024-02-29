import React, { useEffect, useRef, useState } from "react";
import { PreferencesService } from "../../service/preferences";
import { ServerResponse, ServerService } from "../server";
import { NotificationsService } from "../notifications";
import { useService } from "..";
import {
  AccountService,
  AccountState,
  CurrentUserResponse,
  LogOutResponse,
  SignInParams,
  SignInResponse,
  SignUpParams,
  SignUpResponse,
} from ".";

export function AccountServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { addNotification } = useService(NotificationsService);
  const { receivePreferences } = useService(PreferencesService);
  const { get, post } = useService(ServerService);

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

  function canSignUpOrSignIn() {
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
