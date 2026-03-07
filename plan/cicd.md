## CI/CD & Development Workflow

### Pre-commit Hooks

Local checks run before each commit to catch issues early.

**Configuration:** `.pre-commit-config.yaml` at repository root

**Backend hooks:**

- `black` — Python code formatter
- `isort` — Python import sorter
- `flake8` — Python linter (style/errors)
- `mypy` — Python static type checker
- `pytest` — Unit tests (fail commit if tests fail)

**Frontend hooks:**

- `prettier` — TypeScript/Vue formatter
- `eslint` — JavaScript/TypeScript linter
- `vue/recommended` — Vue 3 linting rules

**Installation (local dev machine):**

```bash
pip install pre-commit
cd attendance-taker
pre-commit install
```

On next commit, hooks run automatically. Developers can bypass with `git commit --no-verify` if needed (not recommended).

### GitHub Actions CI/CD Pipeline

Automated workflows run on push and pull requests.

**Workflow files:** `.github/workflows/`

**Backend CI workflow** (`.github/workflows/backend-ci.yml`)

- Trigger: push to main + PRs
- Steps:
  1. Checkout code
  2. Set up Python 3.10+
  3. Install dependencies (`pip install -r backend/requirements.txt`)
  4. Run pre-commit hooks (black, isort, flake8, mypy)
  5. Run pytest with coverage report
  6. Upload coverage to Codecov (optional)
  7. Fail workflow if any step fails

**Frontend CI workflow** (`.github/workflows/frontend-ci.yml`)

- Trigger: push to main + PRs
- Steps:
  1. Checkout code
  2. Set up Node.js 18+
  3. Install dependencies (`npm install` in frontend/)
  4. Run ESLint + Prettier checks
  5. Run unit tests (Vitest)
  6. Build for production (`npm run build`)
  7. Fail workflow if any step fails

**Deployment workflow** (`.github/workflows/deploy.yml`) — optional, for later phases

- Trigger: push to main only
- Steps:
  1. Build backend Docker image
  2. Build frontend Docker image
  3. Push to Docker Hub or container registry
  4. Deploy to hosting platform (e.g., Heroku, Railway, AWS)

### Repository Setup

**Required files & folders:**

```
attendance-taker/
├── .pre-commit-config.yaml      # Pre-commit hook config
├── .github/
│   └── workflows/
│       ├── backend-ci.yml       # Backend test + lint
│       ├── frontend-ci.yml      # Frontend test + lint
│       └── deploy.yml           # (Optional) Deployment workflow
├── backend/
│   ├── requirements.txt         # Python dependencies + dev tools
│   └── pyproject.toml           # Alternative: Poetry config
├── frontend/
│   ├── package.json             # NPM dependencies
│   └── .eslintrc.cjs            # ESLint config
└── .gitignore                   # Ignore node_modules, venv, __pycache__, .env, etc.
```
