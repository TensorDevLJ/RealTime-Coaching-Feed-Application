import express from "express";
import Feed from "../models/Feed.js";

export default function createFeedRoutes(
  db,
  cache,
  io
){

const router=express.Router();


/*
GET all feeds
*/

router.get("/",async(req,res)=>{

console.log("GET ROUTE HIT");

try{

const feeds=
await Feed.find()
.sort({createdAt:-1});

res.json({

success:true,

data:feeds

});

}
catch(error){

console.log(error);

res.status(500)
.json({

success:false,

error:error.message

});

}

});



/*
Create feed
*/

router.post("/",async(req,res)=>{

console.log(
"POST ROUTE HIT"
);

try{

// check duplicate URL

const existingFeed=
await Feed.findOne({

url:req.body.url

});


if(existingFeed){

return res
.status(400)
.json({

success:false,

error:
"Feed URL already exists"

});

}


const feed=
await Feed.create(
req.body
);


// realtime update

io.emit(
"feed:created",
{

feed,

timestamp:
Date.now()

}
);


res.status(201)
.json({

success:true,

data:feed

});

}
catch(error){

console.log(
error
);

res.status(500)
.json({

success:false,

error:error.message

});

}

});



/*
Delete feed
*/

router.delete("/:id",
async(req,res)=>{

try{

await Feed.findByIdAndDelete(
req.params.id
);

io.emit(
"feed:deleted",
{

feedId:
req.params.id,

timestamp:
Date.now()

}
);

res.json({

success:true,

message:
"Feed deleted"

});

}
catch(error){

res.status(500)
.json({

success:false,

error:error.message

});

}

});



return router;

}