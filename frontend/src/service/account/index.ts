import { Preferences } from "../preferences";
import { ServerResponse } from "../server";
import { createService } from "..";

export const AccountService = createService<{
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

export type AccountState = NotSignedInState | SignedInState;

export interface NotSignedInState {
  state: "notsignedin";
}

export interface SignedInState {
  state: "signedin";
  account: Account;
}

export interface Account {
  username: string;
  email: string;
}

export interface SignUpParams {
  username: string;
  email: string;
  verificationCode: string;
  password: string;
  preferences: Preferences;
}

export interface SignUpResponse extends Account {
  username: string;
  email: string;
}

export interface SignInParams {
  usernameOrEmail: UsernameOrEmail;
  password: string;
}

export interface SignInResponse {
  username: string;
  email: string;
  preferences: Preferences;
}

export interface CurrentUserResponse {
  username: string;
  email: string;
  preferences: Preferences;
}

export type LogOutResponse = null;

export type UsernameOrEmail = { username: string } | { email: string };
