const mongoose = require('mongoose')

const jobSchema = mongoose.Schema({
    new_job_id : {
        type: String
    },
    exp:{
        type:String,
        // required: true
    },
    title:{
        type:String,
        required: true
    },
    job_location:{
        type:String,
        required: true
    },
    industry:{
        type:String,
        required: true
    },
    trade:{
        type:String,
        required: true
    },
    salary:{
        type:String,
        required: true
    },
    job_status:{
        type:Number,
    },
    saved:{
        type:Number,
    },
    job_description:{
        type:String,
        required:true
    },
    job_skill:{
        type:Array,
        // required:true
    },
    education_require:{
        type:Array,
        // required:true
    },
    food:{
        type:String,
        // required:true
    },
    overtime:{
        type:String,
        // required:true
    },
    vacancy:{
        type:String,
        // required:true
    },
    job_post_date:{
        type:Date,
        required:true
    },
    last_date_to_apply:{
        type:Date,
        // required:true
    },
    gender:{
        type:String,
        // required:true
    },
    company_name:{
        type:Object,
        // required:true
    },
    show_company_name:{
        type:String,
        // required:true
    },
    is_min_exp:{
        type:Number,
        // required:true
    },
    is_foreign_exp:{
        type:Number,
        // required:true
    },
    duty_hour_day:{
        type:String,
        // required:true
    },
    duty_hour_week:{
        type:String,
        // required:true
    },
    accomodation:{
        type:Number,
        // required:true
    },
    transport:{
        type:Number,
        // required:true
    },
    sal_currancy:{
        type:String,
        // required:true
    },
    sal_period:{
        type:String,
        // required:true
    },
    min_salary:{
        type:String,
        // required:true
    },
    max_salary:{
        type:String,
        // required:true
    },
    hide_salary:{
        type:Number,
        // required:true
    },
    is_active:{
        type:Number,
        // required:true
    },
    is_feature:{
        type:Number,
        // required:true
    },
},{timestemps : true})

module.exports = mongoose.model("job", jobSchema)