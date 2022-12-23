const mongoose = require('mongoose')

const jobSchema = mongoose.Schema({
    exp:{
        type:String,
        required: true
    },
    title:{
        type:String,
        required: true
    },
    job_location:{
        type:String,
        required: true
    },
    industry:{
        type:String,
        required: true
    },
    salary:{
        type:String,
        required: true
    },
    job_status:{
        type:Number,
    },
    saved:{
        type:Number,
    },
    job_description:{
        type:String,
        required:true
    },
    job_skill:{
        type:Array,
        required:true
    },
    food:{
        type:String,
        required:true
    },
    vacancy:{
        type:String,
        required:true
    },
},{timestemps : true})

module.exports = mongoose.model("job", jobSchema)