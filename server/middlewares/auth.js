const jwt = require("jsonwebtoken");
const User = require('../models/User');
require("dotenv").config();

exports.auth = async(req , res , next) => {
    try{
        const token = req.cookies.token  // good
                    || req.body.token   // bad
                    || req.header("Authorisation").replace("Bearer " , ""); // best 

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token not found",
            });
        }

        try{
            const decode = await jwt.verify(token , 'my-secret-key');
            // insert it in the req
            req.user = decode;
        }
        catch(error){
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
};

exports.isStudent = async(req , res , next) => {
    try{
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}

exports.isInstructor = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Instructor") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Instructor only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }

   exports.isAdmin = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Admin") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Admin only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }