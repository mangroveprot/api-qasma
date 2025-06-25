## Authentication

- [`[POST] /api/auth/register`](#post-apiauthregister) => register an account
- [`[POST] /api/auth/verify`](#post-apiauthverify) => verify an account
- [`[POST] /api/auth/login`](#post-apiauthlogin) => login to the account
- [`[PATCH] /api/auth/update`](#patch-apiauthupdate) => update user profile
- [`[POST] /api/auth/forgot-password`](#post-apiauthforgot-password) => forgot password
- [`[PATCH] /api/auth/reset-password`](#patch-apiauthreset-password) => reset password
- [`[POST] /api/auth/logout`](#post-apiauthlogout) => logout from the account
- [`[POST] /api/auth/refresh`](#post-apiauthrefresh) => refresh authentication token

---

## User Management

- [`[POST] /api/user/`](#post-apiuser) => create a new user
- [`[GET] /api/user/`](#get-apiuser) => get all users
- [`[GET] /api/user/getProfile/:idNumber`](#get-apiusergetprofileidnumber) => get user profile by ID number
- [`[GET] /api/user/getUserById/:uid`](#get-apiusergetuserbyiduid) => get user by UID
- [`[GET] /api/user/current`](#get-apiusercurrent) => get current user profile

---

## Appointment

- [`[POST] /api/appointment/create`](#post-apiappointmentcreate) => create an appointment
- [`[GET] /api/appointment/`](#get-apiappointment) => get all appointments
- [`[GET] /api/appointment/getById/:appointmentId`](#get-apiappointmentgetbyidappointmentid) => get appointment by ID
- [`[PATCH] /api/appointment/update`](#patch-apiappointmentupdate) => update an appointment
- [`[PATCH] /api/appointment/cancel`](#patch-apiappointmentcancel) => cancel an appointment
- [`[PUT] /api/appointment/accept`](#put-apiappointmentaccept) => accept an appointment
- [`[PUT] /api/appointment/verify`](#put-apiappointmentverify) => verify an appointment

---

## Config

- [`[POST] /api/config/create`](#post-apiconfigcreate) => create a new appointment configuration
- [`[PATCH] /api/config/update`](#patch-apiconfigupdate) => update appointment configuration
- [`[GET] /api/config/`](#patch-apiconfig) => get all appointment configuration

---

## `[POST]` /api/auth/register

### Description

Registers a new user account by accepting user details and returning a confirmation response.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **idNumber**: `string` => required
- **email**: `string` => required
- **password**: `string` => required
- **role**: `string` => required (default: 'student')
- **verified**: `boolean` => not required (default: false)
- **active**: `boolean` => not required (default: false)
- **first_name**: `string` => required
- **last_name**: `string` => required
- **middle_name**: `string` => not required
- **suffix**: `string` => not required
- **gender**: `string` => not required `[accept: male, female, and other]` (default: 'other')
- **date_of_birth**: `date` => required
- **address**: `string` => not required
- **contact_number**: `string` => required
- **facebook**: `string` => not required
- **other_info**: `[object]` => fields is base on the role see in the table below:

---

The `other_info` object will vary depending on the role chosen. Below are the fields for each role:

  <style>
    table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
        }
        th {
           padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
        }
    </style>

<table>
    <tr>
        <th>Role</th>
        <th>Fields</th>
    </tr>
    <tr>
        <td rowspan="1"><strong>student</strong></td>
        <td>
          <ul>
                <li>course: <code>string</code> <span class="highlight">=> required</span></li>
                <li>yearLevel: <code>number</code> <span class="required">=> required</span></li>
                <li>block: <code>string</code><span class="required">=> required</span></li>
            </ul>
    </tr>
    <tr>
    <td rowspan="1"> <string>staff</strong></td>
     <td>
          <ul>
                <li>department: <code>string</code>  <span class="required">=> required</span></li>
                <li>position: <code>string</code>  <span class="required">=> required</span></li>
    <tr>
    <td rowspan="1"> <string>counselor</strong></td>
     <td>
          <ul>
                <li>specialization: <code>string</code> <span class="required">=> required</span></li>
                <li>notAvailableSched: <code>string[]</code>  <span class="required">=> required</span></li>
                <li>roomNumber: <code>string</code> <span class="required">=> required</span></li>
            </ul>
    </tr>
</table>

### Response

The response will contain the following:

- **status**: `boolean` => `true` if registration is successful, `false` otherwise
- **document**: `object` => contains relevant user registration documents or data, if applicable
- **otpResponse**: `object` => response related to OTP validation (could include OTP sent status, expiration time, etc.)
- **error?**: `object` => an optional error field that provides error details if the registration fails (e.g., validation errors, missing fields, etc.)

### Example Request:

```json
{
  "idNumber": "123456789",
  "email": "example@email.com",
  "password": "password123",
  "role": "student",
  "course": "BSIS",
  "block": "B",
  "year_level": 4,
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": "Smith",
  "suffix": "Jr",
  "gender": "other",
  "date_of_birth": "2000-01-01",
  "address": "123 Main St, City, Country",
  "contact_number": "09123456789",
  "facebook": "https://facebook.com/johndoe",
  "course": "BSIS",
  "yearLevel": "4",
  "block": "B",
  "other_info": {
    "course": "BSIS",
    "yearLevel": "4",
    "block": "B"
  }
}
```

If the registration is successful, a verification code will be sent to the registered email. You can then go [`verify`](#post-apiauthverify), which will call the verification API.

[Back to top ↑](#authentication)

---

## `[POST]` /api/auth/verify

### Description

Verifies the account of a user by accepting verification details and returning a confirmation response.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **email**: `string` => required
- **code**: `string` => required

### Response

The response will contain a confirmation of the verification process:

- **status**: `boolean` => `true` if registration is successful, `false` otherwise

### Example Request

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

[Back to top ↑](#authentication)

---

## `[POST]` /api/auth/login

### Description

Logs a user into their account using provided credentials and returns an authentication token.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **idNumber**: `string` => required
- **password**: `string` => required

### Response

The response will contain the following:

- **success**: `boolean` => `true` if login is successful, `false` otherwise
- **document**:

  - **token**: `object` => contains the `accessToken` and `refreshToken`
  - **user**: `object` => the user’s data

- **error?**: `object` => an optional error field that provides error details if the login fails (e.g., incorrect credentials)

### Example Request

```json
{
  "idNumber": "123456789",
  "password": "password123"
}
```

[Back to top ↑](#authentication)

---

## `[PATCH]` /api/auth/update

### Description

Updates the profile of a logged-in user by modifying the user’s details based on the authenticated context.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the role of `Student`,`Staff` or `Counselor`. If the role is anything other than else, the request will be forbidden.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **idNumber**: `string` => required (used to identify the user)
- **email**: `string` => required (used to verify if you are the owner)
- **password**: `string` => requiered
- **role**: `string` => optional (default: 'student')
- **verified**: `boolean` => optional (default: false)
- **active**: `boolean` => optional (default: false)
- **first_name**: `string` => optional
- **last_name**: `string` => optional
- **middle_name**: `string` => optional
- **suffix**: `string` => optional
- **gender**: `string` => optional `[accept: male, female, and other]` (default: 'other')
- **date_of_birth**: `date` => optional
- **address**: `string` => optional
- **contact_number**: `string` => optional
- **facebook**: `string` => optional
- **other_info**: `[object]` => optional, based on the role
  [see here](#post-apiauthregister)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the update is successful, `false` otherwise
- **document**:

  - **user**: `object` => the updated user’s data (e.g., `idNumber`, `email`, `first_name`, etc.)

- **error?**: `object` => an optional error field that provides error details if the update fails (e.g., missing fields, invalid data)

[Back to top ↑](#authentication)

---

## `[POST]` /api/auth/forgot-password

### Description

Sends a password reset code to the user's email to allow them to reset their password. If the reset code is successfully sent, the user will be directed to a password reset page where they can confirm the code and provide a new password.

### Request Payload

The request body must be a JSON object containing one of the following fields:

#### Fields

- **idNumber**: `string` => required

  **OR**

- **email**: `string` => required

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the reset code is sent successfully, `false` otherwise
- **error?**: `object` => optional field that provides error details if there’s a problem with the request (e.g., invalid `idNumber` or `email`, user not found)

### Example Response

```json
{
  "success": true
}
```

If the success is `true`, direct the user to [<u>reset-password</u>](#patch-apiauthreset-password) to confirm the reset verfication code and provide a new password.

[Back to top ↑](#authentication)

---

## `[PATCH]` /api/auth/reset-password

### Description

Resets the password for a user by verifying their email or ID and accepting a new password.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **idNumber**: `string` => required (if using `idNumber`)
- **email**: `string` => required (if using `email`)
- **newPassword**: `string` => required (the new password the user wants to set)
- **code**: `string` => required (the password reset code that was sent to the user)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the password is successfully reset, `false` otherwise
- **error?**: `object` => optional field that provides error details if the reset fails (e.g., invalid code, user not found)

### Example Response

```json
{
  "success": true
}
```

[Back to top ↑](#authentication)

---

## `[POST]` /api/auth/logout

### Description

Logs the user out of their session and invalidates the authentication token.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **accessToken**: `string` => required (the access token of the user)
- **refreshToken**: `string` => required (the refresh token of the user)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the logout is successful, `false` otherwise
- **error?**: `object` => optional field that provides error details if the logout fails (e.g., invalid token, session not found)

### Example Response

```json
{
  "success": true
}
```

[Back to top ↑](#authentication)

---

## `[POST]` /api/auth/refresh

### Description

Refreshes the authentication token for the user to maintain their logged-in state. If the access token expires, a new access token and refresh token will be generated. These two tokens must be stored with every request.

### Request Payload

The request body must be a JSON object containing the following field:

#### Fields

- **refreshToken**: `string` => required (the refresh token of the user)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the token refresh is successful, `false` otherwise
- **token**:

  - **accessToken**: `string` => new access token
  - **refreshToken**: `string` => new refresh token

- **error?**: `object` => optional field that provides error details if the refresh fails (e.g., invalid or expired refresh token)

### Example Request

```json
{
  "refreshToken": "myRefreshToken123456"
}
```

[Back to top ↑](#authentication)

---

## `[POST]` /api/user/

### Description

Creates a new user account by accepting user details and returning a confirmation response. This operation is restricted to users with `Counselor` or `Staff` roles.

### Request Payload

The request body must be a JSON object containing the following fields (similar to the registration process):

#### Fields

- **idNumber**: `string` => required
- **email**: `string` => required
- **password**: `string` => required
- **role**: `string` => required (default: 'student')
- **verified**: `boolean` => not required (default: false)
- **active**: `boolean` => not required (default: false)
- **first_name**: `string` => required
- **last_name**: `string` => required
- **middle_name**: `string` => not required
- **suffix**: `string` => not required
- **gender**: `string` => not required `[accept: male, female, and other]` (default: 'other')
- **date_of_birth**: `date` => required
- **address**: `string` => not required
- **contact_number**: `string` => required
- **facebook**: `string` => not required
- **other_info**: `[object]` => optional, based on the role [see here](#post-apiauthregister)

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the role of `Staff` or `Counselor`. If the role is anything other than `Staff` or `Counselor`, the request will be forbidden.

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the user was created successfully, `false` otherwise
- **document**: `object` => the created user’s data
- **error?**: `object` => optional field that provides error details if the creation fails (e.g., invalid access token, forbidden role)

### Example Request

```json
{
  "idNumber": "KC-A-1234",
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "2000-01-01",
  "contact_number": "09123456789",
  "facebook": "https://facebook.com/johndoe",
  "course": "BSIS",
  "yearLevel": "4",
  "block": "B",
  "other_info": {
    "course": "BSIS",
    "yearLevel": "4",
    "block": "B"
  }
}
```

### Example Response

```json
{
  "success": true,
  "user": {
    "idNumber": "123456789",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
    // ....the rest
  }
}
```

[Back to top ↑](#user-management)

---

## `[GET]` /api/user/

### Description

Fetches a list of all users. This operation is **restricted** and only accessible by users with `Counselor` or `Staff` roles.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the role of `Staff` or `Counselor`. If the role is anything other than `Staff` or `Counselor`, the request will be forbidden.

### Request Parameters

You can use the following query parameters:

- **query**: `object` => optional filter query (e.g., search criteria or conditions)
- **sort**: `object` => optional sorting options (e.g., sort by `createdAt`, `name`, etc.)
- **page**: `number` => required (the page number, default is `1`)
- **limit**: `number` => required (the number of results per page, default is `10`)
- **searchTerm**: `string` => optional search term to filter users (e.g., name, email, etc.)
- **paginate**: `boolean` => required (set to `true` to paginate results)
- **includeDeleted**: `boolean` => optional (set to `true` to include deleted users, `false` to exclude deleted users)

### Example Request

To fetch the first page of users, with 10 results per page, and a search for users with the term "anna", while including deleted users:

```http
GET /api/user/?page=1&limit=10&searchTerm=anna&paginate=true&includeDeleted=true
```

You can also adjust the query parameters like `query` or `sort` as needed.

### Example Response

```json
{
  "success": true,
  "total": 3,
  "_results": 3,
  "results": 3,
  "documents": [
    {
      "_id": "6853a8809da8fa1dd7f7e903",
      "idNumber": "KC-123",
      "email": "student@student.com",
      "role": "student",
      "verified": true,
      "active": true,
      "first_name": "First Name",
      "last_name": "Last Name",
      "gender": "female",
      "date_of_birth": "1990-03-10T00:00:00.000Z",
      "contact_number": "09178889900",
      "address": "Poblacion, Katipunan",
      "facebook": "https://facebook.com/first.last",
      "other_info": {
        "course": "BSIS",
        "yearLevel": "3",
        "section": "marang"
      },
      "deletedAt": "2025-06-20T06:04:03.089Z", // Deleted user
      "createdAt": "2025-06-19T06:04:48.107Z",
      "updatedAt": "2025-06-19T06:04:48.107Z"
    }
  ],
  "page": 1,
  "limit": 10
}
```

NOTE: to make work the `searchTerm`, you must allowed a certain fields like this on the example:

```typescript
class UserService extends BaseService<
  IUserModel,
  UserStudentMongooseRepository
> {
  constructor() {
    this.allowedFilterFields = ['role']; //you can add more here
  }
}
```

[Back to top ↑](#user-management)

---

## `[GET]` /api/user/getProfile/\:idNumber

### Description

Retrieves the user profile associated with a specific ID number. This operation is accessible by users with `Student`, `Staff`, or `Counselor` roles.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the role of `Student`, `Staff`, or `Counselor`. If the role is anything other than `Student`, `Staff`, or `Counselor`, the request will be forbidden.

### Request Parameters

- **idNumber**: `string` => required in the URL path. The ID number of the user whose profile is being requested.

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the request was successful, `false` otherwise
- **document**: `object` => the user's profile details (e.g., `idNumber`, `email`, `first_name`, `last_name`, etc.)
- **error?**: `object` => optional field that provides error details if the request fails (e.g., forbidden access, invalid token)

### Example Request

To fetch the profile of a user with ID number `CNSh-2025-003`:

```http
GET /api/user/getProfile/CNSh-2025-003
```

### Example Response

```json
{
  "success": true,
  "user": {
    "idNumber": "CNSh-2025-003",
    "email": "anna.rjjeyes@jrmsu.edu.ph",
    "role": "student",
    "first_name": "Angelo",
    "last_name": "Reyes",
    "gender": "female",
    "date_of_birth": "1990-03-10T00:00:00.000Z",
    "contact_number": "09178889900",
    "address": "Poblacion, Katipunan",
    "facebook": "https://facebook.com/anna.reyes",
    "other_info": {
      "course": "BSIS",
      "yearLevel": "3",
      "section": "marang"
    },
    "createdAt": "2025-06-19T06:04:03.089Z",
    "updatedAt": "2025-06-24T05:20:20.233Z"
  }
}
```

## `[GET]` /api/user/getUserById/\:uid

### Description

Fetches a user profile by their unique UID (MongoDB `_id`). This operation is **accessible** by users with `Student`, `Staff`, or `Counselor` roles.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the role of `Student`, `Staff`, or `Counselor`. If the role is anything other than `Student`, `Staff`, or `Counselor`, the request will be forbidden.

### Request Parameters

- **uid**: `string` => required in the URL path. The unique MongoDB `_id` of the user whose profile is being requested.

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the request was successful, `false` otherwise
- **user**: `object` => the user's profile details (e.g., `idNumber`, `email`, `first_name`, `last_name`, etc.)
- **error?**: `object` => optional field that provides error details if the request fails (e.g., forbidden access, invalid token, user not found)

### Example Request

To fetch the profile of a user with MongoDB UID `60c72b2f9b1e8b1e2c3a4b5d`:

```http
GET /api/user/getUserById/60c72b2f9b1e8b1e2c3a4b5d
```

### Example Response

```json
{
  "success": true,
  "user": {
    "_id": "60c72b2f9b1e8b1e2c3a4b5d",
    "idNumber": "CNSh-2025-003",
    "email": "anna.rjjeyes@jrmsu.edu.ph",
    "role": "student",
    "first_name": "Angelo",
    "last_name": "Reyes",
    "gender": "female",
    "date_of_birth": "1990-03-10T00:00:00.000Z",
    "contact_number": "09178889900",
    "address": "Poblacion, Katipunan",
    "facebook": "https://facebook.com/anna.reyes",
    "other_info": {
      "course": "BSIS",
      "yearLevel": "3",
      "section": "marang"
    },
    "createdAt": "2025-06-19T06:04:03.089Z",
    "updatedAt": "2025-06-24T05:20:20.233Z"
  },
  "error": null
}
```

[Back to top ↑](#user-management)

---

## `[GET]` /api/user/current

### Description

Retrieves the profile of the currently authenticated user. This operation is available to users with `Counselor`, `Staff`, or `Student` roles.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` is used to identify the currently authenticated user. The system will automatically extract the user's `idNumber` from the `accessToken` and retrieve their profile.

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the request was successful, `false` otherwise
- **document**: `object` => the user's profile details (e.g., `idNumber`, `email`, `first_name`, `last_name`, etc.)
- **error?**: `object` => optional field that provides error details if the request fails (e.g., forbidden access, invalid token, user not found)

### Example Request

To fetch the profile of the currently authenticated user:

```http
GET /api/user/current
Authorization: Bearer your_access_token
```

### Example Response

```json
{
  "success": true,
  "document": {
    "idNumber": "CNSh-2025-003",
    "email": "anna.rjjeyes@jrmsu.edu.ph",
    "role": "student",
    "first_name": "Angelo",
    "last_name": "Reyes",
    "gender": "female",
    "date_of_birth": "1990-03-10T00:00:00.000Z",
    "contact_number": "09178889900",
    "address": "Poblacion, Katipunan",
    "facebook": "https://facebook.com/anna.reyes",
    "other_info": {
      "course": "BSIS",
      "yearLevel": "3",
      "block": "I"
    },
    "createdAt": "2025-06-19T06:04:03.089Z",
    "updatedAt": "2025-06-24T05:20:20.233Z"
  }
}
```

[Back to top ↑](#user-management)

---

## `[POST]` /api/appointment/create

### Description

Creates a new appointment by accepting appointment details and returning a confirmation response. This endpoint is **restricted** to users with the `Student` role.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a **Student**. If the role is anything other than `Student`, the request will be forbidden.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **studentId**: `string` => required (the unique ID of the student creating the appointment)
- **scheduledStartAt**: `date` => required (the start date and time of the appointment, in ISO format)
- **scheduledEndAt**: `date` => required (the end date and time of the appointment, in ISO format)
- **appointmentType**: `string` => required (the type of the appointment, e.g., "Consultation", "Advising")
- **appointmentCategory**: `string` => required (the category of the appointment, e.g., "Academic", "Career")

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the appointment was successfully created, `false` otherwise
- **document**: `object` => contains the details of the newly created appointment (e.g., `studentId`, `scheduledStartAt`, `scheduledEndAt`, `appointmentType`, etc.)
- **error?**: `object` => optional field that provides error details if the appointment creation fails (e.g., forbidden access, invalid token, missing fields)

### Example Request

```json
{
  "studentId": "123456789",
  "scheduledStartAt": "2025-06-28T10:00:00.000Z",
  "scheduledEndAt": "2025-06-28T11:00:00.000Z",
  "appointmentType": "IQ Test",
  "appointmentCategory": "Testing"
}
```

[Back to top ↑](#appointment)

---

## `[GET]` /api/appointment/

### Description

Fetches a list of all appointments. This operation is **restricted** and only accessible by users with `Counselor` or `Staff` roles.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the role of `Counselor` or `Staff`. If the role is anything other than `Counselor` or `Staff`, the request will be forbidden.

### Request Parameters

You can use the following query parameters:

- **query**: `object` => optional filter query (e.g., search criteria or conditions for appointments)
- **sort**: `object` => optional sorting options (e.g., sort by `scheduledStartAt`, `createdAt`, etc.)
- **page**: `number` => required (the page number, default is `1`)
- **limit**: `number` => required (the number of results per page, default is `10`)
- **searchTerm**: `string` => optional search term to filter appointments (e.g., appointment type, student name)
- **paginate**: `boolean` => required (set to `true` to paginate results)
- **includeCanceled**: `boolean` => optional (set to `true` to include canceled appointments, `false` to exclude canceled appointments)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the request was successful, `false` otherwise
- **total**: `number` => total number of appointments
- **\_results**: `number` => total results returned for the current query
- **results**: `number` => the actual number of appointments in the current page
- **documents**: `array` => list of appointment documents (appointment details)
- **page**: `number` => the current page number
- **limit**: `number` => the number of results per page
- **error?**: `object` => optional field that provides error details if the request fails

### Example Request

To fetch the first page of appointments, with 10 results per page, and a search for appointments with the term "Consultation":

```http
GET /api/appointment/?page=1&limit=10&searchTerm=Consultation&paginate=true
Authorization: Bearer your_access_token
```

### Example Response

```json
{
  "success": true,
  "total": 5,
  "_results": 5,
  "results": 5,
  "documents": [
    {
      "appointmentId": "appointment12345",
      "studentId": "123456789",
      "scheduledStartAt": "2025-06-28T10:00:00.000Z",
      "scheduledEndAt": "2025-06-28T11:00:00.000Z",
      "appointmentType": "Consultation",
      "appointmentCategory": "Academic",
      "createdAt": "2025-06-20T08:00:00.000Z",
      "updatedAt": "2025-06-21T10:00:00.000Z"
    },
    {
      "appointmentId": "appointment67890",
      "studentId": "987654321",
      "scheduledStartAt": "2025-06-28T12:00:00.000Z",
      "scheduledEndAt": "2025-06-28T13:00:00.000Z",
      "appointmentType": "Advising",
      "appointmentCategory": "Career",
      "createdAt": "2025-06-20T09:00:00.000Z",
      "updatedAt": "2025-06-21T11:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10
}
```

NOTE: to make work the `searchTerm`, you must allowed a certain fields like this on the example:

- [<u>`see here`</u>](#get-apiuser)

[Back to top ↑](#appointment)

---

## `[GET]` /api/appointment/getById/\:appointmentId

### Description

Retrieves appointment details by the given appointment ID. This endpoint is accessible by all users.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The **accessToken** must be valid, but this endpoint is open to users of all roles (e.g., **Student**, **Staff**, **Counselor**).

### Request Parameters

- **appointmentId**: `string` => required in the URL path. The unique ID of the appointment whose details are being requested.

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the request was successful, `false` otherwise
- **document**: `object` => contains the details of the requested appointment (e.g., `studentId`, `scheduledStartAt`, `scheduledEndAt`, `appointmentType`, etc.)
- **error?**: `object` => optional field that provides error details if the request fails (e.g., appointment not found, invalid token)

### Example Request

To fetch the details of an appointment with ID `appointment12345`:

```http
GET /api/appointment/getById/appointment12345
Authorization: Bearer your_access_token
```

### Example Response

```json
{
  "success": true,
  "document": {
    "appointmentId": "appointment12345",
    "studentId": "123456789",
    "scheduledStartAt": "2025-06-28T10:00:00.000Z",
    "scheduledEndAt": "2025-06-28T11:00:00.000Z",
    "appointmentType": "Consultation",
    "appointmentCategory": "Academic",
    "createdAt": "2025-06-20T08:00:00.000Z",
    "updatedAt": "2025-06-21T10:00:00.000Z"
  }
}
```

Here’s the updated version for the `/api/appointment/update` endpoint, reflecting that most fields are optional except for the appointment ID:

---

## `[PATCH]` /api/appointment/update

### Description

Updates an existing appointment by accepting new details and returning a confirmation response. The `appointmentId` is required for the update, while other fields are optional.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a valid user. This operation can be accessible by users with appropriate roles, typically **Staff** or **Counselor**.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Required Field

- **appointmentId**: `string` => required (the unique ID of the appointment to be updated)

- **studentId**: `string` => required (the unique ID of the student)
- **scheduledStartAt**: `date` => optional (the start date and time of the appointment)
- **scheduledEndAt**: `date` => optional (the end date and time of the appointment)
- **appointmentCategory**: `string` => optional (the category of the appointment, e.g., "Academic", "Career")
- **appointmentType**: `string` => optional (the type of appointment, e.g., "Consultation", "Advising")
- **description**: `string` => optional (a detailed description of the appointment)
- **status**: `string` => optional (default: `pending`, can be `approved`, `cancelled`, etc.)
- **checkInStatus**: `string` => optional (default: `not-checked-in`, can be `checked-in`, `not-checked-in`)
- **checkInTime**: `date` => optional (the date and time the student checked in)
- **staffId**: `string` => optional (the ID of the staff member handling the appointment)
- **counselorId**: `string` => optional (the ID of the counselor for the appointment)
- **qrCode**: `object` => optional (contains the QR code token and scanned details)

  - **token**: `string` => the token associated with the QR code (default: `null`)
  - **scannedById**: `string` => ID of the person who scanned the QR code (default: `null`)
  - **scannedAt**: `date` => the date and time when the QR code was scanned (default: `null`)

- **cancellation**: `object` => optional (cancellation details)

  - **cancelledById**: `string` => ID of the person who cancelled the appointment (default: `null`)
  - **reason**: `string` => reason for cancellation (default: `null`)
  - **cancelledAt**: `date` => the date and time of cancellation (default: `null`)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the appointment was updated successfully, `false` otherwise
- **document**: `object` => contains the updated appointment details
- **error?**: `object` => optional field that provides error details if the update fails (e.g., invalid token, missing fields)

### Example Request

```json
{
  "appointmentId": "appointment12345",
  "scheduledStartAt": "2025-06-28T10:00:00.000Z",
  "scheduledEndAt": "2025-06-28T11:00:00.000Z",
  "appointmentCategory": "Academic",
  "appointmentType": "Consultation",
  "description": "Student needs academic advising",
  "status": "pending",
  "checkInStatus": "not-checked-in",
  "staffId": "staff123",
  "counselorId": "counselor456",
  "qrCode": {
    "token": "abcd1234",
    "scannedById": "staff123",
    "scannedAt": "2025-06-28T09:30:00.000Z"
  },
  "cancellation": {
    "cancelledById": "123",
    "reason": null,
    "cancelledAt": "2025-06-28T09:30:00.000Z"
  }
}
```

[Back to top ↑](#appointment)

---

## `[PATCH]` /api/appointment/cancel

### Description

Cancels an existing appointment by updating the appointment status to "cancelled" and recording the cancellation details.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a valid user. Typically, **Staff**, **Counselors** and **Student** should have permission to cancel appointments, but the specific roles and permissions can be defined as needed.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **appointmentId**: `string` => required (the unique ID of the appointment to be canceled)
- **status**: `string` => required, should be set to `"cancelled"`
- **cancellation**: `object` => required (cancellation details)

  - **cancelledById**: `string` => required (the ID of the person who is canceling the appointment)
  - **reason**: `string` => required (the reason for canceling the appointment)
  - **cancelledAt**: `date` => required (the date and time when the appointment was canceled)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the appointment was successfully canceled, `false` otherwise
- **document**: `object` => contains the updated appointment details after cancellation
- **error?**: `object` => optional field that provides error details if the cancellation fails (e.g., invalid token, appointment not found, etc.)

### Example Request

```json
{
  "appointmentId": "3ce59831-8f61-40f2-9407-922dc4d486e9",
  "status": "cancelled",
  "cancellation": {
    "cancelledById": "ffd34",
    "reason": "ambot",
    "cancelledAt": "2025-06-19T15:00:00.000Z"
  }
}
```

### Example Response

```json
{
  "success": true,
  "appointment": {
    "appointmentId": "3ce59831-8f61-40f2-9407-922dc4d486e9",
    "status": "cancelled",
    "cancellation": {
      "cancelledById": "ffd34",
      "reason": "ambot",
      "cancelledAt": "2025-06-19T15:00:00.000Z"
    },
    "studentId": "123456789",
    "scheduledStartAt": "2025-06-28T10:00:00.000Z",
    "scheduledEndAt": "2025-06-28T11:00:00.000Z",
    "appointmentCategory": "Academic",
    "appointmentType": "Consultation",
    "description": "Student needs academic advising",
    "checkInStatus": "not-checked-in",
    "staffId": "staff123",
    "counselorId": "counselor456",
    "createdAt": "2025-06-20T08:00:00.000Z",
    "updatedAt": "2025-06-21T10:00:00.000Z"
  }
}
```

## `[PUT]` /api/appointment/accept

### Description

Accepts an appointment. This operation is **restricted** and only accessible by users with the `Staff` role.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a user with the **Staff** role. If the role is anything other than `Staff`, the request will be forbidden.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **appointmentId**: `string` => required (the unique ID of the appointment to be accepted)
- **studentId**: `string` => required (the unique ID of the student)
- **status**: `string` => required (set to `"accepted"`)
- **staffId**: `string` => required (the ID of the staff member accepting the appointment)
- **counselorId**: `string` => required (the ID of the counselor for the appointment)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the appointment was successfully accepted, `false` otherwise
- **appointment**: `object` => contains the updated appointment details with the new status and staff/counselor information
- **error?**: `object` => optional field that provides error details if the accept action fails (e.g., invalid token, appointment not found)

### Example Request

```json
{
  "appointmentId": "656baf76-4d9b-4e5b-b3f9-b056746166a2",
  "studentId": "KC-123",
  "status": "accepted",
  "staffId": "STAFF001",
  "counselorId": "COUNS001"
}
```

[Back to top ↑](#appointment)

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

[Back to top ↑](#appointment)

---

## `[POST]` /api/config/create

### Description

Creates a new appointment configuration. This operation is **restricted** to **Counselor** roles and ensures that only one configuration exists. If a configuration already exists, it will return a **forbidden** response and require an update instead.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a **Counselor** role. If the role is anything other than `Counselor`, the request will be forbidden.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **session_duration**: `number` => required (the duration of each appointment session in minutes)
- **bufferTime**: `number` => required (the buffer time between appointments in minutes)
- **reminders**: `array` => required (an array of reminder times in minutes before the appointment starts, e.g., `[15, 30]` for reminders 15 and 30 minutes before)
- **categoryAndType**: `object` => required (a map of appointment categories and types, where keys are categories and values are arrays of appointment types)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the configuration was successfully created, `false` otherwise
- **document**: `object` => contains the create config details
- **error?**: `object` => optional field that provides error details if the creation fails (e.g., forbidden access, existing configuration)

### Example Request

```json
{
  "session_duration": 30,
  "bufferTime": 15,
  "reminders": ["15", "30"],
  "categoryAndType": {
    "Academic": ["Consultation", "Advising"],
    "Career": ["Counseling", "Guidance"]
  }
}
```

[Back to top ↑](#config)

---

## `[PATCH]` /api/config/update

### Description

Updates the appointment configuration. This operation is **restricted** to **Counselor** roles.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a **Counselor** role. If the role is anything other than `Counselor`, the request will be forbidden.

### Request Payload

The request body must be a JSON object containing the following fields:

#### Fields

- **configId**: `string` => required (the unique ID of the existing configuration to update)
- **session_duration**: `number` => optional (the duration of each appointment session in minutes)
- **bufferTime**: `number` => optional (the buffer time between appointments in minutes)
- **reminders**: `array` => optional (an array of reminder times in minutes before the appointment starts, e.g., `[15, 30]` for reminders 15 and 30 minutes before)
- **categoryAndType**: `object` => optional (a map of appointment categories and types, where keys are categories and values are arrays of appointment types)

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the configuration was successfully updated, `false` otherwise
- **document**: `object` => contains the updated appointment configuration details
- **error?**: `object` => optional field that provides error details if the update fails (e.g., forbidden access, no existing configuration)

### Example Request

```json
{
  "configId": "1234567890abcdef",
  "session_duration": 45,
  "bufferTime": 10,
  "reminders": ["15", "30", "60"],
  "categoryAndType": {
    "Academic": ["Consultation", "Advising"],
    "Career": ["Counseling", "Guidance"]
  }
}
```

### Example Response

```json
{
  "success": true,
  "document": {
    "configId": "1234567890abcdef",
    "session_duration": 45,
    "bufferTime": 10,
    "reminders": ["15", "30", "60"],
    "categoryAndType": {
      "Academic": ["Consultation", "Advising"],
      "Career": ["Counseling", "Guidance"]
    },
    "createdAt": "2025-06-20T08:00:00.000Z",
    "updatedAt": "2025-06-25T10:00:00.000Z"
  },
  "error": null
}
```

[Back to top ↑](#config)

---

## `[GET]` /api/config/

Here’s the structure for the `/api/config/` endpoint that allows **Counselors** to get all appointment configurations:

---

## `[GET]` /api/config/

### Description

Fetches all appointment configurations. This operation is **restricted** and only accessible by users with the `Counselor` role.

### Authorization

This endpoint requires a **Bearer Token** in the request header. The token should be provided as follows:

```http
Authorization: Bearer {accessToken}
```

The `accessToken` must correspond to a **Counselor** role. If the role is anything other than `Counselor`, the request will be forbidden.

### Response

The response will contain the following:

- **success**: `boolean` => `true` if the request was successful, `false` otherwise
- **document**: `object` => an object of appointment configurations
- **error?**: `object` => optional field that provides error details if the request fails (e.g., forbidden access, invalid token, no configurations found)

### Example Request

To fetch all the configurations:

```http
GET /api/config/
Authorization: Bearer your_access_token
```
