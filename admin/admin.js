const API_BASE_URL = window.PACE_API_BASE_URL || "https://pace-academy-backend.onrender.com/api";
const TOKEN_KEY = "paceAcademyAdminToken";
const FLASH_MESSAGE_KEY = "paceAcademyAdminFlashMessage";

const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

const clearAdminSession = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const redirectToLogin = () => {
  window.location.replace("login.html");
};

const requireAdminAuth = () => {
  if (!getAdminToken()) {
    redirectToLogin();
    return false;
  }

  return true;
};

const apiRequest = async (path, options = {}, requiresAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (requiresAuth) {
    const token = getAdminToken();

    if (!token) {
      redirectToLogin();
      throw new Error("Your session has ended. Please log in again.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && requiresAuth) {
    clearAdminSession();
    redirectToLogin();
    throw new Error("Your session has ended. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
};

const showMessage = (element, message, type = "error") => {
  element.textContent = message;
  element.className = `message ${type} show`;
};

const clearMessage = (element) => {
  element.textContent = "";
  element.className = "message";
};

const setButtonLoading = (button, isLoading, loadingText) => {
  if (isLoading) {
    button.dataset.label = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    return;
  }

  button.textContent = button.dataset.label || button.textContent;
  button.disabled = false;
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const setFlashMessage = (message) => {
  sessionStorage.setItem(FLASH_MESSAGE_KEY, message);
};

const getFlashMessage = () => {
  const message = sessionStorage.getItem(FLASH_MESSAGE_KEY);
  sessionStorage.removeItem(FLASH_MESSAGE_KEY);
  return message;
};

const initializeAdminLayout = () => {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      clearAdminSession();
      redirectToLogin();
    });
  });

  const sidebar = document.querySelector(".sidebar");

  document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      sidebar?.classList.toggle("is-open");
    });
  });
};
