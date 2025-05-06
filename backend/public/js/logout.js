// logout.js
import { getLoginState, setLoginState } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  if (loginLink) loginLink.style.display = "inline-block";
  if (logoutLink) logoutLink.style.display = "none";
});
