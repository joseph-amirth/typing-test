import { Outlet } from "react-router-dom";
import Header from "./Header";
import {
  PreferencesContext,
  usePreferencesContext,
} from "./context/preference";
import { NotificationsContextProvider } from "./context/notifications";
import "./App.css";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { StaticContentServiceProvider } from "./service/static-content";
import { ServerServiceProvider } from "./service/server";

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

  const preferencesContext = usePreferencesContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <NotificationsContextProvider>
          <PreferencesContext.Provider value={preferencesContext}>
            <ServerServiceProvider>
              <StaticContentServiceProvider>
                <Header />
                <div className="Body">
                  <Outlet />
                </div>
              </StaticContentServiceProvider>
            </ServerServiceProvider>
          </PreferencesContext.Provider>
        </NotificationsContextProvider>
      </div>
    </ThemeProvider>
  );
};

export default App;
