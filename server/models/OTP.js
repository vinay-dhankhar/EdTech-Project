const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    },
});

// pre save middleware

async function sendVerificationMail(email , otp){
    try{

        const mailResp = await mailSender(email , "Verification Mail" , otp);
        console.log( "Email sent successfully: " ,  mailResp);

    }
    catch(error){
        console.log("Error in pre middleware" , error);        
    }
}

otpSchema.pre("save" , async function(next){
    await sendVerificationMail(this.email , this.otp);
    next();
})


module.exports = mongoose.model("OTP" , otpSchema);