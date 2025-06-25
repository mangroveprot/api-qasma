Here’s the structure for the `/api/appointment/verify` endpoint, which is restricted to **Counselor** roles and verifies an appointment:

---

## `[PUT]` /api/appointment/verify

### Description

Verifies an appointment. This operation is **restricted** and only accessible by users with the `Counselor` role.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the **Counselor** role. If the role is anything other than `Counselor`, the request will be forbidden.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **token**: `string` => required (the token used to verify the appointment)
- **appointmentId**: `string` => required (the unique ID of the appointment to be verified)
- **studentId**: `string` => required (the unique ID of the student associated with the appointment)
- **staffId**: `string` => required (the ID of the staff member associated with the appointment)
- **counselorId**: `string` => required (the ID of the counselor verifying the appointment)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the appointment was successfully verified, `false` otherwise
- **document**: `object` => contains the updated appointment details with the verification status
- **error?**: `object` => optional field that provides error details if the verification fails (e.g., forbidden access, invalid token, appointment not found)

### Example Request

```json
{
  "token": "$2b$10$i4A4XCe3i7Hv9TSlLfPx7evk46EJZ8NGzJdm9SbrZHGBilM3cpDOS",
  "appointmentId": "656baf76-4d9b-4e5b-b3f9-b056746166a2",
  "studentId": "KC-123",
  "staffId": "STAFF001",
  "counselorId": "COUNS001"
}
```
