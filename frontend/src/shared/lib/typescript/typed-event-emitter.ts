export type EventHandler<Payload> = (payload: Payload) => void

export type TypedEventEmitter<Events extends Record<string, unknown>> = {
  on<K extends keyof Events & string>(
    event: K,
    handler: EventHandler<Events[K]>
  ): void
  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void
  off<K extends keyof Events & string>(
    event: K,
    handler: EventHandler<Events[K]>
  ): void
}

export function createTypedEventEmitter<
  Events extends Record<string, unknown>,
>(): TypedEventEmitter<Events> {
  const buckets: Partial<{
    [K in keyof Events]: Set<EventHandler<Events[K]>>
  }> = {}

  return {
    on(event, handler) {
      let set = buckets[event]
      if (!set) {
        set = new Set()
        buckets[event] = set
      }
      set.add(handler)
    },
    emit(event, payload) {
      const set = buckets[event]
      if (!set) return
      for (const h of set) {
        h(payload)
      }
    },
    off(event, handler) {
      buckets[event]?.delete(handler)
    },
  }
}
