import "./SignUpView.css";
import { useForm } from "react-hook-form";
import { signUp } from "../util/backend";
import { useContext, useState } from "react";
import { PreferencesContext } from "../context/preference";
import { UserContext } from "../context/user";
import { useNavigate } from "react-router-dom";
import { RE_EMAIL, RE_PASSWORD, RE_USERNAME } from "../util/validation";
import { Button, TextField } from "@mui/material";
import { NotificationsContext } from "../context/notification";

const SignUpView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { setUser } = useContext(UserContext);
  const { preferences } = useContext(PreferencesContext);
  const { addNotification } = useContext(NotificationsContext);

  const [serverError, setServerError] = useState("");

  return (
    <form
      className="SignUp"
      onSubmit={handleSubmit(({ username, email, password }) => {
        signUp({ username, email, password, preferences }).then((json) => {
          if ("error" in json) {
            addNotification({
              type: "Error",
              title: "Server not reachable",
              body: "Backend isn't deployed yet",
            });
            setServerError(json.error);
          } else {
            setUser(json);
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
        label="Username"
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
        error={errors.username !== undefined}
        helperText={errors.username?.message?.toString()}
      />

      <TextField
        variant="filled"
        margin="normal"
        fullWidth
        type="text"
        label="Email"
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
        error={errors.email !== undefined}
        helperText={errors.email?.message?.toString()}
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
        error={errors.password !== undefined}
        helperText={errors.password?.message?.toString()}
      />

      <TextField
        variant="filled"
        margin="normal"
        fullWidth
        type="password"
        label="Repeated password"
        {...register("repeatedPassword", {
          validate: (value, { password }) => {
            return (
              value === password || "Repeated password must be same as password"
            );
          },
        })}
        error={errors.repeatedPassword !== undefined}
        helperText={errors.repeatedPassword?.message?.toString()}
      />

      <Button type="submit" variant="text">
        Sign up
      </Button>

      {serverError !== "" && <p>Server error: {serverError}</p>}
    </form>
  );
};

export default SignUpView;
