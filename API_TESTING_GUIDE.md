# 🧪 API Testing Guide

Complete guide to testing the Feed App API with curl commands and examples.

## Prerequisites

- Backend running: `npm run dev` in backend folder
- Or Docker: `docker-compose up`
- curl or Postman installed

## Base URL

```
http://localhost:5000/api
```

---

## 1. Health Check

### Verify all services are healthy

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "websocket": "active",
    "connectedClients": 0
  }
}
```

---

## 2. GET /feed - Retrieve All Feeds

### First request (Cache MISS)

```bash
curl http://localhost:5000/api/feed
```

**Backend Console:**
```
✗ Cache MISS: feeds:all
🔍 Cache miss - querying database
✓ Cache SET: feeds:all (TTL: 300s)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "TechCrunch News",
      "description": "Breaking tech news",
      "url": "https://techcrunch.com/feed",
      "source": "TechCrunch",
      "category": "Technology",
      "image_url": "https://techcrunch.com/image.jpg",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "is_active": true
    }
  ],
  "source": "database",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Second request within 5 minutes (Cache HIT)

```bash
curl http://localhost:5000/api/feed
```

**Backend Console:**
```
✓ Cache HIT: feeds:all
📦 Serving from cache
```

**Response:**
```json
{
  "success": true,
  "data": [ /* same data */ ],
  "source": "cache",
  "timestamp": "2024-01-01T12:00:05.000Z"
}
```

---

## 3. POST /feed - Create New Feed

### Valid Request

```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Node.js Blog",
    "url": "https://nodejs.org/en/blog/feed",
    "description": "Official Node.js blog posts",
    "source": "Node.js Foundation",
    "category": "Technology",
    "image_url": "https://nodejs.org/static/images/logo.svg"
  }'
```

**Backend Console:**
```
📥 POST /feed - Incoming request
⚠️ Validation succeeded
💾 Inserting feed into database
✓ Feed created: 550e8400-e29b-41d4-a716-446655440001
🔄 Invalidating cache
📡 Broadcasting new feed to all clients
```

**Response:**
```json
{
  "success": true,
  "message": "Feed created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Node.js Blog",
    "description": "Official Node.js blog posts",
    "url": "https://nodejs.org/en/blog/feed",
    "source": "Node.js Foundation",
    "category": "Technology",
    "image_url": "https://nodejs.org/static/images/logo.svg",
    "created_at": "2024-01-01T12:05:00.000Z",
    "updated_at": "2024-01-01T12:05:00.000Z",
    "is_active": true
  },
  "timestamp": "2024-01-01T12:05:00.000Z"
}
```

### Validation Error - Missing Required Field

```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Missing URL Feed"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["title", "url"]
}
```

### Validation Error - Invalid URL Format

```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bad URL Feed",
    "url": "not-a-url"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Invalid URL format"
}
```

### Conflict Error - Duplicate URL

```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Another Tech Feed",
    "url": "https://nodejs.org/en/blog/feed"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Feed with this URL already exists"
}
```

---

## 4. DELETE /feed/:id - Delete a Feed

### Valid Delete

```bash
# First, get the feed ID from GET /feed response
FEED_ID="550e8400-e29b-41d4-a716-446655440001"

curl -X DELETE http://localhost:5000/api/feed/$FEED_ID
```

**Backend Console:**
```
📥 DELETE /feed/:id - 550e8400-e29b-41d4-a716-446655440001
🔄 Invalidating cache
📡 Broadcasting feed:deleted to all clients
```

**Response:**
```json
{
  "success": true,
  "message": "Feed deleted successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Node.js Blog",
    "url": "https://nodejs.org/en/blog/feed",
    "is_active": false,
    "updated_at": "2024-01-01T12:10:00.000Z"
  }
}
```

### Feed Not Found

```bash
curl -X DELETE http://localhost:5000/api/feed/invalid-id
```

**Response:**
```json
{
  "success": false,
  "error": "Feed not found"
}
```

---

## 5. Admin Endpoints

### Get Connected Clients

```bash
curl http://localhost:5000/api/admin/clients
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClients": 3,
    "clients": [
      {
        "id": "socket-1",
        "connectedAt": "2024-01-01T12:00:00.000Z",
        "lastActivity": "2024-01-01T12:05:00.000Z",
        "eventCount": 5
      },
      {
        "id": "socket-2",
        "connectedAt": "2024-01-01T12:01:00.000Z",
        "lastActivity": "2024-01-01T12:05:01.000Z",
        "eventCount": 3
      },
      {
        "id": "socket-3",
        "connectedAt": "2024-01-01T12:02:00.000Z",
        "lastActivity": "2024-01-01T12:05:02.000Z",
        "eventCount": 2
      }
    ]
  },
  "timestamp": "2024-01-01T12:05:03.000Z"
}
```

### Get Cache Statistics

```bash
curl http://localhost:5000/api/admin/cache-stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cacheConnected": true,
    "cacheType": "Redis",
    "ttl": 300
  },
  "timestamp": "2024-01-01T12:05:00.000Z"
}
```

---

## 6. Complete Testing Workflow

### Step-by-Step Test Script

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API="http://localhost:5000/api"

echo -e "${BLUE}=== Feed App API Testing ===${NC}\n"

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl -s $API/health | jq .
echo -e "\n${GREEN}✓ Health check passed${NC}\n"

# 2. Get feeds (first - cache miss)
echo -e "${BLUE}2. Get Feeds (Cache MISS)${NC}"
RESPONSE=$(curl -s $API/feed)
echo $RESPONSE | jq .
FIRST_SOURCE=$(echo $RESPONSE | jq -r '.source')
echo -e "${GREEN}✓ Source: $FIRST_SOURCE${NC}\n"

# 3. Create new feed
echo -e "${BLUE}3. Create New Feed${NC}"
CREATE_RESPONSE=$(curl -s -X POST $API/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python News",
    "url": "https://python.org/feed",
    "source": "Python.org",
    "category": "Technology"
  }')
echo $CREATE_RESPONSE | jq .
FEED_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')
echo -e "${GREEN}✓ Feed created with ID: $FEED_ID${NC}\n"

# 4. Get feeds (second - cache hit)
echo -e "${BLUE}4. Get Feeds (Cache HIT)${NC}"
sleep 1
RESPONSE=$(curl -s $API/feed)
echo $RESPONSE | jq .
SECOND_SOURCE=$(echo $RESPONSE | jq -r '.source')
echo -e "${GREEN}✓ Source: $SECOND_SOURCE${NC}\n"

# 5. Check admin clients
echo -e "${BLUE}5. Check Connected Clients${NC}"
curl -s $API/admin/clients | jq .
echo -e "${GREEN}✓ Client check complete${NC}\n"

# 6. Delete feed
echo -e "${BLUE}6. Delete Feed${NC}"
curl -s -X DELETE $API/feed/$FEED_ID | jq .
echo -e "${GREEN}✓ Feed deleted${NC}\n"

echo -e "${GREEN}=== All tests completed ===${NC}"
```

**Save and run:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 7. Performance Testing

### Load Testing with Multiple Requests

```bash
# Create 10 feeds sequentially
for i in {1..10}; do
  echo "Creating feed $i..."
  curl -X POST http://localhost:5000/api/feed \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Feed $i\",
      \"url\": \"https://example.com/feed$i\",
      \"category\": \"Test\"
    }" | jq '.success'
done

# Get all feeds multiple times to measure cache hits
for i in {1..5}; do
  echo "Request $i:"
  curl -s http://localhost:5000/api/feed | jq '.source'
done
```

### Concurrent Requests

```bash
# Using GNU Parallel
parallel curl ::: \
  http://localhost:5000/api/feed \
  http://localhost:5000/api/feed \
  http://localhost:5000/api/feed \
  http://localhost:5000/api/feed \
  http://localhost:5000/api/feed

# Using xargs
seq 1 10 | xargs -I {} curl -s http://localhost:5000/api/feed | jq '.source'
```

---

## 8. WebSocket Testing

### Using wscat

```bash
npm install -g wscat

# Connect to WebSocket
wscat -c http://localhost:5000

# In wscat terminal:
# Subscribe to feeds
{"type":"subscribe:feeds","clientId":"test"}

# Ping
{"type":"ping"}

# Watch for events
# (new feeds will appear as feed:created events)
```

### Using Node.js Client

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('subscribe:feeds', { clientId: socket.id });
});

socket.on('feed:created', (data) => {
  console.log('New feed:', data.feed.title);
});

socket.on('clients:updated', (data) => {
  console.log('Active clients:', data.count);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

---

## 9. Error Cases to Test

### 1. Server Error (Database Down)
```bash
# Stop PostgreSQL, then try:
curl http://localhost:5000/api/feed

# Expected: 500 error
```

### 2. Cache Error (Redis Down)
```bash
# Stop Redis, then try:
curl http://localhost:5000/api/feed

# Expected: Works, falls back to database
```

### 3. Invalid Content-Type
```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Content-Type: text/plain" \
  -d 'invalid'
```

### 4. Missing Content-Type Header
```bash
curl -X POST http://localhost:5000/api/feed \
  -d '{"title":"test","url":"http://example.com"}'
```

---

## 10. Postman Collection

### Import into Postman

**Feed App.postman_collection.json**
```json
{
  "info": {
    "name": "Feed App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/health"
      }
    },
    {
      "name": "Get Feeds",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/feed"
      }
    },
    {
      "name": "Create Feed",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/feed",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"My Feed\",\n  \"url\": \"https://example.com/feed\",\n  \"description\": \"A test feed\",\n  \"category\": \"Technology\"\n}"
        }
      }
    },
    {
      "name": "Delete Feed",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:5000/api/feed/{{feedId}}"
      }
    },
    {
      "name": "Get Clients",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/admin/clients"
      }
    }
  ]
}
```

---

## 11. Expected Console Logs

### Successful Flow
```
🚀 Server running on http://localhost:5000
📥 GET /feed - Incoming request
✗ Cache MISS: feeds:all
🔍 Cache miss - querying database
✓ Cache SET: feeds:all (TTL: 300s)

📥 POST /feed - Incoming request
💾 Inserting feed into database
✓ Feed created: uuid
🔄 Invalidating cache
📡 Broadcasting new feed to all clients

🟢 Client Connected: socket-id
👥 Total Clients: 1
📡 Client subscribed to feeds
```

### Error Flow
```
❌ Validation Error: Missing required fields
⚠️ Duplicate URL error
❌ Database connection error
✗ Redis connection error (but app continues)
🔴 Client Disconnected
```

---

## Summary

This testing guide covers:
- ✅ All API endpoints
- ✅ Success and error cases
- ✅ Cache hit/miss scenarios
- ✅ WebSocket events
- ✅ Performance testing
- ✅ Admin endpoints
- ✅ Complete test scripts

Happy testing! 🎉
