import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: [
      "./test/setupFiles/fetch.js"
    ]
  },
})