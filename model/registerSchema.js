const mongoose = require('mongoose')

const registerSchema = mongoose.Schema({
    new_user_id:{
        type:String,
        // required: true
    },
    number:{
        type:Number,
        required: true
    },
    countrycode:{
        type:Number,
        required: true
    },
    firstName:{
        type:String,
        required: true
    },
    lastName:{
        type:String,
    },
    password:{
        type:String,
        required: true
    },
    email:{
        type:String,
    },
    gender:{
        type:String,
        required: true
    },
    trade:{
        type:String,
        required: true
    },
    dob:{
        type:String,
        required: true
    },
    passport: {
        type:String, 
    },
    passportImageF: {
        name:String,
        image: String
    },
    passportImageB: {
        name:String,
        image: String
    },
    resume: {
        name:String,
        image: String
    },
    profile_pic: {
        name:String,
        image: String
    },
    activeJobs: {
        type: Number
    },
    summary: {
        type: String
    },
    languages: {
        type: Array
    },
    marital_status: {
        type: String
    }
},{timestemps : true})

module.exports = mongoose.model("RegisterUser", registerSchema)