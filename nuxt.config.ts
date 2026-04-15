import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-module-eslint-config',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({ autoImport: true }))
      })
    },
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '@/assets/globals.css',
  ],

  typescript: {
    strict: true,
    shim: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-TW' },
      title: 'NewsPixie — 每日晨間會報',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  imports: {
    presets: [
      {
        from: 'vuetify',
        imports: ['useDisplay'],
      },
    ],
  },

  piniaPersistedstate: {
    storage: 'localStorage',
  },

  runtimeConfig: {
    public: {
      encryptSecret: '',
    },
  },

  compatibilityDate: '2024-11-01',
})
