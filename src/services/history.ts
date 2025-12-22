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
