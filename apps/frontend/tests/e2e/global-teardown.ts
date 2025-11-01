/**
 * Global Teardown for E2E Tests
 * Stops the mock Strapi server after all tests complete
 */

export default async function globalTeardown() {
  console.log('[E2E Teardown] Cleaning up test environment...')
  
  // The mock server will be stopped when the process exits
  // Additional cleanup can be added here if needed
  
  console.log('[E2E Teardown] Cleanup complete')
}
