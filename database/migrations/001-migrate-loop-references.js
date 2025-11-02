/**
 * Migration script: Convert lesson loop_reference strings to loop relations
 *
 * This script:
 * 1. Creates Loop collection entries from unique loop_reference values
 * 2. Updates Lesson records to reference the new Loop entries
 *
 * Run with: node database/migrations/001-migrate-loop-references.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN

async function fetchFromStrapi(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Strapi API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

async function getAllLessons() {
  console.log('Fetching all lessons...')
  const response = await fetchFromStrapi('/api/lessons?pagination[limit]=1000')
  return response.data || []
}

async function createLoop(title, order = null) {
  console.log(`Creating loop: ${title}`)
  const data = {
    title,
    order,
    publishedAt: new Date().toISOString(),
  }

  const response = await fetchFromStrapi('/api/loops', {
    method: 'POST',
    body: JSON.stringify({ data }),
  })

  return response.data
}

async function updateLesson(lessonId, loopId) {
  console.log(`Updating lesson ${lessonId} with loop ${loopId}`)
  const response = await fetchFromStrapi(`/api/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        loop: loopId,
      },
    }),
  })

  return response.data
}

async function migrateLoopReferences() {
  try {
    console.log('Starting loop reference migration...\n')

    // Fetch all lessons
    const lessons = await getAllLessons()
    console.log(`Found ${lessons.length} lessons\n`)

    // Group lessons by loop_reference
    const loopReferences = new Map()
    for (const lesson of lessons) {
      const loopRef = lesson.attributes?.loop_reference
      if (loopRef) {
        if (!loopReferences.has(loopRef)) {
          loopReferences.set(loopRef, [])
        }
        loopReferences.get(loopRef).push(lesson)
      }
    }

    console.log(`Found ${loopReferences.size} unique loop references\n`)

    // Create Loop entries and update lessons
    const loopMap = new Map()
    let loopOrder = 1

    for (const [loopRef, lessonsInLoop] of loopReferences.entries()) {
      console.log(`\nProcessing loop reference: "${loopRef}" (${lessonsInLoop.length} lessons)`)

      // Create the loop entry
      const loop = await createLoop(loopRef, loopOrder)
      loopMap.set(loopRef, loop)
      loopOrder++

      // Update all lessons with this loop reference
      for (const lesson of lessonsInLoop) {
        await updateLesson(lesson.id, loop.id)
      }

      console.log(`✓ Completed loop: ${loopRef}`)
    }

    console.log('\n✅ Migration completed successfully!')
    console.log(`Created ${loopMap.size} loop entries`)
    console.log(`Updated ${lessons.length} lessons`)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration
migrateLoopReferences()
