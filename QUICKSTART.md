# ⚡ Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Using Docker (Easiest)

```bash
# 1. Navigate to project directory
cd feed-app

# 2. Start all services
docker-compose up

# 3. Wait for services to be ready (look for "Server running on...")
# This may take 30-60 seconds on first run

# 4. Open your browser
# Frontend: http://localhost:3000
# Admin:    http://localhost:3000/admin
# API:      http://localhost:5000/api/feed
```

### Without Docker (Manual)

#### Terminal 1: Start PostgreSQL
```bash
# Using Docker for database only
docker run --name postgres-feed \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=feed_db \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Terminal 2: Start Redis
```bash
docker run --name redis-feed \
  -p 6379:6379 \
  redis:7-alpine
```

#### Terminal 3: Start Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

#### Terminal 4: Start Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📖 Usage

### Create Your First Feed

1. Go to http://localhost:3000/admin
2. Fill in the form:
   - **Title**: "My First Feed"
   - **URL**: "https://example.com/feed1"
   - **Category**: Select one or leave empty
3. Click "Create Feed"
4. Go to http://localhost:3000 to see it live!

### Watch Real-time Updates

1. Open http://localhost:3000 in one browser window
2. Open http://localhost:3000/admin in another window
3. Create a feed in the admin panel
4. Watch it appear instantly in the main feed without page refresh!

## 🧪 Test the Cache

1. Open http://localhost:3000
2. Check console logs (F12 → Console)
3. First load shows: "Cache MISS"
4. Refresh the page (F5)
5. Second load shows: "Cache HIT"
6. Cache expires after 5 minutes

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Can't Connect to Services
```bash
# Check Docker containers are running
docker ps

# View logs
docker-compose logs backend
docker-compose logs frontend
```

### Database Connection Error
```bash
# Reset database
docker-compose down -v
docker-compose up
```

## 📝 API Examples

### Get All Feeds
```bash
curl http://localhost:5000/api/feed
```

### Create a Feed
```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech News",
    "url": "https://techcrunch.com/feed",
    "source": "TechCrunch",
    "category": "Technology"
  }'
```

### Check Health
```bash
curl http://localhost:5000/api/health
```

## ✨ Key Features to Try

✅ **Real-time Updates** - Open multiple browser tabs and create feeds  
✅ **Cache Performance** - See Cache HIT/MISS in console logs  
✅ **WebSocket Connection** - Status indicator shows live connection  
✅ **Client Count** - See how many users are connected  
✅ **Image Preview** - Add image URL in admin, see preview  
✅ **Auto Reconnect** - Disconnect network and watch it reconnect  

## 🔥 What's Happening Under the Hood

When you create a feed:
1. ✅ **Frontend** sends HTTP POST to backend
2. ✅ **Backend** validates and saves to PostgreSQL
3. ✅ **Redis** cache is invalidated
4. ✅ **WebSocket** broadcasts to all connected clients
5. ✅ **Frontend** receives event and updates UI without reload

## 📊 View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 🛑 Stop Everything

```bash
docker-compose down

# Remove volumes (database will be reset)
docker-compose down -v
```

---

That's it! You now have a full-stack real-time application running. 🎉

For detailed documentation, see **README.md**
