import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserDetailsContext } from "../userDetails";
import { logout } from "../utils/backend";
import "./Header.css";

const Header = () => {
  const { userDetails, setUserDetails } = useContext(UserDetailsContext);
  const isSignedIn = "username" in userDetails;

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
          {userDetails.username} <Link onClick={handleLogout}>Log out</Link>
        </div>
      )}
    </div>
  );
};

export default Header;
