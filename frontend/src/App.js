import { Outlet, useLoaderData } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import { UserContext, useUserContext } from "./context/user";
import Notifications from "./Notifications";
import {
  PreferencesContext,
  usePreferencesContext,
} from "./context/preferences";
import {
  NotificationsContext,
  useNotificationsContext,
} from "./context/notifications";

import "./App.css";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";

const App = () => {
  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#00e980",
      },
    },
    typography: {
      fontFamily: "JetBrains Mono",
      button: {
        textTransform: "none",
      },
    },
  });

  const { username, email, preferences } = useLoaderData();
  const userContext = useUserContext(
    username === undefined ? undefined : { username, email },
  );
  const preferencesContext = usePreferencesContext(preferences);
  const notificationsContext = useNotificationsContext();
  const { notifications } = notificationsContext;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Notifications notifications={notifications} />
        <NotificationsContext.Provider value={notificationsContext}>
          <UserContext.Provider value={userContext}>
            <PreferencesContext.Provider value={preferencesContext}>
              <Header />
              <div className="Body">
                <Outlet />
              </div>
              <Footer />
            </PreferencesContext.Provider>
          </UserContext.Provider>
        </NotificationsContext.Provider>
      </div>
    </ThemeProvider>
  );
};

export default App;
