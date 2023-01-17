const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
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
    middleName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    fatherName:{
        type:String,
    },
    dob:{
        type:String,
    },
    exp:{
        type:String,
    },
    foreignExp:{
        type:String,
    },
    qualification:{
        type:String,
    },
    techQualification:{
        type:String,
    },
    address:{
        type:String,
    },
    city:{
        type:String,
    },
    state:{
        type:String,
    },
    password:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    gender:{
        type:String,
        required: true
    },
    trade:{
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
    // activePlan: {
    //     totalJobs: Number,
    //     required: true
    // }
    activeJobs: {
        type: Number
    },
    summary: {
        type: String
    }
},{timestemps : true})

module.exports = mongoose.model("Users", userSchema)