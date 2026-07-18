import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          dark: true,
          colors: {
            'background': '#050506',
            'surface': '#0a0a0c',
            'primary': '#5E6AD2',
            'primary-darken-1': '#4C56B8',
            'secondary': '#17171B',
            'error': '#E5686F',
            'info': '#6E9BF0',
            'success': '#4FB8A8',
            'warning': '#E8A552',
            'np-accent': '#5E6AD2',
            'np-surface': '#0a0a0c',
            'on-background': '#EDEDEF',
            'on-surface': '#EDEDEF',
          },
        },
        light: {
          dark: false,
          colors: {
            'background': '#F7F7F8',
            'surface': '#FFFFFF',
            'primary': '#4C56B8',
            'primary-darken-1': '#3D4494',
            'secondary': '#EFEFF2',
            'error': '#C94F57',
            'info': '#3D6FC2',
            'success': '#2E8C7D',
            'warning': '#B87A2E',
            'np-accent': '#4C56B8',
            'np-surface': '#FFFFFF',
            'on-background': '#1A1A1E',
            'on-surface': '#1A1A1E',
          },
        },
      },
    },
    defaults: {
      VCard: { rounded: 'xl', flat: true, border: true },
      VBtn: { rounded: 'lg', variant: 'tonal' },
      VTextField: { rounded: 'lg', variant: 'outlined' },
      VChip: { rounded: 'lg' },
    },
  })

  app.vueApp.use(vuetify)
})
