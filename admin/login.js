document.addEventListener("DOMContentLoaded", () => {
  if (getAdminToken()) {
    window.location.replace("dashboard.html");
    return;
  }

  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage(message, "Email and password are required.");
      return;
    }

    setButtonLoading(submitButton, true, "Logging in...");

    try {
      const data = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        false
      );

      localStorage.setItem(TOKEN_KEY, data.token);
      window.location.replace("dashboard.html");
    } catch (error) {
      showMessage(message, error.message);
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
});
