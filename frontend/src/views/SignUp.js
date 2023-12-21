import "./SignUp.css";
import { useForm } from "react-hook-form";
import { signUp } from "../utils/backend";
import { useContext, useState } from "react";
import { PreferencesContext } from "../preferences";
import { UserDetailsContext } from "../userDetails";
import { useNavigate } from "react-router-dom";
import { RE_EMAIL, RE_PASSWORD, RE_USERNAME } from "../utils/validation";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { setUserDetails } = useContext(UserDetailsContext);
  const { preferences } = useContext(PreferencesContext);

  const [serverError, setServerError] = useState("");

  return (
    <form
      className="SignUp"
      onSubmit={handleSubmit(({ username, email, password }) => {
        signUp(username, email, password, preferences).then((json) => {
          if ("error" in json) {
            setServerError(json.error);
          } else {
            setUserDetails(json);
            navigate("/");
          }
        });
      })}
    >
      <label>
        Username
        <input
          type="text"
          {...register("username", {
            required: {
              value: true,
              message: "Username is required",
            },
            minLength: {
              value: 6,
              message: "Username must be at least 6 characters long",
            },
            maxLength: {
              value: 30,
              message: "Username must be at most 30 characters long",
            },
            pattern: {
              value: RE_USERNAME,
              message:
                "Username must consist of only letters, digits, underscores and periods",
            },
          })}
        />
      </label>
      {errors.username && <p>{errors.username.message}</p>}
      <br />
      <label>
        Email
        <input
          type="text"
          {...register("email", {
            required: {
              value: true,
              message: "Email is required",
            },
            pattern: {
              value: RE_EMAIL,
              message: "Invalid email",
            },
          })}
        />
      </label>
      {errors.email && <p>{errors.email.message}</p>}
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
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
            pattern: {
              value: RE_PASSWORD,
              message:
                "Password must have at least one uppercase letter, one lowercase letter, one digit and one special character",
            },
          })}
        />
      </label>
      {errors.password && <p>{errors.password.message}</p>}
      <br />
      <label>
        Repeated password
        <input
          type="password"
          {...register("repeatedPassword", {
            validate: (value, { password }) => {
              return (
                value === password ||
                "Repeated password must be same as password"
              );
            },
          })}
        />
      </label>
      {errors.repeatedPassword && <p>{errors.repeatedPassword.message}</p>}
      <br />
      {serverError !== "" && <p>Server error: {serverError}</p>}
      <input type="submit" value="Sign up" />
    </form>
  );
};

export default SignUp;
