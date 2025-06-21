import { Link } from "react-router-dom";
import "./Footer.css";
import GithubIcon from "./static/icons/github.svg?react";

function Footer() {
  return (
    <div className="Footer">
      <Social
        icon={<GithubIcon />}
        desc="GitHub"
        url="https://github.com/joseph-amirth/typing-test"
      />
    </div>
  );
}

function Social({
  icon,
  desc,
  url,
}: {
  icon: React.ReactNode;
  desc: string;
  url: string;
}) {
  return (
    <Link className="Social" to={url} target="_blank">
      {icon}
      <span>&nbsp;{desc}</span>
    </Link>
  );
}

export default Footer;
