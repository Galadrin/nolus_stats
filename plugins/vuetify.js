// https://vuetifyjs.com/en/getting-started/installation/#usage
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: true,
    components: {
      ...components,
    },
    directives,
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
      }
    },
    icons: {
      iconfont: 'md',
    },
  })

  nuxtApp.vueApp.use(vuetify)
})