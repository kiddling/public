import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'

export default defineConfig({
  plugins: [HstVue()],
  
  setupFile: './histoire.setup.ts',
  
  theme: {
    title: '教育平台设计系统',
    logo: {
      square: './public/logo.svg',
      light: './public/logo.svg',
      dark: './public/logo.svg'
    },
    logoHref: '/',
    favicon: './public/favicon.ico'
  },
  
  tree: {
    groups: [
      {
        id: 'base',
        title: '基础组件 (Base Components)'
      },
      {
        id: 'layout',
        title: '布局组件 (Layout Components)'
      }
    ]
  }
})
