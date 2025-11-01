export default {
  async beforeCreate(event: any) {
    validateVideoEmbeds(event.params.data)
  },
  async beforeUpdate(event: any) {
    validateVideoEmbeds(event.params.data)
  },
}

function validateVideoEmbeds(data: any) {
  if (!data.difficulty_specific_fields) {
    return
  }

  const blocks = Array.isArray(data.difficulty_specific_fields)
    ? data.difficulty_specific_fields
    : [data.difficulty_specific_fields]

  for (const block of blocks) {
    if (block.videoEmbeds && Array.isArray(block.videoEmbeds)) {
      for (const embed of block.videoEmbeds) {
        validateVideoEmbed(embed)
      }
    }
  }
}

function validateVideoEmbed(embed: any) {
  const { provider, videoId, videoUrl } = embed

  if (!provider || !videoId) {
    return
  }

  const patterns: Record<string, RegExp> = {
    bilibili: /^[a-zA-Z0-9]+$/,
    tencent: /^[a-zA-Z0-9]+$/,
    youku: /^[a-zA-Z0-9_-]+$/,
  }

  const pattern = patterns[provider]
  if (pattern && !pattern.test(videoId)) {
    throw new Error(
      `Invalid video ID format for provider "${provider}": ${videoId}`
    )
  }

  if (videoUrl) {
    const urlPatterns: Record<string, RegExp> = {
      bilibili: /bilibili\.com/i,
      tencent: /(v\.qq\.com|qq\.com\/x\/cover)/i,
      youku: /youku\.com/i,
    }

    const urlPattern = urlPatterns[provider]
    if (urlPattern && !urlPattern.test(videoUrl)) {
      throw new Error(
        `Video URL does not match provider "${provider}": ${videoUrl}`
      )
    }
  }
}
