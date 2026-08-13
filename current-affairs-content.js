document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("currentAffairsList");

    if (container) {
        loadCurrentAffairs(container, 1);
    }
});

const loadCurrentAffairs = async (container, page) => {
    const pagination = document.getElementById("currentAffairsPagination");
    const count = document.getElementById("currentAffairsCount");

    renderCurrentAffairsState(container, "Loading current affairs...");
    pagination.replaceChildren();

    try {
        const data = await fetchContentByCategory("Current Affairs", page, 6);
        renderCurrentAffairs(container, data.articles);
        count.textContent = `${data.totalItems} published updates`;
        renderContentPagination(pagination, data, (nextPage) =>
            loadCurrentAffairs(container, nextPage)
        );
    } catch (error) {
        count.textContent = "";
        renderCurrentAffairsState(container, error.message, "error");
    }
};

const renderCurrentAffairs = (container, articles) => {
    container.replaceChildren();

    if (!articles.length) {
        renderCurrentAffairsState(container, "No content available yet.");
        return;
    }

    articles.forEach((article) => {
        const item = document.createElement("article");
        item.className = "current-article";
        item.appendChild(createContentImage(article, "pace-current-image"));

        const info = document.createElement("div");
        info.className = "article-info";

        const tag = document.createElement("span");
        tag.className = "article-tag api-tag";
        tag.textContent = article.tags?.[0] || article.category;

        const title = document.createElement("h3");
        title.className = "pace-content-title";
        const titleLink = document.createElement("a");
        titleLink.href = getArticleUrl(article.slug);
        titleLink.textContent = article.title;
        title.appendChild(titleLink);

        const description = document.createElement("p");
        description.className = "pace-content-description";
        description.textContent =
            article.shortDescription || "Open this update to read more.";

        const meta = document.createElement("div");
        meta.className = "article-details pace-content-meta";
        appendCurrentAffairsMeta(meta, formatContentDate(article.createdAt));
        appendCurrentAffairsMeta(meta, article.author?.name);

        info.append(tag, title, description, meta);
        item.appendChild(info);
        container.appendChild(item);
    });
};

const appendCurrentAffairsMeta = (container, value) => {
    if (!value) {
        return;
    }

    const item = document.createElement("span");
    item.textContent = value;
    container.appendChild(item);
};

const renderCurrentAffairsState = (container, message, type = "") => {
    container.replaceChildren();
    const state = document.createElement("div");
    state.className = `pace-content-state ${type}`.trim();
    state.textContent = message;
    container.appendChild(state);
};
