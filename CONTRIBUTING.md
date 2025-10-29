# Contributing to Knowledge Cards

Thank you for your interest in contributing to the Knowledge Cards module! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Strapi URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript
- Use TypeScript strict mode
- Explicitly type function parameters and return values
- Avoid `any` type - use `unknown` or proper types
- Use interfaces for object shapes, types for unions/intersections

### React
- Use functional components with hooks
- Prefer `const` over `let`, avoid `var`
- Use custom hooks for reusable logic
- Keep components focused and single-responsibility

### Naming Conventions
- **Components**: PascalCase (`KnowledgeCard`, `FilterPanel`)
- **Files**: Match component name (`KnowledgeCard.tsx`, `KnowledgeCard.css`)
- **Functions/Variables**: camelCase (`fetchCards`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`CardType`, `FilterState`)

### CSS
- Use component-specific CSS files
- Use semantic class names
- Mobile-first responsive design
- Prefer flexbox/grid over floats
- Use CSS variables for theme values

### Comments
- Only comment complex logic
- Prefer self-documenting code
- Use JSDoc for public APIs
- Keep comments up-to-date with code

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

**Guidelines:**
- Test user interactions, not implementation details
- Use `@testing-library/react` best practices
- Mock external dependencies (API calls)
- Aim for >80% coverage on business logic

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- knowledge-cards.spec.ts
```

**Guidelines:**
- Test critical user flows
- Test across different viewports (desktop, mobile)
- Use data-testid for E2E-specific selectors
- Keep tests independent and isolated

## Making Changes

### Branch Naming
- Feature: `feat/description` (e.g., `feat/add-favorites`)
- Bug fix: `fix/description` (e.g., `fix/qr-code-rendering`)
- Documentation: `docs/description` (e.g., `docs/update-readme`)
- Refactor: `refactor/description` (e.g., `refactor/filter-logic`)

### Commit Messages
Follow conventional commits format:
```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(filters): add relevance sorting

Implement relevance-based sorting for knowledge cards.
Adds a new dropdown to sort cards by relevance score.

Closes #123
```

### Pull Request Process

1. **Before submitting:**
   - Run `npm run typecheck` - no TypeScript errors
   - Run `npm run lint` - no linting errors
   - Run `npm test -- --run` - all tests pass
   - Run `npm run build` - builds successfully
   - Update tests if adding/changing functionality
   - Update documentation if needed

2. **PR description should include:**
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots for UI changes
   - Related issue numbers

3. **PR review process:**
   - Address all review comments
   - Keep PR focused and atomic
   - Squash commits before merging if needed

## Adding New Features

### Adding a New Card Type

1. Update the `CardType` type in `src/types/index.ts`
2. Add color mapping in `KnowledgeCard.tsx` (`getCardTypeColor`)
3. Add CSS class in `KnowledgeCard.css`
4. Update filter options in `FilterPanel.tsx`
5. Add tests in `KnowledgeCard.test.tsx`
6. Update documentation

### Adding New Filter Criteria

1. Update `FilterState` type in `src/types/index.ts`
2. Add filter UI in `FilterPanel.tsx`
3. Update query parameter serialization in `utils/queryParams.ts`
4. Update Strapi query in `services/strapi.ts`
5. Add tests for new filter
6. Update documentation

### Adding New Component

1. Create component file: `src/components/ComponentName.tsx`
2. Create CSS file: `src/components/ComponentName.css`
3. Create test file: `src/components/ComponentName.test.tsx`
4. Export from component if needed
5. Add to appropriate page/component
6. Write tests covering main functionality
7. Document props with JSDoc if public

## Performance Guidelines

- Use lazy loading for images
- Debounce user input (search, filters)
- Memoize expensive calculations
- Avoid unnecessary re-renders
- Optimize bundle size
- Test on mobile devices

## Accessibility Guidelines

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios
- Provide alternative text for images

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Getting Help

- Check existing documentation
- Search closed issues for similar problems
- Ask in discussions/issues
- Tag maintainers if urgent

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).
