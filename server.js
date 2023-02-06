require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const user = require('./model/userModel')
const reguser = require('./model/registerSchema')
const otpschema = require('./model/OTPschema');
const auth = require('./middleware/auth');
const jobSchema = require('./model/jobSchema');
const jobApplied = require('./model/jobApplied');
const categorySchema = require('./model/categorySchema');
const savedJobSchema = require('./model/savedJobSchema');
const newsSchema = require('./model/newsSchema');
const mediaSchema = require('./model/mediaSchema');
const multer = require('multer');
const planSchema = require('./model/planSchema');
const activePlanSchema = require('./model/activePlanSchema');
const fcmtokenSchema = require('./model/fcmtokenSchema');
const tradecenter = require('./model/tradecenter');
const shortlistSchema = require('./model/shortlistSchema');
const companySchema = require('./model/companySchema');
const moment = require('moment/moment');
const accountSid = "AC1b6abe2fba3f0866f2364e4bc3ecad44"
const authToken = "c95df147ca45873ef36513acd08b0604"
const client = require('twilio')(accountSid, authToken);
const Aws = require('aws-sdk');
const TestSchemaForImage = require('./model/TestSchemaForImage');
const subcategoriesSchema = require('./model/subcategoriesSchema');
const currencySchema = require('./model/currencySchema');
const skillSchema = require('./model/skillSchema');
const admin = require("firebase-admin");
const fs = require('fs');
const { Parser } = require('json2csv');
const Json2csvParser = require("json2csv").Parser;
// const { Parser } = require('@json2csv/plainjs');
const app = express();
var com_id = 10001
var new_job_id = 1
const serviceAccount = require("./boomoverses_firebase.json");
app.use(express.static(__dirname + '/public'));
mongoose.connect('mongodb+srv://admin:admin@cluster0.om6sk5y.mongodb.net/?retryWrites=true&w=majority',()=>{
    app.listen('3000',()=>{
        console.log("Server running on PORT 3000")
    })
})

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  

app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())
const SECRET_KEY = 'panchal'

app.post('/signup', async(req, res)=>{
    const {number, password, email, firstName, lastName, gender, dob, trade, passport, countryCode} = req.body;
    // console.log(req.body)
    try {
        const existingUser = await user.findOne({number : number})
        if(existingUser){
            return res.status(400).json({status: false, message: "User already exist"})
        }

        const userInReg = await reguser.findOne({number: number})
        // console.log("user already created OTP", userInReg)
        // return
        if(userInReg){
            const otp = await otpschema.findOne({number:number})
            res.status(200).json({status: true, otp: otp.otp, number:number, message: "OTP sent Successfully"})
        }else{
            const hashPassword = await bcrypt.hash(password,10)
            const val = Math.floor(1000 + Math.random() * 9000);
            console.log("otp generated" + val)
            await reguser.create({
                "new_user_id" : `BO${com_id}`,
                number: number,
                countrycode: countryCode,
                password : hashPassword,
                email : email,
                firstName : firstName,
                lastName : lastName,
                gender : gender,
                dob: dob,
                trade: trade,
                activeJobs : 0,
                summary: "",
                languages: [],
                marital_status:"",
                passport:passport,
                "passportImageF":{
                    "name": ""
                },
                "passportImageB":{
                    "name": ""
                },
                "resume":{
                    "name": ""
                },
                "profile_pic":{
                    "name": ""
                },
                
            })
            await otpschema.create({
                number: number,
                otp : val,
            })
    
            com_id = com_id + 1;
            console.log(com_id)
            res.status(200).json({status: true, otp: val, number:number, message: "OTP sent Successfully"})
        }

    } catch (error) {
        res.status(400).json({status: false, message: error.message})
    }
})

app.post('/verify-otp', async(req, res)=>{
    const {number, otp} = req.body;
    // console.log(req.body)
    try {
        const dbnumber = await otpschema.findOne({number: number})
        
        if(!dbnumber){
            res.status(404).json({status: false, message: "No user found"})
        }
        // console.log(dbnumber)
        if(dbnumber.otp == otp){
            const tempuser = await reguser.findOne({number:number})  
            const result = await user.insertMany(tempuser)
            // console.log(result)
            await otpschema.findOneAndDelete({number: number})
            const token = jwt.sign({number : result.number, id: result.id}, SECRET_KEY)
            console.log(token)
            res.status(200).json({status: true, token: token, user: result, message: "User Created Successfully"})
        }else{
            res.status(404).json({status:false, message:"Invaild OTP"})
        }
    } catch (error) {
        res.status(400).json({status:false, message:error.message})
    }
})

app.post('/signin', async(req, res)=>{
    const {number, password, fcmToken} = req.body;
    console.log(req.body)
    try {
        const existingUser = await user.findOne({number: number})

        if(!existingUser){
            return res.status(404).json({status:false, message: "No user found"})
        }

        const checkPassword = await bcrypt.compare(password, existingUser.password)
        if(!checkPassword){
            return res.status(400).json({status:false, message: "Invalid Password"})
        }

        const checkFCM = await fcmtokenSchema.findOne({fcm_token: fcmToken})
        console.log(checkFCM)
        if(checkFCM){
            console.log("if")
            const fcm = await fcmtokenSchema.updateOne({number},{
                number,
                fcm_token: fcmToken
            })
        }else{
            console.log("else")
            const fcm = await fcmtokenSchema.create({
                number,
                fcm_token: fcmToken
            })
        }
        
        const token = jwt.sign({number : existingUser.number, id: existingUser.id}, SECRET_KEY)
        res.status(200).json({status:true, user: existingUser, token: token, message: "Login Successfully" })
    } catch (error) {
        res.status(400).json({status: false, message: error.message})
    }
})

app.post('/forgot_password', async(req,res) => {
    const {number} = req.body
    try {
        const checkUser = await user.findOne({ number })
        console.log(checkUser)
        if(checkUser == null) {
            res.status(200).json({ status: false, message: "No User Found" })
        } else {
            const val = Math.floor(1000 + Math.random() * 9000);
            console.log("otp generated" + val)
            await otpschema.create({
                number: number,
                otp : val,
            })
            res.status(200).json({ status: true, otp: val, number:number, message: "OTP sent Successfully"})
        }
    } catch (error) {
        res.status(400).json({status: false, message: error.message})
    }

})

app.post('/create_password', async(req, res) => {
    const {number, password} = req.body
    try {
        const hashPassword = await bcrypt.hash(password,10)
        const updatePass = await user.updateOne({number},{
            $set : {
                password : hashPassword
            }
        })
        res.status(200).json({status:true, message: "Password updated successfully" })
    } catch (error) {
        res.status(400).json({status: false, message: error.message})
    }
})

app.get('/get-profile', auth, async(req, res) => {
    try {
        const profile = await user.findOne({_id : req.userId})
        const tImage = await TestSchemaForImage.find()
        const appliedJobs = await jobApplied.find({"user_id":req.userId});
        let filterJobs = tImage.map((e,i)=>{
            let temp = appliedJobs.find(element=> {
                if(element.job_id == e.title._id){
                     e.title.job_status = 1
                     return e
                }else{
                }
            })
           return e;
          })
        res.status(200).json({status:true, user: profile, banner:filterJobs, message: "User Profile" })
    } catch (error) {
        res.status(400).json({status: false, message: error.message})
    }
})

app.post('/post-job', auth, async(req, res)=>{
    console.log(req.body)
    const date = moment(new Date()).format("YY/MM")
    const nn = `${date}/${new_job_id}`
    // console.log(nn)
    // return
    const {title, exp, salary, job_location, industry, trade, job_description, job_skill, overtime, food, vacancy, education_require,last_date_to_apply,
        gender,
        company_name,
        show_company_name,
        is_min_exp,
        is_foreign_exp,
        duty_hour_day,
        duty_hour_week,
        accomodation,
        transport,
        sal_currancy,
        sal_period,
        min_salary,
        max_salary,
        hide_salary,
        is_active,
        is_feature } = req.body
    try {
        const companydetail = await companySchema.findOne({_id : company_name})
        const response = await jobSchema.create({
            "new_job_id":nn,
            title,
            exp,
            salary,
            job_location,
            industry,
            trade,
            job_status: 0,
            saved:0,
            job_description,
            job_skill,
            education_require,
            food,
            overtime,
            vacancy,
            job_post_date : new Date(),
            last_date_to_apply,
            gender,
            company_name : companydetail,
            show_company_name,
            is_min_exp,
            is_foreign_exp,
            duty_hour_day,
            duty_hour_week,
            accomodation,
            transport,
            sal_currancy,
            sal_period,
            min_salary,
            max_salary,
            hide_salary,
            is_active,
            is_feature
        })
        new_job_id = new_job_id + 1;
        console.log(new_job_id)
                
        const tokenss = await fcmtokenSchema.find()
        const tokenArr = tokenss.map((i) =>{
            return i.fcm_token
        })

        if(response){
            var payload = {
                notification: {
                             title: title,
                             body: job_description
                            },
            };
            const messaging = admin.messaging().sendToDevice(tokenArr, payload).then((response) => {
                console.log('Sent successfully.\n');
                console.log(response);
            })
            .catch((error) => {
                console.log('Sent failed.\n');
                console.log(error);
            });
        }
        res.status(200).json({status: true, data: response, message: 'Job Posted Successfully'})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/jobs', auth, async(req, res)=>{
    try {
        const appliedJobs = await jobApplied.find({"user_id":req.userId});
        const savedJobs = await savedJobSchema.find({"user_id":req.userId});
        const jobs = await jobSchema.find()
        let filterJobs = jobs.map((e,i)=>{
            let temp = appliedJobs.find(element=> {
                if(element.job_id == e._id){
                     e.job_status = 1
                     return e
                }else{
                }
            })
           return e;
          })

          let filterJobsForSave = jobs.map((e,i)=>{
            let temp = savedJobs.find(element=> {
                if(element.job_id == e._id){
                     e.saved = 1
                     return e
                }else{

                }
            })
           return e;
          })
        res.status(200).json({status: true, data:filterJobs.reverse(), message: 'Job List'})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/search/:title?/:loc?/:ind?/:exp?/:minsal?', auth, async(req, res)=> {
    const {title, loc, ind, exp, minsal} = req.params;
    console.log(req.params)
    try {
        const jobs = await jobSchema.find({
            "$or": [
                {
                    "title": {$regex : title}
                },
                {
                    "job_location": {$regex : loc}
                },
                {
                    "industry": {$regex : ind}
                },
                {
                    "exp": {$regex : exp}
                },
                {
                    "salary": {$regex : minsal}
                }
            ],
        })
        res.status(200).json({status: true, data:jobs, message: 'Job List'})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.post('/job_apply', auth, async(req, res) => {
    const { user_id, job_id }= req.body
    try {

        const checkPlan = await user.updateOne({"_id" : user_id},{
            $inc: { activeJobs: -1 }
        });
 
        await jobApplied.create({
            job_id : job_id,
            user_id : user_id
        })

        const jobData = await jobSchema.find({})
        res.status(200).json({status: true, data: jobData, message: "Job Applied Successfully"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/my_jobs', auth , async(req, res) => {
    try {
        const fetchJobs = await jobApplied.find({"user_id":req.userId});
        let jobList= [];
        for (var i = 0; i < fetchJobs.length; i++) {
            const singleJob = await jobSchema.findOne({"_id": fetchJobs[i].job_id})
            jobList.push(singleJob)
        }
        res.status(200).json({status: true, data: jobList, message: "Job Applied List"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/get_category',  async(req, res)=> {
    try {
        const categories = await categorySchema.find()
        res.status(200).json({status: true, data: categories, message: "Category List"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})


app.post('/job_categorywise', auth, async(req, res)=> {
    const { title }= req.body
    try {
        const categories = await jobSchema.find({industry: title})
        const jobinApplied = await jobApplied.find({user_id : req.userId})
        let filterJobs = categories.map((e,i)=>{
            let temp = jobinApplied.find(element=> {
                if(element.job_id == e._id){
                     e.job_status = 1
                     return e
                }else{
                }
            })
           return e;
          })
        res.status(200).json({status: true, data: filterJobs, message: "Category List"});
    } catch (error) {
        res.status(401).json({status: false, message:error.message});
    }
})

app.post('/save-job', auth, async(req, res) => {
    const { user_id, job_id }= req.body
    try {

        // const fetchJobs = await jobSchema.updateOne({"_id" : job_id})
        // console.log(fetchJobs._id)
        // console.log(fetchJobs)
        await savedJobSchema.create({
            job_id : job_id,
            user_id : user_id
        })
        res.status(200).json({status: true, message: "Job Saved Successfully"})
        // res.send({"hello": "hello"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.post('/unsave-job', auth, async(req, res) => {
    const { user_id, job_id }= req.body
    try {

        const fetchJobs = await jobSchema.updateOne({"_id" : job_id},{saved: "0"})
        // console.log(fetchJobs._id)
        console.log(fetchJobs)
        await savedJobSchema.deleteOne({
            job_id : job_id
        })
        const allsavedJob = await savedJobSchema.find({"user_id":req.userId});
        console.log(allsavedJob)
        res.status(200).json({status: true, data: allsavedJob, message: "Job Removed Successfully"})
        // res.send({"hello": "hello"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/my_saved_jobs', auth , async(req, res) => {
    try {
        const fetchJobs = await savedJobSchema.find({"user_id":req.userId});
        let jobList= [];
        for (var i = 0; i < fetchJobs.length; i++) {
            const singleJob = await jobSchema.findOne({"_id": fetchJobs[i].job_id})
            jobList.push(singleJob)
        }
        res.status(200).json({status: true, data: jobList, message: "Saved Job List"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/get-news', auth, async(req,res) => {
    try {
        const news = await newsSchema.find()
        res.status(200).json({status: true, data: news, message: "News List Found"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message}) 
    }
})

app.get('/get-media', auth, async(req,res) => {
    try {
        const media = await mediaSchema.find()
        res.status(200).json({status: true, data: media, message: "Media List Found"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message}) 
    }
})

app.post('/add-media', auth, async(req, res)=> {
    const {title, subtitle, link} = req.body;
    console.log(title)
    console.log(subtitle)
    console.log(link)
    console.log(new Date())
    try {
        const newMedia = await mediaSchema.create({
            title : title,
            subtitle: subtitle,
            link : link,
            date : new Date()
        })
        res.status(200).json({status: true, data: newMedia, message: "New Media Added"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message}) 
    }
})

app.post('/update-profile', auth, async (req, res) => {
    const { firstName, lastName, fatherName, dob, exp, foreignExp, qualification, techQualification, address, city, state, passport, summary,languages, marital_status } = req.body;
    console.log(req.body)
    // return
    try {
        // const updated = await user.findOne({ _id: req.userId })
        const updated = await user.updateOne({ _id: req.userId },
                { $set: {
                firstName: firstName, 
                lastName: lastName, 
                fatherName: fatherName,
                dob: dob,
                exp: exp,
                foreignExp: foreignExp,
                qualification: qualification,
                techQualification: techQualification,
                address: address,
                city: city,
                state: state,
                passport,
                summary,
                languages: languages,
                marital_status
             }},
             {new: true})
        res.status(200).json({ status: true, data: updated, message: "Profile Updated" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

const storage = multer.diskStorage({
    destination (req, file, cb) {
        cb(null, 'public');
    },
    filename (req, file, cb) {
        cb(null, new Date().getTime() +"-"+ file.originalname);
    }
})
const upload = multer({storage});

app.post('/upload-documents', auth, 
upload.fields([{
    name: 'passportImageF', maxCount: 1
}, {
    name: 'passportImageB', maxCount: 1
}, {
    name: 'resume', maxCount: 1
}
])
, async (req, res) => {
    // const formData = req.files;
    console.log(req.files)
    try {
        if (req.files['passportImageF']){
            console.log("want to update passportImageF")
            const updated = await user.updateOne({ _id: req.userId },
                {
                        $set: {
                            "passportImageF.name": req.userId+"-"+req.files.passportImageF[0]?.originalname,
                        }
                })
        }
        if (req.files['passportImageB']){
            console.log("want to update passportImageB")
            const updated = await user.updateOne({ _id: req.userId },
                {
                        $set: {
                            "passportImageB.name": req.userId+"-"+req.files.passportImageB[0]?.originalname,
                        }
                })
        }
        if (req.files['resume']){
            console.log("want to update resume")
            const updated = await user.updateOne({ _id: req.userId },
                {
                        $set: {
                            "resume.name": req.userId+"-"+req.files.resume[0]?.originalname,
                        }
                })
        }
        // const updated = await user.updateOne({ _id: req.userId },
        //     {
        //         $set: {
        //             "passportImageF.name": req.userId+"-"+req.files.passportImageF[0]?.originalname,
        //             "passportImageB.name": req.userId+"-"+req.files.passportImageB[0]?.originalname,
        //             "resume.name": req.userId+"-"+req.files.resume[0]?.originalname,
        //             // "passportImageF.image" : req.files.passportImageF[0],
        //             // "passportImageF.image.contentType" : req.files.passportImageF[0].mimetype,
        //             // "passportImageB.image.data": req.files.passportImageF[1].originalname,
        //             // "passportImageB.image.contentType": req.files.passportImageF[1].mimetype,
        //         }
        //     })
        //     console.log("resss",updated)
        res.status(200).json({ status: true, message: "Image Uploaded" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

const profilePic = multer.diskStorage({
    destination (req, file, cb) {
        cb(null, 'public');
    },
    filename (req, file, cb) {
        cb(null, req.userId+"-"+ file.originalname);
    }
})
const dp = multer({profilePic});

app.post('/upload-profile-pic', auth, upload.single("profile_pic"), async (req, res) => {
    // const formData = req.files;
    console.log(req.file)
    // console.log(req.body)
    // return
    try {
        const updated = await user.updateOne({ _id: req.userId },
            {
                $set: {
                    "profile_pic.name": req.file.filename,
                }
            })
        //     console.log("resss",updated)
        res.status(200).json({ status: true, data: updated, message: "Profile Pic Uploaded" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.get('/get-all-plans', auth, async(req, res)=>{
    try {
        const plans = await planSchema.find()
        res.status(200).json({ status: true, data: plans, message: "Plan List Found" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.post('/credit-plan', auth, async(req, res) => {
    const {user_id, plan_id} = req.body;
    console.log(req.body)
    try {
        const jobEntry = await activePlanSchema.create({
            user_id,
            plan_id
        })

        const creditJobs = await user.updateOne({_id: user_id },{
            $set:{
                activeJobs : plan_id.jobs
            }
        })
        res.status(200).json({ status: true, message: "Plan Credited" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.get('/tradecenterlist', auth, async(req, res) => {
    try {
        const centerList = await tradecenter.find()

        res.status(200).json({ status: true, data : centerList, message: "Trade Center List" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.post('/add_trade_center', auth, async(req, res) => {
    const {name, area, location, contact_number, lat_lng} = req.body;
    try {
        // console.log(area)
        // return
        const checkforArea = await tradecenter.find({area})
        let centerList;
        if(checkforArea.length > 0) {
            console.log("data already avaliable")
            centerList = await tradecenter.updateOne({area}, {$push:{'data':{name, location, contact_number, lat_lng}}})
        }else{
            console.log("data not avaliable")
            centerList = await tradecenter.create({
                area,
                data: [{name, location, contact_number, lat_lng}]

            })
        }
        res.status(200).json({ status: true, data: centerList,  message: "Trade Added Successfully" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.get('/get-applicants', auth, async(req, res) => {
    query = req.query;
    console.log(query)
    try {
        const applicants = await jobApplied.aggregate( [
            {
               $match: { job_id: query.job_id }
            },
            {
                $lookup : {from : 'shortlists', localField : 'user_id', foreignField: 'user_id', as : 'user'}
            }
         ] )
         const f = await user.find()
         let list = [];
         let filterJobs = f.map((e,i)=>{
            let temp = applicants.find(element=> {
                if(element.user_id == e._id){
                    list.push(e)
                     return e
                }else{
                }
            })
           return e;
          })

        const fields = ['firstName', 'number', 'email' ];
        const opts = { fields, header: true };

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(list);
            fs.writeFile("latest.csv", csv, function(error) {
                if (error) throw error;
                console.log("Write to bezkoder_mongodb_fs.csv successfully!");
            });
        } catch (err) {
            console.error(err);
        }

        res.status(200).json({ status: true, data : list, message: "Applicants List" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.get('/shortlist', auth, async(req, res) => {
    try {
        const listdata = await shortlistSchema.find()
        const users = await user.find()
        let list = [];
        let filterJobs = users.map((e,i)=>{
           let temp = listdata.find(element=> {
               if(element.user_id == e._id){
                   list.push(e)
                    return e
               }else{
               }
           })
          return e;
         })
        res.status(200).json({ status: true, data: list,  message: "Shortlist Data" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.post('/add_to_shortlist', auth, async(req, res) => {
    const { user_id, job_id }= req.body
    try {
        const addshortlist = await shortlistSchema.create({
            user_id,
            job_id
        })
        res.status(200).json({ status: true, message: "Shorlisted Done" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

const companyImage = multer.diskStorage({
    destination (req, file, cb) {
        cb(null, 'public');
    },
    filename (req, file, cb) {
        cb(null, Date().now()+"-"+ file.originalname);
    }
})
const ci = multer({companyImage});

app.post('/create_company',auth, upload.single("company_image"), async(req, res) => {
    const { company_name, estd_year , industry, owner_type, no_of_emp, no_of_office, about_company, add_type, street_add, state, city, pincode, website, company_phone, company_fax, rep_fname, rep_mname, rep_lname, rep_email, rep_number, com_email_login, password, is_active, is_feature,}= req.body
    // console.log(req.body)
    // console.log(req.file)
    // return
    try {
        const addshortlist = await companySchema.create({
            company_name, 
            estd_year , 
            industry, 
            owner_type, 
            no_of_emp, 
            no_of_office, 
            about_company, 
            add_type, 
            street_add, 
            state, 
            city, 
            pincode, 
            website, 
            company_phone, 
            company_fax, 
            rep_fname, 
            rep_mname, 
            rep_lname, 
            rep_email, 
            rep_number, 
            com_email_login, 
            password,
            is_active, 
            is_feature,
            "company_image.name": req.file.filename,
        })
        res.status(200).json({ status: true, message: "Company Created Succussfully" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.get('/get_company', auth, async (req, res) => {
    try {
        const copmanies = await companySchema.find()
        res.status(200).json({ status: true, data:copmanies, message: "Company List" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})


const category = multer.diskStorage({
    destination (req, file, cb) {
        cb(null, 'public');
    },
    filename (req, file, cb) {
        cb(null, req.userId+"-"+ file.originalname);
    }
})
const ct = multer({category});

app.post('/add_category', auth, upload.single("icon"), async(req, res)=> {
    console.log(req.file)
    console.log(req.body)
    const {title} = req.body
    // return
    try {
        const categories = await categorySchema.create({
            "icon.name" : req.file.filename,
            title
        })
        res.status(200).json({status: true,  message: "Category Added Succussfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})


const testImage = multer.memoryStorage({
    destination (req, file, cb) {
        cb(null, 'public');
    },
    filefilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
})
const test_image = multer({testImage});

const s3 = new Aws.S3({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_ACCESS_KEY_SECRET
})

app.post('/add_banner', auth, test_image.single("icon"), async(req, res) => {
    const params = {
        Bucket:process.env.AWS_BUCKET_NAME,      // bucket that we made earlier
        Key:Date.now()+"-"+req.file.originalname,// Name of the image
        Body:req.file.buffer,                    // Body which will contain the image in buffer format
        ACL:"public-read-write",                 // defining the permissions to get the public link
        ContentType:req.file.mimetype            // Necessary to define the image content-type to view the photo in the browser with the link
    };

    const job = await jobSchema.findOne({_id :req.body.title})
    s3.upload(params,(error,data)=>{
        if(error){
            res.status(500).send({"err":error})  
        }
  
        
    console.log(data) 
    
   // saving the information in the database.
    const test = new TestSchemaForImage({
            title: job,
            icon: data.Location
        });
        test.save()
            .then(result => {
                res.status(200).json({status: true,  message: "Banner Added Succussfully"})
            })
            .catch(err => {
                res.send({ message: err })
          })
    })
})

app.get('/get_banner', async(req, res) => {
    try {
        const tImage = await TestSchemaForImage.find()
        res.status(200).json({status: true, data: tImage, message: "Banner List"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/delete_banner', async(req, res) => {
    const {banner_id} = req.body;
    try {
        const banner = await TestSchemaForImage.deleteOne({_id: banner_id})
        res.status(200).json({status: true, message: "Banner Deleted Succussfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/get_trade', async(req, res) => {
    const {trade} = req.body
    try {
        const list = await subcategoriesSchema.findOne({trade})
        console.log(list)
        res.status(200).json({status: true, data: list, message: "Industry List"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/add_trade', async(req, res) => {
    const {trade, data} = req.body
    console.log(req.body)
    try {
        const ifAva = await subcategoriesSchema.findOne({trade})
        if(ifAva){
            const list = await subcategoriesSchema.updateOne({trade},{ $push: { data: data}})
        }else{
            const list = await subcategoriesSchema.create({trade, data:[data]})
        }
        // console.log(list)
        res.status(200).json({status: true, message: "Industry Added Successfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.get('/get_currency', async(req,res) => {
    try {
        const list = await currencySchema.find()
        res.status(200).json({status: true, data: list,  message: "Currency List"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/add_currency', async(req,res) => {
    const {currency} = req.body
    try {
        const list = await currencySchema.create({currency})
        res.status(200).json({status: true, message: "Currency Added Successfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/delete_currency', async(req,res) => {
    const {currency} = req.body
    try {
        const list = await currencySchema.deleteOne({_id: currency})
        res.status(200).json({status: true, message: "Currency Deleted Successfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/add_skill', async(req,res) => {
    const {skill} = req.body
    try {
        const list = await skillSchema.create({skill})
        res.status(200).json({status: true, message: "Skill Added Successfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.get('/get_skill', async(req,res) => {
    try {
        const list = await skillSchema.find()
        res.status(200).json({status: true, data: list,  message: "Skills List"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/delete_skill', async(req,res) => {
    const {skill_id} = req.body
    try {
        const list = await skillSchema.deleteOne({_id:skill_id})
        res.status(200).json({status: true, message: "Skill Deleted Successfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.get('/download_data', async(req, res) => {
    try {
        await user.find({}).lean().exec((err, data) => {
            if (err) throw err;
            const csvFields = ['number', 'firstName']
            console.log(csvFields);
            const json2csvParser = new Json2csvParser({
                csvFields
            });
            const csvData = json2csvParser.parse(data);
            // console.log(csvData)
            // return
            fs.writeFile("bezkoder_mongodb_fs.csv", csvData, function(error) {
                if (error) throw error;
                console.log("Write to bezkoder_mongodb_fs.csv successfully!");
            });
            // res.send('File downloaded Successfully')
        });
        res.status(200).json({status: true, message: "Data Downloaded Successfully"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    } 
})