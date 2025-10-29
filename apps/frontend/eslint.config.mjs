import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Allow single-word component names for pages (Nuxt convention)
    'vue/multi-word-component-names': ['error', {
      ignores: ['index', 'resources']
    }],
    // Allow v-html for search highlighting (sanitized via highlightText utility)
    'vue/no-v-html': 'off',
  }
})
