# Mellowise API Documentation

## Overview
This directory contains the API documentation for Mellowise, including endpoint specifications, data models, and integration examples.

## Structure
```
docs/api/
├── README.md           # This file
├── endpoints/          # API endpoint documentation
│   ├── auth.md        # Authentication endpoints
│   ├── questions.md   # Question management
│   ├── sessions.md    # Game session management
│   └── users.md       # User profile management
├── schemas/           # Data schema definitions
└── examples/          # Usage examples
```

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://mellowise.app/api`

## Authentication
All API endpoints require authentication via Supabase JWT tokens.

## API Versioning
Current version: `v1`

## Rate Limiting
- Authenticated users: 1000 requests/hour
- Anonymous users: 100 requests/hour

## Error Handling
All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "https://mellowise.app/docs/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request body contains invalid data",
  "instance": "/api/v1/sessions",
  "errors": [
    {
      "field": "difficulty",
      "message": "Must be between 1 and 10"
    }
  ]
}
```

## Getting Started
1. Set up authentication with Supabase
2. Review endpoint documentation in `/endpoints/`
3. Check schema definitions in `/schemas/`
4. Run examples from `/examples/`

## OpenAPI Specification
Full OpenAPI 3.0 spec available at `/api/docs` (when implemented)