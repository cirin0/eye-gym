import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
import '@ionic/vue/css/palettes/dark.class.css'
/* import '@ionic/vue/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css'

const app = createApp(App).use(IonicVue).use(router)

app.config.errorHandler = (err, instance, info) => {
  console.error('Глобальна помилка:', err)
  console.error('Інформація:', info)

  const errorMessage = err instanceof Error ? err.message : 'Невідома помилка'

  setTimeout(() => {
    alert(`Виникла помилка: ${errorMessage}\n\nБудь ласка, спробуйте ще раз.`)
  }, 100)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Необроблене відхилення промісу:', event.reason)
  event.preventDefault()

  const errorMessage =
    event.reason instanceof Error ? event.reason.message : 'Помилка виконання операції'
  setTimeout(() => {
    alert(`Виникла помилка: ${errorMessage}\n\nБудь ласка, спробуйте ще раз.`)
  }, 100)
})

router.isReady().then(() => {
  app.mount('#app')
})
