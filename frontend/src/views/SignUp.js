import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, signUpWithoutEmail } from "../utils/backend";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../utils/signup";
import "./SignUp.css";
import Input from "../components/Input";
import { UserDetailsContext } from "../userDetails";
import { PreferencesContext } from "../preferences";

const SignUp = () => {
  const navigate = useNavigate();
  const { setUserDetails } = useContext(UserDetailsContext);
  const { preferences } = useContext(PreferencesContext);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [repeatedPasswordError, setRepeatedPasswordError] = useState("");

  const [error, setError] = useState("");

  const isValidRepeatedPassword = (repeatedPassword) => {
    return password !== repeatedPassword ? "Passwords do not match" : "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      isValidUsername(username) !== "" ||
      isValidEmail(email) !== "" ||
      isValidPassword(password) !== "" ||
      isValidRepeatedPassword(repeatedPassword) !== ""
    ) {
      setUsernameError(isValidUsername(username));
      setEmailError(isValidEmail(email));
      setPasswordError(isValidPassword(password));
      setRepeatedPasswordError(isValidRepeatedPassword(repeatedPassword));
      return;
    }

    (email !== ""
      ? signUp(username, email, password, preferences)
      : signUpWithoutEmail(username, password, preferences)
    ).then((json) => {
      if (json.hasOwnProperty("error")) {
        setError(json.error);
      } else {
        setUserDetails(json.userDetails);
        navigate("/");
      }
    });
  };

  return (
    <form className="SignUp" onSubmit={handleSubmit}>
      <Input
        label="Username"
        type="text"
        value={username}
        setValue={setUsername}
        error={usernameError}
        setError={setUsernameError}
        isValid={isValidUsername}
      />
      <Input
        label="Email"
        type="text"
        value={email}
        setValue={setEmail}
        error={emailError}
        setError={setEmailError}
        isValid={isValidEmail}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        setValue={setPassword}
        error={passwordError}
        setError={setPasswordError}
        isValid={isValidPassword}
      />
      <Input
        label="Repeated password"
        type="password"
        value={repeatedPassword}
        setValue={setRepeatedPassword}
        error={repeatedPasswordError}
        setError={setRepeatedPasswordError}
        isValid={isValidRepeatedPassword}
      />
      <input type="submit" value="Submit" />
      {error !== "" && <span className="Error">{error}</span>}
    </form>
  );
};

export default SignUp;
