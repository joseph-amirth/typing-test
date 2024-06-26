import "./SignUpView.css";
import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import { PreferencesService } from "../service/preferences";
import { useNavigate } from "react-router-dom";
import { RE_EMAIL, RE_PASSWORD, RE_USERNAME } from "../util/validation";
import { Button, TextField } from "@mui/material";
import { AccountService } from "../service/account";
import { useService } from "../service";

const SignUpView = () => {
  const accountService = useService(AccountService);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { preferences } = useContext(PreferencesService);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  return (
    <form
      className="SignUp"
      onSubmit={handleSubmit(
        ({ username, email, verificationCode, password }) => {
          setLoading(true);
          accountService
            .signUp({
              username,
              email,
              verificationCode,
              password,
              preferences,
            })
            .then((response) => {
              if (response.status === "ok") {
                navigate("/");
              } else if (response.status === "err") {
                setServerError(response.reason);
              }
              setLoading(false);
            });
        },
      )}
    >
      <TextField
        className="SignUpInput"
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
        className="SignUpInput"
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
        className="SignUpInput"
        variant="filled"
        margin="normal"
        fullWidth
        type="password"
        label="Verification code"
        {...register("verificationCode", {
          required: {
            value: true,
            message: "Verification code is required",
          },
        })}
        error={errors.verificationCode !== undefined}
        helperText={errors.verificationCode?.message?.toString()}
      />

      <TextField
        className="SignUpInput"
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
        className="SignUpInput"
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

      <Button
        sx={{ marginTop: "10px" }}
        type="submit"
        variant="text"
        disabled={loading}
      >
        Sign up
      </Button>

      {serverError !== "" && <p>Server error: {serverError}</p>}
    </form>
  );
};

export default SignUpView;
