import KeyboardIcon from "./static/icons/keyboard.svg?react";
import SportsScoreIcon from "./static/icons/sports_score.svg?react";
import LeaderboardIcon from "./static/icons/leaderboard.svg?react";
import SettingsIcon from "./static/icons/settings.svg?react";
import LoginIcon from "./static/icons/login.svg?react";
import LogoutIcon from "./static/icons/logout.svg?react";
import PersonAddIcon from "./static/icons/person_add.svg?react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { Account, AccountService } from "./service/account";
import { useService } from "./service";

function Header() {
  const { accountState } = useService(AccountService);

  return (
    <div className="Header">
      <NavBar />
      {accountState.state !== "signedin" && (
        <div className="Login">
          <Link to="/signin" className="Link">
            <LoginIcon />
          </Link>
          <Link to="/signup" className="Link">
            <PersonAddIcon />
          </Link>
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
  const accountService = useService(AccountService);

  const [loading, setLoading] = useState(false);

  const handleLogOutButtonClick = () => {
    setLoading(true);
    accountService.logOut().then(() => setLoading(false));
  };

  return (
    <div className="UserDetails">
      <Link to="/profile" className="Link">
        {account.username}
      </Link>
      <button onClick={handleLogOutButtonClick} disabled={loading}>
        <LogoutIcon />
      </button>
    </div>
  );
}

export default Header;
