import {defineNuxtConfig} from 'nuxt/config';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'description', content: '' },
        { name: 'keywords', content: '' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'stylesheet preload', as: "style", type: "text/css", href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&family=Syne:wght@400;600&display=swap' },
        { rel: 'icon', href: '/favicon.ico' }
      ],
    }
  },
  vite: {
    plugins: [
      Components({
        resolvers: [AntDesignVueResolver({
          importLess: true
        })],
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
            javascriptEnabled: true,
            modifyVars: {
              'primary-color': '#3B3F4D',
              'font-size-base': '14px',
              'text-color': '#1C2E39',
              'font-family': 'Open Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
            }
        }
      }
    },
    ssr: {
      noExternal: ['ant-design-vue'],
    },
  },
})
