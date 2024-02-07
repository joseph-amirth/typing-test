import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { Button } from "@mui/material";
import { AccountService } from "./service/account";

const Header = () => {
  const navigate = useNavigate();
  const { accountState, logOut } = useContext(AccountService);

  return (
    <div className="Header">
      <Button onClick={() => navigate("/")}>
        <KeyboardIcon />
        <h2 className="Title">Typing Test</h2>
      </Button>
      {accountState.state !== "signedin" && (
        <div className="Login">
          <Button onClick={() => navigate("/signin")} variant="contained">
            Sign in
          </Button>{" "}
          <Button onClick={() => navigate("/signup")} variant="contained">
            Sign up
          </Button>{" "}
        </div>
      )}
      {accountState.state === "signedin" && (
        <div className="UserDetails">
          <Button onClick={() => navigate("/results")}>
            {accountState.account.username}
          </Button>{" "}
          <Button variant="contained" onClick={logOut}>
            Log out
          </Button>
        </div>
      )}
    </div>
  );
};

export default Header;
