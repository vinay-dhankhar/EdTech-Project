const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require("otp-generator");
const Profile = require('../models/Profile');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require("dotenv").config();

// send OTP
exports.sendOTP = async (req , res) => {
    try{
        const {email} = req.body;
        const userExists = await User.findOne({email});

        if(userExists){
            return res.status(401).json({
                success:false,
                message:"User Already Exists",
            });
        }

        var otp = otpGenerator.generate(6 , {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        // check if this otp is unique
        var otpRes = await OTP.findOne({otp});

        // keep on generating new otp untill new unique otp is not generated:
        while(otpRes){
            otp = otpGenerator.generate(6 , {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            otpRes = await OTP.findOne({otp});
        }

        const savedOtp = await OTP.create({email , otp});
        console.log("Saved OTP :" ,savedOtp)

        res.status(200).json({
            success:true,
            message:"Otp sent successfully",
        });

    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Interal error in sending otp"
        })
    }
}

// signup 
exports.signup = async(req , res) => {
    try{
        const {
            firstName,
            lastName, 
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
                return res.status(403).json({
                    success:false,
                    message:"All fields are required",
                })
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password and ConfirmPassword Value does not match, please try again',
            });
        }

        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        if(recentOtp.length===0){
            return res.status(400).json({
                success:false,
                message:"Otp not found",
            });
        }
        else if (recentOtp.otp !== otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumer:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,
        });

        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })
    }
}


exports.login = async(req,res) => {
    try{

        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(403). json({
                success:false,
                message:'All fields are required, please try again',
            });
        }
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registrered, please signup first",
            });
        }

        // generate jwt only if passwords are matching
        if(await bcrypt.compare(password , user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType : user.accountType,
            };
            const token = jwt.sign(payload , 'my-secret-key' , {
                expiresIn:"2h",
            });
    
            user.token = token;
            user.password = undefined;
    
            // cookie send 
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true,
            }
            res.cookie("token" , token , options).status(200).json({
                success:true,
                message:"Logged in",
                user,
                token,
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
}

// change password