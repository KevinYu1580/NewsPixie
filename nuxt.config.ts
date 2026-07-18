import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@nuxtjs/i18n',
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
      title: 'NewsPixie',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh-TW',
    locales: [
      { code: 'zh-TW', language: 'zh-TW', file: 'zh-TW.json', name: '繁中' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'EN' },
    ],
    langDir: 'locales/',
    lazy: true,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'np_locale',
      redirectOn: 'root',
      fallbackLocale: 'zh-TW',
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
    sessionSecret: '',
    rsaPrivateKey: '',
    rsaPublicKey: '',
    public: {
      encryptSecret: '',
      mockMode: '',
    },
  },

  compatibilityDate: '2024-11-01',
})
