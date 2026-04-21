export type LocalAnalyticsKind = 'used' | 'donated'

export interface LocalAnalyticsEvent {
  id: string
  kind: LocalAnalyticsKind
  name: string
  category: string
  foodType: string
  quantity: number
  unit: string
  date: string
}

type NewLocalAnalyticsEvent = Omit<LocalAnalyticsEvent, 'id' | 'date'> &
  Partial<Pick<LocalAnalyticsEvent, 'id' | 'date'>>

const ANALYTICS_STORAGE_KEY = 'pantrypal:analytics-events'

const canUseStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const createEventId = () => `analytics_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

export function getLocalAnalyticsEvents(): LocalAnalyticsEvent[] {
  if (!canUseStorage()) return []

  try {
    const rawEvents = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    if (!rawEvents) return []

    const parsed = JSON.parse(rawEvents)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((event): event is LocalAnalyticsEvent => {
      return (
        event &&
        typeof event.id === 'string' &&
        (event.kind === 'used' || event.kind === 'donated') &&
        typeof event.name === 'string' &&
        typeof event.category === 'string' &&
        typeof event.foodType === 'string' &&
        typeof event.quantity === 'number' &&
        typeof event.unit === 'string' &&
        typeof event.date === 'string'
      )
    })
  } catch {
    return []
  }
}

export function saveLocalAnalyticsEvents(events: LocalAnalyticsEvent[]) {
  if (!canUseStorage()) return
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events))
}

export function addLocalAnalyticsEvent(event: NewLocalAnalyticsEvent) {
  addLocalAnalyticsEvents([event])
}

export function addLocalAnalyticsEvents(events: NewLocalAnalyticsEvent[]) {
  if (!events.length) return

  const existingEvents = getLocalAnalyticsEvents()
  const nextEvents = events.map((event) => ({
    ...event,
    id: event.id ?? createEventId(),
    date: event.date ?? new Date().toISOString(),
  }))

  saveLocalAnalyticsEvents([...existingEvents, ...nextEvents])
}
