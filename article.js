document.addEventListener("DOMContentLoaded", () => {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const hero = document.getElementById("articleHero");
    const content = document.getElementById("articleContent");

    if (!slug) {
        renderArticleState(hero, content, "Content not found.", "error");
        return;
    }

    loadArticle(slug, hero, content);
});

const loadArticle = async (slug, hero, content) => {
    renderArticleState(hero, content, "Loading article...");

    try {
        const data = await fetchContentBySlug(slug);
        renderArticle(data.article, hero, content);
    } catch (error) {
        renderArticleState(hero, content, error.message, "error");
    }
};

const renderArticle = (article, hero, content) => {
    hero.replaceChildren();
    content.replaceChildren();
    document.title = `${article.title} | PACE Academy`;

    const category = document.createElement("span");
    category.className = "pace-article-category";
    category.textContent = article.category;

    const title = document.createElement("h1");
    title.textContent = article.title;

    const meta = document.createElement("div");
    meta.className = "pace-article-meta";
    appendArticleMeta(meta, formatContentDate(article.createdAt));
    appendArticleMeta(meta, article.author?.name);
    hero.append(category, title, meta);

    if (article.featuredImage) {
        const image = document.createElement("img");
        image.className = "pace-featured-image";
        image.src = article.featuredImage;
        image.alt = article.title;
        image.addEventListener("error", () => image.remove());
        content.appendChild(image);
    }

    if (article.shortDescription) {
        const description = document.createElement("p");
        description.className = "pace-article-description";
        description.textContent = article.shortDescription;
        content.appendChild(description);
    }

    const articleBody = document.createElement("div");
    articleBody.className = "pace-article-content";
    const paragraphs = article.content.split(/\n{2,}/).filter(Boolean);

    (paragraphs.length ? paragraphs : [article.content]).forEach((paragraph) => {
        const element = document.createElement("p");
        element.textContent = paragraph;
        articleBody.appendChild(element);
    });

    content.appendChild(articleBody);

    if (article.tags?.length) {
        const tags = document.createElement("div");
        tags.className = "pace-article-tags";

        article.tags.forEach((tag) => {
            const item = document.createElement("span");
            item.textContent = tag;
            tags.appendChild(item);
        });

        content.appendChild(tags);
    }
};

const appendArticleMeta = (container, value) => {
    if (!value) {
        return;
    }

    const item = document.createElement("span");
    item.textContent = value;
    container.appendChild(item);
};

const renderArticleState = (hero, content, message, type = "") => {
    hero.replaceChildren();
    content.replaceChildren();
    const state = document.createElement("p");
    state.className = `pace-page-state ${type}`.trim();
    state.textContent = message;
    content.appendChild(state);
};
