import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import pluginRewriteAll from 'vite-plugin-rewrite-all';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        pluginRewriteAll(),
        Components({
          resolvers: [
            AntDesignVueResolver({
              importLess: true
            })
          ]
        })
    ],
    css: {
      preprocessorOptions: {
        less: {
            javascriptEnabled: true,
            modifyVars: {
              'primary-color': '#0F3542',
              'font-size-base': '14px',
              'text-color': '#444444',
              'font-family': 'Open Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
            }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve('/src')
      }
    }
})
