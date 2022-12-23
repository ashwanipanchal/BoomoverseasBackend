const mongoose = require('mongoose')

const newsSchema = mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    content : {
        type: String,
        required: true
    },
    date : {
        type: Date,
        required: true
    },
    location : {
        type: String,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("new", newsSchema)