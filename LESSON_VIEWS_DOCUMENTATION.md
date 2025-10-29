# Lesson Views Feature Documentation

## Overview
The lesson views feature provides a comprehensive, interactive learning experience with multi-tier difficulty levels, rich media support, and automatic progress tracking.

## Key Features

### 1. Three-Tier Difficulty System
- **Base**: Essential concepts and foundational knowledge (15-20 min)
- **Advance**: Deeper exploration with practical applications (30-35 min)
- **Stretch**: Independent research and advanced challenges (45-60 min)

**Implementation:**
- `DifficultyToggle.vue`: Persistent toggle component with localStorage
- `DifficultyContent.vue`: Renders content for selected difficulty level
- User preference is saved to `localStorage` key: `preferred_difficulty_level`

### 2. Rich Content Rendering

#### Markdown Support
- `MarkdownRenderer.vue` provides basic markdown parsing
- Supports: Headers (h1-h3), bold text, lists, paragraphs
- In production, consider using `marked` or `markdown-it` library

#### Media Display
- `MediaDisplay.vue` renders videos, diagrams, and images
- Responsive grid layout
- Video thumbnails with play overlay
- Print-friendly (hides videos, preserves images)

#### Attachments
- `AttachmentsList.vue` displays downloadable resources
- File information: title, filename, size
- Download icons and hover effects
- Accessible keyboard navigation

#### Related Resources
- `RelatedResources.vue` shows knowledge cards and external links
- QR code generation for mobile access
- Toggle QR codes on/off
- QR codes auto-visible in print view

### 3. Print-Friendly Layout

**Print Styles Include:**
- Clean layout without navigation elements
- Optimized typography (pt units)
- Page break controls to prevent awkward splits
- Border rendering in black for print
- All essential content preserved
- QR codes automatically shown for resources

**To Print:**
- Use browser's print function (Ctrl/Cmd + P)
- Select portrait or landscape as needed
- Adjust margins for loose-leaf binders

### 4. Progress Tracking

**Auto-Completion:**
- Detects when user scrolls to near end of content (within 100px)
- Automatically marks lesson as complete
- Shows congratulatory notification
- Notification auto-dismisses after 5 seconds

**Manual Control:**
- `LessonCompletion.vue` provides toggle checkbox
- Click to mark complete/incomplete (undo option)
- Progress synced to `progressStore` (Pinia)
- Stored in localStorage key: `course_progress`

### 5. Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly buttons (min 44x44px)
- Collapsible navigation on small screens
- Optimized for tablets and desktops

## Component Architecture

### Main Components

```
LessonView.vue (Main container)
├── DifficultyToggle.vue (Difficulty selector)
├── DifficultyContent.vue (Content for selected level)
│   └── MarkdownRenderer.vue (Markdown parsing)
├── MediaDisplay.vue (Videos, diagrams, images)
├── AttachmentsList.vue (Downloadable resources)
├── RelatedResources.vue (Knowledge cards with QR)
├── LessonCompletion.vue (Manual completion toggle)
└── LoopSpiralVisualization.vue (Course structure)
```

### Data Flow

1. **Route** → `LessonView.vue` receives slug parameter
2. **strapiService.js** → `getLessonContent(lessonId)` fetches lesson data
3. **DifficultyToggle** → Emits `difficulty-changed` event
4. **LessonView** → Updates `currentDifficulty` and re-renders content
5. **Scroll Detection** → `handleScroll()` monitors scroll position
6. **Progress Store** → Updates completion state
7. **localStorage** → Persists preferences and progress

## Usage Examples

### Basic Navigation
```javascript
// Navigate to a lesson
router.push('/lesson/introduction')

// Access lesson data
const lesson = getLessonBySlug('introduction')
const content = getLessonContent(lesson.id)
```

### Difficulty Selection
```javascript
// Programmatically set difficulty
handleDifficultyChange('advance')

// Get current difficulty content
const content = lessonContent.value.difficultyBlocks[currentDifficulty.value]
```

### Progress Tracking
```javascript
// Mark lesson complete
progressStore.markLessonComplete(lessonId)

// Check completion status
const isComplete = progressStore.isLessonComplete(lessonId)

// Get overall progress
const percentage = progressStore.completionPercentage
```

## Testing

### Unit Tests
- `tests/unit/components/DifficultyToggle.test.js`
  - Tests difficulty switching
  - Tests localStorage persistence
  - Tests event emission

- `tests/unit/views/LessonView.test.js`
  - Tests content rendering
  - Tests component integration
  - Tests auto-completion logic
  - Tests notification behavior

### E2E Tests
- `tests/e2e/lesson-view.spec.js`
  - Tests full user workflows
  - Tests difficulty persistence across navigation
  - Tests scroll-to-complete functionality
  - Tests QR code toggles
  - Tests print preview

**Run Tests:**
```bash
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright e2e tests
```

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators on buttons
- Semantic HTML structure
- Screen reader friendly
- High contrast text
- Sufficient touch targets

## Performance Considerations

- Lazy loading for route components
- Efficient scroll event handling with conditional checks
- LocalStorage caching for preferences
- Minimal re-renders with computed properties
- Optimized CSS with scoped styles

## Future Enhancements

1. **Markdown Library**: Replace basic parser with `marked` or `markdown-it`
2. **QR Code Library**: Use `qrcode` or `qrcode.vue` for real QR generation
3. **Video Player**: Integrate proper video player (VideoJS, Plyr)
4. **Code Highlighting**: Add syntax highlighting for code blocks
5. **LaTeX Support**: Math equation rendering
6. **Bookmarks**: Allow users to bookmark specific sections
7. **Notes**: Inline note-taking capability
8. **Search**: Full-text search within lessons
9. **Translations**: i18n support for Chinese localization
10. **Analytics**: Track time spent per difficulty level

## Configuration

### CSS Variables
Customize appearance by modifying CSS variables in `src/assets/main.css`:

```css
--color-loop-1: #3b82f6;  /* Primary blue */
--color-loop-2: #8b5cf6;  /* Purple */
--color-loop-3: #ec4899;  /* Pink */
--color-success: #10b981; /* Green for notifications */
```

### LocalStorage Keys
- `preferred_difficulty_level`: User's difficulty preference
- `course_progress`: Array of completed lesson IDs

### Scroll Detection Threshold
Adjust in `LessonView.vue`:
```javascript
// Current: 100px from bottom
if (scrollTop + clientHeight >= scrollHeight - 100) {
  markLessonAsReached()
}
```

## Troubleshooting

### Difficulty not persisting
- Check browser localStorage is enabled
- Clear localStorage and retry: `localStorage.clear()`

### Auto-completion not triggering
- Ensure content is scrollable (has sufficient height)
- Check scroll event listener is attached
- Verify threshold in `handleScroll()`

### Print layout issues
- Use Chrome/Edge for best print results
- Check print preview before printing
- Adjust margins in print dialog

### Tests failing
- Clear node_modules and reinstall: `npm ci`
- Update snapshots if needed: `npm run test:unit -- -u`
- Check browser binary for e2e: `npx playwright install`

## Support

For issues or questions:
1. Check this documentation
2. Review component source code comments
3. Run tests to verify setup: `npm run test:unit`
4. Check browser console for errors
