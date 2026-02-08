# Contributing to Recallify

Thank you for considering contributing to Recallify! This document provides guidelines and steps for contributing.

## How Can I Contribute?

### Reporting Bugs

- Use the [GitHub Issues](../../issues) tab to report bugs
- Use the bug report template when creating a new issue
- Include steps to reproduce, expected behavior, and actual behavior
- Include screenshots if applicable

### Suggesting Features

- Use the [GitHub Issues](../../issues) tab with the feature request template
- Describe the feature and why it would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure nothing is broken
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

### Prerequisites

- **Node.js** >= 18
- **Rust** >= 1.70 (via [rustup.rs](https://rustup.rs))
- **Tauri prerequisites**: see [Tauri v2 docs](https://v2.tauri.app/start/prerequisites/)

### Getting Started

```bash
git clone https://github.com/Zimmyzhuang/StudyRA.git
cd StudyRA
npm install
npm run dev          # browser only
npm run tauri dev    # desktop app
```

## Code Style

- **TypeScript/React**: Follow existing patterns in the codebase
- **Rust**: Follow standard Rust formatting (`cargo fmt`)
- Use meaningful commit messages
- Keep PRs focused — one feature or fix per PR

## Project Structure

- `src/` — React frontend code
- `src-tauri/` — Rust/Tauri backend code
- `tests/` — Test files
- `docs/` — Documentation
- `tools/` — Build & automation scripts
