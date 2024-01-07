import "./style/Footer.scss";

const Footer = () => {
  return (
    <div className="Footer">
      <Help hotkey="r" action="restart" />
      <Separator />
      <Help hotkey="n" action="next" />
      <Separator />
      <Help hotkey=":" action="cmd" />
      <Separator />
      <Help hotkey="/" action="search" />
      <Separator />
      <Help hotkey="?" action="help" />
    </div>
  );
};

const Help = ({ hotkey, action }: { hotkey: string; action: string }) => {
  return (
    <div className="Help">
      {hotkey}
      <div className="Desc">{action}</div>
    </div>
  );
};

const Separator = () => {
  return <div className="Separator">·</div>;
};

export default Footer;
