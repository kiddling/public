/**
 * Security Headers Middleware
 * 
 * Applies security headers to all server-rendered responses:
 * - HSTS: Force HTTPS connections
 * - CSP: Content Security Policy
 * - X-Frame-Options: Prevent clickjacking
 * - Referrer-Policy: Control referrer information
 * - Permissions-Policy: Control browser features
 * - X-Content-Type-Options: Prevent MIME sniffing
 */

import type { H3Event } from 'h3';

export default defineEventHandler((event: H3Event) => {
  const config = useRuntimeConfig();
  
  // Get CDN URL from environment
  const cdnUrl = config.public.cdnUrl || '';
  const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:1337';
  
  // Extract domain from API URL for CSP
  let apiDomain = "'self'";
  try {
    const url = new URL(apiBaseUrl);
    apiDomain = url.origin;
  } catch (e) {
    // Fallback to self if URL parsing fails
  }
  
  // Build CSP directives
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'${cdnUrl ? ` ${cdnUrl}` : ''}`,
    `style-src 'self' 'unsafe-inline'${cdnUrl ? ` ${cdnUrl}` : ''}`,
    `img-src 'self' data: blob: ${apiDomain}${cdnUrl ? ` ${cdnUrl}` : ''}`,
    `font-src 'self' data:${cdnUrl ? ` ${cdnUrl}` : ''}`,
    `connect-src 'self' ${apiDomain}`,
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ];
  
  const headers = {
    // HTTP Strict Transport Security (HSTS)
    // Force HTTPS for 1 year, including subdomains
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy
    'Content-Security-Policy': cspDirectives.join('; '),
    
    // Prevent the page from being embedded in iframes (clickjacking protection)
    'X-Frame-Options': 'SAMEORIGIN',
    
    // Control how much referrer information is included with requests
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Control which browser features and APIs can be used
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Disable DNS prefetching for privacy
    'X-DNS-Prefetch-Control': 'off',
    
    // Disable client-side caching of sensitive pages
    'Cache-Control': 'no-store, max-age=0',
  };
  
  // Apply headers to response
  Object.entries(headers).forEach(([key, value]) => {
    setResponseHeader(event, key, value);
  });
});
