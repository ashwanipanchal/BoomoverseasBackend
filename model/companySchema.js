const mongoose = require('mongoose')

const companySchema = mongoose.Schema({
    company_name:{
        type:String,
        // required: true
    },
    estd_year:{
        type:String,
        // required: true
    },
    industry:{
        type:String,
        // required: true
    },
    owner_type:{
        type:String,
        // required: true
    },
    no_of_emp:{
        type:String,
        // required: true
    },
    no_of_office:{
        type:String,
        // required: true
    },
    about_company:{
        type:String,
        // required: true
    },
    add_type:{
        type:String,
        // required:true
    },
    street_add:{
        type:String,
        // required:true
    },
    state:{
        type:String,
        // required:true
    },
    city:{
        type:String,
        // required:true
    },
    pincode:{
        type:Number,
        // required:true
    },
    website:{
        type:String,
        // required:true
    },
    company_phone:{
        type:String,
        // required:true
    },
    company_fax:{
        type:String,
        // required:true
    },
    rep_fname:{
        type:String,
        // required:true
    },
    rep_mname:{
        type:String,
        // required:true
    },
    rep_lname:{
        type:String,
        // required:true
    },
    rep_email:{
        type:String,
        // required:true
    },
    rep_number:{
        type:String,
        // required:true
    },
    com_email_login:{
        type:String,
        // required:true
    },
    password:{
        type:String,
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
    company_image: {
        name:String,
        image: String
    },
},{timestemps : true})

module.exports = mongoose.model("companie", companySchema)