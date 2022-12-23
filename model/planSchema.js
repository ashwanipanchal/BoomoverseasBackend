const mongoose = require('mongoose')

const planSchema = mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    jobs : {
        type: String,
        required: true
    },
    price : {
        type: String,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("plan", planSchema);