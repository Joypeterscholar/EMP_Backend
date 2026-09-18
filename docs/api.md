# EMP Backend API Reference

> Base URL: `https://<your-domain>/api`
> Last updated: 2026-09-18

---

## Conventions

### Authentication

All authenticated endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

Obtain a token via `POST /api/user/login`.

### Standard Success Shape

```json
{
  "status": "success",
  "data": { ... },
  "message": "descriptive message"
}
```

### Standard Error Shape

```json
{
  "status": "error",
  "message": "what went wrong"
}
```

Some endpoints break this pattern (noted inline). Errors are returned with the appropriate HTTP status code (400, 401, 403, 404, 500).

### File Uploads

Endpoints that accept files use `multipart/form-data`. File fields are sent as form fields, not JSON. Max file size: 50 MB (10 MB for feedback attachments).

### Pagination

Paginated endpoints return:

```json
{
  "status": "success",
  "data": {
    "items": [...],
    "total": 127,
    "page": 1,
    "limit": 25
  }
}
```

### Role-Based Access

| Role | Can see |
|------|---------|
| `superAdmin` | All data across all locations |
| `admin` | All data in their assigned locations |
| `reviewer` | Data in their assigned locations |
| `tagger` | Data in their assigned locations |
| `sampler` | Data in their assigned locations |

---

## Table of Contents

1. [Users](#1-users) (16 endpoints)
2. [Models](#2-models) (15 endpoints)
3. [Tags](#3-tags) (6 endpoints + 2 planned)
4. [Comments](#4-comments) (1 endpoint)
5. [Samples](#5-samples) (4 endpoints)
6. [Locations](#6-locations) (4 endpoints)
7. [Granular Tags](#7-granular-tags) (2 endpoints)
8. [Incidents](#8-incidents) (4 endpoints)
9. [Feedback](#9-feedback) (3 endpoints)
10. [Files](#10-files) (1 endpoint)
11. [Internal](#11-internal) (2 endpoints)
12. [Known Issues](#12-known-issues)

---

## 1. Users

### 1.1 POST /user/register

Register a new user account.

**Auth:** No
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | yes | User email |
| password | string | yes | Password |
| username | string | yes | Unique username |
| fullname | string | no | Display name |
| image | file | no | Profile photo |

**Success 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "imageUrl": "https://s3.../users/johndoe/photo.jpg",
    "role": "tagger",
    "isVerified": false,
    "createdAt": "2026-09-18T10:00:00.000Z"
  },
  "message": "Sign up tagger success"
}
```

**Errors:**
| Status | Message | When |
|--------|---------|------|
| 400 | "Email has been taken!" | Duplicate email |
| 400 | "Username has been taken!" | Duplicate username |
| 400 | "Location doesnt exist!" | Invalid location ID |

---

### 1.2 GET /user/seed-super-admin

Seed the default super admin account.

**Auth:** No

**Success 201:**
```json
{
  "message": "SuperAdmin seeded successfully.",
  "user": {
    "email": "superadmin@mail.com",
    "password": "superadmin"
  }
}
```

---

### 1.3 GET /user/check-authenticated

Check if the current request is authenticated.

**Auth:** No

**Success 200:**
```json
{
  "status": "success",
  "data": { "authenticated": true },
  "message": "Authenticated"
}
```

---

### 1.4 POST /user/login

Login with email and password.

**Auth:** No
**Content-Type:** application/json

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success 200 (no 2FA):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "tagger",
      "locations": { "_id": "...", "name": "Texas" }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "login success"
}
```

**Success 200 (2FA enabled):**
Returns the raw user object (caller must then verify 2FA).

**Errors:**
| Status | Message | When |
|--------|---------|------|
| 400 | "missing credentials" | Missing email or password |
| 400 | "Incorrect credentials" | Wrong email or password |

---

### 1.5 POST /user/register-tagger

Register a tagger user (same as 1.1 but accepts `role` and `location`).

**Auth:** No
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | yes | |
| password | string | yes | |
| username | string | yes | |
| role | string | yes | e.g. "tagger", "reviewer", "sampler" |
| location | string | no | Location ObjectId |
| fullname | string | no | |
| image | file | no | |

**Response:** Same as 1.1.

---

### 1.6 GET /user/getusers

Get all users. Super admin sees all non-superAdmin users. Other roles see users in their location.

**Auth:** Yes

**Success 200:**
```json
{
  "status": "success",
  "totalUsers": 9,
  "users": [
    {
      "_id": "...",
      "username": "tagger1",
      "email": "tagger1@example.com",
      "role": "tagger",
      "locations": { "_id": "...", "name": "Texas" }
    }
  ],
  "message": "users return"
}
```

> Note: `totalUsers` is currently hardcoded to `9`. This is a known bug.

---

### 1.7 GET /user/get-a-user/:id

Get a single user by ID.

**Auth:** Yes
**Path:** `id` — user ObjectId

**Success 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "tagger",
    "locations": { "_id": "...", "name": "Texas" }
  },
  "message": "users return"
}
```

---

### 1.8 PUT /user/update-user/:id

Update a user. Supports multipart if changing profile image.

**Auth:** Yes
**Path:** `id` — user ObjectId
**Content-Type:** multipart/form-data or application/json

| Field | Type | Description |
|-------|------|-------------|
| username | string | |
| email | string | |
| fullname | string | |
| role | string | |
| location | string | Location ObjectId |
| password | string | |
| image | file | New profile photo |

**Success 200:**
```json
{
  "status": "success",
  "data": { <updated user document> },
  "message": "users return"
}
```

**Errors:**
| Status | Message | When |
|--------|---------|------|
| 400 | "User with username X exist!" | Duplicate username |
| 400 | "User with email X exist!" | Duplicate email |
| 400 | "Location doesn't exist!" | Invalid location |

---

### 1.9 DELETE /user/delete/:id

Delete a user.

**Auth:** Yes
**Path:** `id` — user ObjectId

**Success 200:**
```json
{ "status": "success", "message": "user deleted" }
```

---

### 1.10 POST /user/set-two-factor-auth-verification-method

Initiate 2FA setup. Returns a TOTP secret.

**Auth:** No
**Content-Type:** application/json

```json
{ "email": "john@example.com" }
```

**Success 200:**
```json
{
  "message": "show user qr code",
  "status": "success",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

---

### 1.11 POST /user/send-reset-verification-token

Send a password reset email.

**Auth:** No
**Content-Type:** application/json

```json
{ "email": "john@example.com" }
```

**Success 200:**
```json
{ "message": "Please check your email for the reset link", "status": "success" }
```

---

### 1.12 POST /user/two-factor-auth-verification-token

Verify a 2FA TOTP token.

**Auth:** No
**Content-Type:** application/json

```json
{ "email": "john@example.com", "token": "123456" }
```

**Success 200:**
```json
{
  "status": "success",
  "data": {
    "user": { <user document> },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "2FA verification successful"
}
```

---

### 1.13 POST /user/reset-password-verification-token

Reset password using the token from email.

**Auth:** No
**Content-Type:** application/json

```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "password": "newpassword123" }
```

**Success 200:**
```json
{ "status": "Success", "message": "Password reset was successful" }
```

> Note: `status` is capitalized `"Success"` here, inconsistent with other endpoints.

---

### 1.14 PUT /user/update-password

Update password by email.

**Auth:** No
**Content-Type:** application/json

```json
{ "email": "john@example.com", "password": "newpassword123" }
```

**Success 200:**
```json
{
  "status": "success",
  "data": { <user document> },
  "message": "password updated success"
}
```

---

### 1.15 GET /user/dashboard

Get dashboard statistics for the authenticated user.

**Auth:** Yes

**Success 200:**
```json
{
  "tagsThisMonth": 42,
  "tagsLastMonth": 38,
  "totalTagsThisMonth": 42,
  "positiveTagsThisMonth": 30,
  "positivityRateThisMonth": 71.4,
  "tagsYearToDate": 500,
  "positivityRateYearToDate": 68.2,
  "positivityRatePerMonthYearToDate": [
    { "year": 2026, "month": 1, "positivityRate": 0.65, "totalTags": 100, "positiveTags": 65 }
  ],
  "totalModels": 12,
  "totalTaggers": 5,
  "totalReviewers": 3,
  "todaysModels": [],
  "modelsByDays": [{ "dayOfWeek": 2, "count": 3 }],
  "modelsByMonth": [{ "_id": 9, "count": 5 }],
  "TotalTagsBySampleAndDay": { "Pump A": [{ "dayOfWeek": 2, "totalTags": 5 }] },
  "TotalIncidentsByDay": { "Leak": [{ "dayOfWeek": 2, "totalTags": 2 }] },
  "TotalIncidentsByMonth": { "Leak": [{ "totalTags": 10, "month": 9 }] },
  "TotalTagsBySampleAndMonth": { "Pump A": [{ "totalTags": 20, "month": 9 }] },
  "modelsInEachLocation": [{ "_id": "...", "totalModels": 5, "locationName": "Texas" }],
  "recentlyViewedModels": [],
  "recentlyTaggeddModels": [],
  "deletedModels": 2,
  "recentModels": [],
  "message": "success"
}
```

---

### 1.16 GET /user/dashboard-by-location/:locationId

Get dashboard statistics scoped to a specific location.

**Auth:** Yes
**Path:** `locationId` — location ObjectId

**Success 200:** Same shape as 1.15, scoped to the given location.

---

## 2. Models

### 2.1 POST /model/create-models

Create a new 3D model with files.

**Auth:** Yes
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| modelName | string | yes | Model display name |
| description | string | yes | |
| userId | string | yes | Owner user ID |
| location | string | yes | Location ObjectId |
| size | number | no | |
| isComplete | boolean | no | |
| image | file | yes | Cover photo |
| model | file | yes | 3D model file (.glb, .gltf, etc.) |
| twoD | file | no | 2D drawing |

**Success 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "modelName": "Pump A",
    "slug": "FAC-1234",
    "description": "Main water pump",
    "file": "https://s3.../models/johndoe/Pump%20A/model.glb",
    "coverPicture": "https://s3.../coverPhoto/johndoe/cover.jpg",
    "size": 1024,
    "location": { "_id": "...", "name": "Texas" },
    "user": { "_id": "...", "username": "johndoe" },
    "delete": false,
    "createdAt": "2026-09-18T10:00:00.000Z"
  },
  "message": "Model upload"
}
```

**Errors:**
| Status | Message | When |
|--------|---------|------|
| 400 | "No files were uploaded." | Missing file fields |
| 400 | "add model name or description" | Missing required body fields |
| 400 | "add user or location" | Missing userId or location |

---

### 2.2 POST /model/create-coverPhoto

Add a cover photo to an existing model.

**Auth:** Yes
**Content-Type:** multipart/form-data

> Note: This endpoint is currently a no-op (implementation commented out). Returns 400 if no files.

---

### 2.3 GET /model/get-models/

Get all models. Super admin sees all non-deleted models. Others see models in their locations.

**Auth:** Yes

**Success 200:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "modelName": "Pump A",
      "slug": "FAC-1234",
      "file": "https://s3.../model.glb",
      "coverPicture": "https://s3.../cover.jpg",
      "location": { "_id": "...", "name": "Texas" },
      "delete": false
    }
  ],
  "message": "all models"
}
```

---

### 2.4 GET /model/get-softed-models/

Get all soft-deleted models.

**Auth:** Yes

**Success 200:**
```json
{
  "status": "success",
  "data": [ <soft-deleted model documents> ],
  "message": "soft deleted models"
}
```

---

### 2.5 GET /model/restore-softed-models/:id

Restore a single soft-deleted model.

**Auth:** Yes
**Path:** `id` — model ObjectId

**Success 200:**
```json
{
  "status": "success",
  "data": { <model document> },
  "message": "model restored"
}
```

---

### 2.6 POST /model/restore-softed-models/

Restore multiple soft-deleted models.

**Auth:** Yes
**Content-Type:** application/json

```json
{ "modelIds": ["id1", "id2", "id3"] }
```

**Success 200:**
```json
{
  "status": "success",
  "data": { "acknowledged": true, "modifiedCount": 3 },
  "message": "model restored successfully"
}
```

> Note: This endpoint currently calls `softDeleteModel` (sets delete=true) instead of restoring. This is a known bug.

---

### 2.7 GET /model/get-a-models/:id

Get a single model with populated tags, location, and granular tags.

**Auth:** Yes
**Path:** `id` — model ObjectId

**Success 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "modelName": "Pump A",
    "tags": [
      {
        "_id": "...",
        "objectName": "Bearing",
        "presence": "positive",
        "type": "sampling",
        "user": { "username": "tagger1" },
        "sample": { "name": "Vibration Sample" },
        "incident": null
      }
    ],
    "gTags": [ <granular tag documents> ],
    "location": { "name": "Texas" }
  },
  "message": "get a model"
}
```

---

### 2.8 DELETE /model/delete-a-models/:id

Permanently delete a model and its associated tags.

**Auth:** Yes
**Path:** `id` — model ObjectId

**Success 200:**
```json
{ "status": "success", "message": "model deleted successfully" }
```

---

### 2.9 POST /model/soft-delete-models/

Soft-delete multiple models (sets `delete: true`).

**Auth:** Yes
**Content-Type:** application/json

```json
{ "modelIds": ["id1", "id2"] }
```

**Success 200:**
```json
{
  "status": "success",
  "data": { "acknowledged": true, "modifiedCount": 2 },
  "message": "model moved to recycle bin"
}
```

**Error 400:**
```json
{ "status": "error", "message": "Invalid or empty model IDs provided" }
```

---

### 2.10 DELETE /model/delete-models/

Delete multiple models permanently.

**Auth:** Yes
**Content-Type:** application/json

```json
{ "modelIds": ["id1", "id2"] }
```

> Note: This route currently reuses the single-delete handler which reads `req.params.id`, so bulk delete via this route is broken. Use soft-delete instead.

---

### 2.11 GET /model/get-updated-models

Get models updated within a time range.

**Auth:** Yes
**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| startTime | ISO date string | yes | Range start |
| endTime | ISO date string | yes | Range end |

**Success 200:**
```json
{
  "data": [ <model documents updated in range> ]
}
```

> Note: Response has no `status` or `message` field.

---

### 2.12 POST /model/update-model/:id

Update a model's metadata and/or files.

**Auth:** Yes
**Path:** `id` — model ObjectId
**Content-Type:** multipart/form-data

| Field | Type | Description |
|-------|------|-------------|
| modelName | string | |
| description | string | |
| location | string | Location ObjectId |
| isComplete | boolean | |
| image | file | New cover photo |
| twoD | file | New 2D drawing |

**Success 200:**
```json
{
  "model": { <old model document before update> }
}
```

> Note: Response has no `status` or `message` field.

---

### 2.13 POST /model/:modelId/object-group

Create an object group for a model.

**Auth:** Yes
**Path:** `modelId` — model ObjectId
**Content-Type:** application/json

```json
{
  "name": "Bearing Group",
  "cameraPosition": { "x": 0, "y": 1, "z": 5 },
  "cameraDirection": { "x": 0, "y": 0, "z": -1 },
  "cameraRotation": { "x": 0, "y": 0, "z": 0 }
}
```

**Success 201:**
```json
{
  "_id": "...",
  "name": "Bearing Group",
  "cameraPosition": { "x": 0, "y": 1, "z": 5 },
  "cameraDirection": { "x": 0, "y": 0, "z": -1 },
  "cameraRotation": { "x": 0, "y": 0, "z": 0 },
  "modelId": "...",
  "createdAt": "2026-09-18T10:00:00.000Z"
}
```

**Error 404:** `{ "message": "Model not found" }`

---

### 2.14 GET /model/:modelId/object-group

Get all object groups for a model.

**Auth:** Yes
**Path:** `modelId`

**Success 200:**
```json
[
  { "_id": "...", "name": "Bearing Group", "cameraPosition": {...}, ... }
]
```

> Note: Returns a raw array, not wrapped in `{ status, data }`.

---

### 2.15 DELETE /model/:modelId/object-group/:objectGroupId

Delete an object group.

**Auth:** Yes
**Path:** `modelId`, `objectGroupId`

**Success 200:** `{ "message": "Object group deleted" }`

**Error 404:** `{ "message": "Model not found" }` or `{ "message": "Object group not found" }`

---

## 3. Tags

### 3.1 POST /tag/add

Create a new tag (sampling or incident).

**Auth:** Yes
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| objectName | string | yes | Machine/object name |
| action | string | yes | Action taken |
| modelId | string | yes | Model ObjectId |
| userId | string | yes | User ObjectId |
| locations | string | yes | Location ObjectId |
| type | string | yes | `"sampling"` or `"incident"` |
| sample | string | no | Sample ObjectId (for sampling type) |
| incident | string | no | Incident ObjectId (for incident type) |
| taggedInfo | string | no | Additional info |
| text | string | no | Free text |
| presence | string | no | `"positive"` or `"negative"` |
| group | string | no | Group name |
| evidence | file | no | Evidence photo/document |

**Success 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "slug": "SAM-1695000000",
    "objectName": "Bearing",
    "evidence": "https://s3.../evidence/Pump%20A/evidence.jpg",
    "action": "inspected",
    "presence": "positive",
    "type": "sampling",
    "user": "...",
    "model": "...",
    "createdAt": "2026-09-18T10:00:00.000Z"
  },
  "message": "tag added successfully"
}
```

**Error 400:** `"please login into the app"` (missing userId)

---

### 3.2 GET /tag/all-tags

Get all tags. Super admin sees all. Others see tags for models in their locations.

**Auth:** Yes

**Success 200:**
```json
{
  "message": "All tags",
  "data": [
    {
      "_id": "...",
      "objectName": "Bearing",
      "presence": "positive",
      "type": "sampling",
      "user": { "username": "tagger1", "email": "tagger1@example.com" },
      "sample": { "name": "Vibration" },
      "model": {
        "modelName": "Pump A",
        "location": { "name": "Texas" },
        "comments": []
      }
    }
  ],
  "status": "success"
}
```

---

### 3.3 GET /tag/paginated-tags

Get paginated tags with optional search and date filtering.

**Auth:** Yes
**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 25 | Items per page |
| search | string | "" | Regex search across objectName, incident, presence, sample, text, type, group, slug, user.fullname, model.modelName |
| startDate | ISO date | | Filter start |
| endDate | ISO date | | Filter end |

**Success 200:**
```json
{
  "message": "Paginated tags",
  "data": {
    "items": [ <tag documents with populated user, sample, model> ],
    "total": 127,
    "page": 1,
    "limit": 25
  },
  "status": "success"
}
```

---

### 3.4 PUT /tag/update-tag/:id

Update a tag.

**Auth:** Yes
**Path:** `id` — tag ObjectId
**Content-Type:** multipart/form-data

| Field | Type | Description |
|-------|------|-------------|
| objectName | string | |
| action | string | |
| locations | string | |
| sample | string | |
| userId | string | |
| modelId | string | |
| taggedInfo | string | |
| text | string | |
| presence | string | |
| type | string | |
| incident | string | |
| frequency | string | |
| evidence | file | New evidence file |

**Success 200:**
```json
{
  "message": "tag updated successfully",
  "data": { <old tag document> }
}
```

---

### 3.5 DELETE /tag/tags-delete/:id

Delete a tag.

**Auth:** Yes
**Path:** `id` — tag ObjectId

**Success 200:** `{ "message": "tag deleted successfully" }`

---

### 3.6 DELETE /tag/delete-model-tags/:id

Delete all tags for a model.

**Auth:** Yes
**Path:** `id` — model ObjectId

**Success 200:**
```json
{ "message": "successfully", "data": undefined }
```

> Note: Returns `undefined` in data field. Response could be improved.

---

### 3.7 GET /tag/by-object *(PLANNED — BE-10)*

Get all records for one machine. Newest first, with pagination.

**Auth:** Yes
**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| modelId | string | yes | Model ObjectId |
| objectId | string | yes | The machine's object ID within the 3D model |
| page | integer | no | Page number (default: 1) |
| limit | integer | no | Items per page (default: 25) |

**Success 200:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "...",
        "slug": "SAM-1695000000",
        "objectName": "Bearing A",
        "presence": "positive",
        "type": "sampling",
        "taggedInfo": "Normal vibration levels",
        "text": "",
        "action": "inspected",
        "evidence": "https://s3.../evidence.jpg",
        "user": { "_id": "...", "username": "tagger1" },
        "sample": { "_id": "...", "name": "Vibration" },
        "createdAt": "2026-09-18T14:30:00.000Z"
      }
    ],
    "total": 47,
    "page": 1,
    "limit": 25
  }
}
```

**Rules:**
- Returns every record for the specified machine, nothing for nearby machines
- Sorted newest-first
- Respects role and location permissions
- A machine with no records returns `{ "status": "success", "data": { "items": [], "total": 0, "page": 1, "limit": 25 } }` (HTTP 200, not 404)
- Uses the `objectRef.objectId` index

---

### 3.8 GET /tag/:id/locate *(PLANNED — BE-11)*

Get everything the 3D viewer needs to jump to a tag's machine.

**Auth:** Yes
**Path:** `id` — tag ObjectId

**Success 200:**
```json
{
  "modelId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "modelFile": "https://s3.../models/johndoe/Pump%20A/model.glb",
  "modelName": "Pump A",
  "taggingReliability": "high",
  "objectRef": {
    "objectId": "bearing-a-001",
    "objectName": "Bearing A",
    "cameraPosition": { "x": 0, "y": 1, "z": 5 },
    "cameraDirection": { "x": 0, "y": 0, "z": -1 },
    "cameraRotation": { "x": 0, "y": 0, "z": 0 }
  }
}
```

**Rules:**
- Returns everything in one call — no second request needed
- Respects role and location permissions
- If the model was permanently deleted: `404 { "status": "error", "message": "Model not found" }`
- If the tag doesn't exist: `404 { "status": "error", "message": "Tag not found" }`

---

## 4. Comments

### 4.1 POST /comment/add

Add a comment to a tag.

**Auth:** Yes
**Content-Type:** application/json

```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "tagId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "comment": "This looks like normal wear"
}
```

**Success 200:**
```json
{
  "message": "success",
  "data": {
    "_id": "...",
    "text": "This looks like normal wear",
    "user": "...",
    "tag": "...",
    "createdAt": "2026-09-18T10:00:00.000Z"
  }
}
```

---

## 5. Samples

### 5.1 POST /sample/create-samples

Create a new sample.

**Auth:** Yes
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Sample name |
| description | string | yes | |
| image | file | no | Sample photo |

**Success 200:**
```json
{
  "message": "success",
  "data": {
    "_id": "...",
    "name": "Vibration Sample",
    "description": "Standard vibration test",
    "image": "https://s3.../samples/Vibration%20Sample/photo.jpg",
    "user": "..."
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | "Please login again, User not found" |
| 400 | "name and description is required" |

---

### 5.2 PUT /sample/update-sample/:id

Update a sample.

**Auth:** Yes
**Path:** `id` — sample ObjectId
**Content-Type:** multipart/form-data

| Field | Type | Required |
|-------|------|----------|
| name | string | yes |
| description | string | yes |
| image | file | no |

**Success 200:**
```json
{
  "message": "Sample updated successfully",
  "data": { <updated sample document> }
}
```

---

### 5.3 GET /sample/samples

Get all samples. Super admin sees all. Others see samples in their locations.

**Auth:** Yes

**Success 200:**
```json
{
  "message": "success",
  "data": [
    {
      "_id": "...",
      "name": "Vibration Sample",
      "description": "...",
      "image": "...",
      "user": { "username": "tagger1", "email": "tagger1@example.com", "locations": "..." }
    }
  ]
}
```

---

### 5.4 DELETE /sample/samples-delete/:id

Delete a sample.

**Auth:** Yes
**Path:** `id` — sample ObjectId

**Success 200:** `{ "message": "success sample deleted" }`

---

## 6. Locations

### 6.1 POST /location/create-location

Create a new location.

**Auth:** Yes
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Location name |
| user | string | no | User ObjectId |
| image | file | no | Location photo |

**Success 200:**
```json
{
  "message": "success",
  "data": {
    "_id": "...",
    "name": "Texas Plant",
    "image": "https://s3.../location/Texas%20Plant/photo.jpg",
    "user": "...",
    "models": [],
    "createdAt": "2026-09-18T10:00:00.000Z"
  }
}
```

**Error 400:** `{ "status": "error", "message": "Name is required" }`

---

### 6.2 GET /location/locations

Get all locations. Super admin sees all. Others see only their own.

**Auth:** Yes

**Success 200:**
```json
{
  "message": "success",
  "data": [
    {
      "_id": "...",
      "name": "Texas Plant",
      "image": "...",
      "user": { "username": "admin1" },
      "models": ["...", "..."]
    }
  ]
}
```

---

### 6.3 PUT /location/location-update/:id

Update a location.

**Auth:** Yes
**Path:** `id` — location ObjectId
**Content-Type:** multipart/form-data

| Field | Type | Description |
|-------|------|-------------|
| name | string | New name |
| image | file | New photo |

**Success 200:**
```json
{
  "message": "success",
  "data": { <updated location document> }
}
```

---

### 6.4 DELETE /location/location-delete/:id

Delete a location. Fails if it has associated models.

**Auth:** Yes
**Path:** `id` — location ObjectId

**Success 200:**
```json
{
  "message": "location deleted successfully",
  "data": { <deleted location document> }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 404 | "Location not found" |
| 400 | "Cannot delete location with associated models" |

---

## 7. Granular Tags

### 7.1 POST /Gtags/create-Gtags

Create a granular tag (per-object annotation with image).

**Auth:** Yes
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | yes | Model ObjectId |
| objectName | string | yes | Object name in the 3D model |
| user | string | yes | User ID |
| taggedInfo | string | no | Additional info |
| image | file | yes | Evidence photo |

**Success 200:**
```json
{
  "message": "success",
  "data": {
    "_id": "...",
    "objectName": "Bearing A",
    "taggedInfo": "Visible corrosion",
    "image": "https://s3.../GTag/Pump%20A/photo.jpg",
    "modelId": "...",
    "userId": "...",
    "createdAt": "2026-09-18T10:00:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | "file not found" |
| 400 | "check user, objectName or model is required" |
| 400 | "model not found" |
| 400 | "file cannot be read or uploaded" |

---

### 7.2 DELETE /Gtags/gtag-delete/:id

Delete a granular tag.

**Auth:** Yes
**Path:** `id` — granular tag ObjectId

**Success 200:** `{ "message": "success Gtag deleted" }`

---

## 8. Incidents

### 8.1 POST /incident/create-incident

Create an incident report.

**Auth:** Yes
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Incident name |
| description | string | yes | |
| image | file | no | Evidence photo |

**Success 200:**
```json
{
  "message": "success",
  "data": {
    "_id": "...",
    "name": "Oil Leak",
    "description": "Small leak detected near pump base",
    "user": "...",
    "createdAt": "2026-09-18T10:00:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | "Please login again, User not found" |
| 400 | "name and description is required" |

---

### 8.2 PUT /incident/update-incident/:id

Update an incident.

**Auth:** Yes
**Path:** `id` — incident ObjectId
**Content-Type:** multipart/form-data

| Field | Type | Description |
|-------|------|-------------|
| name | string | |
| description | string | |
| image | file | |

**Success 200:**
```json
{
  "message": "Incident updated successfully",
  "data": { <old incident document> }
}
```

---

### 8.3 GET /incident/incidents

Get all incidents. Super admin sees all. Others see incidents in their locations.

**Auth:** Yes

**Success 200:**
```json
{
  "message": "success",
  "data": [
    {
      "_id": "...",
      "name": "Oil Leak",
      "description": "...",
      "user": { "username": "tagger1", "email": "tagger1@example.com", "locations": "..." }
    }
  ]
}
```

---

### 8.4 DELETE /incident/incident-delete/:id

Delete an incident.

**Auth:** Yes
**Path:** `id` — incident ObjectId

**Success 200:** `{ "message": "success incident deleted" }`

---

## 9. Feedback

### 9.1 POST /feedback

Submit feedback with optional attachment.

**Auth:** Yes
**Content-Type:** multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | yes | Max 5000 characters |
| attachment | file | no | Allowed: images, PDFs, Word docs, plain text, videos |

**Allowed MIME types:** image/png, image/jpeg, image/gif, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain, video/mp4, video/quicktime, video/x-msvideo, video/webm

**Success 201:**
```json
{
  "status": "success",
  "message": "Feedback submitted successfully",
  "data": {
    "_id": "...",
    "user": { "fullname": "John Doe", "email": "john@example.com", "username": "johndoe", "role": "tagger" },
    "message": "The vibration chart looks wrong on mobile",
    "status": "pending",
    "attachment": {
      "url": "https://s3.../feedback/user123/1695000000-screenshot.png",
      "filename": "screenshot.png",
      "mimetype": "image/png"
    },
    "createdAt": "2026-09-18T10:00:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 401 | "Unauthorized" |
| 400 | "Message is required" |
| 400 | "Message exceeds 5000 characters" |

---

### 9.2 GET /feedback

Get feedback list. Super admin sees all with summary. Users see only their own.

**Auth:** Yes
**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `"pending"`, `"reviewed"`, `"resolved"`, or `"all"` |

**Success 200 (super admin):**
```json
{
  "status": "success",
  "data": [ <feedback documents with populated user> ],
  "summary": { "total": 24, "pending": 5, "reviewed": 12, "resolved": 7 }
}
```

**Success 200 (regular user):**
```json
{
  "status": "success",
  "data": [ <own feedback documents> ],
  "summary": null
}
```

---

### 9.3 PATCH /feedback/:id/status

Update feedback status (super admin only).

**Auth:** Yes (super admin)
**Path:** `id` — feedback ObjectId
**Content-Type:** application/json

```json
{ "status": "reviewed" }
```

**Success 200:**
```json
{
  "status": "success",
  "message": "Feedback status updated",
  "data": { <updated feedback document with populated user> }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 403 | "Only super admins can update feedback status" |
| 400 | "Invalid status value" |
| 404 | "Feedback not found" |

---

## 10. Files

### 10.1 GET /file/:filename

Serve a local file by filename. Used for development/local disk uploads.

**Auth:** No
**Path:** `filename`

**Success 200:** Raw file content (binary)

---

## 11. Internal

These are developer tools, not called by the frontend.

### 11.1 GET /docs

Swagger UI interactive API documentation.

### 11.2 GET /docs.json

Raw OpenAPI 3.0 JSON spec.

---

## 12. Known Issues

These are bugs or inconsistencies found during documentation. The frontend should be aware of them.

| # | Endpoint | Issue |
|---|----------|-------|
| 1 | POST /model/restore-softed-models/ | Calls `softDeleteModel` instead of `restoreSoftDeletedModels` — bulk restore actually soft-deletes again |
| 2 | DELETE /model/delete-models/ | Routes to single-delete handler that reads `req.params.id` — bulk delete is broken |
| 3 | GET /model/get-updated-models | Response has no `status` or `message` field |
| 4 | POST /model/update-model/:id | Response has no `status` or `message` field |
| 5 | GET /model/:modelId/object-group | Returns raw array, not wrapped in `{ status, data }` |
| 6 | GET /user/getusers | `totalUsers` is hardcoded to `9` |
| 7 | POST /user/reset-password-verification-token | Returns `"status": "Success"` (capital S) |
| 8 | GET /user/dashboard | Error returns `{ "error": "..." }` not `{ "status": "error", "message": "..." }` |
| 9 | DELETE /tag/delete-model-tags/:id | Data field returns `undefined` |
| 10 | All endpoints | Auth middleware throws an error (not JSON) when `Authorization` header is missing entirely |
