# REST API Endpoints

This file lists the core backend API endpoints, their request/response formats, and the data sources they rely on. Each endpoint is documented in OpenAPI as well (see `openapi.yaml`).

## 1. Dashboard Summary

### GET `/api/dashboard/summary`
Returns real-time overview from Redis.

#### Response
```json
{
  "systemTrafficLastMin": [ { "timestamp": "...", "count": 120 } ],
  "topServicesByTraffic": [ { "service": "auth-service", "logs": 3241 } ],
  "topServicesByErrors":  [ { "service": "payment-service", "errors": 194 } ],
  "avgLatencyByService":  [ { "service": "email-service", "latency_ms": 107 } ]
}
```

## 2. All Services

### GET `/api/services`
Returns the list of services Redis has observed.

#### Response
```json
{
  "services": [
    "auth-service",
    "payment-service",
    "gateway-service"
  ]
}
```

## 3. Raw Log Search

### GET `/api/logs/search`

Query parameters:
- `service`
- `level`
- `start`
- `end`
- `trace_id`
- `limit`
- `offset`

Example: `/api/logs/search?service=auth-service&level=ERROR&limit=20`

#### Response
```json
{
  "results": [
    {
      "timestamp": "...",
      "service": "auth-service",
      "level": "ERROR",
      "message": "...",
      "trace_id": "uuid",
      "latency_ms": 210
    }
  ],
  "total": 172
}
```

## 4. Recent Logs Per Service

### GET `/api/logs/recent/:service`
Returns last 50 logs from Redis.

## 5. OLAP Data

### GET `/api/olap/hourly`
Returns rows from `log_hourly_stats`.

## 6. Health Check

### GET `/api/health`

```json
{ "status": "ok" }
```
