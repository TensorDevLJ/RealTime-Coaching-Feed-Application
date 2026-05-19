import { createClient } from "redis";

class RedisCache {

  constructor() {

    this.client = null;

    this.isConnected = false;

  }

async connect() {

  try {

    this.client = createClient({

      socket: {

        host: process.env.REDIS_HOST || "localhost",

        port: process.env.REDIS_PORT || 6379,

        reconnectStrategy: false

      }

    });

    this.client.on(
      "error",
      (err) => {

        console.log(
          "⚠ Redis unavailable:",
          err.message || "Redis server not running"
        );

      }
    );

    await this.client.connect();

    this.isConnected=true;

    console.log(
      "✓ Redis Connected"
    );

  }

  catch(error){

    console.log(
      "⚠ Redis disabled. App continuing without cache."
    );

    this.isConnected=false;

  }

}


  async get(key){

    if(!this.isConnected)
      return null;

    return await this.client.get(key);

  }


  async set(key,value,ttl=300){

    if(!this.isConnected)
      return;

    await this.client.set(
      key,
      value,
      {EX:ttl}
    );

  }


  async del(key){

    if(!this.isConnected)
      return;

    await this.client.del(key);

  }


  async disconnect(){

    if(this.isConnected){

      await this.client.quit();

      console.log(
        "✓ Redis disconnected"
      );

    }

  }

}

export default RedisCache;