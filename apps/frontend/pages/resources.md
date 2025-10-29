# Resource Library Module

## Overview

The Resource Library module provides a comprehensive interface for browsing, searching, filtering, and exporting educational resources. It includes accessibility status tracking, QR code generation for mobile access, and export functionality for instructors.

## Features

### 1. Resource Categories
- Video tutorials (视频教程)
- Tool links (工具链接)
- Case databases (案例数据库)
- Readings (阅读材料)
- PBR libraries (PBR资源库)

### 2. Filter Controls
- **Category filter**: Filter by resource type
- **Discipline filter**: Filter by subject area (dynamically populated)
- **Medium filter**: Filter by content type (video, link, PDF, document, interactive, download)
- **Keyword search**: Search in titles, descriptions, and tags with real-time highlighting

### 3. Resource Cards
Each resource card displays:
- Icon with color-coded background based on medium type
- Title with search term highlighting
- Category and medium badges
- Accessibility status badge (已验证/需关注/未知)
- Disciplines tags
- Last checked timestamp
- Actions: Visit resource, View details, Show QR code

### 4. Accessibility Status
- **Verified (已验证)**: Resource has been checked and is accessible
- **Needs Attention (需关注)**: Resource may have access issues
- **Unknown (未知)**: Status has not been determined

Accessibility issues are:
- Visually indicated with color-coded badges
- Accessible via screen reader text with ARIA labels
- Summarized in statistics at the bottom of the page

### 5. QR Code Generation
- QR codes generated client-side (no external CDN dependencies)
- Modal display for easy scanning
- Download functionality for offline use
- Works offline for cached resources

### 6. Detail Modal
Provides comprehensive resource information:
- Full description
- All disciplines and tags
- Link check status and warnings
- Offline instructions
- Attachment download support
- Direct access to resource URL

### 7. Export Functionality
**CSV Export:**
- UTF-8 with BOM for Excel compatibility
- Includes all resource metadata
- Proper escaping of special characters

**PDF Export:**
- Opens print dialog for PDF generation
- Formatted table layout
- Chinese font support
- Color-coded accessibility status

### 8. Performance & Offline Support
- Client-side filtering for fast interaction
- Cached resources work offline
- No blocked CDN usage for assets
- Optimized for performance budget

## API Integration

The module fetches data from Strapi CMS via the `/api/resources` endpoint.

### Expected Strapi Content Type Structure

```typescript
{
  id: number
  title: string
  description: string
  shortDescription?: string
  category: 'video-tutorials' | 'tool-links' | 'case-databases' | 'readings' | 'pbr-libraries'
  medium: 'video' | 'link' | 'pdf' | 'document' | 'interactive' | 'download'
  disciplines?: string[]
  url?: string
  attachmentUrl?: string
  accessibilityStatus: 'verified' | 'needs-attention' | 'unknown'
  lastChecked?: string (ISO date)
  icon?: string
  tags?: string[]
  offlineInstructions?: string
  createdAt: string
  updatedAt: string
}
```

## Components

### ResourceCard.vue
Individual resource card with all metadata and actions.

**Props:**
- `resource`: Resource object
- `searchTerm`: Optional search term for highlighting

**Events:**
- `show-details`: Emit when user clicks details button
- `show-qr`: Emit when user clicks QR code button

### ResourceFilters.vue
Filter sidebar with category, discipline, medium, and search controls.

**Props:**
- `filters`: Current filter state
- `availableDisciplines`: List of available disciplines

**Events:**
- `update:filters`: Emit when filters change

### ResourceDetailModal.vue
Modal showing full resource details.

**Props:**
- `isOpen`: Modal visibility state
- `resource`: Resource to display

**Events:**
- `close`: Emit when modal should close

### ResourceQRModal.vue
Modal showing QR code for mobile access.

**Props:**
- `isOpen`: Modal visibility state
- `resource`: Resource to generate QR code for

**Events:**
- `close`: Emit when modal should close

## Utilities

### utils/qrcode.ts
QR code generation without external dependencies.

### utils/export.ts
CSV and PDF export functionality with proper formatting.

### utils/highlight.ts
Search term highlighting in text.

## Composables

### composables/useResources.ts
Resource fetching and management with Strapi integration.

## Testing

Unit tests provided for:
- Export functions (CSV/PDF generation)
- Search highlighting
- QR code generation
- Filter logic

Run tests:
```bash
pnpm test
```

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support (Escape key closes modals)
- Screen reader friendly status indicators
- Color contrast meets WCAG AA standards
- Focus management in modals

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile, tablet, and desktop
- Dark mode support
- Offline functionality with service workers (when configured)
