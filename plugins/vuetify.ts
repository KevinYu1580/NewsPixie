import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          dark: true,
          colors: {
            'background': '#161616',
            'surface': '#1f1f1f',
            // 'surface-variant': '#2a2a2a',
            'primary': '#9575CD',
            'primary-darken-1': '#7B52AB',
            'secondary': '#2a2a2a',
            'error': '#CF6679',
            'info': '#64B5F6',
            'success': '#4DB6AC',
            'warning': '#FFB74D',
            // 'np-accent': '#9575CD',
            // 'np-surface': '#161616',
            // 'np-card': '#1f1f1f',
            // 'on-background': '#FAFAFA',
            // 'on-surface': '#FAFAFA',
          },
        },
        light: {
          dark: false,
          colors: {
            'background': '#d7d7d7',
            'surface': '#FFFFFF',
            // 'surface-variant': '#F5F5F5',
            'primary': '#7B52AB',
            'primary-darken-1': '#5D3F8A',
            'secondary': '#F0F0F0',
            'error': '#B00020',
            'info': '#1976D2',
            'success': '#388E3C',
            'warning': '#F57C00',
            // 'np-accent': '#7B52AB',
            // 'np-surface': '#F5F5F5',
            // 'np-card': '#FFFFFF',
            // 'on-background': '#0A0A0A',
            // 'on-surface': '#0A0A0A',
          },
        },
      },
    },
    defaults: {
      VCard: { rounded: 'lg' },
      VBtn: { rounded: 'md', variant: 'tonal' },
      VTextField: { rounded: 'md' },
      VChip: { rounded: 'md' },
    },
  })

  app.vueApp.use(vuetify)
})
