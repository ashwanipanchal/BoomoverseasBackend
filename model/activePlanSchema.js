const mongoose = require('mongoose')

const activePlanSchema = mongoose.Schema({
    user_id : {
        type: String,
        required: true
    },
    plan_id : {
        type: String,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("activeplan", activePlanSchema);