import App from "./app";

$("body").append(App());

$(window).on("load", () => {
  $(".App").trigger("focus");
});
