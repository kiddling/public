/**
 * Verify E2E Setup Script
 * Checks that all required files exist and are properly configured
 */

import { existsSync } from 'fs'
import { resolve } from 'path'

const requiredFiles = [
  'playwright.config.ts',
  '.env.e2e',
  'tests/e2e/global-setup.ts',
  'tests/e2e/global-teardown.ts',
  'tests/e2e/mocks/strapi-mock-server.ts',
  'tests/e2e/fixtures/lessons.ts',
  'tests/e2e/fixtures/navigation.ts',
  'tests/e2e/fixtures/resources.ts',
  'tests/e2e/fixtures/student-works.ts',
  'tests/e2e/fixtures/design-log-templates.ts',
  'tests/e2e/fixtures/knowledge-cards.ts',
  'tests/e2e/helpers/accessibility.ts',
  'tests/e2e/helpers/performance.ts',
  'tests/e2e/helpers/storage.ts',
  'tests/e2e/helpers/navigation.ts',
  'tests/e2e/specs/smoke.spec.ts',
  'tests/e2e/specs/course-browsing.spec.ts',
  'tests/e2e/specs/progress-tracking.spec.ts',
  'tests/e2e/specs/command-search.spec.ts',
  'tests/e2e/specs/student-gallery.spec.ts',
  'tests/e2e/specs/resource-download.spec.ts',
  'tests/e2e/specs/design-log.spec.ts',
  'tests/e2e/README.md',
  'tests/e2e/CONTRIBUTING.md',
]

console.log('🔍 Verifying E2E test setup...\n')

let allFilesExist = true

for (const file of requiredFiles) {
  const filePath = resolve(process.cwd(), file)
  const exists = existsSync(filePath)

  const status = exists ? '✅' : '❌'
  console.log(`${status} ${file}`)

  if (!exists) {
    allFilesExist = false
  }
}

console.log('\n' + '='.repeat(60))

if (allFilesExist) {
  console.log('✅ All required files exist!')
  console.log('\n📝 Next steps:')
  console.log('  1. Install Playwright browsers: npx playwright install --with-deps')
  console.log('  2. Run tests: pnpm test:e2e')
  console.log('  3. Run in UI mode: pnpm test:e2e:ui')
  process.exit(0)
} else {
  console.log('❌ Some required files are missing!')
  console.log('Please ensure all files are created.')
  process.exit(1)
}
