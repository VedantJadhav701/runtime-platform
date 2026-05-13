# Contributing to Antigravity Runtime

First off, thank you for considering contributing to Antigravity Runtime! It's people like you that make our execution platform highly secure, deterministic, and self-healing.

## 🤝 Community Standards & Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to follow these guidelines to maintain a highly collaborative, supportive, and professional environment.

---

## 🛠️ Local Development Setup

Antigravity Runtime functions as a hybrid monorepo consisting of the Python orchestration kernel CLI tools and the front-end observability web/desktop interfaces.

### 1. Prerequisites
- **Python**: Version 3.10 or higher.
- **Node.js**: Version 20 or higher (for UI applications).
- **Git**: For version control.

### 2. Fork and Clone
Fork the repository on GitHub and clone your fork locally:
```bash
git clone https://github.com/<your-username>/antigravity-runtime.git
cd antigravity-runtime
```

### 3. Install Python Dependencies (Kernel/CLI)
Set up a virtual environment and install the package in editable mode:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -e .
```

### 4. Install Frontend Dependencies (Landing Experience)
Navigate to the web experience application and install package dependencies:
```bash
cd apps/landing
npm install
```

---

## 💻 Coding Standards & Validation

We maintain **infrastructure-grade code quality**. Before submitting a pull request, please verify that your changes adhere to our deterministic guidelines:

### Static Analysis
We utilize `ruff` for all Python formatting and static linting:
```bash
# Run auto-formatter
ruff format .

# Check for linter errors
ruff check . --fix
```

### UI Guidelines
If modifying the Landing Web UI (`apps/landing`), ensure visual standards are kept:
- Maintain strict mobile and desktop layout responsiveness.
- Avoid inline CSS styles; utilize Tailwind utility tokens.
- Ensure production builds execute cleanly without type mismatches:
  ```bash
  npm run build
  ```

---

## 📥 Submission Guidelines

### Commit Message Convention
We adhere strictly to the [Conventional Commits](https://www.conventionalcommits.org/) specification. This enables automated version releases and changelog generation.

Format: `<type>(<scope>): <subject>`

Examples:
- `feat(kernel): implement AST-aware patching module`
- `fix(hud): resolve benchmark motion-value precision error`
- `docs: integrate global code of conduct`

### Pull Request Flow
1. Create a descriptive feature branch from `main` (`git checkout -b feat/your-feature`).
2. Commit your polished changes following the commit convention.
3. Push the branch to your GitHub fork (`git push origin feat/your-feature`).
4. Open a Pull Request targeting the upstream `main` branch. Provide a comprehensive summary of changes, screenshot evidence if modifying UI, and relevant reference issue tags.

---

## 🐛 Reporting Bugs & Security Issues
- **Bugs**: Open a GitHub Issue containing precise reproduction steps, runtime/OS telemetry, and error tracebacks.
- **Security**: If you discover a critical vulnerability (e.g., untrusted AST arbitrary code injection), please email our core leadership directly rather than disclosing publicly via standard issues.

Thank you for helping us shape the future of autonomous infrastructure! 🚀
