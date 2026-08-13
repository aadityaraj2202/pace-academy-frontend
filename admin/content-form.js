const CONTENT_CATEGORIES = [
  "Law & Judiciary",
  "UPSC",
  "HPSC",
  "Bare Acts",
  "Current Affairs",
  "Judgements",
  "Editorials",
  "Notes",
];

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAdminAuth()) {
    return;
  }

  initializeAdminLayout();
  populateCategories();

  const form = document.getElementById("contentForm");
  form.addEventListener("submit", saveContent);

  if (document.body.dataset.mode === "edit") {
    await loadContentForEdit();
  }
});

const populateCategories = () => {
  const categorySelect = document.getElementById("category");

  CONTENT_CATEGORIES.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
};

const loadContentForEdit = async () => {
  const message = document.getElementById("formMessage");
  const contentId = new URLSearchParams(window.location.search).get("id");

  if (!contentId) {
    showMessage(message, "Content ID is required to edit an article.");
    return;
  }

  document.getElementById("formTitle").textContent = "Edit Content";
  document.getElementById("formSubtitle").textContent =
    "Update the article details and save your changes.";

  try {
    const data = await apiRequest(`/admin/content/${contentId}`);
    const item = data.content;

    document.getElementById("title").value = item.title || "";
    document.getElementById("shortDescription").value =
      item.shortDescription || "";
    document.getElementById("content").value = item.content || "";
    document.getElementById("featuredImage").value = item.featuredImage || "";
    document.getElementById("category").value = item.category || "";
    document.getElementById("tags").value = (item.tags || []).join(", ");
    document.getElementById("status").value = item.status || "draft";
  } catch (error) {
    showMessage(message, error.message);
  }
};

const saveContent = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const message = document.getElementById("formMessage");
  const submitButton = form.querySelector('button[type="submit"]');
  const mode = document.body.dataset.mode;
  const contentId = new URLSearchParams(window.location.search).get("id");
  const title = document.getElementById("title").value.trim();
  const shortDescription = document.getElementById("shortDescription").value.trim();
  const content = document.getElementById("content").value;
  const featuredImage = document.getElementById("featuredImage").value.trim();
  const category = document.getElementById("category").value;
  const tags = document
    .getElementById("tags")
    .value.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const status = document.getElementById("status").value;

  clearMessage(message);

  if (!title || !content.trim() || !category) {
    showMessage(message, "Title, content and category are required.");
    return;
  }

  if (mode === "edit" && !contentId) {
    showMessage(message, "Content ID is required to save changes.");
    return;
  }

  const payload = {
    title,
    shortDescription,
    content,
    featuredImage,
    category,
    tags,
    status,
  };

  setButtonLoading(submitButton, true, mode === "edit" ? "Saving..." : "Creating...");

  try {
    const data = await apiRequest(
      mode === "edit" ? `/admin/content/${contentId}` : "/admin/content",
      {
        method: mode === "edit" ? "PUT" : "POST",
        body: JSON.stringify(payload),
      }
    );

    if (mode === "edit") {
      showMessage(message, data.message, "success");
      return;
    }

    setFlashMessage(data.message);
    window.location.replace("content.html");
  } catch (error) {
    showMessage(message, error.message);
  } finally {
    setButtonLoading(submitButton, false);
  }
};
