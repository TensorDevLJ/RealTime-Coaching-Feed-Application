import mongoose from "mongoose";

const FeedSchema = new mongoose.Schema(
{
 title:{
   type:String,
   required:true
 },

 description:String,

 url:{
   type:String,
   required:true,
   unique:true
 },

 source:String,

 category:String,

 image_url:String,

 is_active:{
   type:Boolean,
   default:true
 }

},
{
 timestamps:true
}
);

export default mongoose.model(
"Feed",
FeedSchema
);