import { useContext } from "react";
import { useNavigate } from "react-router-dom";
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
          <Button onClick={() => navigate("/signin")} variant="contained">
            Sign in
          </Button>{" "}
          <Button onClick={() => navigate("/signup")} variant="contained">
            Sign up
          </Button>{" "}
        </div>
      )}
      {user !== undefined && (
        <div className="UserDetails">
          <Button onClick={() => navigate("/results")}>{user.username}</Button>{" "}
          <Button variant="contained" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      )}
    </div>
  );
};

export default Header;
