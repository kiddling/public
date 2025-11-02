# Course Navigation System

A Vue.js application implementing a comprehensive course navigation system with a three-loop spiral structure, progress tracking, and non-linear learning support.

## Features

- **Multi-level Navigation**: Sidebar/drawer navigation with nested levels (Loop → Part → Lesson)
- **Three-Loop Spiral Visualization**: Interactive SVG visualization showing course structure
- **Progress Tracking**: Local storage-based progress persistence with completion percentage
- **Breadcrumb Navigation**: Dynamic breadcrumb component reflecting current location
- **Search Functionality**: Quick lesson search with keyboard navigation support
- **Mobile Responsive**: Fully responsive with mobile drawer and gesture support
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML
- **Non-linear Navigation**: Random access, deep linking, and quick jump to any lesson

## Tech Stack

- **Vue 3**: Composition API with `<script setup>`
- **Vue Router**: Client-side routing with deep linking support
- **Pinia**: State management for progress tracking
- **Vite**: Fast development and build tooling
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing
- **ESLint & Prettier**: Code quality and formatting

## Project Structure

```
├── src/
│   ├── assets/          # Global styles
│   ├── components/      # Vue components
│   │   ├── AppHeader.vue
│   │   ├── CourseSidebar.vue
│   │   ├── Breadcrumb.vue
│   │   ├── SearchBox.vue
│   │   ├── ProgressIndicator.vue
│   │   ├── LoopSpiralVisualization.vue
│   │   └── LessonCompletion.vue
│   ├── views/           # Page components
│   │   ├── HomeView.vue
│   │   └── LessonView.vue
│   ├── stores/          # Pinia stores
│   │   └── progressStore.js
│   ├── services/        # API/data services
│   │   └── strapiService.js
│   ├── router/          # Vue Router configuration
│   │   └── index.js
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── e2e/             # End-to-end tests
├── DESIGN/              # Design documentation and resources
└── package.json
```

## Design Documentation

Design documents and resources are available in the [DESIGN](./DESIGN) folder. This includes:

- Course design methodology and structure
- Digital design composition curriculum
- Educational approach and teaching plans

See [DESIGN/README.md](./DESIGN/README.md) for more details.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Testing

### Unit Tests
```bash
npm run test:unit
```

### End-to-End Tests
```bash
npm run test:e2e
```

## Course Structure

The course consists of 12 lessons organized across 3 loops:

- **Loop 1** (Blue): Prelude and Part A (4 lessons)
- **Loop 2** (Purple): Part B (4 lessons)
- **Loop 3** (Pink): Part C and Appendix (4 lessons)

Each lesson has:
- Unique code (e.g., L-01, L-02)
- Part code (e.g., P-00, PA-01, PB-02)
- Color-coded indicators
- Progress tracking

## Features in Detail

### Sidebar Navigation
- Collapsible tree structure
- Mobile drawer with overlay
- Color-coded indicators
- Completion checkmarks
- Active lesson highlighting

### Breadcrumb
- Dynamic segments based on current location
- Router integration
- Deep link support

### Loop Visualization
- SVG-based three-loop spiral
- Interactive lesson nodes
- Current lesson highlighting
- Completed lesson indicators
- Click to navigate

### Progress Tracking
- Manual mark as complete/incomplete
- Local storage persistence
- Percentage calculation
- Visual progress bar
- Note about future user accounts

### Search
- Real-time lesson search
- Keyboard navigation (arrow keys)
- Enter to select
- Escape to close
- Accessible with ARIA attributes

## Accessibility

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2021+ features
- CSS Grid and Flexbox

## Future Enhancements

- User accounts for cross-device sync
- Backend integration with Strapi CMS
- Additional lesson content types
- Lesson dependencies and prerequisites
- Learning path recommendations
- Analytics and insights

## License

MIT
