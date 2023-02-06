const mongoose = require('mongoose')

const currencySchema = mongoose.Schema({
    currency: {
        type:String,
    },
},{timestemps : true})

module.exports = mongoose.model("currencie", currencySchema)