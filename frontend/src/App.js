import { Outlet, useLoaderData } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { UserDetailsContext, useUserDetailsContext } from "./userDetails";
import Notifications from "./components/Notifications";
import { PreferencesContext, usePreferencesContext } from "./preferences";
import { NotificationsContext, useNotificationsContext } from "./notifications";

import "./App.css";

const App = () => {
  const { username, email, preferences } = useLoaderData();

  const userDetailsContext = useUserDetailsContext({ username, email });

  const preferencesContext = usePreferencesContext(preferences);

  const notificationsContext = useNotificationsContext();
  const { notifications } = notificationsContext;

  return (
    <div className="App">
      <Notifications notifications={notifications} />
      <NotificationsContext.Provider value={notificationsContext}>
        <UserDetailsContext.Provider value={userDetailsContext}>
          <PreferencesContext.Provider value={preferencesContext}>
            <Header />
            <div className="Body">
              <Outlet />
            </div>
            <Footer />
          </PreferencesContext.Provider>
        </UserDetailsContext.Provider>
      </NotificationsContext.Provider>
    </div>
  );
};

export default App;
