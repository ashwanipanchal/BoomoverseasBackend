const mongoose = require('mongoose')

const tradecenter = mongoose.Schema({
    area : {
        type: String,
        required: true
    },
    data : {
        type : Array,
        required : true
    }
},{timestemps : true})

module.exports = mongoose.model("tradecenter", tradecenter)