import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignInView.css";
import { useForm } from "react-hook-form";
import { RE_EMAIL, RE_USERNAME } from "../util/validation";
import { Button, TextField } from "@mui/material";
import { AccountService } from "../service/account";
import { useService } from "../service";

const SignInView = () => {
  const { signIn } = useService(AccountService);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  return (
    <form
      className="SignIn"
      onSubmit={handleSubmit(({ usernameOrEmail, password }) => {
        setLoading(true);
        (RE_USERNAME.test(usernameOrEmail)
          ? signIn({ usernameOrEmail: { username: usernameOrEmail }, password })
          : signIn({ usernameOrEmail: { email: usernameOrEmail }, password })
        ).then((response) => {
          if (response.status === "ok") {
            navigate("/");
          } else if (response.status === "err") {
            setServerError(response.reason);
          }
          setLoading(false);
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

      <Button type="submit" variant="text" disabled={loading}>
        Sign in
      </Button>

      {serverError !== "" && <p>{serverError}</p>}
    </form>
  );
};

export default SignInView;
