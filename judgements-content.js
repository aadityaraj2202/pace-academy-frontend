document.addEventListener("DOMContentLoaded", () => {
    const landmark = document.getElementById("judgementLandmark");

    if (landmark) {
        loadJudgements(1);
    }
});

const loadJudgements = async (page) => {
    const landmark = document.getElementById("judgementLandmark");
    const cases = document.getElementById("judgementCases");
    const pagination = document.getElementById("judgementPagination");

    renderJudgementState(landmark, "Loading judgements...");
    cases.replaceChildren();
    pagination.replaceChildren();

    try {
        const data = await fetchContentByCategory("Judgements", page, 5);
        renderJudgementLandmark(landmark, data.articles[0]);
        renderJudgementCases(cases, data.articles.slice(1));
        renderContentPagination(pagination, data, loadJudgements);
    } catch (error) {
        renderJudgementState(landmark, error.message, "error");
    }
};

const renderJudgementLandmark = (container, article) => {
    container.replaceChildren();

    if (!article) {
        renderJudgementState(container, "No content available yet.");
        return;
    }

    const badges = document.createElement("div");
    badges.className = "badges";

    const source = document.createElement("span");
    source.className = "supreme";
    source.textContent = "PACE ACADEMY";

    const tag = document.createElement("span");
    tag.className = "law";
    tag.textContent = article.tags?.[0] || article.category;
    badges.append(source, tag);

    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = getArticleUrl(article.slug);
    titleLink.textContent = article.title;
    title.appendChild(titleLink);

    const details = document.createElement("div");
    details.className = "details";
    appendJudgementDetail(details, formatContentDate(article.createdAt));
    appendJudgementDetail(details, article.author?.name);

    const description = document.createElement("p");
    description.textContent =
        article.shortDescription || "Open this judgement to read the full summary.";

    const link = document.createElement("a");
    link.href = getArticleUrl(article.slug);
    link.textContent = "Read Full Summary →";

    container.append(badges, title, details, description, link);
};

const renderJudgementCases = (container, articles) => {
    container.replaceChildren();

    articles.forEach((article) => {
        const card = document.createElement("article");
        card.className = "case-card";

        const top = document.createElement("div");
        top.className = "case-top";
        const source = document.createElement("span");
        source.textContent = "Judgement";
        const tag = document.createElement("b");
        tag.textContent = article.tags?.[0] || article.category;
        top.append(source, tag);

        const title = document.createElement("h3");
        title.className = "pace-content-title";
        const titleLink = document.createElement("a");
        titleLink.href = getArticleUrl(article.slug);
        titleLink.textContent = article.title;
        title.appendChild(titleLink);

        const description = document.createElement("p");
        description.className = "pace-content-description";
        description.textContent =
            article.shortDescription || "Open this judgement to read the summary.";

        const bottom = document.createElement("div");
        bottom.className = "case-bottom";
        const date = document.createElement("span");
        date.textContent = formatContentDate(article.createdAt);
        const link = document.createElement("a");
        link.href = getArticleUrl(article.slug);
        link.textContent = "Read Summary";
        bottom.append(date, link);

        card.append(top, title, description, bottom);
        container.appendChild(card);
    });
};

const appendJudgementDetail = (container, value) => {
    if (!value) {
        return;
    }

    const item = document.createElement("span");
    item.textContent = value;
    container.appendChild(item);
};

const renderJudgementState = (container, message, type = "") => {
    container.replaceChildren();
    const state = document.createElement("div");
    state.className = `pace-content-state ${type}`.trim();
    state.textContent = message;
    container.appendChild(state);
};
