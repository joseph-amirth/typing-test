// Validation functions that check if a value if valid.
// If valid, returns an empty string.
// If not valid, returns error message.

export const isValidUsername = (username) => {
  if (username === "") {
    return "Username is required";
  }

  if (username.length < 6) {
    return "Username must be at least 6 characters long";
  } else if (username.length > 30) {
    return "Username must be at most 30 characters long";
  }

  if (username.match(/^[A-Za-z0-9._]*$/) === null) {
    return "Username should only contain letters, numbers, periods and underscores";
  }

  return "";
};

export const isValidEmail = (email) => {
  if (email === "") {
    return "";
  }

  if (email.match(/^.+@.+$/) === null) {
    return "Invalid email";
  }
  if (email.length > 256) {
    return "Email is too long";
  }
  return "";
};

export const isValidPassword = (password) => {
  if (password === "") {
    return "Password is required";
  }

  if (password.match(/[A-Z]/) === null) {
    return "Password must contain at least one uppercase letter";
  } else if (password.match(/[a-z]/) === null) {
    return "Password must contain at least one lowercase letter";
  } else if (password.match(/[0-9]/) === null) {
    return "Password must contain at least one number";
  } else if (password.match(/[ !"#$%&'()*+,-./:;<=>?@[\]\\^_`{|}~]/) === null) {
    return "Passowrd must contain at least one special character";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  return "";
};
