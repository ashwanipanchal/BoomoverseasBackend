const mongoose = require('mongoose')

const forgotPassword = mongoose.Schema({
    number : {
        type: Number,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("forgotpassword", forgotPassword);