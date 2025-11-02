import { defineEventHandler, getRequestHeader, setResponseHeaders } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  
  // Get security configuration from runtime config
  const securityConfig = {
    hsts: {
      enabled: config.public.securityHstsEnabled !== 'false',
      maxAge: parseInt(config.public.securityHstsMaxAge || '31536000'),
      includeSubDomains: config.public.securityHstsIncludeSubdomains !== 'false',
      preload: config.public.securityHstsPreload !== 'false',
    },
    csp: {
      enabled: config.public.securityCspEnabled !== 'false',
      directives: {
        defaultSrc: config.public.securityCspDefaultSrc || "'self'",
        scriptSrc: config.public.securityCspScriptSrc || "'self' 'unsafe-inline' 'unsafe-eval'",
        styleSrc: config.public.securityCspStyleSrc || "'self' 'unsafe-inline'",
        imgSrc: config.public.securityCspImgSrc || "'self' data: https:",
        connectSrc: config.public.securityCspConnectSrc || "'self'",
        fontSrc: config.public.securityCspFontSrc || "'self' data:",
        objectSrc: config.public.securityCspObjectSrc || "'none'",
        mediaSrc: config.public.securityCspMediaSrc || "'self'",
        frameSrc: config.public.securityCspFrameSrc || "'none'",
        baseUri: config.public.securityCspBaseUri || "'self'",
        formAction: config.public.securityCspFormAction || "'self'",
        frameAncestors: config.public.securityCspFrameAncestors || "'none'",
        upgradeInsecureRequests: config.public.securityCspUpgradeInsecureRequests !== 'false',
      },
      reportUri: config.public.securityCspReportUri || '',
    },
    xFrameOptions: config.public.securityXFrameOptions || 'DENY',
    referrerPolicy: config.public.securityReferrerPolicy || 'strict-origin-when-cross-origin',
    permissionsPolicy: config.public.securityPermissionsPolicy || 'camera=(), microphone=(), geolocation=()',
    xContentTypeOptions: config.public.securityXContentTypeOptions !== 'false',
    xXssProtection: config.public.securityXXssProtection !== 'false',
    secureCookies: config.public.securitySecureCookies !== 'false',
  }

  // HTTPS enforcement - check X-Forwarded-Proto header
  const proto = getRequestHeader(event, 'x-forwarded-proto')
  const httpsEnforced = config.public.securityEnforceHttps !== 'false'
  
  if (httpsEnforced && proto === 'http' && process.env.NODE_ENV === 'production') {
    const host = getRequestHeader(event, 'host')
    const url = event.node.req.url || '/'
    
    // Redirect to HTTPS
    event.node.res.writeHead(301, {
      Location: `https://${host}${url}`,
    })
    event.node.res.end()
    return
  }

  const headers: Record<string, string> = {}

  // HSTS (HTTP Strict Transport Security)
  if (securityConfig.hsts.enabled) {
    const hstsValue = [
      `max-age=${securityConfig.hsts.maxAge}`,
      securityConfig.hsts.includeSubDomains ? 'includeSubDomains' : '',
      securityConfig.hsts.preload ? 'preload' : '',
    ]
      .filter(Boolean)
      .join('; ')
    
    headers['Strict-Transport-Security'] = hstsValue
  }

  // CSP (Content Security Policy)
  if (securityConfig.csp.enabled) {
    const cspDirectives = [
      `default-src ${securityConfig.csp.directives.defaultSrc}`,
      `script-src ${securityConfig.csp.directives.scriptSrc}`,
      `style-src ${securityConfig.csp.directives.styleSrc}`,
      `img-src ${securityConfig.csp.directives.imgSrc}`,
      `connect-src ${securityConfig.csp.directives.connectSrc}`,
      `font-src ${securityConfig.csp.directives.fontSrc}`,
      `object-src ${securityConfig.csp.directives.objectSrc}`,
      `media-src ${securityConfig.csp.directives.mediaSrc}`,
      `frame-src ${securityConfig.csp.directives.frameSrc}`,
      `base-uri ${securityConfig.csp.directives.baseUri}`,
      `form-action ${securityConfig.csp.directives.formAction}`,
      `frame-ancestors ${securityConfig.csp.directives.frameAncestors}`,
      securityConfig.csp.directives.upgradeInsecureRequests ? 'upgrade-insecure-requests' : '',
    ]
      .filter(Boolean)
      .join('; ')
    
    if (securityConfig.csp.reportUri) {
      headers['Content-Security-Policy'] = `${cspDirectives}; report-uri ${securityConfig.csp.reportUri}`
    } else {
      headers['Content-Security-Policy'] = cspDirectives
    }
  }

  // X-Frame-Options
  headers['X-Frame-Options'] = securityConfig.xFrameOptions

  // Referrer-Policy
  headers['Referrer-Policy'] = securityConfig.referrerPolicy

  // Permissions-Policy
  if (securityConfig.permissionsPolicy) {
    headers['Permissions-Policy'] = securityConfig.permissionsPolicy
  }

  // X-Content-Type-Options
  if (securityConfig.xContentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff'
  }

  // X-XSS-Protection (legacy but still useful for older browsers)
  if (securityConfig.xXssProtection) {
    headers['X-XSS-Protection'] = '1; mode=block'
  }

  // Set all security headers
  setResponseHeaders(event, headers)
})
