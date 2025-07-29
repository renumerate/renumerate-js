---
title: Error Reference
description: Renumerates API
---

#### Error Handling
All API endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid or missing X-Brand-Key)
- `404` - Not Found (customer/subscription not found)
- `500` - Internal Server Error

Example error response:
```json
{
  "error": "Customer not found"
}