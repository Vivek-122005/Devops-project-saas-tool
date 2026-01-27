# Contributing to SaaS Platform

Thank you for your interest in contributing to our project! This document provides guidelines for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Devops-project-saas-tool.git
   cd Devops-project-saas-tool
   ```
3. **Set up development environment**
   ```bash
   cp .env.example .env
   docker-compose up -d
   ```

## Development Workflow

### 1. Create a Branch

Use the naming convention:
```bash
git checkout -b feature/TICKET-123-description
git checkout -b bugfix/TICKET-456-description
git checkout -b hotfix/critical-issue
```

### 2. Make Changes

- Write clean, maintainable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve database connection timeout"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for auth service"
git commit -m "refactor: restructure user service"
git commit -m "perf: optimize database queries"
git commit -m "ci: update GitHub Actions workflow"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### 4. Push Changes

```bash
git push origin feature/TICKET-123-description
```

### 5. Create Pull Request

- Use a descriptive title
- Reference related issues
- Describe what changed and why
- Add screenshots for UI changes
- Request review from maintainers

## Pull Request Guidelines

### PR Title Format

```
feat: Add user profile page
fix: Resolve login redirect issue
docs: Update deployment guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
```

## Code Style

### JavaScript/Node.js
- Use ESLint configuration
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Use `const` and `let`, avoid `var`

### React/JSX
- PascalCase for components
- camelCase for functions/variables
- Props on new lines for readability
- Use functional components with hooks

### Code Comments
- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for functions

## Testing

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:unit     # Unit tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Coverage
- Aim for >80% code coverage
- Test critical paths thoroughly
- Include edge cases

## Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying configuration
- Updating deployment process

## Review Process

1. **Automated Checks**
   - CI pipeline must pass
   - Code quality checks
   - Security scans
   - Test coverage

2. **Code Review**
   - At least one approval required
   - Address review comments
   - Keep discussions constructive

3. **Merge**
   - Squash commits if needed
   - Update CHANGELOG
   - Delete branch after merge

## Release Process

1. Version bump following [Semantic Versioning](https://semver.org/)
   - MAJOR: Breaking changes
   - MINOR: New features (backward compatible)
   - PATCH: Bug fixes

2. Update CHANGELOG.md

3. Create release tag
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin v1.2.0
   ```

## Issue Reporting

### Bug Reports

Include:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Additional context

## Questions?

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**
