# Knowledge Cards Module

A comprehensive, modular card system for educational content supporting multiple card types, filtering, search, rich media, and QR code generation.

## Features

### Core Functionality
- **Multiple Card Types**: Theory, Case Study, Student Work, AI Prompt, Extended Thinking
- **Rich Media Support**: Images, videos, PDFs with lazy loading
- **QR Code Generation**: Client-side QR code generation for each card
- **Advanced Filtering**: Filter by type, tags, loops, and difficulty
- **Search**: Debounced search with Strapi integration
- **Responsive Design**: Mobile-first with masonry grid layout
- **Query Parameter Persistence**: Filters and search persist via URL

### Special Features
- **China-Safe Resources**: Indicators for resources accessible in China
- **AI Prompt Copy**: One-click copy-to-clipboard for AI prompts with success feedback
- **External Link Status**: Visual indicators for accessible/inaccessible links
- **Downloadable Assets**: Support for downloadable files with size indicators
- **Related Lessons**: Cross-references to related educational content

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for routing
- **qrcode.react** for QR code generation
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **Strapi** for backend CMS (API integration)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

```bash
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Run unit tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── KnowledgeCard.tsx
│   ├── FilterPanel.tsx
│   ├── CardGrid.tsx
│   └── Pagination.tsx
├── pages/           # Page components
│   ├── CardsListPage.tsx
│   └── CardDetailPage.tsx
├── hooks/           # Custom React hooks
│   ├── useDebounce.ts
│   └── useKnowledgeCards.ts
├── services/        # API services
│   └── strapi.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   ├── clipboard.ts
│   ├── debounce.ts
│   └── queryParams.ts
└── test/            # Test setup
    └── setup.ts
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_STRAPI_URL=http://localhost:1337
```

## API Integration

The app expects a Strapi backend with a `knowledge-cards` collection type containing:

```typescript
{
  id: string
  title: string
  type: 'Theory' | 'Case Study' | 'Student Work' | 'AI Prompt' | 'Extended Thinking'
  description: string
  tags: string[]
  loop?: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  relevance?: number
  media?: MediaAsset[]
  externalLinks?: ExternalLink[]
  relatedLessons?: RelatedLesson[]
  downloadableAssets?: DownloadableAsset[]
  aiPrompt?: string
  createdAt: string
  updatedAt: string
}
```

## Features Implementation

### Filtering
- Multi-select filters for types, tags, loops, and difficulties
- Filters update results without full page reload
- Filter state persisted in URL query parameters
- Mobile-responsive with collapsible filter panel

### Search
- Debounced input (300ms delay)
- Searches across title and description fields
- Real-time results update

### QR Codes
- Generated client-side using qrcode.react
- Accessible via button on each card
- Links to card detail page
- High-quality SVG output

### Copy to Clipboard
- Works on both desktop and mobile
- Fallback for older browsers using execCommand
- Success feedback with 2-second display
- Specific to AI Prompt card type

### Lazy Loading
- Images load lazily with loading skeleton
- Responsive image sizing
- Optimized for mobile performance

### Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly

## Testing

### Unit Tests
- Component rendering tests
- Filter logic tests
- Clipboard functionality tests
- Query parameter serialization tests

### E2E Tests
- Filter combinations
- Search functionality
- Layout toggling
- QR code generation
- Copy to clipboard
- Mobile responsiveness
- Navigation flows

## Performance

- Lazy-loaded images
- Debounced search
- Client-side QR generation
- Optimized bundle size
- Mobile-first responsive design
- Smooth animations and transitions

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Clipboard API with fallback for older browsers

## License

ISC
