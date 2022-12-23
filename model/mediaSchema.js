const mongoose = require('mongoose')

const mediaSchema = mongoose.Schema({
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

module.exports = mongoose.model("medias", mediaSchema);