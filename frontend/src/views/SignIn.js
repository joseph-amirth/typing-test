import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDetailsContext } from "../userDetails";
import "./SignIn.css";
import { PreferencesContext } from "../preferences";
import { useForm } from "react-hook-form";
import { RE_EMAIL, RE_USERNAME } from "../utils/validation";
import { signInWithEmail, signInWithUsername } from "../utils/backend";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { setUserDetails } = useContext(UserDetailsContext);
  const { receivePreferences } = useContext(PreferencesContext);

  const [serverError, setServerError] = useState("");

  return (
    <form
      className="SignIn"
      onSubmit={handleSubmit(({ usernameOrEmail, password }) => {
        (RE_USERNAME.test(usernameOrEmail)
          ? signInWithUsername(usernameOrEmail, password)
          : signInWithEmail(usernameOrEmail, password)
        ).then((json) => {
          if ("error" in json) {
            setServerError(json.error);
          } else {
            let { username, email } = json;
            setUserDetails({ username, email });
            receivePreferences(json.preferences);
            navigate("/");
          }
        });
      })}
    >
      <label>
        Username/Email
        <input
          type="text"
          {...register("usernameOrEmail", {
            required: {
              value: true,
              message: "Username/email is required",
            },
            pattern: {
              value: new RegExp(`(${RE_USERNAME.source})|(${RE_EMAIL.source})`),
              message: "Invalid username/email",
            },
          })}
        />
      </label>
      {errors.usernameOrEmail && <p>{errors.usernameOrEmail.message}</p>}
      <br />
      <label>
        Password
        <input
          type="password"
          {...register("password", {
            required: {
              value: true,
              message: "Password is required",
            },
          })}
        />
      </label>
      {errors.password && <p>{errors.password.message}</p>}
      <br />
      {serverError !== "" && <p>{serverError}</p>}
      <input type="submit" value="Sign up" />
    </form>
  );
};

export default SignIn;
