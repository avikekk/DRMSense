# Contributing to DRMSense

First off, thank you for considering contributing to DRMSense! It's people like you that make DRMSense such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by respect, kindness, and professionalism. By participating, you are expected to uphold these values.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your browser version and operating system**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

### Setup Steps

```bash
# Fork and clone the repository
git clone https://github.com/your-username/drmsense.git
cd drmsense

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## Development Workflow

### Branch Naming

- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation changes
- `refactor/description` - For code refactoring
- `test/description` - For adding or updating tests

### Commit Messages

We follow conventional commits:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature changes or bug fixes
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for AV1 codec detection
fix: correct browser detection for Chromium-based Edge
docs: update README with troubleshooting section
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Add proper type annotations
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes
- Use type guards when needed

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Add accessibility attributes (ARIA labels, roles, etc.)
- Optimize performance with `useMemo` and `useCallback` when needed

### CSS

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Maintain dark mode compatibility
- Use semantic color names

### File Organization

- Keep related files together
- Use index files for exports when appropriate
- Name files with PascalCase for components, camelCase for utilities
- Co-locate tests with the code they test

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Ensure tests are deterministic
- Mock external dependencies
- Test edge cases and error conditions

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for exported functions
- Update type definitions as needed
- Include examples in documentation

## Pull Request Process

1. **Update Documentation**: Ensure README and other docs reflect your changes
2. **Add Tests**: Include appropriate tests for your changes
3. **Run Linter**: Ensure `npm run lint` passes
4. **Test Locally**: Verify your changes work in development and production builds
5. **Describe Changes**: Write a clear PR description explaining what and why
6. **Link Issues**: Reference related issues in your PR description
7. **Request Review**: Request review from maintainers
8. **Address Feedback**: Respond to review comments promptly

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Works in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive changes tested
- [ ] Dark mode compatibility maintained
- [ ] Accessibility considerations addressed

## Project Structure

```
drmsense/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css      # Global styles
├── public/             # Static assets
├── .github/            # GitHub workflows
├── package.json        # Dependencies
└── vite.config.ts      # Vite configuration
```

## Getting Help

- Check existing [Issues](https://github.com/yourusername/drmsense/issues)
- Read the [README](README.md)
- Ask questions in [Discussions](https://github.com/yourusername/drmsense/discussions)

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors page

Thank you for your contributions! 🎉
