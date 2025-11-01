export default defineEventHandler(() => {
  const startTime = Date.now()
  const uptime = process.uptime()
  const commitHash = process.env.GIT_COMMIT_HASH || 'unknown'
  
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    commitHash: commitHash.substring(0, 7),
    environment: process.env.NODE_ENV || 'development',
    responseTime: Date.now() - startTime,
  }
})
