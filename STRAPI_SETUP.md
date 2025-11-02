# Strapi Setup Guide

This document provides detailed instructions for setting up and configuring Strapi to work with this CMS data layer.

## Strapi Content Type Definitions

### 1. Lessons (Collection Type)

Create a collection type named `lesson` with the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| title | Text | Yes | - |
| description | Text (Long) | No | - |
| content | Rich Text | No | - |
| slug | UID | Yes | Target field: title |
| grade | Text | No | - |
| subject | Text | No | - |
| order | Number | No | Integer, Default: 0 |
| duration | Number | No | Integer (minutes) |
| objectives | JSON | No | - |
| materials | JSON | No | - |
| thumbnail | Media | No | Single, Images only |
| knowledgeCards | Relation | No | Many-to-many with knowledge-cards |
| resources | Relation | No | Many-to-many with resources |

### 2. Knowledge Cards (Collection Type)

Create a collection type named `knowledge-card` with the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| title | Text | Yes | - |
| content | Rich Text | Yes | - |
| slug | UID | Yes | Target field: title |
| category | Text | No | - |
| difficulty | Enumeration | No | Values: beginner, intermediate, advanced |
| tags | JSON | No | - |
| order | Number | No | Integer, Default: 0 |
| image | Media | No | Single, Images only |
| relatedCards | Relation | No | Many-to-many (self-relation) |
| lessons | Relation | No | Many-to-many with lessons |

### 3. Student Works (Collection Type)

Create a collection type named `student-work` with the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| title | Text | Yes | - |
| description | Text (Long) | No | - |
| slug | UID | Yes | Target field: title |
| studentName | Text | No | - |
| studentGrade | Text | No | - |
| completionDate | Date | No | - |
| category | Text | No | - |
| featured | Boolean | No | Default: false |
| images | Media | No | Multiple, Images only |
| lesson | Relation | No | Many-to-one with lessons |

### 4. Resources (Collection Type)

Create a collection type named `resource` with the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| title | Text | Yes | - |
| description | Text (Long) | No | - |
| type | Enumeration | Yes | Values: document, video, image, link, other |
| url | Text | No | - |
| slug | UID | Yes | Target field: title |
| category | Text | No | - |
| tags | JSON | No | - |
| file | Media | No | Single, All types |
| lessons | Relation | No | Many-to-many with lessons |

## API Token Setup

### Creating an API Token

1. Log into your Strapi admin panel (usually at `http://localhost:1337/admin`)

2. Navigate to **Settings** → **API Tokens**

3. Click **Create new API Token**

4. Configure the token:
   - **Name**: `cms-data-layer-dev` (or your preferred name)
   - **Description**: Token for CMS data layer development
   - **Token duration**: Unlimited (for development) or set an expiration
   - **Token type**: Choose based on your security requirements:
     - **Read-only**: Recommended for production
     - **Full access**: For development/testing

5. Set permissions for each content type:
   - **Lessons**: `find`, `findOne`
   - **Knowledge Cards**: `find`, `findOne`
   - **Student Works**: `find`, `findOne`
   - **Resources**: `find`, `findOne`

6. Click **Save** and copy the generated token immediately (it won't be shown again)

7. Add the token to your `.env` file:
   ```env
   NUXT_STRAPI_TOKEN=your-copied-token-here
   ```

### Token Security Best Practices

- **Development**: Use a development-specific token with full access
- **Staging**: Use a read-only token with limited permissions
- **Production**: Use a read-only token and rotate it regularly
- **Never commit tokens**: Keep `.env` in `.gitignore`
- **Use different tokens**: Don't share tokens between environments

## Content Type Permissions

### Public Access (No Authentication Required)

If you want to allow public access without requiring authentication:

1. Navigate to **Settings** → **Roles** → **Public**

2. For each content type (`lesson`, `knowledge-card`, `student-work`, `resource`):
   - Enable `find` permission
   - Enable `findOne` permission

3. Save the changes

### Authenticated Access

For authenticated-only access:

1. Keep the Public role permissions disabled
2. Use API tokens as described above
3. The Nuxt app will automatically include the token in all requests

## Example Data

### Sample Lesson (JSON)

```json
{
  "title": "Introduction to Mathematics",
  "description": "Learn the basics of mathematics",
  "content": "<p>This lesson covers fundamental math concepts...</p>",
  "slug": "intro-to-mathematics",
  "grade": "1",
  "subject": "math",
  "order": 1,
  "duration": 45,
  "objectives": [
    "Understand numbers 1-10",
    "Perform basic addition",
    "Recognize number patterns"
  ],
  "materials": [
    "Pencil",
    "Paper",
    "Number cards"
  ]
}
```

### Sample Knowledge Card (JSON)

```json
{
  "title": "Addition Basics",
  "content": "<p>Addition is the process of combining two or more numbers...</p>",
  "slug": "addition-basics",
  "category": "math",
  "difficulty": "beginner",
  "tags": ["math", "addition", "basics"],
  "order": 1
}
```

### Sample Student Work (JSON)

```json
{
  "title": "My First Math Project",
  "description": "A project showcasing understanding of basic addition",
  "slug": "my-first-math-project",
  "studentName": "Zhang Wei",
  "studentGrade": "1",
  "completionDate": "2024-01-15",
  "category": "math",
  "featured": true
}
```

### Sample Resource (JSON)

```json
{
  "title": "Math Practice Worksheet",
  "description": "Printable worksheet with addition problems",
  "type": "document",
  "slug": "math-practice-worksheet",
  "category": "worksheet",
  "tags": ["math", "practice", "addition"]
}
```

## Strapi Configuration for China

### Database Configuration

For production use in China, consider using domestic database services:

```javascript
// config/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'mysql', // or 'postgres'
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
```

### Upload Provider Configuration

For media uploads, use a domestic CDN provider:

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'local', // or configure a domestic provider
      providerOptions: {
        // Provider-specific options
      },
    },
  },
});
```

### CORS Configuration

Ensure CORS is properly configured for your Nuxt app:

```javascript
// config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'https://your-production-domain.com',
      ],
    },
  },
  // ... other middlewares
];
```

## Testing API Endpoints

### Using cURL

Test your Strapi API with curl:

```bash
# Get all lessons
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1337/api/lessons

# Get a single lesson with populated relations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:1337/api/lessons/1?populate=*"

# Search lessons by title
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:1337/api/lessons?filters[title][\$containsi]=math"

# Get paginated results
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:1337/api/lessons?pagination[page]=1&pagination[pageSize]=10"
```

### Using Postman

1. Create a new request
2. Set method to GET
3. Enter URL: `http://localhost:1337/api/lessons`
4. Add header: `Authorization: Bearer YOUR_TOKEN`
5. Send request

## Troubleshooting

### Common Issues

#### 1. 403 Forbidden Error

**Cause**: Insufficient permissions

**Solution**: 
- Check API token permissions
- Verify Public role permissions if not using a token
- Ensure content type permissions are correctly set

#### 2. 401 Unauthorized Error

**Cause**: Invalid or missing API token

**Solution**:
- Verify token is correctly copied to `.env`
- Check token hasn't expired
- Regenerate token if necessary

#### 3. Relation Not Populated

**Cause**: Relations not included in populate parameter

**Solution**:
- Add relation to populate query: `?populate[knowledgeCards]=*`
- Or populate all: `?populate=*`

#### 4. Slow Response Times

**Cause**: Large number of relations or media files

**Solution**:
- Limit populate to only needed relations
- Use pagination for large collections
- Optimize database queries
- Consider caching strategies

## Maintenance

### Regular Tasks

1. **Backup Database**: Schedule regular database backups
2. **Monitor API Usage**: Track API token usage and rate limits
3. **Update Strapi**: Keep Strapi updated to latest stable version
4. **Review Permissions**: Regularly audit API token permissions
5. **Rotate Tokens**: Rotate API tokens periodically for security

### Performance Optimization

1. **Enable Database Indexing**: Add indexes on frequently queried fields (slug, grade, category)
2. **Configure Caching**: Use Redis or similar for caching
3. **Optimize Media**: Compress images and use appropriate formats
4. **Database Connection Pool**: Configure appropriate pool size
5. **Enable Gzip**: Enable gzip compression for API responses

## Additional Resources

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi REST API Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html)
- [Strapi Filters](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html)
- [Strapi Populate](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html)
