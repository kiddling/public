# Student Gallery Module

A comprehensive gallery module for showcasing student work with advanced filtering, lightbox viewing, before/after comparisons, and Strapi CMS integration.

## Features

### Core Functionality
- **Gallery Page**: Displays student works in a responsive grid/masonry layout
- **Advanced Filtering**: Filter by loop (1/2/3), discipline (环艺/产品/视传/数媒/公艺), grade, and search by student name or project title
- **Query Parameters**: Filter selections persist in URL query parameters for sharing and bookmarking
- **Lazy Loading**: Images load as they come into view for optimal performance
- **Responsive Design**: Mobile-first design with touch-friendly interactions

### Lightbox Features
- **Full-Screen Viewing**: View works in a distraction-free lightbox modal
- **Keyboard Navigation**: Use arrow keys to navigate between works, ESC to close
- **Swipe Gestures**: Touch device support for swipe-to-navigate
- **Rich Metadata Display**: Shows title, student name, loop, discipline, grade, year, and description
- **Accessibility**: Full ARIA support and keyboard navigation

### Before/After Comparison
- **Interactive Slider**: Drag slider to compare before and after images
- **Touch Support**: Works seamlessly on touch devices
- **Accessible**: Keyboard and screen reader friendly

### Social Features
- **Shareable Links**: Each work has a unique deep link that opens directly in the lightbox
- **QR Code Generation**: Generate QR codes for easy mobile sharing
- **Download Support**: Download button for permitted works

### Strapi Integration
- Fetch student works from Strapi CMS
- Support for related media, loops, disciplines, grades, and rich descriptions
- Configurable via environment variables

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **API Client**: Axios
- **Image Optimization**: Next.js Image component
- **QR Codes**: qrcode.react
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Strapi backend (optional for development)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd student-gallery
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and set your Strapi URL and token:
```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_TOKEN=your-strapi-token-here
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Strapi Configuration

### Content Type: Student Works

Create a `student-works` collection type in Strapi with the following fields:

- **title** (Text): Project title
- **description** (Rich Text): Project description
- **studentName** (Text): Student's name
- **loop** (Enumeration): 1, 2, 3
- **discipline** (Enumeration): 环艺, 产品, 视传, 数媒, 公艺
- **grade** (Text): Student's grade level
- **year** (Number): Year of creation
- **media** (Media): Project images (multiple)
- **beforeImage** (Media): Before image for comparison
- **afterImage** (Media): After image for comparison
- **allowDownload** (Boolean): Allow downloading
- **allowShare** (Boolean): Allow sharing via QR

### API Permissions

Ensure the following permissions are enabled for public access:
- `find` - To list student works
- `findOne` - To view individual works

## Usage

### Basic Gallery
Visit `/gallery` to see all student works with filtering options.

### Deep Linking
Link to specific works from other modules:
```typescript
// Link to work with ID 123
<Link href="/gallery?work=123">View Project</Link>

// Link with filters applied
<Link href="/gallery?loop=1&discipline=环艺&work=123">View Project</Link>
```

### Programmatic Navigation
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate to gallery with filters
router.push('/gallery?loop=1,2&discipline=环艺');

// Open specific work in lightbox
router.push('/gallery?work=123');
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage
- ✅ Filter logic (parsing, stringifying, toggling)
- ✅ Gallery filter component interactions
- ✅ Before/After slider functionality
- ✅ Lightbox controls and keyboard navigation
- ✅ Metadata display
- ✅ QR code generation

## Performance Optimizations

- **Image Lazy Loading**: Uses Intersection Observer API
- **Next.js Image Optimization**: Automatic image optimization and responsive images
- **Code Splitting**: Automatic route-based code splitting
- **Optimized Bundles**: Tree-shaking and minification in production

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly
- Touch-friendly hit targets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Project Structure

```
student-gallery/
├── app/
│   ├── gallery/
│   │   └── page.tsx          # Main gallery page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── BeforeAfterSlider.tsx  # Before/after comparison component
│   ├── GalleryFilters.tsx     # Filter component
│   ├── GalleryGrid.tsx        # Grid layout component
│   └── Lightbox.tsx           # Lightbox modal component
├── lib/
│   ├── filterUtils.ts         # Filter utility functions
│   └── strapi.ts              # Strapi API client
├── types/
│   └── studentWork.ts         # TypeScript types
├── __tests__/
│   ├── BeforeAfterSlider.test.tsx
│   ├── GalleryFilters.test.tsx
│   ├── Lightbox.test.tsx
│   └── filterUtils.test.ts
└── package.json
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a pull request.
