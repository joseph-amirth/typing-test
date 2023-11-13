import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { UserDetailsContext } from "../userDetails";
import { signInWithEmail, signInWithUsername } from "../utils/backend";
import { isValidEmail, isValidUsername } from "../utils/signup";
import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const { setUserDetails } = useContext(UserDetailsContext);

  const [id, setId] = useState("");
  const [idError, setIdError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    (isValidUsername(id) === ""
      ? signInWithUsername(id, password)
      : signInWithEmail(id, password)
    ).then((json) => {
      if ("error" in json) {
        setError(json.error);
      } else {
        setUserDetails(json.userDetails);
        navigate("/");
      }
    });
  };

  return (
    <form className="SignIn" onSubmit={handleSubmit}>
      <Input
        label="Username/email"
        type="text"
        value={id}
        setValue={setId}
        error={idError}
        setError={setIdError}
        isValid={(id) => {
          if (isValidUsername(id) !== "" && isValidEmail(id) !== "") {
            return "Enter a valid username/email";
          }
          return "";
        }}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        setValue={setPassword}
        error={passwordError}
        setError={setPasswordError}
        isValid={(password) => {
          if (password === "") {
            return "Enter the password";
          }
          return "";
        }}
      />
      <input type="submit" value="Submit" />
      {error !== "" && <span className="Error">{error}</span>}
    </form>
  );
};

export default SignIn;
