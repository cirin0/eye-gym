import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const REMINDER_SETTINGS_KEY = 'reminder_settings'
const REMINDER_NOTIFICATION_ID_BASE = 22000

export type ReminderTime = {
  hour: number
  minute: number
}

export type ReminderSettings = {
  enabled: boolean
  timesPerDay: 2 | 3 | 4
  times: ReminderTime[]
}

export function getDefaultReminderSettings(): ReminderSettings {
  return {
    enabled: false,
    timesPerDay: 2,
    times: [
      { hour: 10, minute: 0 },
      { hour: 18, minute: 0 },
    ],
  }
}

function normalizeSettings(settings: ReminderSettings): ReminderSettings {
  const times = [...(settings.times || [])]
    .map((t) => ({
      hour: Math.min(23, Math.max(0, Math.floor(t.hour))),
      minute: Math.min(59, Math.max(0, Math.floor(t.minute))),
    }))
    .slice(0, settings.timesPerDay)

  while (times.length < settings.timesPerDay) {
    times.push({ hour: 12, minute: 0 })
  }

  return {
    enabled: !!settings.enabled,
    timesPerDay: settings.timesPerDay,
    times,
  }
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const { value } = await Preferences.get({ key: REMINDER_SETTINGS_KEY })
  if (!value) return getDefaultReminderSettings()

  try {
    const parsed = JSON.parse(value) as ReminderSettings
    if (!parsed || !parsed.timesPerDay) return getDefaultReminderSettings()
    return normalizeSettings(parsed)
  } catch {
    return getDefaultReminderSettings()
  }
}

export async function setReminderSettings(settings: ReminderSettings): Promise<void> {
  const normalized = normalizeSettings(settings)
  await Preferences.set({
    key: REMINDER_SETTINGS_KEY,
    value: JSON.stringify(normalized),
  })
}

function buildNotificationId(index: number): number {
  return REMINDER_NOTIFICATION_ID_BASE + index
}

export async function cancelReminderNotifications(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    const pending = await LocalNotifications.getPending()
    const notifications = (pending.notifications || []) as Array<{
      id?: number
    }>

    const toCancel = notifications
      .filter((n) => typeof n.id === 'number')
      .filter((n) => (n.id as number) >= REMINDER_NOTIFICATION_ID_BASE)
      .map((n) => ({ id: n.id as number }))

    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel })
    }
  } catch {
    // noop
  }
}

export async function applyReminderSchedule(settings: ReminderSettings): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  const normalized = normalizeSettings(settings)

  // Always reset schedule so edits take effect
  await cancelReminderNotifications()

  if (!normalized.enabled) return

  const perm = await LocalNotifications.requestPermissions()
  if (perm.display !== 'granted') return

  const notifications = normalized.times.map((t, idx) => {
    const id = buildNotificationId(idx)

    return {
      id,
      title: 'Eye Gym',
      body: 'Час зробити вправи для очей',
      schedule: {
        on: {
          hour: t.hour,
          minute: t.minute,
        },
        repeats: true,
      },
      smallIcon: 'ic_stat_notify',
    }
  })

  await LocalNotifications.schedule({ notifications })
}
