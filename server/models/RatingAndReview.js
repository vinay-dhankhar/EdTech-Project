const mongoose = require('mongoose');

const ratingAndReviewSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    rating:{
        type:Number,
        required:true,
    },
    reviews:{
        type:String,
        required:true,
    }
});

module.exports = mongoose.model("RatingAndReview" , ratingAndReviewSchema);