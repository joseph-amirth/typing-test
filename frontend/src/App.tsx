import { Outlet, useLoaderData } from "react-router-dom";
import Header from "./Header";
import { UserContext, useUserContext } from "./context/user";
import {
  Preferences,
  PreferencesContext,
  usePreferencesContext,
} from "./context/preference";
import { NotificationsContextProvider } from "./context/notifications";
import "./App.css";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { StaticContentServiceProvider } from "./service/static-content";

const App = () => {
  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#00e980",
      },
      background: {
        default: "#011926",
      },
    },
    typography: {
      fontFamily: "JetBrains Mono",
      button: {
        textTransform: "none",
      },
    },
  });

  const { username, email, preferences } = useLoaderData() as {
    username?: string;
    email?: string;
    preferences: Preferences;
  };

  const userContext = useUserContext(
    username === undefined || email === undefined
      ? undefined
      : { username, email },
  );
  const preferencesContext = usePreferencesContext(preferences);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <NotificationsContextProvider>
          <UserContext.Provider value={userContext}>
            <PreferencesContext.Provider value={preferencesContext}>
              <StaticContentServiceProvider>
                <Header />
                <div className="Body">
                  <Outlet />
                </div>
              </StaticContentServiceProvider>
            </PreferencesContext.Provider>
          </UserContext.Provider>
        </NotificationsContextProvider>
      </div>
    </ThemeProvider>
  );
};

export default App;
