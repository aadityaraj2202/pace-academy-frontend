document.addEventListener("DOMContentLoaded", () => {
  if (!requireAdminAuth()) {
    return;
  }

  initializeAdminLayout();
  bindChangePasswordForm();
  loadDashboard();
});

const bindChangePasswordForm = () => {
  const form = document.getElementById("changePasswordForm");
  const message = document.getElementById("passwordChangeMessage");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !message || !submitButton) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage(message, "All password fields are required.");
      return;
    }

    setButtonLoading(submitButton, true, "Updating...");

    try {
      const data = await apiRequest("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      showMessage(message, data.message, "success");
      form.reset();
    } catch (error) {
      showMessage(message, error.message);
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
};

const loadDashboard = async () => {
  const message = document.getElementById("dashboardMessage");
  const recentContent = document.getElementById("recentContent");

  clearMessage(message);
  recentContent.innerHTML = '<tr><td colspan="4" class="loading-state">Loading content...</td></tr>';

  try {
    const contentItems = await getAllAdminContent();
    const publishedCount = contentItems.filter(
      (item) => item.status === "published"
    ).length;

    document.getElementById("totalCount").textContent = contentItems.length;
    document.getElementById("publishedCount").textContent = publishedCount;
    document.getElementById("draftCount").textContent =
      contentItems.length - publishedCount;

    renderRecentContent(contentItems.slice(0, 5));
  } catch (error) {
    showMessage(message, error.message);
    recentContent.innerHTML = '<tr><td colspan="4" class="empty-state">Unable to load recent content.</td></tr>';
  }
};

const getAllAdminContent = async () => {
  const firstPage = await apiRequest("/admin/content?page=1&limit=100");
  const contentItems = firstPage.content || [];
  const totalPages = firstPage.pagination?.totalPages || 1;

  if (totalPages === 1) {
    return contentItems;
  }

  const remainingPages = [];

  for (let page = 2; page <= totalPages; page += 1) {
    remainingPages.push(apiRequest(`/admin/content?page=${page}&limit=100`));
  }

  const responses = await Promise.all(remainingPages);

  responses.forEach((response) => {
    contentItems.push(...response.content);
  });

  return contentItems;
};

const renderRecentContent = (contentItems) => {
  const tableBody = document.getElementById("recentContent");
  tableBody.innerHTML = "";

  if (!contentItems.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty-state";
    cell.innerHTML = '<strong>No content yet</strong>Create your first article to see it here.';
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  contentItems.forEach((item) => {
    const row = document.createElement("tr");
    row.append(
      createTableCell(item.title),
      createTableCell(item.category),
      createStatusCell(item.status),
      createTableCell(formatDate(item.createdAt))
    );
    tableBody.appendChild(row);
  });
};

const createTableCell = (value) => {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  return cell;
};

const createStatusCell = (status) => {
  const cell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `status status-${status}`;
  badge.textContent = status;
  cell.appendChild(badge);
  return cell;
};
