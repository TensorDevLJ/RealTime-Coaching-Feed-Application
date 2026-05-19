import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';

import Database from './database.js';
import RedisCache from './redis.js';
import WebSocketManager from './websocket.js';
import createFeedRoutes from './routes/feeds.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

let db;
let cache;
let wsManager;

app.use(cors());
app.use(express.json());

app.use((req,res,next)=>{
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`
  );
  next();
});


async function initializeServices(){

 db = new Database();
 await db.connect();

 cache = new RedisCache();
 await cache.connect();

 wsManager =
 new WebSocketManager(httpServer);

 console.log("✓ WebSocket initialized");

}


// HEALTH ROUTE
app.get("/api/health",(req,res)=>{

res.json({
status:"ok"
});

});


// TEST ROUTE
app.get("/test",(req,res)=>{

console.log("TEST ROUTE HIT");

res.json({

message:"test works"

});

});



async function startServer(){

 await initializeServices();


 // register feed routes HERE
 app.use(
   "/api/feed",
   createFeedRoutes(
      db,
      cache,
      wsManager.getIO()
   )
 );

 console.log(
 "✅ Feed routes mounted"
 );


 // KEEP 404 LAST
 app.use((req,res)=>{

 res.status(404).json({

 success:false,

 error:"Route not found"

 });

 });


 httpServer.listen(
 PORT,
 ()=>{

 console.log(
 `Server running http://localhost:${PORT}`
 );

 });

}

startServer();