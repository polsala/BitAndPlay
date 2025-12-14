# 🤝 Contributing to BitAndPlay

Thank you for your interest in contributing to BitAndPlay! We welcome contributions from developers, designers, musicians, and documentation writers. This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Guidelines](#code-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

---

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. By participating in this project, you agree to:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be constructive**: Provide helpful feedback and criticism
- **Be collaborative**: Work together to improve the project
- **Be patient**: Remember that everyone has different experience levels

If you experience or witness unacceptable behavior, please report it via GitHub issues or contact the maintainers directly.

---

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Found a bug? Help us fix it:

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs. actual behavior
   - Browser, OS, and version info
   - Screenshots or console logs if applicable
3. **Use the bug report template** if available

### 💡 Suggesting Features

Have an idea to improve BitAndPlay?

1. **Check the roadmap** and existing issues first
2. **Open a feature request** with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Mockups or examples (if applicable)
3. **Discuss before implementing**: Large features should be discussed with maintainers first

### 📖 Improving Documentation

Documentation is crucial! You can help by:

- Fixing typos or clarifying confusing sections
- Adding examples or tutorials
- Translating documentation to other languages
- Creating video tutorials or guides
- Capturing and adding screenshots

### 🎨 Contributing Code

Ready to write code? See the sections below for detailed guidelines.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 10+
- **Git** for version control
- A modern browser (Chrome, Firefox, Edge, Safari)
- (Optional) A code editor with TypeScript support (VS Code recommended)

### Fork & Clone

1. **Fork** the repository on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BitAndPlay.git
   cd BitAndPlay
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/polsala/BitAndPlay.git
   ```
4. **Install dependencies**:
   ```bash
   npm ci
   ```
5. **Start the dev server**:
   ```bash
   npm run dev
   ```

### Project Structure

```
BitAndPlay/
├── src/
│   ├── app/          # App shell and layout
│   ├── audio/        # Audio engine (Tone.js, generator, export)
│   ├── store/        # Zustand state management
│   ├── ui/           # UI components and tabs
│   ├── viz/          # 3D visualizer (scenes, canvas)
│   ├── studio/       # Studio mode (timeline, clips, editors)
│   └── types/        # TypeScript type definitions
├── docs/             # Documentation
├── public/           # Static assets (logo, favicon)
└── tests/            # Unit tests (Vitest)
```

For a deeper dive, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🔄 Development Workflow

### Branching Strategy

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Use descriptive branch names**:
   - `feature/add-new-visualizer-scene`
   - `fix/audio-click-on-regenerate`
   - `docs/improve-studio-guide`
   - `refactor/simplify-generator-logic`

### Making Changes

1. **Keep changes focused**: One feature or fix per branch
2. **Write clean code**: Follow the [Code Guidelines](#code-guidelines) below
3. **Test your changes**: Run `npm run test` and `npm run lint`
4. **Document new features**: Update README.md or docs/ as needed
5. **Add unit tests**: For new generator logic or utilities

### Syncing with Upstream

Stay up-to-date with the main repository:

```bash
git fetch upstream
git rebase upstream/main
```

Resolve any conflicts, then force-push to your fork:

```bash
git push origin feature/your-feature-name --force
```

---

## 📝 Code Guidelines

### TypeScript

- **Strict mode**: Always use strict TypeScript (no `any` unless absolutely necessary)
- **Type everything**: Props, function parameters, return types
- **Use existing types**: Import from `src/types/` instead of redefining
- **No implicit `any`**: Enable `noImplicitAny` in tsconfig.json

### React

- **Functional components**: Use function components with hooks (no class components)
- **Keep components small**: Single responsibility; extract helpers to separate functions
- **Props destructuring**: Destructure props in function signatures
- **Use custom hooks**: Extract reusable logic to hooks (e.g., `useAudioBands`)

### Styling

- **Tailwind CSS**: Use utility classes for styling
- **No inline styles**: Unless dynamic (e.g., audio-driven animations)
- **Dark theme**: Maintain consistency with the existing dark palette
- **Responsive**: Ensure components work on mobile (though desktop-first is OK)

### Code Style

- **Prettier**: Format with `npm run format` before committing
- **ESLint**: Run `npm run lint` and fix all errors
- **Comments**: Only for non-obvious logic; prefer self-documenting code
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_SNAKE_CASE` for constants

### Audio & Visualizer

- **Tone.js best practices**: Always schedule events with Transport times
- **Monotonic time guards**: Prevent "start time must be greater" errors
- **Apply-on-next-bar**: Respect deferred updates when editing during playback
- **WebGL optimization**: Use instancing for repeated geometry; profile with DevTools

---

## 🧪 Testing

### Running Tests

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode for development
npm run test:ui       # Open Vitest UI in browser
```

### What to Test

- **Generator logic**: Seeded RNG, music theory, pattern generation
- **Utilities**: Helper functions in `src/utils/`
- **Type safety**: Ensure types are correctly enforced
- **Edge cases**: Empty arrays, invalid inputs, boundary conditions

### Writing Tests

- **Use Vitest**: Tests live in `*.test.ts` files next to the source
- **Descriptive names**: `it('generates repeatable songs with the same seed')`
- **Arrange-Act-Assert**: Organize tests into setup, action, verification
- **Mock external dependencies**: Use Vitest mocks for Tone.js or browser APIs

**Example**:

```typescript
import { describe, it, expect } from 'vitest';
import { mulberry32 } from './rng';

describe('mulberry32 RNG', () => {
  it('generates repeatable sequences with the same seed', () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);

    expect(rng1()).toBe(rng2());
    expect(rng1()).toBe(rng2());
  });

  it('generates different sequences with different seeds', () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(54321);

    expect(rng1()).not.toBe(rng2());
  });
});
```

---

## 📤 Submitting Changes

### Before You Submit

- [ ] **All tests pass**: `npm run test`
- [ ] **No lint errors**: `npm run lint`
- [ ] **Code is formatted**: `npm run format`
- [ ] **Build succeeds**: `npm run build`
- [ ] **Documentation updated**: If you changed user-facing behavior
- [ ] **Commit messages are clear**: See [Commit Guidelines](#commit-guidelines)

### Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Build process, tooling, dependencies

**Examples**:

```
feat(visualizer): add new Spiral Galaxy scene

fix(audio): prevent clicks on regenerate with apply-on-next-bar

docs(studio): add keyboard shortcuts section

refactor(generator): simplify chord progression logic
```

### Creating a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Open a PR** on GitHub:
   - Navigate to the main repository
   - Click "New Pull Request"
   - Select your fork and branch
3. **Fill out the PR template**:
   - Clear title (50 chars or less)
   - Description of what changed and why
   - Link related issues with "Fixes #123" or "Closes #456"
   - Add screenshots for UI changes
4. **Request review** from maintainers
5. **Address feedback**: Make changes based on code review
6. **Squash commits** if requested (keep history clean)

### PR Review Process

- Maintainers will review your PR within a few days
- You may be asked to make changes or clarify your approach
- Once approved, a maintainer will merge your PR
- Your contribution will be listed in the release notes!

---

## 🌍 Community

### Where to Discuss

- **GitHub Issues**: Bug reports, feature requests, and discussions
- **GitHub Discussions**: General questions, ideas, and feedback
- **Pull Requests**: Code review and technical discussions

### Recognition

We value all contributions! Contributors are:

- Listed in the GitHub contributors graph
- Mentioned in release notes for significant features
- Eligible for project maintainer status after sustained contributions

---

## 🎓 Learning Resources

### For Audio Work

- [Tone.js Documentation](https://tonejs.github.io/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Music Theory Basics](https://www.musictheory.net/)

### For Visualizer Work

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

### For React/TypeScript

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)

---

## ❓ Questions?

If you have questions about contributing:

1. Check the [documentation](../README.md) first
2. Search [existing issues and discussions](https://github.com/polsala/BitAndPlay/issues)
3. Open a new discussion or issue if your question isn't answered

---

## 🙏 Thank You!

Your contributions make BitAndPlay better for everyone. We appreciate your time and effort! 🎉

---

<div align="center">

[🏠 Back to Main Docs](../README.md) | [🏗️ Architecture Guide →](ARCHITECTURE.md)

</div>
