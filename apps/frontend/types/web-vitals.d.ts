export {}

declare module '#app' {
  interface NuxtApp {
    $webVitals: {
      mark: (name: string) => void
      measure: (name: string, startMark: string, endMark?: string) => PerformanceMeasure | undefined
      getEntries: () => PerformanceEntryList
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $webVitals: {
      mark: (name: string) => void
      measure: (name: string, startMark: string, endMark?: string) => PerformanceMeasure | undefined
      getEntries: () => PerformanceEntryList
    }
  }
}
