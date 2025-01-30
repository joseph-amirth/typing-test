import "./Footer.css";
import { GitHub } from "@mui/icons-material";
import { Button } from "@mui/material";

function Footer() {
  return (
    <div className="Footer">
      <Button
        onClick={() => {
          window.open("https://github.com/joseph-amirth/typing-test");
        }}
        variant="text"
      >
        <GitHub /> <span>&nbsp;GitHub</span>
      </Button>
    </div>
  );
}

export default Footer;
