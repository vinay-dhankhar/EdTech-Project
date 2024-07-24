const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mailSender = require('../utils/mailSender');

exports.resetPwdToken = async(req,res) => {
    try{
        // fetch data
        const email = req.body.email;
        // check if user exists
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not registered.",
            });
        }

        // generate token:
        const token = crypto.randomUUID();

        const updatedUser = await User.findOneAndUpdate({email:email} ,{
            token:token,
            resetPwdExpires: Date.now()+ 5*60*1000,                                 
        } , {new:true});

        const url = `http:localhost:3000/resetPassword/${token}`;

        await mailSender(email , "Reset Password Link" , `Click here to reset your password ${url}`);

        res.status(200).json({
            success:true,
            message:"Reset mail sent successfully",
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        });
    }
}

exports.resetPassword = async (req , res) => {
    try{
        // now the token can be extracted from either the params or by inserting inside the body and extracting : 
        const {newPassword , confirmPassword , token} = req.body;

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Passwords do not match",
            });
        }

        const user = User.findOne({token:token});

        if(!user){
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }

        if(user.resetPwdExpires < Date.now() ){
            return res.json({
                success:false,
                message:'Token is expired, please regenerate your token',
            });
        }

        const hashedPwd = await bcrypt.hash(newPassword , 10);

        const updatedUser = await User.findOneAndUpdate({token:token} , {
            password:hashedPwd,
        },{new:true});

        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
    }

}

