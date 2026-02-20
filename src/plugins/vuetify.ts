/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        colors: {
          primary: '#ee4c4a',
          secondary: '#0097a7',
        },
      },
      dark: {
        colors: {
          primary: '#ee4c4a',
          secondary: '#0097a7',
        },
      },
    },
  },
})
