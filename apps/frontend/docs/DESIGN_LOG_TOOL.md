# Design Log Tool Documentation

## Overview

The Design Log Tool is an interactive web application that helps users document their design process comprehensively. It provides structured forms for capturing project information, design decisions, iteration history, and reflections.

## Architecture

### Page Structure

- **Route**: `/tools/design-log`
- **Main Page**: `pages/tools/design-log.vue`
- **Layout**: Uses default Nuxt layout with responsive design

### Component Hierarchy

```
pages/tools/design-log.vue (Main Page)
└── DesignLogForm.vue (Main Form Component)
    ├── HelpPopover.vue (Inline help tooltips)
    ├── DesignDecisionList.vue (Dynamic decision entries)
    ├── IterationTimeline.vue (Drag-and-drop timeline)
    └── AttachmentUploader.vue (File upload with preview)
```

## Components

### 1. DesignLogForm.vue

Main form component that orchestrates all sections of the design log.

**Features:**
- Project information section (name, description)
- Design problem statement with word counter
- Integration with all sub-components
- Form validation and error display
- Save status indicators
- Reset functionality

**Props:**
- `tooltips?: Record<string, string>` - Tooltip content from templates

**Interactions:**
- Manages form state through Pinia store
- Validates required fields before submission
- Shows real-time save status

### 2. DesignDecisionList.vue

Manages a dynamic list of design decisions with add/remove functionality.

**Features:**
- Add/remove decision entries dynamically
- Each decision has: title, description, rationale, impact
- Visual indicators for each decision
- Validation error display
- Empty state message

**Props:**
- `decisions: DesignDecision[]` - Array of decisions
- `tooltip?: string` - Help text
- `error?: string` - Validation error message

**Events:**
- `add` - Emitted when adding a new decision
- `update` - Emitted when updating a decision field
- `remove` - Emitted when removing a decision

### 3. IterationTimeline.vue

Interactive timeline component with drag-and-drop reordering using `vue-draggable-next`.

**Features:**
- Drag-and-drop reordering of iterations
- Keyboard navigation (Arrow Up/Down to reorder)
- Version tracking with dates
- Changes description for each iteration
- ARIA labels for accessibility
- Visual drag handle indicator

**Props:**
- `iterations: IterationItem[]` - Array of iterations
- `tooltip?: string` - Help text

**Events:**
- `add` - Emitted when adding a new iteration
- `update` - Emitted when updating an iteration
- `remove` - Emitted when removing an iteration
- `reorder` - Emitted when items are reordered

**Accessibility:**
- Keyboard-accessible drag handles
- Arrow key navigation for reordering
- ARIA labels for screen readers
- Focus management

### 4. AttachmentUploader.vue

File upload component with drag-and-drop support and preview functionality.

**Features:**
- Drag-and-drop file upload
- Click-to-browse file selection
- File type validation (images, PDF)
- Size validation (max 10MB)
- Preview generation for images
- File list display with icons
- Remove attachment functionality

**Props:**
- `attachments: AttachmentFile[]` - Array of attached files
- `tooltip?: string` - Help text

**Events:**
- `add` - Emitted when a file is added
- `remove` - Emitted when a file is removed

**Validation:**
- Accepts: images (all formats), PDF
- Max file size: 10MB per file
- Visual feedback for drag state

### 5. HelpPopover.vue

Inline help component that displays contextual guidance.

**Features:**
- Toggle visibility on click
- Positioned absolutely near the trigger
- Smooth transitions
- Auto-dismiss on blur

**Props:**
- `content: string` - Help text to display
- `ariaLabel?: string` - Accessibility label

## State Management

### Pinia Store: `designLog`

Located at: `stores/designLog.ts`

**State:**
```typescript
{
  projectName: string
  projectDescription: string
  designProblem: string
  decisions: DesignDecision[]
  iterations: IterationItem[]
  reflection: string
  attachments: AttachmentFile[]
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  errors: Record<string, string>
  isDirty: boolean
}
```

**Computed:**
- `wordCount` - Word count for design problem
- `isValid` - Overall form validation status

**Actions:**
- `setProjectInfo()` - Update project details
- `setDesignProblem()` - Update problem statement
- `addDecision()` - Add new decision
- `updateDecision()` - Update existing decision
- `removeDecision()` - Remove decision
- `addIteration()` - Add new iteration
- `updateIteration()` - Update existing iteration
- `removeIteration()` - Remove iteration
- `reorderIterations()` - Reorder timeline items
- `setReflection()` - Update reflection
- `addAttachment()` - Add file attachment
- `removeAttachment()` - Remove attachment
- `validateForm()` - Validate all required fields
- `saveDesignLog()` - Save form data (stub implementation)
- `resetForm()` - Clear all form data
- `loadFromTemplate()` - Load template data

## Data Layer

### Composable: `useDesignLogTemplate`

Located at: `composables/useDesignLogTemplate.ts`

**Functions:**
- `useDesignLogTemplates()` - Fetch all available templates
- `useDesignLogTemplate(id)` - Fetch specific template by ID
- `useDefaultDesignLogTemplate()` - Fetch default template with fallback

**Template Structure:**
```typescript
{
  id: number
  name: string
  description?: string
  projectName?: string
  projectDescription?: string
  designProblem?: string
  exampleDecisions?: Array<{...}>
  exampleIterations?: Array<{...}>
  reflection?: string
  tooltips?: Record<string, string>
  guidance?: string
}
```

**Fallback Template:**
If the Strapi API is unavailable, a built-in fallback template is provided with default tooltips and guidance.

**API Endpoint:**
- Base: `/api/cms/design-log-templates`
- Single: `/api/cms/design-log-templates/{id}`

## Styling

### Approach
- **Tailwind CSS** for all styling
- Dark mode support via `dark:` classes
- Responsive design with mobile-first approach
- Consistent spacing using Tailwind's spacing scale

### Color Scheme
- Primary: Blue (blue-500, blue-600)
- Success: Green (green-500)
- Error: Red (red-500)
- Neutral: Gray scale

### Responsive Breakpoints
- Mobile: default (< 640px)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)

### Design Patterns
- Cards with shadow for content sections
- Rounded corners (rounded-lg, rounded-md)
- Hover states for interactive elements
- Focus rings for accessibility
- Smooth transitions for state changes

## Accessibility

### ARIA Support
- All interactive elements have appropriate ARIA labels
- Form inputs have associated labels
- Error messages are announced
- Loading states are indicated

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space for button activation
- Arrow keys for drag-and-drop reordering
- Escape to close popovers (planned)

### Screen Reader Support
- Semantic HTML elements
- Descriptive button labels
- Status announcements for save operations
- List items properly structured

### Visual Accessibility
- Sufficient color contrast
- Focus indicators on all interactive elements
- Icon + text combinations
- Responsive text sizes

## Validation

### Required Fields
1. Project Name
2. Design Problem Statement
3. At least one Design Decision

### Validation Behavior
- Real-time validation on input
- Error messages display below fields
- Submit button remains enabled (server handles final validation)
- Errors clear when user starts typing

### Error Messages
- Specific, actionable error messages
- Displayed in red with appropriate icons
- Persistent until resolved

## Dependencies

### External Libraries
- `vue-draggable-next` - Drag-and-drop functionality
- `pinia` - State management
- `@nuxtjs/tailwindcss` - Styling

### Nuxt Modules
- `@vueuse/nuxt` - Composable utilities
- `@nuxtjs/color-mode` - Dark mode support

## Testing

### Unit Tests
Located in: `tests/tools/design-log/`

**Test Coverage:**
1. **Component Tests**
   - Form rendering and validation
   - Decision add/remove/update
   - Iteration drag-and-drop
   - Attachment upload

2. **Store Tests**
   - State mutations
   - Computed properties
   - Validation logic

3. **Composable Tests**
   - Template fetching
   - Fallback handling

### Test Framework
- **Vitest** - Test runner
- **@vue/test-utils** - Component testing utilities
- **@nuxt/test-utils** - Nuxt-specific testing helpers

### Mock Strategy
- Strapi API calls are mocked
- Drag-and-drop events are simulated
- File uploads use stub data

## UX Considerations

### Save Status Indicators
- **Idle**: No indicator shown
- **Saving**: Spinning loader + "Saving..." text
- **Saved**: Checkmark icon + "Saved successfully" (auto-dismisses after 3s)
- **Error**: X icon + "Error saving" (persistent)

### Form State Management
- `isDirty` flag tracks unsaved changes
- Reset button confirms before clearing
- Template data only loads if form is clean

### Help System
- Inline help icons (?) next to labels
- Popover with contextual guidance
- Guidance banner at page top

### Empty States
- Friendly messages when no items exist
- Call-to-action buttons prominently displayed
- Icons to reinforce the message

### File Upload UX
- Visual feedback for drag state
- File size/type restrictions clearly stated
- Instant preview for images
- Easy removal of attachments

## Performance

### Optimizations
- Lazy loading of components
- Debounced auto-save (if implemented)
- Efficient reactivity with computed properties
- Minimal re-renders through proper key usage

### Loading States
- Loading spinner while fetching template
- Graceful degradation if API fails
- Fallback template always available

## Future Enhancements

1. **Auto-save**: Implement periodic auto-save to prevent data loss
2. **Export**: Export design log as PDF or markdown
3. **Templates**: Multiple template options
4. **Collaboration**: Share design logs with others
5. **History**: Track changes and revisions
6. **Image Editing**: Basic image annotation tools
7. **Rich Text**: Support formatting in text areas
8. **Analytics**: Track completion rates and common patterns

## Maintenance

### Adding New Fields
1. Update the store interface in `stores/designLog.ts`
2. Add form fields in `DesignLogForm.vue`
3. Update validation logic
4. Add to template structure
5. Update tests

### Modifying Templates
1. Update Strapi content type
2. Modify `DesignLogTemplate` interface
3. Update fallback template
4. Test loading and display

### Styling Updates
1. Use Tailwind classes consistently
2. Test in both light and dark modes
3. Verify responsive behavior
4. Check accessibility contrast

## Troubleshooting

### Common Issues

**Template not loading:**
- Check Strapi API connectivity
- Verify endpoint configuration
- Fallback template should still work

**Drag-and-drop not working:**
- Ensure `vue-draggable-next` is installed
- Check for JavaScript errors
- Verify browser compatibility

**Dark mode issues:**
- Test with `colorMode.preference = 'dark'`
- Verify all `dark:` classes are present
- Check Tailwind config

**Form validation not working:**
- Check store action calls
- Verify error state updates
- Ensure error messages are displayed

## Contact & Support

For questions or issues with the Design Log Tool, please refer to:
- Project README
- Component inline documentation
- Test files for usage examples
