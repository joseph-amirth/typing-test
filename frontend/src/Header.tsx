import KeyboardIcon from "./static/icons/keyboard.svg?react";
import SportsScoreIcon from "./static/icons/sports_score.svg?react";
import LeaderboardIcon from "./static/icons/leaderboard.svg?react";
import SettingsIcon from "./static/icons/settings.svg?react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { Button } from "@mui/material";
import { Account, AccountService } from "./service/account";
import { useService } from "./service";

function Header() {
  const navigate = useNavigate();
  const { accountState } = useService(AccountService);

  return (
    <div className="Header">
      <NavBar />
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

function NavBar() {
  return (
    <div className="NavBar">
      <Link to="/" className="Title">
        <KeyboardIcon />
        <h1>typingtest</h1>
      </Link>
      <Link to="/race" className="Link">
        <SportsScoreIcon />
      </Link>
      <Link to="/leaderboard" className="Link">
        <LeaderboardIcon />
      </Link>
      <Link to="/settings" className="Link">
        <SettingsIcon />
      </Link>
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
