# 📄 Documentation

- [`[POST] /api/auth/register`](#post-apiauthregister) => register an account

---

### [POST] /api/auth/register

# ▶️ Description

Registers a new user account by accepting user details and returning a confirmation response.

---

# 📤 Request Payload

The request body must be a JSON object containing the following fields:

# UserSchema Fields

- **idNumber**: `string` => required
- **email**: `string` => required
- **password**: `string` => required
- **role**: `string` => not required (default: 'student')
- **isVerified**: `boolean` => not required (default: false)
- **isActive**: `boolean` => not required (default: false)
- **course**: `string` => required
- **block**: `string` => not required
- **year_level**: `number` => required
- **first_name**: `string` => required
- **last_name**: `string` => required
- **middle_name**: `string` => not required
- **suffix**: `string` => required
- **gender**: `string` => not required (default: 'other')
- **date_of_birth**: `date` => required
- **address**: `string` => not required
- **contact_number**: `string` => required
- **facebook**: `string` => not required
- **other_info**: `[object]` =>

---
