import { Outlet } from "react-router-dom";
import Header from "./Header";
import PreferencesServiceProvider from "./service/preferences/Provider";
import { NotificationsServiceProvider } from "./service/notifications/Provider";
import "./App.css";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { StaticContentServiceProvider } from "./service/staticcontent/Provider";
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <NotificationsServiceProvider>
          <PreferencesServiceProvider>
            <ServerServiceProvider>
              <StaticContentServiceProvider>
                <Header />
                <div className="Body">
                  <Outlet />
                </div>
              </StaticContentServiceProvider>
            </ServerServiceProvider>
          </PreferencesServiceProvider>
        </NotificationsServiceProvider>
      </div>
    </ThemeProvider>
  );
};

export default App;
