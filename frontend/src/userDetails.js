import { createContext, useContext, useState } from "react";

export const UserDetailsContext = createContext({
  userDetails: {},
  setUserDetails: () => {
    throw new Error("Not implemented");
  },
});

export const useUserDetailsContext = (initialUserDetails) => {
  const [userDetails, setUserDetails] = useState(initialUserDetails);
  return {
    userDetails,
    setUserDetails,
  };
};

export const useIsSignedIn = () => {
  const { userDetails } = useContext(UserDetailsContext);
  return userDetails.username !== undefined;
};
