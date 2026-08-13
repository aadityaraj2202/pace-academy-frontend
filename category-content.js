document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-content-category-list]").forEach((container) => {
        loadCategoryContent(container, 1);
    });
});

const loadCategoryContent = async (container, page) => {
    const category = container.dataset.category;
    const limit = Number(container.dataset.limit) || 6;
    const pagination = document.querySelector(container.dataset.paginationTarget);

    renderCategoryState(container, "Loading content...");
    pagination?.replaceChildren();

    try {
        const data = await fetchContentByCategory(category, page, limit);
        renderContentCards(container, data.articles);

        if (pagination) {
            renderContentPagination(pagination, data, (nextPage) =>
                loadCategoryContent(container, nextPage)
            );
        }
    } catch (error) {
        renderCategoryState(container, error.message, "error");
    }
};

const renderContentCards = (container, articles) => {
    container.replaceChildren();

    if (!articles.length) {
        renderCategoryState(container, "No content available yet.");
        return;
    }

    articles.forEach((article) => {
        const card = document.createElement("article");
        card.className = "pace-content-card";
        card.appendChild(createContentImage(article));

        const body = document.createElement("div");
        body.className = "pace-content-card-body";

        const category = document.createElement("span");
        category.className = "pace-content-category";
        category.textContent = article.category;

        const title = document.createElement("h3");
        title.className = "pace-content-title";
        const titleLink = document.createElement("a");
        titleLink.href = getArticleUrl(article.slug);
        titleLink.textContent = article.title;
        title.appendChild(titleLink);

        const description = document.createElement("p");
        description.className = "pace-content-description";
        description.textContent =
            article.shortDescription || "Open this article to read more.";

        const meta = document.createElement("div");
        meta.className = "pace-content-meta";
        appendMeta(meta, formatContentDate(article.createdAt));
        appendMeta(meta, article.author?.name);

        const readMore = document.createElement("a");
        readMore.className = "pace-read-more";
        readMore.href = getArticleUrl(article.slug);
        readMore.textContent = "Read article →";

        body.append(category, title, description, meta, readMore);
        card.appendChild(body);
        container.appendChild(card);
    });
};

const appendMeta = (container, value) => {
    if (!value) {
        return;
    }

    const item = document.createElement("span");
    item.textContent = value;
    container.appendChild(item);
};

const renderCategoryState = (container, message, type = "") => {
    container.replaceChildren();
    const state = document.createElement("div");
    state.className = `pace-content-state ${type}`.trim();
    state.textContent = message;
    container.appendChild(state);
};
