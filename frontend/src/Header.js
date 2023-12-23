import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./context/user";
import { logout } from "./util/backend";
import "./Header.css";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { Button } from "@mui/material";

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    logout().then((response) => {
      if (response.status === 200) {
        setUser();
      } else {
        // TODO: Render a proper error to the user.
        console.error("Unable to logout");
      }
    });
  };

  return (
    <div className="Header">
      <Button>
        <h1 onClick={() => navigate("/")}>
          <KeyboardIcon /> Typing Test
        </h1>
      </Button>
      {user === undefined && (
        <div className="Login">
          <Link to="/signin">Sign in</Link> <Link to="/signup">Sign up</Link>
        </div>
      )}
      {user !== undefined && (
        <div className="UserDetails">
          {user.username} <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  );
};

export default Header;
