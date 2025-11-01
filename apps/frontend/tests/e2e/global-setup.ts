/**
 * Global Setup for E2E Tests
 * Starts the mock Strapi server before running tests
 */

import { StrapiMockServer } from './mocks/strapi-mock-server'

let mockServer: StrapiMockServer

export default async function globalSetup() {
  console.log('[E2E Setup] Starting mock Strapi server...')
  
  const port = parseInt(process.env.E2E_STRAPI_PORT || '3457')
  mockServer = new StrapiMockServer(port)
  
  try {
    await mockServer.start()
    
    // Store server URL in environment for tests
    process.env.E2E_STRAPI_URL = mockServer.url
    
    console.log('[E2E Setup] Mock server ready')
    console.log(`[E2E Setup] Server URL: ${mockServer.url}`)
    
    // Give the server a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
    console.error('[E2E Setup] Failed to start mock server:', error)
    throw error
  }
}
