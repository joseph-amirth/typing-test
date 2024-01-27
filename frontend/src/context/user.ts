import { createContext, useContext, useState } from "react";

export const UserContext = createContext<{
  user?: User;
  setUser: (user?: User) => void;
}>({
  user: undefined,
  setUser: () => {},
});

export const useUserContext = (initialUser?: User) => {
  const [user, setUser] = useState(initialUser);
  return {
    user,
    setUser,
  };
};

export const useIsSignedIn = () => {
  const { user } = useContext(UserContext);
  return user !== undefined;
};

export interface User {
  username: string;
  email: string;
}
