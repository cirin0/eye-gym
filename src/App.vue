<template>
  <ion-app>
    <ion-router-outlet :animation="pageTransition" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { getTheme, applyTheme } from '@/services/settings'
import { applyReminderSchedule, getReminderSettings } from '@/services/reminders'
import { useRouter } from 'vue-router'

const router = useRouter()

const pageTransition = (baseEl: any, opts: any) => {
  const transition = router.currentRoute.value.meta.transition
  if (transition && typeof transition === 'function') {
    return transition(baseEl, opts)
  }
  return undefined
}

onMounted(async () => {
  const theme = await getTheme()
  applyTheme(theme)

  const reminderSettings = await getReminderSettings()
  await applyReminderSchedule(reminderSettings)

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  darkModeQuery.addEventListener('change', async () => {
    const currentTheme = await getTheme()
    if (currentTheme === 'system') {
      applyTheme('system')
    }
  })
})
</script>

<style>
/* Додаткові анімації для плавного з'явлення застосунку */
ion-app {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
