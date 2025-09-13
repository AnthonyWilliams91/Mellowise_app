# API Documentation Template

This template provides a standardized format for documenting Mellowise API endpoints with comprehensive examples, error handling, and performance specifications.

## Template Format

### Endpoint Name

**Brief description of what this endpoint does.**

---

#### HTTP Method and URL
```
METHOD /api/path/to/endpoint
```

#### Authentication
- **Required:** Yes/No
- **Type:** Bearer token / API Key / Session
- **Permissions:** List required permissions

#### Request

##### Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
X-Custom-Header: value
```

##### URL Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | string | Yes | Resource identifier | `user_123` |
| `category` | enum | No | Filter category | `active`, `inactive` |

##### Query Parameters
| Parameter | Type | Required | Description | Default | Example |
|-----------|------|----------|-------------|---------|---------|
| `limit` | number | No | Number of results | 20 | `50` |
| `offset` | number | No | Results offset | 0 | `100` |
| `sort` | string | No | Sort field | `created_at` | `name` |
| `order` | enum | No | Sort direction | `desc` | `asc`, `desc` |

##### Request Body
```json
{
  "field1": "string",
  "field2": 123,
  "field3": {
    "nested_field": "value"
  },
  "field4": ["array", "values"]
}
```

**Field Descriptions:**
- `field1` (string, required): Description of field1
- `field2` (number, optional): Description of field2, range 1-1000
- `field3` (object, optional): Nested object description
- `field4` (array, optional): Array of strings, max 10 items

#### Response

##### Success Response (200/201)
```json
{
  "success": true,
  "data": {
    "id": "resource_123",
    "name": "Resource Name",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "has_more": true
  }
}
```

##### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Authentication required",
    "details": "Please provide a valid authentication token"
  }
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_003",
    "message": "Insufficient permissions",
    "details": "This operation requires admin privileges"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found",
    "details": "No resource found with ID: resource_123"
  }
}
```

**429 Rate Limited**
```json
{
  "success": false,
  "error": {
    "code": "SYS_003",
    "message": "Rate limit exceeded",
    "details": "Maximum 100 requests per minute allowed"
  },
  "retry_after": 60
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "SYS_001",
    "message": "Internal server error",
    "details": "An unexpected error occurred"
  }
}
```

#### Examples

##### cURL Example
```bash
curl -X POST https://api.mellowise.com/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "field1": "example value",
    "field2": 42
  }'
```

##### JavaScript (fetch) Example
```javascript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  },
  body: JSON.stringify({
    field1: 'example value',
    field2: 42
  })
});

const data = await response.json();

if (data.success) {
  console.log('Success:', data.data);
} else {
  console.error('Error:', data.error);
}
```

##### Python Example
```python
import requests

url = "https://api.mellowise.com/api/endpoint"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token-here"
}
data = {
    "field1": "example value",
    "field2": 42
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

if result["success"]:
    print("Success:", result["data"])
else:
    print("Error:", result["error"])
```

#### Performance

- **Target Response Time:** < 200ms (95th percentile)
- **Rate Limiting:** 100 requests per minute per user
- **Caching:** Response cached for 5 minutes (if applicable)
- **Database Queries:** Maximum 3 queries per request

#### Security Considerations

- Input validation using [validation library]
- SQL injection prevention via parameterized queries
- CORS policy: [specify allowed origins]
- Rate limiting enforced at API gateway level
- Sensitive data handling: [specify PII handling]

#### Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2024-01-01 | Initial implementation |
| v1.1 | 2024-01-15 | Added pagination support |

---

## Usage Guidelines

### When to Use This Template

Use this template for all API endpoints in the Mellowise application:

1. **REST API endpoints** (`/api/...`)
2. **GraphQL resolvers** (adapted format)
3. **Webhook endpoints** (`/webhooks/...`)
4. **Internal service APIs**

### Required Sections

Every API documentation must include:

- [ ] HTTP method and URL
- [ ] Authentication requirements
- [ ] Request format (headers, parameters, body)
- [ ] Success response format
- [ ] Error responses (at least 400, 401, 500)
- [ ] At least one code example
- [ ] Performance specifications

### Optional Sections

Include when applicable:

- [ ] URL/Query parameters
- [ ] Pagination details
- [ ] Caching information
- [ ] Webhooks or callbacks
- [ ] Batch operation details
- [ ] File upload specifications

### Documentation Standards

1. **Clear Descriptions**: Each field should have a clear, concise description
2. **Realistic Examples**: Use realistic data in examples, not placeholder text
3. **Error Codes**: Reference our error message constants (`src/constants/error-messages.ts`)
4. **Performance Budgets**: Include performance targets from monitoring config
5. **Security Notes**: Document security considerations and validation rules

### Validation Checklist

Before publishing API documentation:

- [ ] All required sections completed
- [ ] Examples tested and working
- [ ] Error codes match our error taxonomy
- [ ] Performance targets specified
- [ ] Security considerations documented
- [ ] Request/response schemas validated
- [ ] Code examples in multiple languages
- [ ] Rate limiting details included

### Tools and Integration

- **Schema Validation**: Use JSON Schema for request/response validation
- **API Testing**: All examples should be testable with Playwright
- **Monitoring**: Performance targets should align with monitoring thresholds
- **Error Handling**: Error responses should use our error handler utilities

### Maintenance

- **Regular Updates**: Review and update documentation quarterly
- **Version Control**: Track changes in changelog section
- **User Feedback**: Collect and incorporate developer feedback
- **Automated Testing**: Ensure examples remain valid through automated tests