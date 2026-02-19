import { EventEmitter } from 'events';

/**
 * Application event bus (in-process).
 *
 * HOW IT WORKS:
 * - Services (auth, appointment, user) only "emit" events when something
 *   important happens—e.g. "user logged in", "appointment created".
 * - Listeners (in activity-log) "subscribe" to those events and react—e.g.
 *   write a row to the activity log.
 *
 * WHY: The service that does the action doesn't need to know who cares about
 * it. Logging, analytics, or notifications can all subscribe to the same
 * event without the service importing them.
 */
class AppEventBus extends EventEmitter {
  private static instance: AppEventBus;

  static getInstance(): AppEventBus {
    if (!AppEventBus.instance) {
      AppEventBus.instance = new AppEventBus();
    }
    return AppEventBus.instance;
  }

  private constructor() {
    super();
    this.setMaxListeners(20);
  }
}

export const eventBus = AppEventBus.getInstance();
