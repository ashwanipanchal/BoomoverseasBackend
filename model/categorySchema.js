const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    // job_id : {
    //     type: String,
    //     required: true
    // },
    title : {
        type: String,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("categorie", categorySchema)