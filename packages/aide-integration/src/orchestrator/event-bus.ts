import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface AIDEEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

/**
 * Event Bus for AIDE ecosystem communication
 */
export class EventBus {
  private eventSubject = new Subject<AIDEEvent>();

  /**
   * Emit an event
   */
  emit(type: string, payload: any, source: string = 'aide'): void {
    const event: AIDEEvent = {
      type,
      payload,
      timestamp: new Date(),
      source,
    };
    this.eventSubject.next(event);
  }

  /**
   * Subscribe to events of a specific type
   */
  on<T = any>(eventType: string): Observable<T> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === eventType),
      map(event => event.payload as T)
    );
  }

  /**
   * Subscribe to all events from a specific source
   */
  fromSource<T = any>(source: string): Observable<AIDEEvent> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.source === source)
    );
  }

  /**
   * Subscribe to all events
   */
  all(): Observable<AIDEEvent> {
    return this.eventSubject.asObservable();
  }
}

// Global event bus instance
export const globalEventBus = new EventBus();
