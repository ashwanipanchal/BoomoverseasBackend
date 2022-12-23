const mongoose = require('mongoose')

const jobApplied = mongoose.Schema({
    job_id : {
        type: String,
        required: true
    },
    user_id : {
        type: String,
        required: true
    },
},{timestemps : true})

module.exports = mongoose.model("jobapplied", jobApplied)