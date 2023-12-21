import { useContext } from "react";
import { Link } from "react-router-dom";
import { useIsSignedIn, UserDetailsContext } from "../userDetails";
import { logout } from "../utils/backend";
import "./Header.css";

const Header = () => {
  const { userDetails, setUserDetails } = useContext(UserDetailsContext);
  const isSignedIn = useIsSignedIn();

  const handleLogout = () => {
    logout().then((response) => {
      if (response.status === 200) {
        setUserDetails({});
      } else {
        // TODO: Render a proper error to the user.
        console.error("Unable to logout");
      }
    });
  };

  return (
    <div className="Header">
      <h1>
        <Link to="/">Typing Test</Link>
      </h1>
      {!isSignedIn && (
        <div className="Login">
          <Link to="/signin">Sign in</Link> <Link to="/signup">Sign up</Link>
        </div>
      )}
      {isSignedIn && (
        <div className="UserDetails">
          {userDetails.username} <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  );
};

export default Header;
