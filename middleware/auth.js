const jwt = require('jsonwebtoken')
const SECRET_KEY = 'panchal'

const auth = async(req, res, next) =>{
    // console.log(req.headers)
    try {
        const token = req.headers.authorization;
        if(token){
            // console.log(token)
            newtoken = token.split(" ")[1]
            let user = jwt.verify(newtoken,SECRET_KEY)
            // console.log(user)
            req.userId = user.id
        }else{
            res.status(401).json({status: false, message: "Unauthorized User"})
        }

        next();
        
    } catch (error) {
        res.status(401).json({status: false, message: "Unauthorized User"})
    }
}
module.exports = auth;