import { fromEventPattern, Observable } from 'rxjs'
import { EventDelegator, EventDelegatorOptions, EventHandler } from '@typoerr/event-delegation'

type EventType = keyof HTMLElementEventMap

export interface EventSelector {
  <T extends Event>(type: EventType, opts?: EventDelegatorOptions): Observable<T>
  <T extends Event>(type: string, opts?: EventDelegatorOptions): Observable<T>
  <T extends Event>(type: EventType, sel: string, opts?: EventDelegatorOptions): Observable<T>
  <T extends Event>(type: string, sel: string, opts?: EventDelegatorOptions): Observable<T>
}

export function delegate(target: EventTarget, options?: EventDelegatorOptions): EventSelector {
  const del = new EventDelegator(target, options)
  return function select<T extends Event>(type: string, a: any, b?: any) {
    const [sel, opts] = typeof a === 'string' ? [a, b] : [undefined, b]
    const add = (next: EventHandler) => del.on(type, sel, next, opts)
    const remove = (next: EventHandler) => del.off(type, next, opts)
    return fromEventPattern<T>(add, remove)
  }
}
