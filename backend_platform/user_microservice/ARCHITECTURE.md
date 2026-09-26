# Authentication API

Base path: `/api/v1/auth`

---

## Register

`POST /api/v1/auth/register`

Register a new user account.

### Request Body

```json
{
  "email": "user@example.com",
  "username": "player1",
  "password": "securePassword"
}
```

### Response

- **201 Created**
- User profile (excluding password)
- Initial access and refresh session tokens

---

## Login

`POST /api/v1/auth/login`

Authenticate a user, update `lastLogin`, and create a new token session.

### Request Body

Either email or username can be used.

Using email:

```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

Using username:

```json
{
  "username": "player1",
  "password": "securePassword"
}
```

### Response

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {}
}
```

---

## Refresh Token

`POST /api/v1/auth/refresh`

Generate a new access token using a valid refresh token stored in the `tokens` table.

### Request Body

```json
{
  "refreshToken": "..."
}
```

### Response

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

## Logout

`POST /api/v1/auth/logout`

Revoke the active refresh token.

### Headers

| Header | Value |
|--------|-------|
| Authorization | `Bearer <token>` |

### Request Body

```json
{
  "refreshToken": "..."
}
```

### Response

```json
{
  "success": true
}
```

---

## Forgot Password

`POST /api/v1/auth/forgot-password`

Generate a password reset token (`scope: "password-reset"`) and trigger reset email dispatch.

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Response

```json
{
  "message": "Reset link dispatched"
}
```

---

## Reset Password

`POST /api/v1/auth/reset-password`

Consume a valid password reset token and update the user's password.

### Request Body

```json
{
  "token": "...",
  "newPassword": "newSecurePassword"
}
```

### Response

```json
{
  "success": true
}
```

---

# User Profile API

Base path: `/api/v1/users`

---

## Get Current User

`GET /api/v1/users/me`

Fetch the authenticated user's complete profile.

### Headers

| Header | Value |
|--------|-------|
| Authorization | `Bearer <token>` |

### Response

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "player1",
  "playerLevel": 12,
  "rank": "VERIFIED",
  "bio": "...",
  "totalScore": 540,
  "avatarUrl": "...",
  "bgClass": "bg-blue",
  "createdAt": "...",
  "lastLogin": "..."
}
```

---

## Update Current User

`PATCH /api/v1/users/me`

Update profile customization fields.

### Headers

| Header | Value |
|--------|-------|
| Authorization | `Bearer <token>` |

### Request Body

All fields are optional.

```json
{
  "username": "newUsername",
  "bio": "Updated bio",
  "avatarUrl": "...",
  "bgClass": "bg-purple"
}
```

### Response

Returns the updated user object.

---

## Get User by ID

`GET /api/v1/users/:id`

Retrieve a user's public profile.

### Path Parameters

| Parameter | Type |
|-----------|------|
| `id` | Integer |

### Response

```json
{
  "id": 1,
  "username": "player1",
  "playerLevel": 12,
  "rank": "VERIFIED",
  "bio": "...",
  "totalScore": 540,
  "avatarUrl": "...",
  "bgClass": "bg-blue"
}
```

---

## Get User by Username

`GET /api/v1/users/by-username/:username`

Look up a public profile using a unique username.

### Path Parameters

| Parameter | Type |
|-----------|------|
| `username` | String |

### Response

Returns the same public profile payload as the ID lookup.

---

# Leaderboard API

Base path: `/api/v1/leaderboard`

---

## Get Leaderboard

`GET /api/v1/leaderboard`

Retrieve a ranked list of users ordered by `totalScore` or `rank`.

### Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `20` | Results per page |
| `sortBy` | `totalScore` | `totalScore` or `rank` |

### Response

```json
{
  "data": [
    {
      "id": 1,
      "username": "player1",
      "playerLevel": 20,
      "rank": "VERIFIED",
      "totalScore": 1200
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

Returns a paginated array of public user profiles along with pagination metadata.