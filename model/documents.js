const mongoose = require('mongoose')

const documents = mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    subtitle : {
        type: String,
        required: true
    },
    date : {
        type: Date,
        required: true
    },
    link : {
        type: String,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("documents", documents);