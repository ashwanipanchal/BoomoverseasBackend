const express = require('express');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
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
// const upload = multer();
const app = express();

app.use(express.static(__dirname + '/public'));
mongoose.connect('mongodb+srv://admin:admin@cluster0.om6sk5y.mongodb.net/?retryWrites=true&w=majority',()=>{
    app.listen('3000',()=>{
        console.log("Server running on PORT 3000")
    })
})

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const SECRET_KEY = 'panchal'

app.post('/signup', async(req, res)=>{
    const {number, password, email, firstName, lastName, sex, dob, trade, passport} = req.body;
    // console.log(req.body)
    try {
        const existingUser = await user.findOne({number : number})
        if(existingUser){
            return res.status(400).json({status: false, message: "User already exist"})
        }

        const hashPassword = await bcrypt.hash(password,10)
        const val = Math.floor(1000 + Math.random() * 9000);
        console.log("otp generated" + val)
        await reguser.create({
            number: number,
            password : hashPassword,
            email : email,
            firstName : firstName,
            lastName : lastName,
            sex : sex,
            dob: dob,
            trade: trade,
            activeJobs : 0,
            summary: "",
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

        // const token = jwt.sign({number : result.number, id: result.id}, SECRET_KEY)
        // res.status(201).json({status: true, user: result, token: token, message: "User Created Successfully"})

        await otpschema.create({
            number: number,
            otp : val,
        })
        res.status(201).json({status: true, otp: val, number:number, message: "OTP sent Successfully"})

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
    const {number, password} = req.body;
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

        const token = jwt.sign({number : existingUser.number, id: existingUser.id}, SECRET_KEY)
        res.status(201).json({status:true, user: existingUser, token: token, message: "Login Successfully" })
    } catch (error) {
        res.status(400).json({status: false, message: error.message})
    }
})

app.post('/get-profile', async(req, res) => {
    try {
        const profile = await user.findOne({number : req.body.number})
        res.status(201).json({status:true, user: profile, message: "User Profile" })
    } catch (error) {
        res.status(400).json({status: false, message: error.message})
    }
})

app.post('/post-job', auth, async(req, res)=>{
    console.log(req.body)
    const {title, exp, salary, job_location, industry, job_description, job_skill, overtime, food, vacancy } = req.body
    try {
        const response = await jobSchema.create({
            title,
            exp,
            salary,
            job_location,
            industry,
            job_status: 0,
            saved:0,
            job_description,
            job_skill,
            food,
            vacancy
        })
        res.status(200).json({status: true, data: response, message: 'Job Posted Successfully'})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/jobs', auth, async(req, res)=>{
    try {
        const fetchJobs = await jobApplied.find({"user_id":req.userId});
        const jobs = await jobSchema.find()
        let filterJobs = jobs.map((e,i)=>{
            let temp = fetchJobs.find(element=> {
                if(element.job_id == e._id){
                     e.job_status = 1
                     return e
                }else{

                }
            })
           return e;

          })


        // function checking() {
        //     if (fetchJobs.length == 0) {
        //         for (var i = 0; i < jobs.length; i++) {
        //         newArray.push(jobs[i])
        //         }
        //     } else {
        //         for (var i = 0; i < jobs.length; i++) {
        //             for (var j = 0; j < fetchJobs.length; j++) {
        //                 if (jobs[i]._id == fetchJobs[j].job_id) {
        //                     jobs[i].job_status = 1
        //                     newArray.push(jobs[i])
        //                 } else {
        //                     newArray.push(jobs[i])
        //                 }
        //             }
        //         }
        //     }
            
        // }
        // checking()


        // console.log("checkkng new array")
        // console.log(newArray)
        // let appliedList= [];
        // for (var i = 0; i < fetchJobs.length; i++) {
        //     const singleJob = await jobSchema.updateOne({ _id: fetchJobs[i].job_id }, { $set: { job_status: "1" } });
        //     appliedList.push(singleJob)
        // }
        // const jobs = await jobSchema.find()
        // res.status(200).json({status: true, data:fetchJobs, message: 'Job List'})
        res.status(200).json({status: true, data:filterJobs, message: 'Job List'})
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
        res.status(201).json({status: true, data: jobData, message: "Job Applied Successfully"})
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
        res.status(201).json({status: true, data: jobList, message: "Job Applied List"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/get_category',  async(req, res)=> {
    try {
        const categories = await categorySchema.find()
        res.status(201).json({status: true, data: categories, message: "Category List"})
    } catch (error) {
        res.status(401).json({status: false, message:error.message})
    }
})

app.post('/job_categorywise', auth, async(req, res)=> {
    const { title }= req.body
    try {
        const categories = await jobSchema.find({industry: title})
        res.status(201).json({status: true, data: categories, message: "Category List"});
    } catch (error) {
        res.status(401).json({status: false, message:error.message});
    }
})

app.post('/save-job', auth, async(req, res) => {
    const { user_id, job_id }= req.body
    try {

        const fetchJobs = await jobSchema.updateOne({"_id" : job_id},{saved: "1"})
        // console.log(fetchJobs._id)
        // console.log(fetchJobs)
        await savedJobSchema.create({
            job_id : job_id,
            user_id : user_id
        })
        res.status(201).json({status: true, message: "Job Saved Successfully"})
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
        res.status(201).json({status: true, data: allsavedJob, message: "Job Removed Successfully"})
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
        res.status(201).json({status: true, data: jobList, message: "Saved Job List"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message})
    }
})

app.get('/get-news', auth, async(req,res) => {
    try {
        const news = await newsSchema.find()
        res.status(201).json({status: true, data: news, message: "News List Found"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message}) 
    }
})

app.get('/get-media', auth, async(req,res) => {
    try {
        const media = await mediaSchema.find()
        res.status(201).json({status: true, data: media, message: "Media List Found"})
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
        res.status(201).json({status: true, data: newMedia, message: "New Media Added"})
    } catch (error) {
        res.status(401).json({status: false, message: error.message}) 
    }
})

app.post('/update-profile', auth, async (req, res) => {
    const { firstName, lastName, fatherName, dob, exp, foreignExp, qualification, techQualification, address, city, state, passport, summary } = req.body;
    // console.log(techQualification)
    try {
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
                addess: address,
                city: city,
                state: state,
                passport,
                summary
             }},
            { new: true })
        // console.log(updated)
        res.status(201).json({ status: true, data: updated, message: "New Media Added" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

const storage = multer.diskStorage({
    destination (req, file, cb) {
        cb(null, 'public');
    },
    filename (req, file, cb) {
        cb(null, req.userId+"-"+ file.originalname);
    }
})
const upload = multer({storage});

app.post('/upload-documents', auth, upload.fields([{
    name: 'passportImageF', maxCount: 1
}, {
    name: 'passportImageB', maxCount: 1
}, {
    name: 'resume', maxCount: 1
}
]), async (req, res) => {
    // const formData = req.files;
    console.log(req.files)
    try {
        const updated = await user.updateOne({ _id: req.userId },
            {
                $set: {
                    "passportImageF.name": req.userId+"-"+req.files.passportImageF[0].originalname,
                    "passportImageB.name": req.userId+"-"+req.files.passportImageB[0].originalname,
                    "resume.name": req.userId+"-"+req.files.resume[0].originalname,
                    // "passportImageF.image" : req.files.passportImageF[0],
                    // "passportImageF.image.contentType" : req.files.passportImageF[0].mimetype,
                    // "passportImageB.image.data": req.files.passportImageF[1].originalname,
                    // "passportImageB.image.contentType": req.files.passportImageF[1].mimetype,
                }
            })
            console.log("resss",updated)
        res.status(201).json({ status: true, data: updated, message: "Image Uploaded" })
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
    try {
        const updated = await user.updateOne({ _id: req.userId },
            {
                $set: {
                    "profile_pic.name": req.file.filename,
                }
            })
        //     console.log("resss",updated)
        res.status(201).json({ status: true, data: updated, message: "Profile Pic Uploaded" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.get('/get-all-plans', auth, async(req, res)=>{
    try {
        const plans = await planSchema.find()
        res.status(201).json({ status: true, data: plans, message: "Plan List Found" })
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
        res.status(201).json({ status: true, message: "Plan Credited" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})

app.post('/add_summary', auth, async(req, res) => {
    const {summary} = req.body
    console.log(summary)
    try {
        const getUser = await user.updateOne({ _id: req.userId})

        res.status(201).json({ status: true, message: "Summary Updated" })
    } catch (error) {
        res.status(401).json({ status: false, message: error.message })
    }
})