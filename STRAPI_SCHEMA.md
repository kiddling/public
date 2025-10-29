# Strapi Schema Documentation

This document describes the Strapi schema required for the Knowledge Cards module.

## Collection Type: `knowledge-cards`

### Fields

#### Basic Information
- **title** (Text, required)
  - Short title for the knowledge card
  - Example: "Introduction to Machine Learning"

- **type** (Enumeration, required)
  - Options: "Theory", "Case Study", "Student Work", "AI Prompt", "Extended Thinking"
  - Single select
  - Default: "Theory"

- **description** (Text, required)
  - Long text describing the card content
  - Example: "Learn the fundamentals of machine learning..."

#### Classification
- **tags** (JSON/Array of Strings)
  - Multiple tags for categorization
  - Example: ["ml", "ai", "basics"]

- **loop** (Text, optional)
  - Learning loop identifier
  - Example: "Loop 1"

- **difficulty** (Enumeration, required)
  - Options: "Beginner", "Intermediate", "Advanced"
  - Single select
  - Default: "Beginner"

- **relevance** (Number, optional)
  - Relevance score (0-100)
  - Integer type

#### AI Prompt Specific
- **aiPrompt** (Text, optional)
  - Long text containing the AI prompt
  - Only used when type is "AI Prompt"
  - Example: "You are an educational content expert..."

#### Media Assets
- **media** (Component, repeatable)
  - Component name: `media-asset`
  - Fields:
    - **type** (Enumeration): "image", "video", "pdf"
    - **url** (Text, required): URL to the media file
    - **alt** (Text, optional): Alternative text for accessibility
    - **thumbnail** (Text, optional): Thumbnail URL for videos
    - **isChinaSafe** (Boolean, default: false): Indicates if accessible in China

#### External Resources
- **externalLinks** (Component, repeatable)
  - Component name: `external-link`
  - Fields:
    - **url** (Text, required): Link URL
    - **title** (Text, required): Link display text
    - **isAccessible** (Boolean, default: true): Whether link is accessible
    - **isChinaSafe** (Boolean, default: false): If accessible in China
    - **fallbackText** (Text, optional): Message when not accessible

#### Related Content
- **relatedLessons** (Component, repeatable)
  - Component name: `related-lesson`
  - Fields:
    - **id** (Text, required): Lesson ID
    - **title** (Text, required): Lesson title
    - **slug** (Text, required): URL slug for lesson

- **downloadableAssets** (Component, repeatable)
  - Component name: `downloadable-asset`
  - Fields:
    - **id** (Text, required): Asset unique ID
    - **name** (Text, required): Display name
    - **url** (Text, required): Download URL
    - **type** (Text, required): MIME type (e.g., "application/pdf")
    - **size** (Text, optional): Human-readable size (e.g., "2.4 MB")

## API Endpoints

### List Knowledge Cards
```
GET /api/knowledge-cards
```

Query Parameters:
- `pagination[page]` - Page number (default: 1)
- `pagination[pageSize]` - Items per page (default: 12)
- `populate` - Include relations (use "*" for all)
- `filters[type][$in]` - Filter by type (multiple)
- `filters[tags][$contains]` - Filter by tag (multiple)
- `filters[loop][$in]` - Filter by loop (multiple)
- `filters[difficulty][$in]` - Filter by difficulty (multiple)
- `filters[$or][0][title][$containsi]` - Search in title (case-insensitive)
- `filters[$or][1][description][$containsi]` - Search in description

Response:
```json
{
  "data": [
    {
      "id": "1",
      "title": "...",
      "type": "Theory",
      ...
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "pageCount": 3,
      "total": 30
    }
  }
}
```

### Get Single Knowledge Card
```
GET /api/knowledge-cards/:id
```

Query Parameters:
- `populate` - Include relations (use "*" for all)

Response:
```json
{
  "data": {
    "id": "1",
    "title": "...",
    "type": "Theory",
    ...
  }
}
```

### Get Available Tags
```
GET /api/knowledge-cards?fields[0]=tags
```

### Get Available Loops
```
GET /api/knowledge-cards?fields[0]=loop
```

## Setup Instructions

1. Create the collection type `knowledge-cards` in Strapi admin
2. Add all fields as described above
3. Create the components:
   - `media-asset`
   - `external-link`
   - `related-lesson`
   - `downloadable-asset`
4. Configure permissions for public read access:
   - Go to Settings → Roles → Public
   - Enable `find` and `findOne` for knowledge-cards
5. Populate with sample data or use the mock data provided

## Sample Entry

```json
{
  "title": "Introduction to Machine Learning",
  "type": "Theory",
  "description": "Learn the fundamentals of machine learning including supervised and unsupervised learning algorithms.",
  "tags": ["ml", "ai", "basics"],
  "loop": "Loop 1",
  "difficulty": "Beginner",
  "relevance": 95,
  "media": [
    {
      "type": "image",
      "url": "https://example.com/ml-image.jpg",
      "alt": "Machine Learning Concept",
      "isChinaSafe": true
    }
  ],
  "externalLinks": [
    {
      "url": "https://example.com/ml-guide",
      "title": "ML Beginner Guide",
      "isAccessible": true,
      "isChinaSafe": true
    }
  ]
}
```

## Notes

- All timestamps (createdAt, updatedAt) are automatically managed by Strapi
- Enable draft/publish if you want to control content visibility
- Consider adding an `isPublished` boolean for additional control
- Set up proper CORS configuration if frontend is on a different domain
- Use environment variables for Strapi URL in production
