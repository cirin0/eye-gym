import { Preferences } from '@capacitor/preferences'

const HISTORY_KEY = 'training_history'

export type TrainingStatus = 'completed' | 'stopped'

export type TrainingHistoryEntry = {
  id: string
  startedAt: number
  endedAt: number
  durationSec: number
  totalExercises: number
  completedExercises: number
  status: TrainingStatus
}

function safeParseHistory(value: string | null): TrainingHistoryEntry[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed as TrainingHistoryEntry[]
  } catch {
    return []
  }
}

export async function getTrainingHistory(): Promise<TrainingHistoryEntry[]> {
  const { value } = await Preferences.get({ key: HISTORY_KEY })
  return safeParseHistory(value)
}

export async function addTrainingHistoryEntry(
  entry: TrainingHistoryEntry,
  maxEntries = 100,
): Promise<void> {
  const history = await getTrainingHistory()
  const next = [entry, ...history].slice(0, maxEntries)
  await Preferences.set({ key: HISTORY_KEY, value: JSON.stringify(next) })
}

export async function clearTrainingHistory(): Promise<void> {
  await Preferences.remove({ key: HISTORY_KEY })
}

function dateKeyLocal(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeekMondayLocal(nowTs: number): Date {
  const d = new Date(nowTs)
  const day = (d.getDay() + 6) % 7 // Mon=0..Sun=6
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  start.setDate(start.getDate() - day)
  return start
}

function addDaysLocal(dateKey: string, deltaDays: number): string {
  const [yStr, mStr, dStr] = dateKey.split('-')
  const y = Number(yStr)
  const m = Number(mStr)
  const d = Number(dStr)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + deltaDays)
  return dateKeyLocal(dt.getTime())
}

export function computeTrainingStreak(
  history: TrainingHistoryEntry[],
  nowTs: number = Date.now(),
): number {
  const completed = history.filter((e) => e.status === 'completed')
  if (completed.length === 0) return 0

  const days = new Set<string>()
  for (const e of completed) {
    days.add(dateKeyLocal(e.endedAt || e.startedAt))
  }

  const todayKey = dateKeyLocal(nowTs)
  let cursor = days.has(todayKey) ? todayKey : addDaysLocal(todayKey, -1)

  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor = addDaysLocal(cursor, -1)
  }

  return streak
}

export async function getTrainingStreak(nowTs: number = Date.now()): Promise<number> {
  const history = await getTrainingHistory()
  return computeTrainingStreak(history, nowTs)
}

export type TrainingWeekDayStatus = {
  dateKey: string
  ts: number
  isToday: boolean
  completed: boolean
}

export async function getTrainingWeekStatus(
  nowTs: number = Date.now(),
): Promise<TrainingWeekDayStatus[]> {
  const history = await getTrainingHistory()
  const completed = history.filter((e) => e.status === 'completed')

  const completedDays = new Set<string>()
  for (const e of completed) {
    completedDays.add(dateKeyLocal(e.endedAt || e.startedAt))
  }

  const todayKey = dateKeyLocal(nowTs)
  const start = startOfWeekMondayLocal(nowTs)

  const days: TrainingWeekDayStatus[] = []
  for (let i = 0; i < 7; i++) {
    const dt = new Date(start)
    dt.setDate(dt.getDate() + i)
    const ts = dt.getTime()
    const key = dateKeyLocal(ts)
    days.push({
      dateKey: key,
      ts,
      isToday: key === todayKey,
      completed: completedDays.has(key),
    })
  }

  return days
}
