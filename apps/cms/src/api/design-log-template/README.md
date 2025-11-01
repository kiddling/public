# Design Log Template API

## Overview

Provides structured templates for student design documentation across courses P-04 through P-06.

## API Endpoints

### Get All Templates
```
GET /api/design-log-templates
```

Returns all published templates, sorted by order.

### Filter by Course
```
GET /api/design-log-templates?courseCode=P-04
```

Returns templates for a specific course code.

### Get Single Template
```
GET /api/design-log-templates/:slugOrId
```

Returns a single template by slug (e.g., `p-04-design-log`) or numeric ID.

### Localization
```
GET /api/design-log-templates?locale=zh
```

Returns localized content for the specified locale.

## Response Structure

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "slug": "p-04-design-log",
        "title": "P-04 Design Log Template",
        "description": "Template description",
        "courseCode": "P-04",
        "order": 1,
        "version": "1.0.0",
        "sections": [...],
        "defaultTimelineMilestones": [...],
        "exampleDecisions": [...],
        "helpTips": "<h3>HTML content</h3>",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "publishedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

## Data Structures

### Sections
```typescript
{
  id: string;
  title: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'richtext' | 'list' | 'number';
    placeholder: string;
  }>;
}
```

### Timeline Milestones
```typescript
{
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
}
```

### Example Decisions
```typescript
{
  title: string;
  description: string;
  rationale: string;
  outcome: string;
}
```

## Available Templates

### P-04: User Research & Empathy
- User Research section
- Empathy Mapping section
- Key Insights section
- 4 timeline milestones
- 2 example decisions

### P-05: Ideation & Prototyping
- Ideation section
- Concept Selection section
- Prototyping section
- 4 timeline milestones
- 2 example decisions

### P-06: Testing & Iteration
- Testing Plan section
- Testing Results section
- Iteration Plan section
- Final Design section
- 5 timeline milestones
- 3 example decisions

## Seeding

Templates are automatically seeded on application startup. The seeding process:

1. Checks if template with given slug exists
2. If not found, creates new template with seed data
3. If found, skips to avoid overwriting manual changes

To force re-seed: Delete template in admin panel and restart application.

## Testing

Run tests:
```bash
npm test src/api/design-log-template
```

Tests cover:
- Service methods (getByCourseCode, getBySlug, upsertTemplate)
- Seed functionality
- Schema structure validation
- Content validation

## Development

### Adding New Templates

1. Edit `seed.ts`
2. Add template object to `templates` array
3. Restart application to seed

### Updating Existing Templates

**Via Admin Panel (Recommended):**
1. Navigate to Content Manager → Design Log Templates
2. Edit template
3. Save and publish

**Via Code:**
1. Delete template in admin panel
2. Update `seed.ts`
3. Restart application

## Files

```
design-log-template/
├── content-types/
│   └── design-log-template/
│       └── schema.json          # Content type schema
├── controllers/
│   └── design-log-template.ts   # API endpoints
├── services/
│   └── design-log-template.ts   # Business logic
├── routes/
│   └── design-log-template.ts   # Route definitions
├── __tests__/
│   └── design-log-template.test.ts  # Jest tests
├── seed.ts                      # Seed data
└── README.md                    # This file
```
