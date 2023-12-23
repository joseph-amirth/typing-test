import { createContext, useContext, useState } from "react";

export const UserContext = createContext();

export const useUserContext = (initialUser) => {
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
