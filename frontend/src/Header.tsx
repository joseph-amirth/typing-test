import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { Button, IconButton } from "@mui/material";
import { Account, AccountService } from "./service/account";
import { useService } from "./service";
import { Leaderboard, Settings } from "@mui/icons-material";

function Header() {
  const navigate = useNavigate();
  const { accountState } = useService(AccountService);

  return (
    <div className="Header">
      <NavigationBar />
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
        <UserDetails account={accountState.account} />
      )}
    </div>
  );
}

function NavigationBar() {
  const navigate = useNavigate();
  return (
    <div className="NavigationBar">
      <Button onClick={() => navigate("/")}>
        <KeyboardIcon />
        <h2 className="Title">Typing Test</h2>
      </Button>
      <IconButton onClick={() => navigate("/leaderboard")}>
        <Leaderboard />
      </IconButton>
      <IconButton onClick={() => navigate("/settings")}>
        <Settings />
      </IconButton>
    </div>
  );
}

function UserDetails({ account }: { account: Account }) {
  const navigate = useNavigate();
  const accountService = useService(AccountService);

  const [loading, setLoading] = useState(false);

  const handleLogOutButtonClick = () => {
    setLoading(true);
    accountService.logOut().then(() => setLoading(false));
  };

  return (
    <div className="UserDetails">
      <Button onClick={() => navigate("/profile")}>{account.username}</Button>{" "}
      <Button
        variant="contained"
        onClick={handleLogOutButtonClick}
        disabled={loading}
      >
        Log out
      </Button>
    </div>
  );
}

export default Header;
