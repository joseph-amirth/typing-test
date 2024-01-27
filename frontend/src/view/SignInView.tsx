import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";
import "./SignInView.css";
import { PreferencesContext } from "../context/preference";
import { useForm } from "react-hook-form";
import { RE_EMAIL, RE_USERNAME } from "../util/validation";
import { signInWithEmail, signInWithUsername } from "../util/backend";
import { Button, TextField } from "@mui/material";
import View from "./View";

const SignInView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { setUser } = useContext(UserContext);
  const { receivePreferences } = useContext(PreferencesContext);

  const [serverError, setServerError] = useState("");

  return (
    <View>
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
              setUser({ username, email });
              receivePreferences(json.preferences);
              navigate("/");
            }
          });
        })}
      >
        <TextField
          variant="filled"
          margin="normal"
          fullWidth
          type="text"
          label="Username/email"
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
          error={errors.usernameOrEmail !== undefined}
          helperText={errors.usernameOrEmail?.message?.toString()}
        />

        <TextField
          variant="filled"
          margin="normal"
          fullWidth
          type="password"
          label="Password"
          {...register("password", {
            required: {
              value: true,
              message: "Password is required",
            },
          })}
          error={errors.password !== undefined}
          helperText={errors.password?.message?.toString()}
        />

        <Button type="submit" variant="text">
          Sign in
        </Button>

        {serverError !== "" && <p>{serverError}</p>}
      </form>
    </View>
  );
};

export default SignInView;
