export interface BaiduLinkPushResult {
  success: boolean
  submitted?: number
  errors?: string[]
  message?: string
}

export const useBaiduLinkPush = () => {
  const config = useRuntimeConfig()

  /**
   * Submit URLs to Baidu Link Push API
   * @param urls - Array of absolute URLs to submit
   * @returns Promise with submission result
   */
  const submitUrls = async (urls: string[]): Promise<BaiduLinkPushResult> => {
    try {
      const result = await $fetch<BaiduLinkPushResult>('/api/baidu/link-push', {
        method: 'POST',
        body: { urls },
      })
      return result
    } catch (error: any) {
      console.error('Failed to submit URLs to Baidu:', error)
      return {
        success: false,
        message: error.message || 'Failed to submit URLs',
        errors: [error.message || 'Unknown error'],
      }
    }
  }

  /**
   * Submit a single URL to Baidu Link Push API
   * @param url - Absolute URL to submit
   * @returns Promise with submission result
   */
  const submitUrl = async (url: string): Promise<BaiduLinkPushResult> => {
    return submitUrls([url])
  }

  /**
   * Generate absolute URLs from relative paths
   * @param paths - Array of relative paths
   * @returns Array of absolute URLs
   */
  const generateAbsoluteUrls = (paths: string[]): string[] => {
    const siteUrl = config.public.siteUrl
    return paths.map(path => {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      return `${siteUrl}${normalizedPath}`
    })
  }

  /**
   * Submit relative paths as absolute URLs
   * @param paths - Array of relative paths (e.g., ['/lessons/abc', '/resources/xyz'])
   * @returns Promise with submission result
   */
  const submitPaths = async (paths: string[]): Promise<BaiduLinkPushResult> => {
    const absoluteUrls = generateAbsoluteUrls(paths)
    return submitUrls(absoluteUrls)
  }

  return {
    submitUrl,
    submitUrls,
    submitPaths,
    generateAbsoluteUrls,
  }
}
