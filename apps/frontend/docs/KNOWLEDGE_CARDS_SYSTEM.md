# Knowledge Cards System

Complete implementation of the knowledge cards module with filtering, search, and display features.

## Overview

The Knowledge Cards System provides a comprehensive solution for displaying, filtering, and interacting with educational content cards. It supports five different card types, each with unique layouts and features.

## Components

### KnowledgeCard.vue

Base card component that adapts its layout based on card type.

**Props:**
- `card: KnowledgeCard` (required) - The card data
- `clickable: boolean` (default: true) - Whether the card is clickable
- `showMedia: boolean` (default: true) - Display media preview
- `showFooter: boolean` (default: true) - Display footer with actions
- `showCopyButton: boolean` (default: true) - Show copy button for AI prompts
- `showQrButton: boolean` (default: true) - Show QR code button
- `showShareButton: boolean` (default: true) - Show share button

**Events:**
- `@click` - Emitted when card is clicked
- `@show-qr` - Emitted when QR button is clicked
- `@share` - Emitted when share button is clicked

**Usage:**
```vue
<KnowledgeCard
  :card="card"
  @click="handleCardClick"
  @show-qr="showQrModal"
  @share="shareCard"
/>
```

### KnowledgeCardsList.vue

List view component with loading states and pagination.

**Props:**
- `cards: KnowledgeCard[]` (required) - Array of cards to display
- `loading: boolean` - Show loading state
- `hasMore: boolean` - Whether more cards can be loaded
- `skeletonCount: number` (default: 3) - Number of skeleton loaders

**Slots:**
- `empty-action` - Custom action for empty state

**Events:**
- `@card-click` - Card was clicked
- `@show-qr` - QR button was clicked
- `@share` - Share button was clicked
- `@load-more` - Load more button was clicked

**Usage:**
```vue
<KnowledgeCardsList
  :cards="cards"
  :loading="pending"
  :has-more="hasMore"
  @card-click="navigateToCard"
  @load-more="loadMore"
>
  <template #empty-action>
    <button @click="clearFilters">Clear Filters</button>
  </template>
</KnowledgeCardsList>
```

### KnowledgeCardsGrid.vue

Grid/masonry view with responsive columns.

**Props:**
- Same as KnowledgeCardsList
- `columns: 1 | 2 | 3 | 4` (default: 3) - Number of columns

**Usage:**
```vue
<KnowledgeCardsGrid
  :cards="cards"
  :columns="3"
  @card-click="navigateToCard"
/>
```

### KnowledgeCardFilters.vue

Comprehensive filtering and search UI.

**Props:**
- `modelValue: Filters` - Current filter values
- `search: string` - Current search query
- `availableTags: string[]` - Available tags for filtering
- `cardTypes: KnowledgeCardType[]` - Available card types
- `showLoopFilter: boolean` - Show loop filter
- `showDifficultyFilter: boolean` - Show difficulty filter
- `resultCount: number | null` - Number of results
- `debounceMs: number` (default: 300) - Search debounce delay

**Events:**
- `@update:modelValue` - Filters changed
- `@update:search` - Search query changed
- `@filter-change` - Any filter changed

**Usage:**
```vue
<KnowledgeCardFilters
  v-model="filters"
  v-model:search="searchQuery"
  :available-tags="tags"
  :result-count="cards.length"
  @filter-change="handleFilterChange"
/>
```

### KnowledgeCardQrModal.vue

Modal for displaying and downloading QR codes.

**Props:**
- `show: boolean` (required) - Modal visibility
- `card: KnowledgeCard | null` (required) - Card to generate QR for

**Events:**
- `@close` - Modal close requested

**Usage:**
```vue
<KnowledgeCardQrModal
  :show="showQr"
  :card="selectedCard"
  @close="showQr = false"
/>
```

## Card Types

### 1. Theory
- Blue color scheme
- Displays description
- Suitable for educational content

### 2. Case Study
- Green color scheme
- Extended description space
- Good for detailed examples

### 3. Student Work
- Yellow color scheme
- Media gallery support
- Shows image count

### 4. AI Prompt
- Purple color scheme
- Monospace prompt display
- Copy-to-clipboard functionality
- Optimized for AI prompts

### 5. Extended Thinking
- Pink color scheme
- Question/thinking icon
- Designed for thought-provoking content

## Features

### Search Functionality
- Debounced input (300ms default)
- Searches title, description, and prompt text
- Live result count
- Clear button
- Persists in URL query params

### Filtering System
- Filter by card type
- Filter by multiple tags
- Filter by loop (optional)
- Filter by difficulty (optional)
- Combine multiple filters
- Clear individual filters
- URL query param persistence

### QR Code Generation
- Generates QR codes for each card
- Uses card's qrLink or generates from slug
- Copy link to clipboard
- Download QR as PNG
- Responsive modal interface

### Media Support
- Images with lazy loading
- Video previews
- PDF indicators
- Responsive galleries
- Lightbox support (placeholder)

### Share Functionality
- Web Share API when available
- Fallback to clipboard copy
- Shares title, description, and URL

### Print Support
- Optimized print layouts
- Hides interactive elements
- Maintains visual hierarchy
- Print-friendly card grid

## Pages

### Index Page (`/knowledge-cards`)

Main listing page with:
- Grid/List view toggle
- Comprehensive filtering
- Search functionality
- Pagination
- URL state persistence
- Print button

### Detail Page (`/knowledge-cards/[slug]`)

Individual card view with:
- Full card information
- Media gallery
- Metadata display
- Actions (QR, Share, Print)
- Breadcrumb navigation
- Related content placeholder

## Data Integration

### Using the Composable

```typescript
import { useKnowledgeCards } from '~/composables/useKnowledgeCards'

// Basic fetch
const { data, pending, error } = useKnowledgeCards()

// With filters
const { data } = useKnowledgeCards({
  type: 'AI Prompt',
  tags: ['design', 'theory'],
  pagination: {
    page: 1,
    pageSize: 12,
  },
})

// Search
const { data } = useSearchKnowledgeCards(searchQuery.value)

// Featured cards
const { data } = useFeaturedKnowledgeCards()
```

### Filter Structure

```typescript
interface Filters {
  type: KnowledgeCardType | null
  tags: string[]
  loop: string | null
  difficulty: string | null
}
```

## Responsive Design

### Breakpoints
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Wide (xl): 4 columns (when configured)

### Mobile Optimizations
- Touch-friendly buttons
- Collapsible filters
- Responsive typography
- Optimized images

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Color contrast compliant
- Skip links for navigation

## Performance

### Optimizations
- Lazy image loading
- Debounced search
- Request deduplication
- Stale-while-revalidate caching
- Skeleton loading states
- Virtualization ready

### Best Practices
- Minimize re-renders
- Efficient filtering
- URL state management
- Progressive enhancement

## Testing

### Component Tests
- `tests/knowledge-card.spec.ts` - Base card component
- `tests/knowledge-card-filters.spec.ts` - Filter functionality
- `tests/knowledge-card-qr.spec.ts` - QR code generation

### Test Coverage
- Card rendering for all types
- Event emissions
- Filter logic
- QR generation
- Copy functionality
- Accessibility features

## Dependencies

Required packages:
```json
{
  "qrcode": "^1.5.4",
  "@types/qrcode": "^1.5.5"
}
```

## Future Enhancements

Potential improvements:
- [ ] Lightbox for images
- [ ] Infinite scroll option
- [ ] Bookmark/favorite cards
- [ ] Export cards as PDF
- [ ] Related content suggestions
- [ ] Card collections/playlists
- [ ] Advanced search (fuzzy matching)
- [ ] Save filter presets
- [ ] Card analytics
- [ ] Collaborative features

## Troubleshooting

### QR Codes Not Generating
- Check that qrcode package is installed
- Verify card has valid slug or qrLink
- Check browser console for errors

### Filters Not Working
- Verify URL query params are updating
- Check filter values in dev tools
- Ensure CMS API supports filters

### Images Not Loading
- Check media URLs from CMS
- Verify CORS settings
- Check network tab for errors

### Performance Issues
- Reduce pageSize for pagination
- Implement virtual scrolling
- Optimize images at source
- Check for unnecessary re-renders

## Contributing

When adding features:
1. Follow existing component patterns
2. Add TypeScript types
3. Include tests
4. Update documentation
5. Support dark mode
6. Ensure mobile responsiveness
7. Test accessibility
8. Add print styles if relevant
