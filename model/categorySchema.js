const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    icon: {
        name:String,
        image: String
    },
    title : {
        type: String,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("categorie", categorySchema)