const mongoose = require('mongoose')

const OTPschema = mongoose.Schema({
    number:{
        type:Number,
        required: true
    },
    otp:{
        type:Number,
        required: true
    }
},{timestemps : true})

module.exports = mongoose.model("OTP", OTPschema)