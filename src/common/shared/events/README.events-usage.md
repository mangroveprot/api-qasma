# Activity logging via events (beginner-friendly)

This document explains how we log user actions (login, appointments, etc.) **without** putting logging code inside every service. Even if you're new to events, you can follow the flow below.

---

## 1. The idea in one sentence

**Services only say "this thing happened." A separate listener hears that and writes to the activity log.**

So: **Auth service** never imports `ActivityLogService`. It only emits an event like `auth:login:success`. The **activity-log listener** subscribes to that event and calls `ActivityLogService.logLogin(...)`.

---

## 2. The three pieces

| Piece | Where it lives | What it does |
|-------|----------------|--------------|
| **Event names + payload types** | `common/shared/events/*.events.ts` | Defines what can happen (e.g. `AuthEvents.LOGIN_SUCCESS`) and what data goes with it (e.g. `{ userId }`). |
| **Emit** | Auth / Appointment / User **services** | When something important happens, the service runs `eventBus.emit(EventName, payload)`. No logging code here. |
| **Listen** | `activity-log/listeners/*.listener.ts` | These functions subscribe to events and call `ActivityLogService`. This is the **only** place that ties events to the log. |

---

## 3. Step-by-step flow (example: login)

1. **User logs in** → `AuthService.login()` runs.
2. **AuthService** does its job (check password, create tokens). When it’s done, it runs:
   ```ts
   eventBus.emit(AuthEvents.LOGIN_SUCCESS, { userId: user.idNumber });
   ```
3. **Event bus** delivers that event to everyone who subscribed.
4. **Auth activity listener** (registered at startup) is subscribed to `LOGIN_SUCCESS`. Its handler runs and calls:
   ```ts
   ActivityLogService.logLogin(payload.userId, true, {});
   ```
5. **ActivityLogService** writes a row to the activity log (with IP, userAgent, etc. from request context).

So: **Auth doesn’t know about the log. The listener connects the event to the log.**

---

## 4. Where listeners are registered

All listeners are registered **once**, when the app starts, in **`helpers/init-services.ts`**:

```ts
registerAuthActivityListeners();
registerAppointmentActivityListeners();
registerUserActivityListeners();
```

After that, any time a service emits an event, the right listener runs. No need to register again per request.

---

## 5. What each service emits (quick reference)

**Auth** (`AuthEvents`):  
`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `PASSWORD_CHANGE`, `PASSWORD_RESET_REQUESTED`, `PROFILE_UPDATED`

**Appointment** (`AppointmentEvents`):  
`CREATED`, `RESCHEDULED`, `CANCELLED`, `REMINDER_SENT`

**User** (`UserEvents`):  
`FCM_TOKEN_UPDATED`

Event names and payload types are in:

- `common/shared/events/auth.events.ts`
- `common/shared/events/appointment.events.ts`
- `common/shared/events/user.events.ts`

---

## 6. Adding a new kind of action to the log

1. **Add an event** in the right `*.events.ts` (e.g. a new constant and a payload type).
2. **Emit it** in the service when the action happens: `eventBus.emit(YourEvents.NEW_ACTION, payload)`.
3. **Handle it** in the right listener: `eventBus.on(YourEvents.NEW_ACTION, (payload) => { ... ActivityLogService.... })`.

No need to touch the other services; they stay independent of the log.
