# 🚀 Feed App - Real-Time Feed Application

## Overview

A real-time feed application built with **Next.js, Express.js, MongoDB,
Socket.IO, and Redis (optional)**.

Users can: - Create feeds from Admin panel - View feeds instantly on
homepage - Receive live updates using WebSockets - Delete feeds in real
time - Store data in MongoDB - Use Redis cache when available

------------------------------------------------------------------------

## Features

### Backend

-   Express REST API
-   MongoDB + Mongoose
-   Socket.IO realtime updates
-   Redis cache fallback support
-   Health check endpoints
-   Duplicate feed prevention

### Frontend

-   Next.js
-   Real-time feed updates
-   Admin panel
-   Responsive UI
-   Feed cards with images
-   Live connection status

------------------------------------------------------------------------

## Tech Stack

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   Socket.IO
-   Redis

### Frontend

-   Next.js
-   React
-   Axios
-   CSS Modules

------------------------------------------------------------------------

## Installation

### Backend

``` bash
cd backend
npm install
npm run dev
```

Runs:

http://localhost:5000

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

Runs:

http://localhost:3000

------------------------------------------------------------------------

## Environment Variables

Frontend `.env.local`

``` env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

Backend `.env`

``` env
PORT=5000
MONGO_URI=your_mongodb_url
REDIS_URL=redis://localhost:6379
```

------------------------------------------------------------------------

## API Routes

GET `/api/feed`

POST `/api/feed`

DELETE `/api/feed/:id`

GET `/api/health`

------------------------------------------------------------------------

## WebSocket Events

Server emits:

-   feed:created
-   feed:deleted
-   clients:updated

------------------------------------------------------------------------

## Project Structure

feed-app/ - backend/ - frontend/ - routes/ - models/ - websocket/ -
hooks/

------------------------------------------------------------------------

## Future Improvements

-   Authentication
-   Search
-   Pagination
-   Categories filter
-   Deployment

**Built with ❤️ By likhitha.**
