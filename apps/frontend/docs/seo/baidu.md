# Baidu SEO Setup Guide

This guide covers setting up and configuring Baidu-specific SEO features for the application.

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Baidu Webmaster Tools Setup](#baidu-webmaster-tools-setup)
4. [Baidu Analytics (百度统计)](#baidu-analytics-百度统计)
5. [Sitemap Configuration](#sitemap-configuration)
6. [Robots.txt Configuration](#robotstxt-configuration)
7. [Link Submission Workflow](#link-submission-workflow)
8. [Cookie Consent Banner](#cookie-consent-banner)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Overview

The Baidu SEO implementation includes:

- **Site Verification**: Automatic injection of Baidu site verification meta tag
- **Analytics**: Baidu Tongji (百度统计) with cookie consent and Umami fallback
- **Sitemap**: Dynamic sitemap generation from Strapi content
- **Robots.txt**: Baidu crawler-specific rules
- **Link Push**: Automated URL submission to Baidu's indexing API
- **Cookie Consent**: GDPR-compliant banner with Chinese localization

## Environment Variables

Configure the following environment variables in your `.env` file:

```bash
# Required: Your site's production URL
NUXT_PUBLIC_SITE_URL=https://yourdomain.com

# Baidu Site Verification (from Baidu Webmaster Tools)
NUXT_PUBLIC_BAIDU_SITE_VERIFICATION=your-verification-code

# Baidu Tongji Analytics ID (from 百度统计)
NUXT_PUBLIC_BAIDU_ANALYTICS_ID=your-analytics-id

# Baidu Link Push Token (server-side only)
NUXT_BAIDU_LINK_PUSH_TOKEN=your-link-push-token

# Optional: Umami Analytics (privacy-friendly fallback)
NUXT_PUBLIC_UMAMI_WEBSITE_ID=your-umami-id
NUXT_PUBLIC_UMAMI_SCRIPT_URL=https://umami.yourdomain.com/script.js
```

## Baidu Webmaster Tools Setup

### 1. Register Your Site

1. Go to [Baidu Webmaster Tools (百度站长平台)](https://ziyuan.baidu.com)
2. Register or log in with your Baidu account
3. Add your website by clicking "添加网站" (Add Website)

### 2. Verify Site Ownership

1. Choose "HTML 标签验证" (HTML Tag Verification)
2. Copy the verification code from the meta tag content attribute
3. Add to your `.env` file:
   ```bash
   NUXT_PUBLIC_BAIDU_SITE_VERIFICATION=your-verification-code
   ```
4. Deploy your site
5. Return to Baidu Webmaster Tools and click "完成验证" (Complete Verification)

### 3. Get Link Push Token

1. In Baidu Webmaster Tools, navigate to "数据引入" → "链接提交" (Data Import → Link Submission)
2. Select "主动推送（实时）" (Active Push - Real-time)
3. Copy the token from the API URL
4. Add to your `.env` file:
   ```bash
   NUXT_BAIDU_LINK_PUSH_TOKEN=your-token
   ```

## Baidu Analytics (百度统计)

### 1. Create Analytics Account

1. Go to [Baidu Tongji (百度统计)](https://tongji.baidu.com)
2. Register or log in
3. Add your website
4. Copy your analytics site ID (the code after `hm.js?` in the tracking code)

### 2. Configure Analytics

Add to your `.env` file:
```bash
NUXT_PUBLIC_BAIDU_ANALYTICS_ID=your-analytics-id
```

The analytics script will:
- Only load after user accepts cookies via the consent banner
- Automatically track page views
- Be available via `window._hmt` for custom event tracking

### 3. Custom Event Tracking

To track custom events:

```javascript
// In any Vue component or page
if (window._hmt) {
  window._hmt.push(['_trackEvent', 'category', 'action', 'label', value])
}
```

## Sitemap Configuration

### Automatic Generation

The sitemap is automatically generated at `/sitemap.xml` and includes:

- Static pages (/, /lessons, /resources, etc.)
- Dynamic routes from Strapi:
  - Lessons (`/lessons/:slug`)
  - Knowledge cards (`/knowledge-cards/:slug`)
  - Resources (`/resources/:slug`)
  - Student works (`/students/:id`)

### Customization

Edit `server/api/__sitemap__/strapi-routes.ts` to:
- Add new content types
- Modify changefreq and priority values
- Add custom routes

### Viewing the Sitemap

Visit `https://yourdomain.com/sitemap.xml` to view the generated sitemap.

## Robots.txt Configuration

### Current Configuration

The robots.txt file allows Baidu crawlers while blocking:
- API endpoints (`/api/`)
- Admin pages (`/admin/`)
- Nuxt internals (`/_nuxt/`)
- Private directories (`/private/`)

### Baidu-Specific Rules

Baiduspider has specific rules including:
- Clean parameters: `ref`, `utm_source`, `utm_medium`, `utm_campaign`

### Customization

The robots.txt file is located in `public/robots.txt`. To customize:
- Edit the file directly to add/remove disallowed paths
- Configure additional user agents
- Adjust crawl delays or add new directives

### Viewing Robots.txt

Visit `https://yourdomain.com/robots.txt` to view the file.

## Link Submission Workflow

### Manual Submission

Use the provided API endpoint to submit URLs:

```typescript
// Using the composable
const { submitPaths } = useBaiduLinkPush()

// Submit relative paths
await submitPaths([
  '/lessons/new-lesson',
  '/resources/new-resource',
])

// Or submit absolute URLs
const { submitUrls } = useBaiduLinkPush()
await submitUrls([
  'https://yourdomain.com/lessons/new-lesson',
])
```

### Automated Submission on Build/Deploy

Create a build hook or deploy script:

```bash
#!/bin/bash
# scripts/submit-to-baidu.sh

# Get all new URLs from your CMS or git diff
NEW_URLS=$(curl https://yourdomain.com/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//')

# Submit to Baidu
curl -X POST https://yourdomain.com/api/baidu/link-push \
  -H "Content-Type: application/json" \
  -d "{\"urls\": $NEW_URLS}"
```

### Rate Limits

- Baidu recommends max 2000 URLs per request
- The API automatically batches URLs in groups of 100
- Implements automatic retries with exponential backoff

### Monitoring

Check submission logs in:
- Server logs (console output)
- Baidu Webmaster Tools → "链接提交" → "主动推送记录"

## Cookie Consent Banner

### Usage

Add the banner component to your app layout:

```vue
<template>
  <div>
    <NuxtPage />
    <CookieConsentBanner />
  </div>
</template>
```

### Customization

Customize the banner text:

```vue
<CookieConsentBanner
  title="我们使用 Cookie"
  message="自定义消息内容"
  accept-text="同意"
  reject-text="拒绝"
/>
```

### Storage

User consent is stored in `localStorage` with key `cookie-consent`:

```json
{
  "accepted": true,
  "timestamp": 1234567890
}
```

## Testing

### Unit Tests

Run the test suite:

```bash
npm run test
```

Tests cover:
- Cookie consent state management
- Sitemap generation
- Robots.txt configuration
- Link push functionality

### Manual Testing

1. **Sitemap Validation**:
   - Visit `/sitemap.xml`
   - Use [Baidu Sitemap Validator](https://ziyuan.baidu.com/linksubmit/index)
   - Verify all routes are present with correct lastmod dates

2. **Robots.txt Validation**:
   - Visit `/robots.txt`
   - Use [Baidu Robots Checker](https://ziyuan.baidu.com/robots/index)
   - Test with different user agents

3. **Analytics**:
   - Open browser DevTools → Network
   - Accept cookies
   - Verify request to `hm.baidu.com`
   - Check Baidu Analytics dashboard for real-time data

4. **Link Push**:
   - Submit test URLs via API
   - Check Baidu Webmaster Tools for submission records
   - Verify success/error responses

## Troubleshooting

### Site Verification Fails

**Problem**: Baidu cannot verify site ownership

**Solutions**:
- Ensure `NUXT_PUBLIC_BAIDU_SITE_VERIFICATION` is set correctly
- Clear CDN/browser cache
- Check that the meta tag appears in page source
- Try alternative verification methods (file upload, DNS)

### Analytics Not Loading

**Problem**: Baidu Tongji script doesn't load

**Solutions**:
- Verify `NUXT_PUBLIC_BAIDU_ANALYTICS_ID` is correct
- Check browser console for errors
- Ensure user has accepted cookies
- Test without ad blockers
- Check if domain is in China (Baidu services may be slow/blocked outside China)

### Sitemap Not Updating

**Problem**: Sitemap doesn't reflect new content

**Solutions**:
- Clear Nuxt cache: `rm -rf .nuxt .output`
- Verify Strapi API is accessible
- Check `NUXT_STRAPI_API_TOKEN` is valid
- Restart development server
- Check server logs for API errors

### Link Push Fails

**Problem**: URLs not accepted by Baidu

**Solutions**:
- Verify `NUXT_BAIDU_LINK_PUSH_TOKEN` is correct
- Ensure `NUXT_PUBLIC_SITE_URL` matches registered domain
- Check URLs are absolute and valid
- Verify site is verified in Webmaster Tools
- Check Baidu Webmaster Tools for quota limits
- Review error messages in server logs

### Cookie Banner Doesn't Show

**Problem**: Consent banner not appearing

**Solutions**:
- Clear localStorage: `localStorage.removeItem('cookie-consent')`
- Check browser console for JavaScript errors
- Verify component is imported in layout
- Ensure client-side rendering

### Robots.txt Not Found

**Problem**: `/robots.txt` returns 404

**Solutions**:
- Verify `nuxt-simple-robots` module is installed
- Check `nuxt.config.ts` has robots configuration
- Restart development server
- In production, verify build includes static files

## Best Practices

### For Better Indexing

1. **Submit sitemap to Baidu**: Use Webmaster Tools to manually submit
2. **Regular updates**: Push new URLs immediately after publishing
3. **Quality content**: Baidu prioritizes original, valuable content in Chinese
4. **Mobile optimization**: Ensure responsive design
5. **Fast loading**: Optimize images and use CDN (preferably China-based)

### For Analytics

1. **Event tracking**: Track important user interactions
2. **Goal setup**: Configure conversion goals in Baidu Tongji
3. **Regular review**: Check analytics weekly
4. **Privacy compliance**: Respect user consent choices

### For Compliance

1. **Cookie consent**: Always respect user choices
2. **Privacy policy**: Update to mention Baidu analytics
3. **ICP license**: Ensure proper licensing for China hosting
4. **Data residency**: Consider where analytics data is stored

## Additional Resources

- [Baidu Webmaster Tools Documentation](https://ziyuan.baidu.com/college/index)
- [Baidu Tongji Help Center](https://tongji.baidu.com/web/help/index)
- [Baidu SEO Guide](https://ziyuan.baidu.com/college/courseinfo?id=267)
- [Sitemap Protocol](https://www.sitemaps.org/)

## Support

For issues or questions:
1. Check this documentation
2. Review server/browser console logs
3. Check Baidu Webmaster Tools error reports
4. Consult Baidu's official documentation
