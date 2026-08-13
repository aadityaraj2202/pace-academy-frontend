const PACE_API_BASE_URL =
  window.PACE_API_BASE_URL || "https://pace-academy-backend.onrender.com";
const PACE_CONTENT_API_URL = `${PACE_API_BASE_URL}/api/content`;

const fetchPublishedContent = async ({ category, page = 1, limit = 6 } = {}) => {
    const params = new URLSearchParams({ page, limit });

    if (category) {
        params.set("category", category);
    }

    const response = await fetch(`${PACE_CONTENT_API_URL}?${params.toString()}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to load content right now.");
    }

    return data;
};

const fetchContentByCategory = (category, page = 1, limit = 6) =>
    fetchPublishedContent({ category, page, limit });

const fetchContentBySlug = async (slug) => {
    const response = await fetch(
        `${PACE_CONTENT_API_URL}/${encodeURIComponent(slug)}`
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Content not found.");
    }

    return data;
};

const getArticleUrl = (slug) =>
    `article.html?slug=${encodeURIComponent(slug)}`;

const formatContentDate = (value) => {
    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
};

const createContentImage = (article, className = "pace-content-image") => {
    if (article.featuredImage) {
        const image = document.createElement("img");
        image.className = className;
        image.src = article.featuredImage;
        image.alt = article.title;
        image.addEventListener("error", () => {
            image.replaceWith(createContentImagePlaceholder(className));
        });
        return image;
    }

    return createContentImagePlaceholder(className);
};

const createContentImagePlaceholder = (className) => {
    const placeholder = document.createElement("div");
    placeholder.className = `${className}-placeholder`;
    placeholder.textContent = "PACE Academy";
    return placeholder;
};

const renderContentPagination = (container, pagination, onPageChange) => {
    container.replaceChildren();

    if (pagination.totalPages <= 1) {
        return;
    }

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.textContent = "Previous";
    previousButton.disabled = pagination.currentPage === 1;
    previousButton.addEventListener("click", () =>
        onPageChange(pagination.currentPage - 1)
    );

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.textContent = "Next";
    nextButton.disabled = pagination.currentPage === pagination.totalPages;
    nextButton.addEventListener("click", () =>
        onPageChange(pagination.currentPage + 1)
    );

    container.append(previousButton, pageInfo, nextButton);
};
