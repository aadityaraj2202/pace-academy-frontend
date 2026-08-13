let currentPage = 1;
const CONTENT_LIMIT = 10;

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAdminAuth()) {
    return;
  }

  initializeAdminLayout();

  const message = document.getElementById("contentMessage");
  const flashMessage = getFlashMessage();

  if (flashMessage) {
    showMessage(message, flashMessage, "success");
  }

  loadContent(currentPage);
});

const loadContent = async (page) => {
  const message = document.getElementById("contentMessage");
  const tableBody = document.getElementById("contentTableBody");

  tableBody.innerHTML = '<tr><td colspan="5" class="loading-state">Loading content...</td></tr>';

  try {
    const data = await apiRequest(
      `/admin/content?page=${page}&limit=${CONTENT_LIMIT}`
    );

    if (!data.content.length && page > 1 && data.pagination.total > 0) {
      loadContent(page - 1);
      return;
    }

    currentPage = data.pagination.page;
    clearMessage(message);
    renderContentTable(data.content);
    renderPagination(data.pagination);
  } catch (error) {
    showMessage(message, error.message);
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load content.</td></tr>';
  }
};

const renderContentTable = (contentItems) => {
  const tableBody = document.getElementById("contentTableBody");
  tableBody.innerHTML = "";

  if (!contentItems.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "empty-state";
    cell.innerHTML = '<strong>No content found</strong>Create your first article to begin managing content.';

    const addLink = document.createElement("a");
    addLink.className = "button button-primary";
    addLink.href = "add-content.html";
    addLink.textContent = "Add Content";
    cell.appendChild(addLink);
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  contentItems.forEach((item) => {
    const row = document.createElement("tr");
    row.append(
      createContentCell(item.title),
      createContentCell(item.category),
      createContentStatusCell(item.status),
      createContentCell(formatDate(item.createdAt)),
      createActionCell(item)
    );
    tableBody.appendChild(row);
  });
};

const createContentCell = (value) => {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  return cell;
};

const createContentStatusCell = (status) => {
  const cell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `status status-${status}`;
  badge.textContent = status;
  cell.appendChild(badge);
  return cell;
};

const createActionCell = (item) => {
  const cell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "actions";

  const editLink = document.createElement("a");
  editLink.className = "button button-secondary button-small";
  editLink.href = `edit-content.html?id=${encodeURIComponent(item._id)}`;
  editLink.textContent = "Edit";
  actions.appendChild(editLink);

  const statusButton = document.createElement("button");
  statusButton.className = `button button-small ${
    item.status === "draft" ? "button-success" : "button-warning"
  }`;
  statusButton.textContent = item.status === "draft" ? "Publish" : "Unpublish";
  statusButton.addEventListener("click", () => updateStatus(item, statusButton));
  actions.appendChild(statusButton);

  const deleteButton = document.createElement("button");
  deleteButton.className = "button button-danger button-small";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteContent(item, deleteButton));
  actions.appendChild(deleteButton);

  cell.appendChild(actions);
  return cell;
};

const updateStatus = async (item, button) => {
  const message = document.getElementById("contentMessage");
  const action = item.status === "draft" ? "publish" : "unpublish";

  setButtonLoading(button, true, "Saving...");
  clearMessage(message);

  try {
    const data = await apiRequest(`/admin/content/${item._id}/${action}`, {
      method: "PATCH",
    });

    showMessage(message, data.message, "success");
    loadContent(currentPage);
  } catch (error) {
    showMessage(message, error.message);
    setButtonLoading(button, false);
  }
};

const deleteContent = async (item, button) => {
  const confirmed = window.confirm(`Delete “${item.title}”? This cannot be undone.`);

  if (!confirmed) {
    return;
  }

  const message = document.getElementById("contentMessage");
  setButtonLoading(button, true, "Deleting...");
  clearMessage(message);

  try {
    const data = await apiRequest(`/admin/content/${item._id}`, {
      method: "DELETE",
    });

    showMessage(message, data.message, "success");
    loadContent(currentPage);
  } catch (error) {
    showMessage(message, error.message);
    setButtonLoading(button, false);
  }
};

const renderPagination = (pagination) => {
  const paginationElement = document.getElementById("pagination");
  paginationElement.innerHTML = "";

  if (pagination.totalPages <= 1) {
    return;
  }

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;

  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  const previousButton = document.createElement("button");
  previousButton.className = "button button-secondary button-small";
  previousButton.textContent = "Previous";
  previousButton.disabled = pagination.page === 1;
  previousButton.addEventListener("click", () => loadContent(pagination.page - 1));

  const nextButton = document.createElement("button");
  nextButton.className = "button button-secondary button-small";
  nextButton.textContent = "Next";
  nextButton.disabled = pagination.page === pagination.totalPages;
  nextButton.addEventListener("click", () => loadContent(pagination.page + 1));

  controls.append(previousButton, nextButton);
  paginationElement.append(pageInfo, controls);
};
