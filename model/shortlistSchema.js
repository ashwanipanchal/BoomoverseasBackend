const mongoose = require('mongoose')

const shortlistSchema = mongoose.Schema({
    job_id : {
        type: String,
        required: true
    },
    user_id : {
        type: String,
        required: true
    },
    // shortlist_date:{
    //     type:Date,
    //     required:true
    // },
},{timestemps : true})

module.exports = mongoose.model("shortlist", shortlistSchema)