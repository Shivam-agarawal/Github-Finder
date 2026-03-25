// ─── Optional GitHub Token ────────────────────────────────────────────
// Paste a GitHub Personal Access Token here to raise the rate limit
// from 60 to 5,000 requests/hour.
// Generate one at: https://github.com/settings/tokens (no scopes needed for public data)
const GITHUB_TOKEN = "";

// ─── GitHub Language Colors ──────────────────────────────────────────
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Lua: "#000080",
  R: "#198CE7",
  Scala: "#c22d40",
  Perl: "#0298c3",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  PowerShell: "#012456",
  Objective_C: "#438eff",
  MATLAB: "#e16737",
};

// ─── DOM References ──────────────────────────────────────────────────
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const profileContainer = document.getElementById("profile-container");
const errorContainer = document.getElementById("error-container");
const skeletonContainer = document.getElementById("skeleton-container");
const avatar = document.getElementById("avatar");
const nameElement = document.getElementById("name");
const usernameElement = document.getElementById("username");
const bioElement = document.getElementById("bio");
const locationElement = document.getElementById("location");
const joinedDateElement = document.getElementById("joined-date");
const profileLink = document.getElementById("profile-link");
const followers = document.getElementById("followers");
const following = document.getElementById("following");
const repos = document.getElementById("repos");
const companyElement = document.getElementById("company");
const blogElement = document.getElementById("blog");
const twitterElement = document.getElementById("twitter");
const companyContainer = document.getElementById("company-container");
const blogContainer = document.getElementById("blog-container");
const twitterContainer = document.getElementById("website-container");
const reposContainer = document.getElementById("repos-container");
const loadMoreBtn = document.getElementById("load-more-btn");
const copyLinkBtn = document.getElementById("copy-link-btn");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const searchHistory = document.getElementById("search-history");
const toast = document.getElementById("toast");

// ─── Pagination state ───────────────────────────────────────────────
let currentPage = 1;
const perPage = 6;
let currentReposUrl = "";
let totalPublicRepos = 0;
let loadedReposCount = 0;

// ─── Helpers ─────────────────────────────────────────────────────────
function fetchOptions() {
  const headers = {};
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }
  return { headers };
}

function showLoading() {
  skeletonContainer.classList.remove("hidden");
}

function hideLoading() {
  skeletonContainer.classList.add("hidden");
}

function getLangColor(language) {
  return LANGUAGE_COLORS[language] || "#8b8b8b";
}

// ─── Theme Toggle ───────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem("github-finder-theme");
  if (saved === "light") {
    document.body.classList.add("light-theme");
    themeIcon.classList.replace("fa-moon", "fa-sun");
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  localStorage.setItem("github-finder-theme", isLight ? "light" : "dark");
  if (isLight) {
    themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }
}

initTheme();

// ─── Search History ─────────────────────────────────────────────────
const MAX_HISTORY = 8;

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("github-finder-history")) || [];
  } catch {
    return [];
  }
}

function saveToHistory(username) {
  let history = getHistory();
  // Remove duplicate if exists, then prepend
  history = history.filter((h) => h.toLowerCase() !== username.toLowerCase());
  history.unshift(username);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  localStorage.setItem("github-finder-history", JSON.stringify(history));
}

function removeFromHistory(username) {
  let history = getHistory();
  history = history.filter((h) => h.toLowerCase() !== username.toLowerCase());
  localStorage.setItem("github-finder-history", JSON.stringify(history));
  renderHistory();
}

function renderHistory(filter = "") {
  const history = getHistory();
  const filtered = filter
    ? history.filter((h) => h.toLowerCase().includes(filter.toLowerCase()))
    : history;

  if (filtered.length === 0) {
    searchHistory.classList.add("hidden");
    return;
  }

  searchHistory.innerHTML = filtered
    .map(
      (h) => `
    <div class="history-item">
      <span class="history-text" data-username="${h}">
        <i class="fas fa-history"></i> ${h}
      </span>
      <button class="history-remove" data-username="${h}" title="Remove">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
    )
    .join("");

  searchHistory.classList.remove("hidden");
}

function hideHistory() {
  // Small delay so click events on history items fire first
  setTimeout(() => searchHistory.classList.add("hidden"), 150);
}

// ─── Copy Profile Link ─────────────────────────────────────────────
function copyProfileLink() {
  const url = profileLink.href;
  navigator.clipboard.writeText(url).then(() => {
    showToast();
  });
}

function showToast() {
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2000);
}

// ─── Event listeners ─────────────────────────────────────────────────
searchBtn.addEventListener("click", searchUser);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchUser();
});
loadMoreBtn.addEventListener("click", () =>
  fetchRepositories(currentReposUrl, false)
);
themeToggle.addEventListener("click", toggleTheme);
copyLinkBtn.addEventListener("click", copyProfileLink);

searchInput.addEventListener("focus", () => renderHistory(searchInput.value));
searchInput.addEventListener("input", () =>
  renderHistory(searchInput.value)
);
searchInput.addEventListener("blur", hideHistory);

// ─── Keyboard Shortcuts ─────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  // "/" to focus search (only when not already typing in an input)
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  // "Esc" to clear search and hide results
  if (e.key === "Escape") {
    searchInput.value = "";
    searchInput.blur();
    searchHistory.classList.add("hidden");
  }
});

searchHistory.addEventListener("mousedown", (e) => {
  // Use mousedown instead of click so it fires before blur
  const textEl = e.target.closest(".history-text");
  const removeBtn = e.target.closest(".history-remove");

  if (removeBtn) {
    e.preventDefault();
    removeFromHistory(removeBtn.dataset.username);
    return;
  }
  if (textEl) {
    e.preventDefault();
    searchInput.value = textEl.dataset.username;
    searchHistory.classList.add("hidden");
    searchUser();
  }
});

// ─── Search ──────────────────────────────────────────────────────────
async function searchUser() {
  const username = searchInput.value.trim();

  if (!username) return alert("Please enter a username");

  searchHistory.classList.add("hidden");

  try {
    // reset the ui
    profileContainer.classList.add("hidden");
    profileContainer.classList.remove("animate-in");
    errorContainer.classList.add("hidden");
    errorContainer.classList.remove("animate-in");
    loadMoreBtn.classList.add("hidden");
    showLoading();

    const response = await fetch(
      `https://api.github.com/users/${username}`,
      fetchOptions()
    );
    if (!response.ok) throw new Error("User not found");

    const userData = await response.json();

    // Save successful search to history
    saveToHistory(username);

    // Reset pagination state for new user
    currentPage = 1;
    loadedReposCount = 0;
    totalPublicRepos = userData.public_repos;
    currentReposUrl = userData.repos_url;

    displayUserData(userData);
    fetchRepositories(userData.repos_url, true);
  } catch (error) {
    hideLoading();
    showError();
  }
}

// ─── Repositories ────────────────────────────────────────────────────
async function fetchRepositories(reposUrl, isFirstLoad) {
  if (isFirstLoad) {
    reposContainer.innerHTML =
      '<div class="loading-repos">Loading repositories...</div>';
  }

  loadMoreBtn.classList.add("hidden");

  try {
    const response = await fetch(
      reposUrl + `?per_page=${perPage}&page=${currentPage}&sort=updated`,
      fetchOptions()
    );
    if (!response.ok) {
      throw new Error("Failed to load repositories");
    }
    const reposData = await response.json();

    if (isFirstLoad) {
      hideLoading();
    }

    displayRepos(reposData, isFirstLoad);

    loadedReposCount += reposData.length;
    currentPage++;

    // Show "Load More" if there are more repos to fetch
    if (loadedReposCount < totalPublicRepos && reposData.length === perPage) {
      loadMoreBtn.classList.remove("hidden");
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  } catch (error) {
    hideLoading();
    reposContainer.innerHTML = `<div class="no-repos">${error.message}</div>`;
  }
}

function displayRepos(reposData, isFirstLoad) {
  if (isFirstLoad && reposData.length === 0) {
    reposContainer.innerHTML =
      '<div class="no-repos">No repositories found</div>';
    return;
  }

  if (isFirstLoad) {
    reposContainer.innerHTML = "";
  }

  reposData.forEach((repo) => {
    const repoCard = document.createElement("div");
    repoCard.className = "repo-card";

    const updatedAt = formatDate(repo.updated_at);
    const langColor = getLangColor(repo.language);

    repoCard.innerHTML = `
      <a href="${repo.html_url}" target="_blank" class="repo-name">
        <i class="fas fa-code-branch"></i> ${repo.name}
      </a>
      <p class="repo-description">${repo.description || "No description available"}</p>
      <div class="repo-meta">
        ${
          repo.language
            ? `
          <div class="repo-meta-item">
            <span class="lang-dot" style="background-color: ${langColor}"></span>
            ${repo.language}
          </div>
        `
            : ""
        }
        <div class="repo-meta-item">
          <i class="fas fa-star"></i> ${repo.stargazers_count}
        </div>
        <div class="repo-meta-item">
          <i class="fas fa-code-fork"></i> ${repo.forks_count}
        </div>
        <div class="repo-meta-item">
          <i class="fas fa-history"></i> ${updatedAt}
        </div>
      </div>
    `;

    reposContainer.appendChild(repoCard);
  });
}

// ─── Profile display ─────────────────────────────────────────────────
function displayUserData(user) {
  avatar.src = user.avatar_url;
  nameElement.textContent = user.name || user.login;
  usernameElement.textContent = `@${user.login}`;
  bioElement.textContent = user.bio || "No bio available";

  locationElement.textContent = user.location || "Not specified";
  joinedDateElement.textContent = formatDate(user.created_at);

  profileLink.href = user.html_url;
  followers.textContent = user.followers;
  following.textContent = user.following;
  repos.textContent = user.public_repos;

  if (user.company) companyElement.textContent = user.company;
  else companyElement.textContent = "Not specified";

  if (user.blog) {
    blogElement.textContent = user.blog;
    blogElement.href = user.blog.startsWith("http")
      ? user.blog
      : `https://${user.blog}`;
  } else {
    blogElement.textContent = "No website";
    blogElement.href = "#";
  }

  blogContainer.style.display = "flex";

  if (user.twitter_username) {
    twitterElement.textContent = `@${user.twitter_username}`;
    twitterElement.href = `https://twitter.com/${user.twitter_username}`;
  } else {
    twitterElement.textContent = "No Twitter";
    twitterElement.href = "#";
  }

  twitterContainer.style.display = "flex";

  // show the profile with animation
  profileContainer.classList.remove("hidden");
  // Trigger reflow to restart animation
  void profileContainer.offsetWidth;
  profileContainer.classList.add("animate-in");
}

// ─── Error & Utility ─────────────────────────────────────────────────
function showError() {
  errorContainer.classList.remove("hidden");
  void errorContainer.offsetWidth;
  errorContainer.classList.add("animate-in");
  profileContainer.classList.add("hidden");
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Service Worker Registration ─────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
