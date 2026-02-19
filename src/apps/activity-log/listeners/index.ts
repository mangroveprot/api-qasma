/**
 * Activity log listeners: subscribe to domain events and write to the log.
 *
 * Each register* function is called once at app startup (see init-services.ts).
 * After that, when any service emits an event, the corresponding listener
 * runs and calls ActivityLogService—so services never import ActivityLogService.
 */
export { registerAuthActivityListeners } from './auth-activity.listener';
export { registerAppointmentActivityListeners } from './appointment-activity.listener';
export { registerUserActivityListeners } from './user-activity.listener';
