const mongoose = require('mongoose')

const TestSchemaForImage = mongoose.Schema({
    icon: { type: String },
    title : {
        type: Object,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("testimage", TestSchemaForImage)