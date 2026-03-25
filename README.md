# 🔍 GitHub User Finder

A sleek, modern web app to search and explore GitHub user profiles and repositories.

**[Live Demo →](https://shivam-agarawal.github.io/Github-Finder/)**

---

## ✨ Features

- **User Search** — Find any GitHub user by username
- **Profile Card** — Avatar, bio, location, join date, company, blog, Twitter
- **Repository Grid** — Latest repos with language, stars, forks, and last updated date
- **Load More** — Paginated repos (6 at a time)
- **Dark / Light Theme** — Toggle with persistence
- **Search History** — Recent searches saved locally with dropdown suggestions
- **Copy Profile Link** — One-click clipboard copy with toast notification
- **Language Color Dots** — GitHub-accurate language colors (30+ languages)
- **Skeleton Loading** — Elegant shimmer placeholders while fetching data
- **Keyboard Shortcuts** — `/` to focus search, `Esc` to clear
- **PWA Support** — Installable as a desktop/mobile app
- **Fully Responsive** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Tech | Usage |
|------|-------|
| HTML5 | Structure & Semantics |
| CSS3 | Custom properties, animations, responsive grid |
| JavaScript | Fetch API, localStorage, Service Worker |
| GitHub REST API | User data & repositories |
| Font Awesome 7 | Icons |

---

## 🚀 Getting Started

### Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/Shivam-agarawal/Github-Finder.git
   cd Github-Finder
   ```

2. Open `index.html` in your browser, or use a local server:
   ```bash
   npx serve .
   ```

### Optional: Increase API Rate Limit

By default, the GitHub API allows 60 requests/hour. To get 5,000/hr:

1. [Generate a GitHub token](https://github.com/settings/tokens) (no scopes needed)
2. Open `script.js` and set:
   ```js
   const GITHUB_TOKEN = "your_token_here";
   ```

---

## 📁 Project Structure

```
Github-Finder/
├── index.html        # Main page
├── style.css         # All styles
├── script.js         # App logic
├── manifest.json     # PWA manifest
├── sw.js             # Service worker
├── icons/
│   ├── icon-192.png  # PWA icon (192x192)
│   └── icon-512.png  # PWA icon (512x512)
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `Esc` | Clear search & close history |
| `Enter` | Search for username |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by [Shivam Agrawal](https://github.com/Shivam-agarawal)
