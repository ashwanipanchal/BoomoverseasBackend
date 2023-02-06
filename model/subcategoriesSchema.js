const mongoose = require('mongoose')

const subcategoriesSchema = mongoose.Schema({
    trade: {
        type:String,
    },
    data : {
        type: Array,
    },
},{timestemps : true})

module.exports = mongoose.model("subcategorie", subcategoriesSchema)