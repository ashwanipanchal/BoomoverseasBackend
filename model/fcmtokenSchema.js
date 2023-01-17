const mongoose = require('mongoose')

const fcmtokenSchema = mongoose.Schema({
    number : {
        type: String,
    },
    fcm_token : {
        type: String,
    },
},{timestemps : true})

module.exports = mongoose.model("fcmtoken", fcmtokenSchema);